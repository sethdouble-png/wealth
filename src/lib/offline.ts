export const saveLocalCollection = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(data));
};

export const loadLocalCollection = <T>(key: string, fallback: T[] = []): T[] => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T[]) : fallback;
  } catch {
    return fallback;
  }
};
