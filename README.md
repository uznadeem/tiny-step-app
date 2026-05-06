# Tinystep

Tinystep is a Next.js app for turning overwhelming tasks into tiny, ADHD-friendly steps. It includes Supabase authentication, persisted task history, profile preferences, Anthropic-powered task breakdowns, daily LLM usage limits, and a basic authenticated admin dashboard.

## Tech Stack

- **Next.js 16 App Router** with React 19 and TypeScript
- **Supabase** for auth, Postgres, RLS, local development, and migrations
- **Anthropic Messages API** for planner breakdowns and stuck advice
- **Vercel** for deployment
- **Browser Basic Auth** for the `/admin` area

## Main Features

- Landing page at `/`
- Auth screens:
  - `/signup`
  - `/login`
  - `/reset`
- Supabase email/password auth
- Google OAuth via Supabase Auth
- Dashboard planner at `/dashboard`
- AI task breakdown into persisted subtasks
- Separate AI stuck-advice call
- Shared daily LLM quota across planner and stuck routes
- Task history at `/history`
- Expandable task rows with subtask completion
- Profile settings at `/profile`
- Preferences stored in `profiles.preferences`
  - weekly nudge email
  - confetti on completion
  - sound effects
  - default energy level

- Admin dashboard at `/admin`
  - Basic Auth protected
  - overview stats
  - users page
  - tasks page

## Environment Variables

Copy `.env.example` to `.env.local` and fill real values:

```bash
cp .env.example .env.local
```

Required app variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6

LLM_DAILY_LIMIT=20
LLM_QUOTA_TIME_ZONE=Asia/Karachi

ADMIN_USERNAME=
ADMIN_PASSWORD=
```

Local Google OAuth variables for Supabase CLI:

```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=
SUPABASE_AUTH_EXTERNAL_GOOGLE_REDIRECT_URI=http://127.0.0.1:54321/auth/v1/callback
```

Important: `.env.local` is loaded by Next.js, but Supabase CLI commands do not automatically load it into your shell. If a `supabase` command needs one of these variables, export it in the shell first.

## Local Development

Install dependencies:

```bash
npm install
```

Start Supabase locally:

```bash
npx supabase start
```

Run migrations locally:

```bash
npx supabase db reset
```

Start the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Useful Supabase local URLs are printed by `npx supabase start`, including Studio and the local API URL.
