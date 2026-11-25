-- Step 6: public statistics for approved reports.
--
-- Only aggregate counts leave the database. No report row, description or
-- exact position is exposed. The function is SECURITY INVOKER on purpose, so
-- Row Level Security stays in force for every caller.
--
-- Run this in the Supabase SQL Editor after the initial reports migration.

create or replace function public.get_stats(p_from date default null, p_to date default null)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  with filtered as (
    select category, context, time_of_day, who, incident_date
    from public.reports
    where status = 'approved'
      and (p_from is null or incident_date >= p_from)
      and (p_to   is null or incident_date <= p_to)
  ),
  totals as (
    select
      count(*)::int as total,
      min(incident_date) as first_date,
      max(incident_date) as last_date
    from filtered
  ),
  recent as (
    -- Deliberately ignores p_from / p_to: the home page needs "last 30 days"
    -- over all approved reports, whatever range the statistics page shows.
    select
      (count(*) filter (where incident_date >= current_date - 7))::int  as last_7_days,
      (count(*) filter (where incident_date >= current_date - 30))::int as last_30_days
    from public.reports
    where status = 'approved'
  ),
  breakdown as (
    select 'category' as dimension, category as code, count(*)::int as n
    from filtered where category is not null group by category
    union all
    select 'context', context, count(*)::int
    from filtered where context is not null group by context
    union all
    select 'time_of_day', time_of_day, count(*)::int
    from filtered where time_of_day is not null group by time_of_day
    union all
    select 'who', who, count(*)::int
    from filtered where who is not null group by who
  ),
  grouped as (
    select
      dimension,
      jsonb_agg(jsonb_build_object('code', code, 'count', n) order by n desc, code) as items
    from breakdown
    group by dimension
  )
  select jsonb_build_object(
    'total',      (select total from totals),
    'first_date', (select first_date from totals),
    'last_date',  (select last_date from totals),
    'recent',     (select jsonb_build_object(
                     'last_7_days', last_7_days,
                     'last_30_days', last_30_days
                   ) from recent),
    'by_category',    coalesce((select items from grouped where dimension = 'category'),    '[]'::jsonb),
    'by_context',     coalesce((select items from grouped where dimension = 'context'),     '[]'::jsonb),
    'by_time_of_day', coalesce((select items from grouped where dimension = 'time_of_day'), '[]'::jsonb),
    'by_who',         coalesce((select items from grouped where dimension = 'who'),         '[]'::jsonb)
  );
$$;

comment on function public.get_stats(date, date) is
  'Aggregate counts of approved reports: totals and breakdowns by category, context, time of day and who. Only counts, never report rows.';

revoke all on function public.get_stats(date, date) from public;
grant execute on function public.get_stats(date, date) to anon, authenticated;

-- Make the new function visible to PostgREST without waiting for a restart.
notify pgrst, 'reload schema';
