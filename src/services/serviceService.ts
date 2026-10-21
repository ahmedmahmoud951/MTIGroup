import { api } from "@/lib/api";
import { ApiResponse, Service } from "@/types";

export const serviceService = {
  async getPublicServices(companySlug: string, lang = "ar"): Promise<ApiResponse<Service[]>> {
    return api.getPublicCompanyServices(companySlug, lang);
  },

  async getAdminServices(companyId?: string): Promise<ApiResponse<Service[]>> {
    return api.getAdminServices(companyId);
  },

  async getAdminService(id: string): Promise<ApiResponse<Service>> {
    return api.getAdminService(id);
  },

  async createService(payload: any): Promise<ApiResponse<Service>> {
    return api.createService(payload);
  },

  async updateService(id: string, payload: any): Promise<ApiResponse<boolean>> {
    return api.updateService(id, payload);
  },

  async deleteService(id: string): Promise<ApiResponse<boolean>> {
    return api.deleteService(id);
  }
};
