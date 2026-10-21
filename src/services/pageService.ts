import { api } from "@/lib/api";
import { ApiResponse, Page, PageSection } from "@/types";

export const pageService = {
  // Public
  async getPublicPages(companySlug: string, lang = "ar"): Promise<ApiResponse<Page[]>> {
    return api.getPublicCompanyPages(companySlug, lang);
  },

  async getPublicPage(companySlug: string, pageSlug: string, lang = "ar"): Promise<ApiResponse<Page>> {
    return api.getPublicPage(companySlug, pageSlug, lang);
  },

  // Admin Pages
  async getAdminPages(companyId?: string): Promise<ApiResponse<Page[]>> {
    return api.getAdminPages(companyId);
  },

  async getAdminPage(id: string): Promise<ApiResponse<Page>> {
    return api.getAdminPage(id);
  },

  async createPage(payload: any): Promise<ApiResponse<Page>> {
    return api.createPage(payload);
  },

  async updatePage(id: string, payload: any): Promise<ApiResponse<boolean>> {
    return api.updatePage(id, payload);
  },

  async deletePage(id: string): Promise<ApiResponse<boolean>> {
    return api.deletePage(id);
  },

  async togglePublish(id: string, isPublished = true): Promise<ApiResponse<boolean>> {
    return api.togglePublishPage(id, isPublished);
  },

  // Admin Sections
  async addSection(pageId: string, payload: any): Promise<ApiResponse<PageSection>> {
    return api.addPageSection(pageId, payload);
  },

  async updateSection(pageId: string, sectionId: string, payload: any): Promise<ApiResponse<boolean>> {
    return api.updatePageSection(pageId, sectionId, payload);
  },

  async deleteSection(pageId: string, sectionId: string): Promise<ApiResponse<boolean>> {
    return api.deletePageSection(pageId, sectionId);
  },

  async reorderSections(pageId: string, sections: { id: string; displayOrder: number }[]): Promise<ApiResponse<boolean>> {
    return api.reorderPageSections(pageId, sections);
  }
};
