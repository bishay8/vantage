# Vantage

Financial intelligence in plain English. 26 modules covering personal finance, investing, business analysis, tax optimization, and more.

**Try it live:** https://bishay8.github.io/vantage/

## What's inside

- **Home dashboard** with engagement-based health score and "Do This Next" recommendation
- **Personal Finance** with profession-aware categories (8 templates + AI-generated via Claude API)
- **Goal Priority** waterfall — debt payoff vs invest decision math
- **Monte Carlo Retirement** — 5,000 in-browser simulations with percentile fan chart
- **Tax Optimizer** — Roth vs Traditional, contribution waterfall, asset location guide
- **Life Events Simulator** — house, kid, divorce, RSU vest, inheritance, job loss
- **Portfolio Tracker** with HHI diversification scoring
- **Stress Test** — market crash, job loss, rate spike resilience
- **Snapshot History** for tracking changes over time
- **Couples mode**, **locale switcher** (US/CA/UK/EU/AU), **glossary search** (30 terms)

## For reviewers

Open the URL above on phone, tablet, or desktop — onboarding will walk you through it. Plain English is on by default; flip it off in the top bar if you prefer the technical labels.

On mobile, tap the ☰ icon top-left to open the sidebar. It auto-closes after picking a module.

To try the AI category generation, you'll need an Anthropic API key (console.anthropic.com). Your key stays in your browser tab only.

## ⚠ Legal copy is template only

The Terms of Service, Privacy Policy, and Financial Disclaimer are **template text intended to show structural completeness**. They are not lawyer-reviewed and must be replaced before shipping to real users. The in-app modals flag this in red.

Each computation-heavy module (Monte Carlo, Tax Optimizer, Stress Test, Valuation, Capital Budgeting, Cash Flow) now includes a collapsible "📐 How we calculate this" panel listing every formula, the assumptions it depends on, and (where relevant) the source. Transparency about model limitations is the point — finance tools that hide assumptions cause overconfidence.

## Tech

- Single `.jsx` file, ~4,800 lines
- React 18 via UMD, Tailwind via Play CDN, Babel Standalone for in-browser JSX transpilation
- No build step, no backend (yet — SOC 2 backend is the next pass)
- All financial calcs are exact math: Black-Scholes, CAPM, WACC, DCF, NPV/IRR, HHI, bond YTM, amortization, EAA, Monte Carlo

## Constraints respected

Single-file architecture, only `useState` + `useMemo` from React, Tailwind pre-defined utilities only (no custom CSS), no external libraries beyond React + Tailwind.
