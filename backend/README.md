# Sentirel — backend (Phase 0)

Deploy-ready artifacts for Phase 0: the database (schema + Row-Level Security) and the
`categories` Edge Function (the Anthropic proxy that retires BYOK). Auth = email magic-link.

> This lives in the app repo for now; split it into a dedicated `sentirel-backend` repo
> whenever you like. None of this is served by GitHub Pages — they're just files.

```
backend/
├── migrations/0001_init.sql      # paste into Supabase SQL Editor
└── functions/categories/index.ts # supabase functions deploy categories
```

## You'll need
- A free **Supabase** account → https://supabase.com
- The **Supabase CLI** → `brew install supabase/tap/supabase`
- Your **Anthropic API key** (`sk-ant-...`) — now held by the server, not users

## Steps

**1 · Create the project.** New project at supabase.com (free tier is plenty). Note your
**Project URL** and **anon public key** (Settings → API) — the frontend needs them next.

**2 · Run the schema.** Studio → **SQL Editor** → paste all of
[`migrations/0001_init.sql`](migrations/0001_init.sql) → **Run**. Creates the tables, the
auto-profile trigger, the per-user AI quota, and RLS so users only touch their own rows.

**3 · Turn on magic-link auth.** Authentication → Providers → enable **Email** (Confirm
email ON = magic link). Authentication → URL Configuration → set **Site URL** to your app
URL (`https://bishay8.github.io/vantage/` now; `https://sentirel.io` later) and add it to
**Redirect URLs**.

**4 · Deploy the proxy.**
```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...      # only secret you must set
supabase functions deploy categories
```
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected automatically.

**5 · Smoke-test.** Create a test user (Studio → Authentication → Add user, or magic-link
from the app once wired), grab its access token, then:
```bash
curl -i -X POST "https://<ref>.functions.supabase.co/categories" \
  -H "Authorization: Bearer <USER_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"profession":"I run a 3PL warehouse in Long Beach with 8 employees"}'
```
Expect `200` with `{assets, liabilities, expenses}`. No auth → `401`. Over `20/day` → `429`.

## What's next (I'll write it)
Frontend integration: add `supabase-js` to `index.html` (a CDN global, like React), a
magic-link sign-in screen + **guest mode**, then the swaps —
`generateCategoriesViaAI` → `functions.invoke("categories")` (and delete the BYOK key
input), plus snapshots / engagement / customCategories hydrate-and-persist. See
[`../BACKEND.md`](../BACKEND.md) §5 for the line-by-line map.

## Security notes
- `plaid_items` and `ai_usage` have **no client RLS policy** on purpose — only Edge
  Functions (service-role key) touch them.
- Secrets live **only** in function env, never in the frontend.
- ⚠ **Update the Privacy Policy before the first real row is stored** — the shipped copy
  says "we collect nothing today," which stops being true the moment this goes live.
