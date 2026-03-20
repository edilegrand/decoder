import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Calculator, Calendar, DollarSign, Percent, PlusCircle, ArrowRight, 
  Download, Moon, Sun, Info, ChevronDown, ChevronUp, FileSpreadsheet, CheckCircle2, RotateCcw
} from 'lucide-react';

// --- Utility Functions ---
const formatCurrency = (value, decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
};

// --- Custom UI Components ---
const Tooltip = ({ children, text }) => (
  <div className="relative flex items-center group">
    {children}
    <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 text-xs text-white bg-gray-800 rounded shadow-lg z-50 transition-opacity">
      {text}
      <div className="absolute top-full left-4 w-2 h-2 bg-gray-800 transform rotate-45 -mt-1"></div>
    </div>
  </div>
);

const InputGroup = ({ label, icon: Icon, tooltip, children, rightAddon }) => (
  <div className="mb-4">
    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
      {tooltip && (
        <Tooltip text={tooltip}>
          <Info className="w-4 h-4 ml-1.5 text-gray-400 cursor-help" />
        </Tooltip>
      )}
    </label>
    <div className="relative rounded-md shadow-sm flex">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      {children}
      {rightAddon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 text-sm">
          {rightAddon}
        </div>
      )}
    </div>
  </div>
);

