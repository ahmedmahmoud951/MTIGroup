import { api } from "@/lib/api";
import { ApiResponse, Project } from "@/types";

export const projectService = {
  async getPublicProjects(companySlug: string, lang = "ar"): Promise<ApiResponse<Project[]>> {
    return api.getPublicCompanyProjects(companySlug, lang);
  },

  async getAdminProjects(companyId?: string, search?: string): Promise<ApiResponse<Project[]>> {
    return api.getAdminProjects(companyId, search);
  },

  async getAdminProject(id: string): Promise<ApiResponse<Project>> {
    return api.getAdminProject(id);
  },

  async createProject(payload: any): Promise<ApiResponse<Project>> {
    return api.createProject(payload);
  },

  async updateProject(id: string, payload: any): Promise<ApiResponse<boolean>> {
    return api.updateProject(id, payload);
  },

  async deleteProject(id: string): Promise<ApiResponse<boolean>> {
    return api.deleteProject(id);
  }
};
