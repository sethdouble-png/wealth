import { useEffect, useMemo, useState } from 'react';

type ViewMode = 'monthly' | 'overall';
type PageKey = 'dashboard' | 'income' | 'expenses' | 'budget' | 'reports';

interface PageViewPreferences {
  viewMode: ViewMode;
  selectedMonth: string;
}

const STORAGE_PREFIX = 'wealth-view-preferences:';

const getStoredPreferences = (pageKey: PageKey) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${pageKey}`);
    if (!stored) return null;
    return JSON.parse(stored) as PageViewPreferences;
  } catch {
    return null;
  }
};

export const useViewPreferences = (pageKey: PageKey) => {
  const [viewMode, setViewModeState] = useState<ViewMode>('monthly');
  const [selectedMonth, setSelectedMonthState] = useState(() => new Date().toISOString().slice(0, 7));
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const stored = getStoredPreferences(pageKey);
    if (stored?.viewMode) {
      setViewModeState(stored.viewMode);
    }
    if (stored?.selectedMonth) {
      setSelectedMonthState(stored.selectedMonth);
    }
    setHasHydrated(true);
  }, [pageKey]);

  useEffect(() => {
    if (!hasHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(`${STORAGE_PREFIX}${pageKey}`, JSON.stringify({ viewMode, selectedMonth }));
  }, [pageKey, hasHydrated, viewMode, selectedMonth]);

  const setViewMode = (value: ViewMode) => setViewModeState(value);
  const setSelectedMonth = (value: string) => setSelectedMonthState(value);

  return useMemo(
    () => ({ viewMode, selectedMonth, setViewMode, setSelectedMonth }),
    [viewMode, selectedMonth]
  );
};
