# IronGrowth

A personal Ironman training archive built with React, Vite and Supabase.

## Local development

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Without environment variables, the app opens in local mode and stores workout logs in the browser.

## Configure Supabase

1. Create a new Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor.
3. Under Authentication, keep Email/Magic Link enabled and add the local URL to Redirect URLs.
4. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. Sign in once with the personal email address, then disable new sign-ups under Authentication to keep the app private.

The 12-week plan is created idempotently on the first sign-in. The frontend never uses a secret key or `service_role`.

## Verification

```bash
npm run typecheck
npm test
npm run build
npm run test:sites
```
