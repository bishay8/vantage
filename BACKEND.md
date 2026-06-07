# Sentirel — Backend Blueprint

_The build order for taking the app from memory-only to a real, persisted, multi-user
product. Frontend stays a single file; the backend is a **separate repo**. App is
rebranding Vantage → **Sentirel** (launch on `sentirel.io`; repo/code still `vantage.jsx`
until the rename pass)._

> **Golden-rule reconciliation (read first).** Two of the single-file frontend's hard
> constraints existed *because there was no backend* and are intentionally relaxed now:
> - **"No localStorage/sessionStorage"** → the auth session token has to live somewhere.
>   Supabase stores it in `localStorage` by default. That's fine and expected in the
>   backend era; the rule was a memory-only-by-design artifact, not a security stance.
> - **"BYOK Anthropic"** → becomes a **server-side proxy** (users stop bringing a key).
>
> Two constraints **stay**: the frontend remains **one `.jsx` file** (we add the Supabase
> client the same way we add React — a `<script>` CDN global in `index.html`, no bundler),
> and we **never change a financial formula.**

---

## 1 · Architecture (recommended stack: Supabase)

```
┌───────────────────────────────────────────────┐
│  Browser — sentirel (single-file React)        │
│  + supabase-js (CDN global, like React)        │
└───────┬───────────────────────┬───────────────┘
        │ Supabase Auth (JWT)    │ HTTPS
        ▼                        ▼
┌──────────────────┐   ┌────────────────────────────┐
│ Supabase Postgres│   │ Supabase Edge Functions     │
│  + Row-Level Sec.│   │  (Deno) — hold the secrets: │
│  (auto REST API) │   │  • /categories → Anthropic  │
│  per-user rows   │   │  • /plaid-*     → Plaid      │
└──────────────────┘   │  • /reminders-cron (pg_cron)│
                       └──────────┬─────────┬────────┘
                                  ▼         ▼
                            Anthropic    Plaid + email/push
```

**Why Supabase:** Postgres + Auth + auto-generated REST + Row-Level Security + Edge
Functions (for secrets) + cron, hosted, ~days to stand up, generous free tier, and it's
itself SOC 2 Type 2 (helps your future audit). One vendor covers 90% of this.

**Alternatives** (same shape, more glue): Firebase; or Vercel/Netlify functions + Neon
Postgres. Recommendation stands: Supabase.

---

## 2 · What persists (and what doesn't, yet)

Today the **per-module financial inputs** (income, holdings, loan params, …) live in each
module's *local* `useState` and are intentionally lost on refresh. The **app-level** state
in `Vantage()` is the easy, high-value win to persist first:

| App-level state | Line | Persist as |
|---|---|---|
| `snapshots` | [4341](Desktop/Clde/vantage/vantage.jsx:4341) | `snapshots` table |
| `customCategories` | [4336](Desktop/Clde/vantage/vantage.jsx:4336) | `custom_categories` table |
| `engagement` (drives `healthScore`) | [4329](Desktop/Clde/vantage/vantage.jsx:4329) | `engagement` row |
| `riskProfile`, `coupled`, `toured`, `journey` | 4324/4345/4334/4325 | `profiles.prefs` (jsonb) |

