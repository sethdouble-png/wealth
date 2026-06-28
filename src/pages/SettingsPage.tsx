import { useEffect, useMemo, useState } from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { currencyOptions, categoryOptions } from '../lib/formatters';
import type { Currency } from '../types';

export const SettingsPage = () => {
  const { profile, updateProfile, logout } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [baseCurrency, setBaseCurrency] = useState<Currency>(profile?.baseCurrency || 'UGX');
  const [theme, setTheme] = useState(profile?.settings.theme || 'light');
  const [customCategories, setCustomCategories] = useState((profile?.settings.customCategories || []).join(', '));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setBaseCurrency(profile.baseCurrency);
    setTheme(profile.settings.theme);
    setCustomCategories((profile.settings.customCategories || []).join(', '));
  }, [profile]);

  const categoriesList = useMemo(() => categoryOptions(profile?.settings.customCategories), [profile?.settings.customCategories]);

  const handleSave = async () => {
    setMessage('');
    setError('');
    try {
      await updateProfile({
        name,
        baseCurrency,
        settings: {
          ...profile?.settings,
          theme: theme as 'light' | 'dark',
          customCategories: customCategories.split(',').map((value) => value.trim()).filter(Boolean),
        },
      });
      setMessage('Settings saved successfully.');
    } catch (err) {
      setError('Unable to save settings. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    }
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
        <label className="field-group">
          <span className="field-label">Theme</span>
          <select className="glass-input" value={theme} onChange={(event) => setTheme(event.target.value)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="field-group">
          <span className="field-label">Custom categories</span>
          <input
            className="glass-input"
            value={customCategories}
            placeholder="Comma-separated categories"
            onChange={(event) => setCustomCategories(event.target.value)}
          />
        </label>
        {message ? <p className="success-message">{message}</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <GlassButton onClick={handleSave}>Save preferences</GlassButton>
      </GlassCard>
      <GlassCard>
        <p className="list-subtitle">Available categories: {categoriesList.join(', ')}</p>
      </GlassCard>
      <GlassCard>
        <GlassButton variant="secondary" onClick={() => logout()}>
          Sign out
        </GlassButton>
      </GlassCard>

      <GlassCard>
        <GlassButton variant="secondary" onClick={() => logout()}>
          Sign out
        </GlassButton>
      </GlassCard>
    </div>
  );
};
