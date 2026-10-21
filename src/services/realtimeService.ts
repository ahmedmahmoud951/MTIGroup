import { api } from "@/lib/api";
import { ApiResponse, RealtimeConfig, SystemStatus, NotificationItem, AuditLogItem } from "@/types";

export const realtimeService = {
  async getRealtimeConfig(): Promise<RealtimeConfig> {
    return api.getRealtimeConfig();
  },

  async getSystemStatus(): Promise<SystemStatus> {
    return api.getSystemStatus();
  },

  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    return api.getAdminNotifications();
  },

  async markNotificationRead(id: string): Promise<ApiResponse<boolean>> {
    return api.markNotificationRead(id);
  },

  async markAllNotificationsRead(): Promise<ApiResponse<boolean>> {
    return api.markAllNotificationsRead();
  },

  async getAuditLogs(take = 100): Promise<ApiResponse<AuditLogItem[]>> {
    return api.getAdminAuditLogs(take);
  }
};
