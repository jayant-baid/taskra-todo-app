"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  username: string;
  createdAt?: string;
}

export function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("recurring_ops_token");
}

export function setClientToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("recurring_ops_token", token);
  } else {
    localStorage.removeItem("recurring_ops_token");
  }
}

export function useAuthInternal() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const storedToken = getClientToken();
        if (!isMounted) return;
        setToken(storedToken);

        const headers: Record<string, string> = {};
        if (storedToken) {
          headers["Authorization"] = `Bearer ${storedToken}`;
        }

        const res = await fetch("/api/auth/me", { headers });
        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("[useAuth] Error checking auth status:", err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setClientToken(data.token);
        setToken(data.token);
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to sign in" };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }, []);

  // Register
  const register = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        setClientToken(data.token);
        setToken(data.token);
        return { success: true };
      }
      return { success: false, error: data.error || "Failed to register" };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    try {
      const storedToken = getClientToken();
      const headers: Record<string, string> = {};
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }
      await fetch("/api/auth/logout", { method: "POST", headers });
    } catch (err) {
      console.warn("[useAuth] Logout network error:", err);
    } finally {
      setUser(null);
      setClientToken(null);
      setToken(null);
    }
  }, []);

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    token,
  };
}
