import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { ExpenseItem } from '../components/ExpenseItem';
import { CurrencySelector } from '../components/CurrencySelector';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { categoryOptions } from '../lib/formatters';
import { convertAmount, getRates } from '../lib/currency';
import type { Currency, ExpenseRecord, RecordType } from '../types';

export const ExpensesPage = () => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [viewMode, setViewMode] = useState<'monthly' | 'overall'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
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

  const filteredExpenses = useMemo(
    () => (viewMode === 'monthly' ? expenses.filter((item) => item.date.startsWith(selectedMonth)) : expenses),
    [expenses, selectedMonth, viewMode]
  );
  const availableCategories = useMemo(() => categoryOptions(profile?.settings.customCategories), [profile?.settings.customCategories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!profile?.id) return;
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const convertedAmount = convertAmount(parsed, currency, profile.baseCurrency, rates);
    const payload = {
      userId: profile.id,
      category,
      amount: parsed,
      currency,
      convertedAmount,
      date,
      notes,
    };

    try {
      if (editingExpense) {
        await updateDoc(doc(db, 'expenses', editingExpense.id), payload);
        setMessage('Expense updated successfully.');
        setEditingExpense(null);
      } else {
        await addDoc(collection(db, 'expenses'), payload);
        setMessage('Expense saved successfully.');
      }
      setAmount('');
      setNotes('');
      setCategory('Food');
      setCurrency('USD');
      setDate(new Date().toISOString().slice(0, 10));
    } catch (err) {
      setError('Unable to save expense. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const handleEdit = (expense: ExpenseRecord) => {
    setEditingExpense(expense);
    setCategory(expense.category);
    setAmount(String(expense.amount));
    setCurrency(expense.currency);
    setDate(expense.date);
    setNotes(expense.notes);
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    setCategory('Food');
    setAmount('');
    setCurrency('USD');
    setDate(new Date().toISOString().slice(0, 10));
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
        <div className="field-group">
          <label className="field-label" htmlFor="expenses-view-mode">View</label>
          <select
            id="expenses-view-mode"
            className="glass-input"
            value={viewMode}
            onChange={(event) => setViewMode(event.target.value as 'monthly' | 'overall')}
          >
            <option value="monthly">Monthly</option>
            <option value="overall">Overall</option>
          </select>
        </div>
        {viewMode === 'monthly' ? (
          <div className="field-group">
            <label className="field-label" htmlFor="expenses-month-picker">Month</label>
            <input
              id="expenses-month-picker"
              className="glass-input"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
          </div>
        ) : null}
        <Link to="/dashboard">
          <GlassButton variant="secondary">Back</GlassButton>
        </Link>
      </header>

      <GlassCard>
        <form onSubmit={handleSubmit} className="stacked-form">
          <div className="input-grid">
            <label className="field-group">
              <span className="field-label">Category</span>
              <select className="glass-input" value={category} onChange={(event) => setCategory(event.target.value)}>
                {availableCategories.map((option) => (
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
          {message ? <p className="success-message">{message}</p> : null}
          {error ? <p className="error-message">{error}</p> : null}
          <div className="form-actions">
            <GlassButton type="submit">{editingExpense ? 'Update expense' : 'Save expense'}</GlassButton>
            {editingExpense ? (
              <GlassButton type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </GlassButton>
            ) : null}
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="section-header">
          <h3>Recent expenses</h3>
          <span>{filteredExpenses.length} entries</span>
        </div>
        <ul className="list-stack">
          {filteredExpenses.map((item) => (
            <ExpenseItem
              key={item.id}
              item={item}
              baseCurrency={profile?.baseCurrency || 'UGX'}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </ul>
      </GlassCard>
    </div>
  );
};
