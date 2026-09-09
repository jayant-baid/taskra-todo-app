"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  username: string;
  role: "user" | "admin";
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
  const [oauthError, setOauthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        let storedToken = getClientToken();

        // Check if returning from OAuth callback with token in query params
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const urlToken = urlParams.get("token");
          const authSuccess = urlParams.get("auth_success");
          const authError = urlParams.get("auth_error");

          if (authError) {
            console.warn("[useAuth] OAuth error returned:", authError);
            if (isMounted) setOauthError(authError);
            window.history.replaceState({}, "", window.location.pathname);
          } else if (urlToken && authSuccess) {
            storedToken = urlToken;
            setClientToken(urlToken);
            window.history.replaceState({}, "", window.location.pathname);
          }
        }

        if (!isMounted) return;
        setToken(storedToken);

        const headers: Record<string, string> = {};
        if (storedToken) {
          headers["Authorization"] = `Bearer ${storedToken}`;
        }

        const res = await fetch("/api/auth/me", {
          headers,
          credentials: "include",
        });
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

  useEffect(() => {
    let isMounted = true;
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data as {
        type?: string;
        success?: boolean;
        token?: string;
      };
      if (data.type !== "taskra-oauth" || !data.success || !data.token) return;

      setClientToken(data.token);
      setToken(data.token);
      void fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${data.token}` },
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((result) => {
          if (isMounted && result?.success && result.user) {
            setUser(result.user);
          }
        })
        .catch((err) => console.error("[useAuth] OAuth message error:", err));
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => {
      isMounted = false;
      window.removeEventListener("message", handleOAuthMessage);
    };
  }, []);

  // Login
  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        credentials: "include",
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
      await fetch("/api/auth/logout", {
        method: "POST",
        headers,
        credentials: "include",
      });
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
    oauthError,
    clearOauthError: () => setOauthError(null),
  };
}
