# API contract: frontend and backend

The frontend talks to the backend only through `frontend/src/api/`.
Components never import Supabase directly. If the backend changes, update this
file first, then the matching function in `src/api/`.

## Available now

| Frontend function | Backend | Notes |
|---|---|---|
| `getApprovedReports()` | `reports` table, `select` | Returns only `status = 'approved'` (enforced by Row Level Security). Columns: `id, lat, lng, category, who, context, time_of_day, incident_date` |
| `createReport(report)` | `reports` table, `insert` | Temporary direct insert. Replaced by an Edge Function in step 5 |
| `getStats({ from, to })` | SQL function `get_stats(p_from, p_to)` via `rpc` | Aggregate counts of approved reports only. Step 6 |

### `createReport` input

| Field | Required | Allowed values |
|---|---|---|
| `lat`, `lng` | yes | Numbers. The backend shifts them by 100-300 m before saving |
| `category` | yes | `harassment, stalking, threat, physical, emotional, drink_spiking, sexual_violence, unsafe, other` |
| `who` | no | `known, unknown` |
| `context` | no | `home, public_space, transport, workplace, school_university, leisure_nightlife, relationship, online, medical, other` |
| `motivation` | no | `misogyny, queerphobia, transphobia, racism, ableism, ageism, abuse_of_power, personal_conflict, none, other` |
| `time_of_day` | no | `morning, afternoon, evening, night` |
| `incident_date` | no | `YYYY-MM-DD`, not later than tomorrow |
| `description` | no | Up to 1000 characters |
| `lang` | no | `en, ru, kk` |

The source of truth for allowed values is
`supabase/migrations/20260101000000_init_reports.sql`.

### `getStats` input

| Field | Required | Notes |
|---|---|---|
| `from` | no | `YYYY-MM-DD`, inclusive. `null` means all time |
| `to` | no | `YYYY-MM-DD`, inclusive. `null` means up to today |

### `getStats` output

```json
{
  "total": 12,
  "first_date": "2026-10-23",
  "last_date": "2026-11-20",
  "recent": { "last_7_days": 3, "last_30_days": 12 },
  "by_category": [{ "code": "harassment", "count": 4 }],
  "by_context": [],
  "by_time_of_day": [],
  "by_who": []
}
```

- `recent` always covers all approved reports and ignores `from` / `to`. It is
  used for the numbers on the home page.
- Only counts are returned. No descriptions, coordinates or individual reports.
- If the step 6 migration is not applied yet, `getStats` falls back to counting
  approved reports in the browser and sets `source: "client"`. With the migration
  applied, `source` is `"rpc"`.

### What the backend enforces (the frontend cannot change it)

- `status` is always set to `pending`
- Coordinates are randomly shifted and the original is never stored
- Only the day of creation is stored, not the exact time
- Public users cannot read pending or rejected reports, or update or delete anything

## Planned

| Step | Frontend function | Backend |
|---|---|---|
| 5 | `createReport(report, captchaToken)` | Edge Function `submit-report`: checks the captcha, validates, saves. Direct insert is closed |
| 8 | Moderator functions | Supabase Auth login, approve and reject reports |
