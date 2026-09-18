/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearSession, getSession, saveSession } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getSession()?.user || null);
  const [loading, setLoading] = useState(Boolean(getSession()?.token));

  useEffect(() => {
    let active = true;
    const session = getSession();
    if (!session?.token) return undefined;
    api('/auth/me').then(({ user: nextUser }) => {
      if (!active) return;
      setUser(nextUser);
      saveSession({ token: session.token, user: nextUser });
    }).catch(() => {
      if (!active) return;
      clearSession();
      setUser(null);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const value = useMemo(() => ({
    user, loading,
    authenticate: (session) => { saveSession(session); setUser(session.user); },
    updateUser: (nextUser) => { const token = getSession()?.token; if (token) saveSession({ token, user: nextUser }); setUser(nextUser); },
    logout: () => { clearSession(); setUser(null); },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
