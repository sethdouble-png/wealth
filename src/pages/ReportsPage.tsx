import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ExpenseChart } from '../components/Charts';
import { useAuth } from '../contexts/AuthContext';
import { useViewPreferences } from '../contexts/ViewPreferencesContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { ExpenseRecord, IncomeRecord } from '../types';
import { formatMoney } from '../lib/formatters';

export const ReportsPage = () => {
  const { profile } = useAuth();
  const { viewMode, selectedMonth, setViewMode, setSelectedMonth } = useViewPreferences('reports');
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    const expenseQuery = query(collection(db, 'expenses'), where('userId', '==', profile.id));
    const incomeQuery = query(collection(db, 'income'), where('userId', '==', profile.id));
    const expenseUnsub = onSnapshot(expenseQuery, (snapshot) => {
      setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ExpenseRecord)));
    });
    const incomeUnsub = onSnapshot(incomeQuery, (snapshot) => {
      setIncome(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as IncomeRecord)));
    });

    return () => {
      expenseUnsub();
      incomeUnsub();
    };
  }, [profile?.id]);

  const insights = useMemo(() => {
    const month = viewMode === 'monthly' ? selectedMonth : null;
    const monthlyExpenses = month ? expenses.filter((item) => item.date.startsWith(month)) : expenses;
    const monthlyIncome = month ? income.filter((item) => item.date.startsWith(month)) : income;
    const biggestCategory = monthlyExpenses.reduce((best, expense) => (expense.convertedAmount > best.value ? { name: expense.category, value: expense.convertedAmount } : best), { name: 'None', value: 0 });
    const highestSource = monthlyIncome.reduce((best, item) => (item.convertedAmount > best.value ? { name: item.source, value: item.convertedAmount } : best), { name: 'None', value: 0 });
    const averageSavings = monthlyIncome.reduce((sum, item) => sum + item.convertedAmount, 0) - monthlyExpenses.reduce((sum, item) => sum + item.convertedAmount, 0);

    return { biggestCategory, highestSource, averageSavings };
  }, [expenses, income, selectedMonth, viewMode]);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Monthly insights</h1>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="reports-view-mode">View</label>
          <select
            id="reports-view-mode"
            className="glass-input"
            value={viewMode}
            onChange={(event) => setViewMode(event.target.value as 'monthly' | 'overall')}
          >
            <option value="monthly">Monthly</option>
            <option value="overall">Overall</option>
          </select>
        </div>
      </header>

      <GlassCard>
        <div className="stats-list">
          <p>Biggest spending category: {insights.biggestCategory.name}</p>
          <p>Highest income source: {insights.highestSource.name}</p>
          <p>Average monthly savings: {formatMoney(insights.averageSavings, profile?.baseCurrency || 'UGX')}</p>
        </div>
      </GlassCard>

      <ExpenseChart
        expenses={viewMode === 'monthly' ? expenses.filter((item) => item.date.startsWith(selectedMonth)) : expenses}
        baseCurrency={profile?.baseCurrency || 'UGX'}
      />
    </div>
  );
};
