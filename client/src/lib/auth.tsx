import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "user" | "authority" | null;

type AuthState = {
  role: Role;
  name?: string | null;
  token?: string | null;
};

type AuthContextValue = {
  auth: AuthState;
  login: (opts: { role: Exclude<Role, null>; name?: string }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "saarthi_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState>({ role: null, name: null, token: null });
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setAuth(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    } catch (e) {
      // ignore
    }
  }, [auth]);

  const login = ({ role, name }: { role: Exclude<Role, null>; name?: string }) => {
    // In a real app you'd call your API here and store a token
    const token = `fake-${role}-token`;
    const next: AuthState = { role, name: name ?? null, token };
    setAuth(next);
    // redirect
    if (role === "authority") navigate("/authority-dashboard");
    else navigate("/dashboard");
  };

  const logout = () => {
    setAuth({ role: null, name: null, token: null });
    navigate("/");
  };

  return <AuthContext.Provider value={{ auth, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export type { Role };
