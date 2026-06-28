import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { Currency, UserProfile } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
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
      try {
        const snapshot = await getDoc(profileRef);
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        } else {
          const fallbackProfile: UserProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Budgeter',
            email: firebaseUser.email || '',
            baseCurrency: 'UGX',
            settings: {
              theme: 'light',
              currencyApi: 'exchangerate.host',
              customCategories: ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Misc'],
            },
          };
          await setDoc(profileRef, fallbackProfile);
          setProfile(fallbackProfile);
        }
      } catch (err) {
        // Log error and continue so UI doesn't remain stuck on loading
        // eslint-disable-next-line no-console
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateFirebaseProfile(result.user, { displayName: name });
    const profilePayload: UserProfile = {
      id: result.user.uid,
      name,
      email,
      baseCurrency: 'UGX',
      settings: {
        theme: 'light',
        currencyApi: 'exchangerate.host',
        customCategories: ['Food', 'Transport', 'Rent', 'Utilities', 'Shopping', 'Misc'],
      },
    };
    await setDoc(doc(db, 'users', result.user.uid), profilePayload);
    setProfile(profilePayload);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const nextProfile = { ...(profile || {}), ...updates, id: user.uid } as UserProfile;
    setProfile(nextProfile);
    await setDoc(doc(db, 'users', user.uid), nextProfile, { merge: true });
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, profile, loading, signIn, signUp, resetPassword, logout, updateProfile }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth is used outside AuthProvider');
  return context;
};
