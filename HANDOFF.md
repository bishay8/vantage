# Vantage — Session Handoff

_Last updated: end of the launch-optimization session._
_**Read `PROTOCOL.md` first** (the operating runbook), then this file (current state)._

## What Vantage is
A **single-file React** financial-intelligence web app — ~4,490 lines in one `.jsx` file, 26 modules covering personal finance, investing, portfolio, options, tax, business valuation, Monte Carlo retirement, stress test, life events, and more. Plain-English mode on by default. Optional BYOK (bring-your-own-key) Anthropic integration generates profession-specific budget categories. Deployed to GitHub Pages.

- **Live app:** https://bishay8.github.io/vantage/
- **Repo:** https://github.com/bishay8/vantage (account `bishay8`, `gh` CLI is authenticated)
- **Owner:** Michael Bishay — LA-based finance analytics student; family in auto / real estate / wholesale; exploring 3PL, used-EV dealer, SaaS.

## ⚠️ Canonical location (IMPORTANT)
**Work here:** `/Users/bishay/Desktop/Clde/vantage/` — this is the live git repo (remote + history intact) and the preview server points here.

There is a STALE older copy at `/Users/bishay/vantage-preview/` — **ignore it**, do not edit it. (It was the original working dir before the project moved to the Desktop folder.)

## Files
- `vantage.jsx` — the entire app (one file). **It's >256KB**, so the Read tool needs `offset`/`limit` or grep; you can't read it whole.
- `index.html` — loader: Tailwind Play CDN + React 18 UMD + Babel Standalone (in-browser JSX transpile). Has all SEO/OG/Twitter meta + favicon. Loads `vantage.jsx?v=N` — **bump N on every change to bust the browser cache.** Currently `?v=12`.
- `manifest.json`, `social-preview.png` (1200×630 OG image) — for shareable link previews.
- `README.md` — public-facing project description.

## Hard constraints (DO NOT VIOLATE — these are why the app stays one file)
1. **Single `.jsx` file.** No imports/modules. Top line is `const { useState, useMemo } = React;` (React is a global from the UMD script).
2. **Only `useState` + `useMemo`** hooks. No `useEffect`, `useRef`, `useCallback`, `useContext`. The ONE exception already in the file is a single `class ErrorBoundary extends React.Component` (needed for `componentDidCatch`) — that pattern is fine; don't add more classes casually.
3. **Tailwind via Play CDN — pre-defined utility classes only.** Arbitrary values like `min-w-max`, `w-64`, `text-xs` work; avoid exotic `calc()` arbitrary values (`max-w-[calc(100vw-2rem)]` was flagged unreliable). No custom CSS file, no `@apply`, no tailwind.config.
4. **No external libraries** beyond React + Tailwind + Babel.
5. **No `localStorage`/`sessionStorage`** — app is memory-only by design until the SOC 2 backend exists. State resets on refresh; that's intentional.
6. **Preserve every financial formula exactly** — NPV, IRR, Black-Scholes, CAPM, WACC, DCF, amortization, EAA, bond YTM, HHI, Monte Carlo. Only guard inputs/edge cases; never change the math.

## How to run the live preview (Claude Preview MCP)
1. Tools are deferred — load with ToolSearch: `select:mcp__Claude_Preview__preview_start,mcp__Claude_Preview__preview_eval,mcp__Claude_Preview__preview_screenshot,mcp__Claude_Preview__preview_resize,mcp__Claude_Preview__preview_console_logs`.
2. `preview_start` with name `vantage` (config is in `/Users/bishay/.claude/launch.json` — a python `http.server` on **port 8765**, directory already set to this folder).
3. After editing `vantage.jsx`: bump `?v=N` in `index.html`, then `preview_eval` `location.reload()`.
4. **First load takes ~5s** (Babel transpiles ~4,500 lines in-browser). Wait ~7s before asserting, e.g. `preview_eval`: `new Promise(r=>setTimeout(()=>r({h1:document.querySelector('h1')?.textContent}),7000))`.
5. Check `preview_console_logs` level `error` after each reload — a Babel parse error = white screen.
6. Test mobile with `preview_resize` preset `mobile` (375px) — the owner reviews on phone. Verify `document.documentElement.scrollWidth - clientWidth === 0` (no horizontal overflow).
7. **React is the production build**, so runtime errors print without full stack traces. If debugging a crash, temporarily swap `react.production.min.js`→`react.development.js` in index.html.

## How to deploy
```
cd /Users/bishay/Desktop/Clde/vantage
git add -A
git -c user.name="bishay8" -c user.email="bishay8@gmail.com" commit -m "..."
git push origin main
```
GitHub Pages auto-rebuilds in ~30s. Verify: `gh api repos/bishay8/vantage/pages/builds/latest --jq '.status'` should be `built`. Commit messages end with `Co-Authored-By: Claude ...`.

## Current state — LAUNCH READY (~96/100)
A **financial fact/content audit** (web-verified against IRS/BEA/Fed) then fixed 11 stale or wrong claims (commit after the math pass): 2026 IRS limits were showing 2024 values while the text claimed "2026" — corrected to 401(k) $24,500 / IRA $7,500 / HSA $4,400; savings-rate benchmark 4.5%→8.4% long-run (so it can't re-stale); median income $6,500→$6,977 (2024 Census); inheritance "median" mislabel, an overstated "2-3× goal" claim → ~42%, a 22-29% APR range → ~20-25%, VIX/yield-curve tooltip nuance. The LTCG-rate and NIIT triggers are a known **simplification** (keyed off bracket, not taxable-income/MAGI thresholds) — now disclosed with an in-app caveat + `// FUTURE:` notes; a proper rebuild needs taxable-income + filing-status inputs (see What's NEXT). Median net worth $192k confirmed correct.


