import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { CurrencySelector } from '../components/CurrencySelector';
import { IncomeItem } from '../components/IncomeItem';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { convertAmount, getRates } from '../lib/currency';
import type { Currency, IncomeRecord } from '../types';

export const IncomePage = () => {
  const { profile } = useAuth();
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [source, setSource] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [rates, setRates] = useState<Record<Currency, number>>({ UGX: 1, AED: 1, USD: 1 });

  useEffect(() => {
    if (!profile?.id) return;
    const q = query(collection(db, 'income'), where('userId', '==', profile.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIncome(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IncomeRecord)));
    });
    return unsubscribe;
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.baseCurrency) return;
    getRates(profile.baseCurrency, profile.settings?.currencyApi || 'exchangerate.host').then((nextRates) => setRates(nextRates as Record<Currency, number>));
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile?.id) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const convertedAmount = convertAmount(parsed, currency, profile.baseCurrency, rates);
    await addDoc(collection(db, 'income'), {
      userId: profile.id,
      source,
      amount: parsed,
      currency,
      convertedAmount,
      date,
      notes,
    });
    setSource('');
    setAmount('');
    setNotes('');
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'income', id));
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Income tracking</p>
          <h1>Grow your balance</h1>
        </div>
        <Link to="/dashboard">
          <GlassButton variant="secondary">Back</GlassButton>
        </Link>
      </header>

      <GlassCard>
        <form onSubmit={handleSubmit} className="stacked-form">
          <div className="input-grid">
            <label className="field-group">
              <span className="field-label">Source</span>
              <input className="glass-input" value={source} onChange={(event) => setSource(event.target.value)} required />
            </label>
            <label className="field-group">
              <span className="field-label">Amount</span>
              <input className="glass-input" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} required />
            </label>
            <CurrencySelector value={currency} onChange={setCurrency} />
          </div>
          <div className="input-grid">
            <label className="field-group">
              <span className="field-label">Date</span>
              <input className="glass-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </label>
            <label className="field-group">
              <span className="field-label">Notes</span>
              <input className="glass-input" value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
          </div>
          <GlassButton type="submit">Save income</GlassButton>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="section-header">
          <h3>Recent income</h3>
          <span>{income.length} entries</span>
        </div>
        <ul className="list-stack">
          {income.map((item) => (
            <IncomeItem key={item.id} item={item} baseCurrency={profile?.baseCurrency || 'UGX'} onDelete={handleDelete} />
          ))}
        </ul>
      </GlassCard>
    </div>
  );
};
