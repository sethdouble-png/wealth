import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
const palette = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444', '#6366f1'];
export const ExpenseChart = ({ expenses, baseCurrency }) => {
    const data = Object.entries(expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.convertedAmount;
        return acc;
    }, {})).map(([name, value]) => ({ name, value }));
    return (_jsxs("div", { className: "chart-card", children: [_jsx("h3", { children: "Spending by category" }), _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "name", innerRadius: 50, outerRadius: 90, paddingAngle: 3, children: data.map((entry, index) => (_jsx(Cell, { fill: palette[index % palette.length] }, `${entry.name}-${index}`))) }), _jsx(Tooltip, { formatter: (value) => `${baseCurrency} ${Number(value ?? 0).toFixed(0)}` })] }) })] }));
};
export const TrendChart = ({ expenses, income }) => {
    const months = Array.from(new Set([...expenses, ...income].map((item) => item.date.slice(0, 7)))).sort();
    const data = months.map((month) => {
        const monthlyExpenses = expenses.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0);
        const monthlyIncome = income.filter((item) => item.date.startsWith(month)).reduce((sum, item) => sum + item.convertedAmount, 0);
        return { month, expenses: monthlyExpenses, income: monthlyIncome };
    });
    return (_jsxs("div", { className: "chart-card", children: [_jsx("h3", { children: "Monthly trend" }), _jsx(ResponsiveContainer, { width: "100%", height: 220, children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { stroke: "rgba(255,255,255,0.2)" }), _jsx(XAxis, { dataKey: "month", stroke: "#94a3b8" }), _jsx(YAxis, { stroke: "#94a3b8" }), _jsx(Tooltip, {}), _jsx(Line, { type: "monotone", dataKey: "income", stroke: "#10b981", strokeWidth: 3 }), _jsx(Line, { type: "monotone", dataKey: "expenses", stroke: "#ef4444", strokeWidth: 3 })] }) })] }));
};
//# sourceMappingURL=Charts.js.map