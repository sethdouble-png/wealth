import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile as updateFirebaseProfile, } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (!firebaseUser) {
                setProfile(null);
                setLoading(false);
                return;
            }
            const profileRef = doc(db, 'users', firebaseUser.uid);
            const snapshot = await getDoc(profileRef);
            if (snapshot.exists()) {
                setProfile(snapshot.data());
            }
            else {
                const fallbackProfile = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'Budgeter',
                    email: firebaseUser.email || '',
                    baseCurrency: 'UGX',
                    settings: { theme: 'light', currencyApi: 'exchangerate.host' },
                };
                await setDoc(profileRef, fallbackProfile);
                setProfile(fallbackProfile);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    const signIn = async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
    };
    const signUp = async (name, email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateFirebaseProfile(result.user, { displayName: name });
        const profilePayload = {
            id: result.user.uid,
            name,
            email,
            baseCurrency: 'UGX',
            settings: { theme: 'light', currencyApi: 'exchangerate.host' },
        };
        await setDoc(doc(db, 'users', result.user.uid), profilePayload);
        setProfile(profilePayload);
    };
    const resetPassword = async (email) => {
        await sendPasswordResetEmail(auth, email);
    };
    const logout = async () => {
        await signOut(auth);
    };
    const updateProfile = async (updates) => {
        if (!user)
            return;
        const nextProfile = { ...(profile || {}), ...updates, id: user.uid };
        setProfile(nextProfile);
        await setDoc(doc(db, 'users', user.uid), nextProfile, { merge: true });
    };
    const value = useMemo(() => ({ user, profile, loading, signIn, signUp, resetPassword, logout, updateProfile }), [user, profile, loading]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth is used outside AuthProvider');
    return context;
};
//# sourceMappingURL=AuthContext.js.map