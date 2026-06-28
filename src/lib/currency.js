const supportedCurrencies = ['UGX', 'AED', 'USD'];
const cacheKey = 'wealth-currency-cache';
const cacheLifetimeMs = 12 * 60 * 60 * 1000;
const staticRates = {
    UGX: { UGX: 1, AED: 0.001, USD: 0.00027 },
    AED: { UGX: 366, AED: 1, USD: 0.27 },
    USD: { UGX: 3700, AED: 3.67, USD: 1 },
};
const buildUrl = (baseCurrency, provider) => {
    const symbols = supportedCurrencies.join(',');
    if (provider === 'frankfurter.app') {
        return `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${symbols}`;
    }
    if (provider === 'currencyfreaks') {
        return `https://api.currencyfreaks.com/latest?apikey=demo&base=${baseCurrency}`;
    }
    return `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${symbols}`;
};
const normalizeRates = (payload, baseCurrency, provider) => {
    if (provider === 'frankfurter.app') {
        return {
            [baseCurrency]: 1,
            ...Object.fromEntries(Object.entries(payload.rates || {}).map(([currency, value]) => [currency, Number(value)])),
        };
    }
    if (provider === 'currencyfreaks') {
        const rates = payload.rates || {};
        return {
            [baseCurrency]: 1,
            ...Object.fromEntries(supportedCurrencies
                .filter((currency) => currency !== baseCurrency)
                .map((currency) => [currency, Number(rates[currency] || staticRates[baseCurrency][currency])])),
        };
    }
    const rates = payload.rates || {};
    return {
        [baseCurrency]: 1,
        ...Object.fromEntries(supportedCurrencies
            .filter((currency) => currency !== baseCurrency)
            .map((currency) => [currency, Number(rates[currency] || staticRates[baseCurrency][currency])])),
    };
};
export const getRates = async (baseCurrency, provider) => {
    const cached = window.localStorage.getItem(cacheKey);
    if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.baseCurrency === baseCurrency && parsed?.provider === provider && Date.now() - parsed?.timestamp < cacheLifetimeMs) {
            return parsed.rates;
        }
    }
    try {
        const response = await fetch(buildUrl(baseCurrency, provider));
        if (!response.ok)
            throw new Error('Network response was not ok');
        const payload = await response.json();
        const rates = normalizeRates(payload, baseCurrency, provider);
        window.localStorage.setItem(cacheKey, JSON.stringify({ baseCurrency, provider, timestamp: Date.now(), rates }));
        return rates;
    }
    catch {
        return staticRates[baseCurrency];
    }
};
export const convertAmount = (amount, from, to, rates) => {
    if (from === to)
        return amount;
    return amount * (rates[to] / rates[from]);
};
//# sourceMappingURL=currency.js.map