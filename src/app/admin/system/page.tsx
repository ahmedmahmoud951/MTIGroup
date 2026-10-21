"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { SystemStatus, AuditLogItem } from "@/types";
import {
  Activity,
  Server,
  Database,
  Radio,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Terminal,
  FileCheck,
  ExternalLink,
  Layers,
  Cpu
} from "lucide-react";

export default function AdminSystemPage() {
  const { language } = useLanguage();

  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState<number>(10);

  const fetchStatus = useCallback(async () => {
    try {
      const [statusData, auditRes] = await Promise.all([
        api.getSystemStatus(),
        api.getAuditLogs(25),
      ]);
      setStatus(statusData);
      if (auditRes.success && auditRes.data) {
        setAuditLogs(auditRes.data);
      }
      setLastChecked(new Date().toLocaleTimeString());
      setAutoRefreshCountdown(10);
    } catch (err) {
      console.error("Failed to fetch system status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // 10-second auto refresh interval
    const intervalTimer = setInterval(() => {
      fetchStatus();
    }, 10000);

    // 1-second countdown ticker
    const countdownTimer = setInterval(() => {
      setAutoRefreshCountdown((prev) => (prev > 1 ? prev - 1 : 10));
    }, 1000);

    return () => {
      clearInterval(intervalTimer);
      clearInterval(countdownTimer);
    };
  }, [fetchStatus]);

  const isApiOnline = status?.api === "Online" || status?.api === "connected";
  const isDbConnected = status?.database?.includes("Connected") || status?.database === "connected";
  const isSignalRConfigured = status?.signalR === "Configured" || status?.signalR === "configured";

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://companygroup.runasp.net";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Title and Auto-Refresh Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono uppercase tracking-widest text-brand-400 font-semibold">
              Live Health Observability
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-brand-400" />
            <span>{language === "ar" ? "مراقبة النظام والبنية التحتية" : "System & Gateway Monitoring"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === "ar"
              ? "مؤشرات الاتصال الحية، فحص SQL Server، إعدادات SignalR، وسجل التدقيق الأمني"
              : "Continuous real-time health checks, database readiness (SELECT 1), SignalR topology & immutable audit logs"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-[11px] font-mono text-slate-400 hidden sm:block">
            <div>
              {language === "ar" ? "التحديث التلقائي خلال:" : "Auto Refresh in:"}{" "}
              <span className="text-brand-300 font-bold">{autoRefreshCountdown}s</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {language === "ar" ? "آخر فحص:" : "Last Checked:"} {lastChecked || "Checking..."}
            </div>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600/30 hover:bg-brand-600 text-white text-xs font-semibold border border-brand-500/30 transition-all hover:scale-105"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
            <span>{language === "ar" ? "تحديث الآن" : "Refresh Now"}</span>
          </button>
        </div>
      </div>

      {/* Primary Status Cards Grid (API, Database, SignalR) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. API Status Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-emerald-500/30 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                API Gateway
              </span>
              <div className="flex items-center gap-2 pt-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isApiOnline ? "bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" : "bg-rose-500"
                  }`}
                />
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isApiOnline ? (language === "ar" ? "متصل (Online)" : "Online") : "Offline"}
                </h3>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 space-y-1.5 text-xs">
            <p className="text-slate-400">
              {language === "ar"
                ? "بوابة الخدمات وعقود REST API الأساسية تعمل بكفاءة"
                : "ASP.NET Core REST API Gateway & Controllers"}
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>{language === "ar" ? "آخر فحص:" : "Last Checked:"}</span>
              <span className="text-slate-300">{lastChecked || "Just now"}</span>
            </div>
          </div>
        </div>

        {/* 2. Database Status Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-brand-500/30 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-brand-500 to-cyan-400" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Database (SQL Server)
              </span>
              <div className="flex items-center gap-2 pt-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isDbConnected ? "bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" : "bg-rose-500"
                  }`}
                />
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isDbConnected ? "Database Connected." : "Disconnected"}
                </h3>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
              <Database className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 space-y-1.5 text-xs">
            <p className="text-slate-400">
              {language === "ar"
                ? "فحص دوري عبر استعلام SELECT 1 على قاعدة db74803"
                : "Active query ping (SELECT 1) on db74803 SQL Server"}
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>{language === "ar" ? "آخر فحص:" : "Last Checked:"}</span>
              <span className="text-slate-300">{lastChecked || "Just now"}</span>
            </div>
          </div>
        </div>

        {/* 3. SignalR Status Card */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-teal-500/30 transition-all shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-400" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Realtime SignalR
              </span>
              <div className="flex items-center gap-2 pt-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isSignalRConfigured ? "bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" : "bg-amber-400"
                  }`}
                />
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isSignalRConfigured ? "Configured" : "Not Configured"}
                </h3>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/5 space-y-1.5 text-xs">
            <p className="text-slate-400">
              {language === "ar"
                ? "إعدادات Hub نشطة ومقروءة ديناميكياً من SignalRHubConfigurations"
                : "Active configuration verified from SignalRHubConfigurations"}
            </p>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>{language === "ar" ? "آخر فحص:" : "Last Checked:"}</span>
              <span className="text-slate-300">{lastChecked || "Just now"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary System Meta Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
              Environment
            </span>
            <span className="text-lg font-bold text-white mt-1 block">
              {status?.environment || "Production"}
            </span>
          </div>
          <Cpu className="w-7 h-7 text-brand-400 opacity-70" />
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
              Application & Assembly Version
            </span>
            <span className="text-sm font-mono font-bold text-brand-300 mt-1 block">
              {status?.version || "v1.0.0 (Assembly: 1.0.0.0)"}
            </span>
          </div>
          <ShieldCheck className="w-7 h-7 text-emerald-400 opacity-70" />
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
              Server Time (UTC)
            </span>
            <span className="text-sm font-mono font-bold text-slate-200 mt-1 block">
              {status?.serverTime ? new Date(status.serverTime).toUTCString() : new Date().toUTCString()}
            </span>
          </div>
          <Clock className="w-7 h-7 text-amber-400 opacity-70" />
        </div>
      </div>

      {/* Direct Endpoints & Contracts Grid */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-brand-400" />
            <span>{language === "ar" ? "روابط الفحص ومواصفات الـ Gateway" : "Production Health & Discovery Endpoints"}</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Base: {apiBaseUrl}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <a
            href={`${apiBaseUrl}/swagger`}
            className="p-4 rounded-2xl bg-dark-800 hover:bg-dark-750 border border-white/5 hover:border-brand-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-brand-300 font-bold">/swagger</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-brand-400" />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              OpenAPI Swagger UI with Bearer Authentication & 10 Tagged Groups
            </p>
          </a>

          <a
            href={`${apiBaseUrl}/health`}
            className="p-4 rounded-2xl bg-dark-800 hover:bg-dark-750 border border-white/5 hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-emerald-400 font-bold">/health</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Composite JSON Health Check: API, SQL Server (SELECT 1), & SignalR Hub
            </p>
          </a>

          <a
            href={`${apiBaseUrl}/health/ready`}
            className="p-4 rounded-2xl bg-dark-800 hover:bg-dark-750 border border-white/5 hover:border-teal-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-teal-400 font-bold">/health/ready</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400" />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Kubernetes Readiness Probe validating SQL Server connectivity
            </p>
          </a>

          <a
            href={`${apiBaseUrl}/api/v1/config/realtime`}
            className="p-4 rounded-2xl bg-dark-800 hover:bg-dark-750 border border-white/5 hover:border-amber-500/40 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-amber-400 font-bold">/api/v1/config/realtime</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Realtime Configuration Provider from SignalRHubConfigurations table
            </p>
          </a>
        </div>
      </div>

      {/* Security Audit Trail Logs Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <span>{language === "ar" ? "سجل الرقابة والتدقيق الأمني (Audit Logs)" : "Immutable Security Audit Logs"}</span>
          </h3>
          <span className="text-xs text-slate-400">
            {language === "ar" ? "آخر العمليات المنفذة في النظام" : "Recent administrative transactions"}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Entity</th>
                <th className="p-3.5">User</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 font-mono text-[11px]">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-sans">
                    No recent audit entries registered yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-brand-300">{log.action}</td>
                    <td className="p-3.5 text-slate-300">{log.entityName}</td>
                    <td className="p-3.5 text-white">@{log.username || "System"}</td>
                    <td className="p-3.5 text-slate-400">{log.ipAddress || "127.0.0.1"}</td>
                    <td className="p-3.5 text-slate-500">{new Date(log.createdAt).toUTCString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
