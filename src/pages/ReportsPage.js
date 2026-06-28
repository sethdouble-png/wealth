import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { formatMoney } from '../lib/formatters';
export const ReportsPage = () => {
    const { profile } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [income, setIncome] = useState([]);
    useEffect(() => {
        if (!profile?.id)
            return;
        const expenseQuery = query(collection(db, 'expenses'), where('userId', '==', profile.id));
        const incomeQuery = query(collection(db, 'income'), where('userId', '==', profile.id));
        const expenseUnsub = onSnapshot(expenseQuery, (snapshot) => {
            setExpenses(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        const incomeUnsub = onSnapshot(incomeQuery, (snapshot) => {
            setIncome(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        return () => {
            expenseUnsub();
            incomeUnsub();
        };
    }, [profile?.id]);
    const insights = useMemo(() => {
        const month = new Date().toISOString().slice(0, 7);
        const monthlyExpenses = expenses.filter((item) => item.date.startsWith(month));
        const monthlyIncome = income.filter((item) => item.date.startsWith(month));
        const biggestCategory = monthlyExpenses.reduce((best, expense) => (expense.convertedAmount > best.value ? { name: expense.category, value: expense.convertedAmount } : best), { name: 'None', value: 0 });
        const highestSource = monthlyIncome.reduce((best, item) => (item.convertedAmount > best.value ? { name: item.source, value: item.convertedAmount } : best), { name: 'None', value: 0 });
        const averageSavings = monthlyIncome.reduce((sum, item) => sum + item.convertedAmount, 0) - monthlyExpenses.reduce((sum, item) => sum + item.convertedAmount, 0);
        return { biggestCategory, highestSource, averageSavings };
    }, [expenses, income]);
    return (_jsxs("div", { className: "page-shell", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Reports" }), _jsx("h1", { children: "Monthly insights" })] }) }), _jsx(GlassCard, { children: _jsxs("div", { className: "stats-list", children: [_jsxs("p", { children: ["Biggest spending category: ", insights.biggestCategory.name] }), _jsxs("p", { children: ["Highest income source: ", insights.highestSource.name] }), _jsxs("p", { children: ["Average monthly savings: ", formatMoney(insights.averageSavings, profile?.baseCurrency || 'UGX')] })] }) })] }));
};
//# sourceMappingURL=ReportsPage.js.map