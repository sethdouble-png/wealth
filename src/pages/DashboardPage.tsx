import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { ExpenseChart, TrendChart } from '../components/Charts';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { ExpenseRecord, GoalRecord, IncomeRecord } from '../types';
import { formatMoney } from '../lib/formatters';
import { getRates } from '../lib/currency';
import { loadLocalCollection, saveLocalCollection } from '../lib/offline';

export const DashboardPage = () => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!profile?.id) return;
    const expenseQuery = query(collection(db, 'expenses'), where('userId', '==', profile.id));
    const incomeQuery = query(collection(db, 'income'), where('userId', '==', profile.id));
    const goalsQuery = query(collection(db, 'goals'), where('userId', '==', profile.id));

    const localExpenses = loadLocalCollection<ExpenseRecord>(`expenses-${profile.id}`);
    const localIncome = loadLocalCollection<IncomeRecord>(`income-${profile.id}`);
    const localGoals = loadLocalCollection<GoalRecord>(`goals-${profile.id}`);
    if (localExpenses.length) setExpenses(localExpenses);
    if (localIncome.length) setIncome(localIncome);
    if (localGoals.length) setGoals(localGoals);

    const expenseUnsub = onSnapshot(expenseQuery, (snapshot) => {
      const nextExpenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ExpenseRecord));
      setExpenses(nextExpenses);
      saveLocalCollection(`expenses-${profile.id}`, nextExpenses);
    });
    const incomeUnsub = onSnapshot(incomeQuery, (snapshot) => {
      const nextIncome = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IncomeRecord));
      setIncome(nextIncome);
      saveLocalCollection(`income-${profile.id}`, nextIncome);
    });
    const goalsUnsub = onSnapshot(goalsQuery, (snapshot) => {
      const nextGoals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as GoalRecord));
      setGoals(nextGoals);
      saveLocalCollection(`goals-${profile.id}`, nextGoals);
    });

    return () => {
      expenseUnsub();
      incomeUnsub();
      goalsUnsub();
    };
  }, [profile?.id]);

  useEffect(() => {
    if (!profile?.baseCurrency) return;
    getRates(profile.baseCurrency, profile.settings?.currencyApi || 'exchangerate.host').then((nextRates) => setRates(nextRates));
  }, [profile]);

  const totals = useMemo(() => {
    const monthKey = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = expenses.filter((item) => item.date.startsWith(monthKey)).reduce((sum, item) => sum + (item.convertedAmount || 0), 0);
    const monthlyIncome = income.filter((item) => item.date.startsWith(monthKey)).reduce((sum, item) => sum + (item.convertedAmount || 0), 0);
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const totalBudget = 5000;
    const progress = Math.min(100, (monthlyExpenses / (totalBudget || 1)) * 100);
    const budgetLabel = monthlyExpenses > totalBudget ? 'Over budget' : 'On track';

    return { monthlyExpenses, monthlyIncome, monthlySavings, progress, budgetLabel };
  }, [expenses, income]);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Today at a glance</p>
          <h1>{profile?.name || 'Your'} dashboard</h1>
        </div>
        <Link to="/reports">
          <GlassButton variant="secondary">Reports</GlassButton>
        </Link>
      </header>

      <div className="stats-grid">
        <GlassCard>
          <p className="metric-label">Income</p>
          <p className="metric-value positive">{formatMoney(totals.monthlyIncome, profile?.baseCurrency || 'UGX')}</p>
        </GlassCard>
        <GlassCard>
          <p className="metric-label">Expenses</p>
          <p className="metric-value negative">{formatMoney(totals.monthlyExpenses, profile?.baseCurrency || 'UGX')}</p>
        </GlassCard>
        <GlassCard>
          <p className="metric-label">Savings</p>
          <p className="metric-value">{formatMoney(totals.monthlySavings, profile?.baseCurrency || 'UGX')}</p>
        </GlassCard>
      </div>

      <GlassCard className="progress-card">
        <div className="progress-row">
          <h3>Monthly budget progress</h3>
          <span>{totals.progress.toFixed(0)}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${totals.progress}%` }} />
        </div>
        <div className="stats-list">
          <p>{totals.budgetLabel}</p>
          {totals.budgetLabel === 'Over budget' ? <p className="error-message">Review your budget plan.</p> : null}
        </div>
      </GlassCard>

      <div className="chart-grid">
        <ExpenseChart expenses={expenses} income={income} baseCurrency={profile?.baseCurrency || 'UGX'} />
        <TrendChart expenses={expenses} income={income} />
      </div>

      <GlassCard>
        <div className="section-header">
          <h3>Goals</h3>
          <Link to="/goals">Manage</Link>
        </div>
        <div className="goal-list">
          {goals.length === 0 ? <p className="empty-state">No goals yet. Create one to stay on track.</p> : goals.map((goal) => <p key={goal.id}>{goal.title}</p>)}
        </div>
      </GlassCard>
    </div>
  );
};
