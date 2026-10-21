import { api } from "@/lib/api";
import { ApiResponse, Company, CompanyDetail, UserProfile } from "@/types";

export const companyService = {
  // Public
  async getPublicCompanies(lang = "ar"): Promise<ApiResponse<Company[]>> {
    return api.getPublicCompanies(lang);
  },

  async getPublicCompanyBySlug(slug: string, lang = "ar"): Promise<ApiResponse<CompanyDetail>> {
    return api.getPublicCompanyBySlug(slug, lang);
  },

  async getPublicCompanyProjects(slug: string, lang = "ar") {
    return api.getPublicCompanyProjects(slug, lang);
  },

  async getPublicCompanyServices(slug: string, lang = "ar") {
    return api.getPublicCompanyServices(slug, lang);
  },

  async getPublicCompanyPages(slug: string, lang = "ar") {
    return api.getPublicCompanyPages(slug, lang);
  },

  // Admin
  async getAdminCompanies(search?: string): Promise<ApiResponse<Company[]>> {
    return api.getAdminCompanies(search);
  },

  async getAdminCompany(id: string): Promise<ApiResponse<Company>> {
    return api.getAdminCompany(id);
  },

  async createCompany(payload: any): Promise<ApiResponse<Company>> {
    return api.createCompany(payload);
  },

  async updateCompany(id: string, payload: any): Promise<ApiResponse<boolean>> {
    return api.updateCompany(id, payload);
  },

  async deleteCompany(id: string): Promise<ApiResponse<boolean>> {
    return api.deleteCompany(id);
  },

  // Company Admins
  async getCompanyAdmins(companyId: string): Promise<ApiResponse<UserProfile[]>> {
    return api.getCompanyAdmins(companyId);
  },

  async assignCompanyAdmin(companyId: string, userId: string): Promise<ApiResponse<boolean>> {
    return api.assignCompanyAdmin(companyId, userId);
  },

  async removeCompanyAdmin(companyId: string, userId: string): Promise<ApiResponse<boolean>> {
    return api.removeCompanyAdmin(companyId, userId);
  }
};
