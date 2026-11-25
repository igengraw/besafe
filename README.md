# BeSafe

An anonymous web platform where people can report harassment on an interactive map of Almaty. No registration, no personal data, and locations are shifted before saving to protect the person reporting.

Course project: General Project, 4th year.

## Current features

- Interactive map (Leaflet + OpenStreetMap) showing approved reports
- Anonymous report form with a draggable pin, category and optional details
- Statistics page with counts by category, context, time of day and who, plus home page numbers
- Database with Row Level Security: the public can only read approved reports and add new ones
- Privacy trigger in the database: new reports are forced to `pending`, coordinates are shifted by a random 100-300 m, and only the day of creation is stored

## Tech stack

- React (Vite) with JavaScript
- Supabase (PostgreSQL, auto-generated REST API, Row Level Security)
- Leaflet with OpenStreetMap tiles

## Project structure

Backend and frontend are separate parts of the repository.

```
besafe/
  supabase/                 BACKEND (database and server code)
    migrations/             table, trigger, security policies, statistics function
    functions/              Edge Functions (captcha, from step 5)
    docs/
      api-contract.md       what the frontend can call
    seed.sql                fictional test data
    .env.example            backend secrets template (never commit .env)
  frontend/                 FRONTEND (React interface only)
    src/
      api/                  the only place that talks to the backend
      ...                   components, map, form, stats, styles
    .env.example            public keys template
  README.md
```

### Who owns what

| Area | Folder | Owner |
|---|---|---|
| Database, security rules, Edge Functions | `supabase/` | Backend |
| Interface, map, form, translations | `frontend/` | Frontend |
| Contract between the two | `supabase/docs/api-contract.md` | Both agree before changing it |

Rules: the frontend imports Supabase only inside `frontend/src/api/`. Secret keys
(service role, captcha secret) exist only in `supabase/.env` and never in `frontend/`.

## Getting started

### 1. Database

1. Create a project at [supabase.com](https://supabase.com).
2. Open SQL Editor and run `supabase/migrations/20260101000000_init_reports.sql`, then `20260101000001_stats.sql`, then `supabase/seed.sql`.
3. Copy the Project URL and the publishable (anon) key from the project's API settings.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` (copy it from `.env.example`):

```dotenv
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-PUBLISHABLE-KEY
```

Then start the app:

```bash
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

### Keys and security

- Only the publishable (anon) key belongs in the frontend. Data is protected by Row Level Security.
- Never put the `sb_secret_` / `service_role` key in the frontend or commit it to Git.
- `.env.local` is ignored by Git. Each team member creates their own from `.env.example`.

## Privacy by design

- No accounts, no names, no IP addresses saved with reports
- Offender described only by category (known or unknown person), never by name
- Coordinates are shifted on the database side; the original position is never stored
- Reports are moderated before publication
- Test data is fictional

## Roadmap

- [x] 1. Supabase database and security rules
- [x] 2. React app connected to Supabase
- [x] 3. Map with markers
- [x] 4. Report form with draggable pin
- [ ] 5. Captcha through an Edge Function, close direct inserts
- [x] 6. Statistics page and home page numbers
- [ ] 7. English, Russian and Kazakh
- [ ] 8. Moderator login and approval panel

## Team

| Member | Role |
|---|---|
| [Name 1] | Project manager and researcher |
| [Name 2] | Frontend and UI/UX |
| [Name 3] | Backend and database |
| [Name 4] | QA and data analysis |

## Disclaimer

BeSafe does not replace contacting the police or support services.
