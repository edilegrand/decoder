import { addMonths, addWeeks, parseISO, isValid } from 'date-fns';
import { AmortizationEntry, CalculationResults, ExtraPayment, Frequency } from '../types';

const FREQUENCY_MAP: Record<Frequency | 'one-time', number> = {
  weekly: 52,
  biweekly: 26,
  monthly: 12,
  quarterly: 4,
  semiannually: 2,
  annually: 1,
  'one-time': 0,
};

export function calculateMortgage(inputs: {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  paymentFrequency: Frequency;
  startDate: string;
  propertyTax: number;
  propertyTaxType: 'monthly' | 'yearly';
  homeInsurance: number;
  homeInsuranceType: 'monthly' | 'yearly';
  hoaFees: number;
  hoaFeesType: 'monthly' | 'yearly';
  otherCosts: number;
  otherCostsType: 'monthly' | 'yearly';
  pmi: number;
  pmiType: 'monthly' | 'yearly';
  extraPayments: ExtraPayment[];
}): CalculationResults {
  const {
    homePrice,
    downPayment,
    interestRate,
    loanTermYears,
    paymentFrequency,
    startDate,
    propertyTax,
    propertyTaxType,
    homeInsurance,
    homeInsuranceType,
    hoaFees,
    hoaFeesType,
    otherCosts,
    otherCostsType,
    pmi,
    pmiType,
    extraPayments,
  } = inputs;

  const principal = Math.max(0, homePrice - downPayment);
  const annualRate = interestRate / 100;
  const periodsPerYear = FREQUENCY_MAP[paymentFrequency];
  const totalPeriods = loanTermYears * periodsPerYear;
  const periodicRate = annualRate / periodsPerYear;

  // Standard Mortgage Formula: M = P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
  let periodicPayment = 0;
  if (periodicRate === 0) {
    periodicPayment = totalPeriods > 0 ? principal / totalPeriods : 0;
  } else if (totalPeriods > 0) {
    periodicPayment =
      (principal * (periodicRate * Math.pow(1 + periodicRate, totalPeriods))) /
      (Math.pow(1 + periodicRate, totalPeriods) - 1);
  }

  // Monthly equivalent for display
  const monthlyPayment = (periodicPayment * periodsPerYear) / 12;

  // Additional costs normalized to periodic
  const getPeriodicCost = (val: number, type: 'monthly' | 'yearly') => {
    const yearly = type === 'monthly' ? val * 12 : val;
    return yearly / periodsPerYear;
  };

  const periodicTax = getPeriodicCost(propertyTax, propertyTaxType);
  const periodicInsurance = getPeriodicCost(homeInsurance, homeInsuranceType);
  const periodicHoa = getPeriodicCost(hoaFees, hoaFeesType);
  const periodicOther = getPeriodicCost(otherCosts, otherCostsType);
  const periodicPmi = getPeriodicCost(pmi, pmiType);
  const totalPeriodicAdditionalBase = periodicTax + periodicInsurance + periodicHoa + periodicOther;

  // Amortization Schedule
  const schedule: AmortizationEntry[] = [];
  let remainingBalance = principal;
  let totalInterest = 0;
  let totalPmiPaid = 0;
  let currentDate = parseISO(startDate);
  if (!isValid(currentDate)) {
    currentDate = new Date();
  }
  let paymentNumber = 0;

  const appliedOneTimeIds = new Set<string>();

  while (remainingBalance > 0.01 && paymentNumber < 1200) {
    paymentNumber++;
    
    const interestPayment = remainingBalance * periodicRate;
    let principalPayment = Math.min(remainingBalance, periodicPayment - interestPayment);
    
    // PMI logic: usually paid until LTV is 80%
    const currentPmi = (remainingBalance > homePrice * 0.8) ? periodicPmi : 0;
    totalPmiPaid += currentPmi;

    let extraPaymentAmount = 0;
    for (const ep of extraPayments) {
      if (ep.frequency === 'one-time') {
        if (!appliedOneTimeIds.has(ep.id)) {
          extraPaymentAmount += ep.amount;
          appliedOneTimeIds.add(ep.id);
        }
      } else {
        const epFreq = FREQUENCY_MAP[ep.frequency as Frequency];
        const normalizedAmount = (ep.amount * epFreq) / periodsPerYear;
        extraPaymentAmount += normalizedAmount;
      }
    }
    
    const actualPrincipalPaid = Math.min(remainingBalance, principalPayment + extraPaymentAmount);
    remainingBalance -= actualPrincipalPaid;
    totalInterest += interestPayment;

    schedule.push({
      paymentNumber,
      date: new Date(currentDate),
      payment: periodicPayment,
      principal: Math.max(0, actualPrincipalPaid - extraPaymentAmount),
      interest: interestPayment,
      extraPayment: Math.max(0, actualPrincipalPaid - principalPayment),
      totalInterest,
      remainingBalance,
      additionalCosts: totalPeriodicAdditionalBase + currentPmi,
    });

    // Advance date
    if (paymentFrequency === 'weekly') currentDate = addWeeks(currentDate, 1);
    else if (paymentFrequency === 'biweekly') currentDate = addWeeks(currentDate, 2);
    else if (paymentFrequency === 'monthly') currentDate = addMonths(currentDate, 1);
    else if (paymentFrequency === 'quarterly') currentDate = addMonths(currentDate, 3);
    else if (paymentFrequency === 'semiannually') currentDate = addMonths(currentDate, 6);
    else if (paymentFrequency === 'annually') currentDate = addMonths(currentDate, 12);
  }

  const payoffDate = schedule.length > 0 ? schedule[schedule.length - 1].date : new Date();
  
  // Baseline for "Saved"
  // We'll run a quick baseline calculation without extra payments
  const baselineScheduleLength = totalPeriods; // Roughly
  // A more accurate baseline would be another loop, but let's estimate or skip for now to keep it fast.
  // Actually, the prompt asks for "Interest Saved" and "Time Saved".
  
  let baselineTotalInterest = 0;
  if (periodicRate === 0) {
    baselineTotalInterest = 0;
  } else {
    baselineTotalInterest = (periodicPayment * totalPeriods) - principal;
  }
  
  const interestSaved = Math.max(0, baselineTotalInterest - totalInterest);
  const timeSavedMonths = Math.max(0, (totalPeriods - schedule.length) * (12 / periodsPerYear));

  return {
    monthlyPayment,
    periodicPayment,
    totalInterest,
    totalCost: principal + totalInterest,
    totalCostWithFees: principal + totalInterest + totalPmiPaid + (totalPeriodicAdditionalBase * schedule.length),
    payoffDate,
    interestSaved,
    timeSavedMonths,
    schedule,
    breakdown: {
      principal,
      interest: totalInterest,
      taxes: periodicTax * schedule.length,
      insurance: periodicInsurance * schedule.length,
      pmi: totalPmiPaid,
      hoa: periodicHoa * schedule.length,
      other: periodicOther * schedule.length,
    }
  };
}
