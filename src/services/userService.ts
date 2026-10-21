import { api } from "@/lib/api";
import { ApiResponse, UserProfile } from "@/types";

export const userService = {
  async getUsers(): Promise<ApiResponse<UserProfile[]>> {
    return api.getAdminUsers();
  },

  async getUser(id: string): Promise<ApiResponse<UserProfile>> {
    return api.getAdminUser(id);
  },

  async createUser(payload: any): Promise<ApiResponse<UserProfile>> {
    return api.createAdminUser(payload);
  },

  async updateUser(id: string, payload: any): Promise<ApiResponse<boolean>> {
    return api.updateAdminUser(id, payload);
  },

  async deleteUser(id: string): Promise<ApiResponse<boolean>> {
    return api.deleteAdminUser(id);
  },

  async resetPassword(id: string, newPassword: string): Promise<ApiResponse<boolean>> {
    return api.resetPassword(id, newPassword);
  },

  async toggleStatus(id: string, isActive: boolean): Promise<ApiResponse<boolean>> {
    return api.toggleStatus(id, isActive);
  },

  async getRoles(): Promise<ApiResponse<any[]>> {
    return api.getRoles();
  }
};
