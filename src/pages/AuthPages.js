import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { useAuth } from '../contexts/AuthContext';
export const LoginPage = () => {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await signIn(email, password);
            navigate('/dashboard');
        }
        catch {
            setError('Unable to sign in. Please check your credentials.');
        }
    };
    return (_jsx("div", { className: "auth-shell", children: _jsxs(GlassCard, { className: "auth-card", children: [_jsx("h1", { children: "Welcome back" }), _jsx("p", { children: "Budget with calm clarity." }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsx(GlassInput, { label: "Email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true }), _jsx(GlassInput, { label: "Password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), required: true }), error ? _jsx("p", { className: "error-message", children: error }) : null, _jsx(GlassButton, { type: "submit", children: "Sign in" })] }), _jsxs("div", { className: "auth-links", children: [_jsx(Link, { to: "/forgot-password", children: "Forgot password?" }), _jsx(Link, { to: "/register", children: "Create account" })] })] }) }));
};
export const RegisterPage = () => {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await signUp(name, email, password);
            navigate('/dashboard');
        }
        catch {
            setError('Unable to create an account right now.');
        }
    };
    return (_jsx("div", { className: "auth-shell", children: _jsxs(GlassCard, { className: "auth-card", children: [_jsx("h1", { children: "Create account" }), _jsx("p", { children: "Start tracking your money in style." }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsx(GlassInput, { label: "Name", value: name, onChange: (event) => setName(event.target.value), required: true }), _jsx(GlassInput, { label: "Email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true }), _jsx(GlassInput, { label: "Password", type: "password", value: password, onChange: (event) => setPassword(event.target.value), required: true }), error ? _jsx("p", { className: "error-message", children: error }) : null, _jsx(GlassButton, { type: "submit", children: "Create account" })] }), _jsx(Link, { to: "/login", children: "Already have an account?" })] }) }));
};
export const ForgotPasswordPage = () => {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await resetPassword(email);
            setMessage('Password reset email sent.');
        }
        catch {
            setMessage('Unable to send reset email.');
        }
    };
    return (_jsx("div", { className: "auth-shell", children: _jsxs(GlassCard, { className: "auth-card", children: [_jsx("h1", { children: "Reset password" }), _jsxs("form", { onSubmit: handleSubmit, className: "auth-form", children: [_jsx(GlassInput, { label: "Email", type: "email", value: email, onChange: (event) => setEmail(event.target.value), required: true }), message ? _jsx("p", { className: "success-message", children: message }) : null, _jsx(GlassButton, { type: "submit", children: "Send reset link" })] }), _jsx(Link, { to: "/login", children: "Back to sign in" })] }) }));
};
//# sourceMappingURL=AuthPages.js.map