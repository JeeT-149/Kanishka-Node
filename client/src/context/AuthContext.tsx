import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiRequest, setUnauthorizedListener, ApiError } from "../lib/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("auth_token");
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("auth_token");
    } catch {
      // Ignore localStorage write errors
    }
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedListener(() => {
      logout();
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        window.location.href = "/login?expired=true";
      }
    });

    return () => {
      setUnauthorizedListener(null);
    };
  }, [logout]);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!token) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await apiRequest<{ user: User }>("/auth/me");
        if (isMounted) {
          setUser(res.user);
        }
      } catch (err) {
        if (isMounted) {
          if (err instanceof ApiError && err.status === 401) {
            logout();
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token, logout]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    try {
      localStorage.setItem("auth_token", res.token);
    } catch {
      // Ignore write error
    }
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const regRes = await apiRequest<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    // Auto-login upon successful registration
    return login(email, password).catch(() => regRes.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
