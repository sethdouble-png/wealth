import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import type { BudgetState, ExpenseRecord, IncomeRecord } from '../types';
import { categoryOptions, formatMoney } from '../lib/formatters';

export const BudgetPage = () => {
  const { profile } = useAuth();
  const [budget, setBudget] = useState('');
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetState[]>([]);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const availableCategories = useMemo(() => categoryOptions(profile?.settings.customCategories), [profile?.settings.customCategories]);
  const [viewMode, setViewMode] = useState<'monthly' | 'overall'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const currentBudget = budgets.find((item) => item.month === selectedMonth);

  useEffect(() => {
    if (!profile?.id) return;
    const expenseQuery = query(collection(db, 'expenses'), where('userId', '==', profile.id));
    const incomeQuery = query(collection(db, 'income'), where('userId', '==', profile.id));
    const budgetQuery = query(collection(db, 'budgets'), where('userId', '==', profile.id));

    const expenseUnsub = onSnapshot(expenseQuery, (snapshot) => {
      setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ExpenseRecord)));
    });
    const incomeUnsub = onSnapshot(incomeQuery, (snapshot) => {
      setIncome(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IncomeRecord)));
    });
    const budgetUnsub = onSnapshot(budgetQuery, (snapshot) => {
      setBudgets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BudgetState)));
    });

    return () => {
      expenseUnsub();
      incomeUnsub();
      budgetUnsub();
    };
  }, [profile?.id]);

  useEffect(() => {
    if (!currentBudget) {
      setBudget('');
      setCategoryBudgets(Object.fromEntries(availableCategories.map((category) => [category, '0'])));
      return;
    }
    setBudget(currentBudget.totalBudget.toString());
    setCategoryBudgets(
      Object.fromEntries(
        availableCategories.map((category) => [category, String(currentBudget.categoryBudgets?.[category] ?? 0)])
      )
    );
  }, [currentBudget, availableCategories]);

  const summary = useMemo(() => {
    const month = viewMode === 'monthly' ? selectedMonth : null;
    const expenseTotal = month
      ? expenses.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0)
      : expenses.reduce((sum, item) => sum + item.convertedAmount, 0);
    const incomeTotal = month
      ? income.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0)
      : income.reduce((sum, item) => sum + item.convertedAmount, 0);
    const savings = incomeTotal - expenseTotal;
    const totalBudgetValue = Number(budget || 0);
    const progress = viewMode === 'monthly' && totalBudgetValue > 0 ? Math.min(100, (expenseTotal / totalBudgetValue) * 100) : 0;
    const budgetLabel = viewMode === 'monthly'
      ? totalBudgetValue > 0
        ? expenseTotal > totalBudgetValue
          ? 'Over budget'
          : 'On track'
        : 'No budget set'
      : 'Overall view';
    const categorySpent = Object.fromEntries(
      availableCategories.map((category) => [
        category,
        (month ? expenses.filter((item) => item.date.startsWith(month) && item.category === category) : expenses.filter((item) => item.category === category))
          .reduce((sum, item) => sum + item.convertedAmount, 0),
      ])
    );
    return { expenseTotal, incomeTotal, savings, progress, budgetLabel, categorySpent };
  }, [budget, expenses, income, availableCategories, selectedMonth, viewMode]);

  const saveBudget = async () => {
    setMessage('');
    setError('');
    if (!profile?.id) return;
    const payload = {
      userId: profile.id,
      month: selectedMonth,
      totalBudget: Number(budget),
      categoryBudgets: Object.fromEntries(
        availableCategories.map((category) => [category, Number(categoryBudgets[category] || 0)])
      ),
    } as BudgetState;

    try {
      if (currentBudget) {
        await setDoc(doc(db, 'budgets', currentBudget.id), payload, { merge: true });
      } else {
        await addDoc(collection(db, 'budgets'), payload);
      }
      setMessage('Budget saved successfully.');
    } catch (err) {
      setError('Unable to save budget. Please try again.');
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Budgeting</p>
          <h1>Keep your month on track</h1>
        </div>
      </header>

      <GlassCard>
        <div className="field-group">
          <label className="field-label" htmlFor="budget-view-mode">View</label>
          <select
            id="budget-view-mode"
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
            <label className="field-label" htmlFor="budget-month-picker">Month</label>
            <input
              id="budget-month-picker"
              className="glass-input"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
          </div>
        ) : null}
        <label className="field-group">
          <span className="field-label">Monthly budget</span>
          <input className="glass-input" type="number" value={budget} onChange={(event) => setBudget(event.target.value)} />
        </label>
        {message ? <p className="success-message">{message}</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <GlassButton onClick={saveBudget}>Save budget</GlassButton>
      </GlassCard>

      <GlassCard className="progress-card">
        <div className="progress-row">
          <h3>Spending vs budget</h3>
          <span>{summary.progress.toFixed(0)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${summary.progress}%` }} />
        </div>
        <div className="stats-list">
          <p>Budget: {budget ? formatMoney(Number(budget), profile?.baseCurrency || 'UGX') : 'Not set'}</p>
          <p>Spent: {formatMoney(summary.expenseTotal, profile?.baseCurrency || 'UGX')}</p>
          <p>Savings: {formatMoney(summary.savings, profile?.baseCurrency || 'UGX')}</p>
        </div>
        <div className="stats-list">
          <p>{summary.budgetLabel === 'No budget set' ? 'No monthly budget has been saved.' : summary.budgetLabel === 'Over budget' ? 'Over budget this month' : 'On track with your budget'}</p>
          <p>{summary.budgetLabel === 'No budget set' ? 'Save a budget to start tracking progress.' : summary.expenseTotal > Number(budget || 0) ? 'Review category budgets below' : 'Keep going!'}</p>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="section-header">
          <h3>Category budgets</h3>
          <span>{availableCategories.length} categories</span>
        </div>
        <div className="input-grid">
          {availableCategories.map((category) => (
            <label className="field-group" key={category}>
              <span className="field-label">{category}</span>
              <input
                className="glass-input"
                type="number"
                value={categoryBudgets[category] ?? '0'}
                onChange={(event) => setCategoryBudgets((state) => ({ ...state, [category]: event.target.value }))}
              />
            </label>
          ))}
        </div>
        <GlassButton onClick={saveBudget}>Save budget</GlassButton>
      </GlassCard>

      <GlassCard>
        <div className="section-header">
          <h3>Category spending</h3>
        </div>
        <div className="stats-list">
          {availableCategories.map((category) => {
            const spent = summary.categorySpent[category] || 0;
            const target = Number(categoryBudgets[category] || 0);
            return (
              <p key={category}>
                {category}: {formatMoney(spent, profile?.baseCurrency || 'UGX')} / {formatMoney(target, profile?.baseCurrency || 'UGX')} {spent > target ? '⚠️' : ''}
              </p>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
