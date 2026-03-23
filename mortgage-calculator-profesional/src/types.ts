export type Frequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'semiannually' | 'annually';

export interface ExtraPayment {
  id: string;
  amount: number;
  frequency: Frequency | 'one-time';
}

export interface AmortizationEntry {
  paymentNumber: number;
  date: Date;
  payment: number;
  principal: number;
  interest: number;
  extraPayment: number;
  totalInterest: number;
  remainingBalance: number;
  additionalCosts: number;
}

export interface CalculationResults {
  monthlyPayment: number;
  periodicPayment: number;
  totalInterest: number;
  totalCost: number;
  totalCostWithFees: number;
  payoffDate: Date;
  interestSaved: number;
  timeSavedMonths: number;
  schedule: AmortizationEntry[];
  breakdown: {
    principal: number;
    interest: number;
    taxes: number;
    insurance: number;
    pmi: number;
    hoa: number;
    other: number;
  };
}