A full launch-optimization pass shipped, then a **deep financial-correctness audit** independently re-derived all 10 formula groups. **7 passed clean** (Black-Scholes & Greeks, NPV/IRR/Payback/PI/EAA, bond YTM, CAPM/WACC/DCF, Monte Carlo & retirement compounding, HHI/diversification/P&L, stress-test & runway — all verified against concrete test cases). **3 confirmed bugs were fixed** (commit 11c8199):
- Tax Estimator summed only winners, ignoring losses on sold holdings → now nets ST/LT gains & losses (verified: $3,129→$2,691 on sample).
- Rent-vs-Buy equity used a hardcoded `0.85` loan factor → now the true amortized remaining balance (~$220k→~$203k on sample).
- Loan amortization final-row showed the constant payment → now the actual final payment.
The core pricing/valuation engines were already correct; no formula was rewritten, only the 3 buggy lines. **The math is now independently verified.**

Earlier verification audit scored **91/100, ready to share, zero blockers**. What's DONE:
- **Mobile responsive** (the owner's #1 complaint): all grids collapse to 1-col on phones, all 7 wide tables + portfolio rows wrap in `overflow-x-auto`, hamburger sidebar overlay. Zero horizontal overflow at 375px.
- **No `$NaN`/`$Infinity`**: root guard in the `$()` formatter (`!Number.isFinite(n) → "—"`) plus YTM / stress-test / loan / break-even edge-case guards.
- **`ErrorBoundary`** wraps every module (`key={active}`, resets on nav) — no white-screens.
- **Legal:** point-of-use "educational, not advice" disclaimers (`<AdviceNote>`) on Market Lab, Options, Tax Estimator, Tax Optimizer; Terms/Privacy/Disclaimer modals (still TEMPLATE text — see below); accurate BYOK privacy wording.
- **Shareability:** OG + Twitter meta, favicon, manifest, 1200×630 social image — links preview properly in iMessage/Slack.
- **A11y:** focus rings + aria-labels on shared `Btn`/`Tip`, Escape-to-close on all 6 modals, aria-expanded on toggles.
- **Polish:** Monte Carlo runs 10,000 sims (matches copy), onboarding Terms-gate clarity, empty states, friendlier boot screen.

## What's NEXT (priority order)
1. **SOC 2 Type 2 backend** — the big one. Until it exists, everything is memory-only. When wired, replace these (search the code for `// FUTURE:`):
   - `computeHealthScore` / engagement → real persisted data.
   - `setSnapshots` → backend `POST /snapshots` (so snapshot history survives refresh).
   - The BYOK Anthropic call (`generateCategoriesViaAI`) → proxy through your server so users don't need their own key (the only network call in the app; swapping its URL is the whole change).
   - Plaid account aggregation + email/push reminders (UI stubs exist: `PlaidStub`, `ReminderStub`).
   - `ErrorBoundary.componentDidCatch` → log to a remote sink for observability.
2. **Full dark mode** — currently the toggle is HIDDEN (search `Dark mode toggle hidden for launch`). It only themed the shell, not module content, so it looked half-built. To finish: theme the shared primitives (`Card`, `F`, `StatCard`, `Title`, modals, `<main>` bg) with `dark:` variants. Large job; do it as its own pass, then un-hide the toggle.
3. **Replace TEMPLATE legal copy** — Terms/Privacy/Disclaimer in `LEGAL_TEXT` are placeholder text (the user-visible "TEMPLATE" warning was removed, but a dev comment remains at the `LegalModal`). Get them lawyer-reviewed before any public/paid launch.
4. **Tax-engine accuracy rebuild** (the one real content gap left): the Tax Estimator approximates the LTCG rate and the 3.8% NIIT from the user's ordinary bracket. Correct behavior keys off **taxable income** (LTCG 0/15/20% cutoffs, IRS Topic 409) and **MAGI + filing status** (NIIT $200k single / $250k MFJ, Topic 559). Add a taxable-income + filing-status input and drive both correctly. Search `// SIMPLIFICATION:` and `// FUTURE:` in TaxEstimator. Also: the contribution waterfall ignores age-50+ catch-ups (401(k) +$8,000, IRA +$1,100, HSA +$1,000 at 55+) — add an age input to include them.
5. **Keep year-sensitive numbers current:** IRS limits and tax brackets change annually. Each January, re-verify the contribution limits, LTCG cutoffs, and standard-deduction/bracket figures (grep `24500`, `7500`, `4400`, `ltcgRate`, `stcgRate`). A future content re-audit workflow can automate this.
6. **Optional Wave-3 leftovers** (nice-to-have, non-blocking): memoize MarketLab indicators (`calcSMA/EMA/RSI/MACD`) in `useMemo`; add text labels to a couple color-only red/green signals; granular consent + 18+ age check.

## Useful patterns from this session
- For big audits/reviews, the **Workflow tool** with parallel auditor agents → adversarial verify → synthesis worked very well (see the two audit workflows that produced the 58→91 improvement). Re-run a verification workflow after any large batch of edits to catch regressions.
- The owner has a Memory file noting **CA EV HOV access ended Sept 30 2025** — don't cite HOV access as an EV demand driver.

## Quick orientation grep
```
grep -nE '^(function|const [A-Z]|class )' vantage.jsx   # all components/modules
grep -n 'const MODULES = '   vantage.jsx                # the module registry + sidebar tiers
grep -n 'function Vantage'    vantage.jsx               # main app component (state lives here)
grep -n '// FUTURE:'          vantage.jsx               # backend swap-in points
```
