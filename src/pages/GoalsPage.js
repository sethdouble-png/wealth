import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
export const GoalsPage = () => {
    const { profile } = useAuth();
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState('');
    const [current, setCurrent] = useState('');
    const [deadline, setDeadline] = useState('');
    useEffect(() => {
        if (!profile?.id)
            return;
        const q = query(collection(db, 'goals'), where('userId', '==', profile.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, [profile?.id]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!profile?.id)
            return;
        await addDoc(collection(db, 'goals'), {
            userId: profile.id,
            title,
            targetAmount: Number(target),
            currentAmount: Number(current),
            deadline,
        });
        setTitle('');
        setTarget('');
        setCurrent('');
        setDeadline('');
    };
    return (_jsxs("div", { className: "page-shell", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Savings goals" }), _jsx("h1", { children: "Build the future you want" })] }) }), _jsx(GlassCard, { children: _jsxs("form", { onSubmit: handleSubmit, className: "stacked-form", children: [_jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Goal title" }), _jsx("input", { className: "glass-input", value: title, onChange: (event) => setTitle(event.target.value), required: true })] }), _jsxs("div", { className: "input-grid", children: [_jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Target amount" }), _jsx("input", { className: "glass-input", type: "number", value: target, onChange: (event) => setTarget(event.target.value), required: true })] }), _jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Current amount" }), _jsx("input", { className: "glass-input", type: "number", value: current, onChange: (event) => setCurrent(event.target.value), required: true })] })] }), _jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Deadline" }), _jsx("input", { className: "glass-input", type: "date", value: deadline, onChange: (event) => setDeadline(event.target.value), required: true })] }), _jsx(GlassButton, { type: "submit", children: "Create goal" })] }) }), _jsxs(GlassCard, { children: [_jsxs("div", { className: "section-header", children: [_jsx("h3", { children: "Your goals" }), _jsx("span", { children: goals.length })] }), _jsx("div", { className: "goal-list", children: goals.map((goal) => {
                            const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                            return (_jsxs("div", { className: "goal-card", children: [_jsxs("div", { className: "progress-row", children: [_jsx("h4", { children: goal.title }), _jsxs("span", { children: [percent, "%"] })] }), _jsx("div", { className: "progress-track", children: _jsx("div", { className: "progress-bar", style: { width: `${percent}%` } }) }), _jsxs("p", { className: "list-subtitle", children: ["Deadline: ", goal.deadline] })] }, goal.id));
                        }) })] })] }));
};
//# sourceMappingURL=GoalsPage.js.map