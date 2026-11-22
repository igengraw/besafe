# BeSafe

An anonymous web platform where people can report harassment on an interactive map of Almaty. No registration, no personal data, and locations are shifted before saving to protect the person reporting.

Course project: General Project, 4th year.

## Current features

- Interactive map (Leaflet + OpenStreetMap) showing approved reports
- Anonymous report form with a draggable pin, category and optional details
- Database with Row Level Security: the public can only read approved reports and add new ones
- Privacy trigger in the database: new reports are forced to `pending`, coordinates are shifted by a random 100-300 m, and only the day of creation is stored

## Tech stack

- React (Vite) with JavaScript
- Supabase (PostgreSQL, auto-generated REST API, Row Level Security)
- Leaflet with OpenStreetMap tiles

## Project structure

```
besafe/
  database/        SQL files for Supabase
    01_schema.sql  table, trigger, security policies
    02_seed.sql    fictional test data
  frontend/        React app
    src/
  README.md
```

## Getting started

### 1. Database

1. Create a project at [supabase.com](https://supabase.com).
2. Open SQL Editor and run `database/01_schema.sql`, then `database/02_seed.sql`.
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
- [ ] 6. Statistics page and home page numbers
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
