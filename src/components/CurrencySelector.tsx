import type { Currency } from '../types';
import { currencyOptions } from '../lib/formatters';

interface CurrencySelectorProps {
  value: Currency;
  onChange: (value: Currency) => void;
}

export const CurrencySelector = ({ value, onChange }: CurrencySelectorProps) => (
  <label className="field-group inline-field">
    <span className="field-label">Currency</span>
    <select className="glass-input" value={value} onChange={(event) => onChange(event.target.value as Currency)}>
      {currencyOptions.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  </label>
);
