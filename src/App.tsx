import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ViewPreferencesProvider } from './contexts/ViewPreferencesContext';
import { BudgetPage } from './pages/BudgetPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { ForgotPasswordPage, LoginPage, RegisterPage } from './pages/AuthPages';
import { GoalsPage } from './pages/GoalsPage';
import { IncomePage } from './pages/IncomePage';
import { RecurringPage } from './pages/RecurringPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { Navbar } from './components/Navbar';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';

const AppRoutes = () => {
  const { user, loading, profile } = useAuth();

  useEffect(() => {
    if (!profile?.settings?.theme) return;
    document.documentElement.dataset.theme = profile.settings.theme;
  }, [profile?.settings?.theme]);

  if (loading) {
    return <div className="loading-shell">Preparing your finance space...</div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/recurring" element={<RecurringPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <PwaInstallPrompt />
      <PwaUpdatePrompt />
      <Navbar />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ViewPreferencesProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ViewPreferencesProvider>
    </AuthProvider>
  );
}

export default App;
