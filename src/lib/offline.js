export const saveLocalCollection = (key, data) => {
    if (typeof window === 'undefined')
        return;
    window.localStorage.setItem(key, JSON.stringify(data));
};
export const loadLocalCollection = (key, fallback = []) => {
    if (typeof window === 'undefined')
        return fallback;
    try {
        const saved = window.localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    }
    catch {
        return fallback;
    }
};
//# sourceMappingURL=offline.js.map