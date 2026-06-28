export type Currency = 'UGX' | 'AED' | 'USD';
export type ExpenseCategory = 'Food' | 'Transport' | 'Rent' | 'Utilities' | 'Shopping' | 'Misc';
export type RecordType = 'income' | 'expense';

export interface ExpenseRecord {
  id: string;
  userId: string;
  category: ExpenseCategory | string;
  amount: number;
  currency: Currency;
  convertedAmount: number;
  date: string;
  notes: string;
  receiptUrl?: string;
}

export interface IncomeRecord {
  id: string;
  userId: string;
  source: string;
  amount: number;
  currency: Currency;
  convertedAmount: number;
  date: string;
  notes: string;
  receiptUrl?: string;
}

export interface RecurringRecord {
  id: string;
  userId: string;
  type: RecordType;
  category?: ExpenseCategory | string;
  source?: string;
  amount: number;
  currency: Currency;
  interval: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  notes: string;
  active: boolean;
}

export interface BudgetState {
  id: string;
  userId: string;
  month: string;
  totalBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface GoalRecord {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  baseCurrency: Currency;
  settings: {
    theme: 'light' | 'dark';
    currencyApi: 'exchangerate.host' | 'frankfurter.app' | 'currencyfreaks';
    customCategories: string[];
  };
}
