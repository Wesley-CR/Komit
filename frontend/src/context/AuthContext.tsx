import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../api/auth";
import { setClientToken, setUnauthorizedHandler } from "../api/client";
import type { AuthUser } from "../types/auth";

// ----- Storage keys -----
const TOKEN_KEY = "komit_token";
const USER_KEY  = "komit_user";

// ----- Context shape -----
interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isArtist: boolean;
  isClient: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, contact: string, invitationToken?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ----- Provider -----
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  // Keep API client token in sync
  useEffect(() => {
    setClientToken(token);
  }, [token]);

  // Register 401 handler: any request with an expired token → log out + redirect
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuth();
      navigate("/login", { replace: true });
    });
  // navigate is stable, clearAuth is defined below — intentional shallow dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  function clearAuth() {
    setToken(null);
    setUser(null);
    setClientToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function persistAuth(t: string, u: AuthUser) {
    setToken(t);
    setUser(u);
    setClientToken(t);
    // Token stored in localStorage for session persistence.
    // Trade-off: localStorage is accessible to JS on the page (XSS risk).
    // httpOnly cookies would be safer but require backend cookie support + CSRF handling — out of scope.
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    persistAuth(res.token, { email: res.email, role: res.role, userId: res.userId, clientId: res.clientId });
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, contact: string, invitationToken?: string) => {
    const res = await authApi.signup(email, password, name, contact, invitationToken);
    persistAuth(res.token, { email: res.email, role: res.role, userId: res.userId, clientId: res.clientId });
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    isArtist: user?.role === "ARTIST",
    isClient: user?.role === "CLIENT",
    login,
    signup,
    logout,
  }), [user, token, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ----- Hook -----
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
