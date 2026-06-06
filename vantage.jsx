const { useState, useMemo } = React;

// ============================================================
// VANTAGE v5 — Financial Intelligence for Everyone
// ============================================================

// Error boundary so one bad module can never white-screen the whole app.
// Class component is required for componentDidCatch — uses React.Component, no new imports.
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { this.lastError = error; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-lg mx-auto mt-20 p-8 text-center">
          <div className="text-5xl mb-3">🙏</div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-[#eef1f6] mb-2">Something went wrong on this screen</h2>
          <p className="text-sm text-slate-500 dark:text-[#a3acba] mb-5">Your other data is safe. This is usually fixed by going back home and reopening the module.</p>
          <button onClick={() => { this.setState({ hasError: false }); if (this.props.onReset) this.props.onReset(); }} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Return to Home</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Tier color theme (used by sidebar, Title banners, dots) ---
const TIER_COLORS = {
  "Home": { dot: "bg-sky-400", grad: "from-sky-50 dark:from-sky-500/10 to-white dark:to-transparent", bar: "bg-sky-500", text: "text-sky-700 dark:text-sky-300", soft: "bg-sky-50 dark:bg-sky-500/10", border: "border-sky-200 dark:border-sky-500/30", glow: "shadow-sky-500/30" },
  "Start Here": { dot: "bg-indigo-400", grad: "from-indigo-50 dark:from-indigo-500/10 to-white dark:to-transparent", bar: "bg-indigo-500", text: "text-indigo-700 dark:text-indigo-300", soft: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/30", glow: "shadow-indigo-500/30" },
  "My Money": { dot: "bg-emerald-400", grad: "from-emerald-50 dark:from-emerald-500/10 to-white dark:to-transparent", bar: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", soft: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", glow: "shadow-emerald-500/30" },
  "Investing": { dot: "bg-blue-400", grad: "from-blue-50 dark:from-blue-500/10 to-white dark:to-transparent", bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-300", soft: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/30", glow: "shadow-blue-500/30" },
  "Market Intel": { dot: "bg-cyan-400", grad: "from-cyan-50 dark:from-cyan-500/10 to-white dark:to-transparent", bar: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-300", soft: "bg-cyan-50 dark:bg-cyan-500/10", border: "border-cyan-200 dark:border-cyan-500/30", glow: "shadow-cyan-500/30" },
  "My Business": { dot: "bg-violet-400", grad: "from-violet-50 dark:from-violet-500/10 to-white dark:to-transparent", bar: "bg-violet-500", text: "text-violet-700 dark:text-violet-300", soft: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/30", glow: "shadow-violet-500/30" },
  "Protection": { dot: "bg-amber-400", grad: "from-amber-50 dark:from-amber-500/10 to-white dark:to-transparent", bar: "bg-amber-500", text: "text-amber-700 dark:text-amber-200", soft: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", glow: "shadow-amber-500/30" },
  "About Me": { dot: "bg-slate-400", grad: "from-slate-100 dark:from-[#1c1f26] to-white dark:to-transparent", bar: "bg-slate-500", text: "text-slate-700 dark:text-[#dde3ec]", soft: "bg-slate-50 dark:bg-[#15171c]", border: "border-slate-200 dark:border-[#323844]", glow: "shadow-slate-500/30" },
};
const tierTheme = (t) => TIER_COLORS[t] || TIER_COLORS["About Me"];

// --- Shared UI ---
const Tip = ({ text }) => { const [s, setS] = useState(false); return <span className="relative inline-block ml-1"><button type="button" aria-label="More information" aria-expanded={s} className="w-4 h-4 rounded-full bg-slate-200 dark:bg-[#2c313b] text-slate-500 dark:text-[#a3acba] text-xs inline-flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 cursor-help outline-none focus-visible:ring-2 focus-visible:ring-indigo-400" onMouseEnter={() => setS(true)} onMouseLeave={() => setS(false)} onClick={() => setS(!s)} onFocus={() => setS(true)} onBlur={() => setS(false)}>i</button>{s && <div className="absolute z-50 bottom-6 left-1/2 -translate-x-1/2 w-64 md:w-72 bg-slate-900 text-white text-xs rounded-lg p-3 shadow-2xl leading-relaxed pointer-events-none">{text}<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" /></div>}</span>; };
const Card = ({ children, className = "", onClick, accent }) => { const accentBorder = accent === "good" ? "border-l-4 border-l-emerald-400" : accent === "bad" ? "border-l-4 border-l-red-400" : accent === "neutral" ? "border-l-4 border-l-sky-400" : ""; return <div onClick={onClick} className={`bg-white dark:bg-[#1c1f26] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow border border-slate-100 dark:border-[#2a2f38] ${accentBorder} ${className}`}>{children}</div>; };
// StatCard: large hero number with tinted bg by sign and a thin colored underline.
const StatCard = ({ label, value, sign = "neutral", sub, size = "lg" }) => {
  const tints = { good: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300", bad: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300", neutral: "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300" };
  const underline = { good: "bg-emerald-400", bad: "bg-red-400", neutral: "bg-sky-400" };
  const sizes = { md: "text-2xl", lg: "text-3xl", xl: "text-4xl" };
  return (<div className={`rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow ${tints[sign]}`}>
    <div className="text-xs font-semibold opacity-70 mb-1">{label}</div>
    <div className={`${sizes[size]} font-bold leading-tight`}>{value}</div>
    <div className={`h-0.5 w-12 mt-2 rounded-full ${underline[sign]}`} />
    {sub && <div className="text-xs opacity-70 mt-2">{sub}</div>}
  </div>);
};
const Title = ({ children, sub, tier }) => { const th = tier ? tierTheme(tier) : null; return (<div className="mb-6">{th ? (<div className={`-mx-2 px-4 py-3 mb-3 rounded-xl bg-gradient-to-r ${th.grad}`}><div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${th.dot}`} /><span className={`text-xs font-bold uppercase tracking-wider ${th.text}`}>{tier}</span></div><h2 className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{children}</h2>{sub && <p className="text-sm text-slate-500 dark:text-[#a3acba] mt-1">{sub}</p>}</div>) : (<><h2 className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6]">{children}</h2>{sub && <p className="text-sm text-slate-500 dark:text-[#a3acba] mt-1">{sub}</p>}</>)}</div>); };
// WhyMatters: collapsible "Why does this matter?" with plain-English implication.
const WhyMatters = ({ text }) => { const [open, setOpen] = useState(false); return (<div className="mt-1"><button onClick={() => setOpen(!open)} aria-expanded={open} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"><span aria-hidden="true">{open ? "▾ " : "▸ "}</span>Why does this matter?</button>{open && <div className="mt-1 text-xs text-slate-600 dark:text-[#c4ccd8] bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 rounded-lg p-2 leading-relaxed">{text}</div>}</div>); };
// Celebrate: lightweight Tailwind-only dot burst (uses animate-ping + animate-bounce).
const Celebrate = ({ show, message, tone = "emerald" }) => {
  if (!show) return null;
  const borders = { emerald: "border-emerald-300 dark:border-emerald-500/40", indigo: "border-indigo-300 dark:border-indigo-500/40", amber: "border-amber-300 dark:border-amber-500/40" };
  const dotBg = { emerald: "bg-emerald-400", indigo: "bg-indigo-400", amber: "bg-amber-400" };
  const positions = [
    { top: "-8px", left: "20%" }, { top: "-8px", left: "50%" }, { top: "-8px", left: "80%" },
    { bottom: "-8px", left: "30%" }, { bottom: "-8px", left: "70%" },
    { top: "50%", left: "-10px" }, { top: "50%", right: "-10px" },
  ];
  return (<div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
    <div className={`relative px-6 py-3 rounded-full shadow-2xl bg-white dark:bg-[#1c1f26] border-2 ${borders[tone]} animate-bounce`}>
      <span className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{message}</span>
      {positions.map((p, i) => <span key={i} className={`absolute w-2.5 h-2.5 rounded-full ${dotBg[tone]} animate-ping`} style={p} />)}
    </div>
  </div>);
};
// Nudge: full-width colored banner suggesting a next step.
const Nudge = ({ tone = "indigo", text, ctaLabel, onClick }) => { const tones = { indigo: "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200", amber: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200", emerald: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200" }; const btn = { indigo: "bg-indigo-600 hover:bg-indigo-700", amber: "bg-amber-500 hover:bg-amber-600", emerald: "bg-emerald-600 hover:bg-emerald-700" }; return (<div className={`mt-6 p-4 rounded-xl border-2 flex items-center justify-between gap-4 ${tones[tone]}`}><div className="text-sm font-medium">{text}</div>{onClick && <button onClick={onClick} className={`px-4 py-2 ${btn[tone]} text-white text-sm font-semibold rounded-lg whitespace-nowrap`}>{ctaLabel} →</button>}</div>); };
const F = ({ label, value, onChange, prefix, suffix, info, type = "number", small, options, placeholder, hint }) => (<div className={small ? "mb-1.5" : "mb-2.5"}><label className="block text-xs font-medium text-slate-500 dark:text-[#a3acba] mb-1 flex items-center">{label}{info && <Tip text={info} />}</label>{options ? <select value={value} onChange={e => onChange(e.target.value)} className={`w-full px-2 ${small ? "py-1" : "py-1.5"} text-sm text-slate-800 dark:text-[#eef1f6] bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400`}>{options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}</select> : <div className="flex items-center bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#323844] rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400">{prefix && <span className="pl-2 text-xs text-slate-400 dark:text-[#828b9a]">{prefix}</span>}<input type={type} inputMode={type === "number" ? "decimal" : undefined} value={value === 0 && placeholder ? "" : value} placeholder={placeholder} onChange={e => onChange(type === "number" ? (Number(e.target.value) || 0) : e.target.value)} className={`w-full px-2 ${small ? "py-1" : "py-1.5"} text-sm text-slate-800 dark:text-[#eef1f6] outline-none bg-transparent placeholder:text-slate-300`} />{suffix && <span className="pr-2 text-xs text-slate-400 dark:text-[#828b9a]">{suffix}</span>}</div>}{hint && <div className="text-xs text-slate-400 dark:text-[#828b9a] mt-0.5 italic">{hint}</div>}</div>);
// RangeHint: shows "Typical: $X–Y" inline. Helps beginners gauge what's normal.
const RangeHint = ({ label = "Typical", low, high, unit = "$", note }) => (<div className="text-xs text-slate-400 dark:text-[#828b9a] mt-0.5 flex items-center gap-1"><span className="font-semibold text-slate-500 dark:text-[#a3acba]">{label}:</span><span>{unit === "$" ? `$${low.toLocaleString()}–$${high.toLocaleString()}` : `${low}–${high}${unit}`}</span>{note && <span className="text-slate-400 dark:text-[#828b9a]">— {note}</span>}</div>);
// LossFrame: concrete "without X, here's what could go wrong" warning. Loss-aversion framing.
const LossFrame = ({ text }) => (<div className="mt-2 p-2.5 bg-red-50 dark:bg-red-500/10 border-l-2 border-red-300 dark:border-red-500/40 rounded text-xs text-red-700 dark:text-red-300 leading-relaxed"><span className="font-bold">⚠ Worst case:</span> {text}</div>);
// RecoveryFrame: emotional positive counterweight — "here's a way forward" for users in a bad spot.
const RecoveryFrame = ({ steps, title = "Here's a way forward" }) => (<div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-500/10 border-l-2 border-emerald-300 dark:border-emerald-500/40 rounded text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed"><div className="font-bold mb-1.5">🌱 {title}</div><ol className="list-decimal ml-4 space-y-1">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol></div>);
// EstimateHelper: "I don't know — estimate this for me" link, filled in via a rule of thumb.
const EstimateHelper = ({ label = "Don't know? Estimate it for me", onEstimate, note }) => (<button onClick={onEstimate} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium mt-0.5 inline-flex items-center gap-1">💡 {label}{note && <span className="text-slate-400 dark:text-[#828b9a] font-normal">({note})</span>}</button>);
// PercentOfIncome: live "X% of income" badge — appears next to spending fields once income > 0.
const PercentOfIncome = ({ value, income, warnAbove }) => { if (!income || income <= 0 || !value) return null; const pct = (value / income) * 100; const tone = warnAbove && pct >= warnAbove ? "text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10" : pct > 30 ? "text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10" : "text-slate-500 dark:text-[#a3acba] bg-slate-50 dark:bg-[#15171c]"; return (<div className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 ${tone}`}>{pct.toFixed(0)}% of income{warnAbove && pct >= warnAbove ? " — high" : ""}</div>); };
// ActionStep: concrete handoff — names a specific tool/bank/action with a one-line how-to.
const ActionStep = ({ step, tool, how }) => (<div className="flex items-start gap-2 text-xs mb-1.5"><span className="shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center">{step}</span><div><div className="font-semibold text-slate-700 dark:text-[#dde3ec]">{tool}</div><div className="text-slate-500 dark:text-[#a3acba]">{how}</div></div></div>);
// ConfidenceLabel: clarifies forecast precision. Forecasts (DCF/NPV/retirement) are not exact math.
const ConfidenceLabel = ({ level = "estimate", note }) => { const cfg = { estimate: { label: "Rough estimate (±25%)", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-200" }, valuation: { label: "Fair-value range (±30%)", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-200" }, illustrative: { label: "Illustrative — actual depends on severity", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-200" }, exact: { label: "Exact calculation", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300" } }; const c = cfg[level] || cfg.estimate; return (<div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${c.bg}`}><span>{c.label}</span>{note && <Tip text={note} />}</div>); };
// AdviceNote: point-of-use "educational, not advice" disclaimer for high-risk modules (signals, options, tax).
const AdviceNote = ({ kind = "financial" }) => { const text = kind === "tax" ? "Educational estimates only — not tax advice. Tax rules vary by situation and change yearly. Confirm with a CPA or tax professional before acting." : kind === "trading" ? "Educational only — not a recommendation to buy or sell. Signals and option values are simplified and can be wrong. You can lose money trading." : "Educational only — not financial advice. Vantage doesn't know your full situation. Verify with a licensed professional before making money decisions."; return (<div className="mb-4 p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"><span aria-hidden="true">⚠</span><span>{text}</span></div>); };
// EmergencyBucket: visual bucket filling up. Months of expenses → 1 to 6 month markers.
const EmergencyBucket = ({ months, target = 6 }) => { const fill = target > 0 ? Math.min(months / target, 1) * 100 : 0; const color = months >= 3 ? "bg-emerald-400" : months >= 1 ? "bg-amber-400" : "bg-red-400"; return (<div className="flex items-end gap-3"><div className="relative w-16 h-24 border-2 border-slate-300 dark:border-[#3a414d] rounded-b-lg overflow-hidden bg-slate-50 dark:bg-[#15171c]"><div className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${color}`} style={{ height: `${fill}%` }} /><div className="absolute top-1/2 left-0 right-0 border-t border-slate-300 dark:border-[#3a414d] border-dashed" /><span className="absolute top-1/2 -mt-2 right-full mr-1 text-xs text-slate-400 dark:text-[#828b9a]">3mo</span></div><div className="text-xs text-slate-600 dark:text-[#c4ccd8]"><div className="font-bold text-slate-700 dark:text-[#dde3ec]">{months.toFixed(1)} of {target} mo</div><div className="text-xs text-slate-500 dark:text-[#a3acba] mt-0.5">{months < 1 ? "Almost empty — top priority" : months < 3 ? "Below minimum" : months < 6 ? "Building" : "Fully stocked"}</div></div></div>); };
// DebtScale: visual scale tipping based on assets vs debts.
const DebtScale = ({ assets, debts }) => { const total = assets + debts; const tilt = total > 0 ? ((assets - debts) / total) * 15 : 0; return (<div className="flex flex-col items-center gap-1"><div className="relative w-44 h-20"><div className="absolute top-8 left-1/2 -translate-x-1/2 w-1 h-12 bg-slate-400 rounded" /><div className="absolute top-8 left-1/2 -translate-x-1/2 origin-top transition-transform duration-700" style={{ transform: `translateX(-50%) rotate(${-tilt}deg)` }}><div className="w-36 h-1 bg-slate-500 rounded -ml-[72px]" /><div className="absolute -top-6 -left-[72px] text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded">${(assets/1000).toFixed(0)}k</div><div className="absolute -top-6 right-[-72px] text-xs font-bold text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">${(debts/1000).toFixed(0)}k</div></div></div><div className="flex gap-12 text-xs text-slate-500 dark:text-[#a3acba]"><span>Assets</span><span>Debts</span></div></div>); };
// SampleBanner: tells users the module is pre-filled with example data they should overwrite.
const SampleBanner = ({ onReset }) => { const [hidden, setHidden] = useState(false); if (hidden) return null; return (<div className="mb-4 p-3 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-lg flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-sky-900 dark:text-sky-200"><span className="text-base">💡</span><span><span className="font-bold">These are example numbers.</span> Replace them with your own to see your real picture.</span></div><div className="flex gap-2 shrink-0">{onReset && <button onClick={onReset} className="text-xs text-sky-700 dark:text-sky-300 hover:text-sky-900 font-semibold border border-sky-300 dark:border-sky-500/40 rounded px-2 py-1">Clear all</button>}<button onClick={() => setHidden(true)} className="text-sky-400 hover:text-sky-700 text-sm">✕</button></div></div>); };

// Coachmark: 3-step inline tour shown on first visit to a module. Click ✕ to dismiss forever.
const Coachmark = ({ steps, dismissed, onDismiss }) => {
  const [step, setStep] = useState(0);
  if (dismissed) return null;
  const s = steps[step];
  return (<div className="mb-4 relative p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg">
    <button onClick={onDismiss} className="absolute top-2 right-2 text-white/70 hover:text-white text-sm">✕ Skip tour</button>
    <div className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Quick tour — step {step + 1} of {steps.length}</div>
    <div className="text-base font-bold mb-1">{s.title}</div>
    <div className="text-sm opacity-90 mb-3">{s.body}</div>
    <div className="flex items-center justify-between">
      <div className="flex gap-1">{steps.map((_, i) => <span key={i} className={`w-6 h-1 rounded-full ${i === step ? "bg-white" : "bg-white/30"}`} />)}</div>
      <div className="flex gap-2">
        {step > 0 && <button onClick={() => setStep(step - 1)} className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded">← Back</button>}
        {step < steps.length - 1 ? <button onClick={() => setStep(step + 1)} className="px-3 py-1 text-xs bg-white text-indigo-700 dark:text-indigo-300 font-bold rounded">Next →</button> : <button onClick={onDismiss} className="px-3 py-1 text-xs bg-white text-indigo-700 dark:text-indigo-300 font-bold rounded">Got it →</button>}
      </div>
    </div>
  </div>);
};

// Glossary search overlay (top-bar invoked). 30 terms; click to nav.
const GLOSSARY = [
  { term: "Net Worth", short: "Everything you own minus everything you owe.", nav: "personal" },
  { term: "DTI (Debt-to-Income)", short: "Monthly debt payments ÷ monthly income. Above 36% = lenders get nervous.", nav: "personal" },
  { term: "Emergency Fund", short: "Cash savings covering 3-6 months of expenses. First financial priority.", nav: "personal" },
  { term: "Savings Rate", short: "% of take-home pay you save each month. 15%+ is strong.", nav: "personal" },
  { term: "Compound Interest", short: "Interest earned on interest. The reason starting early matters more than saving more.", nav: "quick" },
  { term: "Diversification", short: "Spreading money across asset types so one bad bet doesn't wipe you out.", nav: "portfolio" },
  { term: "HHI (Herfindahl Index)", short: "Concentration measure. Under 2,500 = well-diversified portfolio.", nav: "portfolio" },
  { term: "P/E Ratio", short: "Stock price ÷ earnings per share. Lower is cheaper; sector context matters.", nav: "investments" },
  { term: "P/B Ratio", short: "Stock price ÷ book value per share. Under 1 = trading below liquidation value.", nav: "investments" },
  { term: "Yield (YTM)", short: "Total return on a bond if held to maturity, accounting for price + coupons.", nav: "investments" },
  { term: "CAPM", short: "Formula that estimates what return an investment should give given its risk.", nav: "valuation" },
  { term: "WACC", short: "Weighted Average Cost of Capital. The hurdle rate a company must beat.", nav: "valuation" },
  { term: "DCF", short: "Discounted Cash Flow. Estimates a business's value from future cash flows. Rough — ±30%.", nav: "valuation" },
  { term: "NPV", short: "Net Present Value. A project's profit in today's dollars. Positive = worth doing.", nav: "capbudget" },
  { term: "IRR", short: "Internal Rate of Return. The annualized % return of an investment or project.", nav: "capbudget" },
  { term: "Break-Even Point", short: "Sales volume where you stop losing money. Fixed costs ÷ contribution margin.", nav: "breakeven" },
  { term: "Contribution Margin", short: "Price minus variable cost. What each sale contributes to covering fixed costs.", nav: "business" },
  { term: "Capital Gains", short: "Profit from selling an investment. Held >1 year = lower tax rate.", nav: "tax" },
  { term: "Tax-Loss Harvesting", short: "Selling losers to offset gains and reduce your tax bill.", nav: "tax" },
  { term: "401(k) / IRA", short: "Tax-advantaged retirement accounts. Maxing these is usually optimal.", nav: "personal" },
  { term: "Asset Allocation", short: "How your portfolio is split across stocks, bonds, cash, etc.", nav: "portfolio" },
  { term: "Beta", short: "How much a stock moves vs. the market. 1 = same; 2 = twice as volatile.", nav: "investments" },
  { term: "Black-Scholes", short: "Formula that prices options based on strike, time, volatility, and rates.", nav: "options" },
  { term: "Greeks (Delta/Gamma/Theta/Vega)", short: "Sensitivities that measure how option prices respond to changes.", nav: "options" },
  { term: "Bull / Bear Market", short: "Bull = rising 20%+; Bear = falling 20%+ from recent peak.", nav: "market" },
  { term: "Yield Curve", short: "Bond yields by maturity. Inverted (short > long) often precedes recession.", nav: "market" },
  { term: "Inflation", short: "Rate at which prices rise — eats your purchasing power if savings don't keep up.", nav: "market" },
  { term: "Risk Tolerance", short: "How much loss you can stomach without panic-selling. Drives your allocation.", nav: "riskprofile" },
  { term: "Dollar Cost Averaging", short: "Investing a fixed amount on a schedule. Smooths out timing risk.", nav: "investments" },
  { term: "Sharpe Ratio", short: "Return per unit of risk. Higher is better; over 1 is good.", nav: "portfolio" },
];
const GlossarySearch = ({ open, onClose, onNav }) => {
  const [q, setQ] = useState("");
  if (!open) return null;
  const ql = q.toLowerCase();
  const filtered = ql ? GLOSSARY.filter(g => g.term.toLowerCase().includes(ql) || g.short.toLowerCase().includes(ql)) : GLOSSARY;
  return (<div className="fixed inset-0 z-50 bg-slate-900/60 flex items-start justify-center pt-20 p-4" onClick={onClose} onKeyDown={e => e.key === "Escape" && onClose()}>
    <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1c1f26] rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-[#262b33] flex items-center gap-2">
        <span className="text-slate-400 dark:text-[#828b9a]">🔍</span>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search any financial term — DTI, NPV, WACC, beta..." className="bg-white dark:bg-[#1c1f26] flex-1 px-2 py-2 text-base text-slate-800 dark:text-[#eef1f6] outline-none" />
        <button onClick={onClose} aria-label="Close glossary" className="text-slate-500 dark:text-[#a3acba] hover:text-slate-700 px-2 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">✕</button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (<div className="p-6 text-center text-sm text-slate-400 dark:text-[#828b9a]">No matches for "{q}"</div>) :
          filtered.map((g, i) => (<button key={i} onClick={() => { onNav(g.nav); onClose(); }} className="w-full px-4 py-3 text-left hover:bg-indigo-50 border-b border-slate-50 last:border-0">
            <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{g.term}</div>
            <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-0.5">{g.short}</div>
            <div className="text-xs text-indigo-500 mt-1">Open in {g.nav} →</div>
          </button>))}
      </div>
    </div>
  </div>);
};

// ============================================================
// LEGAL TEXT — US-federal + California (CCPA/CPRA) grounded; drafted and
// adversarially reviewed for accuracy/overclaiming. NOT legal advice and NOT a
// substitute for counsel: a licensed attorney must review before any public or
// paid launch (arbitration enforceability, the $100 liability cap under Cal. Civ.
// Code 1668, entity/LLC formation, insurance, RIA/securities status, trademark,
// CCPA applicability thresholds, and clickwrap acceptance for the arbitration opt-out).
// ============================================================
const LEGAL_TEXT = {
  terms: { title: "Terms of Service", lastUpdated: "June 2026",
    body: [
      ["Acceptance of These Terms", "Vantage is an educational personal and small-business finance web app operated by Michael Bishay, an individual based in Los Angeles, California, USA (the \"Operator,\" \"we,\" \"us,\" or \"our\"). By accessing or using Vantage (the \"Service\"), you agree to be bound by these Terms of Service (the \"Terms\"). If you do not agree, please do not use the Service. These Terms form a legally binding agreement between you and the Operator, and they apply every time you use the Service."],
      ["Eligibility and Contractual Capacity", "To use the Service you must have the legal capacity to enter into a binding contract, which generally means you are at least the age of majority in your jurisdiction (18 in California). We do not impose a technical age gate or ask for your age, but by using the Service you represent that you have that capacity. The Service is not directed to children under 13, and we do not knowingly collect information from them, consistent with the Children's Online Privacy Protection Act (COPPA). If you use the Service on behalf of a business, you represent that you are authorized to bind that business to these Terms."],
      ["Educational Use Only \u2014 Not Investment, Tax, or Legal Advice", "Vantage is provided for general educational and informational purposes only. It is NOT a registered investment adviser under the Investment Advisers Act of 1940, NOT a broker-dealer under the Securities Exchange Act of 1934, and is not a bank, insurance agent, CPA, attorney, or tax professional. Nothing in the Service is personalized financial, investment, tax, accounting, or legal advice, an offer or solicitation to buy or sell any security, or a recommendation to take any particular action. The calculations, estimates, and explanations are illustrative tools, not professional guidance \u2014 always consult a qualified, licensed professional before making financial decisions, and you remain solely responsible for your own choices."],
      ["No Fiduciary or Advisory Relationship", "Your use of the Service does not create any fiduciary, advisory, agency, or professional-client relationship between you and the Operator. We owe you no duty of care, loyalty, or best-interest obligation of the kind that a registered adviser, broker, fiduciary, or licensed professional might owe a client. The Service is a self-directed educational tool, and any decisions you make are made independently and at your own risk."],
      ["License to Use and Intellectual Property", "Subject to these Terms, we grant you a limited, personal, non-exclusive, non-transferable, revocable license to access and use the Service for your own personal or internal small-business educational purposes. The Service, including its software, design, text, graphics, and all related content, is owned by the Operator and protected by copyright, trademark, and other intellectual-property laws. \"Vantage\" and any associated logos are marks of the Operator. You retain all rights to the financial inputs and information you enter, and we claim no ownership of your data."],
      ["Acceptable Use and Prohibited Conduct", "You agree to use the Service only for lawful purposes and in accordance with these Terms. You may not: (a) reverse engineer, decompile, copy, scrape, or create derivative works from the Service except as permitted by law; (b) use the Service to violate any law or infringe anyone's rights; (c) interfere with, disrupt, overload, or attempt to gain unauthorized access to the Service or its hosting infrastructure (including GitHub Pages); (d) introduce malware or harmful code; (e) remove or obscure any proprietary notices; or (f) misrepresent the Service's educational outputs as professional advice to others. We may suspend or restrict access if we reasonably believe you have violated this section."],
      ["Your Inputs and No Verification", "Today, Vantage runs entirely in your browser. The financial inputs and other information you enter are processed locally in your browser's memory, are not transmitted to any server we control, and are lost when you close or refresh the tab \u2014 we use no cookies, no localStorage, no analytics, and no tracking. Because the Service performs automated calculations on the numbers you provide, its outputs are only as accurate as your inputs and our assumptions; we do not independently verify, audit, or validate any data you enter or any result the Service produces. You are responsible for checking the accuracy and suitability of all inputs and outputs before relying on them."],
      ["Third-Party Services \u2014 BYOK AI (Anthropic)", "The Service offers an optional \"bring your own key\" (BYOK) AI feature. If you choose to use it, you supply your own Anthropic API key, and both that key and the work-description you type are sent directly from your browser to Anthropic's API (api.anthropic.com); that exchange is governed by Anthropic's own terms and policies, not ours. We operate no backend and store nothing \u2014 we never receive, store, or have access to your API key or those prompts, and any charges Anthropic bills against your key are solely between you and Anthropic. Your use of any third-party service, including Anthropic, is at your own risk and subject to that provider's terms, and we are not responsible for third-party services, their availability, or their charges to you."],
      ["Disclaimer of Warranties (\"AS IS\")", "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE,\" WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. TO THE FULLEST EXTENT PERMITTED BY LAW, THE OPERATOR DISCLAIMS ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT. We do not warrant that the Service will be uninterrupted, error-free, secure, or that its calculations, estimates, or content are accurate, complete, current, or reliable for your situation. Some jurisdictions do not allow the exclusion of certain warranties, so some of these exclusions may not apply to you."],
      ["Limitation of Liability", "TO THE FULLEST EXTENT PERMITTED BY LAW, THE OPERATOR WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOST PROFITS, LOST SAVINGS, LOST DATA, OR INVESTMENT, TAX, OR BUSINESS LOSSES, ARISING OUT OF OR RELATING TO YOUR USE OF (OR INABILITY TO USE) THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY. Because the Service is provided free of charge, the Operator's total aggregate liability for all claims relating to the Service will not exceed one hundred U.S. dollars (USD $100.00). These limitations apply regardless of the legal theory and form the basis of the bargain between you and the Operator; some jurisdictions do not allow certain limitations, so parts of this section may not apply to you."],
      ["Indemnification", "You agree to indemnify, defend, and hold harmless the Operator from and against any claims, demands, losses, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) your use or misuse of the Service; (b) your violation of these Terms or any applicable law; (c) your infringement of any third-party right, including your use of any third-party service such as Anthropic via the BYOK feature; or (d) any decision you make in reliance on the Service. We reserve the right to assume the exclusive defense of any matter subject to indemnification, in which case you agree to cooperate with us."],
      ["Termination", "You may stop using the Service at any time. We may modify, suspend, or discontinue the Service (in whole or in part), or restrict your access, at any time and without notice, for any reason, including if you violate these Terms. Because your data lives only in your browser, ending your use simply means closing the tab; no account exists to delete. Sections that by their nature should survive termination \u2014 including intellectual property, disclaimers, limitation of liability, indemnification, and dispute resolution \u2014 will continue to apply."],
      ["Changes to the Service and to These Terms", "We may update these Terms from time to time. When we do, we will revise the \"Last updated\" date above, and the updated Terms take effect when posted. Your continued use of the Service after changes are posted means you accept the revised Terms, so please review them periodically. We may also add, change, or remove features over time \u2014 including the planned future, opt-in backend that would let users persist their data across sessions (encrypted in transit and at rest); that backend does not exist today, this language is forward-looking only, and any such feature would be accompanied by its own updated terms and notice."],
      ["Dispute Resolution, Binding Arbitration, and Your Right to Opt Out", "Please read this section carefully \u2014 it affects how disputes are resolved. Except for the carve-outs below, you and the Operator agree that any dispute, claim, or controversy arising out of or relating to the Service or these Terms will be resolved by final and binding individual arbitration administered by the American Arbitration Association under its Consumer Arbitration Rules, seated in Los Angeles County, California, rather than in court. You and the Operator each waive any right to a jury trial and agree that claims may be brought only in an individual capacity and not as a plaintiff or class member in any class, collective, or representative proceeding (the \"class-action waiver\"). As carve-outs, either party may bring an individual claim in a small-claims court with jurisdiction, and either party may seek injunctive or equitable relief in court to protect intellectual-property rights; if the class-action waiver is found unenforceable as to any claim, that claim (and only that claim) will proceed in court. YOUR RIGHT TO OPT OUT: you may opt out of this arbitration agreement and class-action waiver by emailing bishay8@gmail.com within 30 days of first accepting these Terms, stating your name and that you opt out of arbitration; if you opt out, disputes proceed in the courts identified in the Governing Law and Venue section, and opting out does not affect any other part of these Terms. Nothing here prevents you from contacting us first to try to resolve a dispute informally, which we encourage."],
      ["Governing Law and Venue", "These Terms and any dispute arising out of or relating to them or the Service are governed by the laws of the State of California, USA, without regard to its conflict-of-laws principles. Subject to the arbitration provision above, you and the Operator agree that any claim not subject to arbitration (including small-claims and injunctive-relief matters, and any claim if you have validly opted out of arbitration) will be brought exclusively in the state or federal courts located in Los Angeles County, California, and you consent to the personal jurisdiction and venue of those courts."],
      ["Severability, Waiver, Assignment, and Entire Agreement", "If any provision of these Terms is found unenforceable, that provision will be limited or removed to the minimum extent necessary, and the remaining provisions will stay in full force. Our failure to enforce any right or provision is not a waiver of it. You may not assign or transfer these Terms without our consent, but we may assign them in connection with a transfer of the Service. These Terms, together with our Privacy Policy and Financial Disclaimer, constitute the entire agreement between you and the Operator regarding the Service and supersede any prior understandings on the subject. Questions about these Terms may be directed to Michael Bishay at bishay8@gmail.com."],
    ] },
  privacy: { title: "Privacy Policy", lastUpdated: "June 2026",
    body: [
      ["Who We Are and What This Policy Covers", "Vantage is an educational personal and small-business finance web app operated by Michael Bishay, a solo individual based in Los Angeles, California. The app is a single-page React site served as a static page on GitHub Pages. This Privacy Policy explains, in plain English, how Vantage handles information today and what we plan for the future. By using Vantage, you agree to this policy; if you do not agree, please do not use the Service."],
      ["The Short Version: Your Data Stays in Your Browser", "Vantage has no backend server of its own, and the numbers and details you enter never leave your device to reach us. Everything you type runs entirely in your browser's memory, is used only to do the calculations you asked for, and is gone the moment you close or refresh the tab. We do not collect, store, sell, share, or transmit your financial inputs. There is no account to create and nothing for us to keep."],
      ["What We Collect Today: Nothing", "As of the date above, Vantage collects no categories of personal information as defined under the California Consumer Privacy Act, as amended by the California Privacy Rights Act (CCPA/CPRA, Cal. Civ. Code 1798.100 et seq.). We do not collect identifiers, financial information, commercial information, internet activity, geolocation, professional or employment information, inferences, or any sensitive personal information. Because the app is static and has no server receiving your data, none of these categories are gathered, retained, or processed by us. The only data involved is what you type, and that lives solely in your own browser."],
      ["No Cookies, No Analytics, No Tracking", "Vantage sets no cookies and uses no localStorage, sessionStorage, or similar persistent storage to hold your information. We run no analytics, telemetry, advertising pixels, fingerprinting, or third-party trackers, and we do not build profiles about you. We do not track you across websites or over time. Note that GitHub, as our static host, may log basic technical request data (such as IP addresses) as part of serving any website; that processing is governed by GitHub's own privacy practices, not ours, and we do not access, receive, or use it."],
      ["Optional AI Feature: Bring Your Own Anthropic Key (BYOK)", "Vantage offers an optional AI feature that works only if you choose to supply your own Anthropic API key. When you use it, your API key and the work-description you type are sent directly from your browser to Anthropic's API at api.anthropic.com; they do not pass through any Vantage server, because we have none. That data flow is governed by Anthropic's terms and privacy practices, not ours. We do not store your API key or your prompts, and the key stays in browser memory only until you close or refresh the tab. Please avoid entering sensitive personal details into the AI work-description field."],
      ["Your California Privacy Rights (CCPA/CPRA)", "If you are a California resident, the CCPA/CPRA gives you the right to know and access the personal information a business has about you, to delete it, to correct inaccurate information, to opt out of its sale or sharing, to limit the use and disclosure of sensitive personal information, and not to be discriminated or retaliated against for exercising these rights. Vantage respects all of these rights. Because we collect and store nothing about you today, in practice there is currently nothing on our side to access, delete, or correct, and nothing to opt out of selling or sharing. We will treat any rights request you send in good faith and respond as the law requires."],
      ["How to Exercise Your Rights (and Authorized Agents)", "To make any privacy request, email Michael Bishay at bishay8@gmail.com and tell us which right you want to exercise. We may need to verify that the request relates to you before acting, though as noted we hold no data to match against today. You may use an authorized agent to submit a request on your behalf; the agent should provide proof of your written permission, and we may still ask you to verify your own identity directly. We aim to respond within the timeframes set by the CCPA/CPRA (generally within 45 days, extendable by another 45 days when reasonably necessary, with notice to you)."],
      ["We Do Not Sell or Share Personal Information", "Vantage does not sell your personal information, and we do not share it for cross-context behavioral advertising, as those terms are defined under the CCPA/CPRA. We have not sold or shared personal information in the preceding 12 months, and we have no business model that depends on doing so. We also do not collect or use sensitive personal information at all today. Because no data leaves your browser to reach us, there is nothing for us to sell or share in the first place."],
      ["California 'Shine the Light'", "Under California's 'Shine the Light' law (Cal. Civ. Code 1798.83), California residents may ask a business once per year about personal information it disclosed to third parties for those third parties' own direct-marketing purposes. Vantage does not disclose any personal information to third parties for their direct marketing, so there is nothing to report. If you would like written confirmation of this, email bishay8@gmail.com and we will provide it."],
      ["Global Privacy Control and Do-Not-Track Signals", "Some browsers and extensions send a Global Privacy Control (GPC) or Do-Not-Track signal to indicate you do not want your information sold or shared. Vantage already does not sell or share personal information and does not track users, so there is no selling or sharing for such a signal to stop, and no opt-out you need to make today. If our practices ever change to involve selling or sharing personal information, we will treat a valid GPC signal as a request to opt out, as the CCPA/CPRA requires."],
      ["Data Retention", "We retain no personal information, because we do not collect or store any. Anything you enter exists only in your browser's memory and is automatically discarded when you close or refresh the tab; there is no server-side copy and no backup. We keep no logs of your inputs, your AI prompts, or your API key. If a future version of Vantage offers optional storage, we will publish specific retention periods before that feature launches."],
      ["Data Security", "Because your inputs never leave your device to reach us, the most important security boundary is your own browser and computer, which you should keep current and protected. Connections to GitHub Pages and, for the optional AI feature, to Anthropic's API are made over encrypted HTTPS. No method of transmission or processing is ever perfectly secure, and we cannot guarantee absolute security. We make no claim to be GLBA-compliant, SOC 2 certified, or attorney-reviewed; we simply describe honestly how the app works today."],
      ["Children Under 13", "Vantage is an educational tool intended for a general adult audience and is not directed to children under 13. Consistent with the Children's Online Privacy Protection Act (COPPA), we do not knowingly collect personal information from children under 13, and in any case we collect no personal information from anyone today. If you believe a child under 13 has somehow provided personal information in connection with the Service, contact bishay8@gmail.com and we will address it promptly."],
      ["Not Financial, Tax, or Legal Advice", "Vantage is educational only and provides no personalized financial, investment, tax, or legal advice. It is not a registered investment adviser, broker-dealer, bank, insurance agent, CPA, attorney, or tax professional, and nothing it produces is a recommendation to buy, sell, or hold any security or to take any specific financial action. We are not registered under the Investment Advisers Act of 1940, the Securities Exchange Act of 1934, or any comparable law, and we hold no such license or registration. Always consult a qualified professional before making financial decisions; see our separate Financial Disclaimer for more."],
      ["Looking Ahead: An Optional, Opt-In Backend (Forward-Looking)", "The following describes a planned future feature that does not exist yet and may change. We are exploring an optional backend, designed to be evaluated against the SOC 2 Type 2 framework, that would let you choose to save your data across sessions instead of losing it on refresh. If we build it, saving your data would be strictly opt-in and require your explicit, informed consent, and the data would be encrypted in transit and at rest. This forward-looking plan is not a promise of any specific certification, security outcome, or timeline, and none of it is live today. We will update this Privacy Policy with full details before any such feature ships, so that this document always describes the app's actual, current reality."],
      ["Changes to This Policy", "We may update this Privacy Policy from time to time, for example if we add the optional backend described above or change how the app works. When we do, we will revise the 'Last updated' date at the top, and material changes will be reflected here before the related feature goes live. Because the app keeps no account and sends you no email, the current version posted on this page is always the controlling one, so please review it periodically. Your continued use of Vantage after an update means you accept the revised policy."],
      ["Contact Us", "Vantage is operated by Michael Bishay, a solo individual located in Los Angeles, California, USA. For any privacy question, rights request, or concern, email bishay8@gmail.com. This Privacy Policy is governed by the laws of the State of California, USA."],
    ] },
  disclaimer: { title: "Financial Disclaimer", lastUpdated: "June 2026",
    body: [
      ["Educational Tool, Not Advice", "Vantage is an educational tool built to help you understand personal and small-business finance in plain English. Nothing it shows you is financial, tax, investment, insurance, accounting, or legal advice, and nothing here is an offer, solicitation, or recommendation to buy, sell, or hold any security or to pursue any strategy. Before you make a real money decision, talk to a qualified, licensed professional who knows your situation. Vantage is operated by Michael Bishay, a solo individual in Los Angeles, California; you can reach him at bishay8@gmail.com."],
      ["Not a Registered Adviser or Broker-Dealer", "Vantage is not a registered investment adviser, broker-dealer, bank, insurance agent, CPA, or attorney, and it holds no such licenses or registrations. It does not provide advisory or brokerage services within the meaning of the Investment Advisers Act of 1940 or the Securities Exchange Act of 1934. Any output that resembles a \"recommendation\" or a \"Do This Next\" prompt is a general educational illustration, not personalized investment advice from a licensed professional."],
      ["Estimates, Not Guarantees", "Every projection the Service produces \u2014 retirement balances, DCF and NPV valuations, Monte Carlo outcomes, stress-test scores, and the like \u2014 is an estimate. Each one depends entirely on the numbers you type in and the assumptions baked into the underlying formula. Change an input or an assumption and the answer changes, sometimes a lot. Real-world outcomes will differ from these figures, and you should treat them as rough sanity checks, never as promises."],
      ["Past Performance Is Not Future Results", "Where the Service uses historical market figures \u2014 for example a \"7% annual stock return\" or \"15% volatility\" \u2014 these are long-run averages drawn from the past. Past performance is not indicative of future results. Your actual returns over any given period, especially a short one, will deviate from these averages and can be negative. No model in Vantage can predict what markets will actually do."],
      ["No Personalization", "Vantage does not know your full financial picture. Its calculations and suggestions rest on general rules of thumb and only the data you choose to enter \u2014 not on your complete circumstances, including your overall tax position, debts, family obligations, health, time horizon, goals, or true risk tolerance. A rule of thumb that fits the average person may be wrong for you. Treat every output as a starting point for your own research and a conversation with a professional."],
      ["Tax Information Is Simplified", "Tax rules vary by jurisdiction, change from year to year, and carry countless exceptions, phase-outs, and special cases. Any tax-related figure in the Service uses simplified, generalized assumptions and may not reflect current law or your specific situation. It is not a substitute for advice from a CPA, enrolled agent, or tax attorney. Confirm anything tax-related with a qualified tax professional before you act on it."],
      ["Investment Risk, Including Loss of Principal", "All investing carries risk, including the risk of losing some or all of the money you put in. Higher expected returns generally come with higher risk and bigger swings, and certain instruments such as options can lose their entire value quickly. Vantage cannot remove this risk; at most it can help you see and think about it. Diversification and stress-testing can reduce risk but never eliminate it."],
      ["No Fiduciary Duty", "Using Vantage does not create any fiduciary, advisory, agency, or other special relationship between you and its operator. Vantage owes you no duty of loyalty or care of the kind a registered investment adviser or fiduciary owes a client, because it provides no personalized advice and is not acting on your behalf. The Service is informational software you operate yourself, not a professional you have engaged."],
      ["Your Decisions, Your Responsibility", "You use Vantage at your own risk and bear full responsibility for any decision you make using it. To the maximum extent permitted by California law, the operator accepts no liability for losses arising from your reliance on the Service or its output, and any liability that cannot be excluded is limited as described in the Terms of Service. The Service is provided \"as is,\" without warranties of any kind, and may contain errors or out-of-date information. If you do not agree to bear this responsibility, do not rely on the Service."],
      ["Governing Law and Contact", "This Disclaimer is governed by the laws of the State of California, USA, without regard to its conflict-of-laws rules, and should be read together with Vantage's Terms of Service and Privacy Policy. Vantage is not directed to children under 13, consistent with the Children's Online Privacy Protection Act (COPPA). California residents retain their rights under the California Consumer Privacy Act as amended by the CPRA (Cal. Civ. Code 1798.100 et seq.) and the \"Shine the Light\" law (Cal. Civ. Code 1798.83); see the Privacy Policy for details, noting that Vantage today collects no personal data. Questions: bishay8@gmail.com."],
    ] },
};
const LegalModal = ({ which, onClose }) => {
  if (!which) return null;
  const doc = LEGAL_TEXT[which];
  if (!doc) return null;
  return (<div className="fixed inset-0 z-[60] bg-slate-900/70 flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={onClose} onKeyDown={e => e.key === "Escape" && onClose()}>
    <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1c1f26] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden mb-12">
      {/* NOTE TO DEV: Terms/Privacy/Disclaimer are real US-federal + California (CCPA/CPRA)-grounded copy, drafted and adversarially reviewed — but STILL require a licensed attorney's review before any public/paid launch (arbitration enforceability, the $100 liability cap under Civ. Code 1668, entity formation, insurance, RIA/securities status, trademark, CCPA thresholds, clickwrap acceptance). Not legal advice. */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-[#262b33] flex items-center justify-between sticky top-0 bg-white dark:bg-[#1c1f26]">
        <div><h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">{doc.title}</h3><p className="text-xs text-slate-500 dark:text-[#a3acba] mt-0.5">Last updated: {doc.lastUpdated}</p></div>
        <button onClick={onClose} aria-label={`Close ${doc.title}`} onKeyDown={e => e.key === "Escape" && onClose()} className="text-slate-500 dark:text-[#a3acba] hover:text-slate-700 text-lg rounded outline-none focus:ring-2 focus:ring-indigo-400">✕</button>
      </div>
      <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
        {doc.body.map(([h, p], i) => (<div key={i} className="mb-4 last:mb-0">
          <h4 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-1">{i + 1}. {h}</h4>
          <p className="text-xs text-slate-600 dark:text-[#c4ccd8] leading-relaxed">{p}</p>
        </div>))}
      </div>
    </div>
  </div>);
};

// Assumptions: a collapsible "How we calculate this" panel for transparency.
// Each module's formulas and assumptions are documented here, viewable on demand.
const Assumptions = ({ items, title = "How we calculate this" }) => {
  const [open, setOpen] = useState(false);
  return (<div className="mt-6 border border-slate-200 dark:border-[#323844] rounded-xl bg-slate-50 dark:bg-[#15171c]">
    <button onClick={() => setOpen(!open)} className="w-full px-4 py-3 flex items-center justify-between text-left">
      <div className="flex items-center gap-2"><span className="text-base">📐</span><span className="text-sm font-bold text-slate-700 dark:text-[#dde3ec]">{title}</span><span className="text-xs text-slate-400 dark:text-[#828b9a]">(transparency — see exactly what's assumed)</span></div>
      <span className="text-slate-400 dark:text-[#828b9a] text-sm">{open ? "▲" : "▼"}</span>
    </button>
    {open && (<div className="px-4 pb-4 border-t border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26]">
      <p className="text-xs text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded px-2 py-1 my-3">⚠ These calculations are estimates. Real-world results depend on inputs and assumptions that may not match your situation. Treat outputs as educational, not as advice.</p>
      {items.map((item, i) => (<div key={i} className="mb-3 last:mb-0">
        <div className="text-xs font-bold text-slate-700 dark:text-[#dde3ec] mb-1">{item.formula}</div>
        <div className="text-xs text-slate-600 dark:text-[#c4ccd8] mb-1">{item.what}</div>
        {item.assumptions && <ul className="text-xs text-slate-500 dark:text-[#a3acba] list-disc ml-4 space-y-0.5">{item.assumptions.map((a, j) => <li key={j}>{a}</li>)}</ul>}
        {item.source && <div className="text-xs text-slate-400 dark:text-[#828b9a] mt-1 italic">Source: {item.source}</div>}
      </div>))}
    </div>)}
  </div>);
};

// ============================================================
// LOCALE / REGIONS — currency, account types, median benchmarks per region.
// ============================================================
const LOCALES = {
  US: { code: "US", flag: "🇺🇸", currency: "$", currencyCode: "USD", retirementAccount: "401(k) / IRA", medianNetWorth: 192000, medianIncome: 6977, taxAdvAcct: "401(k)" },
  CA: { code: "CA", flag: "🇨🇦", currency: "C$", currencyCode: "CAD", retirementAccount: "RRSP / TFSA", medianNetWorth: 329000, medianIncome: 5800, taxAdvAcct: "RRSP" },
  UK: { code: "UK", flag: "🇬🇧", currency: "£", currencyCode: "GBP", retirementAccount: "SIPP / ISA", medianNetWorth: 305000, medianIncome: 2900, taxAdvAcct: "SIPP" },
  EU: { code: "EU", flag: "🇪🇺", currency: "€", currencyCode: "EUR", retirementAccount: "Pillar 3 / pension", medianNetWorth: 250000, medianIncome: 3200, taxAdvAcct: "Pension" },
  AU: { code: "AU", flag: "🇦🇺", currency: "A$", currencyCode: "AUD", retirementAccount: "Super", medianNetWorth: 281000, medianIncome: 5400, taxAdvAcct: "Super" },
};
const LocaleSwitcher = ({ locale, onChange }) => (<select value={locale} onChange={e => onChange(e.target.value)} className="text-xs bg-slate-100 dark:bg-[#232730] hover:bg-slate-200 rounded-lg px-2 py-1.5 outline-none cursor-pointer">{Object.values(LOCALES).map(l => <option key={l.code} value={l.code}>{l.flag} {l.code}</option>)}</select>);

// PlaidStub: aspirational UI showing what bank-account aggregation will look like once SOC 2 backend is live.
const PlaidStub = ({ open, onClose }) => { if (!open) return null; return (<div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === "Escape" && onClose()}><div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1c1f26] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"><div className="p-6"><h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mb-1">🏦 Connect Your Bank</h3><p className="text-xs text-slate-500 dark:text-[#a3acba] mb-4">Stop typing in numbers — let Vantage read live balances and transactions from your bank, broker, and credit card.</p><div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-900 dark:text-amber-200"><div className="font-bold mb-1">⚠ Backend required</div>This needs the SOC 2 Type 2 server to talk to Plaid securely. Coming with the backend rollout — your interest is recorded.</div><div className="space-y-2 mb-4 opacity-50 pointer-events-none">{["Chase", "Wells Fargo", "Fidelity", "Robinhood", "Coinbase"].map(b => <div key={b} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg text-sm"><span>{b}</span><span className="text-xs text-slate-400 dark:text-[#828b9a]">Connect →</span></div>)}</div><button onClick={onClose} className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Got it — notify me when this lands</button></div></div></div>); };

// ReminderStub: aspirational reminder-loop UI. Stores the intent locally; backend will send emails/push.
const ReminderStub = ({ open, onClose }) => { const [days, setDays] = useState(30); const [channel, setChannel] = useState("email"); const [done, setDone] = useState(false); if (!open) return null; return (<div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === "Escape" && onClose()}><div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1c1f26] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden p-6">{done ? (<><h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-1">✓ Reminder set</h3><p className="text-xs text-slate-500 dark:text-[#a3acba] mb-4">We'll {channel === "email" ? "email" : "push-notify"} you in {days} days to check in on your finances. (Coming with the backend rollout.)</p><button onClick={() => { setDone(false); onClose(); }} className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Done</button></>) : (<><h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mb-1">⏰ Set a Reminder</h3><p className="text-xs text-slate-500 dark:text-[#a3acba] mb-4">Beginners forget to update their numbers. Let us nudge you.</p><label className="text-xs font-semibold text-slate-600 dark:text-[#c4ccd8] block mb-1">Remind me in</label><div className="flex gap-2 mb-3">{[7, 14, 30, 90].map(d => <button key={d} onClick={() => setDays(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${days === d ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#c4ccd8] hover:bg-slate-200"}`}>{d} days</button>)}</div><label className="text-xs font-semibold text-slate-600 dark:text-[#c4ccd8] block mb-1">Via</label><div className="flex gap-2 mb-4">{[["email", "📧 Email"], ["push", "🔔 Push"]].map(([k, l]) => <button key={k} onClick={() => setChannel(k)} className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium ${channel === k ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#c4ccd8] hover:bg-slate-200"}`}>{l}</button>)}</div><div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-2.5 mb-4 text-xs text-amber-900 dark:text-amber-200">Backend required — your preference is queued for when the email/push service is live.</div><div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2 bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#c4ccd8] text-sm font-medium rounded-lg hover:bg-slate-200">Cancel</button><button onClick={() => setDone(true)} className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Set Reminder</button></div></>)}</div></div>); };

// ============================================================
// PROFESSION-AWARE CUSTOM CATEGORIES
// 8 pre-canned templates + Claude API generator. Lets users replace generic
// line items with categories specific to their work.
// ============================================================
const PROFESSION_TEMPLATES = [
  {
    id: "3pl", label: "3PL / Logistics Operator", emoji: "📦",
    desc: "Warehouse, freight, distribution",
    assets: [
      { key: "accountsReceivable", label: "Accounts Receivable", placeholder: "e.g. $80,000", hint: "Open invoices from shipper clients" },
      { key: "warehouseDeposit", label: "Warehouse Lease Deposits", placeholder: "e.g. $15,000", hint: "Security deposits on lease space" },
      { key: "equipmentValue", label: "Forklifts, Racking, Dock", placeholder: "e.g. $120,000", hint: "Depreciated value of moving equipment" },
      { key: "fleetValue", label: "Delivery Fleet", placeholder: "e.g. $200,000", hint: "Vehicles you own outright" },
      { key: "techStack", label: "WMS / TMS Software", placeholder: "e.g. $25,000", hint: "Capitalized software cost" },
      { key: "operatingBuffer", label: "30-60 Day Cash Buffer", placeholder: "e.g. $50,000", hint: "Payroll + utilities runway" },
    ],
    liabilities: [
      { key: "equipmentLoans", label: "Equipment Financing", placeholder: "e.g. $80,000", hint: "Forklift / racking loans" },
      { key: "leaseObligation", label: "Annual Lease Obligation", placeholder: "e.g. $180,000", hint: "Year remaining on warehouse lease" },
      { key: "carrierPayables", label: "Carrier Payables", placeholder: "e.g. $25,000", hint: "Owed to trucking partners" },
      { key: "creditLine3pl", label: "Working Capital Line", placeholder: "e.g. $50,000", hint: "Drawn balance on operating LOC" },
      { key: "vehicleLoans3pl", label: "Fleet Loans", placeholder: "e.g. $120,000", hint: "Balance on delivery vehicles" },
    ],
    expenses: [
      { key: "warehouseRent", label: "Warehouse Rent", placeholder: "e.g. $15,000", hint: "$4-10/sqft annually typical" },
      { key: "warehouseLabor", label: "Labor (W2 + 1099)", placeholder: "e.g. $80,000", hint: "Pickers, drivers, supervisors" },
      { key: "fuelDiesel", label: "Fuel / Diesel", placeholder: "e.g. $25,000", hint: "Largest variable cost — track per route" },
      { key: "cargoInsurance", label: "Cargo + Liability Insurance", placeholder: "e.g. $8,000", hint: "Includes workers comp" },
      { key: "warehouseUtilities", label: "Electric / HVAC", placeholder: "e.g. $12,000", hint: "Cold storage runs much higher" },
      { key: "techSubs3pl", label: "WMS / TMS / EDI Subs", placeholder: "e.g. $2,500", hint: "Per-user SaaS pricing" },
      { key: "fleetMaintenance", label: "Fleet Maintenance", placeholder: "e.g. $6,000", hint: "Tires, oil, brakes, DOT inspections" },
      { key: "warehouseSecurity", label: "Security (alarms, guards)", placeholder: "e.g. $1,500", hint: "Camera systems + monitoring" },
      { key: "packagingSupplies", label: "Pallets, Wrap, Labels", placeholder: "e.g. $3,000", hint: "Track per shipment" },
      { key: "payrollServices3pl", label: "Payroll Services", placeholder: "e.g. $1,200", hint: "ADP, Gusto, 1099 fees" },
    ],
  },
  {
    id: "evdealer", label: "Used EV / Auto Dealer", emoji: "🚗",
    desc: "Pre-owned electric or gas vehicle sales",
    assets: [
      { key: "inventoryValue", label: "Vehicle Inventory (NADA)", placeholder: "e.g. $400,000", hint: "Wholesale value of cars on lot" },
      { key: "floorPlanCapacity", label: "Available Floor Plan", placeholder: "e.g. $200,000", hint: "Unused floor-plan credit" },
      { key: "lotImprovements", label: "Lot Signage & Lighting", placeholder: "e.g. $30,000", hint: "Capitalized improvements" },
      { key: "reconEquipment", label: "Recon / Detail Equipment", placeholder: "e.g. $40,000", hint: "Includes EV battery diagnostic tools" },
      { key: "crmListings", label: "CRM + Online Listings", placeholder: "e.g. $5,000", hint: "Annual CRM + listing platform credits" },
      { key: "operatingBufferEv", label: "Cash for Reconditioning", placeholder: "e.g. $30,000", hint: "Per-car $300-700 typical" },
    ],
    liabilities: [
      { key: "floorPlanDebt", label: "Floor Plan Balance", placeholder: "e.g. $300,000", hint: "Outstanding wholesale financing" },
      { key: "lotLeaseObligation", label: "Lot Lease (year remaining)", placeholder: "e.g. $96,000", hint: "Total remaining on lease" },
      { key: "dmvFeesOwed", label: "DMV Fees Pending", placeholder: "e.g. $4,000", hint: "Title transfer fees owed" },
      { key: "vendorPayablesEv", label: "Recon Vendor Payables", placeholder: "e.g. $8,000", hint: "Detailers, mechanics owed" },
      { key: "dealerLOC", label: "Working Capital LOC", placeholder: "e.g. $50,000", hint: "Operating line balance" },
    ],
    expenses: [
      { key: "lotRent", label: "Lot Rent", placeholder: "e.g. $8,000", hint: "Monthly land lease" },
      { key: "floorPlanInterest", label: "Floor Plan Interest", placeholder: "e.g. $3,500", hint: "Currently 8-12% APR typical" },
      { key: "reconPerCar", label: "Reconditioning (avg/car)", placeholder: "e.g. $4,000", hint: "Detail + minor repair budget" },
      { key: "batteryDiagnostics", label: "EV Battery Health Checks", placeholder: "e.g. $1,000", hint: "Per-car SOH report cost" },
      { key: "advertisingEv", label: "CarGurus / AutoTrader / FB", placeholder: "e.g. $3,500", hint: "Listings + lead acquisition" },
      { key: "salesCommissions", label: "Sales Commissions", placeholder: "e.g. $12,000", hint: "~25-30% of front-end gross" },
      { key: "dealerInsurance", label: "Dealer Bond + Garage Insur.", placeholder: "e.g. $1,500", hint: "Bond + garage liability" },
      { key: "dmvPerCar", label: "DMV Registration Fees", placeholder: "e.g. $1,800", hint: "Title + reg, varies by state" },
      { key: "auctionTransport", label: "Auction Transport", placeholder: "e.g. $2,500", hint: "Wholesale pickup costs" },
      { key: "chargerUpkeep", label: "DC Fast Charger Upkeep", placeholder: "e.g. $500", hint: "On-lot charging infrastructure" },
    ],
  },
  {
    id: "saas", label: "SaaS Founder", emoji: "💻",
    desc: "B2B or B2C software business",
    assets: [
      { key: "arrValue", label: "ARR (12 × MRR)", placeholder: "e.g. $240,000", hint: "Annual run rate from current MRR" },
      { key: "cashRunway", label: "Bank Cash", placeholder: "e.g. $120,000", hint: "12-18 months runway is healthy" },
      { key: "deferredAsset", label: "Prepaid Customer Balances", placeholder: "e.g. $30,000", hint: "Annual prepays from customers" },
      { key: "devEquipment", label: "Laptops + Dev Infra", placeholder: "e.g. $20,000", hint: "Hardware + capitalized infra" },
      { key: "ipDomains", label: "Domains + IP + Trademarks", placeholder: "e.g. $5,000", hint: "Acquired brand assets" },
      { key: "founderEquity", label: "Founder Equity Value", placeholder: "e.g. $0", hint: "If priced round closed" },
    ],
    liabilities: [
      { key: "deferredRevenue", label: "Deferred Revenue", placeholder: "e.g. $30,000", hint: "Service owed to prepaid customers" },
      { key: "contractorOwed", label: "Contractor Payables", placeholder: "e.g. $8,000", hint: "Open invoices from contractors" },
      { key: "businessCardDebt", label: "Business Credit Card", placeholder: "e.g. $5,000", hint: "Current month accrual" },
      { key: "safeNotes", label: "SAFE / Convertible Notes", placeholder: "e.g. $0", hint: "Outstanding investor notes" },
      { key: "vendorPrepays", label: "Refund Liability", placeholder: "e.g. $0", hint: "Owed back if customers churn" },
    ],
    expenses: [
      { key: "infraCost", label: "AWS / Vercel / Postgres", placeholder: "e.g. $1,500", hint: "Compute + storage + DB" },
      { key: "apiCosts", label: "AI APIs (Anthropic/OpenAI)", placeholder: "e.g. $800", hint: "Largest cost for AI-first SaaS" },
      { key: "saasTooling", label: "Linear/Notion/Figma/etc", placeholder: "e.g. $400", hint: "Internal team tools" },
      { key: "contractorsSaas", label: "Dev / Design Contractors", placeholder: "e.g. $5,000", hint: "Hourly + project work" },
      { key: "marketingSpendSaas", label: "Ads / SEO / Content", placeholder: "e.g. $2,000", hint: "CAC depends heavily on channel" },
      { key: "legalAccounting", label: "Lawyer + Accountant", placeholder: "e.g. $800", hint: "Corp filings + bookkeeping" },
      { key: "stripeFees", label: "Stripe Processing", placeholder: "e.g. $700", hint: "2.9% + $0.30 per charge" },
      { key: "founderSalary", label: "Founder Salary", placeholder: "e.g. $0", hint: "Most pre-revenue founders pay $0" },
      { key: "compliance", label: "SOC 2 / Insurance", placeholder: "e.g. $400", hint: "Audits + E&O policy" },
      { key: "officeSpace", label: "Coworking / Home Office", placeholder: "e.g. $300", hint: "WeWork or home office allocation" },
    ],
  },
  {
    id: "rei", label: "Real Estate Investor", emoji: "🏠",
    desc: "Rental property portfolio",
    assets: [
      { key: "rental1Value", label: "Rental Property #1 Value", placeholder: "e.g. $500,000", hint: "Current market value" },
      { key: "rental2Value", label: "Rental Property #2 Value", placeholder: "e.g. $0", hint: "Add as you acquire more" },
      { key: "capexReserves", label: "CapEx / Repair Reserves", placeholder: "e.g. $25,000", hint: "Roof, HVAC, water heater fund" },
      { key: "depositsHeld", label: "Tenant Security Deposits", placeholder: "e.g. $8,000", hint: "Some states require separate accounts" },
      { key: "llcCash", label: "LLC Operating Account", placeholder: "e.g. $30,000", hint: "Per-property entity cash" },
      { key: "maintenanceTools", label: "Tools / Equipment", placeholder: "e.g. $5,000", hint: "If you DIY repairs" },
    ],
    liabilities: [
      { key: "mortgage1Balance", label: "Mortgage #1 Balance", placeholder: "e.g. $350,000", hint: "Current principal balance" },
      { key: "mortgage2Balance", label: "Mortgage #2 Balance", placeholder: "e.g. $0", hint: "Adds when you finance another" },
      { key: "helocBalance", label: "HELOC Drawn Balance", placeholder: "e.g. $0", hint: "Useful for cash-out flexibility" },
      { key: "propTaxOwed", label: "Property Taxes Due", placeholder: "e.g. $4,000", hint: "Accrued but not yet paid" },
      { key: "depositLiability", label: "Deposit Refund Liability", placeholder: "e.g. $8,000", hint: "Owed back to tenants on move-out" },
    ],
    expenses: [
      { key: "mortgagePIComplete", label: "Mortgage P&I (total)", placeholder: "e.g. $2,200", hint: "All properties combined" },
      { key: "propertyTaxesRei", label: "Property Taxes", placeholder: "e.g. $500", hint: "Monthly portion of annual taxes" },
      { key: "landlordInsurance", label: "Landlord Insurance", placeholder: "e.g. $200", hint: "Per-property hazard + liability" },
      { key: "propMgmtFees", label: "Property Management", placeholder: "e.g. $200", hint: "8-10% of collected rent" },
      { key: "repairsTurnover", label: "Repairs / Turnover", placeholder: "e.g. $300", hint: "Budget 1-2% of property value annually" },
      { key: "vacancyReserve", label: "Vacancy Reserve", placeholder: "e.g. $150", hint: "5-8% of rent — fund for empty months" },
      { key: "hoaFees", label: "HOA / Condo Fees", placeholder: "e.g. $0", hint: "Only if applicable" },
      { key: "ownerUtilities", label: "Utilities You Cover", placeholder: "e.g. $100", hint: "Water, trash often landlord-paid" },
      { key: "llcFees", label: "LLC Franchise/Filing", placeholder: "e.g. $50", hint: "Annual state LLC fees" },
      { key: "taxPrepRei", label: "Tax Return Prep", placeholder: "e.g. $80", hint: "Schedule E or LLC return cost" },
    ],
  },
  {
    id: "wholesaler", label: "Real Estate Wholesaler", emoji: "🤝",
    desc: "Assignment fees, no holding property",
    assets: [
      { key: "earnestOnContract", label: "Earnest Money Out", placeholder: "e.g. $20,000", hint: "Deposits on open contracts" },
      { key: "assignmentReceivable", label: "Assignment Fees in Escrow", placeholder: "e.g. $15,000", hint: "Closings pending in next 30 days" },
      { key: "marketingBudget", label: "Available Marketing $", placeholder: "e.g. $10,000", hint: "Reserved for next campaign" },
      { key: "crmContacts", label: "Buyer/Seller CRM Value", placeholder: "e.g. $5,000", hint: "Subjective — your warm list" },
      { key: "dealCapital", label: "Cash Buffer for Deals", placeholder: "e.g. $30,000", hint: "EMD + transactional funding" },
    ],
    liabilities: [
      { key: "pendingRefunds", label: "Earnest to Refund", placeholder: "e.g. $5,000", hint: "Cancellations pending" },
      { key: "vaPayables", label: "VA / Cold-Caller Payables", placeholder: "e.g. $3,000", hint: "Unpaid contractor invoices" },
      { key: "platformBalance", label: "Marketing Platform Owed", placeholder: "e.g. $1,000", hint: "Mail house + ringless owed" },
    ],
    expenses: [
      { key: "directMarketing", label: "Mail / FB / PPC", placeholder: "e.g. $5,000", hint: "$3-10k/mo typical to keep deal flow" },
      { key: "coldCallers", label: "VAs / Cold Callers", placeholder: "e.g. $2,500", hint: "Per-call cost varies $4-8/hr" },
      { key: "crmSubs", label: "Podio/REIPro/PropStream", placeholder: "e.g. $300", hint: "Stack of skip + lead tools" },
      { key: "earnestForfeited", label: "Lost Earnest Deposits", placeholder: "e.g. $500", hint: "Deals you couldn't close" },
      { key: "attorneyClosing", label: "Attorney / Closing Fees", placeholder: "e.g. $300", hint: "Per-deal closing cost" },
      { key: "skipTraceCost", label: "Skip Tracing", placeholder: "e.g. $400", hint: "Per-record cost on lead list" },
      { key: "drivingForDollars", label: "Driver / Gas Reimburse", placeholder: "e.g. $200", hint: "If you have drivers scouting" },
      { key: "coachingCourses", label: "Coaching / Courses", placeholder: "e.g. $300", hint: "Ongoing education spend" },
    ],
  },
  {
    id: "restaurant", label: "Restaurant Owner", emoji: "🍽️",
    desc: "Full-service or quick-service food",
    assets: [
      { key: "inventoryFood", label: "Food + Beverage Inventory", placeholder: "e.g. $15,000", hint: "Cost basis on hand" },
      { key: "kitchenEquipment", label: "Kitchen Equipment", placeholder: "e.g. $80,000", hint: "Depreciated value of ovens, fridges, etc." },
      { key: "leaseImprovements", label: "Leasehold Improvements", placeholder: "e.g. $200,000", hint: "Buildout you paid for" },
      { key: "operatingCashRest", label: "Operating Cash", placeholder: "e.g. $40,000", hint: "Float for payroll + COGS" },
      { key: "posSystem", label: "POS + Tech Stack", placeholder: "e.g. $10,000", hint: "Toast, Square, KDS, etc." },
    ],
    liabilities: [
      { key: "kitchenLoans", label: "Equipment Financing", placeholder: "e.g. $60,000", hint: "Loans on big-ticket equipment" },
      { key: "supplierPayables", label: "Supplier Payables (Sysco etc)", placeholder: "e.g. $20,000", hint: "30-day terms typical" },
      { key: "leaseRemaining", label: "Lease Remaining (Year 1)", placeholder: "e.g. $100,000", hint: "Total lease obligation this year" },
      { key: "salesTaxOwed", label: "Sales Tax Owed", placeholder: "e.g. $5,000", hint: "Collected but not yet remitted" },
      { key: "tipsHeldBack", label: "Tips Held for Payroll", placeholder: "e.g. $3,000", hint: "Owed to staff in next paycheck" },
    ],
    expenses: [
      { key: "rentRest", label: "Rent", placeholder: "e.g. $10,000", hint: "8-10% of revenue is healthy" },
      { key: "foodCogs", label: "Food + Beverage COGS", placeholder: "e.g. $30,000", hint: "28-35% of revenue target" },
      { key: "laborCostRest", label: "Labor (BOH + FOH)", placeholder: "e.g. $35,000", hint: "Largest controllable cost — track weekly" },
      { key: "utilitiesRest", label: "Utilities (gas + electric)", placeholder: "e.g. $3,500", hint: "Hood + ovens drive cost" },
      { key: "marketingRest", label: "Marketing / Delivery Apps", placeholder: "e.g. $4,000", hint: "DoorDash/UberEats commissions" },
      { key: "smallwares", label: "Smallwares / Supplies", placeholder: "e.g. $1,500", hint: "Plates, glassware, paper goods" },
      { key: "linenCleaning", label: "Linen + Cleaning", placeholder: "e.g. $1,200", hint: "Aprons, mats, hood cleaning" },
      { key: "permitsLicenses", label: "Permits + Health Dept", placeholder: "e.g. $500", hint: "Liquor + health permits" },
      { key: "creditCardFeesRest", label: "Card Processing Fees", placeholder: "e.g. $2,800", hint: "2.5-3.5% of card sales" },
      { key: "musicEntertainment", label: "Music / ASCAP / Decor", placeholder: "e.g. $250", hint: "Music licensing + ambience" },
    ],
  },
  {
    id: "student", label: "Finance Student / Side Hustles", emoji: "🎓",
    desc: "Student with multiple side businesses",
    assets: [
      { key: "brokerageAccount", label: "Brokerage (Robinhood/IBKR)", placeholder: "e.g. $8,000", hint: "Stocks + ETFs + options" },
      { key: "cryptoHoldings", label: "Crypto Across Wallets", placeholder: "e.g. $3,000", hint: "BTC, ETH, alts, staking" },
      { key: "sideHustleCash", label: "Side Business Operating Cash", placeholder: "e.g. $4,000", hint: "Per-venture float" },
      { key: "internshipReserves", label: "Internship Savings", placeholder: "e.g. $10,000", hint: "Cash from summer/co-op gigs" },
      { key: "capsimEquity", label: "Class Simulation Equity", placeholder: "e.g. $0", hint: "Capsim portfolio value (educational)" },
    ],
    liabilities: [
      { key: "studentLoansBalance", label: "Student Loans (current)", placeholder: "e.g. $25,000", hint: "Federal + private combined" },
      { key: "studentCreditCard", label: "Credit Card Balance", placeholder: "e.g. $1,500", hint: "Avoid carrying balance" },
      { key: "bnplBalance", label: "BNPL (Affirm/Klarna)", placeholder: "e.g. $200", hint: "Often missed in personal accounting" },
    ],
    expenses: [
      { key: "rentLA", label: "LA Rent (room/apt)", placeholder: "e.g. $1,800", hint: "LA averages high — track tightly" },
      { key: "foodStudent", label: "Food / Groceries", placeholder: "e.g. $400", hint: "Cook more than you eat out" },
      { key: "transportStudent", label: "Gas + Parking + Uber", placeholder: "e.g. $250", hint: "LA driving is the killer line" },
      { key: "subscriptionsStudent", label: "Streaming + AI Tools", placeholder: "e.g. $80", hint: "Spotify, Netflix, Claude Pro" },
      { key: "booksCases", label: "Textbooks / Case Studies", placeholder: "e.g. $100", hint: "Often spikes start-of-semester" },
      { key: "networkingMeetups", label: "Coffee Meetings / Events", placeholder: "e.g. $150", hint: "Investment, not expense" },
      { key: "certifications", label: "Certifications / CFA / CPA", placeholder: "e.g. $200", hint: "Materials + exam fees" },
      { key: "sideHustleSpend", label: "Side Business Expenses", placeholder: "e.g. $300", hint: "Deductible against side income" },
    ],
  },
  {
    id: "freelancer", label: "Freelancer / Consultant", emoji: "💼",
    desc: "Independent contractor / agency of one",
    assets: [
      { key: "freelanceAR", label: "Open Invoices / AR", placeholder: "e.g. $25,000", hint: "Unpaid client invoices" },
      { key: "freelanceCash", label: "Business Bank Account", placeholder: "e.g. $30,000", hint: "Keep separate from personal" },
      { key: "freelanceQ", label: "Quarterly Tax Reserve", placeholder: "e.g. $15,000", hint: "25-30% of income — don't touch" },
      { key: "freelanceEquip", label: "Computer / Software / Office", placeholder: "e.g. $10,000", hint: "Depreciable assets" },
      { key: "freelanceRetire", label: "SEP-IRA / Solo 401k", placeholder: "e.g. $40,000", hint: "Self-employed retirement" },
    ],
    liabilities: [
      { key: "freelanceTaxOwed", label: "Estimated Tax Due", placeholder: "e.g. $8,000", hint: "Federal + state + SE tax" },
      { key: "freelanceCC", label: "Business Credit Card", placeholder: "e.g. $3,000", hint: "Use for clean expense tracking" },
      { key: "freelanceSubs", label: "Annual SaaS Auto-Renewals", placeholder: "e.g. $2,000", hint: "Adobe, Figma, etc. annual prepays" },
      { key: "freelanceClientCredits", label: "Client Prepay Liability", placeholder: "e.g. $5,000", hint: "Retainers owed but unworked" },
    ],
    expenses: [
      { key: "freelanceHealth", label: "Health Insurance (1099)", placeholder: "e.g. $600", hint: "ACA marketplace or HSA-eligible" },
      { key: "freelanceSubsMo", label: "Software Subs", placeholder: "e.g. $400", hint: "Adobe + tools" },
      { key: "freelanceMarketing", label: "Marketing / Lead-gen", placeholder: "e.g. $500", hint: "LinkedIn premium, ads, content" },
      { key: "freelanceLegal", label: "Lawyer + CPA", placeholder: "e.g. $300", hint: "Contracts + tax prep" },
      { key: "freelanceCoworking", label: "Coworking", placeholder: "e.g. $250", hint: "Or home office allocation" },
      { key: "freelanceTraining", label: "Courses / Conferences", placeholder: "e.g. $200", hint: "Deductible business development" },
      { key: "freelanceEnt", label: "Client Entertainment", placeholder: "e.g. $200", hint: "50% deductible meals" },
      { key: "freelanceTravel", label: "Travel for Clients", placeholder: "e.g. $300", hint: "Reimbursable or write-off" },
    ],
  },
];

// Anthropic Messages API call. Runs entirely in-browser using BYOK.
// Requires the anthropic-dangerous-direct-browser-access header.
async function generateCategoriesViaAI({ profession, apiKey, model = "claude-sonnet-4-6" }) {
  const systemPrompt = `You generate personal-finance category line items tailored to a user's profession or business.

Return ONLY valid JSON in this exact shape (no prose, no markdown fences):
{
  "assets": [{"key": "camelCase", "label": "Human Label", "placeholder": "e.g. $X,XXX", "hint": "5-15 words of plain-English context"}],
  "liabilities": [...same shape...],
  "expenses": [...same shape...]
}

Rules:
- 5-7 asset items, 4-6 liability items, 8-12 expense items
- "key" must be unique camelCase across all three arrays
- "label" 2-5 words, plain English (not jargon)
- "placeholder" is a realistic dollar example for that profession
- "hint" explains what's typical, a rule of thumb, or why this line matters
- Categories must be SPECIFIC to this user's stated work, not generic
- Avoid items that apply to everyone (no "Checking Account" unless distinctive)`;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: `My work: ${profession}\n\nGenerate categories specific to this profession.` }],
    }),
  });
  if (!response.ok) {
    // Map status codes to friendly messages; never surface raw API response bodies to the user.
    const msg = response.status === 401 ? "Your API key was rejected. Double-check it at console.anthropic.com."
      : response.status === 429 ? "Rate limit reached. Wait a moment and try again."
      : response.status === 400 ? "The request was rejected. Try a shorter or clearer description."
      : response.status >= 500 ? "Anthropic's service is temporarily unavailable. Try again shortly."
      : "The request failed. Check your key and connection, then try again.";
    throw new Error(msg);
  }
  let data;
  try { data = await response.json(); } catch (e) { throw new Error("Couldn't read the response. Please try again."); }
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Empty response from Claude — try again or use a template instead.");
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  let parsed;
  try { parsed = JSON.parse(cleaned); } catch (e) { throw new Error("Claude returned non-JSON. Try a more specific profession description."); }
  if (!parsed.assets || !parsed.liabilities || !parsed.expenses) throw new Error("Response missing assets/liabilities/expenses arrays.");
  return parsed;
}

// CustomizePanel: modal with two tabs — pick template or generate via AI.
function CustomizePanel({ open, onClose, onApply, currentLabel }) {
  const [tab, setTab] = useState("template");
  const [picked, setPicked] = useState(null);
  const [profession, setProfession] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [generated, setGenerated] = useState(null);
  const [ownLabel, setOwnLabel] = useState("");
  const [ownItems, setOwnItems] = useState([]); // user-entered line items: { label, bucket }
  const [niLabel, setNiLabel] = useState("");
  const [niBucket, setNiBucket] = useState("assets");

  if (!open) return null;

  const doGenerate = async () => {
    setGenerating(true); setError(null); setGenerated(null);
    try {
      const result = await generateCategoriesViaAI({ profession, apiKey, model });
      setGenerated({ id: "custom", label: "Custom (AI-generated)", emoji: "✨", ...result });
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setGenerating(false);
    }
  };

  const applyTemplate = (t) => { onApply(t); onClose(); };

  // "Build your own": manual line items — no API key or backend needed, lives in browser memory.
  const addOwnItem = () => { const label = niLabel.trim(); if (!label) return; setOwnItems([...ownItems, { label, bucket: niBucket }]); setNiLabel(""); };
  const removeOwnItem = (idx) => setOwnItems(ownItems.filter((_, i) => i !== idx));
  const applyOwn = () => {
    const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 28);
    const mk = (bucket) => ownItems.map((it, i) => ({ it, i })).filter(x => x.it.bucket === bucket).map(({ it, i }) => ({ key: "u" + i + "_" + (slug(it.label) || "item"), label: it.label, placeholder: "e.g. $0", hint: "Your own line item" }));
    onApply({ id: "own", label: ownLabel.trim() || "My Custom Set", emoji: "🧩", assets: mk("assets"), liabilities: mk("liabilities"), expenses: mk("expenses") });
    onClose();
  };

  return (<div className="fixed inset-0 z-50 bg-slate-900/60 flex items-start justify-center p-4 pt-12 overflow-y-auto" onClick={onClose} onKeyDown={e => e.key === "Escape" && onClose()}>
    <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1c1f26] rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden mb-12">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-[#262b33] flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">Customize Categories for Your Work</h3>
          <p className="text-xs text-slate-500 dark:text-[#a3acba] mt-0.5">Replace generic line items with categories specific to your profession.{currentLabel && <span className="text-indigo-600 dark:text-indigo-300 font-medium"> Currently: {currentLabel}</span>}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-slate-500 dark:text-[#a3acba] hover:text-slate-700 text-lg rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">✕</button>
      </div>
      <div className="px-6 pt-4 flex gap-1 border-b border-slate-100 dark:border-[#262b33]">
        <button onClick={() => setTab("template")} className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${tab === "template" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500" : "text-slate-500 dark:text-[#a3acba] hover:text-slate-700"}`}>Pick a Template</button>
        <button onClick={() => setTab("ai")} className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${tab === "ai" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500" : "text-slate-500 dark:text-[#a3acba] hover:text-slate-700"}`}>✨ Generate with Claude</button>
        <button onClick={() => setTab("own")} className={`px-4 py-2 text-sm font-semibold rounded-t-lg ${tab === "own" ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500" : "text-slate-500 dark:text-[#a3acba] hover:text-slate-700"}`}>➕ Build your own</button>
        <button onClick={() => { onApply(null); onClose(); }} className="ml-auto px-4 py-2 text-sm text-slate-500 dark:text-[#a3acba] hover:text-red-600">Reset to default</button>
      </div>
      <div className="p-6">
        {tab === "template" && (<>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {PROFESSION_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setPicked(t)} className={`p-4 rounded-xl border-2 text-left transition-all ${picked?.id === t.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26] hover:border-indigo-300"}`}>
                <div className="flex items-center gap-2 mb-1"><span className="text-xl">{t.emoji}</span><span className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{t.label}</span></div>
                <p className="text-xs text-slate-500 dark:text-[#a3acba]">{t.desc}</p>
                <p className="text-xs text-slate-400 dark:text-[#828b9a] mt-1.5">{t.assets.length} assets · {t.liabilities.length} liabilities · {t.expenses.length} expenses</p>
              </button>
            ))}
          </div>
          {picked && (<div className="bg-slate-50 dark:bg-[#15171c] rounded-xl p-4 mb-4">
            <h4 className="text-xs font-bold text-slate-500 dark:text-[#a3acba] uppercase tracking-wider mb-2">Preview: {picked.label}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div><div className="font-bold text-slate-700 dark:text-[#dde3ec] mb-1">Assets</div>{picked.assets.slice(0, 4).map(a => <div key={a.key} className="text-slate-600 dark:text-[#c4ccd8] truncate">• {a.label}</div>)}{picked.assets.length > 4 && <div className="text-slate-400 dark:text-[#828b9a]">+ {picked.assets.length - 4} more</div>}</div>
              <div><div className="font-bold text-slate-700 dark:text-[#dde3ec] mb-1">Liabilities</div>{picked.liabilities.slice(0, 4).map(a => <div key={a.key} className="text-slate-600 dark:text-[#c4ccd8] truncate">• {a.label}</div>)}{picked.liabilities.length > 4 && <div className="text-slate-400 dark:text-[#828b9a]">+ {picked.liabilities.length - 4} more</div>}</div>
              <div><div className="font-bold text-slate-700 dark:text-[#dde3ec] mb-1">Expenses</div>{picked.expenses.slice(0, 4).map(a => <div key={a.key} className="text-slate-600 dark:text-[#c4ccd8] truncate">• {a.label}</div>)}{picked.expenses.length > 4 && <div className="text-slate-400 dark:text-[#828b9a]">+ {picked.expenses.length - 4} more</div>}</div>
            </div>
          </div>)}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-[#c4ccd8] hover:bg-slate-100 rounded-lg">Cancel</button>
            <button disabled={!picked} onClick={() => applyTemplate(picked)} className={`px-5 py-2 text-sm font-semibold rounded-lg ${picked ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 dark:bg-[#2c313b] text-slate-400 dark:text-[#828b9a] cursor-not-allowed"}`}>Apply {picked?.label || "Template"} →</button>
          </div>
        </>)}

        {tab === "ai" && (<>
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg p-3 mb-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <span className="text-base">🔑</span>
            <div>
              <div className="font-bold mb-0.5">Bring your own Anthropic API key</div>
              <div>Your key stays in this browser tab only — it's never sent to a server beyond Anthropic's API. Get one at <span className="font-mono">console.anthropic.com</span>.</div>
            </div>
          </div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-[#c4ccd8] mb-1">Describe your work in detail</label>
          <textarea value={profession} onChange={e => setProfession(e.target.value)} rows={4} placeholder="e.g. I run a 3PL warehouse in Long Beach with 8 employees, mostly serving Amazon FBA prep clients. We have a small fleet of 3 box trucks and a Goodman racking system. Also have a side LLC for real estate wholesaling — about 4 deals a year." className="bg-white dark:bg-[#1c1f26] w-full p-3 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 mb-3" />
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-[#c4ccd8] mb-1">Anthropic API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-ant-..." className="bg-white dark:bg-[#1c1f26] w-full p-2 text-sm font-mono border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-[#c4ccd8] mb-1">Model</label>
              <select value={model} onChange={e => setModel(e.target.value)} className="bg-white dark:bg-[#1c1f26] w-full p-2 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="claude-sonnet-4-6">claude-sonnet-4-6 (recommended)</option>
                <option value="claude-opus-4-7">claude-opus-4-7 (best quality, slower)</option>
                <option value="claude-haiku-4-5-20251001">claude-haiku-4-5 (fastest, cheapest)</option>
              </select>
            </div>
          </div>
          <button disabled={generating || !profession.trim() || !apiKey.trim()} onClick={doGenerate} className={`w-full py-3 text-sm font-bold rounded-lg mb-3 ${generating || !profession.trim() || !apiKey.trim() ? "bg-slate-200 dark:bg-[#2c313b] text-slate-400 dark:text-[#828b9a] cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"}`}>{generating ? "✨ Claude is thinking…" : "✨ Generate Categories"}</button>
          {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3 text-xs text-red-700 dark:text-red-300 mb-3">{error}</div>}
          {generated && (<>
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2"><span className="text-lg">✨</span><span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Generated successfully</span></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div><div className="font-bold text-emerald-800 dark:text-emerald-200 mb-1">{generated.assets.length} Assets</div>{generated.assets.slice(0, 5).map(a => <div key={a.key} className="text-emerald-700 dark:text-emerald-300 truncate">• {a.label}</div>)}</div>
                <div><div className="font-bold text-emerald-800 dark:text-emerald-200 mb-1">{generated.liabilities.length} Liabilities</div>{generated.liabilities.slice(0, 5).map(a => <div key={a.key} className="text-emerald-700 dark:text-emerald-300 truncate">• {a.label}</div>)}</div>
                <div><div className="font-bold text-emerald-800 dark:text-emerald-200 mb-1">{generated.expenses.length} Expenses</div>{generated.expenses.slice(0, 5).map(a => <div key={a.key} className="text-emerald-700 dark:text-emerald-300 truncate">• {a.label}</div>)}</div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setGenerated(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-[#c4ccd8] hover:bg-slate-100 rounded-lg">Regenerate</button>
              <button onClick={() => applyTemplate(generated)} className="px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Apply Generated Categories →</button>
            </div>
          </>)}
        </>)}

        {tab === "own" && (<>
          <p className="text-xs text-slate-500 dark:text-[#a3acba] mb-3">Add your own line items — anything the templates and AI didn't cover. No API key needed; this stays in your browser.</p>
          <label className="block text-xs font-semibold text-slate-600 dark:text-[#c4ccd8] mb-1">Name this set</label>
          <input value={ownLabel} onChange={e => setOwnLabel(e.target.value)} placeholder="e.g. My Wholesale Business" className="bg-white dark:bg-[#1c1f26] w-full p-2 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 mb-3" />
          <label className="block text-xs font-semibold text-slate-600 dark:text-[#c4ccd8] mb-1">Add a line item</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input value={niLabel} onChange={e => setNiLabel(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addOwnItem(); }} placeholder="Line item name (e.g. Box Truck Fleet)" className="bg-white dark:bg-[#1c1f26] flex-1 p-2 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400" />
            <select value={niBucket} onChange={e => setNiBucket(e.target.value)} className="bg-white dark:bg-[#1c1f26] p-2 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="assets">Asset</option><option value="liabilities">Liability</option><option value="expenses">Monthly Expense</option>
            </select>
            <button onClick={addOwnItem} disabled={!niLabel.trim()} className={`px-4 py-2 text-sm font-semibold rounded-lg ${niLabel.trim() ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 dark:bg-[#2c313b] text-slate-400 dark:text-[#828b9a] cursor-not-allowed"}`}>+ Add</button>
          </div>
          {ownItems.length === 0
            ? <div className="bg-slate-50 dark:bg-[#15171c] rounded-xl p-6 text-center text-xs text-slate-400 dark:text-[#828b9a] mb-4">No line items yet — add a few above. They'll show in Personal Finance under your set, ready for you to fill in dollar amounts.</div>
            : <div className="bg-slate-50 dark:bg-[#15171c] rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {[["Assets", "assets", "text-emerald-700 dark:text-emerald-300"], ["Liabilities", "liabilities", "text-red-700 dark:text-red-300"], ["Monthly Expenses", "expenses", "text-indigo-700 dark:text-indigo-300"]].map(([title, bucket, color]) => (
                  <div key={bucket}>
                    <div className={`font-bold mb-1 ${color}`}>{title}</div>
                    {ownItems.map((it, i) => ({ it, i })).filter(x => x.it.bucket === bucket).map(({ it, i }) => (
                      <div key={i} className="flex items-center justify-between gap-1 text-slate-600 dark:text-[#c4ccd8] mb-0.5"><span className="truncate">• {it.label}</span><button onClick={() => removeOwnItem(i)} aria-label={`Remove ${it.label}`} className="text-red-400 hover:text-red-600 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded">✕</button></div>
                    ))}
                    {ownItems.filter(x => x.bucket === bucket).length === 0 && <div className="text-slate-400 dark:text-[#828b9a]">—</div>}
                  </div>
                ))}
              </div>}
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-[#c4ccd8] hover:bg-slate-100 rounded-lg">Cancel</button>
            <button disabled={ownItems.length === 0} onClick={applyOwn} className={`px-5 py-2 text-sm font-semibold rounded-lg ${ownItems.length ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 dark:bg-[#2c313b] text-slate-400 dark:text-[#828b9a] cursor-not-allowed"}`}>Apply {ownItems.length} item{ownItems.length === 1 ? "" : "s"} →</button>
          </div>
        </>)}
      </div>
    </div>
  </div>);
}

// DoNext: compute the single highest-impact next step for the user, given engagement.
const DoNext = ({ engagement, riskProfile, onNav }) => {
  const v = engagement.visited || {};
  let suggestion;
  if (!v.personal) suggestion = { title: "Start with Personal Finance", reason: "Mapping your money is the foundation everything else builds on.", nav: "personal", tone: "indigo" };
  else if (!riskProfile) suggestion = { title: "Set your Risk Profile", reason: "It personalizes every recommendation across the app.", nav: "riskprofile", tone: "indigo" };
  else if (engagement.emergencyMonths < 3) suggestion = { title: "Build your emergency fund", reason: "3 months of expenses in cash is the single most-protective thing you can do.", nav: "goals", tone: "amber" };
  else if (!engagement.goalsSet) suggestion = { title: "Set a savings goal", reason: "Writing down a target makes you ~42% more likely to reach it (more with weekly check-ins).", nav: "goals", tone: "indigo" };
  else if (!v.stresstest) suggestion = { title: "Run a stress test", reason: "See if you'd survive a downturn before one arrives.", nav: "stresstest", tone: "amber" };
  else if (!v.portfolio) suggestion = { title: "Check your portfolio diversification", reason: "Concentration risk is what wipes people out in a crash.", nav: "portfolio", tone: "indigo" };
  else suggestion = { title: "Keep going", reason: "Review and update your inputs as your situation changes.", nav: "personal", tone: "emerald" };
  const tones = { indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", border: "border-indigo-200 dark:border-indigo-500/30", dot: "bg-indigo-500", text: "text-indigo-900 dark:text-indigo-200", btn: "bg-indigo-600 hover:bg-indigo-700" }, amber: { bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/30", dot: "bg-amber-500", text: "text-amber-900 dark:text-amber-200", btn: "bg-amber-500 hover:bg-amber-600" }, emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", dot: "bg-emerald-500", text: "text-emerald-900 dark:text-emerald-200", btn: "bg-emerald-600 hover:bg-emerald-700" } };
  const t = tones[suggestion.tone];
  return (<div className={`${t.bg} ${t.border} border-2 rounded-2xl p-5 mb-4`}>
    <div className="flex items-center gap-2 mb-1"><span className={`w-2 h-2 rounded-full ${t.dot}`} /><span className={`text-xs font-bold uppercase tracking-widest ${t.text} opacity-70`}>Do This Next</span></div>
    <div className={`text-xl font-bold ${t.text} mb-1`}>{suggestion.title}</div>
    <div className="text-sm text-slate-600 dark:text-[#c4ccd8] mb-3">{suggestion.reason}</div>
    <button onClick={() => onNav(suggestion.nav)} className={`px-4 py-2 ${t.btn} text-white text-sm font-semibold rounded-lg`}>Take me there →</button>
  </div>);
};
const Btn = ({ children, onClick, v = "primary", className = "", "aria-label": ariaLabel }) => { const s = { primary: "bg-indigo-600 text-white hover:bg-indigo-700", secondary: "bg-slate-100 dark:bg-[#232730] text-slate-700 dark:text-[#dde3ec] hover:bg-slate-200", danger: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300 hover:bg-red-100", success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100", accent: "bg-amber-500 text-white hover:bg-amber-600" }; return <button onClick={onClick} aria-label={ariaLabel} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${s[v]} ${className}`}>{children}</button>; };
const Bar = ({ value, min, max, good, bad, label, display, info }) => { const pct = max - min === 0 ? 0 : Math.min(Math.max((value - min) / (max - min), 0), 1) * 100; const isBad = bad !== undefined && ((good !== undefined && good > bad) ? value <= bad : value >= bad); const isGood = good !== undefined && ((bad !== undefined && good > bad) ? value >= good : value <= good); const c = isBad ? "bg-red-400" : isGood ? "bg-emerald-400" : "bg-amber-400"; return <div className="mb-2.5"><div className="flex justify-between items-center mb-0.5"><span className="text-xs font-medium text-slate-600 dark:text-[#c4ccd8] flex items-center">{label}{info && <Tip text={info} />}</span><span className="text-xs font-bold text-slate-800 dark:text-[#eef1f6]">{display}</span></div><div className="w-full h-1.5 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className={`h-full rounded-full ${c} transition-all duration-700`} style={{ width: `${pct}%` }} /></div></div>; };
const Ring = ({ score, max, size = 90, color = "indigo" }) => { const pct = max > 0 ? Math.min(Math.max(score / max, 0), 1) : 0; const r = (size - 10) / 2; const circ = 2 * Math.PI * r; const off = circ * (1 - pct); const p = { green: ["#22c55e", "#15803d"], yellow: ["#eab308", "#a16207"], red: ["#ef4444", "#b91c1c"], indigo: ["#6366f1", "#3730a3"] }; const [st, tx] = p[color] || p.indigo; return <svg width={size} height={size}><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" /><circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={st} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={off} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset 0.8s" }} /><text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize="17" fontWeight="700" fill={tx}>{score.toFixed(0)}</text><text x={size / 2} y={size / 2 + 11} textAnchor="middle" fontSize="9" fill="#94a3b8">/ {max}</text></svg>; };
const $ = (n, t = "$") => { if (!Number.isFinite(n)) return t === "%" ? "—%" : t === "x" ? "—" : "—"; if (t === "$") return (n < 0 ? "-$" : "$") + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 }); if (t === "%") return n.toFixed(1) + "%"; if (t === "x") return n.toFixed(2) + "x"; return n.toLocaleString(undefined, { maximumFractionDigits: 2 }); };
const Bench = ({ value, avg, label }) => <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-0.5 flex items-center gap-1"><span className={value >= avg ? "text-emerald-600 dark:text-emerald-300" : "text-amber-600 dark:text-amber-200"}>{value >= avg ? "Above" : "Below"} avg</span><span className="text-slate-400 dark:text-[#828b9a]">({label}: {typeof avg === "number" && avg < 1 ? avg.toFixed(2) : avg})</span></div>;

// Finding component with expandable details
const Finding = ({ good, text, detail }) => {
  const [open, setOpen] = useState(false);
  return (<div className="mb-2">
    <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left text-sm">
      <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${good ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" : "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300"}`}>{good ? "✓" : "!"}</span>
      <span className="flex-1 text-slate-700 dark:text-[#dde3ec]">{text}</span>
      <span className="text-slate-400 dark:text-[#828b9a] text-xs">{open ? "▲" : "▼"}</span>
    </button>
    {open && detail && <div className="ml-7 mt-1 text-xs text-slate-500 dark:text-[#a3acba] bg-slate-50 dark:bg-[#15171c] p-2 rounded-lg">{detail}</div>}
  </div>);
};

// Action button with multi-perspective toggle and onNav fix
const ActionBtn = ({ actions, perspectives, onNav, beginner }) => {
  const [show, setShow] = useState(false);
  const [perspective, setPerspective] = useState("default");
  // Beginners get no perspective toggle — just "Recommended."
  if (beginner) perspectives = null;
  const pLabels = { default: "Recommended", conservative: "Conservative", balanced: "Balanced", aggressive: "Aggressive" };
  const pColors = { default: "bg-amber-500", conservative: "bg-blue-500", balanced: "bg-indigo-500", aggressive: "bg-red-500" };
  const pBorder = { default: "border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10", conservative: "border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10", balanced: "border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10", aggressive: "border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10" };
  const pText = { default: "text-amber-800 dark:text-amber-200", conservative: "text-blue-800 dark:text-blue-200", balanced: "text-indigo-800 dark:text-indigo-200", aggressive: "text-red-800 dark:text-red-200" };
  const pBadge = { default: "bg-amber-200 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200", conservative: "bg-blue-200 dark:bg-blue-500/20 text-blue-800 dark:text-blue-200", balanced: "bg-indigo-200 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-200", aggressive: "bg-red-200 dark:bg-red-500/20 text-red-800 dark:text-red-200" };
  const currentActions = perspective === "default" || !perspectives ? actions : (perspectives[perspective] || actions);
  return (<div className="mt-4">
    <button onClick={() => setShow(!show)} className={`w-full py-3 ${pColors[perspective]} text-white font-bold rounded-xl hover:opacity-90 transition-all text-sm`}>{show ? "Hide Actions" : "What Should I Do? (Click for your action plan)"}</button>
    {show && <Card className={`mt-3 ${pBorder[perspective]}`}>
      {perspectives && <div className="flex gap-1.5 mb-3 flex-wrap">
        <span className="text-xs text-slate-400 dark:text-[#828b9a] self-center mr-1">Perspective:</span>
        {Object.keys(pLabels).filter(k => k === "default" || (perspectives && perspectives[k])).map(k =>
          <button key={k} onClick={() => setPerspective(k)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${perspective === k ? pColors[k] + " text-white" : "bg-white dark:bg-[#1c1f26] text-slate-500 dark:text-[#a3acba] border border-slate-200 dark:border-[#323844] hover:border-slate-300"}`}>{pLabels[k]}</button>
        )}
      </div>}
      <h3 className={`text-sm font-bold ${pText[perspective]} mb-3`}>
        {perspective !== "default" && perspectives ? `${pLabels[perspective]} Approach` : "Your Action Plan"} — Do These In Order
      </h3>
      {currentActions.map((a, i) => <div key={i} className="flex gap-3 mb-3 last:mb-0"><span className={`shrink-0 w-6 h-6 rounded-full ${pBadge[perspective]} text-xs font-bold flex items-center justify-center`}>{i + 1}</span><div><div className="text-sm font-semibold text-slate-800 dark:text-[#eef1f6]">{a.title}</div><div className="text-xs text-slate-600 dark:text-[#c4ccd8] mt-0.5">{a.detail}</div></div></div>)}
      {!perspectives && onNav && <button onClick={() => onNav("riskprofile")} className="mt-3 text-xs text-slate-400 dark:text-[#828b9a] hover:text-indigo-500 transition-colors">These don't apply to me? Set your Risk Profile →</button>}
    </Card>}</div>);
};

// Smart Suggestions (clickable — navigates to linked module)
const Suggest = ({ items, onNav }) => items.length > 0 ? <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100"><div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 mb-2">Suggested Next Steps</div><div className="flex flex-wrap gap-2">{items.map((s, i) => <button key={i} onClick={() => s.nav && onNav && onNav(s.nav)} className={`flex items-center gap-2 bg-white dark:bg-[#1c1f26] px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-[#c4ccd8] border border-indigo-100 transition-all ${s.nav && onNav ? "hover:border-indigo-400 hover:shadow-sm hover:text-indigo-700 cursor-pointer" : ""}`}><span className="w-5 h-5 rounded bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">{s.icon}</span>{s.text}{s.nav && onNav && <span className="text-indigo-400 ml-1">→</span>}</button>)}</div></div> : null;

// Badge
const Badge = ({ children, color = "slate" }) => { const c = { green: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300", red: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300", amber: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-200", indigo: "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300", slate: "bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#c4ccd8]" }; return <span className={`px-2 py-0.5 text-xs font-bold rounded ${c[color]}`}>{children}</span>; };

// Guided Journey Bar
const GuidedBar = ({ journey, currentStepIndex, onNextStep, onExit }) => {
  const step = journey.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / journey.steps.length) * 100;
  return (
    <div className="bg-indigo-50 dark:bg-indigo-500/10 border-b border-indigo-200 dark:border-indigo-500/30 px-6 py-3 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div><h3 className="font-bold text-indigo-900 dark:text-indigo-200">{journey.name}</h3><p className="text-xs text-indigo-700 dark:text-indigo-300">Step {currentStepIndex + 1} of {journey.steps.length}: {step.title}</p></div>
        <Btn onClick={onExit} v="secondary">Exit Journey</Btn>
      </div>
      <div className="w-full h-2 bg-indigo-200 dark:bg-indigo-500/20 rounded-full overflow-hidden mb-2"><div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} /></div>
      <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-3">{step.description}</p>
      <Btn onClick={onNextStep} v="primary">{currentStepIndex < journey.steps.length - 1 ? "Next Step" : "Finish Journey"}</Btn>
    </div>
  );
};

// ============================================================
// GUIDED JOURNEYS & GUIDE MODULE
// ============================================================
const JOURNEYS = [
  { id: "new-to-finance", name: "New to Finance", steps: [
    { moduleId: "riskprofile", title: "Define Your Risk Profile", description: "Start by understanding how much risk you can handle." },
    { moduleId: "personal", title: "Map Your Money", description: "See your complete financial picture." },
    { moduleId: "cashflow", title: "Cash Flow Check", description: "Make sure you won't run short each month." },
    { moduleId: "goals", title: "Set Your Goals", description: "Define what you're saving for." },
    { moduleId: "quick", title: "Quick Wins", description: "Run quick calculators for immediate questions." },
  ]},
  { id: "ready-to-invest", name: "Ready to Invest", steps: [
    { moduleId: "personal", title: "Check Your Foundation", description: "Make sure your base finances are solid." },
    { moduleId: "riskprofile", title: "Risk Profile", description: "Confirm your risk tolerance." },
    { moduleId: "investments", title: "Analyze Investments", description: "Learn to evaluate stocks, bonds, crypto." },
    { moduleId: "portfolio", title: "Build Your Portfolio", description: "Start tracking investments." },
    { moduleId: "tax", title: "Plan for Taxes", description: "Understand tax implications." },
  ]},
  { id: "business-check", name: "Business Health Check", steps: [
    { moduleId: "business", title: "Business Overview", description: "Analyze products, margins, and health." },
    { moduleId: "breakeven", title: "Break-Even Analysis", description: "Know how many units to sell." },
    { moduleId: "whatif", title: "Scenario Planning", description: "Test different strategies." },
    { moduleId: "valuation", title: "Business Value", description: "Calculate what your business is worth." },
    { moduleId: "capbudget", title: "Capital Decisions", description: "Decide which investments grow the business." },
  ]},
  { id: "crash-proof", name: "Crash-Proof Your Finances", steps: [
    { moduleId: "stresstest", title: "Stress Test", description: "See how your finances hold up." },
    { moduleId: "personal", title: "Strengthen Your Base", description: "Build emergency fund and reduce debt." },
    { moduleId: "portfolio", title: "Diversify", description: "Spread risk across asset types." },
    { moduleId: "riskprofile", title: "Confirm Risk", description: "Make sure allocation matches tolerance." },
    { moduleId: "market", title: "Monitor Markets", description: "Stay informed about conditions." },
  ]},
  { id: "start-trading", name: "Start Trading & Options", steps: [
    { moduleId: "riskprofile", title: "Risk Profile", description: "Options are advanced — know your tolerance." },
    { moduleId: "marketlab", title: "Charts & Signals", description: "Learn to read price action." },
    { moduleId: "investments", title: "Investment Analysis", description: "Master fundamentals first." },
    { moduleId: "options", title: "Options & Spreads", description: "Learn options strategies." },
    { moduleId: "tax", title: "Trading Tax Rules", description: "Understand how trading is taxed." },
    { moduleId: "journal", title: "Decision Journal", description: "Track every trade and learn." },
  ]},
];

function Guide({ journeys, onSelectJourney }) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Start Here" sub="Choose a step-by-step path tailored to your financial goal">Guided Journeys</Title>
      <div className="grid grid-cols-1 gap-4">
        {journeys.map(j => (
          <Card key={j.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectJourney(j)}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">{j.name}</h3>
                <p className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{j.steps.length} steps</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {j.steps.map((s, i) => <Badge key={i} color="slate">{s.title}</Badge>)}
                </div>
              </div>
              <div className="text-2xl ml-4">→</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// SMART ONBOARDING (3-step conversational flow)
// ============================================================
function Onboarding({ onComplete, onLegalOpen }) {
  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState(null);
  const [knowledge, setKnowledge] = useState(50);
  const [focus, setFocus] = useState([]);
  const [pickedTemplate, setPickedTemplate] = useState(null);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const intents = [
    { id: "personal", emoji: "💰", title: "Take control of my money", desc: "Budget, save, manage debt, retirement", route: "personal" },
    { id: "invest", emoji: "📈", title: "Invest and grow wealth", desc: "Stocks, bonds, crypto, portfolio tracking", route: "investments" },
    { id: "business", emoji: "🏢", title: "Run a business better", desc: "Margins, pricing, valuation, big decisions", route: "business" },
    { id: "trade", emoji: "🎯", title: "Trade options & advanced", desc: "Strategies, signals, decision journal", route: "options" },
    { id: "protect", emoji: "🛡️", title: "Stress-test my finances", desc: "Would I survive a downturn?", route: "stresstest" },
    { id: "explore", emoji: "🧭", title: "Just exploring", desc: "Browse everything", route: "home" },
  ];
  const focusChips = ["Budgeting", "Saving", "Investing", "Business", "Trading", "Taxes", "Debt"];

  const finish = (customCategories) => onComplete({ intent, knowledge, focus, customCategories, route: intent?.route || "home" });

  if (step === 0) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 dark:from-[#15171c] to-indigo-50 dark:from-[#15171c] dark:to-[#1a1d24] p-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-[#eef1f6] mb-2">Welcome to Vantage</h1>
          <p className="text-slate-500 dark:text-[#a3acba]">Financial intelligence in plain English. Let's tailor this to you.</p>
        </div>
        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider text-center mb-3">Step 1 of 4</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6] text-center mb-2">What brought you here today?</h2>
        {!agreedTerms && <p className="text-xs text-amber-700 dark:text-amber-200 text-center mb-4 font-medium">Agree to the terms below first ↓, then pick what fits you.</p>}
        {agreedTerms && <p className="text-xs text-slate-400 dark:text-[#828b9a] text-center mb-4">Pick one to personalize your setup.</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {intents.map(it => (
            <button key={it.id} disabled={!agreedTerms} onClick={() => { setIntent(it); setStep(1); }} className={`p-5 rounded-xl border-2 text-left transition-all ${!agreedTerms ? "opacity-60 cursor-not-allowed border-slate-200 dark:border-[#323844] bg-slate-50 dark:bg-[#15171c]" : `hover:border-indigo-400 hover:shadow-md ${intent?.id === it.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26]"}`}`}>
              <div className="text-3xl mb-2">{it.emoji}</div>
              <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{it.title}</div>
              <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{it.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreedTerms} onChange={e => setAgreedTerms(e.target.checked)} className="mt-0.5 w-4 h-4 accent-indigo-600" />
            <span className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold">I understand Vantage is for educational use only and is not financial, tax, or investment advice.</span> All calculations are estimates based on the inputs I provide. I will consult a qualified professional before making real decisions. I agree to the <button type="button" onClick={() => onLegalOpen && onLegalOpen("terms")} className="underline text-indigo-700 dark:text-indigo-300 hover:text-indigo-900">Terms</button>, <button type="button" onClick={() => onLegalOpen && onLegalOpen("privacy")} className="underline text-indigo-700 dark:text-indigo-300 hover:text-indigo-900">Privacy Policy</button>, and <button type="button" onClick={() => onLegalOpen && onLegalOpen("disclaimer")} className="underline text-indigo-700 dark:text-indigo-300 hover:text-indigo-900">Disclaimer</button>.
            </span>
          </label>
        </div>
        <div className="text-center mt-4">
          <button disabled={!agreedTerms} onClick={() => onComplete({ intent: null, knowledge: 50, focus: [], route: "home" })} className={`text-xs ${agreedTerms ? "text-slate-400 dark:text-[#828b9a] hover:text-slate-600" : "text-slate-300 cursor-not-allowed"}`}>Skip — I'll explore on my own</button>
        </div>
      </div>
    </div>
  );

  if (step === 1) {
    const knowledgeLabel = knowledge < 30 ? "Totally new" : knowledge < 60 ? "Some experience" : knowledge < 85 ? "Comfortable" : "I know my stuff";
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 dark:from-[#15171c] to-indigo-50 dark:from-[#15171c] dark:to-[#1a1d24] p-6">
        <div className="max-w-2xl w-full">
          <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider text-center mb-3">Step 2 of 4</div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6] text-center mb-2">How much do you know about finance?</h2>
          <p className="text-sm text-slate-500 dark:text-[#a3acba] text-center mb-8">We'll adjust how we explain things. Beginners get plain English on by default.</p>
          <div className="bg-white dark:bg-[#1c1f26] rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-[#323844] mb-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-300">{knowledgeLabel}</div>
              <div className="text-xs text-slate-400 dark:text-[#828b9a] mt-1">{knowledge}/100</div>
            </div>
            <input type="range" min="0" max="100" value={knowledge} onChange={e => setKnowledge(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-[#2c313b] rounded-full appearance-none cursor-pointer accent-indigo-600" />
            <div className="flex justify-between text-xs text-slate-400 dark:text-[#828b9a] mt-2"><span>Totally new</span><span>I know my stuff</span></div>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setStep(0)} className="text-sm text-slate-500 dark:text-[#a3acba] hover:text-slate-700">← Back</button>
            <button onClick={() => setStep(2)} className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Continue →</button>
          </div>
        </div>
      </div>
    );
  }

  const toggleFocus = (k) => setFocus(f => f.includes(k) ? f.filter(x => x !== k) : [...f, k]);

  if (step === 2) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 dark:from-[#15171c] to-indigo-50 dark:from-[#15171c] dark:to-[#1a1d24] p-6">
      <div className="max-w-2xl w-full">
        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider text-center mb-3">Step 3 of 4</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6] text-center mb-2">What do you want to work on?</h2>
        <p className="text-sm text-slate-500 dark:text-[#a3acba] text-center mb-8">Pick everything that's relevant. We'll show only the modules that match — change this anytime in Manage Modules.</p>
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {focusChips.map(c => (
            <button key={c} onClick={() => toggleFocus(c)} className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${focus.includes(c) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white dark:bg-[#1c1f26] text-slate-700 dark:text-[#dde3ec] border-slate-200 dark:border-[#323844] hover:border-indigo-400"}`}>{c}</button>
          ))}
        </div>
        <div className="flex justify-between">
          <button onClick={() => setStep(1)} className="text-sm text-slate-500 dark:text-[#a3acba] hover:text-slate-700">← Back</button>
          <button onClick={() => setStep(3)} className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">Continue →</button>
        </div>
      </div>
    </div>
  );

  // Step 3: optional profession template
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 dark:from-[#15171c] to-indigo-50 dark:to-indigo-500/10 p-6 py-12">
      <div className="max-w-3xl w-full">
        <div className="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wider text-center mb-3">Step 4 of 4 — Optional</div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6] text-center mb-2">Want categories tailored to your work?</h2>
        <p className="text-sm text-slate-500 dark:text-[#a3acba] text-center mb-6">Pick one and Personal Finance will show line items specific to your profession instead of generic ones. You can change this anytime later — or generate custom ones with Claude.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {PROFESSION_TEMPLATES.map(t => (
            <button key={t.id} onClick={() => setPickedTemplate(t)} className={`p-4 rounded-xl border-2 text-left transition-all ${pickedTemplate?.id === t.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md" : "border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26] hover:border-indigo-300"}`}>
              <div className="flex items-center gap-2 mb-1"><span className="text-xl">{t.emoji}</span><span className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{t.label}</span></div>
              <p className="text-xs text-slate-500 dark:text-[#a3acba]">{t.desc}</p>
              <p className="text-xs text-slate-400 dark:text-[#828b9a] mt-1.5">{t.assets.length + t.liabilities.length + t.expenses.length} custom line items</p>
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <button onClick={() => setStep(2)} className="text-sm text-slate-500 dark:text-[#a3acba] hover:text-slate-700">← Back</button>
          <div className="flex gap-3">
            <button onClick={() => finish(null)} className="px-4 py-2 text-sm text-slate-600 dark:text-[#c4ccd8] hover:bg-slate-100 rounded-lg">Skip — use generic</button>
            <button disabled={!pickedTemplate} onClick={() => finish(pickedTemplate)} className={`px-6 py-2 text-sm font-semibold rounded-lg ${pickedTemplate ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-slate-200 dark:bg-[#2c313b] text-slate-400 dark:text-[#828b9a] cursor-not-allowed"}`}>Get Started →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// HOME DASHBOARD
// ============================================================
function Home({ engagement, healthScore, riskProfile, riskLabel, onNav, toured, onDismissTour }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const visited = engagement.visited || {};
  const visitedCount = Object.keys(visited).length;
  const visitedList = Object.entries(visited).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const healthLabel = healthScore >= 70 ? "Strong" : healthScore >= 40 ? "Building" : healthScore >= 15 ? "Just Starting" : "Get Started";
  const healthColor = healthScore >= 70 ? "green" : healthScore >= 40 ? "yellow" : "red";

  const actions = [
    { id: "personal", label: "Personal Finance", tier: "My Money" },
    { id: "portfolio", label: "Portfolio", tier: "Investing" },
    { id: "cashflow", label: "Cash Flow", tier: "My Money" },
    { id: "stresstest", label: "Stress Test", tier: "Protection" },
    { id: "goals", label: "Goals", tier: "My Money" },
    { id: "marketwatch", label: "Market Watch", tier: "Investing" },
    { id: "quick", label: "Quick Tools", tier: "My Money" },
    { id: "riskprofile", label: "Risk Profile", tier: "About Me" },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-[#eef1f6]">{greeting}</h1>
        <p className="text-slate-500 dark:text-[#a3acba] mt-1">Here's your financial command center.</p>
      </div>

      <Coachmark dismissed={toured?.home} onDismiss={() => onDismissTour("home")} steps={[
        { title: "Welcome to Vantage", body: "This is your home base. Every module is in the sidebar — grouped by what they help you do. Tier colors match what you'll see across the app." },
        { title: "Start with 'Do This Next'", body: "Whatever you do, we'll always show you the single highest-impact step right below this tour. Don't worry about the 21 modules — just follow the prompt." },
        { title: "Use the Glossary and Plain English toggle", body: "Top-right has a Glossary search for any financial term, and a Plain English toggle that rewrites labels in everyday language. Use them liberally." },
      ]} />

      <DoNext engagement={engagement} riskProfile={riskProfile} onNav={onNav} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="flex items-center gap-4">
          <Ring score={healthScore} max={100} size={100} color={healthColor} />
          <div>
            <div className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase tracking-wider">Financial Health</div>
            <div className="text-xl font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{healthLabel}</div>
            <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">Engage with modules to grow this score.</div>
          </div>
        </Card>
        <StatCard label="Modules Explored" value={`${visitedCount} / 21`} sign="neutral" sub={visitedCount === 0 ? "Click any module to begin" : "Keep going to unlock more insights"} size="lg" />
        <StatCard label="Risk Profile" value={riskProfile ? (riskLabel || "Set") : "Not Set"} sign={riskProfile ? "good" : "neutral"} sub={riskProfile ? "Personalized advice active" : "enter your info to see live stats"} size="lg" />
      </div>

      <Card className="mb-6">
        <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map(a => { const th = tierTheme(a.tier); return (
            <button key={a.id} onClick={() => onNav(a.id)} className={`px-3 py-3 rounded-lg border-2 hover:shadow-md transition-all text-left text-sm font-medium text-slate-700 dark:text-[#dde3ec] bg-white dark:bg-[#1c1f26] ${th.border} hover:${th.border}`}>
              <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${th.dot}`} /><span>{a.label}</span></div>
            </button>
          ); })}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-3 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />Recent Activity</h3>
        {visitedList.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-[#828b9a]">You haven't explored any modules yet. Try Personal Finance or a Quick Tool above.</p>
        ) : (
          <div className="space-y-1">
            {visitedList.map(([m, ts]) => (
              <button key={m} onClick={() => onNav(m)} className="w-full flex items-center gap-3 text-sm text-slate-600 dark:text-[#c4ccd8] p-2 rounded-lg hover:bg-slate-50 text-left">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span className="capitalize">{m.replace(/([A-Z])/g, " $1")}</span>
                <span className="text-xs text-slate-400 dark:text-[#828b9a] ml-auto">visited {ts}×</span>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ============================================================
// ANALYSIS REPORT (Run Analysis button)
// ============================================================
const AnalysisReport = ({ grade, gradeColor, findings, topPriority, priorityLevel }) => {
  const gradeColors = { green: "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40", amber: "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-200 border-amber-300 dark:border-amber-500/40", red: "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 border-red-300 dark:border-red-500/40" };
  const prioColors = { good: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-200", okay: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200", bad: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200" };
  return (
    <Card className="mt-4 border-2 border-indigo-200 dark:border-indigo-500/30">
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-3xl font-black ${gradeColors[gradeColor]}`}>{grade}</div>
        <div><h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">Your Financial Diagnostic</h3><p className="text-xs text-slate-500 dark:text-[#a3acba]">Based on the data you entered above</p></div>
      </div>
      <div className="mb-4">
        <h4 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-2">Key Findings</h4>
        {findings.map((f, i) => <Finding key={i} good={f.good} text={f.text} detail={f.detail} />)}
      </div>
      <div className={`p-4 rounded-xl border ${prioColors[priorityLevel]}`}>
        <div className="text-xs font-bold uppercase tracking-wider mb-1">Top Priority</div>
        <div className="text-sm font-semibold">{topPriority}</div>
      </div>
    </Card>
  );
};

const RunAnalysisBtn = ({ onClick }) => (
  <button onClick={onClick} className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg mt-4">
    <div>Run Full Analysis</div>
    <div className="text-xs font-normal opacity-80 mt-0.5">Get your complete financial diagnostic</div>
  </button>
);

// ============================================================
// QUICK TOOLS
// ============================================================
function QuickTools() {
  const [tool, setTool] = useState("compound");
  const [ci, setCi] = useState({ initial: 10000, monthly: 500, rate: 7, years: 20 });
  const uci = (k) => (v) => setCi(p => ({ ...p, [k]: v }));
  const ciResult = useMemo(() => {
    const r = ci.rate / 100 / 12; let bal = ci.initial;
    const pts = [{ y: 0, b: bal, c: ci.initial }]; let totalC = ci.initial;
    for (let m = 1; m <= ci.years * 12; m++) { bal = bal * (1 + r) + ci.monthly; totalC += ci.monthly; if (m % 12 === 0) pts.push({ y: m / 12, b: bal, c: totalC }); }
    return { final: bal, contributed: totalC, growth: bal - totalC, pts };
  }, [ci]);
  const [tip, setTip] = useState({ bill: 85, tipPct: 20, people: 2 });
  const ut = (k) => (v) => setTip(p => ({ ...p, [k]: v }));
  const tipAmt = tip.bill * tip.tipPct / 100; const tipTotal = tip.bill + tipAmt; const tipPer = tip.people > 0 ? tipTotal / tip.people : tipTotal;
  const [rvb, setRvb] = useState({ rent: 2000, homePrice: 400000, downPct: 20, rate: 6.5, propertyTax: 1.2, maintenance: 1, appreciation: 3, rentIncrease: 3, years: 7 });
  const urvb = (k) => (v) => setRvb(p => ({ ...p, [k]: v }));
  const rvbCalc = useMemo(() => {
    const down = rvb.homePrice * rvb.downPct / 100; const loan = rvb.homePrice - down;
    const mr = rvb.rate / 100 / 12; const n = 360;
    const mp = mr > 0 ? loan * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : loan / n;
    const monthlyOwn = mp + (rvb.homePrice * rvb.propertyTax / 100 / 12) + (rvb.homePrice * rvb.maintenance / 100 / 12);
    let totalRent = 0, rent = rvb.rent;
    for (let y = 0; y < rvb.years; y++) { totalRent += rent * 12; rent *= (1 + rvb.rentIncrease / 100); }
    const totalOwn = monthlyOwn * 12 * rvb.years + down;
    const homeVal = rvb.homePrice * Math.pow(1 + rvb.appreciation / 100, rvb.years);
    // True remaining mortgage balance after `years` of payments (not a flat 0.85 factor).
    const k = Math.min(rvb.years * 12, n);
    const remainingLoan = mr > 0 ? loan * (Math.pow(1 + mr, n) - Math.pow(1 + mr, k)) / (Math.pow(1 + mr, n) - 1) : loan * (1 - k / n);
    const equity = homeVal - Math.max(remainingLoan, 0);
    const netOwn = totalOwn - equity;
    return { monthlyOwn, mp, down, totalRent, totalOwn, homeVal, equity, netOwn, winner: netOwn < totalRent ? "Buy" : "Rent" };
  }, [rvb]);
  const [aff, setAff] = useState({ income: 6500, debts: 800, downPayment: 60000, rate: 6.5, term: 30 });
  const uaff = (k) => (v) => setAff(p => ({ ...p, [k]: v }));
  const maxPayment = aff.income * 0.28; const maxPaymentWithDebt = (aff.income * 0.36) - aff.debts;
  const usablePayment = Math.min(maxPayment, maxPaymentWithDebt);
  const mr2 = aff.rate / 100 / 12; const n2 = aff.term * 12;
  const maxLoan = mr2 > 0 ? usablePayment * (Math.pow(1 + mr2, n2) - 1) / (mr2 * Math.pow(1 + mr2, n2)) : usablePayment * n2;
  const maxHome = maxLoan + aff.downPayment;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Money" sub="Everyday calculators for common financial questions">Quick Tools</Title>
      <div className="flex flex-wrap gap-2 mb-6">
        {[["compound", "Compound Interest"], ["tip", "Tip Calculator"], ["rentvsbuy", "Rent vs Buy"], ["afford", "How Much House?"]].map(([id, label]) =>
          <Btn key={id} onClick={() => setTool(id)} v={tool === id ? "primary" : "secondary"}>{label}</Btn>
        )}
      </div>
      {tool === "compound" && (<>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <F label="Starting Amount" value={ci.initial} onChange={uci("initial")} prefix="$" info="How much you have right now to invest." />
            <F label="Monthly Contribution" value={ci.monthly} onChange={uci("monthly")} prefix="$" info="How much you'll add each month." />
            <F label="Annual Return" value={ci.rate} onChange={uci("rate")} suffix="%" info="Expected annual return. Stock market averages ~7% after inflation, ~10% before." />
            <F label="Time Horizon" value={ci.years} onChange={uci("years")} suffix="years" />
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3">
              <Card className="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-center"><div className="text-xs text-indigo-500 font-semibold">Future Value</div><div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{$(ciResult.final)}</div></Card>
              <div className="grid grid-cols-2 gap-3">
                <Card className="text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">You Put In</div><div className="text-lg font-bold text-slate-700 dark:text-[#dde3ec]">{$(ciResult.contributed)}</div></Card>
                <Card className="text-center bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"><div className="text-xs text-emerald-500">Interest Earned</div><div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{$(ciResult.growth)}</div></Card>
              </div>
            </div>
            <div className="flex items-end gap-0.5 h-20 mt-3">
              {ciResult.pts.map((p, i) => <div key={i} className="flex-1 rounded-t relative group" style={{ height: `${ciResult.final > 0 ? (p.b / ciResult.final) * 100 : 0}%`, minHeight: 2 }}><div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-500/20 rounded-t" /><div className="absolute inset-0 rounded-t bg-emerald-300" style={{ height: `${p.b > 0 ? (p.c / p.b) * 100 : 0}%`, bottom: 0, top: "auto" }} /><div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">Yr {p.y}: {$(p.b)}</div></div>)}
            </div>
            <div className="flex justify-between text-xs text-slate-400 dark:text-[#828b9a] mt-1"><span>Year 0</span><span className="flex gap-3"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-300" />Contributed</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-indigo-200 dark:bg-indigo-500/20" />Growth</span></span><span>Year {ci.years}</span></div>
          </div>
        </div>
        <Card className="bg-slate-50 dark:bg-[#15171c]"><p className="text-sm text-slate-700 dark:text-[#dde3ec] leading-relaxed">Starting with {$(ci.initial)} and adding {$(ci.monthly)}/month at {ci.rate}% for {ci.years} years, your money grows to <strong>{$(ciResult.final)}</strong>. You contributed {$(ciResult.contributed)} — the other <strong>{$(ciResult.growth)}</strong> is pure compound interest growth.</p></Card>
      </>)}
      {tool === "tip" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div><F label="Bill Amount" value={tip.bill} onChange={ut("bill")} prefix="$" /><F label="Tip Percentage" value={tip.tipPct} onChange={ut("tipPct")} suffix="%" /><F label="Split Between" value={tip.people} onChange={ut("people")} suffix="people" />
            <div className="flex gap-2 mt-2">{[15, 18, 20, 25].map(p => <Btn key={p} onClick={() => ut("tipPct")(p)} v={tip.tipPct === p ? "primary" : "secondary"}>{p}%</Btn>)}</div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Card className="text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">Tip Amount</div><div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">{$(tipAmt)}</div></Card>
            <Card className="text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">Total</div><div className="text-xl font-bold text-slate-800 dark:text-[#eef1f6]">{$(tipTotal)}</div></Card>
            {tip.people > 1 && <Card className="text-center bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"><div className="text-xs text-emerald-500">Per Person</div><div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{$(tipPer)}</div></Card>}
          </div>
        </div>
      )}
      {tool === "rentvsbuy" && (<>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">Renting</h3>
            <F label="Monthly Rent" value={rvb.rent} onChange={urvb("rent")} prefix="$" small />
            <F label="Annual Rent Increase" value={rvb.rentIncrease} onChange={urvb("rentIncrease")} suffix="%" small info="Rent typically increases 3-5% per year." />
            <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2 mt-4">Buying</h3>
            <F label="Home Price" value={rvb.homePrice} onChange={urvb("homePrice")} prefix="$" small />
            <F label="Down Payment" value={rvb.downPct} onChange={urvb("downPct")} suffix="%" small />
            <F label="Mortgage Rate" value={rvb.rate} onChange={urvb("rate")} suffix="%" small />
            <F label="Property Tax" value={rvb.propertyTax} onChange={urvb("propertyTax")} suffix="%" small />
            <F label="Maintenance" value={rvb.maintenance} onChange={urvb("maintenance")} suffix="%" small info="Annual maintenance as % of home value. Usually 1-2%." />
            <F label="Home Appreciation" value={rvb.appreciation} onChange={urvb("appreciation")} suffix="%" small info="Expected annual home value increase." />
            <F label="Time Horizon" value={rvb.years} onChange={urvb("years")} suffix="years" small />
          </div>
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Monthly Mortgage</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">{$(rvbCalc.mp)}</div></Card>
              <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Monthly Owning (All-In)</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">{$(rvbCalc.monthlyOwn)}</div></Card>
              <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Total Rent ({rvb.years} yrs)</div><div className="text-lg font-bold text-red-500">{$(rvbCalc.totalRent)}</div></Card>
              <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Net Cost Owning</div><div className="text-lg font-bold text-indigo-600 dark:text-indigo-300">{$(rvbCalc.netOwn)}</div></Card>
            </div>
            <Card className={`text-center ${rvbCalc.winner === "Buy" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"}`}>
              <div className="text-xs text-slate-500 dark:text-[#a3acba]">Over {rvb.years} years, the better option is</div>
              <div className={`text-2xl font-bold mt-1 ${rvbCalc.winner === "Buy" ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"}`}>{rvbCalc.winner}</div>
              <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">You'd save approximately {$(Math.abs(rvbCalc.totalRent - rvbCalc.netOwn))}</div>
            </Card>
            <div className="mt-3 text-xs text-slate-400 dark:text-[#828b9a]">Home value in {rvb.years} yrs: {$(rvbCalc.homeVal)} | Equity built: ~{$(rvbCalc.equity)}</div>
          </div>
        </div>
      </>)}
      {tool === "afford" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
            <F label="Monthly Income (after tax)" value={aff.income} onChange={uaff("income")} prefix="$" info="Your net monthly take-home pay." />
            <F label="Monthly Debt Payments" value={aff.debts} onChange={uaff("debts")} prefix="$" info="Car payments, student loans, credit cards, etc." />
            <F label="Down Payment Saved" value={aff.downPayment} onChange={uaff("downPayment")} prefix="$" />
            <F label="Mortgage Rate" value={aff.rate} onChange={uaff("rate")} suffix="%" />
            <F label="Loan Term" value={aff.term} onChange={uaff("term")} suffix="years" />
            <div className="p-3 bg-slate-50 dark:bg-[#15171c] rounded-lg mt-3 text-xs text-slate-500 dark:text-[#a3acba] leading-relaxed">Based on the <strong>28/36 rule</strong>: housing should be max 28% of income, and total debt max 36%.<Tip text="The 28/36 rule is what most lenders use." /></div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Card className="bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-center"><div className="text-xs text-indigo-500 font-semibold">You Can Afford Up To</div><div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{$(maxHome)}</div></Card>
            <Card className="text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">Max Monthly Payment</div><div className="text-xl font-bold text-slate-800 dark:text-[#eef1f6]">{$(usablePayment)}</div></Card>
            <Card className="text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">Max Loan Amount</div><div className="text-lg font-bold text-slate-700 dark:text-[#dde3ec]">{$(maxLoan)}</div></Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PERSONAL FINANCE
// ============================================================
function PersonalFinance({ jargonFree, riskType, onNav, onEngage, toured, onDismissTour, customCategories, onOpenCustomize, coupled, locale, onSaveSnapshot }) {
  const PF_SAMPLE = { checking: 5000, savings: 15000, investments: 45000, retirement: 80000, homeValue: 350000, otherAssets: 10000, mortgage: 280000, studentLoans: 25000, autoLoan: 15000, creditCards: 4000, otherDebt: 0, monthlyIncome: 6500, housing: 1800, transportation: 500, food: 600, utilities: 200, insurance: 300, debtPayments: 800, savingsAmt: 500, entertainment: 200, other: 300, emergTarget: 6, retireMo: 500, retireReturn: 7, retireYrs: 30, retireCurrent: 80000 };
  const PF_EMPTY = Object.fromEntries(Object.keys(PF_SAMPLE).map(k => [k, k === "emergTarget" ? 6 : k === "retireReturn" ? 7 : k === "retireYrs" ? 30 : 0]));
  const [d, setD] = useState(PF_SAMPLE);
  const [edited, setEdited] = useState(false);
  const u = (k) => (v) => { setEdited(true); setD(p => ({ ...p, [k]: v })); };
  const [showRetire, setShowRetire] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const resetToSample = () => { setD(PF_SAMPLE); setEdited(false); };
  const clearAll = () => { setD(PF_EMPTY); setEdited(true); };
  // Partner state for couples mode — minimal subset (income + main expenses).
  const [partner, setPartner] = useState({ monthlyIncome: 5500, housing: 0, transportation: 400, food: 300, insurance: 200, debtPayments: 400, savingsAmt: 300, other: 200 });
  const up = (k) => (v) => setPartner(p => ({ ...p, [k]: v }));
  const partnerIncome = coupled ? (partner.monthlyIncome || 0) : 0;
  const partnerExp = coupled ? ((partner.housing || 0) + (partner.transportation || 0) + (partner.food || 0) + (partner.insurance || 0) + (partner.debtPayments || 0) + (partner.other || 0)) : 0;
  const cur = LOCALES[locale]?.currency || "$";
  // Add profession-specific custom field values into totals.
  // Namespace custom-category storage keys ("cc_") so an AI/template key can never collide with a base
  // field like "food"/"checking" and double-count into the totals.
  const ck = (key) => "cc_" + key;
  const customA = (customCategories?.assets || []).reduce((s, c) => s + (Number(d[ck(c.key)]) || 0), 0);
  const customL = (customCategories?.liabilities || []).reduce((s, c) => s + (Number(d[ck(c.key)]) || 0), 0);
  const customExp = (customCategories?.expenses || []).reduce((s, c) => s + (Number(d[ck(c.key)]) || 0), 0);
  const totalA = d.checking + d.savings + d.investments + d.retirement + d.homeValue + d.otherAssets + customA;
  const totalL = d.mortgage + d.studentLoans + d.autoLoan + d.creditCards + d.otherDebt + customL;
  const nw = totalA - totalL;
  const totalExp = d.housing + d.transportation + d.food + d.utilities + d.insurance + d.debtPayments + d.entertainment + d.other + customExp + partnerExp;
  const combinedIncome = d.monthlyIncome + partnerIncome;
  const surplus = combinedIncome - totalExp - d.savingsAmt - (coupled ? (partner.savingsAmt || 0) : 0);
  const sr = combinedIncome > 0 ? ((d.savingsAmt + (coupled ? (partner.savingsAmt || 0) : 0) + Math.max(surplus, 0)) / combinedIncome) * 100 : 0;
  const dti = combinedIncome > 0 ? ((d.debtPayments + (coupled ? (partner.debtPayments || 0) : 0)) / combinedIncome) * 100 : 0;
  const em = totalExp > 0 ? (d.checking + d.savings) / totalExp : 0;
  const nmd = d.studentLoans + d.autoLoan + d.creditCards + d.otherDebt;
  const payoff = d.debtPayments > 0 ? Math.ceil(nmd / d.debtPayments) : Infinity;
  const retireData = useMemo(() => {
    // Clamp inputs so extreme values can't overflow to Infinity in the projection.
    const rate = Math.max(-50, Math.min(d.retireReturn, 50));
    const yrs = Math.max(0, Math.min(d.retireYrs, 80));
    const r = rate / 100 / 12; let b = d.retireCurrent;
    const pts = [{ y: 0, b }]; for (let m = 1; m <= yrs * 12; m++) { b = b * (1 + r) + d.retireMo; if (m % 12 === 0) pts.push({ y: m / 12, b }); }
    return { final: b, contributed: d.retireCurrent + d.retireMo * yrs * 12, growth: b - d.retireCurrent - d.retireMo * yrs * 12, pts };
  }, [d.retireCurrent, d.retireMo, d.retireReturn, d.retireYrs]);
  let score = 0;
  if (nw > 0) score += 15; else if (nw > -50000) score += 8; else score += 2;
  if (sr >= 20) score += 15; else if (sr >= 10) score += 10; else if (sr >= 5) score += 5; else score += 1;
  if (dti <= 15) score += 15; else if (dti <= 28) score += 10; else if (dti <= 36) score += 5; else score += 1;
  if (em >= 6) score += 15; else if (em >= 3) score += 10; else if (em >= 1) score += 4;
  if (d.retirement >= d.monthlyIncome * 60) score += 15; else if (d.retirement >= d.monthlyIncome * 24) score += 10; else if (d.retirement > 0) score += 5;
  score = Math.min(score, 100);
  const actions = [];
  if (em < 3) actions.push({ title: "Build your emergency fund to 3 months", detail: `You have ${em.toFixed(1)} months. Target: ${$(d.emergTarget * totalExp)}. Put every extra dollar here first.` });
  if (d.creditCards > 0) actions.push({ title: `Pay off credit card debt (${$(d.creditCards)})`, detail: "Credit cards charge 18-25% interest. This is the highest-return move you can make." });
  if (dti > 36) actions.push({ title: "Reduce your debt-to-income ratio", detail: `At ${dti.toFixed(0)}%, you're above the 36% danger zone.` });
  if (sr < 15) actions.push({ title: `Increase savings rate from ${sr.toFixed(0)}% to 15%`, detail: `That's an extra ${$(d.monthlyIncome * 0.15 - d.savingsAmt - Math.max(surplus, 0))}/month.` });
  if (d.retirement < d.monthlyIncome * 24) actions.push({ title: "Max out your employer 401k match", detail: "If your employer matches, contribute at least enough to get the full match." });
  if (actions.length === 0) actions.push({ title: "You're in great shape — keep going", detail: "Consider increasing investment contributions or exploring tax-advantaged accounts." });
  const jf = jargonFree;
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Money" sub={jf ? "See everything you own, owe, and spend in one place" : "Net worth, budget, debt, emergency fund, and retirement projection"}>Personal Finance</Title>

      <Coachmark dismissed={toured?.personal} onDismiss={() => onDismissTour && onDismissTour("personal")} steps={[
        { title: "Step 1: What you own", body: "Fill in the left column — checking, savings, investments, your home, anything of value. Don't worry about being exact; rough is fine." },
        { title: "Step 2: What you owe", body: "Below assets, list your debts — mortgage, student loans, credit cards. The app subtracts these from your assets to compute your Net Worth automatically." },
        { title: "Step 3: Watch the score update", body: "As you fill in numbers, the 4 hero cards below update live. Negative numbers turn red, healthy ones turn green. Run Full Analysis at the bottom for the diagnostic." },
      ]} />

      {!edited && <SampleBanner onReset={clearAll} />}
      {edited && <div className="mb-3 flex justify-end"><button onClick={resetToSample} className="text-xs text-slate-400 dark:text-[#828b9a] hover:text-slate-600 underline">↺ Restore example data</button></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">{jf ? "What You Own" : "Assets"}</h3>
          {[["Checking", "checking", "e.g. $3,000"], ["Savings", "savings", "e.g. $10,000"], ["Investments", "investments", "e.g. $25,000"], ["Retirement (401k/IRA)", "retirement", "e.g. $50,000"], ["Home Value", "homeValue", "e.g. $400,000"], ["Other", "otherAssets", "e.g. $5,000"]].map(([l, k, ph]) => <F key={k} label={l} value={d[k]} onChange={u(k)} prefix="$" placeholder={ph} small />)}
          <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2 mt-3">{jf ? "What You Owe" : "Liabilities"}</h3>
          {[["Mortgage", "mortgage", "e.g. $250,000"], ["Student Loans", "studentLoans", "e.g. $20,000"], ["Auto Loan", "autoLoan", "e.g. $12,000"], ["Credit Cards", "creditCards", "e.g. $2,000"], ["Other Debt", "otherDebt", "e.g. $0"]].map(([l, k, ph]) => <F key={k} label={l} value={d[k]} onChange={u(k)} prefix="$" placeholder={ph} small />)}
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">Monthly Income & Spending</h3>
          <F label={jf ? "Take-Home Pay" : "Net Monthly Income"} value={d.monthlyIncome} onChange={u("monthlyIncome")} prefix="$" placeholder="e.g. $4,500" small hint={jf ? "After tax, what hits your bank account" : "After-tax monthly income"} />
          {[
            ["Housing", "housing", "e.g. $1,500", "Typical: 25-35% of income"],
            ["Transportation", "transportation", "e.g. $400", "Typical: $200-700/mo"],
            ["Food", "food", "e.g. $500", "Typical: $400-700 for 1-2 people"],
            ["Utilities", "utilities", "e.g. $200", "Typical: $150-300/mo"],
            ["Insurance", "insurance", "e.g. $250", "Health + auto + life premiums"],
            ["Debt Payments", "debtPayments", "e.g. $600", "Minimums on all debts combined"],
            ["Savings/Investing", "savingsAmt", "e.g. $500", "Target: 15%+ of income"],
            ["Entertainment", "entertainment", "e.g. $150", "Eating out, subscriptions, hobbies"],
            ["Other", "other", "e.g. $200", "Anything not categorized above"]
          ].map(([l, k, ph, h]) => <F key={k} label={l} value={d[k]} onChange={u(k)} prefix="$" placeholder={ph} hint={h} small />)}
        </div>
      </div>

      {coupled && (<Card className="mb-4 bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/30">
        <h3 className="text-sm font-bold text-pink-700 dark:text-pink-300 mb-3 flex items-center gap-2">💑 Partner's Numbers (combined into totals above)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <F label="Partner's monthly take-home" value={partner.monthlyIncome} onChange={up("monthlyIncome")} prefix={cur} placeholder="e.g. $5,500" small />
            <F label="Partner's housing share" value={partner.housing} onChange={up("housing")} prefix={cur} placeholder="e.g. $0 (if you cover it)" small hint="If you split rent/mortgage, partner's share" />
            <F label="Partner's transportation" value={partner.transportation} onChange={up("transportation")} prefix={cur} small />
            <F label="Partner's food" value={partner.food} onChange={up("food")} prefix={cur} small />
          </div>
          <div>
            <F label="Partner's insurance" value={partner.insurance} onChange={up("insurance")} prefix={cur} small />
            <F label="Partner's debt payments" value={partner.debtPayments} onChange={up("debtPayments")} prefix={cur} small />
            <F label="Partner's savings/investing" value={partner.savingsAmt} onChange={up("savingsAmt")} prefix={cur} small />
            <F label="Partner's other expenses" value={partner.other} onChange={up("other")} prefix={cur} small />
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-pink-200 dark:border-pink-500/30 text-xs text-slate-600 dark:text-[#c4ccd8] flex gap-6"><span>Combined income: <span className="font-bold text-emerald-700 dark:text-emerald-300">{$(combinedIncome)}/mo</span></span><span>Partner's expenses contribution: <span className="font-bold text-slate-700 dark:text-[#dde3ec]">{$(partnerExp)}/mo</span></span></div>
      </Card>)}

      {/* Customize-for-your-work button + profession-specific section */}
      <Card className="mb-4" accent="neutral">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-0.5"><span className="text-base">{customCategories?.emoji || "✨"}</span><h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec]">{customCategories ? `Tailored for: ${customCategories.label}` : "Generic categories shown"}</h3></div>
            <p className="text-xs text-slate-500 dark:text-[#a3acba]">{customCategories ? `${customCategories.assets.length} assets · ${customCategories.liabilities.length} liabilities · ${customCategories.expenses.length} expenses specific to your work, in the section below.` : "Replace generic line items with categories matching your work — pick a template or have Claude generate them."}</p>
          </div>
          <button onClick={() => onOpenCustomize && onOpenCustomize()} className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-sm">{customCategories ? "Change" : "✨ Customize for my work"}</button>
        </div>
      </Card>

      {customCategories && (<Card className="mb-4 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 border-indigo-100">
        <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-1 flex items-center gap-2"><span>{customCategories.emoji || "✨"}</span><span>{customCategories.label} — Specific Line Items</span></h3>
        <p className="text-xs text-slate-500 dark:text-[#a3acba] mb-3">These add to your standard totals above. Hover the example placeholder to see what's typical.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[["Assets", customCategories.assets, "text-emerald-700 dark:text-emerald-300"], ["Liabilities", customCategories.liabilities, "text-red-700 dark:text-red-300"], ["Monthly Expenses", customCategories.expenses, "text-indigo-700 dark:text-indigo-300"]].map(([title, items, color]) => (
            <div key={title}>
              <h4 className={`text-xs font-bold ${color} uppercase tracking-wider mb-2`}>{title}</h4>
              {items.map(item => <F key={item.key} label={item.label} value={d[ck(item.key)] || 0} onChange={u(ck(item.key))} prefix="$" placeholder={item.placeholder} hint={item.hint} small />)}
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#323844] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div><span className="text-slate-400 dark:text-[#828b9a]">Custom Assets:</span> <span className="font-bold text-emerald-700 dark:text-emerald-300">{$(customA)}</span></div>
          <div><span className="text-slate-400 dark:text-[#828b9a]">Custom Liabilities:</span> <span className="font-bold text-red-600 dark:text-red-300">{$(customL)}</span></div>
          <div><span className="text-slate-400 dark:text-[#828b9a]">Custom Expenses/mo:</span> <span className="font-bold text-indigo-700 dark:text-indigo-300">{$(customExp)}</span></div>
        </div>
      </Card>)}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card accent={nw >= 0 ? "good" : "bad"}><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "What You're Worth" : "Net Worth"}</div><div className={`text-3xl font-bold mt-1 ${nw >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(nw)}</div><div className={`h-0.5 w-12 mt-1 rounded-full ${nw >= 0 ? "bg-emerald-400" : "bg-red-400"}`} /><Bench value={nw} avg={192000} label="US median" /><WhyMatters text="Net worth is the single best snapshot of where you stand financially. Negative means debt outweighs assets — focus on paying down balances. Above the US median ($192k) means you're on the path to financial independence." /></Card>
        <Card accent={surplus >= 0 ? "good" : "bad"}><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "Left Over Monthly" : "Surplus"}</div><div className={`text-3xl font-bold mt-1 ${surplus >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(surplus)}</div><div className={`h-0.5 w-12 mt-1 rounded-full ${surplus >= 0 ? "bg-emerald-400" : "bg-red-400"}`} /><div className="text-xs text-slate-400 dark:text-[#828b9a] mt-1">{$(sr, "%")} savings rate</div><Bench value={sr} avg={8.4} label="long-run US avg" /><WhyMatters text="A negative surplus means you're spending more than you earn — credit card debt is likely growing. Lenders see savings rates above 15% as a sign you can handle additional obligations." /></Card>
        <Card accent={em >= 3 ? "good" : "bad"}><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "Safety Net" : "Emergency Fund"}</div><div className={`text-3xl font-bold mt-1 ${em >= 3 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{em.toFixed(1)}<span className="text-lg font-semibold ml-1">mo</span></div><div className={`h-0.5 w-12 mt-1 rounded-full ${em >= 3 ? "bg-emerald-400" : "bg-red-400"}`} /><Bench value={em} avg={3} label="Recommended min" /><WhyMatters text="3-6 months of expenses in cash is the standard recommendation. Below 3 months and one car repair or medical bill can push you into high-interest debt. This is the foundation everything else builds on." />{em < 3 && <LossFrame text={`A single unexpected $${Math.round(totalExp * 1.5).toLocaleString()} bill (car repair, ER visit, job gap) would force you onto credit cards at ~20-25% APR (higher with weaker credit).`} />}</Card>
        <Card accent="neutral"><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "Debt-Free In" : "Debt Payoff"}</div><div className="text-3xl font-bold mt-1 text-slate-800 dark:text-[#eef1f6]">{payoff === Infinity ? "N/A" : payoff}<span className="text-lg font-semibold ml-1">{payoff === Infinity ? "" : "mo"}</span></div><div className="h-0.5 w-12 mt-1 rounded-full bg-sky-400" /></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card><h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-3">{jf ? "Your Money Picture" : "Visual Summary"}</h3>
          <div className="flex justify-around mb-4">
            <div className="text-center"><div className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">Safety Net</div><EmergencyBucket months={em} target={6} /></div>
            <div className="text-center"><div className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">Assets vs Debts</div><DebtScale assets={totalA} debts={totalL} /></div>
          </div>
          <div className="border-t border-slate-100 dark:border-[#262b33] pt-3 flex items-center gap-3"><Ring score={score} max={100} color={score >= 70 ? "green" : score >= 45 ? "yellow" : "red"} /><div className="flex-1">
            <Bar value={sr} min={0} max={40} good={15} bad={5} label="Savings Rate" display={$(sr, "%")} />
            <Bar value={dti} min={0} max={60} good={15} bad={36} label={jf ? "Debt vs Income" : "DTI Ratio"} display={$(dti, "%")} info={jf ? "What percentage of your paycheck goes to debt." : "Monthly debt / monthly income."} />
            <Bar value={em} min={0} max={12} good={6} bad={3} label={jf ? "Safety Net" : "Emergency Fund"} display={em.toFixed(1) + " mo"} />
            {dti > 36 && <WhyMatters text={`DTI at ${dti.toFixed(0)}% — lenders get nervous above 36%, and you may have trouble getting approved for a mortgage or refinance. Above 43% is the limit for most qualified mortgages.`} />}
            {dti > 43 && <LossFrame text={`At ${dti.toFixed(0)}% DTI you're above the 43% mortgage cap. Most lenders will deny refinance applications, locking you out of lower-rate options.`} />}
          </div></div></Card>
        <Card><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">{jf ? "Where Your Money Goes" : "Budget Breakdown"}</h3>
          {[{ l: "Housing", v: d.housing, c: "bg-blue-400" }, { l: "Debt", v: d.debtPayments, c: "bg-red-400" }, { l: "Food", v: d.food, c: "bg-amber-400" }, { l: "Transport", v: d.transportation, c: "bg-emerald-400" }, { l: "Savings", v: d.savingsAmt, c: "bg-indigo-400" }, { l: "Other", v: d.utilities + d.insurance + d.entertainment + d.other, c: "bg-slate-300 dark:bg-[#3a414d]" }].map((i, idx) => <div key={idx} className="flex items-center gap-2 mb-1"><div className={`w-2 h-2 rounded-full ${i.c}`} /><span className="text-xs text-slate-600 dark:text-[#c4ccd8] flex-1">{i.l}</span><span className="text-xs font-semibold">{$(i.v)}</span><span className="text-xs text-slate-400 dark:text-[#828b9a] w-8 text-right">{d.monthlyIncome > 0 ? ((i.v / d.monthlyIncome) * 100).toFixed(0) + "%" : ""}</span></div>)}
        </Card>
      </div>
      <Card className="mb-4"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{jf ? "Retirement Crystal Ball" : "Retirement Projector"}</h3>{showRetire && <ConfidenceLabel level="estimate" note="Returns vary year to year. Stock market averages ~7% real return long-term, but any 30-year window can land 4-10%. Treat this as a range, not a target." />}</div><Btn onClick={() => setShowRetire(!showRetire)} v="secondary">{showRetire ? "Hide" : "Show"}</Btn></div>
        {showRetire && <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3"><F label="Current Balance" value={d.retireCurrent} onChange={u("retireCurrent")} prefix="$" small /><F label="Monthly Contribution" value={d.retireMo} onChange={u("retireMo")} prefix="$" small /><F label="Expected Return" value={d.retireReturn} onChange={u("retireReturn")} suffix="%" small /><F label="Years to Retire" value={d.retireYrs} onChange={u("retireYrs")} small /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-3">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-center"><div className="text-xs text-indigo-500 font-semibold">{jf ? "You'll Have" : "Projected Balance"}</div><div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{$(retireData.final)}</div></div>
            <div className="p-3 bg-slate-50 dark:bg-[#15171c] rounded-lg text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">You Put In</div><div className="text-lg font-bold text-slate-700 dark:text-[#dde3ec]">{$(retireData.contributed)}</div></div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-center"><div className="text-xs text-emerald-500">{jf ? "Free Money (Interest)" : "Compound Growth"}</div><div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{$(retireData.growth)}</div></div>
          </div>
        </>}
      </Card>
      <RunAnalysisBtn onClick={() => { setShowAnalysis(!showAnalysis); if (onEngage) onEngage({ emergencyMonths: em, cashflowPositive: surplus >= 0 }); }} />
      {showAnalysis && <AnalysisReport
        grade={score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : score >= 35 ? "D" : "F"}
        gradeColor={score >= 65 ? "green" : score >= 40 ? "amber" : "red"}
        findings={[
          { good: sr >= 15, text: `Savings rate: ${sr.toFixed(0)}% ${sr >= 15 ? "(above 15% target)" : "(below 15% target)"}` },
          { good: dti <= 36, text: `Debt-to-income: ${dti.toFixed(0)}% ${dti <= 36 ? "(manageable)" : "(above danger zone)"}` },
          { good: em >= 3, text: `Emergency fund: ${em.toFixed(1)} months ${em >= 3 ? "(meets minimum)" : "(below 3-month minimum)"}` },
          { good: nw > 0, text: `Net worth: ${$(nw)} ${nw > 0 ? "(positive)" : "(negative — focus on debt reduction)"}` },
        ]}
        topPriority={em < 3 ? "Build emergency fund to 3 months of expenses" : dti > 36 ? "Reduce debt-to-income ratio below 36%" : sr < 15 ? "Increase savings rate to 15%" : "Maintain your excellent financial habits"}
        priorityLevel={score >= 65 ? "good" : score >= 40 ? "okay" : "bad"}
      />}
      <ActionBtn beginner={jargonFree} actions={actions} perspectives={{
        conservative: [
          { title: "Safety first — maximize emergency fund to 12 months", detail: "Before investing anything, build a fortress of cash. Sleep well at night." },
          ...(d.creditCards > 0 ? [{ title: "Eliminate all high-interest debt", detail: "Pay off credit cards, then auto loans, then student debt. Zero debt = zero risk." }] : []),
          { title: "Stick to index funds and bonds", detail: "Low-cost, diversified. Don't chase returns. Time in the market beats timing the market." },
          { title: "Keep 40%+ in bonds and cash", detail: "Stability over growth. You can afford to grow slowly if you never lose big." },
        ],
        balanced: actions,
        aggressive: [
          ...(d.creditCards > 0 ? [{ title: "Pay minimum on low-rate debt, invest the rest", detail: "If your debt rate is below 6%, your money works harder in the market." }] : []),
          { title: "Max out all tax-advantaged accounts", detail: "401k, IRA, HSA — fill every one. Tax savings compound over decades." },
          { title: "Target 80%+ stocks, tilt toward growth", detail: "You have time to recover from crashes. Maximize equity exposure now." },
          { title: "Consider alternative investments", detail: "Real estate, crypto, or start a side business. Multiple income streams compound wealth." },
        ],
      }} />
      {em < 3 ? <Nudge tone="amber" text="You have less than 3 months of emergency savings — let's set a goal to build it." ctaLabel="Create a Goal" onClick={() => onNav && onNav("goals")} />
        : !riskType ? <Nudge tone="indigo" text="You've mapped your money. Set your Risk Profile so every recommendation fits your life." ctaLabel="Set Risk Profile" onClick={() => onNav && onNav("riskprofile")} />
        : sr > 15 ? <Nudge tone="emerald" text="Strong saver! Ready to put that surplus to work?" ctaLabel="Go to Portfolio" onClick={() => onNav && onNav("portfolio")} />
        : null}
      <Suggest onNav={onNav} items={[...(dti > 28 ? [{ icon: "L", text: "High debt — try Loans & Debt", nav: "loans" }] : []), ...(sr > 15 ? [{ icon: "I", text: "Strong saver — check Investments", nav: "investments" }] : []), ...(!riskType ? [{ icon: "R", text: "Set your Risk Profile for personalized advice", nav: "riskprofile" }] : [])]} />
    </div>
  );
}

// ============================================================
// INVESTMENT ANALYZER
// ============================================================
function Investments({ jargonFree: jf, riskType }) {
  const [mode, setMode] = useState("stock");
  const [stock, setStock] = useState({ name: "Sample Corp", price: 150, eps: 8.5, bookValue: 45, revenue: 5e9, netIncome: 750e6, totalAssets: 8e9, totalEquity: 3.5e9, totalDebt: 2.5e9, dividendPS: 3.2, shares: 1e8, growth: 12, curAssets: 3e9, curLiab: 2e9 });
  const us = (k) => (v) => setStock(p => ({ ...p, [k]: v }));
  const [bond, setBond] = useState({ face: 1000, coupon: 5, yrs: 10, price: 950, freq: 2, treasury: 4.25 });
  const ub = (k) => (v) => setBond(p => ({ ...p, [k]: v }));
  const [crypto, setCrypto] = useState({ name: "Bitcoin", price: 65000, mcap: 1.27e12, circSupply: 19.5e6, maxSupply: 21e6, vol24: 25e9, ath: 73750, vol30d: 45, spCorr: 0.35, emissionRate: 1.7, stakingYield: 0, burnRate: 0, vestedPct: 93, vestUnlockMonths: 12 });
  const uc = (k) => (v) => setCrypto(p => ({ ...p, [k]: v }));
  const pe = stock.eps > 0 ? stock.price / stock.eps : 0;
  const pb = stock.bookValue > 0 ? stock.price / stock.bookValue : 0;
  const roe = stock.totalEquity > 0 ? (stock.netIncome / stock.totalEquity) * 100 : 0;
  const roa = stock.totalAssets > 0 ? (stock.netIncome / stock.totalAssets) * 100 : 0;
  const de = stock.totalEquity > 0 ? stock.totalDebt / stock.totalEquity : 0;
  const dy = stock.price > 0 ? (stock.dividendPS / stock.price) * 100 : 0;
  const mc = stock.price * stock.shares;
  const nm = stock.revenue > 0 ? (stock.netIncome / stock.revenue) * 100 : 0;
  const ytm = useMemo(() => {
    if (!(bond.price > 0) || !(bond.freq > 0) || !(bond.yrs > 0)) return NaN;
    const C = (bond.face * bond.coupon / 100) / bond.freq; const n = bond.yrs * bond.freq;
    let r = Math.max(0.0001, C / bond.price);
    for (let i = 0; i < 100; i++) { const pv = C * (1 - Math.pow(1 + r, -n)) / r + bond.face * Math.pow(1 + r, -n); const dp = -C * (-n * Math.pow(1 + r, -n - 1) * r - (1 - Math.pow(1 + r, -n))) / (r * r) + bond.face * (-n) * Math.pow(1 + r, -n - 1); if (!Number.isFinite(dp) || dp === 0) break; if (Math.abs(pv - bond.price) < 0.001) break; r -= (pv - bond.price) / dp; if (r <= 0) r = 0.001; }
    const out = r * bond.freq * 100;
    return Number.isFinite(out) ? out : NaN;
  }, [bond]);
  const spread = ytm - bond.treasury;
  const supPct = crypto.maxSupply > 0 ? (crypto.circSupply / crypto.maxSupply) * 100 : 100;
  const fromATH = crypto.ath > 0 ? ((crypto.price - crypto.ath) / crypto.ath) * 100 : 0;
  const volMcap = crypto.mcap > 0 ? (crypto.vol24 / crypto.mcap) * 100 : 0;
  const fdv = crypto.maxSupply > 0 ? crypto.price * crypto.maxSupply : crypto.mcap;
  const annualEmission = crypto.circSupply * crypto.emissionRate / 100;
  const realYield = crypto.stakingYield - crypto.emissionRate;
  const unvestedTokens = crypto.circSupply * (100 - crypto.vestedPct) / 100;
  const dilutionImpact = crypto.circSupply > 0 ? (unvestedTokens / crypto.circSupply) * 100 : 0;
  const stockActions = [];
  if (pe > 25) stockActions.push({ title: `P/E is ${pe.toFixed(1)}x — ${jf ? "you're paying a lot for profits" : "consider whether growth justifies premium"}`, detail: jf ? "This stock costs more per dollar of profit than average." : "High P/E can indicate overvaluation unless justified by strong earnings growth." });
  if (de > 2) stockActions.push({ title: `${jf ? "Heavy borrowing" : "Leverage"} at ${de.toFixed(1)}x`, detail: jf ? "This company owes more than twice what it owns." : "Debt/equity above 2x increases financial risk." });
  if (roe > 15 && pe < 20) stockActions.push({ title: "Potentially undervalued", detail: `Strong ROE (${roe.toFixed(0)}%) with moderate P/E (${pe.toFixed(0)}x).` });
  if (stockActions.length === 0) stockActions.push({ title: "Metrics look reasonable", detail: "No major red or green flags. Consider comparing to industry peers." });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Investing" sub={jf ? "Understand what you're buying before you buy it" : "Stocks, bonds, and crypto with plain-English analysis"}>Investment Analyzer</Title>
      <div className="flex gap-2 mb-6">
        <Btn onClick={() => setMode("stock")} v={mode === "stock" ? "primary" : "secondary"}>Stocks</Btn>
        <Btn onClick={() => setMode("bond")} v={mode === "bond" ? "primary" : "secondary"}>Bonds</Btn>
        <Btn onClick={() => setMode("crypto")} v={mode === "crypto" ? "primary" : "secondary"}>Crypto</Btn>
      </div>
      {mode === "stock" && <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><F label="Company" value={stock.name} onChange={us("name")} type="text" small /><F label="Price" value={stock.price} onChange={us("price")} prefix="$" small /><F label={jf ? "Profit Per Share" : "EPS"} value={stock.eps} onChange={us("eps")} prefix="$" small /><F label={jf ? "Book Value/Share" : "BVPS"} value={stock.bookValue} onChange={us("bookValue")} prefix="$" small /><F label="Dividend/Share" value={stock.dividendPS} onChange={us("dividendPS")} prefix="$" small /></div>
          <div><F label="Revenue" value={stock.revenue} onChange={us("revenue")} prefix="$" small /><F label="Net Income" value={stock.netIncome} onChange={us("netIncome")} prefix="$" small /><F label="Total Assets" value={stock.totalAssets} onChange={us("totalAssets")} prefix="$" small /><F label="Total Equity" value={stock.totalEquity} onChange={us("totalEquity")} prefix="$" small /></div>
          <div><F label="Total Debt" value={stock.totalDebt} onChange={us("totalDebt")} prefix="$" small /><F label="Shares Outstanding" value={stock.shares} onChange={us("shares")} small /><F label="Revenue Growth" value={stock.growth} onChange={us("growth")} suffix="%" small /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Market Cap</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{mc >= 1e9 ? "$" + (mc / 1e9).toFixed(1) + "B" : "$" + (mc / 1e6).toFixed(0) + "M"}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Cash Yield" : "Div Yield"}</div><div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mt-1">{dy.toFixed(2)}%</div><Bench value={dy} avg={1.3} label="S&P 500 avg" /></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Growth</div><div className={`text-lg font-bold mt-1 ${stock.growth >= 10 ? "text-emerald-600 dark:text-emerald-300" : "text-amber-500"}`}>{stock.growth}%</div></Card>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Card><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">{jf ? "Is It Cheap or Expensive?" : "Valuation"}</h3>
            <Bar value={pe} min={0} max={50} good={10} bad={30} label={jf ? "Price vs Profit (P/E)" : "P/E Ratio"} display={pe.toFixed(1) + "x"} info={jf ? "How many dollars you pay for each dollar of annual profit." : "Price-to-Earnings."} /><Bench value={pe} avg={20} label="S&P avg P/E" />
            <Bar value={pb} min={0} max={8} good={1} bad={5} label={jf ? "Price vs Book Value" : "P/B Ratio"} display={pb.toFixed(2) + "x"} />
            <Bar value={nm} min={0} max={30} good={10} bad={3} label={jf ? "Profit Margin" : "Net Margin"} display={$(nm, "%")} />
          </Card>
          <Card><h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-3">{jf ? "Is It Healthy?" : "Financial Health"}</h3>
            <Bar value={roe} min={0} max={40} good={15} bad={5} label={jf ? "Return on Owner Money" : "ROE"} display={$(roe, "%")} /><Bench value={roe} avg={15} label="Good benchmark" />
            <Bar value={roa} min={0} max={20} good={8} bad={2} label={jf ? "Return on Everything Owned" : "ROA"} display={$(roa, "%")} />
            <Bar value={de} min={0} max={4} good={0.5} bad={2.5} label={jf ? "Borrowing Level" : "Debt/Equity"} display={$(de, "x")} />
          </Card>
        </div>
        <ActionBtn beginner={jf} actions={stockActions} perspectives={{
          conservative: [
            ...(pe > 20 ? [{ title: `P/E of ${pe.toFixed(1)}x is above your comfort zone`, detail: "Conservative investors should target P/E under 18. Look for value, not growth." }] : []),
            ...(dy < 2 ? [{ title: "Low dividend yield — look for income-generators", detail: "Target 3%+ dividend yield for reliable cash flow." }] : [{ title: `${dy.toFixed(1)}% yield is solid for income`, detail: "Check the payout ratio to make sure it's sustainable." }]),
            { title: "Check debt levels before buying", detail: de > 1 ? `Debt/Equity is ${de.toFixed(1)}x — that's higher than ideal for conservative portfolios.` : "Debt levels look manageable." },
          ],
          balanced: stockActions,
          aggressive: [
            ...(stock.growth > 15 ? [{ title: `${stock.growth}% growth justifies a premium valuation`, detail: "Fast growers deserve higher P/E. Focus on revenue acceleration, not current price." }] : []),
            ...(roe > 20 ? [{ title: `ROE of ${roe.toFixed(0)}% — this is a compounder`, detail: "High returns on equity compound wealth. Consider a large position." }] : []),
            { title: "Size the position based on conviction", detail: "If fundamentals are strong, 5-10% of portfolio is appropriate for high-conviction names." },
          ],
        }} />
      </>}
      {mode === "bond" && <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><F label="Face Value" value={bond.face} onChange={ub("face")} prefix="$" /><F label="Coupon Rate" value={bond.coupon} onChange={ub("coupon")} suffix="%" /></div>
          <div><F label="Years to Maturity" value={bond.yrs} onChange={ub("yrs")} /><F label="Current Price" value={bond.price} onChange={ub("price")} prefix="$" /></div>
          <div><F label="Payments/Year" value={bond.freq} onChange={ub("freq")} /><F label="10-Yr Treasury" value={bond.treasury} onChange={ub("treasury")} suffix="%" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Total Return If You Hold" : "YTM"}<Tip text={jf ? "Your total yearly return if you hold until maturity." : "Yield to Maturity."} /></div><div className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">{Number.isFinite(ytm) ? ytm.toFixed(2) + "%" : "—"}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Extra vs Safe Rate" : "Spread vs Treasury"}</div><div className={`text-xl font-bold mt-1 ${spread > 2 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-300"}`}>{Number.isFinite(spread) ? (spread >= 0 ? "+" : "") + spread.toFixed(2) + "%" : "—"}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Status</div><div className={`text-xl font-bold mt-1 ${bond.price < bond.face ? "text-emerald-600 dark:text-emerald-300" : "text-amber-500"}`}>{bond.price < bond.face ? "Discount" : "Premium"}</div></Card>
        </div>
      </>}
      {mode === "crypto" && <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div><F label="Asset" value={crypto.name} onChange={uc("name")} type="text" small /><F label="Price" value={crypto.price} onChange={uc("price")} prefix="$" small /><F label="Market Cap" value={crypto.mcap} onChange={uc("mcap")} prefix="$" small /><F label="24h Volume" value={crypto.vol24} onChange={uc("vol24")} prefix="$" small /></div>
          <div><F label="Circulating Supply" value={crypto.circSupply} onChange={uc("circSupply")} small /><F label="Max Supply (0=unlimited)" value={crypto.maxSupply} onChange={uc("maxSupply")} small /><F label="All-Time High" value={crypto.ath} onChange={uc("ath")} prefix="$" small /><F label="30-Day Volatility" value={crypto.vol30d} onChange={uc("vol30d")} suffix="%" small /></div>
          <div>
            <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">Tokenomics</h3>
            <F label={jf ? "New Coins Per Year %" : "Annual Emission Rate"} value={crypto.emissionRate} onChange={uc("emissionRate")} suffix="%" small info={jf ? "How many new coins are created each year." : "New token supply entering circulation annually."} />
            <F label={jf ? "Staking Reward" : "Staking APY"} value={crypto.stakingYield} onChange={uc("stakingYield")} suffix="%" small />
            <F label={jf ? "Coins Burned Per Year %" : "Annual Burn Rate"} value={crypto.burnRate} onChange={uc("burnRate")} suffix="%" small />
            <F label={jf ? "% Already Released" : "Vested %"} value={crypto.vestedPct} onChange={uc("vestedPct")} suffix="%" small />
            <F label={jf ? "Months Until Next Unlock" : "Vest Unlock (months)"} value={crypto.vestUnlockMonths} onChange={uc("vestUnlockMonths")} small />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Market Cap</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{crypto.mcap >= 1e12 ? "$" + (crypto.mcap / 1e12).toFixed(2) + "T" : "$" + (crypto.mcap / 1e9).toFixed(1) + "B"}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Distance from Peak" : "From ATH"}</div><div className={`text-lg font-bold mt-1 ${fromATH >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{fromATH.toFixed(1)}%</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Supply Released" : "Supply Mined"}</div><div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mt-1">{supPct.toFixed(1)}%</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Trading Activity" : "Vol/MCap"}</div><div className={`text-lg font-bold mt-1 ${volMcap > 5 ? "text-emerald-600 dark:text-emerald-300" : volMcap > 1 ? "text-amber-500" : "text-red-500"}`}>{volMcap.toFixed(1)}%</div></Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">{jf ? "Supply Economics" : "Tokenomics Analysis"}</h3>
            <Bar value={crypto.emissionRate} min={0} max={15} good={0} bad={5} label={jf ? "New Coins/Year" : "Emission Rate"} display={crypto.emissionRate + "%"} />
            <Bar value={realYield} min={-10} max={10} good={0} bad={-2} label={jf ? "Real Reward (after dilution)" : "Real Yield"} display={realYield.toFixed(1) + "%"} />
            <Bar value={crypto.burnRate} min={0} max={5} good={1} bad={0} label={jf ? "Coins Destroyed/Year" : "Burn Rate"} display={crypto.burnRate + "%"} />
            <div className="mt-2 p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg text-xs">
              <div className="flex justify-between"><span className="text-slate-500 dark:text-[#a3acba]">{jf ? "Net Inflation" : "Net Supply Change"}</span><span className={`font-bold ${(crypto.emissionRate - crypto.burnRate) > 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-300"}`}>{(crypto.emissionRate - crypto.burnRate) > 0 ? "+" : ""}{(crypto.emissionRate - crypto.burnRate).toFixed(1)}%/yr</span></div>
              <div className="flex justify-between mt-1"><span className="text-slate-500 dark:text-[#a3acba]">{jf ? "Full Value (all coins)" : "Fully Diluted Value"}</span><span className="font-bold text-slate-700 dark:text-[#dde3ec]">{fdv >= 1e12 ? "$" + (fdv / 1e12).toFixed(2) + "T" : "$" + (fdv / 1e9).toFixed(1) + "B"}</span></div>
            </div>
          </Card>
          <Card><h3 className="text-sm font-bold text-amber-700 dark:text-amber-200 mb-3">{jf ? "Risk Factors" : "Risk Assessment"}</h3>
            <Bar value={crypto.vol30d} min={0} max={100} good={20} bad={60} label={jf ? "Price Swings (30 day)" : "Volatility"} display={crypto.vol30d + "%"} />
            <Bar value={dilutionImpact} min={0} max={50} good={5} bad={20} label={jf ? "Locked Coins (sell risk)" : "Unvested Dilution"} display={dilutionImpact.toFixed(1) + "%"} />
            <Bar value={crypto.spCorr} min={-1} max={1} good={0} bad={0.8} label={jf ? "Moves With Stocks?" : "S&P Correlation"} display={crypto.spCorr.toFixed(2)} />
            {crypto.vestUnlockMonths <= 3 && <div className="mt-2 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-xs text-red-700 dark:text-red-300 font-medium">Vesting unlock in {crypto.vestUnlockMonths} months — watch for selling pressure.</div>}
            {realYield < 0 && <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-xs text-amber-700 dark:text-amber-200 font-medium">{jf ? "Staking doesn't cover inflation." : "Negative real yield — staking doesn't compensate for emission dilution."}</div>}
          </Card>
        </div>
      </>}
    </div>
  );
}

// ============================================================
// PORTFOLIO TRACKER
// ============================================================
function Portfolio({ jargonFree: jf, riskType, onNav, onEngage, toured, onDismissTour }) {
  const TYPES = ["Stock", "ETF", "Bond", "Crypto", "Gold/Silver", "Real Estate", "Cash", "Other"];
  const TYPE_COLORS = { Stock: "bg-blue-400", ETF: "bg-indigo-400", Bond: "bg-emerald-400", Crypto: "bg-amber-400", "Gold/Silver": "bg-yellow-400", "Real Estate": "bg-violet-400", Cash: "bg-slate-300 dark:bg-[#3a414d]", Other: "bg-pink-400" };
  const PORTFOLIO_SAMPLE = [
    { name: "AAPL", type: "Stock", qty: 25, costBasis: 145, current: 195 },
    { name: "VOO", type: "ETF", qty: 30, costBasis: 380, current: 520 },
    { name: "Bitcoin", type: "Crypto", qty: 0.5, costBasis: 42000, current: 65000 },
    { name: "US Treasury 10Y", type: "Bond", qty: 10, costBasis: 950, current: 980 },
    { name: "Gold (oz)", type: "Gold/Silver", qty: 5, costBasis: 1950, current: 2350 },
    { name: "Rental Property", type: "Real Estate", qty: 1, costBasis: 280000, current: 340000 },
    { name: "Savings", type: "Cash", qty: 1, costBasis: 25000, current: 25000 },
  ];
  // Stable ids so edit/delete always target the right holding after sorting (and survive duplicate names).
  const [holdings, setHoldings] = useState(PORTFOLIO_SAMPLE.map((h, i) => ({ ...h, id: i + 1 })));
  const [sortBy, setSortBy] = useState("value");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [edited, setEdited] = useState(false);
  const nextId = (hs) => hs.reduce((m, h) => Math.max(m, h.id || 0), 0) + 1;
  const resetToSample = () => { setHoldings(PORTFOLIO_SAMPLE.map((h, i) => ({ ...h, id: i + 1 }))); setEdited(false); };
  const clearAll = () => { setHoldings([]); setEdited(true); };

  const updateH = (id, k, v) => { setHoldings(hs => hs.map(h => h.id === id ? { ...h, [k]: v } : h)); setEdited(true); };
  const addH = () => { setHoldings(hs => [...hs, { id: nextId(hs), name: "New Asset", type: "Stock", qty: 1, costBasis: 100, current: 100 }]); setEdited(true); };
  const removeH = (id) => { setHoldings(hs => hs.filter(h => h.id !== id)); setEdited(true); };

  const analyzed = holdings.map(h => {
    const costTotal = h.qty * h.costBasis;
    const currentTotal = h.qty * h.current;
    const gain = currentTotal - costTotal;
    const gainPct = costTotal > 0 ? (gain / costTotal) * 100 : 0;
    return { ...h, costTotal, currentTotal, gain, gainPct };
  });

  const totalValue = analyzed.reduce((s, h) => s + h.currentTotal, 0);
  const totalCost = analyzed.reduce((s, h) => s + h.costTotal, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  // Allocation by type
  const alloc = {};
  analyzed.forEach(h => { alloc[h.type] = (alloc[h.type] || 0) + h.currentTotal; });
  const allocEntries = Object.entries(alloc).sort((a, b) => b[1] - a[1]);

  // Diversification score (0-100): more types + more even spread = higher
  const typeCount = allocEntries.length;
  const typeMax = TYPES.length;
  const hhi = allocEntries.reduce((s, [, v]) => { const w = totalValue > 0 ? v / totalValue : 0; return s + w * w; }, 0);
  const diversScore = Math.min(100, Math.round((typeCount / typeMax * 40) + ((1 - hhi) * 60)));

  // Sort holdings
  const sorted = [...analyzed].sort((a, b) => sortBy === "value" ? b.currentTotal - a.currentTotal : sortBy === "gain" ? b.gain - a.gain : sortBy === "gainPct" ? b.gainPct - a.gainPct : 0);

  // Top/bottom performers
  const top = [...analyzed].sort((a, b) => b.gainPct - a.gainPct)[0];
  const bottom = [...analyzed].sort((a, b) => a.gainPct - b.gainPct)[0];

  // Actions
  const actions = [];
  const maxAlloc = allocEntries.length > 0 ? allocEntries[0] : null;
  if (maxAlloc && totalValue > 0 && maxAlloc[1] / totalValue > 0.5) actions.push({ title: `${maxAlloc[0]} is ${((maxAlloc[1] / totalValue) * 100).toFixed(0)}% of your portfolio`, detail: jf ? "Having more than half your money in one type is risky. Consider spreading it around." : "Concentration above 50% in one asset class increases risk. Consider rebalancing." });
  if (typeCount <= 2) actions.push({ title: jf ? "Spread your money across more types" : "Increase diversification", detail: `You only have ${typeCount} asset type${typeCount > 1 ? "s" : ""}. Adding bonds, gold, or real estate reduces overall risk.` });
  if (bottom && bottom.gainPct < -15) actions.push({ title: `Review ${bottom.name} (down ${bottom.gainPct.toFixed(1)}%)`, detail: jf ? "This is your worst performer. Decide if you still believe in it or if it's time to cut losses." : "Evaluate whether the thesis still holds or consider tax-loss harvesting." });
  if (actions.length === 0) actions.push({ title: jf ? "Your portfolio looks balanced" : "Portfolio is well-structured", detail: "Keep monitoring and rebalance quarterly if allocations drift significantly." });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Investing" sub={jf ? "Everything you own, all in one place" : "Track all asset classes — stocks, bonds, crypto, gold, real estate, and more"}>Portfolio Tracker</Title>

      <Coachmark dismissed={toured?.portfolio} onDismiss={() => onDismissTour && onDismissTour("portfolio")} steps={[
        { title: "Step 1: List your holdings", body: "Below this row are your assets. Replace the example AAPL/Bitcoin/etc. with what you actually own. Quantity × Cost Basis = what you paid; Quantity × Current = what it's worth now." },
        { title: "Step 2: Read your diversification", body: "The Diversification ring tells you whether your money is spread out. Concentration risk (one asset > 50%) is what wipes people out in a crash." },
        { title: "Step 3: Run Full Analysis", body: "At the bottom is a Run Full Analysis button. It gives a letter grade, finds your top concentration risks, and suggests rebalancing actions." },
      ]} />

      {!edited && <SampleBanner onReset={clearAll} />}
      {edited && <div className="mb-3 flex justify-end"><button onClick={resetToSample} className="text-xs text-slate-500 dark:text-[#a3acba] hover:text-slate-700 underline">↺ Restore example portfolio</button></div>}

      {holdings.length === 0 && (<Card className="mb-4 text-center bg-slate-50 dark:bg-[#15171c] border-dashed">
        <div className="text-3xl mb-2">📊</div>
        <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-1">No holdings yet</h3>
        <p className="text-xs text-slate-500 dark:text-[#a3acba] mb-3">Add your first asset below to see your value, gains, and diversification.</p>
        <Btn onClick={addH} v="success">+ Add your first holding</Btn>
      </Card>)}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        <Card accent="neutral"><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "Total Value" : "Portfolio Value"}</div><div className="text-3xl font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(totalValue)}</div><div className="h-0.5 w-12 mt-1 rounded-full bg-sky-400" /></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "What You Put In" : "Total Cost"}</div><div className="text-2xl font-bold text-slate-600 dark:text-[#c4ccd8] mt-1">{$(totalCost)}</div></Card>
        <Card accent={totalGain >= 0 ? "good" : "bad"}><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "Total Profit/Loss" : "Unrealized P&L"}<Tip text={jf ? "How much you've gained or lost on paper. Not real until you sell." : "Paper gains/losses on holdings you haven't sold."} /></div><div className={`text-3xl font-bold mt-1 ${totalGain >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(totalGain)}</div><div className={`h-0.5 w-12 mt-1 rounded-full ${totalGain >= 0 ? "bg-emerald-400" : "bg-red-400"}`} /><div className="text-xs text-slate-400 dark:text-[#828b9a] mt-1">{$(totalGainPct, "%")}</div></Card>
        <Card accent={holdings.length === 0 ? "neutral" : diversScore >= 65 ? "good" : diversScore >= 40 ? "neutral" : "bad"}><div className="flex items-center gap-2"><Ring score={holdings.length === 0 ? 0 : diversScore} max={100} size={70} color={holdings.length === 0 ? "indigo" : diversScore >= 65 ? "green" : diversScore >= 40 ? "yellow" : "red"} /><div><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "How Spread Out" : "Diversification"}</div><div className="text-sm font-bold text-slate-700 dark:text-[#dde3ec]">{holdings.length === 0 ? "—" : diversScore >= 65 ? "Good" : diversScore >= 40 ? "Fair" : "Low"}</div><WhyMatters text={`Concentration risk — HHI of ${(hhi * 10000).toFixed(0)} (under 2,500 is well-diversified). Above 2,500 means a single asset class dominates, and a downturn in that class would hurt you disproportionately.`} /></div></div></Card>
      </div>

      {/* Allocation Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">{jf ? "Where Your Money Is" : "Asset Allocation"}</h3>
          <div className="flex h-6 rounded-full overflow-hidden mb-3">
            {allocEntries.map(([type, val]) => <div key={type} className={`${TYPE_COLORS[type] || "bg-slate-300 dark:bg-[#3a414d]"} transition-all`} style={{ width: `${totalValue > 0 ? (val / totalValue) * 100 : 0}%` }} title={`${type}: ${((val / totalValue) * 100).toFixed(1)}%`} />)}
          </div>
          {allocEntries.map(([type, val]) => (
            <div key={type} className="flex items-center gap-2 mb-1.5">
              <div className={`w-3 h-3 rounded ${TYPE_COLORS[type] || "bg-slate-300 dark:bg-[#3a414d]"}`} />
              <span className="text-xs text-slate-600 dark:text-[#c4ccd8] flex-1">{type}</span>
              <span className="text-xs font-semibold">{$(val)}</span>
              <span className="text-xs text-slate-400 dark:text-[#828b9a] w-12 text-right">{totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0}%</span>
            </div>
          ))}
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-3">{jf ? "Best & Worst" : "Performance Highlights"}</h3>
          {top && <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg mb-2"><div className="text-xs text-emerald-500 font-semibold">{jf ? "Best Performer" : "Top Gainer"}</div><div className="flex items-center justify-between mt-1"><span className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{top.name}</span><span className="text-sm font-bold text-emerald-600 dark:text-emerald-300">+{top.gainPct.toFixed(1)}% ({$(top.gain)})</span></div></div>}
          {bottom && <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg mb-2"><div className="text-xs text-red-500 font-semibold">{jf ? "Worst Performer" : "Laggard"}</div><div className="flex items-center justify-between mt-1"><span className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{bottom.name}</span><span className={`text-sm font-bold ${bottom.gainPct >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{bottom.gainPct >= 0 ? "+" : ""}{bottom.gainPct.toFixed(1)}% ({$(bottom.gain)})</span></div></div>}
          <div className="mt-3 text-xs text-slate-500 dark:text-[#a3acba]">
            <div className="flex justify-between mb-1"><span>Holdings</span><span className="font-bold">{holdings.length}</span></div>
            <div className="flex justify-between mb-1"><span>Asset Types</span><span className="font-bold">{typeCount}</span></div>
            <div className="flex justify-between"><span>{jf ? "Concentration" : "HHI"}<Tip text={jf ? "How concentrated your portfolio is. Lower is more diversified." : "Herfindahl-Hirschman Index. Lower means more diversified."} /></span><span className="font-bold">{(hhi * 10000).toFixed(0)}</span></div>
          </div>
        </Card>
      </div>

      {/* Holdings Table */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{jf ? "Your Holdings" : "All Holdings"}</h3>
          <div className="flex gap-2">
            <span className="text-xs text-slate-400 dark:text-[#828b9a] self-center">Sort:</span>
            {[["value", "Value"], ["gain", "Gain $"], ["gainPct", "Gain %"]].map(([id, l]) => <Btn key={id} onClick={() => setSortBy(id)} v={sortBy === id ? "primary" : "secondary"}>{l}</Btn>)}
            <Btn onClick={addH} v="success">+ Add</Btn>
          </div>
        </div>
        <div className="overflow-x-auto -mx-1 px-1">
        {sorted.map((h) => {
          return (
            <div key={h.id} className="flex gap-2 mb-2 items-end min-w-max">
              <div className="w-28"><label className="block text-xs text-slate-400 dark:text-[#828b9a] mb-0.5">Name</label><input type="text" value={h.name} onChange={e => updateH(h.id, "name", e.target.value)} className="bg-white dark:bg-[#1c1f26] w-full px-2 py-1 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none" /></div>
              <div className="w-24"><F label="Type" value={h.type} onChange={v => updateH(h.id, "type", v)} type="text" options={TYPES.map(t => ({ value: t, label: t }))} small /></div>
              <div className="w-20"><F label="Qty" value={h.qty} onChange={v => updateH(h.id, "qty", v)} small /></div>
              <div className="w-24"><F label={jf ? "Bought At" : "Cost/Unit"} value={h.costBasis} onChange={v => updateH(h.id, "costBasis", v)} prefix="$" small /></div>
              <div className="w-24"><F label={jf ? "Price Now" : "Current"} value={h.current} onChange={v => updateH(h.id, "current", v)} prefix="$" small /></div>
              <div className="pb-1 w-20 text-right"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{$(h.currentTotal)}</div><div className={`text-xs font-bold ${h.gain >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{h.gain >= 0 ? "+" : ""}{$(h.gainPct, "%")}</div></div>
              <button onClick={() => removeH(h.id)} aria-label="Remove holding" className="text-red-500 text-xs pb-1 hover:text-red-600">✕</button>
            </div>
          );
        })}
        </div>
      </Card>

      <RunAnalysisBtn onClick={() => { setShowAnalysis(!showAnalysis); if (onEngage) onEngage({ hhi: Math.round(hhi * 10000) }); }} />
      {showAnalysis && <AnalysisReport
        grade={diversScore >= 75 && totalGainPct > 5 ? "A" : diversScore >= 55 ? "B" : diversScore >= 40 ? "C" : "D"}
        gradeColor={diversScore >= 60 ? "green" : diversScore >= 40 ? "amber" : "red"}
        findings={[
          { good: diversScore >= 60, text: `Diversification score: ${diversScore}/100 ${diversScore >= 60 ? "(well spread)" : "(too concentrated)"}` },
          { good: totalGainPct > 0, text: `Overall return: ${totalGainPct.toFixed(1)}% ${totalGainPct > 0 ? "(positive)" : "(losing money)"}` },
          { good: typeCount >= 4, text: `Asset types: ${typeCount} ${typeCount >= 4 ? "(good variety)" : "(need more diversity)"}` },
          ...(top ? [{ good: top.gainPct > 10, text: `Best performer: ${top.name} at +${top.gainPct.toFixed(1)}%` }] : []),
        ]}
        topPriority={diversScore < 40 ? "Diversify — add more asset types to reduce risk" : maxAlloc && totalValue > 0 && maxAlloc[1] / totalValue > 0.5 ? `Rebalance — ${maxAlloc[0]} is ${((maxAlloc[1] / totalValue) * 100).toFixed(0)}% of portfolio` : "Monitor and rebalance quarterly"}
        priorityLevel={diversScore >= 60 ? "good" : diversScore >= 40 ? "okay" : "bad"}
      />}

      <ActionBtn beginner={jf} actions={actions} perspectives={{
        conservative: [
          { title: "Keep 20%+ in bonds and cash", detail: "Stability matters more than growth. Build a floor your portfolio can't fall through." },
          { title: "Focus on dividend-paying stocks", detail: "Income-generating assets smooth out volatility and compound over time." },
          ...(diversScore < 60 ? [{ title: "Diversify across at least 5 asset types", detail: "More types = more protection. Add bonds, gold, or REITs." }] : []),
          { title: "Rebalance quarterly to target allocation", detail: "Don't let winners grow into concentration risk. Trim and redistribute." },
        ],
        balanced: actions,
        aggressive: [
          { title: "Concentrate on your highest-conviction bets", detail: "Diversification protects wealth. Concentration builds it. Size up your winners." },
          ...(totalGain > 5000 ? [{ title: "Let winners run, cut losers fast", detail: "Don't sell winners to rebalance. Trim losers and redeploy." }] : []),
          { title: "Consider leveraged ETFs or options for core positions", detail: "Use leverage tactically on positions you have high conviction in." },
          { title: "Allocate 5-15% to high-risk / high-reward plays", detail: "Small positions in crypto, growth stocks, or startups can drive outsized returns." },
        ],
      }} />
      <Suggest onNav={onNav} items={[
        ...(totalGain > 5000 ? [{ icon: "T", text: "Significant gains — check Tax Calculator", nav: "tax" }] : []),
        ...(diversScore < 50 ? [{ icon: "I", text: "Low diversification — explore Investments", nav: "investments" }] : []),
        { icon: "S", text: "Run a Stress Test on your portfolio", nav: "stresstest" },
        ...(!riskType ? [{ icon: "R", text: "Set your Risk Profile for personalized advice", nav: "riskprofile" }] : []),
      ]} />
    </div>
  );
}

// ============================================================
// MARKET LAB (Charts, Technical Analysis, Signals, Sentiment)
// ============================================================
function MarketLab({ jargonFree: jf }) {
  // Generate sample price data (60 days)
  const generatePrices = (base, vol) => {
    const prices = []; let p = base;
    for (let i = 0; i < 60; i++) { p = p * (1 + (Math.random() - 0.48) * vol / 100); prices.push({ day: i + 1, close: Math.round(p * 100) / 100, high: Math.round((p * (1 + Math.random() * vol / 200)) * 100) / 100, low: Math.round((p * (1 - Math.random() * vol / 200)) * 100) / 100, vol: Math.round(1e6 + Math.random() * 5e6) }); }
    return prices;
  };

  const [asset, setAsset] = useState({ name: "AAPL", basePrice: 190, volatility: 2.5 });
  const [prices, setPrices] = useState(() => generatePrices(190, 2.5));
  const [smaPeriod1, setSmaPeriod1] = useState(20);
  const [smaPeriod2, setSmaPeriod2] = useState(50);
  const [emaPeriod, setEmaPeriod] = useState(21);
  const [showIndicators, setShowIndicators] = useState({ sma1: true, sma2: true, ema: false, rsi: true, macd: true, bollinger: false, srsi: false });
  const [chartType, setChartType] = useState("candle"); // "candle" or "line"
  const [showVolume, setShowVolume] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [news, setNews] = useState([
    { headline: "Strong Q4 earnings beat estimates", sentiment: "bullish" },
    { headline: "New product launch next quarter", sentiment: "bullish" },
    { headline: "CEO sells 10% stake", sentiment: "bearish" },
  ]);

  const regenPrices = () => setPrices(generatePrices(asset.basePrice, asset.volatility));

  // SMA
  const calcSMA = (data, period) => data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((s, d) => s + d.close, 0) / period;
  });

  // EMA
  const calcEMA = (data, period) => {
    const k = 2 / (period + 1); const ema = [data[0].close];
    for (let i = 1; i < data.length; i++) ema.push(data[i].close * k + ema[i - 1] * (1 - k));
    return ema;
  };

  // RSI
  const calcRSI = (data, period = 14) => {
    const rsi = new Array(data.length).fill(null);
    for (let i = period; i < data.length; i++) {
      let gains = 0, losses = 0;
      for (let j = i - period + 1; j <= i; j++) { const d = data[j].close - data[j - 1].close; if (d > 0) gains += d; else losses -= d; }
      const rs = losses > 0 ? gains / losses : 100;
      rsi[i] = 100 - 100 / (1 + rs);
    }
    return rsi;
  };

  // MACD
  const calcMACD = (data) => {
    const ema12 = calcEMA(data, 12); const ema26 = calcEMA(data, 26);
    const macdLine = ema12.map((v, i) => v - ema26[i]);
    const signal = []; let s = macdLine[0];
    const k = 2 / 10;
    for (let i = 0; i < macdLine.length; i++) { s = macdLine[i] * k + s * (1 - k); signal.push(s); }
    return { macd: macdLine, signal, histogram: macdLine.map((v, i) => v - signal[i]) };
  };

  // Bollinger Bands
  const calcBollinger = (data, period = 20, mult = 2) => {
    return data.map((_, i) => {
      if (i < period - 1) return { upper: null, lower: null, mid: null };
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((s, d) => s + d.close, 0) / period;
      const std = Math.sqrt(slice.reduce((s, d) => s + Math.pow(d.close - mean, 2), 0) / period);
      return { upper: mean + mult * std, lower: mean - mult * std, mid: mean };
    });
  };

  const sma1 = useMemo(() => calcSMA(prices, smaPeriod1), [prices, smaPeriod1]);
  const sma2 = useMemo(() => calcSMA(prices, smaPeriod2), [prices, smaPeriod2]);
  const emaLine = useMemo(() => calcEMA(prices, emaPeriod), [prices, emaPeriod]);
  const rsi = useMemo(() => calcRSI(prices), [prices]);
  const macd = useMemo(() => calcMACD(prices), [prices]);
  const bollinger = useMemo(() => calcBollinger(prices), [prices]);

  // Stochastic RSI
  const calcSRSI = (rsiData, period = 14) => {
    const srsi = new Array(rsiData.length).fill(null);
    for (let i = period; i < rsiData.length; i++) {
      if (rsiData[i] === null) continue;
      const slice = rsiData.slice(i - period + 1, i + 1).filter(v => v !== null);
      if (slice.length < period) continue;
      const min = Math.min(...slice);
      const max = Math.max(...slice);
      srsi[i] = max !== min ? ((rsiData[i] - min) / (max - min)) * 100 : 50;
    }
    // %K = 3-period SMA of StochRSI
    const k = srsi.map((_, i) => {
      if (i < 2 || srsi[i] === null || srsi[i-1] === null || srsi[i-2] === null) return null;
      return (srsi[i] + srsi[i-1] + srsi[i-2]) / 3;
    });
    // %D = 3-period SMA of %K
    const d = k.map((_, i) => {
      if (i < 2 || k[i] === null || k[i-1] === null || k[i-2] === null) return null;
      return (k[i] + k[i-1] + k[i-2]) / 3;
    });
    return { k, d };
  };
  const srsi = calcSRSI(rsi);

  // Generate signals
  const signals = useMemo(() => {
    const sigs = [];
    const lastRSI = rsi[rsi.length - 1];
    const prevRSI = rsi[rsi.length - 2];
    const lastMACD = macd.histogram[macd.histogram.length - 1];
    const prevMACD = macd.histogram[macd.histogram.length - 2];
    const lastSMA1 = sma1[sma1.length - 1];
    const lastSMA2 = sma2[sma2.length - 1];
    const prevSMA1 = sma1[sma1.length - 2];
    const prevSMA2 = sma2[sma2.length - 2];
    const lastPrice = prices[prices.length - 1].close;
    const lastBoll = bollinger[bollinger.length - 1];
    const lastSRSI = srsi.k[srsi.k.length - 1];

    // Golden/Death Cross
    if (lastSMA1 && lastSMA2 && prevSMA1 && prevSMA2) {
      if (prevSMA1 <= prevSMA2 && lastSMA1 > lastSMA2) sigs.push({ type: "buy", signal: jf ? "Short-term trend crossed above long-term (bullish)" : `Golden Cross (SMA${smaPeriod1} > SMA${smaPeriod2})`, strength: 3 });
      if (prevSMA1 >= prevSMA2 && lastSMA1 < lastSMA2) sigs.push({ type: "sell", signal: jf ? "Short-term trend dropped below long-term (bearish)" : `Death Cross (SMA${smaPeriod1} < SMA${smaPeriod2})`, strength: 3 });
    }

    // RSI
    if (lastRSI !== null) {
      if (lastRSI > 70) sigs.push({ type: "sell", signal: jf ? `Overbought (RSI ${lastRSI.toFixed(0)}) — price may be too high` : `RSI Overbought (${lastRSI.toFixed(0)})`, strength: 2 });
      if (lastRSI < 30) sigs.push({ type: "buy", signal: jf ? `Oversold (RSI ${lastRSI.toFixed(0)}) — possible bargain` : `RSI Oversold (${lastRSI.toFixed(0)})`, strength: 2 });
      if (prevRSI && prevRSI < 30 && lastRSI >= 30) sigs.push({ type: "buy", signal: jf ? "Bouncing back from oversold" : "RSI recovery from oversold", strength: 2 });
    }

    // Stochastic RSI
    if (lastSRSI !== null) {
      if (lastSRSI > 80) sigs.push({ type: "sell", signal: jf ? `Stochastic overbought (${lastSRSI.toFixed(0)})` : `Stochastic RSI > 80`, strength: 2 });
      if (lastSRSI < 20) sigs.push({ type: "buy", signal: jf ? `Stochastic oversold (${lastSRSI.toFixed(0)})` : `Stochastic RSI < 20`, strength: 2 });
    }

    // MACD crossover
    if (prevMACD < 0 && lastMACD >= 0) sigs.push({ type: "buy", signal: jf ? "Momentum turning positive" : "MACD bullish crossover", strength: 2 });
    if (prevMACD > 0 && lastMACD <= 0) sigs.push({ type: "sell", signal: jf ? "Momentum turning negative" : "MACD bearish crossover", strength: 2 });

    // Bollinger
    if (lastBoll.lower && lastPrice <= lastBoll.lower) sigs.push({ type: "buy", signal: jf ? "Price hit the bottom band — potential bounce" : "Price at lower Bollinger Band", strength: 1 });
    if (lastBoll.upper && lastPrice >= lastBoll.upper) sigs.push({ type: "sell", signal: jf ? "Price hit the upper band — potential pullback" : "Price at upper Bollinger Band", strength: 1 });

    // Price vs SMA
    if (lastSMA2 && lastPrice > lastSMA2 * 1.05) sigs.push({ type: "buy", signal: jf ? "Price well above longer-term average (uptrend)" : `Price > SMA${smaPeriod2} (uptrend)`, strength: 1 });
    if (lastSMA2 && lastPrice < lastSMA2 * 0.95) sigs.push({ type: "sell", signal: jf ? "Price well below longer-term average (downtrend)" : `Price < SMA${smaPeriod2} (downtrend)`, strength: 1 });

    return sigs;
  }, [prices, rsi, macd, sma1, sma2, bollinger, srsi, smaPeriod1, smaPeriod2, jf]);

  // News sentiment score
  const sentimentScore = news.reduce((s, n) => s + (n.sentiment === "bullish" ? 1 : n.sentiment === "bearish" ? -1 : 0), 0);
  const sentimentLabel = sentimentScore > 0 ? "Bullish" : sentimentScore < 0 ? "Bearish" : "Neutral";

  // Composite signal
  const techScore = signals.reduce((s, sig) => s + (sig.type === "buy" ? sig.strength : -sig.strength), 0);
  const compositeScore = techScore + sentimentScore;
  const recommendation = compositeScore >= 3 ? "Buy" : compositeScore <= -3 ? "Sell" : "Hold";
  const recColor = recommendation === "Buy" ? "green" : recommendation === "Sell" ? "red" : "amber";

  // Chart rendering
  const chartPrices = prices.slice(-40);
  const chartStart = prices.length - 40;
  const minP = Math.min(...chartPrices.map(p => p.low)) * 0.995;
  const maxP = Math.max(...chartPrices.map(p => p.high)) * 1.005;
  const pRange = maxP - minP;

  const addNewsItem = () => setNews([...news, { headline: "", sentiment: "neutral" }]);
  const updateNews = (i, k, v) => { const u = [...news]; u[i][k] = v; setNews(u); };
  const removeNews = (i) => setNews(news.filter((_, idx) => idx !== i));

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Investing" sub={jf ? "Charts, signals, and sentiment — see what the market is telling you" : "Technical analysis with price charts, indicators, buy/sell signals, and news sentiment"}>Market Lab</Title>
      <AdviceNote kind="trading" />

      {/* Asset Input */}
      <Card className="mb-4">
        <div className="flex gap-4 items-end">
          <div className="w-40"><F label="Asset Name" value={asset.name} onChange={v => setAsset(p => ({ ...p, name: v }))} type="text" small /></div>
          <div className="w-32"><F label={jf ? "Starting Price" : "Base Price"} value={asset.basePrice} onChange={v => setAsset(p => ({ ...p, basePrice: v }))} prefix="$" small /></div>
          <div className="w-28"><F label={jf ? "Price Swings" : "Volatility %"} value={asset.volatility} onChange={v => setAsset(p => ({ ...p, volatility: v }))} suffix="%" small /></div>
          <Btn onClick={regenPrices} v="primary" className="mb-1.5">{jf ? "Generate Prices" : "Simulate"}</Btn>
          <div className="flex-1" />
          <div className="text-right pb-1.5">
            <div className="text-xs text-slate-400 dark:text-[#828b9a]">Current Price</div>
            <div className="text-xl font-bold text-slate-800 dark:text-[#eef1f6]">${prices[prices.length - 1].close.toFixed(2)}</div>
            <div className={`text-xs font-bold ${prices[prices.length - 1].close >= prices[prices.length - 2].close ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>
              {prices[prices.length - 1].close >= prices[prices.length - 2].close ? "+" : ""}{((prices[prices.length - 1].close - prices[prices.length - 2].close) / prices[prices.length - 2].close * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </Card>

      {/* Indicator Toggles */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setShowIndicators(p => ({ ...p, sma1: !p.sma1 }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showIndicators.sma1 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>SMA {smaPeriod1}</button>
        <button onClick={() => setShowIndicators(p => ({ ...p, sma2: !p.sma2 }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showIndicators.sma2 ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>SMA {smaPeriod2}</button>
        <button onClick={() => setShowIndicators(p => ({ ...p, ema: !p.ema }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showIndicators.ema ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>EMA {emaPeriod}</button>
        <button onClick={() => setShowIndicators(p => ({ ...p, rsi: !p.rsi }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showIndicators.rsi ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>RSI</button>
        <button onClick={() => setShowIndicators(p => ({ ...p, macd: !p.macd }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showIndicators.macd ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>MACD</button>
        <button onClick={() => setShowIndicators(p => ({ ...p, bollinger: !p.bollinger }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showIndicators.bollinger ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>{jf ? "Price Bands" : "Bollinger"}</button>
        <button onClick={() => setShowIndicators(p => ({ ...p, srsi: !p.srsi }))}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showIndicators.srsi ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>Stoch RSI</button>
      </div>

      {/* Chart Type & Volume Toggles */}
      <div className="flex gap-2 mb-4">
        <div className="flex bg-slate-100 dark:bg-[#232730] rounded-lg p-0.5">
          <button onClick={() => setChartType("candle")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${chartType === "candle" ? "bg-white dark:bg-[#1c1f26] text-slate-800 dark:text-[#eef1f6] shadow-sm" : "text-slate-500 dark:text-[#a3acba]"}`}>{jf ? "Candles" : "Candlestick"}</button>
          <button onClick={() => setChartType("line")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${chartType === "line" ? "bg-white dark:bg-[#1c1f26] text-slate-800 dark:text-[#eef1f6] shadow-sm" : "text-slate-500 dark:text-[#a3acba]"}`}>Line</button>
        </div>
        <button onClick={() => setShowVolume(!showVolume)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${showVolume ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>Volume</button>
      </div>

      {/* Price Chart */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6] mb-3">{asset.name} — {jf ? "Price Chart (40 days)" : "40-Day Price Action"}</h3>
        <div className="relative h-48 border border-slate-100 dark:border-[#262b33] rounded-lg overflow-hidden bg-slate-50 dark:bg-[#15171c]">
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(pct => <div key={pct} className="absolute w-full border-t border-slate-200 dark:border-[#323844] border-dashed" style={{ top: `${pct * 100}%` }}><span className="absolute right-1 -top-3 text-xs text-slate-300">${(maxP - pRange * pct).toFixed(0)}</span></div>)}
          {/* Bollinger bands */}
          {showIndicators.bollinger && <svg className="absolute inset-0" viewBox={`0 0 ${chartPrices.length} 100`} preserveAspectRatio="none">
            <path d={chartPrices.map((_, i) => { const b = bollinger[chartStart + i]; if (!b.upper) return ""; const y = ((maxP - b.upper) / pRange) * 100; return `${i === 0 || !bollinger[chartStart + i - 1].upper ? "M" : "L"}${i} ${y}`; }).join(" ")} fill="none" stroke="#c7d2fe" strokeWidth="0.5" />
            <path d={chartPrices.map((_, i) => { const b = bollinger[chartStart + i]; if (!b.lower) return ""; const y = ((maxP - b.lower) / pRange) * 100; return `${i === 0 || !bollinger[chartStart + i - 1].lower ? "M" : "L"}${i} ${y}`; }).join(" ")} fill="none" stroke="#c7d2fe" strokeWidth="0.5" />
          </svg>}
          {/* Candlestick Mode */}
          {chartType === "candle" && <div className="absolute inset-0 flex items-end px-1">
            {chartPrices.map((p, i) => {
              const isUp = p.close >= (i > 0 ? chartPrices[i - 1].close : p.close);
              const bodyTop = ((maxP - Math.max(p.close, (i > 0 ? chartPrices[i - 1].close : p.close))) / pRange) * 100;
              const bodyBot = ((maxP - Math.min(p.close, (i > 0 ? chartPrices[i - 1].close : p.close))) / pRange) * 100;
              const wickTop = ((maxP - p.high) / pRange) * 100;
              const wickBot = ((maxP - p.low) / pRange) * 100;
              return <div key={i} className="flex-1 relative group">
                <div className={`absolute left-1/2 -translate-x-1/2 w-0.5 ${isUp ? "bg-emerald-300" : "bg-red-300"}`} style={{ top: `${wickTop}%`, height: `${wickBot - wickTop}%` }} />
                <div className={`absolute left-1/2 -translate-x-1/2 w-2 rounded-sm ${isUp ? "bg-emerald-500" : "bg-red-500"}`} style={{ top: `${bodyTop}%`, height: `${Math.max(bodyBot - bodyTop, 0.5)}%` }} />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">D{p.day}: ${p.close.toFixed(2)} | H:${p.high.toFixed(2)} L:${p.low.toFixed(2)}</div>
              </div>;
            })}
          </div>}
          {/* Line Mode */}
          {chartType === "line" && <svg className="absolute inset-0" viewBox={`0 0 ${chartPrices.length} 100`} preserveAspectRatio="none">
            <defs><linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" /></linearGradient></defs>
            <path d={chartPrices.map((p, i) => `${i === 0 ? "M" : "L"}${i} ${((maxP - p.close) / pRange) * 100}`).join(" ") + ` L${chartPrices.length - 1} 100 L0 100 Z`} fill="url(#lineGrad)" />
            <polyline points={chartPrices.map((p, i) => `${i},${((maxP - p.close) / pRange) * 100}`).join(" ")} fill="none" stroke="#6366f1" strokeWidth="1.2" />
          </svg>}
          {chartType === "line" && <div className="absolute inset-0 flex px-1">
            {chartPrices.map((p, i) => <div key={i} className="flex-1 relative group"><div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">D{p.day}: ${p.close.toFixed(2)}</div></div>)}
          </div>}
          {/* SMA overlays */}
          {showIndicators.sma1 && <svg className="absolute inset-0" viewBox={`0 0 ${chartPrices.length} 100`} preserveAspectRatio="none">
            <polyline points={chartPrices.map((_, i) => { const v = sma1[chartStart + i]; return v ? `${i},${((maxP - v) / pRange) * 100}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#6366f1" strokeWidth="0.8" />
          </svg>}
          {showIndicators.sma2 && <svg className="absolute inset-0" viewBox={`0 0 ${chartPrices.length} 100`} preserveAspectRatio="none">
            <polyline points={chartPrices.map((_, i) => { const v = sma2[chartStart + i]; return v ? `${i},${((maxP - v) / pRange) * 100}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#f59e0b" strokeWidth="0.8" />
          </svg>}
          {showIndicators.ema && <svg className="absolute inset-0" viewBox={`0 0 ${chartPrices.length} 100`} preserveAspectRatio="none">
            <polyline points={chartPrices.map((_, i) => { const v = emaLine[chartStart + i]; return v ? `${i},${((maxP - v) / pRange) * 100}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#22c55e" strokeWidth="0.8" />
          </svg>}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-slate-400 dark:text-[#828b9a]">
          {showIndicators.sma1 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block" />SMA {smaPeriod1}</span>}
          {showIndicators.sma2 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block" />SMA {smaPeriod2}</span>}
          {showIndicators.ema && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" />EMA {emaPeriod}</span>}
          {showIndicators.bollinger && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-200 dark:bg-indigo-500/20 inline-block" />{jf ? "Price Bands" : "Bollinger"}</span>}
          {chartType === "candle" && <><span className="flex items-center gap-1"><span className="text-emerald-500 dark:text-emerald-300 text-[10px] leading-none" aria-hidden="true">▲</span>Up day</span>
          <span className="flex items-center gap-1"><span className="text-red-500 text-[10px] leading-none" aria-hidden="true">▼</span>Down day</span></>}
          {chartType === "line" && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block" />Close Price</span>}
        </div>
        {/* Volume Bars */}
        {showVolume && <div className="mt-3">
          <div className="text-xs text-slate-400 dark:text-[#828b9a] mb-1">{jf ? "Trading Volume" : "Volume"}</div>
          <div className="flex items-end gap-0.5 h-12">
            {(() => { const maxVol = Math.max(...chartPrices.map(p => p.vol), 1); return chartPrices.map((p, i) => {
              const isUp = p.close >= (i > 0 ? chartPrices[i - 1].close : p.close);
              return <div key={i} className="flex-1 relative group">
                <div className={`w-full rounded-t ${isUp ? "bg-emerald-200 dark:bg-emerald-500/20" : "bg-red-200 dark:bg-red-500/20"}`} style={{ height: `${(p.vol / maxVol) * 100}%`, minHeight: 1 }} />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">Vol: {(p.vol / 1e6).toFixed(1)}M</div>
              </div>;
            }); })()}
          </div>
        </div>}
      </Card>

      {/* RSI & MACD mini-charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {showIndicators.rsi && <Card>
          <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-2">{jf ? "Overbought/Oversold Meter" : "RSI (14)"}<Tip text={jf ? "Above 70 = overbought (may drop). Below 30 = oversold (may bounce). 50 is neutral." : "Relative Strength Index. 70+ overbought, 30- oversold."} /></h3>
          <div className="relative h-16 bg-slate-50 dark:bg-[#15171c] rounded border border-slate-100 dark:border-[#262b33] overflow-hidden">
            <div className="absolute w-full border-t border-red-200 dark:border-red-500/30 border-dashed" style={{ top: "30%" }}><span className="absolute right-1 text-xs text-red-300">70</span></div>
            <div className="absolute w-full border-t border-emerald-200 dark:border-emerald-500/30 border-dashed" style={{ top: "70%" }}><span className="absolute right-1 text-xs text-emerald-300">30</span></div>
            <svg className="absolute inset-0" viewBox={`0 0 ${chartPrices.length} 100`} preserveAspectRatio="none">
              <polyline points={chartPrices.map((_, i) => { const v = rsi[chartStart + i]; return v !== null ? `${i},${100 - v}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#8b5cf6" strokeWidth="1" />
            </svg>
          </div>
          <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">Current RSI: <span className={`font-bold ${rsi[rsi.length - 1] > 70 ? "text-red-500" : rsi[rsi.length - 1] < 30 ? "text-emerald-500" : "text-slate-700 dark:text-[#dde3ec]"}`}>{rsi[rsi.length - 1]?.toFixed(1) || "N/A"}</span></div>
        </Card>}
        {showIndicators.macd && <Card>
          <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-2">{jf ? "Momentum Direction" : "MACD"}<Tip text={jf ? "Green bars = momentum building. Red bars = momentum fading. Crossovers signal trend changes." : "Moving Average Convergence Divergence. Histogram shows momentum."} /></h3>
          <div className="relative h-16 bg-slate-50 dark:bg-[#15171c] rounded border border-slate-100 dark:border-[#262b33] overflow-hidden">
            <div className="absolute w-full border-t border-slate-200 dark:border-[#323844]" style={{ top: "50%" }} />
            <div className="absolute inset-0 flex items-center px-0.5">
              {chartPrices.map((_, i) => {
                const v = macd.histogram[chartStart + i];
                const maxH = Math.max(...chartPrices.map((_, j) => Math.abs(macd.histogram[chartStart + j] || 0)));
                const h = maxH > 0 ? Math.abs(v) / maxH * 50 : 0;
                return <div key={i} className="flex-1 flex flex-col items-center justify-center h-full relative">
                  <div className={`w-1 rounded-sm ${v >= 0 ? "bg-emerald-400" : "bg-red-400"}`}
                    style={{ height: `${h}%`, position: "absolute", [v >= 0 ? "bottom" : "top"]: "50%" }} />
                </div>;
              })}
            </div>
          </div>
        </Card>}
        {showIndicators.srsi && <Card>
          <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-2">{jf ? "Stochastic Momentum" : "Stochastic RSI"}<Tip text={jf ? "Like RSI but more sensitive. Above 80 = overbought. Below 20 = oversold." : "Stochastic RSI oscillator. More responsive than regular RSI."} /></h3>
          <div className="relative h-16 bg-slate-50 dark:bg-[#15171c] rounded border border-slate-100 dark:border-[#262b33] overflow-hidden">
            <div className="absolute w-full border-t border-red-200 dark:border-red-500/30 border-dashed" style={{ top: "20%" }}><span className="absolute right-1 text-xs text-red-300">80</span></div>
            <div className="absolute w-full border-t border-emerald-200 dark:border-emerald-500/30 border-dashed" style={{ top: "80%" }}><span className="absolute right-1 text-xs text-emerald-300">20</span></div>
            <svg className="absolute inset-0" viewBox={`0 0 ${chartPrices.length} 100`} preserveAspectRatio="none">
              <polyline points={chartPrices.map((_, i) => { const v = srsi.k[chartStart + i]; return v !== null ? `${i},${100 - v}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#06b6d4" strokeWidth="1" />
            </svg>
          </div>
          <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">Current: <span className={`font-bold ${srsi.k[srsi.k.length - 1] > 80 ? "text-red-500" : srsi.k[srsi.k.length - 1] < 20 ? "text-emerald-500" : "text-slate-700 dark:text-[#dde3ec]"}`}>{srsi.k[srsi.k.length - 1]?.toFixed(1) || "N/A"}</span></div>
        </Card>}
      </div>

      {/* Signals + Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">{jf ? "What the Charts Say" : "Technical Signals"}</h3>
          {signals.length === 0 && <p className="text-xs text-slate-400 dark:text-[#828b9a]">No strong signals detected.</p>}
          {signals.map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <Badge color={s.type === "buy" ? "green" : "red"}>{s.type === "buy" ? "BUY" : "SELL"}</Badge>
              <span className="text-xs text-slate-600 dark:text-[#c4ccd8] flex-1">{s.signal}</span>
              <span className="text-xs text-slate-400 dark:text-[#828b9a]">{"*".repeat(s.strength)}</span>
            </div>
          ))}
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-amber-700 dark:text-amber-200">{jf ? "News & Mood" : "My Market Journal"}</h3>
            <Btn onClick={addNewsItem} v="secondary">+ Add</Btn>
          </div>
          {news.map((n, i) => (
            <div key={i} className="mb-2">
              <div className="flex gap-2 mb-1 items-center">
                <input type="text" value={n.headline} onChange={e => updateNews(i, "headline", e.target.value)} className="bg-white dark:bg-[#1c1f26] flex-1 px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none" placeholder="Headline or note..." />
                <select value={n.sentiment} onChange={e => updateNews(i, "sentiment", e.target.value)} className="bg-white dark:bg-[#1c1f26] px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg">
                  <option value="bullish">Bullish</option><option value="neutral">Neutral</option><option value="bearish">Bearish</option>
                </select>
                <button onClick={() => removeNews(i)} className="text-red-400 text-xs hover:text-red-600">x</button>
              </div>
              <div className="flex gap-2 text-xs text-slate-400 dark:text-[#828b9a]">
                <input type="date" value={n.date || "2026-04-12"} onChange={e => updateNews(i, "date", e.target.value)} className="bg-white dark:bg-[#1c1f26] px-1 py-0.5 border border-slate-200 dark:border-[#323844] rounded text-xs outline-none" />
                <input type="text" value={n.source || ""} onChange={e => updateNews(i, "source", e.target.value)} placeholder="Source..." className="bg-white dark:bg-[#1c1f26] flex-1 px-1 py-0.5 border border-slate-200 dark:border-[#323844] rounded text-xs outline-none" />
              </div>
            </div>
          ))}
          <div className="mt-2 p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg text-xs flex justify-between">
            <span className="text-slate-500 dark:text-[#a3acba]">{jf ? "Overall Mood" : "Net Sentiment"}</span>
            <span className={`font-bold ${sentimentScore > 0 ? "text-emerald-600 dark:text-emerald-300" : sentimentScore < 0 ? "text-red-500" : "text-slate-600 dark:text-[#c4ccd8]"}`}>{sentimentLabel} ({sentimentScore > 0 ? "+" : ""}{sentimentScore})</span>
          </div>
        </Card>
      </div>

      <RunAnalysisBtn onClick={() => setShowAnalysis(!showAnalysis)} />
      {showAnalysis && <AnalysisReport
        grade={signals.length >= 3 ? "A" : signals.length >= 2 ? "B" : signals.length >= 1 ? "C" : "D"}
        gradeColor={techScore >= 3 ? "green" : techScore >= 0 ? "amber" : "red"}
        findings={[
          { good: signals.length >= 2, text: `${signals.length} technical signal(s) detected` },
          { good: compositeScore >= 0, text: `Composite score: ${compositeScore > 0 ? "+" : ""}${compositeScore} (${recommendation})` },
          { good: sentimentScore > 0, text: `News sentiment: ${sentimentLabel} (${sentimentScore > 0 ? "+" : ""}${sentimentScore})` },
          { good: techScore >= 3, text: `Technical strength: ${techScore > 0 ? "+" : ""}${techScore}` },
        ]}
        topPriority={compositeScore >= 3 ? "Strong buy signal — technical and sentiment aligned" : compositeScore <= -3 ? "Strong sell signal — prepare to exit" : "Mixed signals — wait for confirmation"}
        priorityLevel={compositeScore >= 3 ? "good" : compositeScore <= -3 ? "bad" : "okay"}
      />}

      {/* Composite Recommendation */}
      <Card className={`text-center ${recColor === "green" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : recColor === "red" ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30" : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30"}`}>
        <div className="text-xs text-slate-500 dark:text-[#a3acba] mb-1">{jf ? "Overall Signal" : "Composite Recommendation"}<Tip text={jf ? "Combines all technical signals and news sentiment into one answer." : "Weighted sum of technical indicator signals plus news sentiment score."} /></div>
        <div className={`text-3xl font-bold ${recColor === "green" ? "text-emerald-700 dark:text-emerald-300" : recColor === "red" ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-200"}`}>{recommendation}</div>
        <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{jf ? "Technical" : "Tech"}: {techScore > 0 ? "+" : ""}{techScore} | {jf ? "News" : "Sentiment"}: {sentimentScore > 0 ? "+" : ""}{sentimentScore} | {jf ? "Combined" : "Composite"}: {compositeScore > 0 ? "+" : ""}{compositeScore}</div>
      </Card>
    </div>
  );
}

// ============================================================
// FINANCIAL STRESS TEST
// ============================================================
function StressTest({ jargonFree: jf, riskType, onNav }) {
  const [d, setD] = useState({
    portfolioValue: 250000, monthlyIncome: 6500, monthlyExpenses: 4500,
    emergencyFund: 20000, totalDebt: 120000, debtPayment: 1200,
    mortgageRate: 6.5, mortgageBalance: 280000, stockPct: 60, bondPct: 25, cashPct: 15,
  });
  const u = (k) => (v) => setD(p => ({ ...p, [k]: v }));

  const scenarios = useMemo(() => {
    const run = (name, desc, mods) => {
      const portHit = d.portfolioValue * (mods.stockDrop / 100 * d.stockPct / 100 + mods.bondDrop / 100 * d.bondPct / 100);
      const newPortfolio = d.portfolioValue + portHit;
      const incomeHit = d.monthlyIncome * mods.incomeChange / 100;
      const newIncome = d.monthlyIncome + incomeHit;
      const expChange = d.monthlyExpenses * mods.expenseChange / 100;
      const newExpenses = d.monthlyExpenses + expChange;
      const rateChange = mods.rateChange || 0;
      const newRate = d.mortgageRate + rateChange;
      const oldMR = d.mortgageRate / 100 / 12; const newMR = newRate / 100 / 12; const n = 360;
      const oldPayment = oldMR > 0 ? d.mortgageBalance * (oldMR * Math.pow(1 + oldMR, n)) / (Math.pow(1 + oldMR, n) - 1) : d.mortgageBalance / n;
      const newPayment = newMR > 0 ? d.mortgageBalance * (newMR * Math.pow(1 + newMR, n)) / (Math.pow(1 + newMR, n) - 1) : d.mortgageBalance / n;
      const paymentIncrease = newPayment - oldPayment;
      const newMonthlyCash = newIncome - newExpenses - d.debtPayment - paymentIncrease;
      const emergencyRunway = newMonthlyCash < 0 ? d.emergencyFund / Math.abs(newMonthlyCash) : Infinity;
      let survival = 0;
      if (newMonthlyCash >= 0) survival = 100;
      else if (emergencyRunway >= 12) survival = 80;
      else if (emergencyRunway >= 6) survival = 60;
      else if (emergencyRunway >= 3) survival = 40;
      else survival = 20;
      return { name, desc, portHit, newPortfolio, incomeHit, newIncome, newExpenses, newMonthlyCash, emergencyRunway, survival, paymentIncrease, rateChange };
    };

    return [
      run(jf ? "Market Crash" : "Bear Market", jf ? "Stocks drop 30%, bonds drop 5%" : "-30% stocks, -5% bonds", { stockDrop: -30, bondDrop: -5, incomeChange: 0, expenseChange: 0 }),
      run(jf ? "Lost Your Job" : "Job Loss", jf ? "Income drops to zero, expenses stay" : "100% income loss", { stockDrop: 0, bondDrop: 0, incomeChange: -100, expenseChange: -10 }),
      run(jf ? "Interest Rate Spike" : "Rate Shock", jf ? "Rates jump 3%, stocks drop 15%" : "+3% rates, -15% stocks", { stockDrop: -15, bondDrop: -10, incomeChange: 0, expenseChange: 5, rateChange: 3 }),
      run(jf ? "Everything Goes Wrong" : "Recession Combo", jf ? "Market crash + job loss + inflation" : "-40% stocks, -30% income, +15% expenses", { stockDrop: -40, bondDrop: -8, incomeChange: -30, expenseChange: 15, rateChange: 2 }),
    ];
  }, [d, jf]);

  const worstSurvival = Math.min(...scenarios.map(s => s.survival));
  const overallScore = Math.round(scenarios.reduce((s, sc) => s + sc.survival, 0) / scenarios.length);

  const actions = [];
  if (d.emergencyFund < d.monthlyExpenses * 6) actions.push({ title: jf ? "Build a bigger safety net" : "Increase emergency fund", detail: `You have ${d.monthlyExpenses > 0 ? (d.emergencyFund / d.monthlyExpenses).toFixed(1) : "—"} months of expenses saved. Aim for 6 months (${$(d.monthlyExpenses * 6)}).` });
  if (d.stockPct > 70) actions.push({ title: jf ? "Too much in stocks" : "Reduce equity concentration", detail: `${d.stockPct}% in stocks means big swings in a crash. Consider moving 10-20% to bonds or cash.` });
  if (scenarios[3].emergencyRunway < 6) actions.push({ title: jf ? "You wouldn't survive the worst case for 6 months" : "Build recession resilience", detail: "In the worst scenario, your emergency fund runs out in " + (scenarios[3].emergencyRunway === Infinity ? "never" : scenarios[3].emergencyRunway.toFixed(1) + " months") + "." });
  if (d.monthlyIncome > 0 && d.debtPayment > d.monthlyIncome * 0.3) actions.push({ title: jf ? "Debt payments are too high" : "Reduce debt burden", detail: `${((d.debtPayment / d.monthlyIncome) * 100).toFixed(0)}% of income goes to debt. This leaves you vulnerable.` });
  if (actions.length === 0) actions.push({ title: jf ? "You're well-prepared" : "Strong financial resilience", detail: "Your finances can handle major shocks. Keep maintaining your emergency fund and diversification." });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Protection" sub={jf ? "What happens to your money when things go wrong?" : "Simulate market crashes, job loss, rate spikes, and recessions"}>Financial Stress Test</Title>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <F label={jf ? "Investment Portfolio" : "Portfolio Value"} value={d.portfolioValue} onChange={u("portfolioValue")} prefix="$" small />
          <F label={jf ? "% in Stocks" : "Stock Allocation"} value={d.stockPct} onChange={u("stockPct")} suffix="%" small />
          <F label={jf ? "% in Bonds" : "Bond Allocation"} value={d.bondPct} onChange={u("bondPct")} suffix="%" small />
          <F label={jf ? "% in Cash" : "Cash Allocation"} value={d.cashPct} onChange={u("cashPct")} suffix="%" small />
        </div>
        <div>
          <F label={jf ? "Monthly Take-Home" : "Monthly Income"} value={d.monthlyIncome} onChange={u("monthlyIncome")} prefix="$" small />
          <F label={jf ? "Monthly Spending" : "Monthly Expenses"} value={d.monthlyExpenses} onChange={u("monthlyExpenses")} prefix="$" small />
          <F label={jf ? "Safety Net Savings" : "Emergency Fund"} value={d.emergencyFund} onChange={u("emergencyFund")} prefix="$" small />
        </div>
        <div>
          <F label={jf ? "Monthly Debt Bills" : "Debt Payments"} value={d.debtPayment} onChange={u("debtPayment")} prefix="$" small />
          <F label="Mortgage Balance" value={d.mortgageBalance} onChange={u("mortgageBalance")} prefix="$" small />
          <F label="Mortgage Rate" value={d.mortgageRate} onChange={u("mortgageRate")} suffix="%" small />
        </div>
      </div>

      {/* Overall Score */}
      <Card className="mb-4" accent={overallScore >= 65 ? "good" : overallScore >= 40 ? "neutral" : "bad"}>
        <div className="flex items-center gap-4">
          <Ring score={overallScore} max={100} size={120} color={overallScore >= 65 ? "green" : overallScore >= 40 ? "yellow" : "red"} />
          <div className="flex-1">
            <div className="flex items-center gap-2"><div className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase tracking-wider">{jf ? "How Prepared Are You?" : "Resilience Score"}</div><ConfidenceLabel level="illustrative" note="Each scenario uses assumed crash severity (e.g., -30% market). Real downturns are sometimes milder, sometimes worse. Use the score as a directional warning, not a precise prediction." /></div>
            <div className={`text-4xl font-bold mt-1 ${overallScore >= 65 ? "text-emerald-600 dark:text-emerald-300" : overallScore >= 40 ? "text-amber-600 dark:text-amber-200" : "text-red-600 dark:text-red-300"}`}>{overallScore}<span className="text-xl text-slate-400 dark:text-[#828b9a]">/100</span></div>
            <div className={`h-0.5 w-16 mt-1 rounded-full ${overallScore >= 65 ? "bg-emerald-400" : overallScore >= 40 ? "bg-amber-400" : "bg-red-400"}`} />
            <p className="text-sm text-slate-500 dark:text-[#a3acba] mt-2">{overallScore >= 80 ? (jf ? "You can handle almost anything." : "Excellent financial resilience.") : overallScore >= 60 ? (jf ? "You'll survive most situations." : "Good resilience with some vulnerabilities.") : overallScore >= 40 ? (jf ? "Some scenarios could really hurt." : "Moderate resilience — action needed.") : (jf ? "You're at risk in several scenarios." : "Low resilience — immediate action recommended.")}</p>
            <WhyMatters text="A score below 60 means a single bad event — job loss, market crash, big medical bill — could push you into unrecoverable debt. The goal isn't to score 100; it's to be resilient enough that one bad year doesn't undo a decade of progress." />
          </div>
        </div>
      </Card>

      {/* Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {scenarios.map((s, i) => (
          <Card key={i} className={s.survival >= 80 ? "border-emerald-200 dark:border-emerald-500/30" : s.survival >= 50 ? "border-amber-200 dark:border-amber-500/30" : "border-red-200 dark:border-red-500/30"}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{s.name}</h3>
              <Badge color={s.survival >= 80 ? "green" : s.survival >= 50 ? "amber" : "red"}>{s.survival >= 80 ? (jf ? "SAFE" : "OK") : s.survival >= 50 ? (jf ? "TIGHT" : "RISK") : (jf ? "DANGER" : "CRITICAL")}</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#a3acba] mb-3">{s.desc}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-400 dark:text-[#828b9a]">{jf ? "Portfolio Hit" : "Portfolio Impact"}</span><div className={`font-bold ${s.portHit < 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-300"}`}>{$(s.portHit)}</div></div>
              <div><span className="text-slate-400 dark:text-[#828b9a]">{jf ? "New Portfolio" : "Remaining Value"}</span><div className="font-bold text-slate-700 dark:text-[#dde3ec]">{$(s.newPortfolio)}</div></div>
              <div><span className="text-slate-400 dark:text-[#828b9a]">{jf ? "Monthly Cash Left" : "Monthly Cashflow"}</span><div className={`font-bold ${s.newMonthlyCash >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(s.newMonthlyCash)}/mo</div></div>
              <div><span className="text-slate-400 dark:text-[#828b9a]">{jf ? "Savings Last" : "Emergency Runway"}</span><div className={`font-bold ${s.emergencyRunway >= 6 ? "text-emerald-600 dark:text-emerald-300" : s.emergencyRunway >= 3 ? "text-amber-500" : "text-red-500"}`}>{s.emergencyRunway === Infinity ? "Indefinite" : s.emergencyRunway.toFixed(1) + " mo"}</div></div>
            </div>
            {s.rateChange > 0 && <div className="text-xs text-amber-600 dark:text-amber-200 mt-2">{jf ? "Mortgage payment goes up" : "Mortgage increase"}: +{$(s.paymentIncrease)}/mo</div>}
          </Card>
        ))}
      </div>

      <ActionBtn beginner={jf} actions={actions} perspectives={{
        conservative: [
          { title: "Build emergency fund to 12 months", detail: "Double the standard recommendation. In a real crisis, 6 months may not be enough." },
          { title: "Move to 40% bonds, 20% cash minimum", detail: "Capital preservation is priority one. You can't invest what you've already lost." },
          { title: "Pay down all variable-rate debt immediately", detail: "Rate spikes hit variable debt hardest. Lock in fixed rates or pay it off." },
          { title: "Consider Treasury I-Bonds for inflation protection", detail: "Government-backed, inflation-adjusted, risk-free. Perfect for conservative portfolios." },
        ],
        balanced: actions,
        aggressive: [
          { title: "Keep investing through downturns", detail: "Market crashes are sales. Dollar-cost average more aggressively during dips." },
          { title: "Maintain 3-6 months emergency fund, invest the rest", detail: "Large cash reserves drag returns. Keep enough to survive, invest the surplus." },
          { title: "Use corrections to upgrade portfolio quality", detail: "Sell weaker positions during recovery, buy industry leaders at discount." },
          { title: "Consider hedging with options rather than reducing exposure", detail: "Protective puts cost less than missed gains from being underinvested." },
        ],
      }} />
      <Suggest onNav={onNav} items={[
        { icon: "P", text: "Review your Portfolio allocation", nav: "portfolio" },
        ...(d.emergencyFund < d.monthlyExpenses * 6 ? [{ icon: "$", text: "Build your emergency fund in Personal Finance", nav: "personal" }] : []),
      ]} />
      <Assumptions items={[
        { formula: "Survival score = function of cash runway, debt buffer, allocation hit", what: "We apply pre-set crash severities (e.g. -30% market, 6-month job loss, +3% mortgage rate) to your inputs, compute the remaining cash runway and monthly cash flow under each scenario, and weight into a 0-100 score.", assumptions: ["Market crash: -30% on stock allocation, -10% on bonds (a 'typical' bear market — actual crashes range -20% to -55%)", "Job loss scenario: 6 months with zero income; unemployment benefits not modeled", "Rate spike: +3 percentage points on variable mortgage rate", "Inflation scenario: +8% to expenses, no income adjustment", "Recession: combined effect of 20% market drop + 10% income cut"], source: "Severity values chosen to roughly match 75th-percentile historical bad events (Great Recession, 1973 oil crisis, 2020 pandemic shock)." },
        { formula: "Emergency runway = liquid cash / monthly burn after crash", what: "We measure how many months your savings would cover expenses if income drops to zero (or the scenario value) and expenses adjust per scenario.", assumptions: ["Liquid = checking + savings only (investments treated as illiquid because selling in a crash locks losses)", "No unemployment insurance, severance, or family help modeled"] },
      ]} />
    </div>
  );
}

// ============================================================
// TAX IMPACT ESTIMATOR
// ============================================================
function TaxEstimator({ jargonFree: jf }) {
  const [holdings, setHoldings] = useState([
    { name: "AAPL", costBasis: 3500, currentValue: 4875, heldMonths: 18, sell: true },
    { name: "TSLA", costBasis: 8000, currentValue: 6200, heldMonths: 5, sell: true },
    { name: "VOO", costBasis: 11400, currentValue: 15600, heldMonths: 36, sell: false },
    { name: "Bitcoin", costBasis: 21000, currentValue: 32500, heldMonths: 14, sell: true },
  ]);
  const [taxBracket, setTaxBracket] = useState(24);
  const [stateRate, setStateRate] = useState(9.3);
  const [filingStatus, setFilingStatus] = useState("single");

  const updateH = (i, k, v) => { const u = [...holdings]; u[i][k] = v; setHoldings(u); };
  const addH = () => setHoldings([...holdings, { name: "New Asset", costBasis: 1000, currentValue: 1000, heldMonths: 1, sell: false }]);
  const removeH = (i) => setHoldings(holdings.filter((_, idx) => idx !== i));

  // Long-term capital gains rates
  // SIMPLIFICATION: LTCG rate is approximated from the ordinary-income bracket as a proxy.
  // Technically LTCG brackets (0/15/20%) are set by TAXABLE INCOME thresholds, not the ordinary bracket.
  // FUTURE: add a taxable-income input and drive this from the real 0%/15%/20% income cutoffs (IRS Topic 409).
  const ltcgRate = taxBracket <= 12 ? 0 : taxBracket <= 35 ? 15 : 20;
  const stcgRate = taxBracket;
  // SIMPLIFICATION: NIIT (3.8%) is approximated from the bracket. It actually triggers on MAGI over
  // $200k single / $250k married-filing-jointly. FUTURE: drive from a MAGI + filing-status input (IRS Topic 559).
  const niit = taxBracket >= 32 ? 3.8 : 0; // Net Investment Income Tax (approximation)

  const analyzed = holdings.map(h => {
    const gain = h.currentValue - h.costBasis;
    const isLoss = gain < 0;
    const isLongTerm = h.heldMonths >= 12;
    const fedRate = isLongTerm ? ltcgRate : stcgRate;
    const totalRate = fedRate + stateRate + (fedRate > 0 ? niit : 0);
    const tax = isLoss ? 0 : gain * totalRate / 100;
    const netProceeds = h.currentValue - tax;
    return { ...h, gain, isLoss, isLongTerm, fedRate, totalRate, tax, netProceeds };
  });

  const selling = analyzed.filter(h => h.sell);
  const totalGains = selling.filter(h => h.gain > 0).reduce((s, h) => s + h.gain, 0);
  const totalLosses = selling.filter(h => h.gain < 0).reduce((s, h) => s + h.gain, 0);
  const netGain = totalGains + totalLosses;
  const lossDeduction = Math.min(Math.abs(totalLosses), 3000 + totalGains); // $3k annual loss deduction limit
  const taxableGain = Math.max(netGain, -3000); // Can deduct up to $3k of losses from ordinary income
  // Tax the NETTED gains, not just the winners — losses on sold holdings offset gains.
  // Net within each holding-period class first, then cross-offset; tax remainder at the gaining class's rate.
  const netST = selling.filter(h => !h.isLongTerm).reduce((s, h) => s + h.gain, 0);
  const netLT = selling.filter(h => h.isLongTerm).reduce((s, h) => s + h.gain, 0);
  const stRate = (stcgRate + stateRate + (stcgRate > 0 ? niit : 0)) / 100;
  const ltRate = (ltcgRate + stateRate + (ltcgRate > 0 ? niit : 0)) / 100;
  let estimatedTax;
  if (netST >= 0 && netLT >= 0) {
    estimatedTax = netST * stRate + netLT * ltRate;          // both classes gained
  } else if (netST < 0 && netLT < 0) {
    estimatedTax = 0;                                         // both classes lost
  } else {                                                   // one gained, one lost → offset
    const combined = netST + netLT;
    estimatedTax = combined <= 0 ? 0 : combined * (netST > 0 ? stRate : ltRate);
  }
  estimatedTax = Math.max(estimatedTax, 0);
  const taxSaved = Math.abs(totalLosses) * (taxBracket / 100); // Savings from harvesting losses

  // Harvest opportunities (holdings not being sold that have losses)
  const harvestOpps = analyzed.filter(h => !h.sell && h.gain < 0);

  const actions = [];
  if (harvestOpps.length > 0) actions.push({ title: jf ? "You have tax-loss harvesting opportunities" : "Consider tax-loss harvesting", detail: `${harvestOpps.length} holding(s) with losses you could sell to offset gains. Potential savings: ${$(harvestOpps.reduce((s, h) => s + Math.abs(h.gain), 0) * taxBracket / 100)}.` });
  const shortTermGainers = selling.filter(h => !h.isLongTerm && h.gain > 0);
  if (shortTermGainers.length > 0) { const closest = shortTermGainers.reduce((best, h) => h.heldMonths > (best?.heldMonths || 0) ? h : best, null); actions.push({ title: jf ? "Wait to pay less tax" : "Consider holding for long-term rates", detail: jf ? `${closest.name} has been held ${closest.heldMonths} months — just ${12 - closest.heldMonths} more to qualify for the lower ${ltcgRate}% rate instead of ${stcgRate}%.` : `Short-term rate: ${stcgRate}% vs long-term: ${ltcgRate}%. ${closest.name} needs ${12 - closest.heldMonths} more months.` }); }
  if (totalLosses < -3000) actions.push({ title: jf ? "Extra losses carry forward" : "Loss carryover available", detail: `You have ${$(Math.abs(totalLosses) - 3000 - totalGains)} in excess losses that carry forward to next year's taxes.` });
  if (actions.length === 0) actions.push({ title: jf ? "Your tax situation looks manageable" : "Tax impact is reasonable", detail: "Consider timing sales across tax years to stay in lower brackets." });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Investing" sub={jf ? "See exactly what you'll owe before you sell anything" : "Estimate capital gains taxes, find harvesting opportunities, and plan sales"}>Tax Impact Estimator</Title>
      <AdviceNote kind="tax" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <F label={jf ? "Your Tax Bracket" : "Federal Tax Bracket"} value={taxBracket} onChange={setTaxBracket} suffix="%" info={jf ? "Your ordinary income tax rate. This determines short-term capital gains tax." : "Marginal ordinary income tax rate."} />
        <F label={jf ? "State Tax Rate" : "State Income Tax"} value={stateRate} onChange={setStateRate} suffix="%" info={jf ? "Your state's tax on investment gains. 0% in states like TX, FL, NV." : "State capital gains rate. Some states have 0%."} />
        <div>
          <div className="text-xs text-slate-500 dark:text-[#a3acba] mb-1">Tax Rates Applied</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Long Hold" : "LTCG"}<Tip text={jf ? "Tax rate for assets held over 1 year. Much lower than short-term." : "Long-term capital gains rate."} /></div><div className="text-sm font-bold text-emerald-600 dark:text-emerald-300">{ltcgRate}% + {stateRate}%{niit > 0 ? ` + ${niit}%` : ""}</div></div>
            <div className="p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Short Hold" : "STCG"}<Tip text={jf ? "Tax rate for assets held under 1 year. Same as your income tax." : "Short-term capital gains = ordinary income rate."} /></div><div className="text-sm font-bold text-amber-600 dark:text-amber-200">{stcgRate}% + {stateRate}%{niit > 0 ? ` + ${niit}%` : ""}</div></div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-[#828b9a] mt-1.5 italic">Long-term rate and the 3.8% NIIT are estimated from your bracket. Your actual rate depends on total taxable income and filing status — confirm with a tax pro.</div>
        </div>
      </div>

      {/* Holdings */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">Holdings</h3>
          <Btn onClick={addH} v="success">+ Add</Btn>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-xs">
          <thead><tr className="bg-slate-50 dark:bg-[#15171c]">
            <th className="text-left py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Asset</th>
            <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">{jf ? "Paid" : "Cost"}</th>
            <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">{jf ? "Worth Now" : "Value"}</th>
            <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">{jf ? "Profit/Loss" : "Gain"}</th>
            <th className="text-center py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">{jf ? "Held" : "Period"}</th>
            <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">{jf ? "Tax Bill" : "Est. Tax"}</th>
            <th className="text-center py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">{jf ? "Selling?" : "Sell"}</th>
            <th className="py-1.5 px-1"></th>
          </tr></thead>
          <tbody>{analyzed.map((h, i) => (
            <tr key={i} className={`border-t border-slate-100 dark:border-[#262b33] ${h.sell ? "" : "opacity-60"}`}>
              <td className="py-1 px-2"><input type="text" value={h.name} onChange={e => updateH(i, "name", e.target.value)} className="bg-white dark:bg-[#1c1f26] w-24 px-1 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none" /></td>
              <td className="py-1 px-2 text-right"><input type="number" value={h.costBasis} onChange={e => updateH(i, "costBasis", Number(e.target.value) || 0)} className="bg-white dark:bg-[#1c1f26] w-20 px-1 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none text-right" /></td>
              <td className="py-1 px-2 text-right"><input type="number" value={h.currentValue} onChange={e => updateH(i, "currentValue", Number(e.target.value) || 0)} className="bg-white dark:bg-[#1c1f26] w-20 px-1 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none text-right" /></td>
              <td className={`py-1 px-2 text-right font-bold ${h.gain >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(h.gain)}</td>
              <td className="py-1 px-2 text-center"><div className="flex items-center gap-1 justify-center"><input type="number" value={h.heldMonths} onChange={e => updateH(i, "heldMonths", Number(e.target.value) || 0)} className="bg-white dark:bg-[#1c1f26] w-12 px-1 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none text-right" /><span className="text-xs text-slate-400 dark:text-[#828b9a]">mo</span></div><div className={`text-xs font-medium mt-0.5 ${h.isLongTerm ? "text-emerald-500" : "text-amber-500"}`}>{h.isLongTerm ? (jf ? "Long" : "LT") : (jf ? "Short" : "ST")}</div></td>
              <td className={`py-1 px-2 text-right font-bold ${h.tax > 0 ? "text-red-500" : "text-slate-400 dark:text-[#828b9a]"}`}>{h.sell ? $(h.tax) : "—"}</td>
              <td className="py-1 px-2 text-center"><input type="checkbox" checked={h.sell} onChange={e => updateH(i, "sell", e.target.checked)} /></td>
              <td className="py-1 px-1"><button onClick={() => removeH(i)} className="text-red-400 hover:text-red-600">x</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Total Gains" : "Realized Gains"}</div><div className="text-lg font-bold text-emerald-600 dark:text-emerald-300 mt-1">{$(totalGains)}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Total Losses" : "Realized Losses"}</div><div className="text-lg font-bold text-red-500 mt-1">{$(totalLosses)}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Tax You'll Owe" : "Estimated Tax"}</div><div className="text-xl font-bold text-red-600 dark:text-red-300 mt-1">{$(estimatedTax)}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "You Keep" : "Net After Tax"}</div><div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mt-1">{$(selling.reduce((s, h) => s + h.currentValue, 0) - estimatedTax)}</div></Card>
      </div>

      {/* Harvest opportunities */}
      {harvestOpps.length > 0 && <Card className="mb-4 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30">
        <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">{jf ? "Tax-Saving Opportunities" : "Tax-Loss Harvesting"}<Tip text={jf ? "Selling losers to offset gains from winners. This lowers your tax bill legally." : "Sell losing positions to offset capital gains and reduce taxes."} /></h3>
        {harvestOpps.map((h, i) => (
          <div key={i} className="flex items-center justify-between py-1 text-xs">
            <span className="font-medium text-slate-700 dark:text-[#dde3ec]">{h.name}</span>
            <span className="text-red-500">Loss: {$(h.gain)}</span>
            <span className="text-emerald-600 dark:text-emerald-300 font-bold">Potential savings: {$(Math.abs(h.gain) * taxBracket / 100)}</span>
          </div>
        ))}
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded text-xs text-amber-700 dark:text-amber-200">{jf ? "Watch out: you can't buy back the same asset within 30 days (wash sale rule)." : "Note: Wash sale rule — cannot repurchase substantially identical security within 30 days."}</div>
      </Card>}

      <ActionBtn actions={actions} />
    </div>
  );
}

// ============================================================
// DECISION JOURNAL
// ============================================================
function DecisionJournal({ jargonFree: jf, onNav, onDecisionLogged }) {
  const [entries, setEntries] = useState([
    { id: 1, date: "2026-03-15", asset: "AAPL", action: "Buy", amount: 3000, reasoning: "Strong earnings, P/E below sector average, new product cycle starting", outcome: "won", result: 12, module: "Investments" },
    { id: 2, date: "2026-03-20", asset: "Emergency Fund", action: "Save", amount: 5000, reasoning: "Only had 2 months of expenses saved, stress test showed vulnerability", outcome: "won", result: 0, module: "Personal Finance" },
    { id: 3, date: "2026-04-01", asset: "TSLA", action: "Buy", amount: 5000, reasoning: "Momentum play after product announcement", outcome: "lost", result: -18, module: "Market Lab" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ date: "2026-04-09", asset: "", action: "Buy", amount: 0, reasoning: "", outcome: "pending", result: 0, module: "" });

  const addEntry = () => {
    if (!newEntry.asset) return;
    setEntries([{ ...newEntry, id: Date.now() }, ...entries]);
    setNewEntry({ date: "2026-04-09", asset: "", action: "Buy", amount: 0, reasoning: "", outcome: "pending", result: 0, module: "" });
    setShowAdd(false);
    if (onDecisionLogged) onDecisionLogged();
  };

  const updateOutcome = (id, outcome, result) => {
    setEntries(entries.map(e => e.id === id ? { ...e, outcome, result } : e));
  };

  const removeEntry = (id) => setEntries(entries.filter(e => e.id !== id));

  // Stats
  const resolved = entries.filter(e => e.outcome !== "pending");
  const wins = resolved.filter(e => e.outcome === "won");
  const losses = resolved.filter(e => e.outcome === "lost");
  const winRate = resolved.length > 0 ? (wins.length / resolved.length) * 100 : 0;
  const avgWin = wins.length > 0 ? wins.reduce((s, e) => s + e.result, 0) / wins.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((s, e) => s + e.result, 0) / losses.length : 0;
  const totalDecisions = entries.length;
  const pending = entries.filter(e => e.outcome === "pending").length;

  // Patterns
  const actionCounts = {};
  entries.forEach(e => { actionCounts[e.action] = (actionCounts[e.action] || 0) + 1; });
  const mostCommon = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0];

  const outcomeColors = { won: "text-emerald-600 dark:text-emerald-300", lost: "text-red-500", mixed: "text-amber-500", pending: "text-slate-400 dark:text-[#828b9a]" };
  const outcomeBg = { won: "bg-emerald-50 dark:bg-emerald-500/10", lost: "bg-red-50 dark:bg-red-500/10", mixed: "bg-amber-50 dark:bg-amber-500/10", pending: "bg-slate-50 dark:bg-[#15171c]" };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Protection" sub={jf ? "Track every financial decision you make and learn from the results" : "Log decisions, track outcomes, and discover patterns in your financial behavior"}>Decision Journal</Title>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4">
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Decisions</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{totalDecisions}</div><div className="text-xs text-slate-400 dark:text-[#828b9a]">{pending} pending</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Win Rate" : "Success Rate"}</div><div className={`text-lg font-bold mt-1 ${winRate >= 50 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{winRate.toFixed(0)}%</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Avg Win" : "Avg Gain"}</div><div className="text-lg font-bold text-emerald-600 dark:text-emerald-300 mt-1">+{avgWin.toFixed(1)}%</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Avg Loss" : "Avg Loss"}</div><div className="text-lg font-bold text-red-500 mt-1">{avgLoss.toFixed(1)}%</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Most Common" : "Top Action"}</div><div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mt-1">{mostCommon ? mostCommon[0] : "—"}</div></Card>
      </div>

      {/* Add New Entry */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{jf ? "Log a Decision" : "New Entry"}</h3>
          <Btn onClick={() => setShowAdd(!showAdd)} v={showAdd ? "danger" : "primary"}>{showAdd ? "Cancel" : "+ New Decision"}</Btn>
        </div>
        {showAdd && <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <F label="Date" value={newEntry.date} onChange={v => setNewEntry(p => ({ ...p, date: v }))} type="text" small />
            <F label="Asset / Topic" value={newEntry.asset} onChange={v => setNewEntry(p => ({ ...p, asset: v }))} type="text" small />
            <F label="Action" value={newEntry.action} onChange={v => setNewEntry(p => ({ ...p, action: v }))} type="text" options={["Buy", "Sell", "Hold", "Save", "Rebalance", "Pay Debt", "Other"].map(a => ({ value: a, label: a }))} small />
            <F label="Amount" value={newEntry.amount} onChange={v => setNewEntry(p => ({ ...p, amount: v }))} prefix="$" small />
          </div>
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-500 dark:text-[#a3acba] mb-1">{jf ? "Why did you make this decision?" : "Reasoning"}</label>
            <textarea value={newEntry.reasoning} onChange={e => setNewEntry(p => ({ ...p, reasoning: e.target.value }))} rows={2} className="bg-white dark:bg-[#1c1f26] w-full px-3 py-2 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none focus:ring-2 focus:ring-indigo-400" placeholder={jf ? "What's your thinking? What data or gut feeling led to this?" : "Document your thesis and rationale..."} />
          </div>
          <Btn onClick={addEntry} v="accent">Log Decision</Btn>
        </>}
      </Card>

      {/* Entry List */}
      <div className="space-y-3">
        {entries.map(e => (
          <Card key={e.id} className={outcomeBg[e.outcome]}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-400 dark:text-[#828b9a]">{e.date}</span>
                  <Badge color={e.action === "Buy" ? "green" : e.action === "Sell" ? "red" : "indigo"}>{e.action}</Badge>
                  <span className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{e.asset}</span>
                  {e.amount > 0 && <span className="text-xs text-slate-500 dark:text-[#a3acba]">{$(e.amount)}</span>}
                  {e.module && <span className="text-xs text-indigo-400">via {e.module}</span>}
                </div>
                <p className="text-xs text-slate-600 dark:text-[#c4ccd8] mb-2">{e.reasoning}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Result:" : "Outcome:"}</span>
                  {["pending", "won", "lost", "mixed"].map(o => (
                    <button key={o} onClick={() => updateOutcome(e.id, o, e.result)}
                      className={`px-2 py-0.5 text-xs rounded transition-colors ${e.outcome === o ? (o === "won" ? "bg-emerald-200 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : o === "lost" ? "bg-red-200 dark:bg-red-500/20 text-red-700 dark:text-red-300" : o === "mixed" ? "bg-amber-200 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200" : "bg-slate-200 dark:bg-[#2c313b] text-slate-600 dark:text-[#c4ccd8]") : "bg-white dark:bg-[#1c1f26] text-slate-400 dark:text-[#828b9a] border border-slate-200 dark:border-[#323844] hover:border-slate-300"}`}>
                      {o === "won" ? (jf ? "Won" : "Win") : o === "lost" ? (jf ? "Lost" : "Loss") : o === "mixed" ? "Mixed" : "Pending"}
                    </button>
                  ))}
                  {e.outcome !== "pending" && <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 dark:text-[#828b9a]">Return:</span>
                    <input type="number" value={e.result} onChange={ev => updateOutcome(e.id, e.outcome, Number(ev.target.value) || 0)}
                      className="bg-white dark:bg-[#1c1f26] w-16 px-1 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none text-right" />
                    <span className="text-xs text-slate-400 dark:text-[#828b9a]">%</span>
                  </div>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {e.outcome !== "pending" && <span className={`text-lg font-bold ${outcomeColors[e.outcome]}`}>{e.result >= 0 ? "+" : ""}{e.result}%</span>}
                <button onClick={() => removeEntry(e.id)} className="text-xs text-red-400 hover:text-red-600">remove</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {entries.length > 3 && <Suggest onNav={onNav} items={[
        ...(winRate < 50 ? [{ icon: "!", text: "Win rate below 50% — review your decision criteria" }] : []),
        ...(avgLoss < -15 ? [{ icon: "S", text: "Large average losses — try Stress Test", nav: "stresstest" }] : []),
        ...(winRate >= 60 ? [{ icon: "P", text: "Strong track record — check Portfolio", nav: "portfolio" }] : []),
      ]} />}
    </div>
  );
}
// ============================================================
// REMAINING MODULES (Loans, Business, BreakEven, WhatIf, Valuation, CapBudget, Options)
// ============================================================
function Loans({ jargonFree: jf }) {
  const [l, setL] = useState({ principal: 300000, rate: 6.5, term: 30, extra: 0 });
  const ul = (k) => (v) => setL(p => ({ ...p, [k]: v }));
  const mr = l.rate / 100 / 12; const n = l.term * 12;
  const mp = n <= 0 ? 0 : (mr > 0 ? l.principal * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : l.principal / n);
  const totalInt = mp * n - l.principal;
  let bal = l.principal, moE = 0, intE = 0;
  while (bal > 0 && moE < n * 2) { const i = bal * mr; bal -= Math.min(mp - i + l.extra, bal); intE += i; moE++; }
  const saved = totalInt - intE;
  const sched = []; bal = l.principal;
  for (let m = 1; m <= n && bal > 0; m++) { const i = bal * mr; const p = Math.min(mp - i + l.extra, bal); bal -= p; if (m <= 4 || m > n - 2 || m % 60 === 0) sched.push({ m, pay: i + p, p, i, bal: Math.max(bal, 0) }); }
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Money" sub={jf ? "See what any loan really costs you" : "Loan payments, total cost, and extra payment impact"}>Loan Calculator</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div><F label={jf ? "How Much You're Borrowing" : "Loan Amount"} value={l.principal} onChange={ul("principal")} prefix="$" /><F label="Interest Rate" value={l.rate} onChange={ul("rate")} suffix="%" /><F label={jf ? "How Many Years" : "Term"} value={l.term} onChange={ul("term")} suffix="years" /><F label={jf ? "Extra You Could Pay Each Month" : "Extra Monthly Payment"} value={l.extra} onChange={ul("extra")} prefix="$" info={jf ? "Even $100 extra per month can save you thousands." : "Additional principal payment above minimum."} /></div>
        <div className="grid grid-cols-2 gap-3">
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Monthly Bill" : "Payment"}</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(mp)}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Total Interest" : "Total Interest"}</div><div className="text-lg font-bold text-red-500 mt-1">{$(totalInt)}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">Total Cost</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(mp * n)}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Interest vs Borrowed" : "Interest/Principal"}</div><div className="text-lg font-bold text-indigo-600 dark:text-indigo-300 mt-1">{l.principal > 0 && Number.isFinite(totalInt) ? ((totalInt / l.principal) * 100).toFixed(0) + "%" : "—"}</div></Card>
        </div>
      </div>
      {l.extra > 0 && <Card className="mb-4 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"><p className="text-sm text-emerald-700 dark:text-emerald-300">Extra {$(l.extra)}/mo saves <strong>{$(saved)}</strong> in interest and pays off <strong>{(l.term - moE / 12).toFixed(1)} years early</strong>.</p></Card>}
      <Card><h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6] mb-2">{jf ? "Payment Schedule" : "Amortization"}</h3><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-slate-50 dark:bg-[#15171c]"><th className="text-left py-1 px-2 text-slate-500 dark:text-[#a3acba]">Month</th><th className="text-right py-1 px-2 text-slate-500 dark:text-[#a3acba]">Payment</th><th className="text-right py-1 px-2 text-slate-500 dark:text-[#a3acba]">Principal</th><th className="text-right py-1 px-2 text-slate-500 dark:text-[#a3acba]">Interest</th><th className="text-right py-1 px-2 text-slate-500 dark:text-[#a3acba]">Balance</th></tr></thead><tbody>{sched.map((r, i) => <tr key={i} className="border-t border-slate-100 dark:border-[#262b33]"><td className="py-1 px-2">{r.m}</td><td className="py-1 px-2 text-right">{$(r.pay)}</td><td className="py-1 px-2 text-right text-emerald-600 dark:text-emerald-300">{$(r.p)}</td><td className="py-1 px-2 text-right text-red-500">{$(r.i)}</td><td className="py-1 px-2 text-right font-medium">{$(r.bal)}</td></tr>)}</tbody></table></div></Card>
    </div>
  );
}

function Business({ jargonFree: jf }) {
  const [prods, setProds] = useState([{ name: "Product A", rev: 200000, cogs: 80000, price: 50, cost: 20 }, { name: "Product B", rev: 180000, cogs: 90000, price: 35, cost: 18 }, { name: "Product C", rev: 120000, cogs: 70000, price: 75, cost: 40 }]);
  const [b, setB] = useState({ exp: 350000, labor: 120000, debt: 150000, equity: 200000, cash: 80000, emp: 12, lastRev: 420000 });
  const uB = (k) => (v) => setB(p => ({ ...p, [k]: v }));
  const tRev = prods.reduce((s, p) => s + p.rev, 0); const tCOGS = prods.reduce((s, p) => s + p.cogs, 0);
  const gm = tRev > 0 ? ((tRev - tCOGS) / tRev) * 100 : 0; const nmarg = tRev > 0 ? ((tRev - b.exp) / tRev) * 100 : 0;
  const lev = b.equity > 0 ? b.debt / b.equity : 0; const gr = b.lastRev > 0 ? ((tRev - b.lastRev) / b.lastRev) * 100 : 0;
  let sc = 0; if (gm >= 50) sc += 20; else if (gm >= 35) sc += 14; else sc += 5; if (nmarg >= 15) sc += 20; else if (nmarg >= 8) sc += 14; else if (nmarg >= 0) sc += 7; if (lev >= 0.5 && lev <= 2) sc += 15; else if (lev < 3) sc += 8; if (gr >= 15) sc += 15; else if (gr >= 5) sc += 10; else if (gr >= 0) sc += 5; const rpe = b.emp > 0 ? tRev / b.emp : 0; if (rpe >= 150000) sc += 15; else if (rpe >= 80000) sc += 10; else sc += 3; sc = Math.min(sc, 100);
  const actions = [];
  const weakProduct = prods.reduce((w, p, i) => { const m = p.rev > 0 ? (p.rev - p.cogs) / p.rev * 100 : 0; return m < (w.m || 999) ? { i, m, name: p.name } : w; }, {});
  if (weakProduct.m < 25) actions.push({ title: `Review ${weakProduct.name} — only ${weakProduct.m.toFixed(0)}% margin`, detail: "Consider raising its price or reducing costs." });
  if (nmarg < 8) actions.push({ title: "Improve net margin (" + nmarg.toFixed(1) + "%)", detail: "Review biggest expense categories." });
  if (lev > 2.5) actions.push({ title: "Reduce leverage", detail: "High debt increases risk." });
  if (actions.length === 0) actions.push({ title: "Business is healthy", detail: "Focus on growth and maintaining margins." });
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Business" sub={jf ? "See which products make money and which don't" : "Multi-product analysis with health scoring"}>Business Health</Title>
      <Card className="mb-4"><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Products</h3><Btn onClick={() => setProds([...prods, { name: `Product ${String.fromCharCode(65 + prods.length)}`, rev: 50000, cogs: 25000, price: 30, cost: 15 }])} v="secondary">+ Add</Btn></div>
        {prods.map((p, i) => <div key={i} className="flex gap-2 mb-2 items-end"><div className="w-24"><label className="block text-xs text-slate-400 dark:text-[#828b9a] mb-0.5">Name</label><input type="text" value={p.name} onChange={e => { const u = [...prods]; u[i].name = e.target.value; setProds(u); }} className="bg-white dark:bg-[#1c1f26] w-full px-2 py-1 text-sm border border-slate-200 dark:border-[#323844] rounded-lg outline-none" /></div><div className="w-24"><F label="Revenue" value={p.rev} onChange={v => { const u = [...prods]; u[i].rev = v; setProds(u); }} prefix="$" small /></div><div className="w-24"><F label="COGS" value={p.cogs} onChange={v => { const u = [...prods]; u[i].cogs = v; setProds(u); }} prefix="$" small /></div><div className="w-20"><F label="Price" value={p.price} onChange={v => { const u = [...prods]; u[i].price = v; setProds(u); }} prefix="$" small /></div><div className="w-20"><F label="Cost" value={p.cost} onChange={v => { const u = [...prods]; u[i].cost = v; setProds(u); }} prefix="$" small /></div><div className={`text-sm font-bold pb-1 ${(p.rev - p.cogs) / (p.rev || 1) * 100 >= 40 ? "text-emerald-600 dark:text-emerald-300" : "text-amber-500"}`}>{((p.rev - p.cogs) / (p.rev || 1) * 100).toFixed(1)}%</div>{prods.length > 1 && <button onClick={() => setProds(prods.filter((_, idx) => idx !== i))} className="text-red-400 text-xs pb-1">x</button>}</div>)}
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div><F label="Total Expenses" value={b.exp} onChange={uB("exp")} prefix="$" /><F label="Debt" value={b.debt} onChange={uB("debt")} prefix="$" /><F label="Equity" value={b.equity} onChange={uB("equity")} prefix="$" /><F label="Employees" value={b.emp} onChange={uB("emp")} /><F label="Last Year Revenue" value={b.lastRev} onChange={uB("lastRev")} prefix="$" /></div>
        <Card><div className="flex items-center gap-3"><Ring score={sc} max={100} color={sc >= 70 ? "green" : sc >= 45 ? "yellow" : "red"} /><div className="flex-1"><Bar value={gm} min={0} max={80} good={35} bad={20} label={jf ? "Gross Profit %" : "Gross Margin"} display={$(gm, "%")} /><Bar value={nmarg} min={-20} max={30} good={8} bad={0} label={jf ? "Bottom Line %" : "Net Margin"} display={$(nmarg, "%")} /><Bar value={lev} min={0} max={5} good={0.5} bad={2.5} label={jf ? "Borrowing" : "Leverage"} display={$(lev, "x")} /><Bar value={gr} min={-20} max={40} good={10} bad={0} label="Growth" display={$(gr, "%")} /></div></div></Card>
      </div>
      <ActionBtn actions={actions} />
    </div>
  );
}

function BreakEven({ jargonFree: jf }) {
  const [d, setD] = useState({ fc: 15000, price: 50, vc: 22, units: 800 });
  const u = (k) => (v) => setD(p => ({ ...p, [k]: v }));
  const cm = d.price - d.vc; const be = cm > 0 ? Math.ceil(d.fc / cm) : Infinity; const beRev = be * d.price;
  const profit = (d.units * cm) - d.fc; const margin = be > 0 ? ((d.units - be) / be) * 100 : 0;
  const scenarios = [{ l: "Current", p: d.price, v: d.vc, f: d.fc }, { l: "+10% Price", p: d.price * 1.1, v: d.vc, f: d.fc }, { l: "-10% Costs", p: d.price, v: d.vc * 0.9, f: d.fc }, { l: "+20% Fixed", p: d.price, v: d.vc, f: d.fc * 1.2 }].map(s => ({ ...s, be: (s.p - s.v) > 0 ? Math.ceil(s.f / (s.p - s.v)) : Infinity }));
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Business" sub={jf ? "How many do you need to sell to stop losing money?" : "Find your break-even point and test scenarios"}>Break-Even Analysis</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div><F label={jf ? "Monthly Fixed Bills" : "Monthly Fixed Costs"} value={d.fc} onChange={u("fc")} prefix="$" /><F label={jf ? "What You Charge" : "Price Per Unit"} value={d.price} onChange={u("price")} prefix="$" /><F label={jf ? "What It Costs You" : "Variable Cost/Unit"} value={d.vc} onChange={u("vc")} prefix="$" /><F label={jf ? "How Many You Sell Now" : "Current Monthly Units"} value={d.units} onChange={u("units")} /></div>
        <div className="grid grid-cols-2 gap-3">
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Units to Break Even" : "BE Units"}</div><div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">{be === Infinity ? "N/A" : be.toLocaleString()}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Revenue to Break Even" : "BE Revenue"}</div><div className="text-xl font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(beRev)}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Profit Per Item" : "CM/Unit"}</div><div className="text-xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">{$(cm)}</div></Card>
          <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Monthly Profit" : "Current P&L"}</div><div className={`text-xl font-bold mt-1 ${profit >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(profit)}</div></Card>
        </div>
      </div>
      <Card className="mb-4"><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">{jf ? "What If Scenarios" : "Sensitivity"}</h3><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-slate-50 dark:bg-[#15171c]"><th className="text-left py-1.5 px-3 text-xs text-slate-500 dark:text-[#a3acba]">Scenario</th><th className="text-right py-1.5 px-3 text-xs text-slate-500 dark:text-[#a3acba]">Price</th><th className="text-right py-1.5 px-3 text-xs text-slate-500 dark:text-[#a3acba]">Cost</th><th className="text-right py-1.5 px-3 text-xs text-slate-500 dark:text-[#a3acba]">Fixed</th><th className="text-right py-1.5 px-3 text-xs text-slate-500 dark:text-[#a3acba]">Break-Even</th><th className="text-right py-1.5 px-3 text-xs text-slate-500 dark:text-[#a3acba]">vs Current</th></tr></thead><tbody>{scenarios.map((s, i) => <tr key={i} className={`border-t border-slate-100 dark:border-[#262b33] ${i === 0 ? "bg-indigo-50 dark:bg-indigo-500/10" : ""}`}><td className="py-1 px-3 font-medium">{s.l}</td><td className="py-1 px-3 text-right">{$(s.p)}</td><td className="py-1 px-3 text-right">{$(s.v)}</td><td className="py-1 px-3 text-right">{$(s.f)}</td><td className="py-1 px-3 text-right font-bold">{s.be === Infinity ? "N/A" : s.be.toLocaleString()}</td><td className={`py-1 px-3 text-right ${i === 0 ? "" : s.be < be ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{i === 0 ? "—" : (s.be - be > 0 ? "+" : "") + (s.be - be)}</td></tr>)}</tbody></table></div></Card>
      <Card className="bg-slate-50 dark:bg-[#15171c]"><p className="text-sm text-slate-700 dark:text-[#dde3ec]">{profit >= 0 ? `You're ${margin.toFixed(0)}% above break-even. Each additional unit adds ${$(cm)} to profit.` : `You need ${(be - d.units).toLocaleString()} more units to break even.`}</p></Card>
    </div>
  );
}

function WhatIf({ jargonFree: jf }) {
  const [base, setBase] = useState({ rev: 500000, cogs: 200000, opex: 180000, emp: 8, debt: 150000, rate: 6, units: 10000, price: 50 });
  const uB = (k) => (v) => setBase(p => ({ ...p, [k]: v }));
  const [adj, setAdj] = useState({ price: 0, units: 0, cogs: 0, opex: 0, emp: 0, debt: 0, rate: 0 });
  const uA = (k) => (v) => setAdj(p => ({ ...p, [k]: v }));
  const [editing, setEditing] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);

  const SCENARIOS = [
    { name: jf ? "Raise Prices 10%" : "Price Increase", desc: jf ? "What if you charge 10% more?" : "+10% price adjustment", icon: "↑", adj: { price: 10, units: -3, cogs: 0, opex: 0, emp: 0, debt: 0, rate: 0 } },
    { name: jf ? "Lose Top Client" : "Revenue Drop", desc: jf ? "Your biggest client leaves — revenue drops 25%" : "-25% revenue shock", icon: "↓", adj: { price: 0, units: -25, cogs: 0, opex: 0, emp: 0, debt: 0, rate: 0 } },
    { name: jf ? "Hire 3 People" : "Team Expansion", desc: jf ? "Grow the team, increase capacity" : "Add headcount + capacity", icon: "+", adj: { price: 0, units: 10, cogs: 5, opex: 15, emp: 3, debt: 0, rate: 0 } },
    { name: jf ? "Double Marketing" : "Marketing Push", desc: jf ? "Spend big to grow fast" : "2x marketing spend", icon: "M", adj: { price: 0, units: 15, cogs: 0, opex: 20, emp: 0, debt: 0, rate: 0 } },
    { name: jf ? "Recession Hits" : "Economic Downturn", desc: jf ? "Sales drop, costs rise, rates spike" : "Multi-factor recession", icon: "!", adj: { price: -5, units: -20, cogs: 10, opex: 5, emp: 0, debt: 0, rate: 2 } },
    { name: jf ? "Cut Costs 15%" : "Cost Optimization", desc: jf ? "Tighten operations across the board" : "OpEx & COGS reduction", icon: "✂", adj: { price: 0, units: 0, cogs: -15, opex: -15, emp: -1, debt: 0, rate: 0 } },
  ];

  const calc = (a) => { const r = (base.units * (1 + a.units / 100)) * (base.price * (1 + a.price / 100)); const c = base.cogs * (1 + a.cogs / 100); const o = base.opex * (1 + a.opex / 100); const i = (base.debt * (1 + a.debt / 100)) * ((base.rate + a.rate) / 100); const n = r - c - o - i; return { rev: r, net: n, margin: r > 0 ? n / r * 100 : 0, rpe: (base.emp + a.emp) > 0 ? r / (base.emp + a.emp) : 0 }; };
  const cur = calc({ price: 0, units: 0, cogs: 0, opex: 0, emp: 0, debt: 0, rate: 0 });
  const scen = calc(adj);
  const diff = { rev: scen.rev - cur.rev, net: scen.net - cur.net, margin: scen.margin - cur.margin, rpe: scen.rpe - cur.rpe };

  const applyScenario = (s) => { setAdj(s.adj); setActiveScenario(s.name); };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Business" sub={jf ? "Pick a scenario or build your own — see the impact instantly" : "Pre-built scenarios and custom adjustments with before/after comparison"}>What-If Scenario Engine</Title>

      {/* Scenario Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {SCENARIOS.map((s, i) => (
          <button key={i} onClick={() => applyScenario(s)} className={`p-3 rounded-xl border text-left transition-all ${activeScenario === s.name ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 shadow-md" : "border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26] hover:border-indigo-300 hover:shadow-sm"}`}>
            <div className="flex items-center gap-2 mb-1"><span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold">{s.icon}</span><span className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{s.name}</span></div>
            <p className="text-xs text-slate-500 dark:text-[#a3acba]">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Before vs After Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className="bg-slate-50 dark:bg-[#15171c] border-slate-200 dark:border-[#323844]">
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#a3acba] uppercase mb-2">{jf ? "Before" : "Current State"}</h3>
          <div className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6]">{$(cur.net)}</div>
          <div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "profit" : "net profit"} | {$(cur.rev)} revenue | {cur.margin.toFixed(1)}% margin</div>
        </Card>
        <Card className={`${diff.net >= 0 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"}`}>
          <h3 className="text-xs font-bold text-slate-500 dark:text-[#a3acba] uppercase mb-2">{jf ? "After" : "Projected"}{activeScenario && <span className="text-indigo-600 dark:text-indigo-300 normal-case ml-1">— {activeScenario}</span>}</h3>
          <div className={`text-2xl font-bold ${diff.net >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>{$(scen.net)}</div>
          <div className={`text-xs font-bold ${diff.net >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{diff.net >= 0 ? "+" : ""}{$(diff.net)} ({diff.net !== 0 && cur.net !== 0 ? (diff.net / Math.abs(cur.net) * 100).toFixed(1) + "%" : "0%"})</div>
        </Card>
      </div>

      {/* Impact Breakdown */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6] mb-3">{jf ? "How Each Number Changes" : "Impact Breakdown"}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[{ l: "Revenue", b: cur.rev, s: scen.rev, d: diff.rev }, { l: jf ? "Profit" : "Net Profit", b: cur.net, s: scen.net, d: diff.net }, { l: "Margin", b: cur.margin, s: scen.margin, d: diff.margin, p: true }, { l: jf ? "Rev/Person" : "Rev/Employee", b: cur.rpe, s: scen.rpe, d: diff.rpe }].map((m, i) => (
            <div key={i} className="p-3 bg-slate-50 dark:bg-[#15171c] rounded-lg">
              <div className="text-xs text-slate-400 dark:text-[#828b9a] mb-1">{m.l}</div>
              <div className="text-xs text-slate-400 dark:text-[#828b9a]">Was: {m.p ? $(m.b, "%") : $(m.b)}</div>
              <div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">{m.p ? $(m.s, "%") : $(m.s)}</div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-[#2c313b] rounded-full mt-1 overflow-hidden"><div className={`h-full rounded-full ${m.d >= 0 ? "bg-emerald-400" : "bg-red-400"}`} style={{ width: `${Math.min(Math.abs(m.d) / (Math.abs(m.b) || 1) * 100, 100)}%` }} /></div>
              <div className={`text-xs font-bold mt-0.5 ${m.d >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{m.d >= 0 ? "+" : ""}{m.p ? m.d.toFixed(1) + " pts" : $(m.d)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Custom Adjustments */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{jf ? "Fine-Tune the Numbers" : "Custom Adjustments"}</h3>
          <div className="flex gap-2">
            <Btn onClick={() => { setAdj({ price: 0, units: 0, cogs: 0, opex: 0, emp: 0, debt: 0, rate: 0 }); setActiveScenario(null); }} v="secondary">Reset</Btn>
            <Btn onClick={() => setEditing(!editing)} v="secondary">{editing ? "Hide Baseline" : "Edit Baseline"}</Btn>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <F label={jf ? "Raise/Lower Price" : "Price Change"} value={adj.price} onChange={uA("price")} suffix="%" small />
          <F label={jf ? "Sell More/Less" : "Volume Change"} value={adj.units} onChange={uA("units")} suffix="%" small />
          <F label={jf ? "Material Cost Change" : "COGS Change"} value={adj.cogs} onChange={uA("cogs")} suffix="%" small />
          <F label={jf ? "Overhead Change" : "OpEx Change"} value={adj.opex} onChange={uA("opex")} suffix="%" small />
          <F label={jf ? "Hire/Fire" : "Employee Change"} value={adj.emp} onChange={uA("emp")} small />
          <F label="Debt Change" value={adj.debt} onChange={uA("debt")} suffix="%" small />
          <F label={jf ? "Rate Change" : "Interest Change"} value={adj.rate} onChange={uA("rate")} suffix="pts" small />
        </div>
      </Card>

      {/* Baseline Editor */}
      {editing && <Card className="mb-4">
        <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-2">{jf ? "Your Current Numbers" : "Baseline"}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <F label="Revenue" value={base.rev} onChange={uB("rev")} prefix="$" small />
          <F label="COGS" value={base.cogs} onChange={uB("cogs")} prefix="$" small />
          <F label={jf ? "Overhead" : "OpEx"} value={base.opex} onChange={uB("opex")} prefix="$" small />
          <F label="Employees" value={base.emp} onChange={uB("emp")} small />
          <F label="Debt" value={base.debt} onChange={uB("debt")} prefix="$" small />
          <F label="Interest Rate" value={base.rate} onChange={uB("rate")} suffix="%" small />
          <F label="Units Sold" value={base.units} onChange={uB("units")} small />
          <F label="Price/Unit" value={base.price} onChange={uB("price")} prefix="$" small />
        </div>
      </Card>}
    </div>
  );
}

function Valuation({ jargonFree: jf }) {
  const [d, setD] = useState({ rf: 4.25, beta: 1.15, mrp: 6, kd: 6.5, tax: 21, we: 60, wd: 40, tg: 2.5, debt: 2e6, cash: 5e5, shares: 1e5 });
  const [fcfs, setFcfs] = useState([500000, 575000, 650000, 725000, 800000]);
  const u = (k) => (v) => setD(p => ({ ...p, [k]: v }));
  const ke = d.rf + d.beta * d.mrp; const atd = d.kd * (1 - d.tax / 100); const wacc = (d.we / 100) * ke + (d.wd / 100) * atd; const dr = wacc / 100;
  const pvs = fcfs.map((f, i) => f / Math.pow(1 + dr, i + 1)); const tPv = pvs.reduce((a, b) => a + b, 0);
  const tv = dr > d.tg / 100 ? (fcfs[fcfs.length - 1] * (1 + d.tg / 100)) / (dr - d.tg / 100) : 0; const pvTv = tv / Math.pow(1 + dr, fcfs.length);
  const ev = tPv + pvTv; const eq = ev - d.debt + d.cash; const pps = d.shares > 0 ? eq / d.shares : 0;
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Business" sub={jf ? "Figure out what a business is actually worth" : "CAPM + WACC + DCF with dynamic projections"}>Valuation Suite</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">{jf ? "What Investors Expect" : "Cost of Equity (CAPM)"}</h3>
          <F label={jf ? "Safe Rate (10-Yr Treasury)" : "Risk-Free Rate"} value={d.rf} onChange={u("rf")} suffix="%" small /><F label={jf ? "How Jumpy Is This Stock" : "Beta"} value={d.beta} onChange={u("beta")} small /><F label={jf ? "Extra for Stock Risk" : "Market Premium"} value={d.mrp} onChange={u("mrp")} suffix="%" small />
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg mt-2"><span className="text-xs text-indigo-500">{jf ? "Investor Expected Return" : "Cost of Equity"}: </span><span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{ke.toFixed(2)}%</span></div></Card>
        <Card><h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">{jf ? "Blended Cost of Money" : "WACC"}</h3>
          <F label={jf ? "Loan Rate" : "Cost of Debt"} value={d.kd} onChange={u("kd")} suffix="%" small /><F label="Tax Rate" value={d.tax} onChange={u("tax")} suffix="%" small /><F label={jf ? "% Funded by Owners" : "Equity Weight"} value={d.we} onChange={u("we")} suffix="%" small /><F label={jf ? "% Funded by Loans" : "Debt Weight"} value={d.wd} onChange={u("wd")} suffix="%" small />
          <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg mt-2"><span className="text-xs text-emerald-500">WACC: </span><span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{wacc.toFixed(2)}%</span></div></Card>
      </div>
      <Card className="mb-4"><div className="flex items-center justify-between mb-2"><h3 className="text-sm font-bold text-violet-700 dark:text-violet-300">{jf ? "Future Cash Flows" : "DCF"}</h3><div className="flex gap-2"><Btn onClick={() => setFcfs([...fcfs, fcfs[fcfs.length - 1] * 1.1])} v="secondary">+ Year</Btn><Btn onClick={() => fcfs.length > 1 && setFcfs(fcfs.slice(0, -1))} v="danger">- Year</Btn></div></div>
        <div className="flex gap-2 overflow-x-auto mb-3">{fcfs.map((f, i) => <div key={i} className="shrink-0 w-24"><F label={`Yr ${i + 1}`} value={f} onChange={v => { const a = [...fcfs]; a[i] = v; setFcfs(a); }} prefix="$" small /><div className="text-xs text-center text-slate-400 dark:text-[#828b9a]">PV: {$(pvs[i])}</div></div>)}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"><F label={jf ? "Long-term Growth" : "Terminal Growth"} value={d.tg} onChange={u("tg")} suffix="%" small /><F label="Debt" value={d.debt} onChange={u("debt")} prefix="$" small /><F label="Cash" value={d.cash} onChange={u("cash")} prefix="$" small /></div>
        <F label="Shares" value={d.shares} onChange={u("shares")} small /></Card>
      <div className="mb-2"><ConfidenceLabel level="valuation" note="DCF outputs depend on growth-rate, WACC, and terminal-value guesses. Equity analysts target ±20-30% on stable companies; high-growth or volatile names can swing ±50%. Don't trade on this as if it were a price target — use it as a sanity check against market price." /></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Cash Flow Value" : "PV of FCFs"}</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(tPv)}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Future Value" : "PV Terminal"}</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(pvTv)}</div></Card>
        <Card accent="neutral"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Total Business Value" : "Enterprise Value"}</div><div className="text-2xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">{$(ev)}</div><div className="text-xs text-slate-400 dark:text-[#828b9a] mt-1">Fair range: {$(ev * 0.7)} – {$(ev * 1.3)}</div></Card>
        <Card accent="good"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "What Each Share Is Worth" : "Price/Share"}</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">{$(pps)}</div><div className="text-xs text-slate-400 dark:text-[#828b9a] mt-1">Fair range: {$(pps * 0.7)} – {$(pps * 1.3)}</div></Card>
      </div>
      <Assumptions items={[
        { formula: "Cost of Equity (CAPM): rE = Rf + β × (Rm - Rf)", what: "Risk-free rate plus beta times the equity risk premium. Standard CAPM.", assumptions: ["Risk-free rate = 10-year Treasury yield (you set it manually; currently a hardcoded default)", "Beta is a noisy single number — real betas vary by estimation window and shift over time", "Equity risk premium of 5-7% historically; could be lower going forward as some research suggests"], source: "Sharpe (1964), Lintner (1965); see Damodaran's annual ERP updates for current figures." },
        { formula: "WACC = (E/V)·rE·(1 - T) + (D/V)·rD·(1 - T)", what: "Weighted average cost of capital. Equity-weighted cost of equity plus debt-weighted after-tax cost of debt.", assumptions: ["Equity and debt weights are at MARKET VALUE, not book value", "Tax rate applies only to interest (debt tax shield) — assumes no NOLs or AMT", "Capital structure stays roughly constant over the projection period"] },
        { formula: "DCF = Σ FCF_t / (1+WACC)^t + Terminal Value / (1+WACC)^n", what: "Discounted Free Cash Flow with a Gordon growth terminal value: TV = FCF_n × (1+g) / (WACC - g).", assumptions: ["Free cash flows you input are unlevered (firm-level, before interest)", "Terminal growth rate must be below WACC (otherwise the formula blows up to infinity)", "Long-term growth rate cannot exceed long-term GDP growth (typically 2-3%) — anything higher implies the company eventually owns the whole economy", "60-80% of the answer typically comes from the terminal value — the most fragile assumption"], source: "Standard practitioner DCF; Aswath Damodaran 'Investment Valuation' is the canonical reference." },
        { formula: "Per-share value = (Enterprise Value - Debt + Cash) / Shares Outstanding", what: "Equity value (numerator) divided by diluted shares.", assumptions: ["Shares outstanding doesn't include unvested stock comp dilution or future issuances", "Cash is freely deployable (no minimum operating cash reserved)"] },
        { formula: "Fair-value range ±30%", what: "Equity analysts who do DCF for a living publish ranges, not point estimates. A 1% move in WACC swings the answer 15-25%. Small growth-rate changes compound.", source: "Standard sell-side equity research practice." },
      ]} />
    </div>
  );
}

function CapBudget({ jargonFree: jf }) {
  const [projects, setProjects] = useState([{ id: 1, name: "Project A", inv: 100000, cfs: [30000, 35000, 40000, 45000, 50000] }, { id: 2, name: "Project B", inv: 150000, cfs: [50000, 50000, 50000, 50000, 50000] }]);
  const [dr, setDr] = useState(10);
  const analyze = (p) => { const r = dr / 100; const n = p.cfs.length; const pvs = p.cfs.map((c, i) => c / Math.pow(1 + r, i + 1)); const npv = pvs.reduce((a, b) => a + b, 0) - p.inv; const pi = p.inv > 0 ? pvs.reduce((a, b) => a + b, 0) / p.inv : 0; let cum = 0, pb = Infinity; for (let i = 0; i < n; i++) { cum += p.cfs[i]; if (cum >= p.inv) { pb = i + 1 - (cum - p.inv) / p.cfs[i]; break; } } let irr = 0.1; for (let it = 0; it < 200; it++) { let f = -p.inv, df = 0; for (let i = 0; i < n; i++) { f += p.cfs[i] / Math.pow(1 + irr, i + 1); df -= (i + 1) * p.cfs[i] / Math.pow(1 + irr, i + 2); } if (Math.abs(f) < 0.01) break; irr -= f / df; if (irr <= -1) irr = 0.001; }
    // EAA: Equivalent Annual Annuity — NPV spread evenly over project life
    const eaa = r > 0 && n > 0 ? npv * (r / (1 - Math.pow(1 + r, -n))) : (n > 0 ? npv / n : 0);
    return { npv, irr: irr * 100, pb, pi, eaa, years: n }; };
  const results = projects.map(analyze);
  // Rank projects
  const ranked = projects.map((p, i) => ({ name: p.name, idx: i, ...results[i] })).filter(r => r.npv >= 0).sort((a, b) => b.eaa - a.eaa);
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Business" sub={jf ? "Should you invest in this? Let the numbers decide." : "NPV, IRR, Payback, PI — unlimited projects and years"}>Capital Budgeting</Title>
      <div className="mb-3"><ConfidenceLabel level="estimate" note="NPV depends entirely on your cash-flow forecast and discount-rate guess. Small input changes compound to large output swings. Treat positive NPV as 'likely worth doing,' not 'guaranteed return.'" /></div>
      <F label={jf ? "Minimum Return You Need" : "Discount Rate"} value={dr} onChange={setDr} suffix="%" />
      {projects.map((p, pi) => <Card key={p.id} className="mb-4 mt-3"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><input type="text" value={p.name} onChange={e => { const u = [...projects]; u[pi].name = e.target.value; setProjects(u); }} className="text-sm font-bold text-slate-800 dark:text-[#eef1f6] bg-transparent border-b border-slate-200 dark:border-[#323844] outline-none" />{results[pi].npv >= 0 ? <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded">{jf ? "GOOD DEAL" : "ACCEPT"}</span> : <span className="px-2 py-0.5 bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 text-xs font-bold rounded">{jf ? "BAD DEAL" : "REJECT"}</span>}</div><div className="flex gap-2"><Btn onClick={() => { const u = [...projects]; u[pi].cfs.push(u[pi].cfs[u[pi].cfs.length - 1] || 25000); setProjects(u); }} v="secondary">+ Year</Btn><Btn onClick={() => { const u = [...projects]; if (u[pi].cfs.length > 1) u[pi].cfs.pop(); setProjects(u); }} v="secondary">- Year</Btn>{projects.length > 1 && <Btn onClick={() => setProjects(projects.filter((_, i) => i !== pi))} v="danger">Remove</Btn>}</div></div>
        <div className="flex gap-2 overflow-x-auto mb-2"><div className="shrink-0 w-28"><F label={jf ? "Upfront Cost" : "Investment"} value={p.inv} onChange={v => { const u = [...projects]; u[pi].inv = v; setProjects(u); }} prefix="$" small /></div>{p.cfs.map((c, ci) => <div key={ci} className="shrink-0 w-24"><F label={`Yr ${ci + 1}`} value={c} onChange={v => { const u = [...projects]; u[pi].cfs[ci] = v; setProjects(u); }} prefix="$" small /></div>)}</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">{[{ l: jf ? "Value Created" : "NPV", v: $(results[pi].npv), g: results[pi].npv >= 0 }, { l: jf ? "Actual Return" : "IRR", v: results[pi].irr.toFixed(1) + "%", g: results[pi].irr > dr }, { l: jf ? "Get Money Back In" : "Payback", v: results[pi].pb === Infinity ? "Never" : results[pi].pb.toFixed(1) + " yrs" }, { l: jf ? "Bang for Buck" : "PI", v: results[pi].pi.toFixed(2) + "x", g: results[pi].pi >= 1 }, { l: jf ? "Annual Value" : "EAA", v: $(results[pi].eaa), g: results[pi].eaa > 0, info: true }].map((m, i) => <div key={i} className="p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{m.l}{m.info && <Tip text={jf ? "Equivalent Annual Annuity — spreads the value evenly across each year. Use this to compare projects with different lifespans." : "EAA normalizes NPV over project life. Compare projects with different durations."} />}</div><div className={`text-base font-bold ${m.g === true ? "text-emerald-600 dark:text-emerald-300" : m.g === false ? "text-red-500" : "text-slate-800 dark:text-[#eef1f6]"}`}>{m.v}</div></div>)}</div></Card>)}
      {/* Project Ranking Table */}
      {ranked.length > 1 && <Card className="mb-4 mt-4">
        <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">{jf ? "Which Project Wins?" : "Project Ranking"}<Tip text={jf ? "Ranked by EAA (annual value) so you can fairly compare projects with different lifespans." : "Ranked by Equivalent Annual Annuity for fair comparison across different project durations."} /></h3>
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-slate-50 dark:bg-[#15171c]">
          <th className="text-left py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Rank</th>
          <th className="text-left py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Project</th>
          <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">NPV</th>
          <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">IRR</th>
          <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">PI</th>
          <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Years</th>
          <th className="text-right py-1.5 px-2 text-slate-500 dark:text-[#a3acba] font-bold text-indigo-600 dark:text-indigo-300">EAA</th>
        </tr></thead><tbody>{ranked.map((r, i) => (
          <tr key={r.idx} className={`border-t border-slate-100 dark:border-[#262b33] ${i === 0 ? "bg-emerald-50 dark:bg-emerald-500/10" : ""}`}>
            <td className="py-1.5 px-2 font-bold">{i === 0 ? "🏆 1" : i + 1}</td>
            <td className="py-1.5 px-2 font-medium">{r.name}</td>
            <td className="py-1.5 px-2 text-right text-emerald-600 dark:text-emerald-300">{$(r.npv)}</td>
            <td className="py-1.5 px-2 text-right">{r.irr.toFixed(1)}%</td>
            <td className="py-1.5 px-2 text-right">{r.pi.toFixed(2)}x</td>
            <td className="py-1.5 px-2 text-right">{r.years}</td>
            <td className="py-1.5 px-2 text-right font-bold text-indigo-600 dark:text-indigo-300">{$(r.eaa)}</td>
          </tr>
        ))}</tbody></table></div>
        {ranked.length > 0 && <div className="mt-2 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-xs text-indigo-700 dark:text-indigo-300">{jf ? `Best choice: ${ranked[0].name} — creates ${$(ranked[0].eaa)} in value per year` : `Recommended: ${ranked[0].name} — highest EAA at ${$(ranked[0].eaa)}/yr`}</div>}
      </Card>}
      <Btn onClick={() => setProjects(ps => [...ps, { id: ps.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1, name: `Project ${String.fromCharCode(65 + ps.length)}`, inv: 100000, cfs: [25000, 25000, 25000, 25000, 25000] }])} v="secondary" className="w-full">+ Add Project</Btn>
      <Assumptions items={[
        { formula: "NPV = Σ CF_t / (1+r)^t - Initial Investment", what: "Sum of present-valued cash flows minus upfront cost. Positive NPV = project creates value at the given discount rate.", assumptions: ["Cash flows are end-of-period (annual)", "Discount rate is constant over the project life — real projects often face changing capital costs", "No reinvestment of intermediate cash flows modeled", "No salvage/terminal value beyond the last cash flow you enter — add it manually as the final year's cash flow"], source: "Brealey, Myers & Allen 'Principles of Corporate Finance'." },
        { formula: "IRR = discount rate that makes NPV = 0 (Newton-Raphson solver)", what: "We iterate to find the rate where present-valued cash flows exactly equal the initial investment.", assumptions: ["Solver starts at 10% and converges in ≤200 iterations; pathological cash flows (multiple sign changes) can produce multiple IRRs", "When IRR > WACC, accept; otherwise reject. For mutually exclusive projects, use NPV not IRR — IRR penalizes scale"] },
        { formula: "Payback = years until cumulative cash flow = initial investment", what: "Linear interpolation in the final partial year. Ignores time value of money — a quick-and-dirty risk indicator only.", assumptions: ["Does not discount future cash flows", "Ignores cash flows after payback"] },
        { formula: "PI (Profitability Index) = PV of cash inflows / Initial Investment", what: "Bang per buck. Useful when capital is rationed and you can't take every positive-NPV project.", assumptions: ["Same as NPV assumptions"] },
        { formula: "EAA (Equivalent Annual Annuity) = NPV × r / (1 - (1+r)^-n)", what: "Spreads NPV evenly across each year. Use this to fairly compare projects with different lifespans — a 10-year project with NPV $500k is NOT better than a 3-year project with NPV $400k.", assumptions: ["Project can be repeated indefinitely at the same terms — usually not true in practice"], source: "Standard CFA Institute capital budgeting methodology." },
      ]} />
    </div>
  );
}

function Options({ jargonFree: jf }) {
  const [d, setD] = useState({ S: 150, K: 155, T: 0.25, rf: 4.25, vol: 30, type: "call" });
  const u = (k) => (v) => setD(p => ({ ...p, [k]: v }));
  const normCDF = (x) => { const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=.3275911; const s=x<0?-1:1; const ax=Math.abs(x)/Math.sqrt(2); const t=1/(1+p*ax); return .5*(1+s*(1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-ax*ax))); };
  const nP = (x) => Math.exp(-x*x/2)/Math.sqrt(2*Math.PI);
  const r=d.rf/100,sig=d.vol/100; const d1=d.T>0?(Math.log(d.S/d.K)+(r+sig*sig/2)*d.T)/(sig*Math.sqrt(d.T)):0; const d2=d1-sig*Math.sqrt(d.T);
  const call=d.S*normCDF(d1)-d.K*Math.exp(-r*d.T)*normCDF(d2); const put=d.K*Math.exp(-r*d.T)*normCDF(-d2)-d.S*normCDF(-d1);
  const price=d.type==="call"?call:put; const delta=d.type==="call"?normCDF(d1):normCDF(d1)-1;
  const gamma=d.T>0?nP(d1)/(d.S*sig*Math.sqrt(d.T)):0;
  const theta=d.T>0?(-(d.S*nP(d1)*sig)/(2*Math.sqrt(d.T))-(d.type==="call"?1:-1)*r*d.K*Math.exp(-r*d.T)*(d.type==="call"?normCDF(d2):normCDF(-d2)))/365:0;
  const vega=d.T>0?d.S*nP(d1)*Math.sqrt(d.T)/100:0;
  const intrinsic=d.type==="call"?Math.max(d.S-d.K,0):Math.max(d.K-d.S,0);
  const moneyness=d.type==="call"?(d.S>d.K?"ITM":d.S<d.K?"OTM":"ATM"):(d.S<d.K?"ITM":d.S>d.K?"OTM":"ATM");
  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Investing" sub={jf ? "Understand your options position in plain English" : "Black-Scholes pricing and Greeks"}>Options & Greeks</Title>
      <AdviceNote kind="trading" />
      <div className="flex gap-2 mb-4"><Btn onClick={() => u("type")("call")} v={d.type==="call"?"primary":"secondary"}>{jf ? "Right to Buy (Call)" : "Call"}</Btn><Btn onClick={() => u("type")("put")} v={d.type==="put"?"primary":"secondary"}>{jf ? "Right to Sell (Put)" : "Put"}</Btn></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div><F label={jf ? "Stock Price Now" : "Stock Price"} value={d.S} onChange={u("S")} prefix="$" /><F label={jf ? "Your Target Price" : "Strike Price"} value={d.K} onChange={u("K")} prefix="$" /></div>
        <div><F label={jf ? "Time Left (in years)" : "Time to Expiry"} value={d.T} onChange={u("T")} /><F label={jf ? "Expected Swings" : "Implied Volatility"} value={d.vol} onChange={u("vol")} suffix="%" /></div>
        <div><F label={jf ? "Safe Rate" : "Risk-Free Rate"} value={d.rf} onChange={u("rf")} suffix="%" /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Option Worth" : "Price"}</div><div className="text-xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">{$(price)}</div><div className="text-xs text-slate-400 dark:text-[#828b9a]">{moneyness}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Real Value Now" : "Intrinsic"}</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(intrinsic)}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Time Premium" : "Time Value"}</div><div className="text-lg font-bold text-amber-600 dark:text-amber-200 mt-1">{$(price-intrinsic)}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Need Stock At" : "Break-Even"}</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{$(d.type==="call"?d.K+price:d.K-price)}</div></Card>
      </div>
      <Card><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">{jf ? "How This Option Behaves" : "The Greeks"}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[{ n: jf ? "Price Sensitivity" : "Delta", v: delta.toFixed(3), s: `${(Math.abs(delta)*100).toFixed(0)}% ${jf ? "chance of profit" : "prob ITM"}`, info: jf ? "How much the option moves when the stock moves $1." : "Price change per $1 stock move." },
            { n: jf ? "Acceleration" : "Gamma", v: gamma.toFixed(4), s: jf ? "How fast delta changes" : "Rate of delta change" },
            { n: jf ? "Daily Cost" : "Theta", v: theta.toFixed(4), s: `${$(theta*100)}/day`, info: jf ? "How much value you lose every day." : "Daily time decay." },
            { n: jf ? "Volatility Impact" : "Vega", v: vega.toFixed(4), s: "Per 1% vol change" },
          ].map((g, i) => <div key={i} className="text-center p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg"><div className="text-xs text-slate-500 dark:text-[#a3acba] font-semibold">{g.n}{g.info && <Tip text={g.info} />}</div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{g.v}</div><div className="text-xs text-slate-400 dark:text-[#828b9a]">{g.s}</div></div>)}
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// CASH FLOW FORECASTER
// ============================================================
function CashFlow({ jargonFree: jf }) {
  const [income, setIncome] = useState(6500);
  const [startBalance, setStartBalance] = useState(3000);
  const [expenses, setExpenses] = useState([
    { name: "Rent/Mortgage", amount: 2000, freq: "monthly" },
    { name: "Groceries", amount: 600, freq: "monthly" },
    { name: "Car Payment", amount: 450, freq: "monthly" },
    { name: "Insurance", amount: 150, freq: "monthly" },
    { name: "Subscriptions", amount: 80, freq: "monthly" },
    { name: "Utilities", amount: 200, freq: "monthly" },
  ]);
  const [oneTime, setOneTime] = useState([
    { name: "Car Repair", amount: 800, month: 2 },
    { name: "Vacation", amount: 2000, month: 4 },
  ]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const addExp = () => setExpenses([...expenses, { name: "New Expense", amount: 0, freq: "monthly" }]);
  const removeExp = (i) => setExpenses(expenses.filter((_, idx) => idx !== i));
  const updateExp = (i, k, v) => { const u = [...expenses]; u[i][k] = v; setExpenses(u); };
  const addOT = () => setOneTime([...oneTime, { name: "New Expense", amount: 0, month: 1 }]);
  const removeOT = (i) => setOneTime(oneTime.filter((_, idx) => idx !== i));
  const updateOT = (i, k, v) => { const u = [...oneTime]; u[i][k] = v; setOneTime(u); };

  const months = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"];
  const forecast = useMemo(() => {
    let balance = startBalance;
    const monthlyExp = expenses.reduce((s, e) => {
      if (e.freq === "monthly") return s + e.amount;
      if (e.freq === "weekly") return s + e.amount * 4.33;
      if (e.freq === "yearly") return s + e.amount / 12;
      return s;
    }, 0);
    const data = [];
    let lowest = { bal: Infinity, month: 0 };
    for (let m = 1; m <= 6; m++) {
      const otCosts = oneTime.filter(o => o.month === m).reduce((s, o) => s + o.amount, 0);
      balance = balance + income - monthlyExp - otCosts;
      data.push({ month: m, balance, monthlyExp, otCosts, income });
      if (balance < lowest.bal) lowest = { bal: balance, month: m };
    }
    return { data, lowest, monthlyExp };
  }, [income, startBalance, expenses, oneTime]);

  const maxBal = Math.max(...forecast.data.map(d => Math.abs(d.balance)), 1);
  const finalBal = forecast.data[5].balance;
  const goesNeg = forecast.data.some(d => d.balance < 0);
  const grade = finalBal > income * 2 ? "A" : finalBal > income ? "B" : finalBal > 0 ? "C" : "F";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Money" sub={jf ? "Will you have enough money each month? Let's find out." : "Project your cash balance over the next 6 months"}>Cash Flow Forecast</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">{jf ? "Money Coming In" : "Income"}</h3>
          <F label={jf ? "Monthly Take-Home Pay" : "Net Monthly Income"} value={income} onChange={setIncome} prefix="$" info="Your paycheck after taxes." />
          <F label="Starting Balance" value={startBalance} onChange={setStartBalance} prefix="$" info="How much is in your account right now." />
          <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-3 mt-4">{jf ? "Regular Bills" : "Recurring Expenses"}</h3>
          {expenses.map((e, i) => (
            <div key={i} className="flex gap-2 mb-1.5 items-end">
              <div className="flex-1"><input type="text" value={e.name} onChange={ev => updateExp(i, "name", ev.target.value)} className="bg-white dark:bg-[#1c1f26] w-full px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none" /></div>
              <div className="w-20"><input type="number" value={e.amount} onChange={ev => updateExp(i, "amount", Number(ev.target.value) || 0)} className="bg-white dark:bg-[#1c1f26] w-full px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none text-right" /></div>
              <select value={e.freq} onChange={ev => updateExp(i, "freq", ev.target.value)} className="bg-white dark:bg-[#1c1f26] px-1 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg">
                <option value="monthly">Monthly</option><option value="weekly">Weekly</option><option value="yearly">Yearly</option>
              </select>
              <button onClick={() => removeExp(i)} className="text-red-400 text-xs hover:text-red-600 pb-1">x</button>
            </div>
          ))}
          <Btn onClick={addExp} v="secondary" className="mt-1">+ Add Bill</Btn>
        </Card>
        <Card>
          <h3 className="text-xs font-bold text-slate-400 dark:text-[#828b9a] uppercase mb-2">{jf ? "One-Time Costs" : "Expected One-Time Expenses"}</h3>
          <p className="text-xs text-slate-400 dark:text-[#828b9a] mb-3">Big purchases or bills coming up in the next 6 months.</p>
          {oneTime.map((o, i) => (
            <div key={i} className="flex gap-2 mb-1.5 items-end">
              <div className="flex-1"><input type="text" value={o.name} onChange={ev => updateOT(i, "name", ev.target.value)} className="bg-white dark:bg-[#1c1f26] w-full px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none" /></div>
              <div className="w-20"><input type="number" value={o.amount} onChange={ev => updateOT(i, "amount", Number(ev.target.value) || 0)} className="bg-white dark:bg-[#1c1f26] w-full px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none text-right" /></div>
              <select value={o.month} onChange={ev => updateOT(i, "month", Number(ev.target.value))} className="bg-white dark:bg-[#1c1f26] px-1 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg">
                {[1,2,3,4,5,6].map(m => <option key={m} value={m}>Month {m}</option>)}
              </select>
              <button onClick={() => removeOT(i)} className="text-red-400 text-xs hover:text-red-600 pb-1">x</button>
            </div>
          ))}
          <Btn onClick={addOT} v="secondary" className="mt-1">+ Add</Btn>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-[#15171c] rounded-lg text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Monthly Bills" : "Recurring/mo"}</div><div className="text-lg font-bold text-red-500">{$(forecast.monthlyExp)}</div></div>
            <div className="p-3 bg-slate-50 dark:bg-[#15171c] rounded-lg text-center"><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Left Over" : "Net/mo"}</div><div className={`text-lg font-bold ${income - forecast.monthlyExp > 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(income - forecast.monthlyExp)}</div></div>
          </div>
        </Card>
      </div>
      {/* Forecast Chart */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6] mb-3">{jf ? "Your Money Over 6 Months" : "6-Month Cash Projection"}</h3>
        <div className="flex items-end gap-2 h-40 px-4">
          {forecast.data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative">
              <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">{months[i]}: {$(d.balance)}{d.otCosts > 0 ? ` (includes ${$(d.otCosts)} one-time)` : ""}</div>
              <div className={`w-full rounded-t transition-all ${d.balance >= 0 ? "bg-emerald-400" : "bg-red-400"}`} style={{ height: `${Math.max((Math.abs(d.balance) / maxBal) * 100, 4)}%` }} />
              <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{months[i].replace("Month ", "M")}</div>
              <div className={`text-xs font-bold ${d.balance >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{$(d.balance)}</div>
            </div>
          ))}
        </div>
      </Card>
      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card className={finalBal >= 0 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"}>
          <div className="text-xs text-slate-500 dark:text-[#a3acba]">{jf ? "After 6 Months You'll Have" : "Projected Balance (Month 6)"}</div>
          <div className={`text-2xl font-bold mt-1 ${finalBal >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>{$(finalBal)}</div>
        </Card>
        <Card className={goesNeg ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30" : "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30"}>
          <div className="text-xs text-slate-500 dark:text-[#a3acba]">{jf ? "Tightest Month" : "Lowest Balance"}</div>
          <div className={`text-lg font-bold mt-1 ${forecast.lowest.bal < 0 ? "text-red-600 dark:text-red-300" : "text-emerald-700 dark:text-emerald-300"}`}>{months[forecast.lowest.month - 1]}: {$(forecast.lowest.bal)}</div>
          {goesNeg && <div className="text-xs text-red-600 dark:text-red-300 mt-1 font-medium">{jf ? `You may run short. Consider cutting ${$(Math.abs(forecast.lowest.bal))} or building a buffer.` : `Negative balance projected. Gap: ${$(Math.abs(forecast.lowest.bal))}.`}</div>}
        </Card>
      </div>
      <RunAnalysisBtn onClick={() => setShowAnalysis(!showAnalysis)} />
      {showAnalysis && <AnalysisReport
        grade={grade} gradeColor={grade === "A" || grade === "B" ? "green" : grade === "C" ? "amber" : "red"}
        findings={[
          { good: income > forecast.monthlyExp, text: `Monthly surplus: ${$(income - forecast.monthlyExp)} ${income > forecast.monthlyExp ? "(positive)" : "(spending more than earning)"}` },
          { good: !goesNeg, text: goesNeg ? "Balance goes negative — you'll run short" : "Balance stays positive all 6 months" },
          { good: finalBal > income, text: `End balance ${$(finalBal)} ${finalBal > income ? "exceeds a month's income (good buffer)" : "is less than a month's income"}` },
          ...(oneTime.length > 0 ? [{ good: true, text: `${oneTime.length} one-time expense(s) totaling ${$(oneTime.reduce((s, o) => s + o.amount, 0))} factored in` }] : []),
        ]}
        topPriority={goesNeg ? `Build a ${$(Math.abs(forecast.lowest.bal))} buffer before ${months[forecast.lowest.month - 1]}` : income - forecast.monthlyExp < 500 ? "Increase your monthly margin — it's very tight" : "You're in good shape — consider saving the surplus"}
        priorityLevel={goesNeg ? "bad" : income - forecast.monthlyExp < 500 ? "okay" : "good"}
      />}
      <ActionBtn actions={[
        ...(goesNeg ? [{ title: "Build a cash buffer", detail: `You need at least ${$(Math.abs(forecast.lowest.bal))} extra before ${months[forecast.lowest.month - 1]}.` }] : []),
        ...(income - forecast.monthlyExp < 500 ? [{ title: "Cut discretionary spending", detail: "Your margin is thin. Look for subscriptions or expenses to reduce." }] : []),
        ...(finalBal > income * 2 ? [{ title: "Invest the excess", detail: `You'll have ${$(finalBal)} — consider investing what you don't need for expenses.` }] : []),
        ...(!goesNeg && income - forecast.monthlyExp >= 500 ? [{ title: "Automate your savings", detail: "Set up automatic transfers to savings on payday." }] : []),
      ]} />
      <Assumptions items={[
        { formula: "Forecast balance_m = balance_{m-1} + income - expenses ± one-offs", what: "We project your bank balance month by month, applying recurring income and expenses each month plus any one-time events you enter for specific months.", assumptions: ["Income and expenses are constant across months (no seasonal variation modeled — bonuses, tax refunds, holiday spending should be entered as one-offs)", "No interest earned on savings balance", "Inflation is not applied to expenses or income"], source: "Standard envelope-budgeting cash-flow projection." },
        { formula: "Risk flag: any month where balance < 0", what: "We highlight the worst month and the amount needed as a buffer.", assumptions: ["Assumes no overdraft protection or emergency credit — real life often has both"] },
      ]} />
    </div>
  );
}

// ============================================================
// GOAL TRACKER
// ============================================================
function GoalTracker({ jargonFree: jf, onGoalAdded, onGoalReached }) {
  const [goals, setGoals] = useState([
    { name: "Emergency Fund", target: 15000, saved: 8000, monthly: 500, deadline: 18 },
    { name: "Vacation", target: 5000, saved: 1200, monthly: 300, deadline: 12 },
    { name: "Down Payment", target: 60000, saved: 22000, monthly: 1500, deadline: 36 },
  ]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const addGoal = () => { setGoals([...goals, { name: "New Goal", target: 10000, saved: 0, monthly: 200, deadline: 12 }]); if (onGoalAdded) onGoalAdded(); };
  const removeGoal = (i) => setGoals(goals.filter((_, idx) => idx !== i));
  const updateGoal = (i, k, v) => {
    const u = goals.map((g, idx) => idx === i ? { ...g, [k]: v } : g);
    const prevPct = goals[i].target > 0 ? goals[i].saved / goals[i].target : 0;
    const newPct = u[i].target > 0 ? u[i].saved / u[i].target : 0;
    setGoals(u);
    // Only celebrate when progress actually rises across 100% by adding savings — not by lowering the target.
    if (k === "saved" && prevPct < 1 && newPct >= 1 && onGoalReached) onGoalReached();
  };

  const analyzed = goals.map(g => {
    const remaining = Math.max(g.target - g.saved, 0);
    const pct = g.target > 0 ? Math.min((g.saved / g.target) * 100, 100) : 0;
    const monthsToGoal = g.monthly > 0 ? Math.ceil(remaining / g.monthly) : Infinity;
    const onTrack = monthsToGoal <= g.deadline;
    const requiredMonthly = g.deadline > 0 ? Math.ceil(remaining / g.deadline) : remaining;
    return { ...g, remaining, pct, monthsToGoal, onTrack, requiredMonthly };
  });

  const onTrackCount = analyzed.filter(g => g.onTrack).length;
  const offTrackCount = analyzed.filter(g => !g.onTrack).length;
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalMonthly = goals.reduce((s, g) => s + g.monthly, 0);
  const totalPct = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
  const grade = offTrackCount === 0 && goals.length > 0 ? "A" : offTrackCount <= 1 ? "B" : offTrackCount <= 2 ? "C" : "D";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="My Money" sub={jf ? "Track what you're saving for and see if you'll get there" : "Set savings goals, track progress, and stay on schedule"}>My Goals</Title>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card accent="neutral"><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">Total Goals</div><div className="text-3xl font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{goals.length}</div><div className="h-0.5 w-12 mt-1 rounded-full bg-sky-400" /></Card>
        <Card accent="good"><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "On Track" : "On Schedule"}</div><div className="text-3xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">{onTrackCount}</div><div className="h-0.5 w-12 mt-1 rounded-full bg-emerald-400" /></Card>
        <Card accent={offTrackCount > 0 ? "bad" : "good"}><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "Falling Behind" : "Off Track"}</div><div className={`text-3xl font-bold mt-1 ${offTrackCount > 0 ? "text-red-500" : "text-emerald-600 dark:text-emerald-300"}`}>{offTrackCount}</div><div className={`h-0.5 w-12 mt-1 rounded-full ${offTrackCount > 0 ? "bg-red-400" : "bg-emerald-400"}`} /></Card>
        <Card accent="neutral"><div className="text-xs text-slate-400 dark:text-[#828b9a] font-semibold">{jf ? "Saving/Month" : "Monthly Total"}</div><div className="text-3xl font-bold text-indigo-600 dark:text-indigo-300 mt-1">{$(totalMonthly)}</div><div className="h-0.5 w-12 mt-1 rounded-full bg-indigo-400" /></Card>
      </div>
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{jf ? "Overall Progress" : "Total Progress"}</h3>
          <span className="text-xs text-slate-400 dark:text-[#828b9a]">{$(totalSaved)} of {$(totalTarget)}</span>
        </div>
        <div className="w-full h-4 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${totalPct}%` }} /></div>
        <div className="text-xs text-slate-400 dark:text-[#828b9a] mt-1">{totalPct.toFixed(0)}% complete</div>
      </Card>
      {analyzed.map((g, i) => (
        <Card key={i} className="mb-3">
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <input type="text" value={g.name} onChange={e => updateGoal(i, "name", e.target.value)} className="text-sm font-bold text-slate-800 dark:text-[#eef1f6] border-b border-transparent hover:border-slate-200 outline-none bg-transparent" />
                <Badge color={g.onTrack ? "green" : "red"}>{g.onTrack ? (jf ? "On Track" : "On Schedule") : (jf ? "Behind" : "Off Track")}</Badge>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full transition-all ${g.onTrack ? "bg-emerald-500" : "bg-red-400"}`} style={{ width: `${g.pct}%` }} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div><span className="text-slate-400 dark:text-[#828b9a]">{jf ? "Goal" : "Target"}</span><div className="font-bold">{$(g.target)}</div></div>
                <div><span className="text-slate-400 dark:text-[#828b9a]">Saved</span><div className="font-bold text-emerald-600 dark:text-emerald-300">{$(g.saved)}</div></div>
                <div><span className="text-slate-400 dark:text-[#828b9a]">{jf ? "Left" : "Remaining"}</span><div className="font-bold">{$(g.remaining)}</div></div>
                <div><span className="text-slate-400 dark:text-[#828b9a]">{jf ? "Months to Go" : "ETA"}</span><div className={`font-bold ${g.onTrack ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{g.monthsToGoal === Infinity ? "Never" : g.monthsToGoal + " mo"}</div></div>
              </div>
              {!g.onTrack && <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-xs text-amber-700 dark:text-amber-200">{jf ? `To hit your deadline, save ${$(g.requiredMonthly)}/mo instead of ${$(g.monthly)}/mo.` : `Required: ${$(g.requiredMonthly)}/mo to meet ${g.deadline}-month deadline.`}</div>}
            </div>
            <div className="flex flex-col gap-1">
              <F label={jf ? "Saved So Far" : "Current"} value={g.saved} onChange={v => updateGoal(i, "saved", v)} prefix="$" small />
              <F label={jf ? "Per Month" : "Monthly"} value={g.monthly} onChange={v => updateGoal(i, "monthly", v)} prefix="$" small />
              <F label="Target" value={g.target} onChange={v => updateGoal(i, "target", v)} prefix="$" small />
              <F label={jf ? "Deadline (months)" : "Deadline (mo)"} value={g.deadline} onChange={v => updateGoal(i, "deadline", v)} small />
              <button onClick={() => removeGoal(i)} className="text-red-400 text-xs hover:text-red-600 text-right">Remove</button>
            </div>
          </div>
        </Card>
      ))}
      <Btn onClick={addGoal} v="success" className="mb-4">+ Add Goal</Btn>
      <RunAnalysisBtn onClick={() => setShowAnalysis(!showAnalysis)} />
      {showAnalysis && <AnalysisReport
        grade={grade} gradeColor={grade === "A" || grade === "B" ? "green" : grade === "C" ? "amber" : "red"}
        findings={[
          { good: onTrackCount === goals.length, text: `${onTrackCount} of ${goals.length} goals on track` },
          { good: totalPct > 50, text: `Overall progress: ${totalPct.toFixed(0)}% of total target` },
          { good: totalMonthly > 0, text: `Saving ${$(totalMonthly)}/month across all goals` },
          ...(offTrackCount > 0 ? [{ good: false, text: `${offTrackCount} goal(s) need higher monthly contributions` }] : []),
        ]}
        topPriority={offTrackCount > 0 ? `Increase savings on "${analyzed.find(g => !g.onTrack)?.name}" to ${$(analyzed.find(g => !g.onTrack)?.requiredMonthly || 0)}/mo` : "All goals on track — great discipline!"}
        priorityLevel={offTrackCount === 0 ? "good" : offTrackCount <= 1 ? "okay" : "bad"}
      />}
      <ActionBtn actions={[
        ...(offTrackCount > 0 ? [{ title: `${offTrackCount} goal(s) need attention`, detail: "Increase monthly contributions or extend deadlines." }] : []),
        ...(totalMonthly > 0 ? [{ title: "Automate contributions", detail: "Set up automatic transfers on payday to each goal." }] : []),
        ...(onTrackCount === goals.length && goals.length > 0 ? [{ title: "You're doing great — consider adding a stretch goal", detail: "All current goals are on track. Time to aim higher!" }] : []),
      ]} />
    </div>
  );
}

// ============================================================
// RISK PROFILE
// ============================================================
function RiskProfile({ jargonFree: jf, profile, onSave }) {
  const [answers, setAnswers] = useState(profile || { age: "30s", goal: "growth", horizon: "long", dropReaction: "buy", incomeStability: "stable", experience: "intermediate", lossComfort: 20 });
  const uA = (k, v) => setAnswers(p => ({ ...p, [k]: v }));

  // Calculate risk score (0-100, higher = more aggressive)
  const score = useMemo(() => {
    let s = 0;
    // Age
    if (answers.age === "20s") s += 18; else if (answers.age === "30s") s += 15; else if (answers.age === "40s") s += 12; else if (answers.age === "50s") s += 7; else s += 3;
    // Goal
    if (answers.goal === "aggressive") s += 18; else if (answers.goal === "growth") s += 14; else if (answers.goal === "balanced") s += 10; else if (answers.goal === "income") s += 6; else s += 3;
    // Horizon
    if (answers.horizon === "long") s += 16; else if (answers.horizon === "medium") s += 10; else s += 4;
    // Drop reaction
    if (answers.dropReaction === "buy") s += 18; else if (answers.dropReaction === "hold") s += 12; else if (answers.dropReaction === "worry") s += 6; else s += 2;
    // Income stability
    if (answers.incomeStability === "very") s += 10; else if (answers.incomeStability === "stable") s += 8; else if (answers.incomeStability === "variable") s += 5; else s += 2;
    // Experience
    if (answers.experience === "expert") s += 12; else if (answers.experience === "intermediate") s += 8; else if (answers.experience === "beginner") s += 4; else s += 1;
    // Loss comfort
    s += Math.min(answers.lossComfort / 5, 8);
    return Math.min(Math.round(s), 100);
  }, [answers]);

  const riskLabel = score >= 75 ? "Aggressive" : score >= 55 ? "Growth" : score >= 35 ? "Balanced" : score >= 20 ? "Conservative" : "Very Conservative";
  const riskColor = score >= 75 ? "red" : score >= 55 ? "indigo" : score >= 35 ? "yellow" : "green";

  // Recommended allocation
  const alloc = score >= 75 ? { stocks: 85, bonds: 5, alt: 5, cash: 5 } : score >= 55 ? { stocks: 70, bonds: 15, alt: 10, cash: 5 } : score >= 35 ? { stocks: 50, bonds: 30, alt: 10, cash: 10 } : score >= 20 ? { stocks: 30, bonds: 45, alt: 10, cash: 15 } : { stocks: 15, bonds: 50, alt: 10, cash: 25 };

  const questions = [
    { key: "age", label: jf ? "How old are you?" : "Age Range", options: [{ value: "20s", label: "20s" }, { value: "30s", label: "30s" }, { value: "40s", label: "40s" }, { value: "50s", label: "50s" }, { value: "60+", label: "60+" }] },
    { key: "goal", label: jf ? "What's your main money goal?" : "Primary Objective", options: [{ value: "preservation", label: jf ? "Protect what I have" : "Capital Preservation" }, { value: "income", label: jf ? "Steady income stream" : "Income Generation" }, { value: "balanced", label: jf ? "Mix of growth and safety" : "Balanced Growth" }, { value: "growth", label: jf ? "Grow my money long-term" : "Capital Growth" }, { value: "aggressive", label: jf ? "Maximum returns, I can handle the swings" : "Aggressive Growth" }] },
    { key: "horizon", label: jf ? "When do you need this money?" : "Investment Horizon", options: [{ value: "short", label: jf ? "Within 1-3 years" : "Short (1-3 yrs)" }, { value: "medium", label: jf ? "3-10 years" : "Medium (3-10 yrs)" }, { value: "long", label: jf ? "10+ years, no rush" : "Long (10+ yrs)" }] },
    { key: "dropReaction", label: jf ? "The market drops 30% tomorrow. You..." : "Reaction to 30% Market Drop", options: [{ value: "sell", label: jf ? "Panic and sell everything" : "Sell to prevent further losses" }, { value: "worry", label: jf ? "Lose sleep but hold on" : "Hold but feel anxious" }, { value: "hold", label: jf ? "Not worried, this is normal" : "Hold, it'll recover" }, { value: "buy", label: jf ? "Buy more — everything's on sale" : "Buy the dip" }] },
    { key: "incomeStability", label: jf ? "How steady is your paycheck?" : "Income Stability", options: [{ value: "unstable", label: jf ? "Freelance/gig, it varies a lot" : "Highly Variable" }, { value: "variable", label: jf ? "Some months are better than others" : "Somewhat Variable" }, { value: "stable", label: jf ? "Regular salary" : "Stable" }, { value: "very", label: jf ? "Very secure + side income" : "Very Stable + Multiple Sources" }] },
    { key: "experience", label: jf ? "How much investing have you done?" : "Investment Experience", options: [{ value: "none", label: jf ? "Never invested" : "None" }, { value: "beginner", label: jf ? "Just started learning" : "Beginner (< 2 yrs)" }, { value: "intermediate", label: jf ? "A few years under my belt" : "Intermediate (2-10 yrs)" }, { value: "expert", label: jf ? "Very experienced" : "Expert (10+ yrs)" }] },
  ];

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="About Me" sub={jf ? "Tell Vantage about yourself so every recommendation fits your life" : "Your answers shape all action plans and recommendations across every module"}>Risk Profile</Title>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          {questions.map(q => (
            <div key={q.key} className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-[#dde3ec] mb-2">{q.label}</label>
              <div className="flex flex-wrap gap-2">
                {q.options.map(o => (
                  <button key={o.value} onClick={() => uA(q.key, o.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${answers[q.key] === o.value ? "bg-indigo-600 text-white shadow-md" : "bg-white dark:bg-[#1c1f26] text-slate-600 dark:text-[#c4ccd8] border border-slate-200 dark:border-[#323844] hover:border-indigo-300"}`}>{o.label}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-[#dde3ec] mb-2">{jf ? "How much can you stomach losing in a year?" : "Maximum Acceptable Annual Loss"}</label>
            <div className="flex items-center gap-3">
              <input type="range" min="5" max="50" value={answers.lossComfort} onChange={e => uA("lossComfort", Number(e.target.value))} className="flex-1 h-2 bg-slate-200 dark:bg-[#2c313b] rounded-lg appearance-none cursor-pointer" />
              <span className={`text-lg font-bold ${answers.lossComfort > 30 ? "text-red-500" : answers.lossComfort > 15 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-300"}`}>-{answers.lossComfort}%</span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 dark:text-[#828b9a] mt-1"><span>Conservative (-5%)</span><span>Aggressive (-50%)</span></div>
          </div>
          <Btn onClick={() => onSave(answers)} v="accent" className="w-full py-3 text-base">Save My Profile</Btn>
        </div>

        <div>
          {/* Score Display */}
          <Card className="mb-4 text-center">
            <Ring score={score} max={100} size={110} color={riskColor} />
            <h3 className="text-xl font-bold text-slate-800 dark:text-[#eef1f6] mt-2">{riskLabel}</h3>
            <p className="text-sm text-slate-500 dark:text-[#a3acba] mt-1">{
              score >= 75 ? (jf ? "You can handle big swings for big potential gains." : "High risk tolerance. Comfortable with significant volatility for higher returns.") :
              score >= 55 ? (jf ? "You want growth but can ride out some storms." : "Above-average risk tolerance. Growth-oriented with moderate downside acceptance.") :
              score >= 35 ? (jf ? "You want a mix of safety and growth." : "Moderate risk tolerance. Balanced approach to risk and reward.") :
              (jf ? "You prefer keeping your money safe above all else." : "Low risk tolerance. Prioritizes capital preservation over growth.")
            }</p>
          </Card>

          {/* Recommended Allocation */}
          <Card className="mb-4">
            <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">{jf ? "How You Should Split Your Money" : "Recommended Allocation"}</h3>
            <div className="flex h-8 rounded-full overflow-hidden mb-3">
              <div className="bg-blue-500 transition-all flex items-center justify-center text-white text-xs font-bold" style={{ width: `${alloc.stocks}%` }}>{alloc.stocks}%</div>
              <div className="bg-emerald-500 transition-all flex items-center justify-center text-white text-xs font-bold" style={{ width: `${alloc.bonds}%` }}>{alloc.bonds > 10 ? alloc.bonds + "%" : ""}</div>
              <div className="bg-amber-500 transition-all flex items-center justify-center text-white text-xs font-bold" style={{ width: `${alloc.alt}%` }}>{alloc.alt > 8 ? alloc.alt + "%" : ""}</div>
              <div className="bg-slate-400 transition-all flex items-center justify-center text-white text-xs font-bold" style={{ width: `${alloc.cash}%` }}>{alloc.cash > 8 ? alloc.cash + "%" : ""}</div>
            </div>
            {[{ l: "Stocks & ETFs", v: alloc.stocks, c: "bg-blue-500" }, { l: "Bonds & Fixed Income", v: alloc.bonds, c: "bg-emerald-500" }, { l: jf ? "Gold, Real Estate, Crypto" : "Alternatives", v: alloc.alt, c: "bg-amber-500" }, { l: "Cash & Savings", v: alloc.cash, c: "bg-slate-400" }].map((a, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <div className={`w-3 h-3 rounded ${a.c}`} />
                <span className="text-xs text-slate-600 dark:text-[#c4ccd8] flex-1">{a.l}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-[#dde3ec]">{a.v}%</span>
              </div>
            ))}
          </Card>

          <Card className="bg-slate-50 dark:bg-[#15171c]">
            <h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-2">{jf ? "What This Means For You" : "Profile Impact"}</h3>
            <div className="text-xs text-slate-600 dark:text-[#c4ccd8] space-y-1.5">
              <p>All "What Should I Do?" action plans across every module will adapt to your <strong>{riskLabel}</strong> profile.</p>
              <p>You'll see <strong>{score >= 55 ? "growth-oriented" : "safety-first"}</strong> recommendations — and you can always toggle between Conservative, Balanced, and Aggressive perspectives on any action plan.</p>
              <p className="text-slate-400 dark:text-[#828b9a] mt-2">Update your profile anytime as your life changes.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MARKET CONDITIONS DASHBOARD
// ============================================================
function MarketDashboard({ jargonFree: jf }) {
  const [mkt, setMkt] = useState({
    fedRate: 5.25, sp500: 5200, sp500Change: 1.2, nasdaq: 16400, nasdaqChange: 0.8,
    dow: 39000, dowChange: 0.5, treasury10y: 4.35, treasury2y: 4.85, vix: 16,
    cpi: 3.2, unemployment: 3.8, gdpGrowth: 2.5, dollarIdx: 104.5, oil: 78, gold: 2350, btc: 65000,
  });
  const uM = (k) => (v) => setMkt(p => ({ ...p, [k]: v }));

  const [sectors, setSectors] = useState([
    { name: "Technology", change: 2.3, weight: 30 },
    { name: "Healthcare", change: 0.8, weight: 13 },
    { name: "Financials", change: 1.5, weight: 13 },
    { name: "Consumer Disc.", change: -0.3, weight: 11 },
    { name: "Industrials", change: 1.1, weight: 9 },
    { name: "Energy", change: -1.8, weight: 4 },
    { name: "Real Estate", change: -0.5, weight: 3 },
    { name: "Utilities", change: 0.4, weight: 3 },
  ]);

  const [headlines, setHeadlines] = useState([
    { text: "Fed holds rates steady, signals potential cuts later this year", impact: "bullish", category: "Fed" },
    { text: "Tech earnings exceed expectations across the board", impact: "bullish", category: "Earnings" },
    { text: "Inflation ticks up slightly, above expectations", impact: "bearish", category: "Economy" },
    { text: "Strong jobs report, unemployment remains low", impact: "neutral", category: "Economy" },
  ]);

  // Yield curve
  const yieldCurve = mkt.treasury10y - mkt.treasury2y;
  const isInverted = yieldCurve < 0;

  // Market condition assessment
  const conditions = useMemo(() => {
    let score = 50; // neutral starting point
    if (mkt.sp500Change > 0) score += 5; else score -= 5;
    if (mkt.vix < 15) score += 10; else if (mkt.vix > 25) score -= 15; else if (mkt.vix > 20) score -= 5;
    if (mkt.fedRate > 5) score -= 5; else if (mkt.fedRate < 3) score += 5;
    if (mkt.cpi < 2.5) score += 5; else if (mkt.cpi > 4) score -= 10;
    if (mkt.unemployment < 4) score += 5; else if (mkt.unemployment > 6) score -= 10;
    if (mkt.gdpGrowth > 2) score += 5; else if (mkt.gdpGrowth < 0) score -= 15;
    if (isInverted) score -= 10;
    score = Math.max(0, Math.min(100, score));
    return {
      score,
      label: score >= 70 ? "Favorable" : score >= 45 ? "Mixed" : "Challenging",
      color: score >= 70 ? "green" : score >= 45 ? "yellow" : "red",
    };
  }, [mkt, isInverted]);

  // What it means
  const insights = [];
  if (mkt.vix > 25) insights.push({ icon: "!", text: jf ? "Markets are fearful (VIX high). Prices swing wildly. Be cautious with new positions." : "Elevated VIX signals high volatility. Consider hedging or reducing exposure." });
  else if (mkt.vix < 15) insights.push({ icon: "C", text: jf ? "Markets are calm. Good time to make moves, but don't get complacent." : "Low VIX indicates complacency. Historically precedes corrections — maintain discipline." });
  if (isInverted) insights.push({ icon: "!", text: jf ? "Yield curve is inverted — it has preceded most US recessions over the past ~50 years (one false alarm in 1966), usually 6-24 months ahead. An early warning, not an immediate trigger." : "Inverted yield curve (-" + Math.abs(yieldCurve).toFixed(2) + "%). Historically reliable recession lead indicator (~6-24mo; one false signal in 1966)." });
  if (mkt.fedRate > 5) insights.push({ icon: "R", text: jf ? "Interest rates are high. Bonds and savings accounts pay well. Borrowing is expensive." : "Restrictive monetary policy. Favors fixed income and cash. Headwind for growth stocks." });
  if (mkt.cpi > 3.5) insights.push({ icon: "I", text: jf ? "Inflation is above target. Your cash is losing purchasing power. Consider inflation hedges like gold or TIPS." : "Above-target inflation erodes real returns. Consider TIPS, commodities, or real assets." });
  if (mkt.gdpGrowth > 2 && mkt.unemployment < 4.5) insights.push({ icon: "E", text: jf ? "Economy is strong. Good for stocks and business, but may keep rates high." : "Strong economic fundamentals support risk assets but may delay rate cuts." });

  const favors = conditions.score >= 60
    ? (jf ? "Stocks, growth investments, real estate" : "Equities, growth, cyclicals, real estate")
    : conditions.score >= 40
    ? (jf ? "Mix of stocks and bonds, quality over speculation" : "Balanced allocation, quality names, dividend payers")
    : (jf ? "Bonds, cash, gold, defensive stocks" : "Fixed income, cash, gold, defensive sectors, utilities");

  const addHeadline = () => setHeadlines([...headlines, { text: "", impact: "neutral", category: "Other" }]);
  const updateHL = (i, k, v) => { const u = [...headlines]; u[i][k] = v; setHeadlines(u); };
  const removeHL = (i) => setHeadlines(headlines.filter((_, idx) => idx !== i));

  const updateSector = (i, k, v) => { const u = [...sectors]; u[i][k] = v; setSectors(u); };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Market Intel" sub={jf ? "A snapshot of the financial world right now — and what it means for you" : "Key market indicators, sector performance, yield curve, and financial weather report"}>Market Conditions</Title>

      {/* Overall Condition */}
      <Card className={`mb-4 text-center ${conditions.color === "green" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : conditions.color === "red" ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30" : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30"}`}>
        <div className="flex items-center justify-center gap-4">
          <Ring score={conditions.score} max={100} size={80} color={conditions.color} />
          <div className="text-left">
            <h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">{jf ? "Financial Weather" : "Market Conditions"}: <span className={conditions.color === "green" ? "text-emerald-600 dark:text-emerald-300" : conditions.color === "red" ? "text-red-500" : "text-amber-600 dark:text-amber-200"}>{conditions.label}</span></h3>
            <p className="text-sm text-slate-500 dark:text-[#a3acba]">{jf ? "Current conditions favor" : "Favors"}: <strong>{favors}</strong></p>
          </div>
        </div>
      </Card>

      {/* Key Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Fed Interest Rate" : "Fed Funds Rate"}<Tip text={jf ? "The rate the Fed charges banks. Higher = tighter money, harder to borrow." : "Federal funds target rate. Key driver of all borrowing costs."} /></div><div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{mkt.fedRate}%</div><div className="text-xs text-slate-400 dark:text-[#828b9a] mt-0.5">{mkt.fedRate > 5 ? (jf ? "Restrictive" : "Tight") : mkt.fedRate > 3 ? "Neutral" : (jf ? "Easy money" : "Accommodative")}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Inflation" : "CPI YoY"}<Tip text={jf ? "How fast prices are rising. The Fed targets 2%." : "Consumer Price Index year-over-year change."} /></div><div className={`text-lg font-bold mt-1 ${mkt.cpi > 3.5 ? "text-red-500" : mkt.cpi > 2.5 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-300"}`}>{mkt.cpi}%</div><div className="text-xs text-slate-400 dark:text-[#828b9a]">Target: 2.0%</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Fear Index" : "VIX"}<Tip text={jf ? "Measures market fear. Below 15 = calm. 15-25 = normal to elevated. 25-30 = rising stress. 30+ = panic." : "CBOE Volatility Index. Expected 30-day S&P 500 volatility."} /></div><div className={`text-lg font-bold mt-1 ${mkt.vix > 25 ? "text-red-500" : mkt.vix > 18 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-300"}`}>{mkt.vix}</div><div className="text-xs text-slate-400 dark:text-[#828b9a]">{mkt.vix < 15 ? "Calm" : mkt.vix < 20 ? "Normal" : mkt.vix < 30 ? "Elevated" : "Panic"}</div></Card>
        <Card><div className="text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "Yield Curve" : "10Y - 2Y Spread"}<Tip text={jf ? "Normally positive. When negative (inverted), it's a recession warning." : "Treasury spread. Inversion precedes recessions historically."} /></div><div className={`text-lg font-bold mt-1 ${isInverted ? "text-red-500" : "text-emerald-600 dark:text-emerald-300"}`}>{yieldCurve > 0 ? "+" : ""}{yieldCurve.toFixed(2)}%</div><div className={`text-xs ${isInverted ? "text-red-500 font-bold" : "text-slate-400 dark:text-[#828b9a]"}`}>{isInverted ? "INVERTED" : "Normal"}</div></Card>
      </div>

      {/* Market & Economy Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2">{jf ? "Major Indexes" : "Market Indexes"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {[["S&P 500", "sp500", "sp500Change"], ["Nasdaq", "nasdaq", "nasdaqChange"], ["Dow Jones", "dow", "dowChange"]].map(([l, k, ck]) => (
              <div key={k} className="p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg text-center">
                <div className="text-xs text-slate-400 dark:text-[#828b9a]">{l}</div>
                <input type="number" value={mkt[k]} onChange={e => uM(k)(Number(e.target.value) || 0)} className="w-full text-center text-sm font-bold text-slate-800 dark:text-[#eef1f6] bg-transparent outline-none" />
                <div className={`text-xs font-bold ${mkt[ck] >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{mkt[ck] >= 0 ? "+" : ""}{mkt[ck]}%</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F label={jf ? "Fed Rate" : "Fed Funds"} value={mkt.fedRate} onChange={uM("fedRate")} suffix="%" small />
            <F label="10Y Treasury" value={mkt.treasury10y} onChange={uM("treasury10y")} suffix="%" small />
            <F label="2Y Treasury" value={mkt.treasury2y} onChange={uM("treasury2y")} suffix="%" small />
            <F label="VIX" value={mkt.vix} onChange={uM("vix")} small />
            <F label={jf ? "Inflation (CPI)" : "CPI %"} value={mkt.cpi} onChange={uM("cpi")} suffix="%" small />
            <F label={jf ? "Unemployment" : "Unemployment"} value={mkt.unemployment} onChange={uM("unemployment")} suffix="%" small />
            <F label={jf ? "GDP Growth" : "GDP Growth"} value={mkt.gdpGrowth} onChange={uM("gdpGrowth")} suffix="%" small />
            <F label="Oil ($/barrel)" value={mkt.oil} onChange={uM("oil")} prefix="$" small />
          </div>
        </Card>

        {/* Sectors */}
        <Card>
          <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 mb-2">{jf ? "Which Sectors Are Winning?" : "Sector Performance"}</h3>
          {sectors.sort((a, b) => b.change - a.change).map((s, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-600 dark:text-[#c4ccd8] w-28 truncate">{s.name}</span>
              <div className="flex-1 h-4 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden relative">
                <div className={`absolute h-full rounded-full transition-all ${s.change >= 0 ? "bg-emerald-400" : "bg-red-400"}`}
                  style={{ width: `${Math.min(Math.abs(s.change) * 15, 100)}%`, [s.change >= 0 ? "left" : "right"]: "50%", maxWidth: "50%" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-xs font-bold ${s.change >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>{s.change >= 0 ? "+" : ""}{s.change}%</span>
                </div>
              </div>
              <input type="number" value={s.change} onChange={e => updateSector(i, "change", Number(e.target.value) || 0)} className="bg-white dark:bg-[#1c1f26] w-14 text-right text-xs border border-slate-200 dark:border-[#323844] rounded px-1 py-0.5 outline-none" />
            </div>
          ))}
          <div className="mt-2 text-xs text-slate-400 dark:text-[#828b9a]">Input today's sector changes to see the full picture.</div>
        </Card>
      </div>

      {/* Insights */}
      <Card className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6] mb-3">{jf ? "What This All Means" : "Market Intelligence"}</h3>
        {insights.length === 0 ? <p className="text-sm text-slate-500 dark:text-[#a3acba]">Markets are in a relatively normal state. No major signals to flag.</p> :
          insights.map((ins, i) => (
            <div key={i} className="flex gap-3 mb-3 last:mb-0">
              <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">{ins.icon}</span>
              <p className="text-sm text-slate-700 dark:text-[#dde3ec]">{ins.text}</p>
            </div>
          ))
        }
      </Card>

      {/* News */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-amber-700 dark:text-amber-200">{jf ? "Financial Headlines" : "News & Events"}</h3>
          <Btn onClick={addHeadline} v="secondary">+ Add</Btn>
        </div>
        {headlines.map((h, i) => (
          <div key={i} className="flex gap-2 mb-2 items-center">
            <select value={h.impact} onChange={e => updateHL(i, "impact", e.target.value)} className="bg-white dark:bg-[#1c1f26] px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg w-20">
              <option value="bullish">Bullish</option><option value="neutral">Neutral</option><option value="bearish">Bearish</option>
            </select>
            <select value={h.category} onChange={e => updateHL(i, "category", e.target.value)} className="bg-white dark:bg-[#1c1f26] px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg w-20">
              {["Fed", "Economy", "Earnings", "Geopolitics", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" value={h.text} onChange={e => updateHL(i, "text", e.target.value)} className="bg-white dark:bg-[#1c1f26] flex-1 px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none" placeholder="Headline..." />
            <button onClick={() => removeHL(i)} className="text-red-400 text-xs hover:text-red-600">x</button>
          </div>
        ))}
        <div className="mt-2 p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg text-xs flex justify-between">
          <span className="text-slate-500 dark:text-[#a3acba]">{jf ? "Overall News Mood" : "Net Sentiment"}</span>
          {(() => { const s = headlines.reduce((acc, h) => acc + (h.impact === "bullish" ? 1 : h.impact === "bearish" ? -1 : 0), 0); return <span className={`font-bold ${s > 0 ? "text-emerald-600 dark:text-emerald-300" : s < 0 ? "text-red-500" : "text-slate-600 dark:text-[#c4ccd8]"}`}>{s > 0 ? "Bullish" : s < 0 ? "Bearish" : "Neutral"} ({s > 0 ? "+" : ""}{s})</span>; })()}
        </div>
      </Card>
    </div>
  );
}

// ============================================================
// MARKET WATCH (Robinhood / CoinMarketCap style)
// ============================================================
function MarketWatch({ jargonFree: jf, onNav }) {
  const [view, setView] = useState("all"); // all, stocks, crypto, commodities, indices
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState(1);
  const [assets, setAssets] = useState([
    { name: "AAPL", fullName: "Apple Inc.", type: "stocks", price: 189.84, change: 1.32, changePct: 0.70, mcap: 2.95e12, vol: 52.3e6, high52: 199.62, low52: 143.90 },
    { name: "MSFT", fullName: "Microsoft Corp.", type: "stocks", price: 420.55, change: -2.10, changePct: -0.50, mcap: 3.12e12, vol: 18.7e6, high52: 430.82, low52: 309.45 },
    { name: "GOOGL", fullName: "Alphabet Inc.", type: "stocks", price: 175.98, change: 3.42, changePct: 1.98, mcap: 2.18e12, vol: 24.1e6, high52: 180.10, low52: 120.21 },
    { name: "AMZN", fullName: "Amazon.com Inc.", type: "stocks", price: 186.40, change: 0.85, changePct: 0.46, mcap: 1.93e12, vol: 41.2e6, high52: 191.70, low52: 118.35 },
    { name: "TSLA", fullName: "Tesla Inc.", type: "stocks", price: 245.20, change: -8.50, changePct: -3.35, mcap: 780e9, vol: 95.8e6, high52: 299.29, low52: 138.80 },
    { name: "NVDA", fullName: "NVIDIA Corp.", type: "stocks", price: 875.30, change: 12.60, changePct: 1.46, mcap: 2.16e12, vol: 38.5e6, high52: 974.00, low52: 373.56 },
    { name: "META", fullName: "Meta Platforms", type: "stocks", price: 502.30, change: 5.20, changePct: 1.05, mcap: 1.28e12, vol: 14.3e6, high52: 531.49, low52: 274.38 },
    { name: "BTC", fullName: "Bitcoin", type: "crypto", price: 67250, change: 1450, changePct: 2.20, mcap: 1.32e12, vol: 28.5e9, high52: 73750, low52: 38500 },
    { name: "ETH", fullName: "Ethereum", type: "crypto", price: 3520, change: -85, changePct: -2.36, mcap: 423e9, vol: 14.2e9, high52: 4090, low52: 1520 },
    { name: "SOL", fullName: "Solana", type: "crypto", price: 172.40, change: 8.30, changePct: 5.06, mcap: 76.8e9, vol: 3.2e9, high52: 210, low52: 18.50 },
    { name: "XRP", fullName: "Ripple", type: "crypto", price: 0.62, change: 0.03, changePct: 5.08, mcap: 33.8e9, vol: 1.8e9, high52: 0.94, low52: 0.42 },
    { name: "GOLD", fullName: "Gold (oz)", type: "commodities", price: 2345, change: 18, changePct: 0.77, mcap: 0, vol: 0, high52: 2450, low52: 1810 },
    { name: "OIL", fullName: "Crude Oil (bbl)", type: "commodities", price: 78.50, change: -1.20, changePct: -1.51, mcap: 0, vol: 0, high52: 95.30, low52: 63.50 },
    { name: "SILVER", fullName: "Silver (oz)", type: "commodities", price: 27.80, change: 0.45, changePct: 1.65, mcap: 0, vol: 0, high52: 32.50, low52: 20.80 },
    { name: "SPY", fullName: "S&P 500 ETF", type: "indices", price: 520.48, change: 3.20, changePct: 0.62, mcap: 510e9, vol: 62e6, high52: 532, low52: 410 },
    { name: "QQQ", fullName: "Nasdaq 100 ETF", type: "indices", price: 443.90, change: 5.10, changePct: 1.16, mcap: 250e9, vol: 38e6, high52: 460, low52: 340 },
    { name: "DIA", fullName: "Dow Jones ETF", type: "indices", price: 390.20, change: 1.80, changePct: 0.46, mcap: 33e9, vol: 3.5e6, high52: 400, low52: 325 },
  ]);

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [timeRange, setTimeRange] = useState("3M");
  const [candleInterval, setCandleInterval] = useState("1D");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [detailIndicators, setDetailIndicators] = useState({ sma1: true, sma2: false, ema: false, rsi: false, macd: false, bollinger: false, volume: true });
  const [detailSmaPeriod1, setDetailSmaPeriod1] = useState(20);
  const [detailSmaPeriod2, setDetailSmaPeriod2] = useState(50);
  const [detailEmaPeriod, setDetailEmaPeriod] = useState(21);
  const [detailChartType, setDetailChartType] = useState("candle");

  const updateAsset = (i, k, v) => { const u = [...assets]; u[i][k] = v; setAssets(u); };
  const addAsset = () => setAssets([...assets, { name: "NEW", fullName: "New Asset", type: view === "all" ? "stocks" : view, price: 100, change: 0, changePct: 0, mcap: 0, vol: 0, high52: 110, low52: 90 }]);
  const removeAsset = (i) => setAssets(assets.filter((_, idx) => idx !== i));

  // Generate simulated price data for detail view based on time range and interval
  const detailPrices = useMemo(() => {
    if (!selectedAsset) return [];
    const rangeBars = { "1D": 78, "1W": 84, "1M": 60, "3M": 90, "6M": 120, "1Y": 252, "ALL": 500 };
    const bars = rangeBars[timeRange] || 90;
    const vol = selectedAsset.type === "crypto" ? 4 : selectedAsset.type === "commodities" ? 1.5 : 2;
    const data = [];
    let p = selectedAsset.price * (1 - selectedAsset.changePct / 100 * (bars / 20));
    for (let i = 0; i < bars; i++) {
      const move = (Math.random() - 0.48) * vol / 100;
      p = p * (1 + move);
      const high = p * (1 + Math.random() * vol / 200);
      const low = p * (1 - Math.random() * vol / 200);
      data.push({ idx: i, close: Math.round(p * 100) / 100, open: Math.round((p - move * p) * 100) / 100, high: Math.round(high * 100) / 100, low: Math.round(low * 100) / 100, vol: Math.round(5e5 + Math.random() * 1e7) });
    }
    // Adjust last bar to match actual price
    if (data.length > 0) data[data.length - 1].close = selectedAsset.price;
    return data;
  }, [selectedAsset, timeRange]);

  // Technical indicators for detail view
  const dSMA = (period) => detailPrices.map((_, i) => i < period - 1 ? null : detailPrices.slice(i - period + 1, i + 1).reduce((s, d) => s + d.close, 0) / period);
  const dEMA = (period) => { const k = 2 / (period + 1); const e = [detailPrices[0]?.close || 0]; for (let i = 1; i < detailPrices.length; i++) e.push(detailPrices[i].close * k + e[i - 1] * (1 - k)); return e; };
  const dRSI = useMemo(() => {
    const r = new Array(detailPrices.length).fill(null);
    for (let i = 14; i < detailPrices.length; i++) {
      let g = 0, l = 0;
      for (let j = i - 13; j <= i; j++) { const d = detailPrices[j].close - detailPrices[j - 1].close; if (d > 0) g += d; else l -= d; }
      r[i] = 100 - 100 / (1 + (l > 0 ? g / l : 100));
    }
    return r;
  }, [detailPrices]);
  const dMACD = useMemo(() => {
    if (detailPrices.length === 0) return { macd: [], signal: [], histogram: [] };
    const e12 = dEMA(12); const e26 = dEMA(26);
    const line = e12.map((v, i) => v - e26[i]);
    const sig = []; let s = line[0]; const k = 2 / 10;
    for (let i = 0; i < line.length; i++) { s = line[i] * k + s * (1 - k); sig.push(s); }
    return { macd: line, signal: sig, histogram: line.map((v, i) => v - sig[i]) };
  }, [detailPrices]);
  const dBollinger = useMemo(() => detailPrices.map((_, i) => {
    if (i < 19) return { upper: null, lower: null, mid: null };
    const sl = detailPrices.slice(i - 19, i + 1);
    const mean = sl.reduce((s, d) => s + d.close, 0) / 20;
    const std = Math.sqrt(sl.reduce((s, d) => s + Math.pow(d.close - mean, 2), 0) / 20);
    return { upper: mean + 2 * std, lower: mean - 2 * std, mid: mean };
  }), [detailPrices]);

  const detailSma1 = useMemo(() => dSMA(detailSmaPeriod1), [detailPrices, detailSmaPeriod1]);
  const detailSma2 = useMemo(() => dSMA(detailSmaPeriod2), [detailPrices, detailSmaPeriod2]);
  const detailEmaLine = useMemo(() => dEMA(detailEmaPeriod), [detailPrices, detailEmaPeriod]);

  const filtered = view === "all" ? assets : assets.filter(a => a.type === view);
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name) * sortDir;
    if (sortBy === "price") return (a.price - b.price) * sortDir;
    if (sortBy === "change") return (a.changePct - b.changePct) * sortDir;
    if (sortBy === "mcap") return (a.mcap - b.mcap) * sortDir;
    return 0;
  });

  const toggleSort = (col) => { if (sortBy === col) setSortDir(d => d * -1); else { setSortBy(col); setSortDir(col === "change" ? -1 : 1); } };

  // Market summary
  const gainers = assets.filter(a => a.changePct > 0).length;
  const losers = assets.filter(a => a.changePct < 0).length;
  const topGainer = [...assets].sort((a, b) => b.changePct - a.changePct)[0];
  const topLoser = [...assets].sort((a, b) => a.changePct - b.changePct)[0];
  const avgChange = assets.length > 0 ? assets.reduce((s, a) => s + a.changePct, 0) / assets.length : 0;

  // Mini sparkline for each asset (simulated based on change direction)
  const miniChart = (asset) => {
    const pts = [];
    let v = asset.price - asset.change;
    for (let i = 0; i < 12; i++) {
      v += (asset.change / 12) + (Math.random() - 0.5) * Math.abs(asset.change) * 0.3;
      pts.push(v);
    }
    const min = Math.min(...pts); const max = Math.max(...pts); const range = max - min || 1;
    return <svg width="60" height="24" className="inline-block"><polyline points={pts.map((p, i) => `${i * 5},${24 - ((p - min) / range) * 20}`).join(" ")} fill="none" stroke={asset.changePct >= 0 ? "#22c55e" : "#ef4444"} strokeWidth="1.5" /></svg>;
  };

  const formatMcap = (v) => v >= 1e12 ? "$" + (v / 1e12).toFixed(2) + "T" : v >= 1e9 ? "$" + (v / 1e9).toFixed(1) + "B" : v >= 1e6 ? "$" + (v / 1e6).toFixed(0) + "M" : v > 0 ? "$" + v.toLocaleString() : "—";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Title tier="Investing" sub={jf ? "Keep up with prices across stocks, crypto, commodities, and indexes — all in one place" : "Real-time market overview across all asset classes"}>Market Watch</Title>

      {/* Market Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Card className={avgChange >= 0 ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30"}>
          <div className="text-xs text-slate-500 dark:text-[#a3acba]">{jf ? "Overall Mood" : "Market Sentiment"}</div>
          <div className={`text-lg font-bold mt-1 ${avgChange >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{avgChange >= 0 ? "Bullish" : "Bearish"}</div>
          <div className="text-xs text-slate-400 dark:text-[#828b9a]">{gainers} up / {losers} down</div>
        </Card>
        {topGainer && <Card>
          <div className="text-xs text-slate-500 dark:text-[#a3acba]">{jf ? "Biggest Winner" : "Top Gainer"}</div>
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-300 mt-1">{topGainer.name}</div>
          <div className="text-xs text-emerald-500">+{topGainer.changePct.toFixed(2)}%</div>
        </Card>}
        {topLoser && <Card>
          <div className="text-xs text-slate-500 dark:text-[#a3acba]">{jf ? "Biggest Loser" : "Top Decliner"}</div>
          <div className="text-lg font-bold text-red-500 mt-1">{topLoser.name}</div>
          <div className="text-xs text-red-400">{topLoser.changePct.toFixed(2)}%</div>
        </Card>}
        <Card>
          <div className="text-xs text-slate-500 dark:text-[#a3acba]">Tracking</div>
          <div className="text-lg font-bold text-slate-800 dark:text-[#eef1f6] mt-1">{assets.length} Assets</div>
          <div className="text-xs text-slate-400 dark:text-[#828b9a]">{[...new Set(assets.map(a => a.type))].length} categories</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4">
        {[["all", "All"], ["stocks", "Stocks"], ["crypto", "Crypto"], ["commodities", "Commodities"], ["indices", "Indexes"]].map(([id, label]) =>
          <button key={id} onClick={() => setView(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === id ? "bg-indigo-600 text-white" : "bg-white dark:bg-[#1c1f26] text-slate-600 dark:text-[#c4ccd8] border border-slate-200 dark:border-[#323844] hover:border-indigo-300"}`}>{label} {id !== "all" && <span className="ml-1 text-xs opacity-70">({assets.filter(a => id === "all" || a.type === id).length})</span>}</button>
        )}
      </div>

      {/* Asset Table */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{view === "all" ? "All Assets" : view.charAt(0).toUpperCase() + view.slice(1)}</h3>
          <Btn onClick={addAsset} v="success">+ Add Asset</Btn>
        </div>
        <div className="overflow-x-auto"><table className="w-full">
          <thead><tr className="border-b border-slate-100 dark:border-[#262b33]">
            <th className="text-left py-2 px-2 text-xs text-slate-400 dark:text-[#828b9a] cursor-pointer hover:text-slate-600" onClick={() => toggleSort("name")}>Asset {sortBy === "name" ? (sortDir > 0 ? "↑" : "↓") : ""}</th>
            <th className="text-right py-2 px-2 text-xs text-slate-400 dark:text-[#828b9a] cursor-pointer hover:text-slate-600" onClick={() => toggleSort("price")}>Price {sortBy === "price" ? (sortDir > 0 ? "↑" : "↓") : ""}</th>
            <th className="text-right py-2 px-2 text-xs text-slate-400 dark:text-[#828b9a] cursor-pointer hover:text-slate-600" onClick={() => toggleSort("change")}>Change {sortBy === "change" ? (sortDir > 0 ? "↑" : "↓") : ""}</th>
            <th className="text-center py-2 px-2 text-xs text-slate-400 dark:text-[#828b9a]">Trend</th>
            <th className="text-right py-2 px-2 text-xs text-slate-400 dark:text-[#828b9a] cursor-pointer hover:text-slate-600" onClick={() => toggleSort("mcap")}>{jf ? "Size" : "Mkt Cap"} {sortBy === "mcap" ? (sortDir > 0 ? "↑" : "↓") : ""}</th>
            <th className="text-right py-2 px-2 text-xs text-slate-400 dark:text-[#828b9a]">{jf ? "52-Wk Range" : "52W Range"}</th>
            <th className="py-2 px-1"></th>
          </tr></thead>
          <tbody>
            {sorted.map((a, si) => {
              const oi = assets.findIndex(o => o.name === a.name && o.type === a.type);
              const rangePct = a.high52 > a.low52 ? ((a.price - a.low52) / (a.high52 - a.low52)) * 100 : 50;
              return (
                <tr key={si} className="border-b border-slate-50 hover:bg-indigo-50 transition-colors cursor-pointer" onClick={() => setSelectedAsset(a)}>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${a.type === "stocks" ? "bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300" : a.type === "crypto" ? "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-200" : a.type === "commodities" ? "bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-200" : "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-300"}`}>{a.name.charAt(0)}</span>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{a.name}</div>
                        <div className="text-xs text-slate-400 dark:text-[#828b9a]">{a.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">${a.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className={`text-sm font-bold ${a.changePct >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{a.changePct >= 0 ? "+" : ""}{a.changePct.toFixed(2)}%</div>
                    <div className={`text-xs ${a.change >= 0 ? "text-emerald-500" : "text-red-400"}`}>{a.change >= 0 ? "+" : ""}{a.price >= 100 ? a.change.toFixed(2) : a.change.toFixed(4)}</div>
                  </td>
                  <td className="py-2.5 px-2 text-center">{miniChart(a)}</td>
                  <td className="py-2.5 px-2 text-right text-xs text-slate-600 dark:text-[#c4ccd8]">{formatMcap(a.mcap)}</td>
                  <td className="py-2.5 px-2">
                    <div className="w-20 ml-auto">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className="h-full bg-indigo-400 rounded-full" style={{ width: `${rangePct}%` }} /></div>
                      <div className="flex justify-between text-xs text-slate-300 mt-0.5"><span>{a.low52 >= 1000 ? (a.low52/1000).toFixed(0)+"k" : a.low52.toFixed(a.low52 < 1 ? 2 : 0)}</span><span>{a.high52 >= 1000 ? (a.high52/1000).toFixed(0)+"k" : a.high52.toFixed(a.high52 < 1 ? 2 : 0)}</span></div>
                    </div>
                  </td>
                  <td className="py-2.5 px-1"><button onClick={() => removeAsset(oi)} className="text-red-300 text-xs hover:text-red-500">x</button></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </Card>

      {/* ===== ASSET DETAIL VIEW ===== */}
      {selectedAsset && detailPrices.length > 0 && (() => {
        const dp = detailPrices;
        const last = dp[dp.length - 1];
        const first = dp[0];
        const periodChange = last.close - first.close;
        const periodChangePct = first.close > 0 ? (periodChange / first.close) * 100 : 0;
        const periodHigh = Math.max(...dp.map(d => d.high));
        const periodLow = Math.min(...dp.map(d => d.low));
        const chartSlice = dp;
        // Include indicator values in Y-axis range so they scale properly
        let allYValues = chartSlice.map(d => [d.low, d.high]).flat();
        if (detailIndicators.sma1) allYValues.push(...detailSma1.filter(v => v !== null));
        if (detailIndicators.sma2) allYValues.push(...detailSma2.filter(v => v !== null));
        if (detailIndicators.ema) allYValues.push(...detailEmaLine.filter(v => v !== null));
        if (detailIndicators.bollinger) allYValues.push(...dBollinger.filter(b => b.upper !== null).map(b => [b.upper, b.lower]).flat());
        const minP = Math.min(...allYValues) * 0.998;
        const maxP = Math.max(...allYValues) * 1.002;
        const pRange = maxP - minP || 1;
        const maxVol = Math.max(...chartSlice.map(d => d.vol), 1);

        const intervalLabel = { "1m": "1 Min", "5m": "5 Min", "15m": "15 Min", "30m": "30 Min", "1h": "1 Hour", "4h": "4 Hour", "1D": "Daily", "1W": "Weekly", "1M": "Monthly" };
        const rangeLabel = { "1D": "1 Day", "1W": "1 Week", "1M": "1 Month", "3M": "3 Months", "6M": "6 Months", "1Y": "1 Year", "ALL": "All Time", "custom": "Custom" };

        return (
          <Card className="mb-4 border-2 border-indigo-200 dark:border-indigo-500/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedAsset(null)} className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200 flex items-center justify-center text-lg">←</button>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-[#eef1f6]">{selectedAsset.name} <span className="text-sm font-normal text-slate-400 dark:text-[#828b9a]">{selectedAsset.fullName}</span></h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-2xl font-bold text-slate-800 dark:text-[#eef1f6]">${last.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className={`text-sm font-bold ${periodChange >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{periodChange >= 0 ? "+" : ""}{periodChange.toFixed(2)} ({periodChangePct >= 0 ? "+" : ""}{periodChangePct.toFixed(2)}%)</span>
                    <Badge color={selectedAsset.type === "stocks" ? "indigo" : selectedAsset.type === "crypto" ? "amber" : "slate"}>{selectedAsset.type}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 dark:text-[#828b9a]">
                <div>H: ${periodHigh.toLocaleString(undefined, { maximumFractionDigits: 2 })} | L: ${periodLow.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                <div>MCap: {formatMcap(selectedAsset.mcap)}</div>
              </div>
            </div>

            {/* Time Range Presets */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-400 dark:text-[#828b9a] mr-1">{jf ? "Time:" : "Range:"}</span>
              {["1D", "1W", "1M", "3M", "6M", "1Y", "ALL"].map(r =>
                <button key={r} onClick={() => { setTimeRange(r); }} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${timeRange === r ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>{r}</button>
              )}
              <button onClick={() => setTimeRange("custom")} className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${timeRange === "custom" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>Custom</button>
            </div>

            {/* Custom Date Range */}
            {timeRange === "custom" && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg">
                <span className="text-xs text-slate-500 dark:text-[#a3acba]">From:</span>
                <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="bg-white dark:bg-[#1c1f26] px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none" />
                <span className="text-xs text-slate-500 dark:text-[#a3acba]">To:</span>
                <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="bg-white dark:bg-[#1c1f26] px-2 py-1 text-xs border border-slate-200 dark:border-[#323844] rounded-lg outline-none" />
                <span className="text-xs text-slate-400 dark:text-[#828b9a] ml-2">(Custom ranges will use live data in the webapp version)</span>
              </div>
            )}

            {/* Candle Interval */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-slate-400 dark:text-[#828b9a] mr-1">{jf ? "Candle Size:" : "Interval:"}</span>
              {["1m", "5m", "15m", "30m", "1h", "4h", "1D", "1W", "1M"].map(iv =>
                <button key={iv} onClick={() => setCandleInterval(iv)} className={`px-2 py-1 rounded text-xs font-medium transition-colors ${candleInterval === iv ? "bg-slate-800 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>{iv}</button>
              )}
            </div>

            {/* Chart Type + Indicators */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex bg-slate-100 dark:bg-[#232730] rounded-lg p-0.5 mr-2">
                <button onClick={() => setDetailChartType("candle")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${detailChartType === "candle" ? "bg-white dark:bg-[#1c1f26] text-slate-800 dark:text-[#eef1f6] shadow-sm" : "text-slate-500 dark:text-[#a3acba]"}`}>{jf ? "Candles" : "Candlestick"}</button>
                <button onClick={() => setDetailChartType("line")} className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${detailChartType === "line" ? "bg-white dark:bg-[#1c1f26] text-slate-800 dark:text-[#eef1f6] shadow-sm" : "text-slate-500 dark:text-[#a3acba]"}`}>Line</button>
              </div>
              {[["sma1", `SMA ${detailSmaPeriod1}`], ["sma2", `SMA ${detailSmaPeriod2}`], ["ema", `EMA ${detailEmaPeriod}`], ["rsi", "RSI"], ["macd", "MACD"], ["bollinger", jf ? "Bands" : "Bollinger"], ["volume", "Vol"]].map(([k, l]) =>
                <button key={k} onClick={() => setDetailIndicators(p => ({ ...p, [k]: !p[k] }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${detailIndicators[k] ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-[#232730] text-slate-500 dark:text-[#a3acba] hover:bg-slate-200"}`}>{l}</button>
              )}
            </div>

            {/* Period inputs for SMA/EMA */}
            {(detailIndicators.sma1 || detailIndicators.sma2 || detailIndicators.ema) && (
              <div className="flex gap-3 mb-3 p-2 bg-slate-50 dark:bg-[#15171c] rounded-lg">
                {detailIndicators.sma1 && <div className="flex items-center gap-1"><span className="text-xs text-slate-400 dark:text-[#828b9a]">SMA1:</span><input type="number" value={detailSmaPeriod1} onChange={e => setDetailSmaPeriod1(Math.max(2, Number(e.target.value) || 2))} className="bg-white dark:bg-[#1c1f26] w-14 px-1.5 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none text-center" /></div>}
                {detailIndicators.sma2 && <div className="flex items-center gap-1"><span className="text-xs text-slate-400 dark:text-[#828b9a]">SMA2:</span><input type="number" value={detailSmaPeriod2} onChange={e => setDetailSmaPeriod2(Math.max(2, Number(e.target.value) || 2))} className="bg-white dark:bg-[#1c1f26] w-14 px-1.5 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none text-center" /></div>}
                {detailIndicators.ema && <div className="flex items-center gap-1"><span className="text-xs text-slate-400 dark:text-[#828b9a]">EMA:</span><input type="number" value={detailEmaPeriod} onChange={e => setDetailEmaPeriod(Math.max(2, Number(e.target.value) || 2))} className="bg-white dark:bg-[#1c1f26] w-14 px-1.5 py-0.5 text-xs border border-slate-200 dark:border-[#323844] rounded outline-none text-center" /></div>}
              </div>
            )}

            {/* ===== CHART ===== */}
            <div className="relative h-64 border border-slate-100 dark:border-[#262b33] rounded-lg overflow-hidden bg-slate-50 dark:bg-[#15171c] mb-2">
              {/* Grid */}
              {[0.25, 0.5, 0.75].map(pct => <div key={pct} className="absolute w-full border-t border-slate-200 dark:border-[#323844] border-dashed" style={{ top: `${pct * 100}%` }}><span className="absolute right-1 -top-3 text-xs text-slate-300">${(maxP - pRange * pct).toFixed(maxP > 100 ? 0 : 2)}</span></div>)}

              {/* Bollinger */}
              {detailIndicators.bollinger && <svg className="absolute inset-0" viewBox={`0 0 ${chartSlice.length} 100`} preserveAspectRatio="none">
                <path d={chartSlice.map((_, i) => { const b = dBollinger[i]; if (!b || !b.upper) return ""; const y = ((maxP - b.upper) / pRange) * 100; return `${!dBollinger[i-1]?.upper ? "M" : "L"}${i} ${y}`; }).join(" ")} fill="none" stroke="#c7d2fe" strokeWidth="0.5" />
                <path d={chartSlice.map((_, i) => { const b = dBollinger[i]; if (!b || !b.lower) return ""; const y = ((maxP - b.lower) / pRange) * 100; return `${!dBollinger[i-1]?.lower ? "M" : "L"}${i} ${y}`; }).join(" ")} fill="none" stroke="#c7d2fe" strokeWidth="0.5" />
              </svg>}

              {/* Candlestick */}
              {detailChartType === "candle" && <div className="absolute inset-0 flex px-0.5">
                {chartSlice.map((p, i) => {
                  const isUp = p.close >= p.open;
                  const bodyTop = ((maxP - Math.max(p.close, p.open)) / pRange) * 100;
                  const bodyBot = ((maxP - Math.min(p.close, p.open)) / pRange) * 100;
                  const wickTop = ((maxP - p.high) / pRange) * 100;
                  const wickBot = ((maxP - p.low) / pRange) * 100;
                  return <div key={i} className="flex-1 relative group">
                    <div className={`absolute left-1/2 -translate-x-1/2 ${chartSlice.length > 200 ? "w-px" : "w-0.5"} ${isUp ? "bg-emerald-300" : "bg-red-300"}`} style={{ top: `${wickTop}%`, height: `${wickBot - wickTop}%` }} />
                    <div className={`absolute left-1/2 -translate-x-1/2 ${chartSlice.length > 200 ? "w-0.5" : chartSlice.length > 100 ? "w-1" : "w-1.5"} rounded-sm ${isUp ? "bg-emerald-500" : "bg-red-500"}`} style={{ top: `${bodyTop}%`, height: `${Math.max(bodyBot - bodyTop, 0.3)}%` }} />
                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">O:{p.open.toFixed(2)} H:{p.high.toFixed(2)} L:{p.low.toFixed(2)} C:{p.close.toFixed(2)}</div>
                  </div>;
                })}
              </div>}

              {/* Line */}
              {detailChartType === "line" && <svg className="absolute inset-0" viewBox={`0 0 ${chartSlice.length} 100`} preserveAspectRatio="none">
                <defs><linearGradient id="dLineGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={periodChange >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.2" /><stop offset="100%" stopColor={periodChange >= 0 ? "#22c55e" : "#ef4444"} stopOpacity="0.01" /></linearGradient></defs>
                <path d={chartSlice.map((p, i) => `${i === 0 ? "M" : "L"}${i} ${((maxP - p.close) / pRange) * 100}`).join(" ") + ` L${chartSlice.length - 1} 100 L0 100 Z`} fill="url(#dLineGrad)" />
                <polyline points={chartSlice.map((p, i) => `${i},${((maxP - p.close) / pRange) * 100}`).join(" ")} fill="none" stroke={periodChange >= 0 ? "#22c55e" : "#ef4444"} strokeWidth="1" />
              </svg>}
              {detailChartType === "line" && <div className="absolute inset-0 flex px-0.5">
                {chartSlice.map((p, i) => <div key={i} className="flex-1 relative group"><div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">${p.close.toFixed(2)}</div></div>)}
              </div>}

              {/* SMA/EMA overlays */}
              {detailIndicators.sma1 && <svg className="absolute inset-0" viewBox={`0 0 ${chartSlice.length} 100`} preserveAspectRatio="none">
                <polyline points={chartSlice.map((_, i) => { const v = detailSma1[i]; return v ? `${i},${((maxP - v) / pRange) * 100}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#6366f1" strokeWidth="0.8" />
              </svg>}
              {detailIndicators.sma2 && <svg className="absolute inset-0" viewBox={`0 0 ${chartSlice.length} 100`} preserveAspectRatio="none">
                <polyline points={chartSlice.map((_, i) => { const v = detailSma2[i]; return v ? `${i},${((maxP - v) / pRange) * 100}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#f59e0b" strokeWidth="0.8" />
              </svg>}
              {detailIndicators.ema && <svg className="absolute inset-0" viewBox={`0 0 ${chartSlice.length} 100`} preserveAspectRatio="none">
                <polyline points={chartSlice.map((_, i) => { const v = detailEmaLine[i]; return v ? `${i},${((maxP - v) / pRange) * 100}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#22c55e" strokeWidth="0.8" />
              </svg>}
            </div>

            {/* Legend */}
            <div className="flex gap-3 text-xs text-slate-400 dark:text-[#828b9a] mb-3 flex-wrap">
              {detailChartType === "candle" && <><span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" />Up</span><span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-sm" />Down</span></>}
              {detailChartType === "line" && <span className="flex items-center gap-1"><span className={`w-3 h-0.5 ${periodChange >= 0 ? "bg-emerald-500" : "bg-red-500"} inline-block`} />Close</span>}
              {detailIndicators.sma1 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-500 inline-block" />SMA {detailSmaPeriod1}</span>}
              {detailIndicators.sma2 && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500 inline-block" />SMA {detailSmaPeriod2}</span>}
              {detailIndicators.ema && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block" />EMA {detailEmaPeriod}</span>}
              {detailIndicators.bollinger && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-200 dark:bg-indigo-500/20 inline-block" />{jf ? "Bands" : "Bollinger"}</span>}
            </div>

            {/* Volume bars */}
            {detailIndicators.volume && <div className="mb-3">
              <div className="text-xs text-slate-400 dark:text-[#828b9a] mb-1">Volume</div>
              <div className="flex items-end gap-0 h-10">
                {chartSlice.map((p, i) => {
                  const isUp = p.close >= p.open;
                  return <div key={i} className="flex-1 relative group">
                    <div className={`w-full rounded-t ${isUp ? "bg-emerald-200 dark:bg-emerald-500/20" : "bg-red-200 dark:bg-red-500/20"}`} style={{ height: `${(p.vol / maxVol) * 100}%`, minHeight: 1 }} />
                  </div>;
                })}
              </div>
            </div>}

            {/* RSI */}
            {detailIndicators.rsi && <div className="mb-3">
              <div className="text-xs text-slate-400 dark:text-[#828b9a] mb-1">{jf ? "Overbought / Oversold" : "RSI (14)"}</div>
              <div className="relative h-12 bg-slate-50 dark:bg-[#15171c] rounded border border-slate-100 dark:border-[#262b33] overflow-hidden">
                <div className="absolute w-full border-t border-red-200 dark:border-red-500/30 border-dashed" style={{ top: "30%" }}><span className="absolute right-0.5 text-xs text-red-300" style={{ fontSize: "8px" }}>70</span></div>
                <div className="absolute w-full border-t border-emerald-200 dark:border-emerald-500/30 border-dashed" style={{ top: "70%" }}><span className="absolute right-0.5 text-xs text-emerald-300" style={{ fontSize: "8px" }}>30</span></div>
                <svg className="absolute inset-0" viewBox={`0 0 ${chartSlice.length} 100`} preserveAspectRatio="none">
                  <polyline points={chartSlice.map((_, i) => { const v = dRSI[i]; return v !== null ? `${i},${100 - v}` : ""; }).filter(Boolean).join(" ")} fill="none" stroke="#8b5cf6" strokeWidth="1" />
                </svg>
              </div>
              <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-0.5">RSI: <span className={`font-bold ${dRSI[dRSI.length - 1] > 70 ? "text-red-500" : dRSI[dRSI.length - 1] < 30 ? "text-emerald-500" : "text-slate-700 dark:text-[#dde3ec]"}`}>{dRSI[dRSI.length - 1]?.toFixed(1) || "N/A"}</span></div>
            </div>}

            {/* MACD */}
            {detailIndicators.macd && <div className="mb-3">
              <div className="text-xs text-slate-400 dark:text-[#828b9a] mb-1">{jf ? "Momentum" : "MACD"}</div>
              <div className="relative h-12 bg-slate-50 dark:bg-[#15171c] rounded border border-slate-100 dark:border-[#262b33] overflow-hidden">
                <div className="absolute w-full border-t border-slate-200 dark:border-[#323844]" style={{ top: "50%" }} />
                <div className="absolute inset-0 flex items-center px-0">
                  {chartSlice.map((_, i) => {
                    const v = dMACD.histogram[i] || 0;
                    const maxH = Math.max(...chartSlice.map((_, j) => Math.abs(dMACD.histogram[j] || 0)), 0.01);
                    const h = Math.abs(v) / maxH * 50;
                    return <div key={i} className="flex-1 flex items-center justify-center h-full relative">
                      <div className={`w-full rounded-sm ${v >= 0 ? "bg-emerald-400" : "bg-red-400"}`} style={{ height: `${h}%`, position: "absolute", [v >= 0 ? "bottom" : "top"]: "50%" }} />
                    </div>;
                  })}
                </div>
              </div>
            </div>}

            {/* Info bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-[#828b9a] pt-2 border-t border-slate-100 dark:border-[#262b33]">
              <span>{rangeLabel[timeRange] || timeRange} | {intervalLabel[candleInterval] || candleInterval} candles | {dp.length} bars</span>
              <span>{jf ? "Simulated data — live feed coming soon" : "Simulated price data"}</span>
            </div>
          </Card>
        );
      })()}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <button onClick={() => onNav && onNav("marketlab")} className="p-4 rounded-xl border border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26] hover:border-indigo-400 hover:shadow-md transition-all text-left">
          <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{jf ? "Analyze a Chart" : "Technical Analysis"}</div>
          <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{jf ? "Deep-dive into any asset with indicators and signals" : "Open Charts & Signals for full TA"}</div>
        </button>
        <button onClick={() => onNav && onNav("investments")} className="p-4 rounded-xl border border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26] hover:border-indigo-400 hover:shadow-md transition-all text-left">
          <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{jf ? "Research an Asset" : "Fundamental Analysis"}</div>
          <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{jf ? "Check if a stock or crypto is a good buy" : "Open Investments for fundamental metrics"}</div>
        </button>
        <button onClick={() => onNav && onNav("portfolio")} className="p-4 rounded-xl border border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26] hover:border-indigo-400 hover:shadow-md transition-all text-left">
          <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{jf ? "Track My Holdings" : "Portfolio Tracker"}</div>
          <div className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{jf ? "See how your investments are doing" : "Monitor your portfolio performance"}</div>
        </button>
      </div>

      <div className="text-xs text-slate-400 dark:text-[#828b9a] text-center p-3">Prices are manually entered. In a future version, this will pull live market data automatically.</div>
    </div>
  );
}


// ============================================================
// SNAPSHOT HISTORY — point-in-time saves with MoM deltas
// ============================================================
function SnapshotHistory({ snapshots, jargonFree: jf, onNav, onSaveNow }) {
  return (<div className="max-w-4xl mx-auto p-8">
    <Title tier="Protection" sub="See how your numbers change over time — month over month, quarter over quarter">Snapshot History</Title>
    <div className="mb-4 p-3 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-lg flex items-center justify-between gap-3 text-xs">
      <div className="text-sky-900 dark:text-sky-200"><span className="font-bold">💾 In-memory for now.</span> Snapshots clear on refresh until the SOC 2 backend persists them across sessions.</div>
      {onSaveNow && <button onClick={onSaveNow} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 whitespace-nowrap">📸 Save Today's Snapshot</button>}
    </div>
    {snapshots.length === 0 ? (<Card><p className="text-sm text-slate-500 dark:text-[#a3acba]">No snapshots yet. Hit <span className="font-bold">📸 Save Today's Snapshot</span> above (or from the top bar on any page) to capture today's numbers. Come back later to see how things changed.</p></Card>) : (
      <div className="space-y-3">{snapshots.slice().reverse().map((snap, i) => { const reversed = snapshots.slice().reverse(); const prev = reversed[i + 1]; const delta = (k) => prev ? (snap[k] - prev[k]) : null; const renderDelta = (k, fmt = $) => { const d = delta(k); if (d === null || d === 0) return null; return (<div className={`text-xs ${d >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{d >= 0 ? "↑" : "↓"} {fmt(Math.abs(d))}</div>); }; return (
        <Card key={snap.id}><div className="flex items-center justify-between mb-3"><div><h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec]">{snap.ts}</h3>{snap.label && <p className="text-xs text-slate-500 dark:text-[#a3acba] mt-0.5">{snap.label}</p>}{i === 0 && <Badge color="indigo">Most recent</Badge>}</div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div><div className="text-xs text-slate-400 dark:text-[#828b9a]">Net Worth</div><div className={`text-xl font-bold ${snap.nw >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>{$(snap.nw)}</div>{renderDelta("nw")}</div>
            <div><div className="text-xs text-slate-400 dark:text-[#828b9a]">Monthly Surplus</div><div className={`text-xl font-bold ${snap.surplus >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>{$(snap.surplus)}</div>{renderDelta("surplus")}</div>
            <div><div className="text-xs text-slate-400 dark:text-[#828b9a]">Health Score</div><div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{snap.healthScore}/100</div>{renderDelta("healthScore", v => v.toFixed(0))}</div>
          </div>
        </Card>); })}</div>
    )}
  </div>);
}

// ============================================================
// GOAL PRIORITY — debt-vs-invest waterfall
// ============================================================
function GoalPriority({ jargonFree: jf }) {
  const [items, setItems] = useState([
    { id: 1, name: "Credit Card", balance: 5000, rate: 24, type: "debt" },
    { id: 2, name: "401(k) Employer Match", balance: 0, rate: 100, type: "match" },
    { id: 3, name: "Auto Loan", balance: 12000, rate: 6.5, type: "debt" },
    { id: 4, name: "Student Loans", balance: 25000, rate: 5.5, type: "debt" },
    { id: 5, name: "Index Fund Investment", balance: 0, rate: 7, type: "invest" },
    { id: 6, name: "Mortgage", balance: 280000, rate: 6, type: "debt" },
  ]);
  const [expReturn, setExpReturn] = useState(7);
  const setItem = (id, k, v) => setItems(its => its.map(x => x.id === id ? { ...x, [k]: v } : x));
  const ranked = items.map(i => { let eff = i.rate; if (i.type === "match") eff = 100; else if (i.type === "invest") eff = expReturn; return { ...i, effective: eff }; }).sort((a, b) => b.effective - a.effective);
  return (<div className="max-w-4xl mx-auto p-8">
    <Title tier="My Money" sub={jf ? "Where should your next dollar go — payoff a debt or invest?" : "Compare debt interest cost vs expected investment return to decide priority"}>Goal Priority — What to Do First</Title>
    <Card className="mb-4"><h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-3">Your debts and opportunities</h3>
      {items.map((item) => (<div key={item.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
        <input type="text" value={item.name} onChange={e => setItem(item.id, "name", e.target.value)} className="bg-white dark:bg-[#1c1f26] col-span-4 px-2 py-1.5 text-sm border border-slate-200 dark:border-[#323844] rounded" />
        <input type="number" value={item.balance} onChange={e => setItem(item.id, "balance", Number(e.target.value))} placeholder="balance" className="bg-white dark:bg-[#1c1f26] col-span-3 px-2 py-1.5 text-sm border border-slate-200 dark:border-[#323844] rounded" />
        <input type="number" value={item.rate} onChange={e => setItem(item.id, "rate", Number(e.target.value))} placeholder="%" className="bg-white dark:bg-[#1c1f26] col-span-2 px-2 py-1.5 text-sm border border-slate-200 dark:border-[#323844] rounded" />
        <select value={item.type} onChange={e => setItem(item.id, "type", e.target.value)} className="bg-white dark:bg-[#1c1f26] col-span-2 px-2 py-1.5 text-sm border border-slate-200 dark:border-[#323844] rounded"><option value="debt">Debt</option><option value="match">401k Match</option><option value="invest">Invest</option></select>
        <button onClick={() => setItems(its => its.filter(x => x.id !== item.id))} aria-label="Remove item" className="col-span-1 text-red-400 hover:text-red-600 text-sm">✕</button>
      </div>))}
      <Btn onClick={() => setItems(its => [...its, { id: its.reduce((m, x) => Math.max(m, x.id || 0), 0) + 1, name: "New item", balance: 0, rate: 5, type: "debt" }])} v="secondary">+ Add</Btn>
    </Card>
    <F label={jf ? "Expected investment return (long-term)" : "Expected investment return (after inflation)"} value={expReturn} onChange={setExpReturn} suffix="%" info="Stock market real return historically ~7%. Use after-tax & inflation-adjusted." />
    <Card className="mt-4 bg-gradient-to-br from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/10 border-indigo-200 dark:border-indigo-500/30"><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">📋 Priority order — every extra dollar goes here in sequence</h3>
      {ranked.map((item, i) => (<div key={item.id} className="flex items-start gap-3 mb-3 last:mb-0 p-3 bg-white dark:bg-[#1c1f26] rounded-lg"><span className={`shrink-0 w-7 h-7 rounded-full font-bold flex items-center justify-center text-sm ${i === 0 ? "bg-emerald-500 text-white" : "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300"}`}>{i + 1}</span><div className="flex-1"><div className="flex items-center justify-between mb-0.5"><div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{item.name}</div><Badge color={item.effective >= 15 ? "red" : item.effective >= 8 ? "amber" : "green"}>{item.effective.toFixed(1)}% return</Badge></div><div className="text-xs text-slate-500 dark:text-[#a3acba]">{item.type === "match" ? "401(k) match = 100% instant return on the matched portion. Fund this before anything else, every time." : item.type === "invest" ? `Expected long-term return of ${expReturn}%. Compounds tax-deferred or tax-free in retirement accounts.` : `${item.rate}% interest = your guaranteed effective return when you pay it down. ${item.rate > expReturn ? "Higher than expected investment return — pay this off." : "Below expected investment return — make minimum payments and invest instead."}`}</div></div></div>))}
      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-500/10 rounded text-xs text-amber-900 dark:text-amber-200"><span className="font-bold">⚠ Rule:</span> Always fund the emergency fund (3-6 months) before investing or extra debt payoff. Cash buffer prevents the next emergency from undoing all this work.</div>
    </Card>
  </div>);
}

// ============================================================
// TAX OPTIMIZER — Roth vs Traditional + contribution waterfall + asset location
// ============================================================
function TaxOptimizer({ jargonFree: jf, locale }) {
  const [data, setData] = useState({ income: 100000, age: 30, hasMatch: true, matchPct: 6, has401k: true, hsaEligible: true, taxBracketNow: 24, taxBracketRetire: 22 });
  const u = (k) => (v) => setData(p => ({ ...p, [k]: v }));
  const rothBetter = data.taxBracketRetire > data.taxBracketNow;
  const matchAmount = data.hasMatch ? data.income * data.matchPct / 100 : 0;
  const waterfall = [];
  if (data.hsaEligible) waterfall.push({ priority: 1, name: "HSA", amount: 4400, reason: "Triple tax-advantaged: deductible going in, grows tax-free, withdrawals for medical are tax-free. The single best account." });
  if (data.hasMatch) waterfall.push({ priority: 2, name: `401(k) up to ${data.matchPct}% match`, amount: matchAmount, reason: "100% instant return on the matched portion. Never leave employer match on the table." });
  waterfall.push({ priority: 3, name: rothBetter ? "Roth IRA" : "Traditional IRA", amount: 7500, reason: rothBetter ? `Higher taxes expected in retirement (${data.taxBracketRetire}% > ${data.taxBracketNow}%) — pay tax now, withdraw tax-free.` : `Lower taxes expected in retirement (${data.taxBracketRetire}% < ${data.taxBracketNow}%) — defer tax now at the higher rate.` });
  waterfall.push({ priority: 4, name: "Max remaining 401(k)", amount: Math.max(24500 - matchAmount, 0), reason: "Fill out the 401(k) cap. Reduces taxable income today by your full marginal rate." });
  waterfall.push({ priority: 5, name: "Taxable brokerage", amount: null, reason: "After tax-advantaged accounts are full, invest taxable. Use broad index ETFs + tax-loss harvesting at year-end." });
  return (<div className="max-w-5xl mx-auto p-8">
    <Title tier="Investing" sub="Where to put each dollar for maximum after-tax wealth">Tax Optimizer</Title>
    <AdviceNote kind="tax" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <Card><h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-3">Your situation</h3>
        <F label="Annual income" value={data.income} onChange={u("income")} prefix={LOCALES[locale]?.currency || "$"} />
        <F label={jf ? "Current tax rate" : "Current marginal tax bracket"} value={data.taxBracketNow} onChange={u("taxBracketNow")} suffix="%" info="Federal + state combined marginal rate" />
        <F label={jf ? "Expected tax rate in retirement" : "Retirement marginal tax bracket"} value={data.taxBracketRetire} onChange={u("taxBracketRetire")} suffix="%" />
        <F label={jf ? "Employer match %" : "401(k) employer match"} value={data.matchPct} onChange={u("matchPct")} suffix="%" info="Common is 50% match up to 6% of salary" />
      </Card>
      <Card className={rothBetter ? "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30" : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30"}>
        <h3 className="text-sm font-bold mb-2">{rothBetter ? "🎯 Use Roth" : "🎯 Use Traditional"}</h3>
        <p className="text-sm text-slate-700 dark:text-[#dde3ec] mb-2">{rothBetter ? `Retirement bracket (${data.taxBracketRetire}%) > today's (${data.taxBracketNow}%). Pay tax now at the lower rate.` : `Retirement bracket (${data.taxBracketRetire}%) < today's (${data.taxBracketNow}%). Defer tax now at the higher rate.`}</p>
        <WhyMatters text="Roth-vs-Traditional is the biggest after-tax wealth lever most people get to make. $7k/yr for 30 years can mean $50k+ difference depending on which bucket you pick." />
      </Card>
    </div>
    <Card className="bg-gradient-to-br from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/10 border-indigo-200 dark:border-indigo-500/30 mb-4"><h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">💰 Contribution Waterfall — fund in this order, every year</h3>
      {waterfall.map((w, i) => (<div key={i} className="flex items-start gap-3 mb-3 last:mb-0 p-3 bg-white dark:bg-[#1c1f26] rounded-lg">
        <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm">{w.priority}</span>
        <div className="flex-1"><div className="flex items-center justify-between mb-0.5"><div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{w.name}</div>{w.amount !== null && <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{$(w.amount)}/year</div>}</div><div className="text-xs text-slate-500 dark:text-[#a3acba]">{w.reason}</div></div>
      </div>))}
    </Card>
    <Card><h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-3">🗺️ Asset Location — where to hold each asset class</h3>
      <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-slate-50 dark:bg-[#15171c] text-slate-500 dark:text-[#a3acba]"><th className="text-left py-1.5 px-2">Asset</th><th className="text-left py-1.5 px-2">Best Account</th><th className="text-left py-1.5 px-2">Why</th></tr></thead><tbody>
        <tr className="border-t border-slate-100 dark:border-[#262b33]"><td className="py-1.5 px-2 font-semibold">Bonds / Bond ETFs</td><td className="py-1.5 px-2">Traditional 401(k)/IRA</td><td className="py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Interest is taxed as ordinary income — shelter it</td></tr>
        <tr className="border-t border-slate-100 dark:border-[#262b33]"><td className="py-1.5 px-2 font-semibold">REITs</td><td className="py-1.5 px-2">Traditional 401(k)/IRA</td><td className="py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Non-qualified dividends taxed as ordinary income</td></tr>
        <tr className="border-t border-slate-100 dark:border-[#262b33]"><td className="py-1.5 px-2 font-semibold">US stocks (broad index)</td><td className="py-1.5 px-2">Roth IRA or Taxable</td><td className="py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">LTCG rate already low; Roth gives tax-free compounding</td></tr>
        <tr className="border-t border-slate-100 dark:border-[#262b33]"><td className="py-1.5 px-2 font-semibold">International stocks</td><td className="py-1.5 px-2">Taxable</td><td className="py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Foreign tax credit only works in taxable accounts</td></tr>
        <tr className="border-t border-slate-100 dark:border-[#262b33]"><td className="py-1.5 px-2 font-semibold">Crypto / high-vol</td><td className="py-1.5 px-2">Roth IRA (if possible)</td><td className="py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Big upside ⇒ tax-free Roth = ideal location</td></tr>
        <tr className="border-t border-slate-100 dark:border-[#262b33]"><td className="py-1.5 px-2 font-semibold">Cash / HYSA</td><td className="py-1.5 px-2">Any (priority: emergency fund)</td><td className="py-1.5 px-2 text-slate-500 dark:text-[#a3acba]">Use HYSA at 4-5% APY — interest is taxable as ordinary income</td></tr>
      </tbody></table></div>
      <WhyMatters text="Asset location adds ~30-50 basis points per year for a serious portfolio — that compounds to hundreds of thousands over a career. Vanguard's research confirms it's the second-most-valuable tax move after tax-loss harvesting." />
    </Card>
    <Assumptions items={[
      { formula: "Roth vs Traditional = retirement bracket > current bracket", what: "Roth wins if you expect to be in a HIGHER tax bracket in retirement than today. Traditional wins if you expect to be in a LOWER bracket. We assume you can estimate your retirement bracket within 5 percentage points.", assumptions: ["Tax rates and bracket thresholds may change between now and your retirement — Congress adjusts these regularly", "Your retirement income mix (other taxable income, RMDs, Social Security taxation) is not modeled in this simple comparison", "State income tax can shift the answer materially if you plan to relocate"], source: "Standard tax planning heuristic; see IRS Pub 590-A for current contribution limits." },
      { formula: "Contribution waterfall ranks by after-tax expected return", what: "HSA (#1) gets triple tax-advantage (deductible, tax-free growth, tax-free medical withdrawals). 401(k) match (#2) is a 100% instant return on the matched portion. IRA (#3) is the next tax-advantaged dollar. Remaining 401(k) (#4) fills the cap. Taxable (#5) is the last resort.", assumptions: ["You're HSA-eligible (high-deductible health plan required)", "Employer match is dollar-for-dollar up to your stated percentage — adjust if yours is 50% match", "2026 contribution limits used (under age 50): HSA self-only $4,400, IRA $7,500, 401(k) $24,500. Age-50+ catch-ups add roughly +$1,000 HSA (55+), +$1,100 IRA, +$8,000 401(k). Limits change annually with inflation — verify current-year figures at irs.gov."], source: "Bogleheads investment priority chart; consult a CPA for your specific situation." },
      { formula: "Asset location based on tax efficiency of each asset class", what: "Bonds and REITs generate ordinary-income taxable distributions, so we shelter them in tax-deferred accounts. Stocks get favorable LTCG treatment in taxable; foreign stocks need taxable to claim the foreign tax credit. High-upside assets (crypto, growth stocks) ideally sit in Roth.", assumptions: ["You have enough assets that location actually matters (under ~$100k, it's negligible)", "Current tax law continues — qualified dividend treatment and the foreign tax credit are both at congressional risk", "You can actually hold the right assets in the right accounts (some 401(k)s have limited fund choices)"], source: "Vanguard \"Putting a Value on Your Value\" research (2014) — asset location worth ~30bp/yr." },
    ]} />
  </div>);
}

// ============================================================
// MONTE CARLO RETIREMENT — 10,000-sim probability fan chart
// ============================================================
function MonteCarloRetirement({ jargonFree: jf }) {
  const [d, setD] = useState({ currentBalance: 80000, monthlyContrib: 500, years: 30, expReturn: 7, stdDev: 15, withdrawalPerMonth: 4000 });
  const u = (k) => (v) => setD(p => ({ ...p, [k]: v }));
  const sims = useMemo(() => {
    const N = 10000;
    const months = Math.max(0, Math.round(d.years * 12));
    const monthlyMean = d.expReturn / 100 / 12;
    const monthlyStd = (d.stdDev / 100) / Math.sqrt(12);
    const finals = [];
    for (let n = 0; n < N; n++) {
      let bal = d.currentBalance;
      for (let m = 0; m < months; m++) {
        const u1 = Math.random() || 1e-9, u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const r = monthlyMean + monthlyStd * z;
        bal = bal * (1 + r) + d.monthlyContrib;
      }
      finals.push(Math.max(bal, 0));
    }
    finals.sort((a, b) => a - b);
    return { p10: finals[Math.floor(N * 0.10)], p25: finals[Math.floor(N * 0.25)], p50: finals[Math.floor(N * 0.50)], p75: finals[Math.floor(N * 0.75)], p90: finals[Math.floor(N * 0.90)] };
  }, [d.currentBalance, d.monthlyContrib, d.years, d.expReturn, d.stdDev]);
  const yearsCovered = (bal) => { let b = bal; let yrs = 0; while (b > 0 && yrs < 100) { for (let m = 0; m < 12; m++) { b = b * (1 + d.expReturn / 100 / 12) - d.withdrawalPerMonth; if (b <= 0) break; } yrs++; } return yrs; };
  const max = sims.p90;
  const widthOf = (v) => max > 0 ? Math.max(8, (v / max) * 100) : 0;
  return (<div className="max-w-5xl mx-auto p-8">
    <Title tier="My Money" sub="10,000 simulations showing the full distribution of outcomes — not just one path">Monte Carlo Retirement</Title>
    <div className="mb-3"><ConfidenceLabel level="estimate" note="Real returns vary year to year. Single-path projections show one outcome and lie about precision; Monte Carlo shows the realistic range — including the bad scenarios you need to plan for." /></div>
    <div className="mb-4 p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"><span aria-hidden="true">⚠</span><span>Probability estimates, not guarantees. Even a "good" outcome can fail if a market crash hits early in retirement. Educational only — not financial advice.</span></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <Card>
        <F label={jf ? "What you have today" : "Current balance"} value={d.currentBalance} onChange={u("currentBalance")} prefix="$" />
        <F label={jf ? "Adding each month" : "Monthly contribution"} value={d.monthlyContrib} onChange={u("monthlyContrib")} prefix="$" />
        <F label={jf ? "Years until retirement" : "Years to retirement"} value={d.years} onChange={u("years")} suffix="years" />
        <F label={jf ? "Expected return per year" : "Expected annual return"} value={d.expReturn} onChange={u("expReturn")} suffix="%" info="Stock market historical ~7-10% real" />
        <F label={jf ? "How bumpy returns are" : "Annual volatility (std dev)"} value={d.stdDev} onChange={u("stdDev")} suffix="%" info="S&P 500 historical ~15-20%" />
      </Card>
      <Card className="bg-gradient-to-br from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/10 border-indigo-200 dark:border-indigo-500/30">
        <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-3">After 10,000 simulations</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><span className="text-xs w-24 text-red-700 dark:text-red-300">Worst 10%</span><div className="flex-1 h-2 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className="h-full bg-red-400" style={{ width: `${widthOf(sims.p10)}%` }} /></div><span className="text-sm font-bold text-red-700 dark:text-red-300 w-28 text-right">{$(sims.p10)}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs w-24 text-amber-700 dark:text-amber-200">25th %ile</span><div className="flex-1 h-2 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: `${widthOf(sims.p25)}%` }} /></div><span className="text-sm font-bold text-amber-700 dark:text-amber-200 w-28 text-right">{$(sims.p25)}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs w-24 text-emerald-700 dark:text-emerald-300 font-bold">Median (50th)</span><div className="flex-1 h-3 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${widthOf(sims.p50)}%` }} /></div><span className="text-base font-bold text-emerald-700 dark:text-emerald-300 w-28 text-right">{$(sims.p50)}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs w-24 text-emerald-700 dark:text-emerald-300">75th %ile</span><div className="flex-1 h-2 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${widthOf(sims.p75)}%` }} /></div><span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 w-28 text-right">{$(sims.p75)}</span></div>
          <div className="flex items-center gap-2"><span className="text-xs w-24 text-emerald-700 dark:text-emerald-300">Best 10%</span><div className="flex-1 h-2 bg-slate-100 dark:bg-[#232730] rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${widthOf(sims.p90)}%` }} /></div><span className="text-sm font-bold text-emerald-700 dark:text-emerald-300 w-28 text-right">{$(sims.p90)}</span></div>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a3acba] mt-3">Plan around the 25th percentile — it's the realistic "things didn't go great" case. Don't anchor on the median.</p>
      </Card>
    </div>
    <Card><h3 className="text-sm font-bold text-slate-700 dark:text-[#dde3ec] mb-3">Withdrawal stress test — how long does the money last?</h3>
      <F label={jf ? "How much you'll spend each month in retirement" : "Monthly withdrawal target"} value={d.withdrawalPerMonth} onChange={u("withdrawalPerMonth")} prefix="$" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30"><div className="text-xs text-red-500 font-semibold">Worst 10% scenario lasts</div><div className="text-xl font-bold text-red-700 dark:text-red-300">{yearsCovered(sims.p10)} years</div></div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30"><div className="text-xs text-emerald-500 font-semibold">Median scenario lasts</div><div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{yearsCovered(sims.p50)} years</div></div>
        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-200 dark:border-emerald-500/30"><div className="text-xs text-emerald-500 font-semibold">Best 10% scenario lasts</div><div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{yearsCovered(sims.p90) >= 100 ? "100+" : yearsCovered(sims.p90)} years</div></div>
      </div>
      <WhyMatters text="The Trinity study found a 4% annual withdrawal rate works for 30 years 95% of the time. Higher withdrawals or worse sequence-of-returns risk shrink that. Most failures happen because the first 5 years of retirement coincide with a bear market — Monte Carlo shows you the probability." />
    </Card>
    <Assumptions items={[
      { formula: "Geometric Brownian Motion via Box-Muller normal sampling", what: "We simulate 5,000 independent paths of monthly returns. Each month's return is drawn from a normal distribution with mean = your expected annual return / 12, std dev = your annual volatility / √12.", assumptions: ["Returns are independent month-to-month (no momentum or mean reversion modeling)", "Volatility is constant (real markets have volatility clustering)", "Contributions arrive at end of month with no inflation adjustment", "No taxes or fees applied during accumulation phase"], source: "Standard Monte Carlo methodology used by Vanguard, Fidelity, and most professional planning software." },
      { formula: "Withdrawal years = balance × (1+r/12)^12 / withdrawal - until depleted", what: "We project each percentile balance forward at your assumed return rate, subtracting your monthly withdrawal. Loop ends when balance hits zero or 100 years pass.", assumptions: ["Withdrawal stays constant in real dollars (no inflation adjustment shown)", "Return during retirement equals the accumulation-phase return (real retirees usually de-risk and accept lower returns)", "No social security, pension, or other income offsets"], source: "Trinity study (1998) used a similar framework but assumed historical returns instead of Monte Carlo sampling." },
      { formula: "Confidence label ±25%", what: "Single retirement projections lie about precision. Even a careful Monte Carlo only narrows uncertainty; it doesn't eliminate it. Real life adds unpredictable shocks (job loss, health, divorce, inheritance) that no model captures.", assumptions: ["The historical risk premium continues to hold (not guaranteed)", "Your income, savings rate, and lifestyle stay roughly stable over the projection window"] },
    ]} />
  </div>);
}

// ============================================================
// LIFE EVENTS SIMULATOR — preset scenarios with concrete impact
// ============================================================
function LifeEvents({ jargonFree: jf, onNav }) {
  const [selected, setSelected] = useState(null);
  const events = [
    { id: "house", emoji: "🏠", title: "Buy a House", desc: "Down payment + closing + new monthly mortgage",
      impacts: [{ type: "asset", label: "House equity (initial)", amount: 80000, note: "20% down on $400k home" }, { type: "liability", label: "Mortgage", amount: -320000, note: "80% loan-to-value at current rates" }, { type: "monthly", label: "Mortgage + tax + insurance", amount: -2800, note: "Replaces rent — net change depends on current rent" }],
      advice: "Don't buy until you have 3-6 months emergency fund AFTER closing costs. Closing eats 3-5% of home price. Rule of thumb: total housing cost ≤ 28% of gross income." },
    { id: "kid", emoji: "👶", title: "Have a Kid", desc: "Birth costs, childcare, college savings, expanded household",
      impacts: [{ type: "monthly", label: "Daycare / childcare", amount: -1800, note: "US median; LA/SF can be $2,500+/mo" }, { type: "monthly", label: "Diapers + food + clothes", amount: -400, note: "First 2 years; declines after" }, { type: "monthly", label: "529 college savings", amount: -300, note: "To target ~$100k by age 18" }, { type: "asset", label: "529 plan balance (starts)", amount: 0, note: "Starts at zero, grows with contributions" }],
      advice: "Max your 401(k) match before starting the 529. Kid's college can be loaned; your retirement cannot. Look into state-tax-deductible 529 plans in your state first." },
    { id: "divorce", emoji: "💔", title: "Divorce", desc: "Asset split + legal fees + lifestyle reset",
      impacts: [{ type: "asset", label: "Share of joint assets (50%)", amount: -150000, note: "Net assets divided per state law" }, { type: "monthly", label: "Legal fees", amount: -800, note: "Typically 6-18 months of fees" }, { type: "monthly", label: "Two-household premium", amount: -1500, note: "Rent + utilities × 2 vs shared" }],
      advice: "Pull credit reports before mediation starts. Inventory everything including crypto, RSUs, deferred comp. Hire a financial neutral if assets are complex — cheaper than dueling lawyers." },
    { id: "rsu", emoji: "📊", title: "RSU Cliff Vests", desc: "Big tax bill + concentration risk + lifestyle creep risk",
      impacts: [{ type: "asset", label: "Vested RSU (gross)", amount: 200000, note: "Before tax" }, { type: "monthly", label: "April tax surprise", amount: -5000, note: "RSU withholding is often 22%; your bracket may be higher" }, { type: "asset", label: "After-tax cash if you sell", amount: 130000, note: "After ~35% combined fed+state+payroll" }],
      advice: "Sell vested shares immediately by default — concentration risk is huge. Set aside ~10% extra for the April surprise. Diversify into broad index funds before 'just hold and hope.'" },
    { id: "inheritance", emoji: "💰", title: "Inheritance", desc: "Often $50k-$500k; the windfall problem",
      impacts: [{ type: "asset", label: "Cash inheritance", amount: 250000, note: "A sizable inheritance — US median is closer to ~$70k; trusts run higher" }, { type: "monthly", label: "Investment growth (~7% annualized)", amount: 1400, note: "On $250k at 7% if invested" }],
      advice: "Park in HYSA for 6-12 months while you think. Pay off high-interest debt. Max retirement accounts. Avoid lifestyle creep — most lottery winners are broke within 5 years. The 'do nothing' year is your best friend." },
    { id: "joblos", emoji: "🚫", title: "Lose Your Job", desc: "Severance + COBRA + emergency fund burn rate",
      impacts: [{ type: "monthly", label: "Lost income", amount: -6500, note: "Until next role; tech reskilling avg 3-6 months" }, { type: "monthly", label: "COBRA health insurance", amount: -1200, note: "Avg US family premium w/o employer subsidy" }, { type: "asset", label: "Severance (if any)", amount: 25000, note: "Common 1-2 weeks per year of tenure" }],
      advice: "File unemployment immediately. Cut all discretionary spending. Pause 401(k) contributions if needed but DON'T withdraw — penalties + tax bracket hit hurt for years. Negotiate severance — most people don't and leave $5-50k on the table." },
  ];
  return (<div className="max-w-5xl mx-auto p-8">
    <Title tier="Protection" sub="See the financial impact before the event arrives — plan for the inflection points">Life Events Simulator</Title>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
      {events.map(e => (<button key={e.id} onClick={() => setSelected(e)} className={`p-4 rounded-xl border-2 text-left transition-all ${selected?.id === e.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-md" : "border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26] hover:border-indigo-300"}`}>
        <div className="text-2xl mb-1">{e.emoji}</div>
        <div className="text-sm font-bold text-slate-800 dark:text-[#eef1f6]">{e.title}</div>
        <p className="text-xs text-slate-500 dark:text-[#a3acba] mt-1">{e.desc}</p>
      </button>))}
    </div>
    {selected && (<Card className="bg-gradient-to-br from-indigo-50 dark:from-indigo-500/10 to-purple-50 dark:to-purple-500/10 border-indigo-200 dark:border-indigo-500/30">
      <div className="flex items-center gap-2 mb-3"><span className="text-2xl">{selected.emoji}</span><h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">If you {selected.title.toLowerCase()}...</h3></div>
      <div className="bg-white dark:bg-[#1c1f26] rounded-lg overflow-hidden mb-4">
        <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-slate-50 dark:bg-[#15171c] text-slate-500 dark:text-[#a3acba]"><th className="text-left p-2">Impact</th><th className="text-right p-2">Amount</th><th className="text-left p-2">Note</th></tr></thead><tbody>
          {selected.impacts.map((i, idx) => (<tr key={idx} className="border-t border-slate-100 dark:border-[#262b33]"><td className="p-2 font-semibold">{i.type === "asset" ? "📈 " : i.type === "liability" ? "📉 " : "💸 "}{i.label}</td><td className={`p-2 text-right font-bold ${i.amount >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-300"}`}>{i.amount >= 0 ? "+" : ""}{$(i.amount)}{i.type === "monthly" ? "/mo" : ""}</td><td className="p-2 text-slate-500 dark:text-[#a3acba]">{i.note}</td></tr>))}
        </tbody></table></div>
      </div>
      <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border-l-2 border-amber-400 rounded text-xs text-amber-900 dark:text-amber-200"><span className="font-bold">📝 Strategy:</span> {selected.advice}</div>
    </Card>)}
  </div>);
}

// ============================================================
// MAIN APP
// ============================================================
const MODULES = [
  { id: "home", label: "Home", icon: "⌂", tier: "Home" },
  { id: "guide", label: "Guided Journeys", icon: "G", tier: "Start Here" },
  { id: "quick", label: "Quick Tools", icon: "Q", tier: "My Money" },
  { id: "personal", label: "Personal Finance", icon: "P", tier: "My Money" },
  { id: "loans", label: "Loans & Debt", icon: "L", tier: "My Money" },
  { id: "cashflow", label: "Cash Flow", icon: "$", tier: "My Money" },
  { id: "goals", label: "My Goals", icon: "★", tier: "My Money" },
  { id: "marketwatch", label: "Market Watch", icon: "◎", tier: "Investing" },
  { id: "portfolio", label: "Portfolio", icon: "F", tier: "Investing" },
  { id: "investments", label: "Investments", icon: "I", tier: "Investing" },
  { id: "marketlab", label: "Charts & Signals", icon: "M", tier: "Investing" },
  { id: "options", label: "Options Trading", icon: "O", tier: "Investing" },
  { id: "tax", label: "Tax Calculator", icon: "T", tier: "Investing" },
  { id: "market", label: "Market Overview", icon: "K", tier: "Market Intel" },
  { id: "business", label: "My Business", icon: "B", tier: "My Business" },
  { id: "breakeven", label: "Break-Even Point", icon: "E", tier: "My Business" },
  { id: "whatif", label: "What-If Scenarios", icon: "W", tier: "My Business" },
  { id: "valuation", label: "Business Value", icon: "V", tier: "My Business" },
  { id: "capbudget", label: "Big Decisions", icon: "C", tier: "My Business" },
  { id: "priority", label: "Goal Priority", icon: "★", tier: "My Money" },
  { id: "montecarlo", label: "Monte Carlo Retire", icon: "%", tier: "My Money" },
  { id: "taxopt", label: "Tax Optimizer", icon: "T", tier: "Investing" },
  { id: "stresstest", label: "Stress Test", icon: "S", tier: "Protection" },
  { id: "lifeevents", label: "Life Events", icon: "L", tier: "Protection" },
  { id: "snapshots", label: "Snapshot History", icon: "📸", tier: "Protection" },
  { id: "journal", label: "My Decisions", icon: "J", tier: "Protection" },
  { id: "riskprofile", label: "My Risk Profile", icon: "R", tier: "About Me" },
];

// Default tiers shown by knowledge bucket (Round 2 #8)
function defaultVisibleTiers(knowledge, focus) {
  const tiers = new Set(["Home", "About Me"]);
  if (knowledge >= 0) tiers.add("My Money");
  if (knowledge >= 30) { tiers.add("Investing"); tiers.add("Protection"); }
  if (knowledge >= 60) { tiers.add("Market Intel"); tiers.add("My Business"); tiers.add("Start Here"); }
  const fmap = { Budgeting: ["My Money"], Saving: ["My Money"], Investing: ["Investing", "Market Intel"], Business: ["My Business"], Trading: ["Investing", "Protection"], Taxes: ["Investing"], Debt: ["My Money"] };
  (focus || []).forEach(f => (fmap[f] || []).forEach(t => tiers.add(t)));
  return tiers;
}

// Manage Modules overlay (Round 2 #8)
function ManageModulesPanel({ allTiers, visibleTiers, onToggle, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={onClose} onKeyDown={e => e.key === "Escape" && onClose()}>
      <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1c1f26] rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-[#eef1f6]">Manage Modules</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-500 dark:text-[#a3acba] hover:text-slate-700 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">✕</button>
        </div>
        <p className="text-xs text-slate-500 dark:text-[#a3acba] mb-4">Show or hide entire tiers to keep the sidebar focused on what matters to you.</p>
        <div className="space-y-2">
          {allTiers.map(t => { const th = tierTheme(t); const on = visibleTiers.has(t); return (
            <button key={t} onClick={() => onToggle(t)} className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${on ? `${th.border} ${th.soft}` : "border-slate-200 dark:border-[#323844] bg-white dark:bg-[#1c1f26]"}`}>
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${th.dot}`} />
                <span className="text-sm font-semibold text-slate-700 dark:text-[#dde3ec]">{t}</span>
              </div>
              <span className={`text-xs font-bold ${on ? th.text : "text-slate-400 dark:text-[#828b9a]"}`}>{on ? "VISIBLE" : "HIDDEN"}</span>
            </button>
          ); })}
        </div>
      </div>
    </div>
  );
}

// Engagement-based health score (Round 2 #10).
// FUTURE: replace with secured API-driven score (SOC 2 Type 2 endpoints) once backend is wired.
function computeHealthScore(engagement) {
  let s = 0;
  const v = engagement.visited || {};
  if (v.personal) s += 10;
  if (engagement.goalsSet >= 1) s += 10;
  if (engagement.riskProfileDone) s += 15;
  if (engagement.emergencyMonths >= 3) s += 10;
  if (engagement.cashflowPositive) s += 10;
  if (engagement.hhi !== null && engagement.hhi !== undefined && engagement.hhi < 2500) s += 10;
  if (engagement.stressScore >= 60) s += 10;
  if (engagement.decisions >= 2) s += 5;
  // 20 remaining points: 1 per unique module visited
  s += Math.min(Object.keys(v).length, 20);
  return Math.min(s, 100);
}

const BREADCRUMBS = {
  home: ["Home"],
  guide: ["Start Here", "Guided Journeys"],
  quick: ["My Money", "Quick Tools"],
  personal: ["My Money", "Personal Finance"],
  loans: ["My Money", "Loans & Debt"],
  cashflow: ["My Money", "Cash Flow"],
  goals: ["My Money", "My Goals"],
  marketwatch: ["Investing", "Market Watch"],
  portfolio: ["Investing", "Portfolio"],
  investments: ["Investing", "Investments"],
  marketlab: ["Investing", "Charts & Signals"],
  options: ["Investing", "Options Trading"],
  tax: ["Investing", "Tax Calculator"],
  market: ["Market Intel", "Market Overview"],
  business: ["My Business", "My Business"],
  breakeven: ["My Business", "Break-Even Point"],
  whatif: ["My Business", "What-If Scenarios"],
  valuation: ["My Business", "Business Value"],
  capbudget: ["My Business", "Big Decisions"],
  stresstest: ["Protection", "Stress Test"],
  journal: ["Protection", "My Decisions"],
  riskprofile: ["About Me", "My Risk Profile"],
  priority: ["My Money", "Goal Priority"],
  montecarlo: ["My Money", "Monte Carlo Retire"],
  taxopt: ["Investing", "Tax Optimizer"],
  lifeevents: ["Protection", "Life Events"],
  snapshots: ["Protection", "Snapshot History"],
};

function Vantage() {
  const [boarded, setBoarded] = useState(false);
  const [active, setActive] = useState("home");
  const [jargon, setJargon] = useState(true); // Plain English ON by default — beginners win, pros flip off.
  const [riskProfile, setRiskProfile] = useState(null);
  const [journey, setJourney] = useState(null);
  const [journeyStepIndex, setJourneyStepIndex] = useState(0);
  const [prefs, setPrefs] = useState({ knowledge: 50, focus: [], hiddenTiers: [], extraTiers: [], intent: null });
  const [collapsedTiers, setCollapsedTiers] = useState({});
  const [engagement, setEngagement] = useState({ visited: {}, decisions: 0, goalsSet: 0, riskProfileDone: false, emergencyMonths: 0, cashflowPositive: false, hhi: null, stressScore: 0 });
  const [manageOpen, setManageOpen] = useState(false);
  const [celebration, setCelebration] = useState({ show: false, message: "", tone: "emerald", key: 0 });
  const [lastHealthBucket, setLastHealthBucket] = useState(0);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [toured, setToured] = useState({});
  const dismissTour = (id) => setToured(t => ({ ...t, [id]: true }));
  const [customCategories, setCustomCategories] = useState(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const applyCustomCategories = (cats) => { setCustomCategories(cats); };
  // Snapshots — in-memory until SOC 2 backend persists them.
  // FUTURE: replace setSnapshots with backend POST /snapshots
  const [snapshots, setSnapshots] = useState([]);
  const saveSnapshot = (data) => setSnapshots(s => [...s, { id: Date.now(), ts: new Date().toISOString().slice(0, 10), ...data }]);
  // Locale — currency + benchmarks per region.
  const [locale, setLocale] = useState("US");
  const [coupled, setCoupled] = useState(false);
  // Backend-required UI stubs
  const [plaidOpen, setPlaidOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);  // Mobile sidebar open/closed
  const [legalOpen, setLegalOpen] = useState(null);  // "terms" | "privacy" | "disclaimer" | null

  const handleJourneySelect = (j) => {
    setJourney(j);
    setJourneyStepIndex(0);
    setActive(j.steps[0].moduleId);
    bumpVisit(j.steps[0].moduleId);
  };

  const handleNextJourneyStep = () => {
    if (journey && journeyStepIndex < journey.steps.length - 1) {
      const nextStepIndex = journeyStepIndex + 1;
      setJourneyStepIndex(nextStepIndex);
      const nextStep = journey.steps[nextStepIndex];
      setActive(nextStep.moduleId);
      bumpVisit(nextStep.moduleId);
    } else {
      setJourney(null);
    }
  };

  const riskLabel = useMemo(() => {
    if (!riskProfile) return null;
    let s = 0;
    if (riskProfile.age === "20s") s += 18; else if (riskProfile.age === "30s") s += 15; else if (riskProfile.age === "40s") s += 12; else if (riskProfile.age === "50s") s += 7; else s += 3;
    if (riskProfile.goal === "aggressive") s += 18; else if (riskProfile.goal === "growth") s += 14; else if (riskProfile.goal === "balanced") s += 10; else if (riskProfile.goal === "income") s += 6; else s += 3;
    if (riskProfile.horizon === "long") s += 16; else if (riskProfile.horizon === "medium") s += 10; else s += 4;
    if (riskProfile.dropReaction === "buy") s += 18; else if (riskProfile.dropReaction === "hold") s += 12; else if (riskProfile.dropReaction === "worry") s += 6; else s += 2;
    if (riskProfile.incomeStability === "very") s += 10; else if (riskProfile.incomeStability === "stable") s += 8; else if (riskProfile.incomeStability === "variable") s += 5; else s += 2;
    if (riskProfile.experience === "expert") s += 12; else if (riskProfile.experience === "intermediate") s += 8; else if (riskProfile.experience === "beginner") s += 4; else s += 1;
    s += Math.min((riskProfile.lossComfort || 20) / 5, 8);
    s = Math.min(Math.round(s), 100);
    return s >= 75 ? "aggressive" : s >= 55 ? "growth" : s >= 35 ? "balanced" : "conservative";
  }, [riskProfile]);

  const healthScore = useMemo(() => computeHealthScore(engagement), [engagement]);

  const fireCelebration = (message, tone = "emerald") => {
    setCelebration(c => ({ show: true, message, tone, key: c.key + 1 }));
    // Auto-hide via state mutation on next interaction. Without useEffect we can't auto-clear on a timer;
    // celebration stays visible until user clicks anywhere via the overlay below.
  };

  const bumpVisit = (id) => {
    setEngagement(e => {
      const next = { ...e, visited: { ...e.visited, [id]: (e.visited[id] || 0) + 1 } };
      const newScore = computeHealthScore(next);
      if (newScore >= 50 && lastHealthBucket < 50) {
        setLastHealthBucket(50);
        fireCelebration("Halfway there! You're building a strong financial foundation", "indigo");
      }
      return next;
    });
  };

  const nav = (id) => {
    setActive(id);
    setJourney(null);
    bumpVisit(id);
    setSidebarOpen(false);  // Close mobile sidebar after picking
  };

  // Tiers visible in sidebar
  const allTiers = ["Home", "Start Here", "My Money", "Investing", "Market Intel", "My Business", "Protection", "About Me"];
  const visibleTiers = useMemo(() => {
    const base = defaultVisibleTiers(prefs.knowledge, prefs.focus);
    (prefs.extraTiers || []).forEach(t => base.add(t));
    (prefs.hiddenTiers || []).forEach(t => base.delete(t));
    return base;
  }, [prefs]);
  const toggleTierVisibility = (t) => {
    // If we're about to HIDE the tier that contains the current module, return Home so it can't get orphaned.
    const activeMod = MODULES.find(m => m.id === active);
    if (activeMod && activeMod.tier === t && visibleTiers.has(t)) setActive("home");
    setPrefs(p => {
      const inBase = defaultVisibleTiers(p.knowledge, p.focus).has(t);
      const hiddenSet = new Set(p.hiddenTiers || []);
      const extraSet = new Set(p.extraTiers || []);
      if (inBase) {
        if (hiddenSet.has(t)) hiddenSet.delete(t); else hiddenSet.add(t);
      } else {
        if (extraSet.has(t)) extraSet.delete(t); else extraSet.add(t);
      }
      return { ...p, hiddenTiers: [...hiddenSet], extraTiers: [...extraSet] };
    });
  };

  if (!boarded) return (<><Onboarding onLegalOpen={setLegalOpen} onComplete={(p) => {
    setPrefs(pp => ({ ...pp, ...p, hiddenTiers: pp.hiddenTiers || [], extraTiers: pp.extraTiers || [] }));
    if (p.knowledge !== undefined && p.knowledge < 30) setJargon(true);
    if (p.customCategories) setCustomCategories(p.customCategories);
    setActive(p.route || "home");
    setBoarded(true);
    if (p.route && p.route !== "home") bumpVisit(p.route);
  }} /><LegalModal which={legalOpen} onClose={() => setLegalOpen(null)} /></>);

  const visibleModules = MODULES.filter(m => visibleTiers.has(m.tier));
  const crumb = BREADCRUMBS[active] || [active];
  const activeTier = (MODULES.find(m => m.id === active) || {}).tier || "Home";
  const activeTh = tierTheme(activeTier);

  // Build sidebar grouped by tier with collapse
  const tierGroups = {};
  visibleModules.forEach(m => { (tierGroups[m.tier] = tierGroups[m.tier] || []).push(m); });
  const orderedTiers = allTiers.filter(t => tierGroups[t]);

  // Module-specific celebration callbacks
  const onGoalReached = () => fireCelebration("Goal reached! 🎉 Keep stacking wins", "emerald");
  const onStressStrong = (score) => { setEngagement(e => ({ ...e, stressScore: Math.max(e.stressScore, score) })); if (score > 80) fireCelebration("You're financially resilient!", "emerald"); };
  const onDecisionLogged = () => { setEngagement(e => { const nd = e.decisions + 1; if (nd === 1) fireCelebration("Great start! Tracking decisions helps you learn", "indigo"); return { ...e, decisions: nd }; }); };
  const onGoalAdded = () => setEngagement(e => ({ ...e, goalsSet: e.goalsSet + 1 }));
  const onRiskSaved = () => setEngagement(e => ({ ...e, riskProfileDone: true }));

  return (
    <div className={`flex h-screen font-sans ${"bg-slate-50 dark:bg-[#15171c]"}`}>
      <Celebrate key={celebration.key} show={celebration.show} message={celebration.message} tone={celebration.tone} />
      {celebration.show && <div className="fixed inset-0 z-30" onClick={() => setCelebration(c => ({ ...c, show: false }))} />}
      {manageOpen && <ManageModulesPanel allTiers={allTiers} visibleTiers={visibleTiers} onToggle={toggleTierVisibility} onClose={() => setManageOpen(false)} />}
      <GlossarySearch open={glossaryOpen} onClose={() => setGlossaryOpen(false)} onNav={nav} />
      <CustomizePanel key={customizeOpen ? "cust-open" : "cust-closed"} open={customizeOpen} onClose={() => setCustomizeOpen(false)} onApply={applyCustomCategories} currentLabel={customCategories?.label} />
      <PlaidStub open={plaidOpen} onClose={() => setPlaidOpen(false)} />
      <ReminderStub key={reminderOpen ? "rem-open" : "rem-closed"} open={reminderOpen} onClose={() => setReminderOpen(false)} />
      <LegalModal which={legalOpen} onClose={() => setLegalOpen(null)} />

      {sidebarOpen && <div className="md:hidden fixed inset-0 z-30 bg-slate-900/60" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-56 bg-slate-900 flex flex-col py-4 px-2.5 shrink-0 transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="px-2 mb-3">
          <h1 className="text-white text-xl font-bold tracking-tight">Vantage</h1>
          <p className="text-indigo-400 text-xs mt-0.5">Financial Intelligence</p>
        </div>
        <button onClick={() => nav("home")} className={`mx-0 mb-3 flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-semibold transition-all ${active === "home" ? `bg-indigo-600 text-white shadow-lg ${activeTh.glow} shadow-lg` : "text-slate-300 hover:bg-slate-800"}`}>
          <span className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center ${active === "home" ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-400 dark:text-[#828b9a]"}`}>⌂</span>
          Home
        </button>
        <div className="flex-1 overflow-y-auto">
          {orderedTiers.filter(t => t !== "Home").map(t => {
            const th = tierTheme(t);
            const collapsed = collapsedTiers[t];
            const mods = tierGroups[t];
            return (
              <div key={t} className="mb-2">
                <button onClick={() => setCollapsedTiers(c => ({ ...c, [t]: !c[t] }))} className="w-full flex items-center justify-between px-2 mt-1 mb-1 group">
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${th.dot}`} />
                    <span className="text-xs font-bold text-slate-500 dark:text-[#a3acba] uppercase tracking-wider group-hover:text-slate-300">{t}</span>
                  </span>
                  <span className="text-slate-600 dark:text-[#c4ccd8] text-xs">{collapsed ? "▸" : "▾"}</span>
                </button>
                {!collapsed && mods.map(m => {
                  const isActive = active === m.id;
                  return (
                    <button key={m.id} onClick={() => nav(m.id)} className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-0.5 text-sm font-medium transition-all ${isActive ? `bg-indigo-600 text-white shadow-md ${th.glow}` : "text-slate-300 hover:bg-slate-800"}`}>
                      <span className={`w-5 h-5 rounded text-xs font-bold flex items-center justify-center ${isActive ? "bg-indigo-500 text-white" : "bg-slate-700 text-slate-400 dark:text-[#828b9a]"}`}>{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div className="px-2 pt-3 border-t border-slate-800">
          <button onClick={() => setManageOpen(true)} className="w-full px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 dark:text-[#828b9a] hover:text-white hover:bg-slate-800 transition-colors mb-2 text-left">⚙ Manage Modules</button>
          <div className="flex flex-wrap gap-x-2 gap-y-1 px-3 text-xs text-slate-500 dark:text-[#a3acba]">
            <button onClick={() => setLegalOpen("terms")} className="hover:text-slate-300">Terms</button>
            <span className="text-slate-700 dark:text-[#dde3ec]">·</span>
            <button onClick={() => setLegalOpen("privacy")} className="hover:text-slate-300">Privacy</button>
            <span className="text-slate-700 dark:text-[#dde3ec]">·</span>
            <button onClick={() => setLegalOpen("disclaimer")} className="hover:text-slate-300">Disclaimer</button>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#c4ccd8] px-3 mt-2 italic">Educational tool — not financial advice</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`shrink-0 flex items-center justify-between px-3 md:px-6 py-3 border-b ${"bg-white dark:bg-[#1c1f26] border-slate-200 dark:border-[#323844]"}`}>
          <div className="flex items-center gap-2 text-sm min-w-0">
            <button onClick={() => setSidebarOpen(true)} className={`md:hidden mr-1 w-8 h-8 rounded-lg flex items-center justify-center ${"bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#a3acba] hover:bg-slate-200 dark:hover:bg-[#2c313b]"}`} title="Open menu">☰</button>
            <span className={`w-2 h-2 rounded-full ${activeTh.dot} shrink-0`} />
            {crumb.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className={`${i === crumb.length - 1 ? ("text-slate-800 dark:text-[#eef1f6] font-bold") : ("text-slate-500 dark:text-[#a3acba]")}`}>{c}</span>
                {i < crumb.length - 1 && <span className={"text-slate-300 dark:text-[#5b6470]"}>›</span>}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {riskProfile && riskLabel && <span className={`hidden md:inline px-2.5 py-1 rounded-full text-xs font-bold ${riskLabel === "aggressive" ? "bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300" : riskLabel === "growth" ? "bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300" : riskLabel === "balanced" ? "bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-200" : "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}`}>{riskLabel.charAt(0).toUpperCase() + riskLabel.slice(1)} Risk</span>}
            <div className="hidden md:flex items-center gap-2">
              <LocaleSwitcher locale={locale} onChange={setLocale} />
              <button onClick={() => setCoupled(!coupled)} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${coupled ? "bg-pink-500 text-white" : ("bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#a3acba] hover:bg-slate-200 dark:hover:bg-[#2c313b]")}`} title="Couples mode — split inputs You/Partner">{coupled ? "💑 Couples ON" : "💑 Couples"}</button>
              <button onClick={() => setPlaidOpen(true)} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${"bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#a3acba] hover:bg-slate-200 dark:hover:bg-[#2c313b]"}`} title="Connect your bank (requires backend)">🏦</button>
              <button onClick={() => setReminderOpen(true)} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${"bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#a3acba] hover:bg-slate-200 dark:hover:bg-[#2c313b]"}`} title="Set a reminder">⏰</button>
              <button onClick={() => { const pf = active === "personal"; saveSnapshot({ nw: 0, surplus: 0, healthScore, label: pf ? "From Personal Finance" : `From ${active}` }); nav("snapshots"); }} className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${"bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#a3acba] hover:bg-slate-200 dark:hover:bg-[#2c313b]"}`} title="Save snapshot of current state">📸</button>
            </div>
            <button onClick={() => setGlossaryOpen(true)} className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${"bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#a3acba] hover:bg-slate-200 dark:hover:bg-[#2c313b]"}`} title="Search financial terms">
              <span>🔍</span><span className="hidden md:inline">Glossary</span>
            </button>
            <button onClick={() => setJargon(!jargon)} className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${jargon ? "bg-emerald-600 text-white" : ("bg-slate-100 dark:bg-[#232730] text-slate-600 dark:text-[#a3acba] hover:bg-slate-200 dark:hover:bg-[#2c313b]")}`} title="Show plain-English explanations and simpler labels"><span className={`inline-block w-7 h-3.5 rounded-full relative transition-colors ${jargon ? "bg-emerald-300" : "bg-slate-300 dark:bg-[#3a414d]"}`}><span className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-[#1c1f26] transition-all ${jargon ? "left-3.5" : "left-0.5"}`} /></span><span className="hidden md:inline">Plain English</span></button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {journey && <GuidedBar journey={journey} currentStepIndex={journeyStepIndex} onNextStep={handleNextJourneyStep} onExit={() => setJourney(null)} />}
          <ErrorBoundary key={active} onReset={() => setActive("home")}>
          {active === "home" && <Home engagement={engagement} healthScore={healthScore} riskProfile={riskProfile} riskLabel={riskLabel} onNav={nav} toured={toured} onDismissTour={dismissTour} />}
          {active === "guide" && <Guide journeys={JOURNEYS} onSelectJourney={handleJourneySelect} />}
          {active === "quick" && <QuickTools />}
          {active === "personal" && <PersonalFinance jargonFree={jargon} riskType={riskLabel} onNav={nav} toured={toured} onDismissTour={dismissTour} customCategories={customCategories} onOpenCustomize={() => setCustomizeOpen(true)} coupled={coupled} locale={locale} onSaveSnapshot={(data) => saveSnapshot(data)} onEngage={(p) => setEngagement(e => ({ ...e, emergencyMonths: p.emergencyMonths ?? e.emergencyMonths, cashflowPositive: p.cashflowPositive ?? e.cashflowPositive }))} />}
          {active === "loans" && <Loans jargonFree={jargon} />}
          {active === "cashflow" && <CashFlow jargonFree={jargon} />}
          {active === "goals" && <GoalTracker jargonFree={jargon} onGoalAdded={onGoalAdded} onGoalReached={onGoalReached} />}
          {active === "portfolio" && <Portfolio jargonFree={jargon} riskType={riskLabel} onNav={nav} toured={toured} onDismissTour={dismissTour} onEngage={(p) => setEngagement(e => ({ ...e, hhi: p.hhi ?? e.hhi }))} />}
          {active === "investments" && <Investments jargonFree={jargon} riskType={riskLabel} />}
          {active === "marketwatch" && <MarketWatch jargonFree={jargon} onNav={nav} />}
          {active === "marketlab" && <MarketLab jargonFree={jargon} />}
          {active === "options" && <Options jargonFree={jargon} />}
          {active === "tax" && <TaxEstimator jargonFree={jargon} />}
          {active === "market" && <MarketDashboard jargonFree={jargon} />}
          {active === "business" && <Business jargonFree={jargon} />}
          {active === "breakeven" && <BreakEven jargonFree={jargon} />}
          {active === "whatif" && <WhatIf jargonFree={jargon} />}
          {active === "valuation" && <Valuation jargonFree={jargon} />}
          {active === "capbudget" && <CapBudget jargonFree={jargon} />}
          {active === "stresstest" && <StressTest jargonFree={jargon} riskType={riskLabel} onNav={nav} onStressResult={onStressStrong} />}
          {active === "journal" && <DecisionJournal jargonFree={jargon} onNav={nav} onDecisionLogged={onDecisionLogged} />}
          {active === "riskprofile" && <RiskProfile jargonFree={jargon} profile={riskProfile} onSave={(p) => { setRiskProfile(p); onRiskSaved(); setActive("home"); }} />}
          {active === "priority" && <GoalPriority jargonFree={jargon} />}
          {active === "montecarlo" && <MonteCarloRetirement jargonFree={jargon} />}
          {active === "taxopt" && <TaxOptimizer jargonFree={jargon} locale={locale} />}
          {active === "lifeevents" && <LifeEvents jargonFree={jargon} onNav={nav} />}
          {active === "snapshots" && <SnapshotHistory snapshots={snapshots} jargonFree={jargon} onNav={nav} onSaveNow={() => saveSnapshot({ nw: 0, surplus: 0, healthScore, label: "Manual save from history view" })} />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
