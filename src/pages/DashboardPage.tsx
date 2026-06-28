import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { ExpenseChart, TrendChart } from '../components/Charts';
import { useAuth } from '../contexts/AuthContext';
import { useViewPreferences } from '../contexts/ViewPreferencesContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import type { ExpenseRecord, GoalRecord, IncomeRecord, BudgetState } from '../types';
import { formatMoney } from '../lib/formatters';
import { getRates } from '../lib/currency';
import { loadLocalCollection, saveLocalCollection } from '../lib/offline';

export const DashboardPage = () => {
  const { profile } = useAuth();
  const { viewMode, selectedMonth, setViewMode, setSelectedMonth } = useViewPreferences('dashboard');
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [currentBudget, setCurrentBudget] = useState<BudgetState | null>(null);
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
    if (!profile?.id || viewMode === 'overall') {
      setCurrentBudget(null);
      return;
    }
    const budgetQuery = query(collection(db, 'budgets'), where('userId', '==', profile.id), where('month', '==', selectedMonth));
    const budgetUnsub = onSnapshot(budgetQuery, (snapshot) => {
      const [budget] = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as BudgetState));
      setCurrentBudget(budget || null);
    });

    return () => budgetUnsub();
  }, [profile?.id, selectedMonth, viewMode]);

  useEffect(() => {
    if (!profile?.baseCurrency) return;
    getRates(profile.baseCurrency, profile.settings?.currencyApi || 'exchangerate.host').then((nextRates) => setRates(nextRates));
  }, [profile]);

  const totals = useMemo(() => {
    const monthKey = viewMode === 'monthly' ? selectedMonth : null;
    const monthlyExpenses = monthKey
      ? expenses.filter((item) => item.date.startsWith(monthKey)).reduce((sum, item) => sum + (item.convertedAmount || 0), 0)
      : expenses.reduce((sum, item) => sum + (item.convertedAmount || 0), 0);
    const monthlyIncome = monthKey
      ? income.filter((item) => item.date.startsWith(monthKey)).reduce((sum, item) => sum + (item.convertedAmount || 0), 0)
      : income.reduce((sum, item) => sum + (item.convertedAmount || 0), 0);
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const totalBudget = viewMode === 'monthly' ? currentBudget?.totalBudget ?? 0 : 0;
    const progress = viewMode === 'monthly' && totalBudget > 0 ? Math.min(100, (monthlyExpenses / totalBudget) * 100) : 0;
    const budgetLabel = viewMode === 'monthly'
      ? totalBudget > 0
        ? monthlyExpenses > totalBudget
          ? 'Over budget'
          : 'On track'
        : 'No budget set'
      : 'Overall view';

    return { monthlyExpenses, monthlyIncome, monthlySavings, progress, budgetLabel };
  }, [expenses, income, currentBudget, selectedMonth, viewMode]);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Monthly performance</p>
          <h1>{profile?.name || 'Your'} dashboard</h1>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="dashboard-view-mode">View</label>
          <select
            id="dashboard-view-mode"
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
            <label className="field-label" htmlFor="dashboard-month-picker">Month</label>
            <input
              id="dashboard-month-picker"
              className="glass-input"
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
            />
          </div>
        ) : null}
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
        <ExpenseChart
          expenses={viewMode === 'monthly' ? expenses.filter((item) => item.date.startsWith(selectedMonth)) : expenses}
          baseCurrency={profile?.baseCurrency || 'UGX'}
        />
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
