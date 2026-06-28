import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { CurrencySelector } from '../components/CurrencySelector';
import { IncomeItem } from '../components/IncomeItem';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { convertAmount, getRates } from '../lib/currency';
export const IncomePage = () => {
    const { profile } = useAuth();
    const [income, setIncome] = useState([]);
    const [source, setSource] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState('');
    const [rates, setRates] = useState({ UGX: 1, AED: 1, USD: 1 });
    useEffect(() => {
        if (!profile?.id)
            return;
        const q = query(collection(db, 'income'), where('userId', '==', profile.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setIncome(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, [profile?.id]);
    useEffect(() => {
        if (!profile?.baseCurrency)
            return;
        getRates(profile.baseCurrency, profile.settings?.currencyApi || 'exchangerate.host').then((nextRates) => setRates(nextRates));
    }, [profile]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!profile?.id)
            return;
        const parsed = Number(amount);
        if (!Number.isFinite(parsed) || parsed <= 0)
            return;
        const convertedAmount = convertAmount(parsed, currency, profile.baseCurrency, rates);
        await addDoc(collection(db, 'income'), {
            userId: profile.id,
            source,
            amount: parsed,
            currency,
            convertedAmount,
            date,
            notes,
        });
        setSource('');
        setAmount('');
        setNotes('');
    };
    const handleDelete = async (id) => {
        await deleteDoc(doc(db, 'income', id));
    };
    return (_jsxs("div", { className: "page-shell", children: [_jsxs("header", { className: "page-header", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Income tracking" }), _jsx("h1", { children: "Grow your balance" })] }), _jsx(Link, { to: "/dashboard", children: _jsx(GlassButton, { variant: "secondary", children: "Back" }) })] }), _jsx(GlassCard, { children: _jsxs("form", { onSubmit: handleSubmit, className: "stacked-form", children: [_jsxs("div", { className: "input-grid", children: [_jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Source" }), _jsx("input", { className: "glass-input", value: source, onChange: (event) => setSource(event.target.value), required: true })] }), _jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Amount" }), _jsx("input", { className: "glass-input", type: "number", value: amount, onChange: (event) => setAmount(event.target.value), required: true })] }), _jsx(CurrencySelector, { value: currency, onChange: setCurrency })] }), _jsxs("div", { className: "input-grid", children: [_jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Date" }), _jsx("input", { className: "glass-input", type: "date", value: date, onChange: (event) => setDate(event.target.value), required: true })] }), _jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Notes" }), _jsx("input", { className: "glass-input", value: notes, onChange: (event) => setNotes(event.target.value) })] })] }), _jsx(GlassButton, { type: "submit", children: "Save income" })] }) }), _jsxs(GlassCard, { children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Recent income" }), _jsxs("span", { children: [income.length, " entries"] })] }), _jsx("ul", { className: "list-stack", children: income.map((item) => (_jsx(IncomeItem, { item: item, onDelete: handleDelete }, item.id))) })] })] }));
};
//# sourceMappingURL=IncomePage.js.map