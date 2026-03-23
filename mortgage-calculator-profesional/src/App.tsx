import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Info, Plus, Trash2, RotateCcw, Download, Moon, Sun, ChevronDown, ChevronUp, Calendar, DollarSign, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { format, addMonths, parseISO, isValid } from 'date-fns';
import { DatePickerPortal } from './DatePickerPortal';
import { cn, formatCurrency, formatNumber, parseCurrency } from './lib/utils';
import { calculateMortgage } from './lib/calculator';
import { ExtraPayment, Frequency, CalculationResults, AmortizationEntry } from './types';
import { motion, AnimatePresence } from 'motion/react';
// Using portal-based date picker for Start Date to avoid day number clipping

// --- Components ---

const Tooltip = ({ content }: { content: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-6 w-auto">
      <button 
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center justify-center focus:outline-none"
      >
        <Info className={cn("w-4 h-4 transition-colors", isOpen ? "text-brand-accent" : "text-slate-400 hover:text-brand-accent")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[60]" 
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 min-w-48 p-3.5 bg-slate-800 text-white text-xs leading-relaxed rounded-xl shadow-2xl z-[70] border border-white/10 backdrop-blur-sm"
            >
              {content}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const CurrencyDisplay = ({ value, className, symbolColor = "text-brand-accent" }: { value: number; className?: string; symbolColor?: string }) => {
  const formatted = formatCurrency(value);
  const symbol = formatted.charAt(0);
  const rest = formatted.slice(1);
  return (
    <span className={className}>
      <span className={cn("font-black mr-0.5 drop-shadow-sm", symbolColor)}>{symbol}</span>
      {rest}
    </span>
  );
};

const Card = ({ children, className, title, icon: Icon, action, delay = 0 }: { children: React.ReactNode; className?: string; title?: string; icon?: any; action?: React.ReactNode; delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={cn("bg-brand-card rounded-2xl border border-brand-border/50 shadow-2xl overflow-hidden relative group", className)}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    {(title || action) && (
      <div className="px-6 py-5 border-b border-brand-border/50 flex justify-between items-center relative z-10">
        {title && (
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-brand-accent/10 border border-brand-accent/20">
                <Icon className="w-4 h-4 text-brand-accent" />
              </div>
            )}
            <h3 className="text-base font-bold text-brand-text tracking-tight">{title}</h3>
          </div>
        )}
        {action}
      </div>
    )}
    <div className="p-6 relative z-10">{children}</div>
  </motion.div>
);

const InputGroup = ({ label, tooltip, children, className }: { label: string; tooltip?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <div className="flex items-center">
      <label className="text-sm font-bold text-brand-text-muted tracking-wide">{label}</label>
      {tooltip && <Tooltip content={tooltip} />}
    </div>
    {children}
  </div>
);

const NumericInput = ({ 
  value, 
  onChange, 
  prefix, 
  suffix, 
  placeholder,
  isPercent = false
}: { 
  value: string; 
  onChange: (val: string) => void; 
  prefix?: React.ReactNode; 
  suffix?: React.ReactNode;
  placeholder?: string;
  isPercent?: boolean;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!isFocused) {
      setLocalValue(value);
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    onChange(val);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseCurrency(localValue);
    if (isNaN(num)) return;
    const formatted = isPercent ? num.toString() : formatNumber(num);
    setLocalValue(formatted);
    onChange(formatted);
  };

  const handleFocus = () => {
    setIsFocused(true);
    const num = parseCurrency(localValue);
    if (isNaN(num)) return;
    const raw = num.toString();
    setLocalValue(raw);
    // Do not call onChange here to avoid triggering unnecessary updates
  };

  return (
    <div className="relative flex items-center group">
      {prefix && (
        <div className="absolute left-4 flex items-center justify-center text-slate-500 font-bold z-10 group-focus-within:text-brand-accent transition-all duration-300">
          {prefix}
        </div>
      )}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={cn(
          "w-full bg-brand-input border border-brand-border/50 rounded-xl py-3 px-4 text-brand-text font-bold text-lg focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent/50 transition-all outline-none shadow-inner",
          prefix && "pl-10",
          suffix && "pr-10"
        )}
      />
      {suffix && (
        <div className="absolute right-4 flex items-center justify-center text-slate-500 font-bold z-10 group-focus-within:text-brand-accent transition-all duration-300">
          {suffix}
        </div>
      )}
    </div>
  );
};

const SummaryStats = React.memo(({ results, paymentFrequency }: { results: CalculationResults | null, paymentFrequency: Frequency }) => {
  const frequencyLabels: Record<Frequency, { full: string, short: string }> = {
    weekly: { full: 'Weekly', short: '/wk' },
    biweekly: { full: 'Bi-Weekly', short: '/biweekly' },
    monthly: { full: 'Monthly', short: '/mo' },
    quarterly: { full: 'Quarterly', short: '/quarterly' },
    semiannually: { full: 'Semi-Annual', short: '/semiannually' },
    annually: { full: 'Annual', short: '/annually' },
  };

  const label = frequencyLabels[paymentFrequency];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-brand-accent rounded-3xl p-6 text-white shadow-2xl shadow-brand-accent/30 relative overflow-hidden group glow-accent md:col-span-2"
      >
        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-black/10 rounded-full blur-2xl" />
        <div className="flex items-center mb-2 relative z-10">
          <p className="text-white/70 text-[10px] font-black uppercase tracking-widest">Total {label.full} Payment</p>
        </div>
        <div className="flex items-baseline gap-1 relative z-10">
          <CurrencyDisplay value={results ? (results.periodicPayment + (results.schedule[0]?.additionalCosts || 0)) : 0} className="text-5xl font-black tracking-tighter" symbolColor="text-white/50" />
          <span className="text-xs font-bold text-white/60">{label.short}</span>
        </div>
        <div className="mt-4 flex items-center gap-4 relative z-10">
          <div className="text-[10px] font-bold text-white/60 flex items-center">
            P&I: <span className="text-white ml-1">{formatCurrency(results?.periodicPayment || 0)}</span>
          </div>
        </div>
      </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-brand-card border border-brand-border/50 rounded-3xl p-6 text-brand-text shadow-xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center mb-2">
        <p className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest">Total Interest</p>
      </div>
      <CurrencyDisplay value={results?.totalInterest || 0} className="text-2xl font-black tracking-tighter" symbolColor="text-brand-accent" />
      <div className="mt-4 flex items-center">
        <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[9px] font-black rounded-lg border border-emerald-500/20 flex items-center">
          Saved {formatCurrency(results?.interestSaved || 0)}
        </span>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-brand-card border border-brand-border/50 rounded-3xl p-6 text-brand-text shadow-xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center mb-2">
        <p className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest">Payoff Date</p>
      </div>
      <p className="text-2xl font-black tracking-tighter text-brand-text">
        {results && isValid(results.payoffDate) ? format(results.payoffDate, 'MMM yyyy') : '-'}
      </p>
      <div className="mt-4 flex items-center">
        <span className="px-2 py-1 bg-brand-accent/10 text-brand-accent text-[9px] font-black rounded-lg border border-brand-accent/20 flex items-center">
          {results ? `${Math.floor(results.timeSavedMonths / 12)}y ${results.timeSavedMonths % 12}m earlier` : '-'}
        </span>
      </div>
    </motion.div>

    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-brand-card border border-brand-border/50 rounded-3xl p-6 text-brand-text shadow-xl relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex items-center mb-2">
        <p className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest">Total Payments</p>
      </div>
      <p className="text-2xl font-black tracking-tighter text-brand-text">
        {results?.schedule.length || 0}
      </p>
      <div className="mt-4">
        <span className="px-2 py-1 bg-brand-text-muted/10 text-brand-text-muted text-[9px] font-black rounded-lg border border-brand-border/20">
          {paymentFrequency.charAt(0).toUpperCase() + paymentFrequency.slice(1)}
        </span>
      </div>
    </motion.div>
  </div>
);
});

const renderPieLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 5) * cos;
  const sy = cy + (outerRadius + 5) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  if (percent < 0.01) return null;

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="rgba(255,255,255,0.6)" fill="none" strokeWidth={1.5} />
      <text 
        x={ex + (cos >= 0 ? 1 : -1) * 8} 
        y={ey} 
        textAnchor={textAnchor} 
        fill="white" 
        dominantBaseline="central" 
        className="text-[14px] font-black drop-shadow-md"
      >
        {Math.round(percent * 100) + "%"}
      </text>
    </g>
  );
};

