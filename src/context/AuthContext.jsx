import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, setSession, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

// A API do Braz Taxi não tem rota "quem sou eu": a sessão é o token + os dados do admin
// devolvidos no login, guardados no navegador. Se o token deixar de valer, a primeira
// requisição autenticada recebe 401 e o painel volta para o login.
export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(getSession);

  const signIn = useCallback((data) => {
    const { token, ...admin } = data;
    const next = { token, admin };
    setSession(next);
    setSessionState(next);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setSessionState(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const value = useMemo(() => ({
    admin: session?.admin ?? null,
    isAuthenticated: Boolean(session?.token),
    signIn,
    signOut,
  }), [session, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de um AuthProvider');
  return ctx;
}
