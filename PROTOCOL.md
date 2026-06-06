# Vantage — Operating Protocol

**This is the runbook. Follow it mechanically.** It is stable (rarely changes).
For *current state* (what's done, what's next) read `HANDOFF.md` after this.

Project: single-file React financial app. Canonical dir:
`/Users/bishay/Desktop/Clde/vantage/`. Live: https://bishay8.github.io/vantage/.
Repo: github.com/bishay8/vantage (`gh` authenticated). Ignore the stale copy at
`/Users/bishay/vantage-preview/`.

---

## 0 · COLD START — run this before touching anything

Do every step. If any step is NOT green, STOP, report what you saw, and do not edit.

1. `cd /Users/bishay/Desktop/Clde/vantage`
2. `git status -sb` → expect `## main...origin/main` and a clean tree.
3. `wc -l vantage.jsx` → expect ~4,490 lines. (File is >256 KB — never Read it whole; use grep + `offset`/`limit`.)
4. Load preview tools via ToolSearch:
   `select:mcp__Claude_Preview__preview_start,mcp__Claude_Preview__preview_eval,mcp__Claude_Preview__preview_screenshot,mcp__Claude_Preview__preview_resize,mcp__Claude_Preview__preview_console_logs,mcp__Claude_Preview__preview_stop`
5. `preview_start` name `vantage` (port 8765, dir already set in `/Users/bishay/.claude/launch.json`).
6. `preview_eval`: `new Promise(r=>setTimeout(()=>r({h1:document.querySelector('h1')?.textContent}),7000))` → expect `"Welcome to Vantage"`. (First load ~5 s: Babel transpiles in-browser.)
7. `preview_console_logs` level `error` → expect **none**.
8. Baseline confirmed. Now you may work.

---

## 1 · GOLDEN RULES (the constraints — check your diff against these before every save)

A change that breaks any of these is wrong — revert and find another way.