const ChartsSection = React.memo(({ pieData, lineData }: { pieData: any[], lineData: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <Card title="Total Cost Breakdown" icon={PieChart} delay={0.3}>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              label={renderPieLabel}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'var(--brand-card)', borderRadius: '16px', border: '1px solid var(--brand-border)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--brand-text)', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--brand-text-muted)', paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>

    <Card title="Payment Breakdown Over Time" icon={BarChart} delay={0.4}>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-text-muted)', fontWeight: 'bold' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-text-muted)', fontWeight: 'bold' }} tickFormatter={(val) => `$${val/1000}k`} />
            <RechartsTooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'var(--brand-card)', borderRadius: '16px', border: '1px solid var(--brand-border)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--brand-text)', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--brand-text-muted)' }} />
            <Bar dataKey="interest" name="Total Interest" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>

    <Card title="Balance Over Time" icon={AreaChart} delay={0.5}>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={lineData}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-text-muted)', fontWeight: 'bold' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-text-muted)', fontWeight: 'bold' }} tickFormatter={(val) => `$${val/1000}k`} />
            <RechartsTooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'var(--brand-card)', borderRadius: '16px', border: '1px solid var(--brand-border)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--brand-text)', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="balance" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>

    <Card title="Equity vs. Debt" icon={AreaChart} delay={0.6}>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={lineData}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDebt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--brand-border)" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-text-muted)', fontWeight: 'bold' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--brand-text-muted)', fontWeight: 'bold' }} tickFormatter={(val) => `$${val/1000}k`} />
            <RechartsTooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ backgroundColor: 'var(--brand-card)', borderRadius: '16px', border: '1px solid var(--brand-border)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: 'var(--brand-text)', fontWeight: 'bold' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--brand-text-muted)' }} />
            <Area type="monotone" dataKey="equity" name="Home Equity" stroke="#10b981" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={3} stackId="1" />
            <Area type="monotone" dataKey="balance" name="Remaining Debt" stroke="#f43f5e" fillOpacity={1} fill="url(#colorDebt)" strokeWidth={3} stackId="1" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </div>
));

