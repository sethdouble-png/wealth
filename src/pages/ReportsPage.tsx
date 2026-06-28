import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { ExpenseChart } from '../components/Charts';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import type { ExpenseRecord, IncomeRecord } from '../types';
import { formatMoney } from '../lib/formatters';

export const ReportsPage = () => {
  const { profile } = useAuth();
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [income, setIncome] = useState<IncomeRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

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
    const month = selectedMonth;
    const monthlyExpenses = expenses.filter((item) => item.date.startsWith(month));
    const monthlyIncome = income.filter((item) => item.date.startsWith(month));
    const biggestCategory = monthlyExpenses.reduce((best, expense) => (expense.convertedAmount > best.value ? { name: expense.category, value: expense.convertedAmount } : best), { name: 'None', value: 0 });
    const highestSource = monthlyIncome.reduce((best, item) => (item.convertedAmount > best.value ? { name: item.source, value: item.convertedAmount } : best), { name: 'None', value: 0 });
    const averageSavings = monthlyIncome.reduce((sum, item) => sum + item.convertedAmount, 0) - monthlyExpenses.reduce((sum, item) => sum + item.convertedAmount, 0);

    return { biggestCategory, highestSource, averageSavings };
  }, [expenses, income, selectedMonth]);

  return (
    <div className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Reports</p>
          <h1>Monthly insights</h1>
        </div>
        <div className="field-group">
          <label className="field-label" htmlFor="reports-month-picker">Month</label>
          <input
            id="reports-month-picker"
            className="glass-input"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          />
        </div>
      </header>

      <GlassCard>
        <div className="stats-list">
          <p>Biggest spending category: {insights.biggestCategory.name}</p>
          <p>Highest income source: {insights.highestSource.name}</p>
          <p>Average monthly savings: {formatMoney(insights.averageSavings, profile?.baseCurrency || 'UGX')}</p>
        </div>
      </GlassCard>

      <ExpenseChart expenses={expenses.filter((item) => item.date.startsWith(selectedMonth))} baseCurrency={profile?.baseCurrency || 'UGX'} />
    </div>
  );
};
