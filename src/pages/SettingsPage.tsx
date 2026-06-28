import { useState } from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { currencyOptions } from '../lib/formatters';
import type { Currency } from '../types';

export const SettingsPage = () => {
  const { profile, updateProfile, logout } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [baseCurrency, setBaseCurrency] = useState<Currency>(profile?.baseCurrency || 'UGX');

  const handleSave = async () => {
    await updateProfile({ name, baseCurrency });
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Personalize your experience</h1>
        </div>
      </header>

      <GlassCard>
        <label className="field-group">
          <span className="field-label">Name</span>
          <input className="glass-input" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="field-group">
          <span className="field-label">Base currency</span>
          <select className="glass-input" value={baseCurrency} onChange={(event) => setBaseCurrency(event.target.value as Currency)}>
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <GlassButton onClick={handleSave}>Save preferences</GlassButton>
      </GlassCard>

      <GlassCard>
        <GlassButton variant="secondary" onClick={() => logout()}>
          Sign out
        </GlassButton>
      </GlassCard>
    </div>
  );
};
