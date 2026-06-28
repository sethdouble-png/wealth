import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import type { ExpenseRecord, IncomeRecord } from '../types';

interface ExpenseChartProps {
  expenses: ExpenseRecord[];
  baseCurrency: 'UGX' | 'AED' | 'USD';
}

interface TrendChartProps {
  expenses: ExpenseRecord[];
  income: IncomeRecord[];
}

const palette = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];

export const ExpenseChart = ({ expenses, baseCurrency }: ExpenseChartProps) => {
  const data = Object.entries(
    expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.convertedAmount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="chart-card">
      <h3>Spending by category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${baseCurrency} ${Number(value ?? 0).toFixed(0)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TrendChart = ({ expenses, income }: TrendChartProps) => {
  const months = Array.from(new Set([...expenses, ...income].map((item) => item.date.slice(0, 7)))).sort();
  const data = months.map((month) => {
    const monthlyExpenses = expenses.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0);
    const monthlyIncome = income.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0);
    return { month, expenses: monthlyExpenses, income: monthlyIncome };
  });

  return (
    <div className="chart-card">
      <h3>Monthly trend</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} />
          <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
