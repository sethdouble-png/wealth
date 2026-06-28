import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { ExpenseItem } from '../components/ExpenseItem';
import { CurrencySelector } from '../components/CurrencySelector';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { expenseCategories } from '../lib/formatters';
import { convertAmount, getRates } from '../lib/currency';
import type { Currency, ExpenseCategory, ExpenseRecord } from '../types';

export const ExpensesPage = () => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [rates, setRates] = useState<Record<Currency, number>>({ UGX: 1, AED: 1, USD: 1 });

  useEffect(() => {
    if (!profile?.id) return;
    const q = query(collection(db, 'expenses'), where('userId', '==', profile.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ExpenseRecord)));
    });
    return unsubscribe;
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.baseCurrency) return;
    getRates(profile.baseCurrency, profile.settings?.currencyApi || 'exchangerate.host').then((nextRates) => setRates(nextRates as Record<Currency, number>));
  }, [profile]);

  const filteredExpenses = useMemo(() => expenses, [expenses]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile?.id) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const convertedAmount = convertAmount(parsed, currency, profile.baseCurrency, rates);
    await addDoc(collection(db, 'expenses'), {
      userId: profile.id,
      category,
      amount: parsed,
      currency,
      convertedAmount,
      date,
      notes,
    });
    setAmount('');
    setNotes('');
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'expenses', id));
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Expense tracking</p>
          <h1>Spend with intention</h1>
        </div>
        <Link to="/dashboard">
          <GlassButton variant="secondary">Back</GlassButton>
        </Link>
      </header>

      <GlassCard>
        <form onSubmit={handleSubmit} className="stacked-form">
          <div className="input-grid">
            <label className="field-group">
              <span className="field-label">Category</span>
              <select className="glass-input" value={category} onChange={(event) => setCategory(event.target.value as ExpenseCategory)}>
                {expenseCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
          <GlassButton type="submit">Save expense</GlassButton>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="section-header">
          <h3>Recent expenses</h3>
          <span>{filteredExpenses.length} entries</span>
        </div>
        <ul className="list-stack">
          {filteredExpenses.map((item) => (
            <ExpenseItem key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </ul>
      </GlassCard>
    </div>
  );
};
