import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { ExpenseChart, TrendChart } from '../components/Charts';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { formatMoney } from '../lib/formatters';
import { getRates } from '../lib/currency';
import { loadLocalCollection, saveLocalCollection } from '../lib/offline';
export const DashboardPage = () => {
    const { profile } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [goals, setGoals] = useState([]);
    const [rates, setRates] = useState({});
    useEffect(() => {
        if (!profile?.id)
            return;
        const expenseQuery = query(collection(db, 'expenses'), where('userId', '==', profile.id));
        const incomeQuery = query(collection(db, 'income'), where('userId', '==', profile.id));
        const goalsQuery = query(collection(db, 'goals'), where('userId', '==', profile.id));
        const localExpenses = loadLocalCollection(`expenses-${profile.id}`);
        const localIncome = loadLocalCollection(`income-${profile.id}`);
        const localGoals = loadLocalCollection(`goals-${profile.id}`);
        if (localExpenses.length)
            setExpenses(localExpenses);
        if (localIncome.length)
            setIncome(localIncome);
        if (localGoals.length)
            setGoals(localGoals);
        const expenseUnsub = onSnapshot(expenseQuery, (snapshot) => {
            const nextExpenses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setExpenses(nextExpenses);
            saveLocalCollection(`expenses-${profile.id}`, nextExpenses);
        });
        const incomeUnsub = onSnapshot(incomeQuery, (snapshot) => {
            const nextIncome = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setIncome(nextIncome);
            saveLocalCollection(`income-${profile.id}`, nextIncome);
        });
        const goalsUnsub = onSnapshot(goalsQuery, (snapshot) => {
            const nextGoals = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
        if (!profile?.baseCurrency)
            return;
        getRates(profile.baseCurrency, profile.settings?.currencyApi || 'exchangerate.host').then((nextRates) => setRates(nextRates));
    }, [profile]);
    const totals = useMemo(() => {
        const monthlyExpenses = expenses.filter((item) => item.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, item) => sum + (item.convertedAmount || 0), 0);
        const monthlyIncome = income.filter((item) => item.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((sum, item) => sum + (item.convertedAmount || 0), 0);
        const monthlySavings = monthlyIncome - monthlyExpenses;
        const totalBudget = 5000;
        const progress = Math.min(100, (monthlyExpenses / totalBudget) * 100);
        return { monthlyExpenses, monthlyIncome, monthlySavings, progress };
    }, [expenses, income]);
    return (_jsxs("div", { className: "page-shell", children: [_jsxs("header", { className: "page-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Today at a glance" }), _jsxs("h1", { children: [profile?.name || 'Your', " dashboard"] })] }), _jsx(Link, { to: "/reports", children: _jsx(GlassButton, { variant: "secondary", children: "Reports" }) })] }), _jsxs("div", { className: "stats-grid", children: [_jsxs(GlassCard, { children: [_jsx("p", { className: "metric-label", children: "Income" }), _jsx("p", { className: "metric-value positive", children: formatMoney(totals.monthlyIncome, profile?.baseCurrency || 'UGX') })] }), _jsxs(GlassCard, { children: [_jsx("p", { className: "metric-label", children: "Expenses" }), _jsx("p", { className: "metric-value negative", children: formatMoney(totals.monthlyExpenses, profile?.baseCurrency || 'UGX') })] }), _jsxs(GlassCard, { children: [_jsx("p", { className: "metric-label", children: "Savings" }), _jsx("p", { className: "metric-value", children: formatMoney(totals.monthlySavings, profile?.baseCurrency || 'UGX') })] })] }), _jsxs(GlassCard, { className: "progress-card", children: [_jsxs("div", { className: "progress-row", children: [_jsx("h3", { children: "Monthly budget progress" }), _jsxs("span", { children: [totals.progress.toFixed(0), "%"] })] }), _jsx("div", { className: "progress-track", children: _jsx("div", { className: "progress-bar", style: { width: `${totals.progress}%` } }) })] }), _jsxs("div", { className: "chart-grid", children: [_jsx(ExpenseChart, { expenses: expenses, income: income, baseCurrency: profile?.baseCurrency || 'UGX' }), _jsx(TrendChart, { expenses: expenses, income: income })] }), _jsxs(GlassCard, { children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Goals" }), _jsx(Link, { to: "/goals", children: "Manage" })] }), _jsx("div", { className: "goal-list", children: goals.length === 0 ? _jsx("p", { className: "empty-state", children: "No goals yet. Create one to stay on track." }) : goals.map((goal) => _jsx("p", { children: goal.title }, goal.id)) })] })] }));
};
//# sourceMappingURL=DashboardPage.js.map