import { api } from "@/lib/api";
import { ApiResponse, MediaFile } from "@/types";

export const mediaService = {
  async getMediaFiles(companyId?: string): Promise<ApiResponse<MediaFile[]>> {
    return api.getMediaFiles(companyId);
  },

  async uploadMedia(file: File, companyId?: string, altText?: string): Promise<ApiResponse<MediaFile>> {
    return api.uploadMedia(file, companyId, altText);
  },

  async deleteMedia(id: string): Promise<ApiResponse<boolean>> {
    return api.deleteMedia(id);
  }
};
