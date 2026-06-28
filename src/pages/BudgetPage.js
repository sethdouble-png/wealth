import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { formatMoney } from '../lib/formatters';
export const BudgetPage = () => {
    const { profile } = useAuth();
    const [budget, setBudget] = useState('5000');
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    const [budgets, setBudgets] = useState([]);
    useEffect(() => {
        if (!profile?.id)
            return;
        const expenseQuery = query(collection(db, 'expenses'), where('userId', '==', profile.id));
        const incomeQuery = query(collection(db, 'income'), where('userId', '==', profile.id));
        const budgetQuery = query(collection(db, 'budgets'), where('userId', '==', profile.id));
        const expenseUnsub = onSnapshot(expenseQuery, (snapshot) => {
            setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        const incomeUnsub = onSnapshot(incomeQuery, (snapshot) => {
            setIncome(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        const budgetUnsub = onSnapshot(budgetQuery, (snapshot) => {
            setBudgets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
        if (!profile?.id)
            return;
        await addDoc(collection(db, 'budgets'), {
            userId: profile.id,
            month: new Date().toISOString().slice(0, 7),
            totalBudget: Number(budget),
            categoryBudgets: {},
        });
    };
    return (_jsxs("div", { className: "page-shell", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Budgeting" }), _jsx("h1", { children: "Keep your month on track" })] }) }), _jsxs(GlassCard, { children: [_jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Monthly budget" }), _jsx("input", { className: "glass-input", type: "number", value: budget, onChange: (event) => setBudget(event.target.value) })] }), _jsx(GlassButton, { onClick: saveBudget, children: "Save budget" })] }), _jsxs(GlassCard, { className: "progress-card", children: [_jsxs("div", { className: "progress-row", children: [_jsx("h3", { children: "Spending vs budget" }), _jsxs("span", { children: [summary.progress.toFixed(0), "%"] })] }), _jsx("div", { className: "progress-track", children: _jsx("div", { className: "progress-bar", style: { width: `${summary.progress}%` } }) }), _jsxs("div", { className: "stats-list", children: [_jsxs("p", { children: ["Budget: ", formatMoney(Number(budget), profile?.baseCurrency || 'UGX')] }), _jsxs("p", { children: ["Spent: ", formatMoney(summary.expenseTotal, profile?.baseCurrency || 'UGX')] }), _jsxs("p", { children: ["Savings: ", formatMoney(summary.savings, profile?.baseCurrency || 'UGX')] })] })] })] }));
};
//# sourceMappingURL=BudgetPage.js.map