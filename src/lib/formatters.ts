import type { Currency } from '../types';

export const currencySymbols: Record<Currency, string> = {
  UGX: 'UGX',
  AED: 'AED',
  USD: '$',
};

export const currencyOptions: Currency[] = ['UGX', 'AED', 'USD'];
export const defaultCategoryOptions = ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Misc'] as const;
export const expenseCategories = [...defaultCategoryOptions] as string[];

export const categoryOptions = (customCategories?: string[]) =>
  customCategories && customCategories.length ? customCategories : expenseCategories;

export const formatMoney = (value: number, currency: Currency) => {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(amount);

  return `${currencySymbols[currency]} ${formatted}`;
};

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export const monthKey = (value: string) => value.slice(0, 7);
