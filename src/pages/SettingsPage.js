import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../contexts/AuthContext';
import { currencyOptions } from '../lib/formatters';
export const SettingsPage = () => {
    const { profile, updateProfile, logout } = useAuth();
    const [name, setName] = useState(profile?.name || '');
    const [baseCurrency, setBaseCurrency] = useState(profile?.baseCurrency || 'UGX');
    const handleSave = async () => {
        await updateProfile({ name, baseCurrency });
    };
    return (_jsxs("div", { className: "page-shell", children: [_jsx("header", { className: "page-header", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Settings" }), _jsx("h1", { children: "Personalize your experience" })] }) }), _jsxs(GlassCard, { children: [_jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Name" }), _jsx("input", { className: "glass-input", value: name, onChange: (event) => setName(event.target.value) })] }), _jsxs("label", { className: "field-group", children: [_jsx("span", { className: "field-label", children: "Base currency" }), _jsx("select", { className: "glass-input", value: baseCurrency, onChange: (event) => setBaseCurrency(event.target.value), children: currencyOptions.map((currency) => (_jsx("option", { value: currency, children: currency }, currency))) })] }), _jsx(GlassButton, { onClick: handleSave, children: "Save preferences" })] }), _jsx(GlassCard, { children: _jsx(GlassButton, { variant: "secondary", onClick: () => logout(), children: "Sign out" }) })] }));
};
//# sourceMappingURL=SettingsPage.js.map