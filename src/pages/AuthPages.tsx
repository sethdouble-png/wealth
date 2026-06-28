import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { useAuth } from '../contexts/AuthContext';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export const LoginPage = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in. Please check your credentials.'));
    }
  };

  return (
    <div className="auth-shell">
      <GlassCard className="auth-card">
        <h1>Welcome back</h1>
        <p>Budget with calm clarity.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <GlassInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <GlassInput label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? <p className="error-message">{error}</p> : null}
          <GlassButton type="submit">Sign in</GlassButton>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <Link to="/register">Create account</Link>
        </div>
      </GlassCard>
    </div>
  );
};

export const RegisterPage = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await signUp(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to create an account right now.'));
    }
  };

  return (
    <div className="auth-shell">
      <GlassCard className="auth-card">
        <h1>Create account</h1>
        <p>Start tracking your money in style.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <GlassInput label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          <GlassInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <GlassInput label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? <p className="error-message">{error}</p> : null}
          <GlassButton type="submit">Create account</GlassButton>
        </form>
        <Link to="/login">Already have an account?</Link>
      </GlassCard>
    </div>
  );
};

export const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      await resetPassword(email);
      setMessage('Password reset email sent.');
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to send reset email.'));
    }
  };

  return (
    <div className="auth-shell">
      <GlassCard className="auth-card">
        <h1>Reset password</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <GlassInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          {message ? <p className="success-message">{message}</p> : null}
          {error ? <p className="error-message">{error}</p> : null}
          <GlassButton type="submit">Send reset link</GlassButton>
        </form>
        <Link to="/login">Back to sign in</Link>
      </GlassCard>
    </div>
  );
};