const AmortizationTable = React.memo(({ schedule, exportToCSV }: { schedule: AmortizationEntry[], exportToCSV: () => void }) => (
  <Card 
    title="Payment Breakdown Schedule" 
    icon={Calendar}
    className="p-0"
    delay={0.7}
    action={
      <button 
        onClick={exportToCSV}
        className="flex items-center gap-2 px-4 py-2 bg-brand-input border border-brand-border/50 text-brand-accent rounded-xl text-xs font-bold hover:bg-brand-accent hover:text-brand-text transition-all shadow-sm"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>
    }
  >
    <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 bg-brand-card z-10">
          <tr>
            <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest border-b border-brand-border/50">#</th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest border-b border-brand-border/50">Date</th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest border-b border-brand-border/50">Payment</th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest border-b border-brand-border/50">
              <div className="flex items-center">
                Principal
              </div>
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest border-b border-brand-border/50">
              <div className="flex items-center">
                Interest
              </div>
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest border-b border-brand-border/50">
              <div className="flex items-center">
                Extra
              </div>
            </th>
            <th className="px-6 py-5 text-[10px] font-black text-brand-text-muted uppercase tracking-widest border-b border-brand-border/50">
              <div className="flex items-center">
                Balance
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/20">
          {schedule.map((entry, i) => (
            <tr key={i} className="hover:bg-brand-accent/5 transition-colors group">
              <td className="px-6 py-4 text-sm text-brand-text-muted font-bold">{entry.paymentNumber}</td>
              <td className="px-6 py-4 text-sm text-brand-text-muted font-medium">
                {isValid(entry.date) ? format(entry.date, 'MMM d, yyyy') : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-brand-text font-black">
                <CurrencyDisplay value={entry.payment} symbolColor="text-brand-accent" />
              </td>
              <td className="px-6 py-4 text-sm text-brand-text-muted">
                <CurrencyDisplay value={entry.principal} symbolColor="text-slate-600" />
              </td>
              <td className="px-6 py-4 text-sm text-rose-400 font-bold">
                <CurrencyDisplay value={entry.interest} symbolColor="text-rose-900/50" />
              </td>
              <td className="px-6 py-4 text-sm text-emerald-400 font-bold">
                {entry.extraPayment > 0 ? <CurrencyDisplay value={entry.extraPayment} symbolColor="text-emerald-900/50" /> : <span className="text-slate-700">-</span>}
              </td>
              <td className="px-6 py-4 text-sm text-brand-text font-black group-hover:text-brand-accent transition-colors">
                <CurrencyDisplay value={entry.remainingBalance} symbolColor="text-brand-accent/50" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
));

// --- Main App ---

const FREQUENCY_MAP: Record<Frequency, number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannually: 2,
  annually: 1,
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved as 'light' | 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

   // Input States (Strings for smooth typing)
   // Anchor for Start Date portal trigger
   const startDateAnchorRef = React.useRef<HTMLDivElement>(null);
   const [homePrice, setHomePrice] = useState('450000');
   const [downPayment, setDownPayment] = useState('90000');
   const [downPaymentType, setDownPaymentType] = useState<'dollar' | 'percent'>('dollar');
   const [interestRate, setInterestRate] = useState('6.5');
   const [loanTerm, setLoanTerm] = useState('30');
   const [paymentFrequency, setPaymentFrequency] = useState<Frequency>('monthly');
   const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
   const [showAdvanced, setShowAdvanced] = useState(false);
   const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Additional Costs
  const [propertyTax, setPropertyTax] = useState('0');
  const [propertyTaxType, setPropertyTaxType] = useState<'monthly' | 'yearly'>('yearly');
  const [homeInsurance, setHomeInsurance] = useState('0');
  const [homeInsuranceType, setHomeInsuranceType] = useState<'monthly' | 'yearly'>('yearly');
  const [hoaFees, setHoaFees] = useState('0');
  const [hoaFeesType, setHoaFeesType] = useState<'monthly' | 'yearly'>('monthly');
  const [otherCosts, setOtherCosts] = useState('0');
  const [otherCostsType, setOtherCostsType] = useState<'monthly' | 'yearly'>('monthly');
  const [pmi, setPmi] = useState('0');
  const [pmiType, setPmiType] = useState<'monthly' | 'yearly'>('monthly');

  // Extra Payments
  const [extraPayments, setExtraPayments] = useState<ExtraPayment[]>([]);

  // Results State
  const [results, setResults] = useState<CalculationResults | null>(null);

   // Sync Down Payment Percent/Dollar
   useEffect(() => {
     const price = parseCurrency(homePrice) || 0;
     const dp = parseCurrency(downPayment) || 0;
     if (downPaymentType === 'percent' && dp > 100) setDownPayment('100');
     if (downPaymentType === 'dollar' && dp > price) setDownPayment(homePrice);
   }, [downPaymentType, homePrice]);

   // Synchronize all existing extra payments when main payment frequency changes
   useEffect(() => {
     // Update all existing extra payments to use current payment frequency
     setExtraPayments(prev => prev.map(ep => ({
       ...ep,
       frequency: paymentFrequency
     })));
   }, [paymentFrequency]);

   // Calculation Logic (Debounced)
   useEffect(() => {
     const timer = setTimeout(() => {
       const price = parseCurrency(homePrice);
       let dp = parseCurrency(downPayment);
       if (downPaymentType === 'percent') dp = (dp / 100) * price;

       const res = calculateMortgage({
         homePrice: price,
         downPayment: dp,
         interestRate: parseCurrency(interestRate) || 0,
         loanTermYears: parseCurrency(loanTerm) || 0,
         paymentFrequency,
         startDate,
         propertyTax: parseCurrency(propertyTax),
         propertyTaxType,
         homeInsurance: parseCurrency(homeInsurance),
         homeInsuranceType,
         hoaFees: parseCurrency(hoaFees),
         hoaFeesType,
         otherCosts: parseCurrency(otherCosts),
         otherCostsType,
         pmi: parseCurrency(pmi),
         pmiType,
         extraPayments: JSON.parse(JSON.stringify(extraPayments)),
       });
       setResults(res);
     }, 300);
     return () => clearTimeout(timer);
   }, [
     homePrice, downPayment, downPaymentType, interestRate, loanTerm, 
     paymentFrequency, startDate, propertyTax, propertyTaxType, 
     homeInsurance, homeInsuranceType, hoaFees, hoaFeesType, 
     otherCosts, otherCostsType, pmi, pmiType, extraPayments
   ]);

  const handleReset = () => {
    setHomePrice('0');
    setDownPayment('0');
    setInterestRate('0');
    setLoanTerm('30');
    setPaymentFrequency('monthly');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setPropertyTax('0');
    setHomeInsurance('0');
    setPmi('0');
    setHoaFees('0');
    setOtherCosts('0');
    setExtraPayments([]);
  };

   const addExtraPayment = () => {
     const newPayment: ExtraPayment = {
       id: Math.random().toString(36).substr(2, 9),
       amount: 500,
       frequency: paymentFrequency,
     };
     setExtraPayments([...extraPayments, newPayment]);
   };

  const removeExtraPayment = (id: string) => {
    setExtraPayments(extraPayments.filter(p => p.id !== id));
  };

  const updateExtraPayment = (id: string, field: keyof ExtraPayment, value: any) => {
    setExtraPayments(extraPayments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const exportToCSV = () => {
    if (!results) return;
    const headers = ['Payment #', 'Date', 'Payment', 'Principal', 'Interest', 'Extra Payment', 'Total Interest', 'Remaining Balance'];
    const rows = results.schedule.map(e => [
      e.paymentNumber,
      format(e.date, 'yyyy-MM-dd'),
      e.payment.toFixed(2),
      e.principal.toFixed(2),
      e.interest.toFixed(2),
      e.extraPayment.toFixed(2),
      e.totalInterest.toFixed(2),
      e.remainingBalance.toFixed(2)
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `mortgage_schedule_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Data
  const pieData = useMemo(() => results ? [
    { name: 'Principal', value: results.breakdown.principal, color: '#3b82f6' },
    { name: 'Interest', value: results.breakdown.interest, color: '#f43f5e' },
    { name: 'Taxes', value: results.breakdown.taxes, color: '#10b981' },
    { name: 'Insurance', value: results.breakdown.insurance, color: '#f59e0b' },
    { name: 'PMI', value: results.breakdown.pmi, color: '#06b6d4' },
    { name: 'HOA', value: results.breakdown.hoa, color: '#8b5cf6' },
    { name: 'Other', value: results.breakdown.other, color: '#d946ef' },
  ].filter(item => item.value > 0) : [], [results]);

  const lineData = useMemo(() => {
    if (!results) return [];
    const periodsPerYear = FREQUENCY_MAP[paymentFrequency];
    return results.schedule.filter((_, i) => i % periodsPerYear === 0 || i === results.schedule.length - 1).map(e => {
      const price = parseCurrency(homePrice);
      return {
        year: isValid(e.date) ? format(e.date, 'yyyy') : 'N/A',
        balance: e.remainingBalance,
        interest: e.totalInterest,
        equity: Math.max(0, price - e.remainingBalance)
      };
    });
  }, [results, paymentFrequency, homePrice]);

  return (
    <div className={cn("min-h-screen bg-brand-bg text-brand-text transition-colors duration-300", theme)}>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-brand-bg/80 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <h1 className="text-2xl font-black text-[#fdfbf7] tracking-tighter">
              Mortgage Calculator Pro
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-3 bg-brand-card border border-brand-border/50 rounded-xl text-brand-text hover:bg-brand-input hover:border-brand-accent/30 transition-all shadow-sm group"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3 bg-brand-card border border-brand-border/50 rounded-xl text-sm font-bold text-brand-text hover:bg-brand-input hover:border-brand-accent/30 transition-all shadow-sm group"
            >
              <RotateCcw className="w-4 h-4 text-brand-text-muted group-hover:text-brand-accent transition-colors" />
              Reset All
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-4 space-y-8">
            
            <Card title="Core Loan Details" icon={DollarSign} delay={0.1}>
              <div className="space-y-6">
                <InputGroup label="Home Price" tooltip="The total purchase price of the home.">
                  <NumericInput 
                    value={homePrice} 
                    onChange={setHomePrice} 
                    prefix="$" 
                  />
                </InputGroup>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <label className="text-sm font-bold text-brand-text-muted tracking-wide">Down Payment</label>
                      <Tooltip content="The initial payment made when buying the home, usually a percentage of the total price." />
                    </div>
                    <div className="flex bg-brand-input p-1 rounded-lg border border-brand-border">
                      <button 
                        onClick={() => setDownPaymentType('dollar')}
                        className={cn(
                          "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                          downPaymentType === 'dollar' ? "bg-brand-accent text-white shadow-sm" : "text-brand-text-muted hover:text-brand-text"
                        )}
                      >
                        $
                      </button>
                      <button 
                        onClick={() => setDownPaymentType('percent')}
                        className={cn(
                          "px-3 py-1 rounded-md text-[10px] font-black transition-all",
                          downPaymentType === 'percent' ? "bg-brand-accent text-white shadow-sm" : "text-brand-text-muted hover:text-brand-text"
                        )}
                      >
                        %
                      </button>
                    </div>
                  </div>
                  <NumericInput 
                    value={downPayment} 
                    onChange={setDownPayment} 
                    suffix={downPaymentType === 'percent' ? '%' : undefined}
                    prefix={downPaymentType === 'dollar' ? '$' : undefined}
                    isPercent={downPaymentType === 'percent'}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="Interest Rate" tooltip="The annual cost to borrow the money, expressed as a percentage.">
                    <NumericInput 
                      value={interestRate} 
                      onChange={setInterestRate} 
                      suffix="%" 
                      isPercent 
                    />
                  </InputGroup>
                  <InputGroup label="Loan Term" tooltip="The number of years you have to pay back the loan.">
                    <NumericInput 
                      value={loanTerm} 
                      onChange={setLoanTerm} 
                      suffix="Yr" 
                    />
                  </InputGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-brand-border/30">
                  <InputGroup label="Payment Frequency" tooltip="How often you make mortgage payments (e.g., monthly, bi-weekly).">
                    <div className="relative">
                      <select 
                        value={paymentFrequency}
                        onChange={(e) => setPaymentFrequency(e.target.value as Frequency)}
                        className="w-full bg-brand-input border border-brand-border rounded-xl py-3 px-4 text-brand-text font-bold appearance-none focus:ring-2 focus:ring-brand-accent outline-none"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Bi-Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="semiannually">Semi-Annually</option>
                        <option value="annually">Annually</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </InputGroup>

                    <InputGroup label="Start Date" tooltip="The date of your first mortgage payment.">
                      <div ref={startDateAnchorRef} className="relative group">
                        <input 
                          type="text" 
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-brand-input border border-brand-border rounded-xl py-3 pl-11 pr-4 text-brand-text font-bold focus:ring-2 focus:ring-brand-accent outline-none transition-all group-hover:border-brand-accent/50"
                        />
                        <Calendar 
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-accent"
                          onClick={() => setDatePickerOpen(true)}
                        />
                        <DatePickerPortal 
                          value={startDate} 
                          onChange={setStartDate} 
                          anchorRef={startDateAnchorRef} 
                          open={datePickerOpen}
                          onOpenChange={setDatePickerOpen}
                        />
                      </div>
                    </InputGroup>
                </div>
              </div>
            </Card>

            <Card 
              title="Advanced Settings" 
              icon={Calendar} 
              delay={0.2}
              action={
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="p-1.5 bg-brand-accent/10 border border-brand-accent/20 rounded-lg text-brand-accent hover:bg-brand-accent hover:text-white transition-all"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              }
            >
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-visible"
                  >
                    <div className="space-y-6 pt-2">
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          { label: 'Property Tax', value: propertyTax, setter: setPropertyTax, type: propertyTaxType, typeSetter: setPropertyTaxType, tooltip: 'Annual or monthly property tax amount.' },
                          { label: 'Home Insurance', value: homeInsurance, setter: setHomeInsurance, type: homeInsuranceType, typeSetter: setHomeInsuranceType, tooltip: 'Annual or monthly home insurance premium.' },
                          { label: 'HOA Fees', value: hoaFees, setter: setHoaFees, type: hoaFeesType, typeSetter: setHoaFeesType, tooltip: 'Monthly or annual Homeowners Association fees.' },
                          { label: 'PMI', value: pmi, setter: setPmi, type: pmiType, typeSetter: setPmiType, tooltip: 'Private Mortgage Insurance, usually required if down payment is less than 20%.' },
                          { label: 'Other Costs', value: otherCosts, setter: setOtherCosts, type: otherCostsType, typeSetter: setOtherCostsType, tooltip: 'Any other recurring monthly or annual costs.' },
                        ].map((cost, idx) => (
                          <div key={idx} className="space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <label className="text-sm font-bold text-brand-text-muted tracking-wide">{cost.label}</label>
                                <Tooltip content={cost.tooltip} />
                              </div>
                              <div className="flex bg-brand-input p-1 rounded-lg border border-brand-border">
                                <button 
                                  onClick={() => cost.typeSetter('monthly')}
                                  className={cn(
                                    "px-2 py-0.5 rounded-md text-[9px] font-black transition-all",
                                    cost.type === 'monthly' ? "bg-brand-accent text-white shadow-sm" : "text-brand-text-muted hover:text-brand-text"
                                  )}
                                >
                                  MO
                                </button>
                                <button 
                                  onClick={() => cost.typeSetter('yearly')}
                                  className={cn(
                                    "px-2 py-0.5 rounded-md text-[9px] font-black transition-all",
                                    cost.type === 'yearly' ? "bg-brand-accent text-white shadow-sm" : "text-brand-text-muted hover:text-brand-text"
                                  )}
                                >
                                  YR
                                </button>
                              </div>
                            </div>
                            <NumericInput 
                              value={cost.value} 
                              onChange={cost.setter} 
                              prefix="$"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 border-t border-brand-border/50">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4 text-brand-accent" />
                            <h4 className="text-sm font-bold text-brand-text">Extra Payments</h4>
                          </div>
                          <button onClick={addExtraPayment} className="text-brand-accent hover:text-brand-text flex items-center gap-1 text-[10px] font-black transition-colors bg-brand-accent/10 px-2 py-1 rounded-lg border border-brand-accent/20 uppercase tracking-wider">
                            Add
                          </button>
                        </div>

                        <div className="space-y-4">
                          {extraPayments.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-brand-border/50 rounded-2xl">
                              <p className="text-[11px] text-brand-text-muted italic">No extra payments added.</p>
                            </div>
                          ) : (
                            extraPayments.map((ep) => (
                              <div key={ep.id} className="p-4 bg-brand-input/50 rounded-2xl border border-brand-border/50 space-y-3 relative group transition-all hover:border-brand-accent/30 hover:bg-brand-input">
                                <button 
                                  onClick={() => removeExtraPayment(ep.id)}
                                  className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <div className="flex items-center">
                                      <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-wider">Amount</label>
                                      <Tooltip content="The additional amount you want to pay toward your principal." />
                                    </div>
                                    <NumericInput 
                                      value={ep.amount.toString()} 
                                      onChange={(v) => updateExtraPayment(ep.id, 'amount', parseCurrency(v) || 0)} 
                                      prefix="$"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center">
                                      <label className="text-[10px] font-black text-brand-text-muted uppercase tracking-wider">Frequency</label>
                                      <Tooltip content="How often this extra payment occurs." />
                                    </div>
                                    <div className="relative">
                                      <select 
                                        value={ep.frequency}
                                        onChange={(e) => updateExtraPayment(ep.id, 'frequency', e.target.value as Frequency | 'one-time')}
                                        className="w-full bg-brand-input border border-brand-border rounded-lg py-2 px-3 text-xs font-bold text-brand-text appearance-none focus:ring-2 focus:ring-brand-accent outline-none"
                                      >
                                        <option value="one-time">One-time</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Biweekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="semiannually">Semi-annually</option>
                                        <option value="annually">Annually</option>
                                      </select>
                                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {!showAdvanced && (
                <div className="text-center py-2">
                  <button 
                    onClick={() => setShowAdvanced(true)}
                    className="text-[10px] font-black text-brand-accent uppercase tracking-widest hover:underline"
                  >
                    Show Advanced Settings
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Results & Charts */}
          <div className="lg:col-span-8 space-y-8">
            <SummaryStats results={results} paymentFrequency={paymentFrequency} />
            <ChartsSection pieData={pieData} lineData={lineData} />
            <AmortizationTable schedule={results?.schedule || []} exportToCSV={exportToCSV} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-brand-bg border-t border-brand-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 text-sm font-bold">© 2026 Mortgage Calculator Pro. Professional Mortgage Simulation Engine.</p>
        </div>
      </footer>
    </div>
  );
}
