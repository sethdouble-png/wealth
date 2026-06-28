import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ViewMode = 'monthly' | 'overall';
type PageKey = 'dashboard' | 'income' | 'expenses' | 'budget' | 'reports';

interface PageViewPreferences {
  viewMode: ViewMode;
  selectedMonth: string;
}

interface ViewPreferencesContextValue {
  preferences: Record<PageKey, PageViewPreferences>;
  updatePreferences: (pageKey: PageKey, updates: Partial<PageViewPreferences>) => void;
}

const STORAGE_KEY = 'wealth-view-preferences';

const createDefaultPreferences = (): Record<PageKey, PageViewPreferences> => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  return {
    dashboard: { viewMode: 'monthly', selectedMonth: currentMonth },
    income: { viewMode: 'monthly', selectedMonth: currentMonth },
    expenses: { viewMode: 'monthly', selectedMonth: currentMonth },
    budget: { viewMode: 'monthly', selectedMonth: currentMonth },
    reports: { viewMode: 'monthly', selectedMonth: currentMonth },
  };
};

const getStoredPreferences = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Record<PageKey, PageViewPreferences>;
  } catch {
    return null;
  }
};

const ViewPreferencesContext = createContext<ViewPreferencesContextValue | undefined>(undefined);

export const ViewPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const [preferences, setPreferences] = useState<Record<PageKey, PageViewPreferences>>(() => {
    const stored = getStoredPreferences();
    return stored || createDefaultPreferences();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (pageKey: PageKey, updates: Partial<PageViewPreferences>) => {
    setPreferences((current) => ({
      ...current,
      [pageKey]: {
        ...current[pageKey],
        ...updates,
      },
    }));
  };

  const value = useMemo<ViewPreferencesContextValue>(
    () => ({ preferences, updatePreferences }),
    [preferences]
  );

  return <ViewPreferencesContext.Provider value={value}>{children}</ViewPreferencesContext.Provider>;
};

export const useViewPreferences = (pageKey: PageKey) => {
  const context = useContext(ViewPreferencesContext);
  if (!context) {
    throw new Error('useViewPreferences must be used within a ViewPreferencesProvider');
  }

  const currentPreferences = context.preferences[pageKey] || createDefaultPreferences()[pageKey];
  const setViewMode = (value: ViewMode) => context.updatePreferences(pageKey, { viewMode: value });
  const setSelectedMonth = (value: string) => context.updatePreferences(pageKey, { selectedMonth: value });

  return useMemo(
    () => ({
      viewMode: currentPreferences.viewMode,
      selectedMonth: currentPreferences.selectedMonth,
      setViewMode,
      setSelectedMonth,
    }),
    [currentPreferences.viewMode, currentPreferences.selectedMonth, context]
  );
};
