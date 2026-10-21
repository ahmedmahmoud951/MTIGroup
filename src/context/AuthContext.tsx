"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile } from "@/types";
import { api } from "@/lib/api";
import { logger } from "@/lib/logger";

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasCompanyAccess: (companyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("mti_access_token");
    const cachedProfile = localStorage.getItem("mti_user_profile");

    if (token && cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        setUser(parsed);
        logger.authSuccess(`Restored cached session for user: @${parsed.username}`, parsed);
      } catch (e) {
        logger.authError("Failed to parse cached user profile", e);
      }
      // Revalidate in background
      api.getMe().then((res) => {
        if (res.success && res.data) {
          setUser(res.data);
          localStorage.setItem("mti_user_profile", JSON.stringify(res.data));
          logger.authSuccess(`Revalidated session successfully for @${res.data.username}`);
        } else if (!res.success) {
          logger.auth("Session token expired or revoked. Clearing credentials...");
          setUser(null);
          localStorage.removeItem("mti_access_token");
          localStorage.removeItem("mti_user_profile");
        }
      }).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    logger.auth(`Attempting login for user: @${username}`);
    const res = await api.login(username, password);
    setIsLoading(false);

    if (res.success && res.data) {
      setUser(res.data.user);
      logger.authSuccess(`Login successful for @${username}! Roles: [${res.data.user.roles.join(", ")}]`, res.data.user);
      return { success: true };
    }
    logger.authError(`Login rejected for @${username}: ${res.message || "Invalid credentials"}`);
    return { success: false, error: res.message || "Invalid username or password" };
  };

  const logout = async () => {
    setIsLoading(true);
    logger.auth("Logging out user, clearing access tokens and server sessions...");
    await api.logout();
    setUser(null);
    setIsLoading(false);
    logger.authSuccess("User session terminated.");
  };

  const hasCompanyAccess = (companyId: string): boolean => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.allowedCompanyIds.includes(companyId);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasCompanyAccess,
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
