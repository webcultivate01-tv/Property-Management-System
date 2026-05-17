import { useEffect, useMemo, useState } from 'react';
import { Calculator, X, Coins, TrendingUp, Banknote } from 'lucide-react';

const INR = (n) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(n));

const TABS = [
  { id: 'emi',   label: 'EMI',          icon: Banknote },
  { id: 'duty',  label: 'Stamp Duty',   icon: Coins },
  { id: 'yield', label: 'Rental Yield', icon: TrendingUp },
];

export function EmiCalculator() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('emi');
  const [prefillTitle, setPrefillTitle] = useState('');
  const [prefillPrice, setPrefillPrice] = useState(0);

  useEffect(() => {
    const onOpen = (ev) => {
      const price = Number(ev?.detail?.principal || 0);
      if (price) setPrefillPrice(price);
      setPrefillTitle(ev?.detail?.title || '');
      setTab(ev?.detail?.tab || 'emi');
      setOpen(true);
    };
    window.addEventListener('tools:open-emi', onOpen);
    return () => window.removeEventListener('tools:open-emi', onOpen);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[95] bg-slate-900/50 backdrop-blur-sm grid place-items-center p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-white/10">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient text-white grid place-items-center">
            <Calculator size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-lg dark:text-slate-100">Real Estate Tools</div>
            {prefillTitle && (
              <div className="text-xs text-slate-500 truncate">{prefillTitle}</div>
            )}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pt-3">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1">
            {TABS.map((t) => {
              const I = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    tab === t.id
                      ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-200 shadow'
                      : 'text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <I size={13} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === 'emi'   && <EmiTab prefillPrice={prefillPrice} />}
        {tab === 'duty'  && <DutyTab prefillPrice={prefillPrice} />}
        {tab === 'yield' && <YieldTab prefillPrice={prefillPrice} />}
      </div>
    </div>
  );
}

/* ───────────── EMI ───────────── */

function computeEmi(principal, annualRate, years) {
  const n = Math.max(1, Math.round(years * 12));
  const r = annualRate / 12 / 100;
  if (r === 0) {
    const emi = principal / n;
    return { emi, total: emi * n, interest: 0, n };
  }
  const factor = Math.pow(1 + r, n);
  const emi = (principal * r * factor) / (factor - 1);
  const total = emi * n;
  return { emi, total, interest: total - principal, n };
}

function EmiTab({ prefillPrice }) {
  const [principal, setPrincipal] = useState(prefillPrice || 5000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  useEffect(() => { if (prefillPrice) setPrincipal(prefillPrice); }, [prefillPrice]);

  const { emi, total, interest, n } = useMemo(
    () => computeEmi(Number(principal) || 0, Number(rate) || 0, Number(years) || 0),
    [principal, rate, years]
  );

  return (
    <div className="p-5 space-y-4">
      <Slider label="Loan Amount"         value={principal} onChange={setPrincipal} min={100000} max={50000000} step={50000} display={`₹ ${INR(principal)}`} />
      <Slider label="Interest Rate"       value={rate}      onChange={setRate}      min={1}      max={20}       step={0.05}  display={`${Number(rate).toFixed(2)} %`} />
      <Slider label="Tenure"              value={years}     onChange={setYears}     min={1}      max={30}       step={1}     display={`${years} year${years === 1 ? '' : 's'}`} />

      <div className="grid grid-cols-3 gap-3 pt-2">
        <Stat label="Monthly EMI"    value={`₹ ${INR(emi)}`}      accent />
        <Stat label="Total Interest" value={`₹ ${INR(interest)}`} />
        <Stat label="Total Payment"  value={`₹ ${INR(total)}`} />
      </div>

      <BreakdownBar principal={Number(principal)} interest={interest} />

      <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
        Reducing-balance EMI over {n} months. Indicative only — actual loan terms may vary.
      </div>
    </div>
  );
}

/* ───────────── STAMP DUTY ───────────── */

// Indicative Indian-market default rates. Editable in the form.
const DUTY_PRESETS = [
  { label: 'Maharashtra (Mumbai) — 6%', duty: 6, reg: 1 },
  { label: 'Karnataka (Bengaluru) — 5%', duty: 5, reg: 1 },
  { label: 'Delhi — 6% (male) / 4% (female)', duty: 6, reg: 1 },
  { label: 'Gujarat (Ahmedabad) — 4.9%', duty: 4.9, reg: 1 },
  { label: 'Tamil Nadu — 7%', duty: 7, reg: 4 },
  { label: 'Custom', duty: 5, reg: 1 },
];

function DutyTab({ prefillPrice }) {
  const [price, setPrice] = useState(prefillPrice || 5000000);
  const [duty, setDuty] = useState(6);
  const [reg, setReg] = useState(1);
  const [gst, setGst] = useState(0);
  const [other, setOther] = useState(50000);

  useEffect(() => { if (prefillPrice) setPrice(prefillPrice); }, [prefillPrice]);

  const dutyAmt = (Number(price) || 0) * (Number(duty) || 0) / 100;
  const regAmt = (Number(price) || 0) * (Number(reg) || 0) / 100;
  const gstAmt = (Number(price) || 0) * (Number(gst) || 0) / 100;
  const total = (Number(price) || 0) + dutyAmt + regAmt + gstAmt + (Number(other) || 0);

  return (
    <div className="p-5 space-y-4">
      <Slider label="Property Value" value={price} onChange={setPrice} min={100000} max={100000000} step={50000} display={`₹ ${INR(price)}`} />

      <div>
        <label className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Region preset</label>
        <select
          onChange={(e) => {
            const p = DUTY_PRESETS[e.target.value];
            if (p) { setDuty(p.duty); setReg(p.reg); }
          }}
          defaultValue=""
          className="input mt-1.5 text-sm"
        >
          <option value="" disabled>Pick a region…</option>
          {DUTY_PRESETS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <NumField label="Stamp Duty %"  value={duty}  onChange={setDuty} />
        <NumField label="Registration %" value={reg}   onChange={setReg} />
        <NumField label="GST % (under-construction only)" value={gst} onChange={setGst} />
        <NumField label="Other charges (₹)" value={other} onChange={setOther} integer />
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <Stat label="Stamp Duty"     value={`₹ ${INR(dutyAmt)}`} />
        <Stat label="Registration"   value={`₹ ${INR(regAmt)}`} />
        <Stat label="GST"            value={`₹ ${INR(gstAmt)}`} />
        <Stat label="Other"          value={`₹ ${INR(other)}`} />
      </div>

      <div className="rounded-xl p-4 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-400/30 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-brand-700 dark:text-brand-200">All-in cost</div>
          <div className="font-display font-extrabold text-2xl text-brand-700 dark:text-brand-200">₹ {INR(total)}</div>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          Cost over property value:<br />
          <span className="font-bold text-slate-700 dark:text-slate-200">+ ₹ {INR(total - Number(price))} ({((total - Number(price)) / Number(price) * 100).toFixed(1)}%)</span>
        </div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400">
        Rates vary by state, gender, urban/rural — always verify with a local lawyer or registrar before transacting.
      </div>
    </div>
  );
}

/* ───────────── RENTAL YIELD ───────────── */

function YieldTab({ prefillPrice }) {
  const [price, setPrice] = useState(prefillPrice || 5000000);
  const [rent, setRent] = useState(25000);
  const [expense, setExpense] = useState(20000); // annual maintenance/tax
  const [vacancy, setVacancy] = useState(8); // % months/year
  const [appr, setAppr] = useState(6); // expected annual appreciation %

  useEffect(() => { if (prefillPrice) setPrice(prefillPrice); }, [prefillPrice]);

  const grossAnnual = (Number(rent) || 0) * 12;
  const occupiedFactor = 1 - (Number(vacancy) || 0) / 100;
  const effectiveAnnual = grossAnnual * occupiedFactor;
  const netAnnual = effectiveAnnual - (Number(expense) || 0);
  const grossYield = price ? (grossAnnual / Number(price)) * 100 : 0;
  const netYield = price ? (netAnnual / Number(price)) * 100 : 0;
  const totalReturn = netYield + Number(appr);

  return (
    <div className="p-5 space-y-4">
      <Slider label="Property Value"      value={price}   onChange={setPrice}   min={100000} max={100000000} step={50000} display={`₹ ${INR(price)}`} />
      <Slider label="Monthly Rent"        value={rent}    onChange={setRent}    min={1000}   max={500000}    step={500}    display={`₹ ${INR(rent)} / month`} />
      <Slider label="Annual Expenses"     value={expense} onChange={setExpense} min={0}      max={1000000}   step={1000}   display={`₹ ${INR(expense)}`} />
      <Slider label="Vacancy Rate"        value={vacancy} onChange={setVacancy} min={0}      max={50}        step={1}      display={`${vacancy}%`} />
      <Slider label="Expected Appreciation" value={appr}  onChange={setAppr}    min={0}      max={20}        step={0.1}    display={`${Number(appr).toFixed(1)}% / yr`} />

      <div className="grid grid-cols-3 gap-3 pt-2">
        <Stat label="Gross Yield" value={`${grossYield.toFixed(2)}%`} />
        <Stat label="Net Yield"   value={`${netYield.toFixed(2)}%`} accent />
        <Stat label="Total Return" value={`${totalReturn.toFixed(2)}%`} />
      </div>

      <div className="rounded-xl p-3 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-xs space-y-1">
        <div className="flex justify-between"><span>Gross annual rent</span><span className="font-semibold">₹ {INR(grossAnnual)}</span></div>
        <div className="flex justify-between"><span>After vacancy ({vacancy}%)</span><span className="font-semibold">₹ {INR(effectiveAnnual)}</span></div>
        <div className="flex justify-between"><span>Net of expenses</span><span className="font-semibold">₹ {INR(netAnnual)}</span></div>
      </div>

      <div className="text-xs text-slate-500 dark:text-slate-400">
        "Net Yield" is the cash return on the purchase price after vacancy and expenses. "Total Return" adds expected price appreciation.
      </div>
    </div>
  );
}

/* ───────────── shared widgets ───────────── */

function Slider({ label, value, onChange, min, max, step, display }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
        <span className="text-sm font-bold text-brand-600 dark:text-brand-300">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-600"
      />
      <input type="number" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 input text-sm py-1.5"
      />
    </div>
  );
}

function NumField({ label, value, onChange, integer }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">{label}</label>
      <input
        type="number"
        step={integer ? 1 : 0.1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="input mt-1 text-sm py-1.5"
      />
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-3 border ${
      accent
        ? 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-400/30'
        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10'
    }`}>
      <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`font-bold mt-1 ${accent ? 'text-brand-700 dark:text-brand-200 text-lg' : 'text-slate-800 dark:text-slate-100'}`}>
        {value}
      </div>
    </div>
  );
}

function BreakdownBar({ principal, interest }) {
  const total = principal + interest || 1;
  const pPct = (principal / total) * 100;
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
        <span>Principal</span><span>Interest</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-white/10 flex">
        <div className="bg-brand-500" style={{ width: `${pPct}%` }} />
        <div className="bg-amber-400 flex-1" />
      </div>
      <div className="flex items-center justify-between text-[11px] mt-1">
        <span className="text-brand-600 dark:text-brand-300">{Math.round(pPct)}%</span>
        <span className="text-amber-600 dark:text-amber-300">{Math.round(100 - pPct)}%</span>
      </div>
    </div>
  );
}
