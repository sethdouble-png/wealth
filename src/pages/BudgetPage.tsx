import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import type { BudgetState, ExpenseRecord, IncomeRecord } from '../types';
import { formatMoney } from '../lib/formatters';

export const BudgetPage = () => {
  const { profile } = useAuth();
  const [budget, setBudget] = useState('5000');
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [budgets, setBudgets] = useState<BudgetState[]>([]);

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

  const summary = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    const expenseTotal = expenses.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0);
    const incomeTotal = income.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0);
    const savings = incomeTotal - expenseTotal;
    const progress = Math.min(100, (expenseTotal / Number(budget || 0)) * 100);
    return { expenseTotal, incomeTotal, savings, progress };
  }, [budget, expenses, income]);

  const saveBudget = async () => {
    if (!profile?.id) return;
    await addDoc(collection(db, 'budgets'), {
      userId: profile.id,
      month: new Date().toISOString().slice(0, 7),
      totalBudget: Number(budget),
      categoryBudgets: {},
    });
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
        <label className="field-group">
          <span className="field-label">Monthly budget</span>
          <input className="glass-input" type="number" value={budget} onChange={(event) => setBudget(event.target.value)} />
        </label>
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
          <p>Budget: {formatMoney(Number(budget), profile?.baseCurrency || 'UGX')}</p>
          <p>Spent: {formatMoney(summary.expenseTotal, profile?.baseCurrency || 'UGX')}</p>
          <p>Savings: {formatMoney(summary.savings, profile?.baseCurrency || 'UGX')}</p>
        </div>
      </GlassCard>
    </div>
  );
};