1. **One file.** No `import`, no new files for app code. Top line stays `const { useState, useMemo } = React;`.
2. **Hooks: `useState` + `useMemo` only.** No `useEffect`/`useRef`/`useCallback`/`useContext`. (The single existing `class ErrorBoundary` is the only allowed class — don't add more.)
3. **Tailwind Play CDN — utility classes only.** No custom CSS, no `@apply`, no config. Simple arbitrary values (`min-w-max`, `w-64`) are fine; avoid `calc()` arbitrary values.
4. **No libraries** beyond React + Tailwind + Babel.
5. **No `localStorage`/`sessionStorage`.** Memory-only by design; state resets on refresh. That is intentional, not a bug.
6. **Never change a financial formula** (NPV, IRR, Black-Scholes, CAPM, WACC, DCF, amortization, EAA, YTM, HHI, Monte Carlo). Only guard bad inputs / bad rendering.

**Pre-save scan:** look at your edit — did it add an import, a banned hook, a library, a storage call, or alter a formula? If yes, stop.

---

## 2 · THE CHANGE CYCLE — repeat for EVERY edit

1. **Locate** with grep (file too big to read whole): `grep -n '<pattern>' vantage.jsx`.
2. **Read** only that region with `offset`/`limit`.
3. **Smallest possible edit.** Prefer one `Edit` over a rewrite. (If a tool says "file modified since read," re-Read then Edit.)
4. **Bump the cache:** change `?v=N` → `?v=N+1` in `index.html` (the `<script ... src="./vantage.jsx?v=N">` line). Skipping this = your change won't show.
5. **Reload:** `preview_eval` `location.reload()`, then wait 7 s (the Promise snippet from step 0.6).
6. **Console must be clean:** `preview_console_logs` level `error` → none. (Any error here = white screen for users.)
7. **Content renders:** h1 present / the changed text appears (`preview_eval` checking `document.body.innerText`).
8. **If it's a UI change**, verify both viewports:
   - `preview_resize` preset `mobile` (375px) → `preview_eval` `({o:document.documentElement.scrollWidth-document.documentElement.clientWidth})` must be `0` (no horizontal overflow — this is the owner's recurring pain point).
   - `preview_resize` preset `desktop` → screenshot, confirm no regression.
9. **Green? Deploy** (Section 4). Not green? Section 3.

---

## 3 · FAILURE PLAYBOOK

| Symptom | Cause → Fix |
|---|---|
| White screen / no `h1` after reload | **Babel parse error.** Read `preview_console_logs` (all). Grep your last edit's region for unbalanced JSX (a wrapper `<div>` added without its `</div>`, a `<>`/`</>` mismatch, a missing `}` or `)`, two of the same attribute on one tag). |
| Edit doesn't appear | Forgot to bump `?v=N`, or cache. Bump it, reload. |
| "File modified since read" on Edit | Re-`Read` the region, then Edit. |
| `$NaN` / `$Infinity` / `NaN%` on screen | A division by zero reached the UI. The `$()` formatter guards most; for raw `.toFixed()` add `x > 0 ? ... : "—"`. Never "fix" by changing the formula. |
| Deploy not live | `gh api repos/bishay8/vantage/pages/builds/latest --jq '.status'`: `building`→wait, `built`→done, `errored`→read `.error.message`. |
| Need a real stack trace | Temporarily swap `react.production.min.js`→`react.development.js` in `index.html`, reload, debug, then swap back. |

---

## 4 · DEPLOY

```
cd /Users/bishay/Desktop/Clde/vantage
git add -A
git -c user.name="bishay8" -c user.email="bishay8@gmail.com" commit -m "<imperative summary>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
git push origin main
```
Pages auto-rebuilds ~30 s. Confirm: wait until `gh api repos/bishay8/vantage/pages/builds/latest --jq '.status'` is `built`, then `curl -sI https://bishay8.github.io/vantage/ | head -1` → `HTTP/2 200`.

Commit per logical change; don't batch unrelated edits.

---

## 5 · COOKBOOK (recipes for recurring tasks)

- **Add a module:** (a) entry in `const MODULES = [...]` (id, label, icon, tier); (b) entry in `BREADCRUMBS`; (c) a `{active === "<id>" && <YourModule .../>}` line in the main render switch (auto-wrapped by `ErrorBoundary`); (d) the `function YourModule(...)` itself, starting with `<Title tier="...">`. Grep anchors: `const MODULES = `, `const BREADCRUMBS`, `function Vantage`.
- **Add a point-of-use disclaimer:** drop `<AdviceNote kind="financial" />` (or `"tax"` / `"trading"`) right after the module's `<Title>`.
- **Guard an edge case:** wrap the render, e.g. `{denom > 0 && Number.isFinite(x) ? x.toFixed(0)+"%" : "—"}`. The shared `$()` already returns `"—"` for non-finite input.
- **Big audit / review / migration:** use the **Workflow tool** — parallel auditor agents (one per dimension) → adversarial verify each finding → synthesize prioritized waves. This is how the app went 58→91 on launch-readiness. Always run a *verification* workflow after a large batch of edits to catch regressions.
- **Wire the backend later:** `grep -n '// FUTURE:' vantage.jsx` marks every swap-in point.

---

## 6 · DEFINITION OF DONE (for any change)

Compiles (h1 renders) · zero console errors · no `NaN`/`Infinity` in output · no 375px horizontal overflow · the changed behavior is visually confirmed · committed + pushed · Pages shows `built`.

---

## 7 · SESSION-END PROTOCOL

1. Update **`HANDOFF.md`** — current state, what you shipped, what's next.
2. Commit + push everything (including HANDOFF.md).
3. Confirm Pages `built` + site `200`.
4. Leave the user a paste-ready continuation prompt that says: read `PROTOCOL.md` then `HANDOFF.md`, run the Cold Start, don't edit until you've confirmed a green baseline.
