import {
  ApiResponse,
  Company,
  CompanyDetail,
  Project,
  Service,
  Page,
  PageSection,
  NavigationItem,
  MediaFile,
  LoginResponse,
  UserProfile,
  RealtimeConfig,
  SystemStatus,
  SiteSetting,
  SystemSetting,
  NotificationItem,
  AuditLogItem
} from "@/types";
import { logger } from "./logger";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://companygroup.runasp.net";

class ApiClient {
  private getHeaders(isFormData = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("mti_access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const method = options.method || "GET";
    const url = endpoint.startsWith("http")
      ? endpoint
      : endpoint.startsWith("/api/holding-settings")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();

    logger.api(`[HTTP ${method}] ${endpoint}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(options.body instanceof FormData),
          ...options.headers,
        },
      });

      const duration = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start);

      if (response.status === 401 && typeof window !== "undefined") {
        logger.warn("API", `[HTTP 401 Unauthorized] Session expired on ${endpoint}`);
        if (!endpoint.includes("/auth/")) {
          localStorage.removeItem("mti_access_token");
          localStorage.removeItem("mti_user_profile");
        }
      }

      let data: any;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { success: response.ok, message: text, data: text };
      }

      if (response.ok) {
        logger.apiSuccess(`[HTTP ${response.status}] ${method} ${endpoint} (${duration}ms)`, data);
      } else {
        logger.apiError(
          `[HTTP ${response.status}] ${method} ${endpoint} (${duration}ms): ${data.message || data.title || "Request failed"}`,
          data
        );
      }

      return data;
    } catch (error: any) {
      const duration = Math.round((typeof performance !== "undefined" ? performance.now() : Date.now()) - start);
      logger.apiError(`[HTTP FAIL] ${method} ${endpoint} (${duration}ms): ${error?.message || error}`, error);
      return {
        success: false,
        message: error?.message || "Failed to communicate with API gateway.",
        data: null as any,
        errors: [error?.message || "Network Error"]
      };
    }
  }

  // --- PUBLIC ENDPOINTS ---
  async getPublicCompanies(lang = "ar"): Promise<ApiResponse<Company[]>> {
    return this.request<Company[]>(`/api/v1/public/companies?lang=${lang}`, { cache: "no-store" });
  }

  async getPublicCompanyBySlug(slug: string, lang = "ar"): Promise<ApiResponse<CompanyDetail>> {
    return this.request<CompanyDetail>(`/api/v1/public/companies/${slug}?lang=${lang}`, { cache: "no-store" });
  }

  async getPublicCompanyProjects(slug: string, lang = "ar"): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(`/api/v1/public/companies/${slug}/projects?lang=${lang}`, { cache: "no-store" });
  }

  async getPublicCompanyServices(slug: string, lang = "ar"): Promise<ApiResponse<Service[]>> {
    return this.request<Service[]>(`/api/v1/public/companies/${slug}/services?lang=${lang}`, { cache: "no-store" });
  }

  async getPublicCompanyPages(slug: string, lang = "ar"): Promise<ApiResponse<Page[]>> {
    return this.request<Page[]>(`/api/v1/public/companies/${slug}/pages?lang=${lang}`, { cache: "no-store" });
  }

  async getPublicCompanyNavigation(slug: string): Promise<ApiResponse<NavigationItem[]>> {
    return this.request<NavigationItem[]>(`/api/v1/public/companies/${slug}/navigation`, { cache: "no-store" });
  }

  async getPublicPage(companySlug: string, pageSlug: string, lang = "ar"): Promise<ApiResponse<Page>> {
    return this.request<Page>(`/api/v1/public/pages/${companySlug}/${pageSlug}?lang=${lang}`, { cache: "no-store" });
  }

  async getPublicProject(companySlug: string, projectSlug: string, lang = "ar"): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/v1/public/projects/${companySlug}/${projectSlug}?lang=${lang}`, { cache: "no-store" });
  }

  async getPublicService(companySlug: string, serviceSlug: string, lang = "ar"): Promise<ApiResponse<Service>> {
    return this.request<Service>(`/api/v1/public/services/${companySlug}/${serviceSlug}?lang=${lang}`, { cache: "no-store" });
  }

  // --- AUTH ENDPOINTS ---
  async login(username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const res = await this.request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    if (res.success && res.data && typeof window !== "undefined") {
      localStorage.setItem("mti_access_token", res.data.accessToken);
      localStorage.setItem("mti_refresh_token", res.data.refreshToken);
      localStorage.setItem("mti_user_profile", JSON.stringify(res.data.user));
    }
    return res;
  }

  async logout(): Promise<ApiResponse<boolean>> {
    const res = await this.request<boolean>("/api/v1/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("mti_access_token");
      localStorage.removeItem("mti_refresh_token");
      localStorage.removeItem("mti_user_profile");
    }
    return res;
  }

  async refreshToken(refreshToken?: string): Promise<ApiResponse<LoginResponse>> {
    const token = refreshToken || (typeof window !== "undefined" ? localStorage.getItem("mti_refresh_token") : null);
    const res = await this.request<LoginResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: token }),
    });

    if (res.success && res.data && typeof window !== "undefined") {
      localStorage.setItem("mti_access_token", res.data.accessToken);
      localStorage.setItem("mti_refresh_token", res.data.refreshToken);
      localStorage.setItem("mti_user_profile", JSON.stringify(res.data.user));
    }
    return res;
  }

  async getMe(): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>("/api/v1/auth/me");
  }

  async getCurrentUser(): Promise<ApiResponse<UserProfile>> {
    return this.getMe();
  }

  // --- ADMIN COMPANIES ---
  async getAdminCompanies(search?: string): Promise<ApiResponse<Company[]>> {
    const query = search ? `?search=${encodeURIComponent(search)}` : "";
    return this.request<Company[]>(`/api/v1/admin/companies${query}`);
  }

  async getAdminCompany(id: string): Promise<ApiResponse<Company>> {
    return this.request<Company>(`/api/v1/admin/companies/${id}`);
  }

  async createCompany(data: Partial<Company>): Promise<ApiResponse<Company>> {
    return this.request<Company>("/api/v1/admin/companies", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/companies/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/companies/${id}`, {
      method: "DELETE",
    });
  }

  // --- ADMIN PROJECTS ---
  async getAdminProjects(companyId?: string, search?: string): Promise<ApiResponse<Project[]>> {
    const params = new URLSearchParams();
    if (companyId) params.append("companyId", companyId);
    if (search) params.append("search", search);
    return this.request<Project[]>(`/api/v1/admin/projects?${params.toString()}`);
  }

  async getAdminProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/api/v1/admin/projects/${id}`);
  }

  async createProject(data: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>("/api/v1/admin/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/projects/${id}`, {
      method: "DELETE",
    });
  }

  // --- ADMIN SERVICES ---
  async getAdminServices(companyId?: string, search?: string): Promise<ApiResponse<Service[]>> {
    const params = new URLSearchParams();
    if (companyId) params.append("companyId", companyId);
    if (search) params.append("search", search);
    return this.request<Service[]>(`/api/v1/admin/services?${params.toString()}`);
  }

  async getAdminService(id: string): Promise<ApiResponse<Service>> {
    return this.request<Service>(`/api/v1/admin/services/${id}`);
  }

  async createService(data: Partial<Service>): Promise<ApiResponse<Service>> {
    return this.request<Service>("/api/v1/admin/services", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateService(id: string, data: Partial<Service>): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteService(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/services/${id}`, {
      method: "DELETE",
    });
  }

  // --- ADMIN PAGES & SECTIONS ---
  async getAdminPages(companyId?: string): Promise<ApiResponse<Page[]>> {
    const query = companyId ? `?companyId=${companyId}` : "";
    return this.request<Page[]>(`/api/v1/admin/pages${query}`);
  }

  async getAdminPage(id: string): Promise<ApiResponse<Page>> {
    return this.request<Page>(`/api/v1/admin/pages/${id}`);
  }

  async createPage(data: Partial<Page>): Promise<ApiResponse<Page>> {
    return this.request<Page>("/api/v1/admin/pages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePage(id: string, data: Partial<Page>): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePage(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/pages/${id}`, {
      method: "DELETE",
    });
  }

  async addPageSection(pageId: string, data: Partial<PageSection>): Promise<ApiResponse<PageSection>> {
    return this.request<PageSection>(`/api/v1/admin/pages/${pageId}/sections`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePageSection(pageId: string, sectionId: string, data: Partial<PageSection>): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/pages/${pageId}/sections/${sectionId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deletePageSection(pageId: string, sectionId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/pages/${pageId}/sections/${sectionId}`, {
      method: "DELETE",
    });
  }

  async togglePublishPage(pageId: string, isPublished = true): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/pages/${pageId}/publish?isPublished=${isPublished}`, {
      method: "PUT",
    });
  }

  async reorderPageSections(pageId: string, sections: { id: string; displayOrder: number }[]): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/pages/${pageId}/sections/reorder`, {
      method: "PUT",
      body: JSON.stringify({ sections }),
    });
  }

  // --- COMPANY ADMINS ---
  async getCompanyAdmins(companyId: string): Promise<ApiResponse<UserProfile[]>> {
    return this.request<UserProfile[]>(`/api/v1/admin/companies/${companyId}/admins`);
  }

  async assignCompanyAdmin(companyId: string, userId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/companies/${companyId}/admins`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

  async removeCompanyAdmin(companyId: string, userId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/companies/${companyId}/admins/${userId}`, {
      method: "DELETE",
    });
  }

  // --- ADMIN MEDIA ---
  async getAdminMedia(companyId?: string): Promise<ApiResponse<MediaFile[]>> {
    const query = companyId ? `?companyId=${companyId}` : "";
    return this.request<MediaFile[]>(`/api/v1/admin/media${query}`);
  }

  async getMediaFiles(companyId?: string): Promise<ApiResponse<MediaFile[]>> {
    return this.getAdminMedia(companyId);
  }

  async uploadMedia(fileOrFormData: File | FormData, companyId?: string, altText?: string): Promise<ApiResponse<MediaFile>> {
    let formData: FormData;
    if (fileOrFormData instanceof FormData) {
      formData = fileOrFormData;
    } else {
      formData = new FormData();
      formData.append("file", fileOrFormData);
      if (companyId) formData.append("companyId", companyId);
      if (altText) formData.append("altText", altText);
    }

    return this.request<MediaFile>("/api/v1/admin/media/upload", {
      method: "POST",
      body: formData,
    });
  }

  async deleteMedia(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/media/${id}`, {
      method: "DELETE",
    });
  }

  // --- ADMIN USERS & ROLES ---
  async getAdminUsers(): Promise<ApiResponse<UserProfile[]>> {
    return this.request<UserProfile[]>("/api/v1/admin/users");
  }

  async getAdminUser(id: string): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>(`/api/v1/admin/users/${id}`);
  }

  async createUser(data: any): Promise<ApiResponse<UserProfile>> {
    return this.request<UserProfile>("/api/v1/admin/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createAdminUser(data: any): Promise<ApiResponse<UserProfile>> {
    return this.createUser(data);
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updateAdminUser(id: string, data: any): Promise<ApiResponse<boolean>> {
    return this.updateUser(id, data);
  }

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/users/${id}`, {
      method: "DELETE",
    });
  }

  async deleteAdminUser(id: string): Promise<ApiResponse<boolean>> {
    return this.deleteUser(id);
  }

  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/users/${id}/reset-password`, {
      method: "PUT",
      body: JSON.stringify({ newPassword }),
    });
  }

  async toggleStatus(id: string, isActive: boolean): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ isActive }),
    });
  }

  async getRoles(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>("/api/v1/admin/roles");
  }

  // --- SETTINGS, REALTIME & SYSTEM ---
  async getSiteSettings(companyId?: string): Promise<ApiResponse<SiteSetting[]>> {
    const query = companyId ? `?companyId=${companyId}` : "";
    return this.request<SiteSetting[]>(`/api/v1/admin/settings/site${query}`);
  }

  async upsertSiteSetting(data: Partial<SiteSetting>): Promise<ApiResponse<boolean>> {
    return this.request<boolean>("/api/v1/admin/settings/site", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHoldingSettings(): Promise<ApiResponse<Record<string, string>>> {
    return this.request<Record<string, string>>("/api/holding-settings", { cache: "no-store" });
  }

  async updateHoldingSettings(settings: Record<string, string>): Promise<ApiResponse<Record<string, string>>> {
    return this.request<Record<string, string>>("/api/holding-settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  }

  async getSystemSettings(): Promise<ApiResponse<SystemSetting[]>> {
    return this.request<SystemSetting[]>("/api/v1/admin/settings/system");
  }

  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    return this.request<NotificationItem[]>("/api/v1/admin/notifications");
  }

  async getAdminNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    return this.getNotifications();
  }

  async markNotificationRead(id: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>(`/api/v1/admin/notifications/${id}/read`, { method: "PUT" });
  }

  async markAllNotificationsRead(): Promise<ApiResponse<boolean>> {
    return this.request<boolean>("/api/v1/admin/notifications/read-all", { method: "PUT" });
  }

  async getAuditLogs(take = 50): Promise<ApiResponse<AuditLogItem[]>> {
    return this.request<AuditLogItem[]>(`/api/v1/admin/audit?take=${take}`);
  }

  async getAdminAuditLogs(take = 50): Promise<ApiResponse<AuditLogItem[]>> {
    return this.getAuditLogs(take);
  }

  // REALTIME CONFIG: dynamically fetched from SQL Server via API Gateway
  async getRealtimeConfig(): Promise<RealtimeConfig> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/config/realtime`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Could not fetch realtime config, using default", e);
    }
    return {
      hubName: "cms",
      baseUrl: API_BASE_URL,
      fullUrl: `${API_BASE_URL}/hubs/cms`,
      isActive: true,
    };
  }

  async getSystemStatus(): Promise<SystemStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/system/status`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Degraded status fallback
    }
    return {
      api: "connecting...",
      database: "unknown",
      signalR: "connecting...",
      environment: "Production",
      version: "1.0.0-prod",
      serverTime: new Date().toISOString()
    };
  }
}

export const api = new ApiClient();
export default api;
