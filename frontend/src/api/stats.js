import { supabase } from './supabaseClient'
import { getApprovedReports } from './reports'

// Shape returned by getStats(). Keep it in sync with the get_stats SQL function
// and with supabase/docs/api-contract.md.
const EMPTY = {
  total: 0,
  first_date: null,
  last_date: null,
  recent: { last_7_days: 0, last_30_days: 0 },
  by_category: [],
  by_context: [],
  by_time_of_day: [],
  by_who: [],
}

function isMissingFunction(error) {
  const message = error?.message || ''
  return (
    error?.code === 'PGRST202' ||
    /could not find the function/i.test(message) ||
    /function .* does not exist/i.test(message)
  )
}

function normalize(data, source) {
  if (!data) return { ...EMPTY, source }
  return {
    ...EMPTY,
    total: data.total ?? 0,
    first_date: data.first_date ?? null,
    last_date: data.last_date ?? null,
    recent: { ...EMPTY.recent, ...(data.recent || {}) },
    by_category: data.by_category ?? [],
    by_context: data.by_context ?? [],
    by_time_of_day: data.by_time_of_day ?? [],
    by_who: data.by_who ?? [],
    source,
  }
}

function countBy(rows, field) {
  const counts = new Map()
  for (const row of rows) {
    const code = row[field]
    if (!code) continue
    counts.set(code, (counts.get(code) || 0) + 1)
  }
  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
}

function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().slice(0, 10)
}

// Used only until the step 6 migration is applied to the database.
function aggregate(rows, { from, to }) {
  const inRange = rows.filter(
    (r) => (!from || r.incident_date >= from) && (!to || r.incident_date <= to)
  )
  const dates = inRange.map((r) => r.incident_date).filter(Boolean).sort()

  return normalize(
    {
      total: inRange.length,
      first_date: dates[0] ?? null,
      last_date: dates.at(-1) ?? null,
      recent: {
        last_7_days: rows.filter((r) => r.incident_date >= daysAgo(7)).length,
        last_30_days: rows.filter((r) => r.incident_date >= daysAgo(30)).length,
      },
      by_category: countBy(inRange, 'category'),
      by_context: countBy(inRange, 'context'),
      by_time_of_day: countBy(inRange, 'time_of_day'),
      by_who: countBy(inRange, 'who'),
    },
    'client'
  )
}

// Once the RPC is known to be missing, skip it for the rest of the session so
// the console does not fill with 404s while the migration is not applied.
let rpcAvailable = null

/**
 * Aggregate counts of approved reports.
 * @param {{ from?: string|null, to?: string|null }} range YYYY-MM-DD, inclusive
 * @returns {Promise<object>} totals and breakdowns, plus `source` = 'rpc' | 'client'
 */
export async function getStats({ from = null, to = null } = {}) {
  if (rpcAvailable !== false) {
    const { data, error } = await supabase.rpc('get_stats', { p_from: from, p_to: to })
    if (!error) {
      rpcAvailable = true
      return normalize(data, 'rpc')
    }
    if (!isMissingFunction(error)) throw new Error(error.message)
    rpcAvailable = false
  }

  // The migration is not applied yet. Reuse the approved rows the public map
  // already loads, so the page keeps working while the database is updated.
  const rows = await getApprovedReports()
  return aggregate(rows, { from, to })
}
