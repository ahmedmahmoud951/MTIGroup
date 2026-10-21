import { api } from "@/lib/api";
import { ApiResponse, LoginResponse, UserProfile } from "@/types";

export const authService = {
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return api.login(username, password);
  },

  async refresh(refreshToken?: string): Promise<ApiResponse<LoginResponse>> {
    return api.refreshToken(refreshToken);
  },

  async logout(): Promise<ApiResponse<boolean>> {
    return api.logout();
  },

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return api.getCurrentUser();
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("mti_access_token");
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("mti_refresh_token");
  },

  setSession(token: string, refreshToken?: string, user?: UserProfile) {
    if (typeof window === "undefined") return;
    localStorage.setItem("mti_access_token", token);
    if (refreshToken) localStorage.setItem("mti_refresh_token", refreshToken);
    if (user) localStorage.setItem("mti_user_profile", JSON.stringify(user));
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("mti_access_token");
    localStorage.removeItem("mti_refresh_token");
    localStorage.removeItem("mti_user_profile");
  },

  getUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const str = localStorage.getItem("mti_user_profile");
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};
