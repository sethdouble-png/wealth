import type { Currency } from '../types';

export type CurrencyApiProvider = 'exchangerate.host' | 'frankfurter.app' | 'currencyfreaks';

const supportedCurrencies: Currency[] = ['UGX', 'AED', 'USD'];
const cacheKey = 'wealth-currency-cache';
const cacheLifetimeMs = 12 * 60 * 60 * 1000;

const staticRates: Record<Currency, Record<Currency, number>> = {
  UGX: { UGX: 1, AED: 0.001, USD: 0.00027 },
  AED: { UGX: 366, AED: 1, USD: 0.27 },
  USD: { UGX: 3700, AED: 3.67, USD: 1 },
};

const buildUrl = (baseCurrency: Currency, provider: CurrencyApiProvider) => {
  const symbols = supportedCurrencies.join(',');
  if (provider === 'frankfurter.app') {
    return `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${symbols}`;
  }
  if (provider === 'currencyfreaks') {
    return `https://api.currencyfreaks.com/latest?apikey=demo&base=${baseCurrency}`;
  }
  return `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${symbols}`;
};

const normalizeRates = (payload: any, baseCurrency: Currency, provider: CurrencyApiProvider) => {
  if (provider === 'frankfurter.app') {
    return {
      [baseCurrency]: 1,
      ...Object.fromEntries(
        Object.entries(payload.rates || {}).map(([currency, value]: [string, any]) => [currency as Currency, Number(value)])
      ),
    } as Record<Currency, number>;
  }

  if (provider === 'currencyfreaks') {
    const rates = payload.rates || {};
    return {
      [baseCurrency]: 1,
      ...Object.fromEntries(
        supportedCurrencies
          .filter((currency) => currency !== baseCurrency)
          .map((currency) => [currency, Number(rates[currency] || staticRates[baseCurrency][currency])])
      ),
    } as Record<Currency, number>;
  }

  const rates = payload.rates || {};
  return {
    [baseCurrency]: 1,
    ...Object.fromEntries(
      supportedCurrencies
        .filter((currency) => currency !== baseCurrency)
        .map((currency) => [currency, Number(rates[currency] || staticRates[baseCurrency][currency])])
    ),
  } as Record<Currency, number>;
};

export const getRates = async (baseCurrency: Currency, provider: CurrencyApiProvider) => {
  const cached = window.localStorage.getItem(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed?.baseCurrency === baseCurrency && parsed?.provider === provider && Date.now() - parsed?.timestamp < cacheLifetimeMs) {
      return parsed.rates as Record<Currency, number>;
    }
  }

  try {
    const response = await fetch(buildUrl(baseCurrency, provider));
    if (!response.ok) throw new Error('Network response was not ok');
    const payload = await response.json();
    const rates = normalizeRates(payload, baseCurrency, provider);
    window.localStorage.setItem(
      cacheKey,
      JSON.stringify({ baseCurrency, provider, timestamp: Date.now(), rates })
    );
    return rates;
  } catch {
    return staticRates[baseCurrency];
  }
};

export const convertAmount = (amount: number, from: Currency, to: Currency, rates: Record<Currency, number>) => {
  if (from === to) return amount;
  return amount * (rates[to] / rates[from]);
};