// --- Main Application ---
export default function App() {
  // --- State ---
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [toast, setToast] = useState(null); 
  
  // Basic Inputs
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [termYears, setTermYears] = useState('');
  const [termMonths, setTermMonths] = useState('');
  const [loanType, setLoanType] = useState('amortizing'); 
  
  // Frequency & Dates
  const [payFreq, setPayFreq] = useState(12); 
  const [compoundFreq, setCompoundFreq] = useState(12); 
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Advanced & Extras
  const [extraPayment, setExtraPayment] = useState('');
  const [extraPaymentFreq, setExtraPaymentFreq] = useState(12);
  const [propertyTax, setPropertyTax] = useState(''); 
  const [insurance, setInsurance] = useState(''); 

  // --- Effects ---
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Toast Auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // --- Actions ---
  const showToast = (message) => {
    setToast({ message });
  };

  const resetValues = () => {
    setAmount('');
    setRate('');
    setTermYears('');
    setTermMonths('');
    setExtraPayment('');
    setExtraPaymentFreq(12);
    setPropertyTax('');
    setInsurance('');
    setStartDate(new Date().toISOString().split('T')[0]);
    showToast('All values cleared');
  };

  const loadScenario = (type) => {
    if (type === 'mortgage') {
      setAmount(450000); setRate(6.25); setTermYears(30); setTermMonths(0);
      setPayFreq(12); setCompoundFreq(12); setLoanType('amortizing');
      setPropertyTax(4500); setInsurance(1200); setExtraPayment(0); setExtraPaymentFreq(12);
    } else if (type === 'car') {
      setAmount(35000); setRate(4.9); setTermYears(5); setTermMonths(0);
      setPayFreq(12); setCompoundFreq(12); setLoanType('amortizing');
      setPropertyTax(0); setInsurance(0); setExtraPayment(0); setExtraPaymentFreq(12);
    } else if (type === 'personal') {
      setAmount(15000); setRate(11.5); setTermYears(3); setTermMonths(0);
      setPayFreq(12); setCompoundFreq(12); setLoanType('amortizing');
      setPropertyTax(0); setInsurance(0); setExtraPayment(0); setExtraPaymentFreq(12);
    }
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} scenario loaded`);
  };

  // --- Financial Calculations Engine ---
  const calcData = useMemo(() => {
    const numAmount = Number(amount) || 0;
    const numRate = Number(rate) || 0;
    const numTermYears = Number(termYears) || 0;
    const numTermMonths = Number(termMonths) || 0;
    const numExtraPayment = Number(extraPayment) || 0;
    const numPropertyTax = Number(propertyTax) || 0;
    const numInsurance = Number(insurance) || 0;

    const totalPeriods = (numTermYears * payFreq) + Math.floor(numTermMonths * (payFreq / 12));
    if (totalPeriods <= 0 || numAmount <= 0) return null;

    const nominalRate = numRate / 100;
    let periodicRate = 0;
    
    if (nominalRate === 0) {
      periodicRate = 0;
    } else if (compoundFreq === payFreq) {
      periodicRate = nominalRate / payFreq;
    } else {
      const effectiveAnnualRate = Math.pow(1 + nominalRate / compoundFreq, compoundFreq) - 1;
      periodicRate = Math.pow(1 + effectiveAnnualRate, 1 / payFreq) - 1;
    }

    let basePayment = 0;
    if (periodicRate === 0) {
      basePayment = numAmount / totalPeriods;
    } else if (loanType === 'interest-only') {
      basePayment = numAmount * periodicRate;
    } else {
      basePayment = (numAmount * periodicRate) / (1 - Math.pow(1 + periodicRate, -totalPeriods));
    }

    const periodicTax = numPropertyTax / payFreq;
    const periodicInsurance = numInsurance / payFreq;
    const totalPeriodicEscrow = periodicTax + periodicInsurance;

    let balance = numAmount;
    let totalInterest = 0;
    let schedule = [];
    let currentDate = new Date(startDate);
    let periodsToPayoff = 0;

    const extraPaymentPerPeriod = (numExtraPayment * extraPaymentFreq) / payFreq;

    const maxIterations = totalPeriods * 2; 

    for (let i = 1; i <= maxIterations && balance > 0.01; i++) {
      let interestForPeriod = balance * periodicRate;
      let principalForPeriod = basePayment - interestForPeriod;
      
      if (loanType === 'interest-only') principalForPeriod = 0;

      let currentExtra = extraPaymentPerPeriod;
      let actualPayment = basePayment + currentExtra;

      if (balance + interestForPeriod <= actualPayment) {
        actualPayment = balance + interestForPeriod;
        principalForPeriod = balance;
        currentExtra = 0;
      }

      if (loanType === 'interest-only' && i === totalPeriods) {
        principalForPeriod = balance;
        actualPayment += balance;
      }

      balance -= (principalForPeriod + currentExtra);
      totalInterest += interestForPeriod;

      if (payFreq === 12) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (payFreq === 26) {
        currentDate.setDate(currentDate.getDate() + 14);
      } else if (payFreq === 52) {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + (12 / payFreq));
      }

      schedule.push({
        period: i,
        date: new Date(currentDate),
        payment: actualPayment,
        totalPaymentWithEscrow: actualPayment + totalPeriodicEscrow,
        principal: principalForPeriod + currentExtra,
        interest: interestForPeriod,
        balance: Math.max(0, balance),
        totalInterestToDate: totalInterest
      });

      periodsToPayoff = i;
      if (i >= totalPeriods && balance > 0.01 && loanType !== 'interest-only') break;
    }

    let baselineTotalInterest = 0;
    if (extraPaymentPerPeriod > 0 && periodicRate > 0 && loanType === 'amortizing') {
      let b_balance = numAmount;
      for (let i = 1; i <= totalPeriods && b_balance > 0.01; i++) {
        let b_int = b_balance * periodicRate;
        let b_prin = basePayment - b_int;
        if (b_balance + b_int < basePayment) b_prin = b_balance;
        b_balance -= b_prin;
        baselineTotalInterest += b_int;
      }
    } else {
      baselineTotalInterest = totalInterest;
    }

    return {
      basePayment,
      totalPeriodicEscrow,
      totalPayment: basePayment + extraPaymentPerPeriod + totalPeriodicEscrow,
      totalInterest,
      totalPrincipal: numAmount,
      totalCost: numAmount + totalInterest + (totalPeriodicEscrow * periodsToPayoff),
      extraPaymentPerPeriod,
      schedule,
      periodsToPayoff,
      payoffDate: schedule.length > 0 ? schedule[schedule.length - 1].date : new Date(),
      interestSaved: Math.max(0, baselineTotalInterest - totalInterest),
      timeSavedPeriods: Math.max(0, totalPeriods - periodsToPayoff),
      chartData: schedule.filter((_, i) => i % Math.max(1, Math.floor(schedule.length / 50)) === 0 || i === schedule.length - 1).map(s => ({
        month: formatDate(s.date),
        balance: s.balance,
        totalInterest: s.totalInterestToDate
      }))
    };
  }, [amount, rate, termYears, termMonths, loanType, payFreq, compoundFreq, startDate, extraPayment, extraPaymentFreq, propertyTax, insurance]);

  const handleExportCSV = () => {
    if (!calcData) return;
    const headers = ['Payment #', 'Date', 'Payment', 'Principal', 'Interest', 'Remaining Balance'];
    const rows = calcData.schedule.map(row => [
      row.period,
      formatDate(row.date),
      row.payment.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.balance.toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'amortization_schedule.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    showToast('CSV exported');
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981'];
  const pieData = calcData ? [
    { name: 'Principal', value: calcData.totalPrincipal },
    { name: 'Total Interest', value: calcData.totalInterest },
    { name: 'Extra Payments', value: calcData.extraPaymentPerPeriod * calcData.periodsToPayoff },
    ...(propertyTax > 0 || insurance > 0 ? [{ name: 'Taxes & Ins.', value: calcData.totalPeriodicEscrow * calcData.periodsToPayoff }] : [])
  ] : [];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDarkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* --- Toast Notification --- */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-800 dark:bg-blue-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center border border-white/10">
            <CheckCircle2 className="w-5 h-5 mr-3 text-blue-400 dark:text-blue-100" />
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* --- Top Navigation --- */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Loan Calculator Pro
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 flex flex-wrap gap-3">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center mr-2">Quick Starts:</span>
          <button onClick={() => loadScenario('mortgage')} className="px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 transition">Home Mortgage</button>
          <button onClick={() => loadScenario('car')} className="px-4 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 transition">Auto Loan</button>
          <button onClick={() => loadScenario('personal')} className="px-4 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 transition">Personal Loan</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-blue-500" />
                  Loan Details
                </h2>
                <button 
                  onClick={resetValues}
                  className="flex items-center space-x-2 px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition border border-transparent hover:border-red-200 dark:hover:border-red-800"
                  title="Reset all values"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Reset</span>
                </button>
              </div>
              
              <InputGroup label="Loan Amount" icon={DollarSign}>
                <input 
                  type="number" min="0" step="1000"
                  value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </InputGroup>

              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Interest Rate" icon={Percent}>
                  <input 
                    type="number" min="0" step="0.1"
                    value={rate} onChange={(e) => setRate(e.target.value === '' ? '' : Number(e.target.value))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </InputGroup>
                
                <InputGroup label="Payment Freq">
                  <select 
                    value={payFreq} onChange={(e) => setPayFreq(Number(e.target.value))}
                    className="block w-full pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value={365}>Daily</option>
                    <option value={52}>Weekly</option>
                    <option value={26}>Bi-weekly</option>
                    <option value={12}>Monthly</option>
                    <option value={4}>Quarterly</option>
                    <option value={2}>Semi-Annually</option>
                    <option value={1}>Annually</option>
                  </select>
                </InputGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Term (Years)">
                  <input 
                    type="number" min="0" step="1"
                    value={termYears} onChange={(e) => setTermYears(e.target.value === '' ? '' : Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </InputGroup>
                <InputGroup label="Term (Months)">
                  <input 
                    type="number" min="0" max="11" step="1"
                    value={termMonths} onChange={(e) => setTermMonths(e.target.value === '' ? '' : Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </InputGroup>
              </div>

              <InputGroup label="Start Date" icon={Calendar}>
                <input 
                  type="date"
                  value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </InputGroup>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-6">
                <button 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 transition"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                  {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </button>
              </div>

              {showAdvanced && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <InputGroup label="Loan Type">
                    <div className="flex rounded-md shadow-sm">
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-l-md border ${loanType === 'amortizing' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                        onClick={() => setLoanType('amortizing')}
                      >
                        Amortizing
                      </button>
                      <button
                        className={`flex-1 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${loanType === 'interest-only' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
                        onClick={() => setLoanType('interest-only')}
                      >
                        Interest Only
                      </button>
                    </div>
                  </InputGroup>

                  <InputGroup label="Compound Frequency">
                    <select 
                      value={compoundFreq} onChange={(e) => setCompoundFreq(Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={12}>Monthly (Standard US)</option>
                      <option value={2}>Semi-Annually (Canada)</option>
                      <option value={1}>Annually</option>
                    </select>
                  </InputGroup>

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Extra Payment" icon={PlusCircle}>
                      <input 
                        type="number" min="0" step="50"
                        value={extraPayment} onChange={(e) => setExtraPayment(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </InputGroup>
                    <InputGroup label="Payment Frequency">
                      <select 
                        value={extraPaymentFreq} onChange={(e) => setExtraPaymentFreq(Number(e.target.value))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={365}>Daily</option>
                        <option value={52}>Weekly</option>
                        <option value={26}>Bi-weekly</option>
                        <option value={12}>Monthly</option>
                        <option value={4}>Quarterly</option>
                        <option value={2}>Semi-Annually</option>
                        <option value={1}>Annually</option>
                      </select>
                    </InputGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Annual Prop. Tax" icon={DollarSign}>
                      <input 
                        type="number" min="0" step="100"
                        value={propertyTax} onChange={(e) => setPropertyTax(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </InputGroup>
                    <InputGroup label="Annual Insurance" icon={DollarSign}>
                      <input 
                        type="number" min="0" step="100"
                        value={insurance} onChange={(e) => setInsurance(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </InputGroup>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            
            {calcData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                    <p className="text-blue-100 text-sm font-medium mb-1">Periodic Payment</p>
                    <h3 className="text-3xl font-bold">{formatCurrency(calcData.totalPayment)}</h3>
                    <div className="mt-4 pt-4 border-t border-white/20 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="opacity-80">Principal & Interest</span>
                        <span>{formatCurrency(calcData.basePayment + (Number(extraPayment)||0))}</span>
                      </div>
                      {calcData.totalPeriodicEscrow > 0 && (
                        <div className="flex justify-between">
                          <span className="opacity-80">Taxes & Insurance</span>
                          <span>{formatCurrency(calcData.totalPeriodicEscrow)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Total Interest Paid</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(calcData.totalInterest)}</h3>
                    {calcData.interestSaved > 0 && (
                      <div className="mt-4 inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                        <ArrowRight className="w-4 h-4 mr-1 transform rotate-90" />
                        Saved {formatCurrency(calcData.interestSaved)}
                      </div>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Payoff Date</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{formatDate(calcData.payoffDate)}</h3>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      {calcData.periodsToPayoff} {payFreq === 12 ? 'months' : payFreq === 26 ? 'bi-weekly periods' : 'weeks'}
                      {calcData.timeSavedPeriods > 0 && (
                         <span className="text-green-600 dark:text-green-400 font-medium ml-1">
                           ({calcData.timeSavedPeriods} periods saved!)
                         </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Amortization Over Time</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={calcData.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} minTickGap={30} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isDarkMode ? '#9ca3af' : '#6b7280' }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                          <RechartsTooltip 
                            formatter={(value) => formatCurrency(value, 0)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: isDarkMode ? '#1f2937' : '#fff' }}
                          />
                          <Area type="monotone" name="Remaining Balance" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                          <Area type="monotone" name="Accumulated Interest" dataKey="totalInterest" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorInterest)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center">
                    <h3 className="text-lg font-semibold w-full text-left mb-2 text-gray-900 dark:text-white">Cost Breakdown</h3>
                    <div className="h-48 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value) => formatCurrency(value, 0)} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Total Cost</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(calcData.totalCost, 0)}</span>
                      </div>
                    </div>
                    
                    <div className="w-full mt-4 space-y-2">
                      {pieData.map((item, index) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                            <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{((item.value / calcData.totalCost) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <Calculator className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Enter a loan amount and term to see results</p>
              </div>
            )}
          </div>
        </div>

        {calcData && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-500" />
                Amortization Schedule
              </h3>
              <button 
                onClick={handleExportCSV}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </button>
            </div>
            
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur text-gray-600 dark:text-gray-300 text-sm z-10">
                  <tr>
                    <th className="py-3 px-4 font-semibold border-b border-gray-200 dark:border-gray-700">Period</th>
                    <th className="py-3 px-4 font-semibold border-b border-gray-200 dark:border-gray-700">Date</th>
                    <th className="py-3 px-4 font-semibold border-b border-gray-200 dark:border-gray-700 text-right">Payment</th>
                    <th className="py-3 px-4 font-semibold border-b border-gray-200 dark:border-gray-700 text-right">Principal</th>
                    <th className="py-3 px-4 font-semibold border-b border-gray-200 dark:border-gray-700 text-right">Interest</th>
                    <th className="py-3 px-4 font-semibold border-b border-gray-200 dark:border-gray-700 text-right">Remaining Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm text-gray-700 dark:text-gray-300">
                  {calcData.schedule.map((row) => (
                    <tr key={row.period} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4">{row.period}</td>
                      <td className="py-3 px-4">{formatDate(row.date)}</td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(row.payment)}</td>
                      <td className="py-3 px-4 text-right text-blue-600 dark:text-blue-400">{formatCurrency(row.principal)}</td>
                      <td className="py-3 px-4 text-right text-red-500 dark:text-red-400">{formatCurrency(row.interest)}</td>
                      <td className="py-3 px-4 text-right font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
