import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { currencyOptions } from '../lib/formatters';
export const CurrencySelector = ({ value, onChange }) => (_jsxs("label", { className: "field-group inline-field", children: [_jsx("span", { className: "field-label", children: "Currency" }), _jsx("select", { className: "glass-input", value: value, onChange: (event) => onChange(event.target.value), children: currencyOptions.map((currency) => (_jsx("option", { value: currency, children: currency }, currency))) })] }));
//# sourceMappingURL=CurrencySelector.js.map