> **Phase-2 gotcha — full financial picture:** persisting every module's raw inputs
> (so a user's whole financial life survives refresh) requires **lifting module state up**
> (or a small sync hook). That's the one genuinely invasive frontend change; everything
> else is a fetch swap. Snapshots are *summaries* (`{nw, surplus, healthScore, label}`),
> not full inputs — so Phase 1 gives "history that survives," Phase 2 gives "pick up
> exactly where you left off."

---

## 3 · Database schema (Postgres + RLS)

Every table is keyed to `auth.uid()` and protected by Row-Level Security so a user can
only ever touch their own rows.

```sql
-- profiles: 1 row per user, mirrors auth.users
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  prefs       jsonb default '{}',          -- riskProfile, coupled, toured, journey, locale
  created_at  timestamptz default now()
);

create table snapshots (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  ts          date not null default current_date,
  nw          numeric,
  surplus     numeric,
  health_score int,
  label       text,
  created_at  timestamptz default now()
);
create index on snapshots(user_id, ts);

create table custom_categories (
  user_id     uuid primary key references auth.users on delete cascade,
  label       text, emoji text,
  assets      jsonb, liabilities jsonb, expenses jsonb,   -- same shape the app already uses
  updated_at  timestamptz default now()
);

create table engagement (
  user_id     uuid primary key references auth.users on delete cascade,
  data        jsonb not null default '{}',  -- {visited, decisions, goalsSet, emergencyMonths, ...}
  updated_at  timestamptz default now()
);

create table reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users on delete cascade,
  due_at      timestamptz not null,
  channel     text check (channel in ('email','push')),
  sent_at     timestamptz
);

-- Phase 3 (Plaid):
create table plaid_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  access_token  text not null,             -- server-only; never exposed via API/RLS
  institution   text, created_at timestamptz default now()
);
-- (plaid_accounts / plaid_transactions tables fetched server-side as needed)

-- RLS (repeat the pattern for every table):
alter table snapshots enable row level security;
create policy "own rows" on snapshots
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

> `plaid_items.access_token` must **never** be readable by the client — keep RLS but only
> touch it from Edge Functions using the service-role key.

---

## 4 · Auth

- **Supabase Auth** — email magic-link (lowest friction) and/or Google OAuth. JWT issued
  to the browser; RLS reads `auth.uid()` from it.
- **Frontend:** add a lightweight sign-in screen, and keep today's experience as a
  **"guest" mode** — the app stays fully usable with no account (memory-only), and signing
  in is what *unlocks persistence*. That preserves the "try it instantly" feel **and**
  matches the legal copy's "we store nothing unless you opt in."
- Session token lands in `localStorage` (Supabase default) — see the golden-rule note.

---

## 5 · The precise `// FUTURE:` swap map

Each is a small, surgical change. Net new frontend code is modest.

**A. AI categories — kill BYOK, add the proxy** _(highest-impact swap)_
- `generateCategoriesViaAI({profession, apiKey, model})` at [544](Desktop/Clde/vantage/vantage.jsx:544)
  → `generateCategoriesViaAI({profession})`; replace the `fetch("https://api.anthropic.com/v1/messages", { headers: x-api-key … })` ([562](Desktop/Clde/vantage/vantage.jsx:562)) with
  `supabase.functions.invoke("categories", { body: { profession } })`.
- **Edge Function `categories`** holds `ANTHROPIC_API_KEY` server-side, takes `{profession}` + the user's JWT, calls the Anthropic Messages API (same prompt/model the code uses today: `claude-sonnet-4-6`), returns the same JSON shape.
- **Delete** the BYOK key input + model select + "Bring your own Anthropic key" panel in `CustomizePanel` (the `apiKey`/`model` state and the amber key card). Users just click "Generate."
- Update **Privacy/Terms**: the BYOK sections ([197](Desktop/Clde/vantage/vantage.jsx:197), [213](Desktop/Clde/vantage/vantage.jsx:213)) no longer describe the data flow — rewrite to "your description is sent to our server, which calls Anthropic; we don't train on it; retention = none/X days."

**B. Snapshots — persist history**
- `const [snapshots, setSnapshots] = useState([])` at [4341](Desktop/Clde/vantage/vantage.jsx:4341): on sign-in, hydrate from `supabase.from('snapshots').select()`.
- `saveSnapshot` at [4342](Desktop/Clde/vantage/vantage.jsx:4342): keep the optimistic local push **and** `supabase.from('snapshots').insert(...)`. (Guest mode = local only.)

**C. Engagement / health score**
- `engagement` at [4329](Desktop/Clde/vantage/vantage.jsx:4329): hydrate on sign-in; debounce-write changes to the `engagement` row. `computeHealthScore` ([4274](Desktop/Clde/vantage/vantage.jsx:4274)) stays **client-side** (it's cheap and not a formula to hide) — the `// FUTURE: secured API-driven score` note at [4273](Desktop/Clde/vantage/vantage.jsx:4273) is optional; persisting `engagement` is the real win.

**D. customCategories / prefs**
- `customCategories` ([4336](Desktop/Clde/vantage/vantage.jsx:4336)) → upsert `custom_categories`.
- `riskProfile`/`coupled`/`toured`/`journey` → upsert `profiles.prefs` (jsonb).

**E. Plaid — replace the stub** _(Phase 3)_
- `PlaidStub` ([296](Desktop/Clde/vantage/vantage.jsx:296)) → real Plaid Link: Edge Function `plaid-link-token` creates a link token; Plaid Link UI returns a `public_token`; Edge Function `plaid-exchange` swaps it for an `access_token` stored in `plaid_items` (server-only); a `plaid-sync` function pulls balances/transactions to prefill modules. **Plaid secret never touches the client.**

**F. Reminders — replace the stub** _(Phase 4)_
- `ReminderStub` ([299](Desktop/Clde/vantage/vantage.jsx:299)) → `insert` into `reminders`; a `pg_cron` job + Edge Function sends email (Resend/Postmark) or web-push at `due_at`.

_(The `// FUTURE:` at [2403](Desktop/Clde/vantage/vantage.jsx:2403) is a tax-accuracy TODO, **not** a backend item.)_

---

## 6 · Build order

| Phase | Ships | Effort |
|---|---|---|
| **0 · Foundation** | Supabase project, schema + RLS, Auth, supabase-js in `index.html`, sign-in screen + guest mode | ~1–2 days |
| **1 · MVP persistence** | Snapshots persist · **Anthropic proxy (drop BYOK)** · engagement/customCategories/prefs persist | ~2–4 days |
| **2 · Full picture** | Lift module inputs → resume exactly where you left off | ~3–5 days (the invasive one) |
| **3 · Plaid** | Real bank/broker aggregation (server-side) | Plaid onboarding + ~1 wk |
| **4 · Reminders** | Email/push nudges via cron | ~2–3 days |
| **5 · SOC 2** | Vanta/Drata + audit — only when enterprise customers demand it | months / $$$, not a launch gate |

**Phase 1 is the launchable beta:** real accounts, persisted history, key-free AI.

---

## 7 · Security, compliance, cost

- **RLS on every table**, `auth.uid()`-scoped. Secrets (`ANTHROPIC_API_KEY`, `PLAID_SECRET`, service-role key) **only** in Edge Function env, never in the client bundle.
- **⚠ Privacy policy must change the day you store data.** The legal copy we shipped is honest that *today* nothing is collected. The moment Phase 1 persists a row, "we collect nothing" is false — update Privacy (categories collected, retention, the Anthropic-proxy flow, opt-in) **before** the backend goes live. (This is on the `attorneyFlags` list.)
- **Entity + insurance:** form the LLC and get tech E&O / cyber coverage before holding real financial data — that's the real liability gate, not the code.
- **You stay out of money-transmitter territory** as long as you never move money (you don't) — you're read-only aggregation + education.
- **Cost (rough):** Supabase $0 → $25/mo Pro · Anthropic API (you now pay per proxy call instead of users — budget per-active-user) · Plaid per-item (production needs their approval) · email (Resend free tier) · `sentirel.io` domain. Phase-1 beta: **~$25–75/mo** all-in.

---

## 8 · Open decisions before Phase 0

1. **Auth method** — magic-link only (simplest) vs. add Google OAuth.
2. **Anthropic-proxy abuse control** — rate-limit per user (the cost is now yours): per-day cap on `/categories` calls.
3. **Guest → account migration** — when a guest signs in, do we offer to save their current in-memory state? (Nice onboarding moment.)
4. **Repo** — new `sentirel-backend` repo for the Edge Functions + SQL migrations; frontend `vantage.jsx` only gains `supabase` calls.
