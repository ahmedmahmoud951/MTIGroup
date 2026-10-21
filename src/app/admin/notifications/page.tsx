"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { NotificationItem } from "@/types";
import { Bell, CheckCheck, RefreshCw, AlertCircle, Info, CheckCircle2, ShieldAlert } from "lucide-react";

export default function AdminNotificationsPage() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await api.getAdminNotifications();
    if (res.success && res.data) {
      setNotifications(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-400" />
            <span>{language === "ar" ? "التنبيهات والأحداث اللحظية" : "Real-Time Notifications"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === "ar"
              ? "سجل التنبيهات والأحداث المؤسسية المستلمة عبر SignalR Hub"
              : "Audit events and group operational notifications pushed via SignalR"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{language === "ar" ? "تحديث" : "Refresh"}</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            <span>{language === "ar" ? "تحديد الكل كمقروء" : "Mark All as Read"}</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
        {loading ? (
          <div className="py-20 text-center text-slate-500">
            <div className="w-8 h-8 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-3" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-20 text-center text-slate-500 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-medium">
              {language === "ar" ? "لا توجد تنبيهات جديدة حالياً" : "No active notifications found"}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                n.isRead ? "bg-transparent opacity-70" : "bg-brand-500/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-xl bg-white/5 border border-white/10 text-brand-400">
                  {n.type === "Error" ? (
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  ) : n.type === "Warning" ? (
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Info className="w-4 h-4 text-brand-400" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                    )}
                    {n.entityType && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                        {n.entityType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-brand-300 font-medium transition-all shrink-0"
                >
                  {language === "ar" ? "قراءة" : "Mark Read"}
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
