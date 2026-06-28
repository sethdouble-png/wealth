export const currencySymbols = {
    UGX: 'UGX',
    AED: 'AED',
    USD: '$',
};
export const currencyOptions = ['UGX', 'AED', 'USD'];
export const expenseCategories = ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Misc'];
export const formatMoney = (value, currency) => {
    const amount = Number.isFinite(value) ? value : 0;
    const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: currency === 'USD' ? 2 : 0,
        minimumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(amount);
    return `${currencySymbols[currency]} ${formatted}`;
};
export const formatDate = (value) => new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});
export const monthKey = (value) => value.slice(0, 7);
//# sourceMappingURL=formatters.js.map