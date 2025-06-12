
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { DATABASE_CONFIG } from '@/lib/config';
import { getCurrentUser, loginUser as dbLoginUser, logoutUser as dbLogoutUser } from '@/lib/database';

// Firebase auth listener
import { onAuthStateChanged } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

// Supabase auth listener
import { supabase } from '@/lib/supabase';

type User = {
  id: string;
  email?: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DATABASE_CONFIG.provider === 'firebase') {
      // Firebase auth listener
      const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Supabase auth listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setUser({
              id: session.user.id,
              email: session.user.email
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }
      );

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email
          });
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await dbLoginUser(email, password);
    return result;
  };

  const logout = async () => {
    await dbLogoutUser();
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
