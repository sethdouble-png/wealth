import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { categoryOptions, currencyOptions } from '../lib/formatters';
import { convertAmount, getRates } from '../lib/currency';
import type { Currency, RecurringRecord, RecordType } from '../types';

const intervals = ['weekly', 'monthly', 'yearly'] as const;
const transactionTypes: RecordType[] = ['income', 'expense'];

export const RecurringPage = () => {
  const { profile } = useAuth();
  const [records, setRecords] = useState<RecurringRecord[]>([]);
  const [type, setType] = useState<RecordType>('expense');
  const [category, setCategory] = useState('Food');
  const [source, setSource] = useState('Salary');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [interval, setInterval] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [editingRecurring, setEditingRecurring] = useState<RecurringRecord | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [rates, setRates] = useState<Record<Currency, number>>({ UGX: 1, AED: 1, USD: 1 });

  useEffect(() => {
    if (!profile?.id) return;
    const q = query(collection(db, 'recurring'), where('userId', '==', profile.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRecords(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as RecurringRecord)));
    });
    return unsubscribe;
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.baseCurrency) return;
    getRates(profile.baseCurrency, profile.settings?.currencyApi || 'exchangerate.host').then((nextRates) => setRates(nextRates));
  }, [profile]);

  const availableCategories = useMemo(() => categoryOptions(profile?.settings.customCategories), [profile?.settings.customCategories]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (!profile?.id) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    const convertedAmount = convertAmount(value, currency, profile.baseCurrency, rates);
    const payload = {
      userId: profile.id,
      type,
      category: type === 'expense' ? category : undefined,
      source: type === 'income' ? source : undefined,
      amount: value,
      currency,
      interval,
      startDate,
      notes,
      active: true,
      convertedAmount,
    };

    try {
      if (editingRecurring) {
        await updateDoc(doc(db, 'recurring', editingRecurring.id), payload);
        setMessage('Recurring item updated successfully.');
        setEditingRecurring(null);
      } else {
        await addDoc(collection(db, 'recurring'), payload);
        setMessage('Recurring item saved successfully.');
      }
      setAmount('');
      setNotes('');
    } catch (err) {
      setError('Unable to save recurring item. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  const handleEdit = (record: RecurringRecord) => {
    setEditingRecurring(record);
    setType(record.type);
    setCategory(record.category || 'Food');
    setSource(record.source || 'Salary');
    setAmount(String(record.amount));
    setCurrency(record.currency);
    setInterval(record.interval);
    setStartDate(record.startDate);
    setNotes(record.notes);
  };

  const cancelEdit = () => {
    setEditingRecurring(null);
    setType('expense');
    setCategory('Food');
    setSource('Salary');
    setAmount('');
    setCurrency('USD');
    setInterval('monthly');
    setStartDate(new Date().toISOString().slice(0, 10));
    setNotes('');
  };

  const toggleActive = async (record: RecurringRecord) => {
    await updateDoc(doc(db, 'recurring', record.id), { active: !record.active });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, 'recurring', id));
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Recurring plans</p>
          <h1>Automate your income and bills</h1>
        </div>
        <Link to="/dashboard">
          <GlassButton variant="secondary">Back</GlassButton>
        </Link>
      </header>

      <GlassCard>
        <form onSubmit={handleSubmit} className="stacked-form">
          <div className="input-grid">
            <label className="field-group">
              <span className="field-label">Type</span>
              <select className="glass-input" value={type} onChange={(event) => setType(event.target.value as RecordType)}>
                {transactionTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            {type === 'expense' ? (
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
            ) : (
              <label className="field-group">
                <span className="field-label">Source</span>
                <input className="glass-input" value={source} onChange={(event) => setSource(event.target.value)} required />
              </label>
            )}
            <label className="field-group">
              <span className="field-label">Amount</span>
              <input className="glass-input" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} required />
            </label>
          </div>

          <div className="input-grid">
            <label className="field-group">
              <span className="field-label">Currency</span>
              <select className="glass-input" value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                {currencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group">
              <span className="field-label">Interval</span>
              <select className="glass-input" value={interval} onChange={(event) => setInterval(event.target.value as 'weekly' | 'monthly' | 'yearly')}>
                {intervals.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-group">
              <span className="field-label">Start date</span>
              <input className="glass-input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
            </label>
          </div>

          <label className="field-group">
            <span className="field-label">Notes</span>
            <input className="glass-input" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
          {message ? <p className="success-message">{message}</p> : null}
          {error ? <p className="error-message">{error}</p> : null}
          <div className="form-actions">
            <GlassButton type="submit">{editingRecurring ? 'Update recurring item' : 'Save recurring item'}</GlassButton>
            {editingRecurring ? (
              <GlassButton type="button" variant="secondary" onClick={cancelEdit}>
                Cancel
              </GlassButton>
            ) : null}
          </div>
        </form>
      </GlassCard>

      <GlassCard>
        <div className="section-header">
          <h3>Planned recurring records</h3>
          <span>{records.length} items</span>
        </div>
        <ul className="list-stack">
          {records.map((record) => (
            <li key={record.id} className="list-card">
              <div>
                <p className="list-title">{record.type === 'expense' ? record.category : record.source}</p>
                <p className="list-subtitle">{record.interval} • {record.startDate}</p>
                <p className="list-subtitle">{record.notes || 'No notes'}</p>
              </div>
              <div className="list-actions">
                <span className={`list-amount ${record.type === 'expense' ? 'negative' : 'positive'}`}>{record.currency} {record.amount.toFixed(2)}</span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="ghost-button" type="button" onClick={() => handleEdit(record)}>
                    Edit
                  </button>
                  <button className="ghost-button" type="button" onClick={() => toggleActive(record)}>
                    {record.active ? 'Pause' : 'Activate'}
                  </button>
                  <button className="ghost-button" type="button" onClick={() => handleDelete(record.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
};
