# Vantage — start here

If you're a fresh session, read these two files **before doing anything**, in order:

1. **`PROTOCOL.md`** — the operating runbook (cold-start checklist, constraints, change cycle, failure playbook). Stable rules.
2. **`HANDOFF.md`** — current state: what's done, what's next.

Then run the **Cold Start** in PROTOCOL.md §0 and confirm a green baseline before editing.

One-line summary: single-file React financial app (`vantage.jsx`, ~4,490 lines, >256 KB — never read whole). Constraints: one file, only `useState`/`useMemo`, Tailwind CDN classes, no libraries, no localStorage, never change the financial math. Live at https://bishay8.github.io/vantage/ · repo github.com/bishay8/vantage.
