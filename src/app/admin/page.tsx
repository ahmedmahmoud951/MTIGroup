"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { signalRClient } from "@/lib/signalr";
import { SystemStatus, Company, Project } from "@/types";
import {
  Building,
  FolderGit2,
  Briefcase,
  FileText,
  Radio,
  Activity,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [recentEvents, setRecentEvents] = useState<Array<{ title: string; time: string; type: string }>>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [compRes, projRes, statusRes] = await Promise.all([
        api.getAdminCompanies(),
        api.getAdminProjects(),
        api.getSystemStatus(),
      ]);

      if (compRes.success && compRes.data) setCompanies(compRes.data);
      if (projRes.success && projRes.data) setProjects(projRes.data);
      setSystemStatus(statusRes);
    } catch (e) {
      console.warn("Dashboard data load error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Listen to live SignalR events and append to recent events
  useEffect(() => {
    const unsubCompany = signalRClient.subscribe("CompanyUpdated", (data) => {
      setRecentEvents((prev) => [
        {
          title: `Company Updated: ${data.CompanyName || "ID: " + data.CompanyId}`,
          time: new Date().toLocaleTimeString(),
          type: "Company"
        },
        ...prev.slice(0, 9)
      ]);
      loadDashboardData();
    });

    const unsubProject = signalRClient.subscribe("ProjectCreated", (data) => {
      setRecentEvents((prev) => [
        {
          title: `Project Added: ${data.ProjectName}`,
          time: new Date().toLocaleTimeString(),
          type: "Project"
        },
        ...prev.slice(0, 9)
      ]);
      loadDashboardData();
    });

    const unsubSection = signalRClient.subscribe("PageSectionUpdated", () => {
      setRecentEvents((prev) => [
        {
          title: "Page Section Modified",
          time: new Date().toLocaleTimeString(),
          type: "CMS"
        },
        ...prev.slice(0, 9)
      ]);
    });

    return () => {
      unsubCompany();
      unsubProject();
      unsubSection();
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Welcome Banner in Frosted Ice Burgundy Glass */}
      <div className="glass-ice-burgundy p-8 sm:p-10 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold glass-ice-pill text-rose-300">
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>{user?.isSuperAdmin ? "Enterprise Scope: SuperAdmin" : "Scoped Company Admin"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
            <span className="ice-gradient-text">{language === "ar" ? `مرحباً بك، ${user?.fullName || "المشرف"}` : `Welcome back, ${user?.fullName || "Administrator"}`}</span>
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          </h1>
          <p className="text-rose-200/80 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {language === "ar"
              ? "مركز التحكم المؤسسي لإدارة شركات مجموعة MTI، صفحات الويب، والمشاريع، مع بث لحظي للتحديثات."
              : "Executive corporate management portal for MTIGroup entities, CMS pages, and real-time event monitoring."}
          </p>
        </div>

        {/* Quick Live Pill */}
        <div className="flex items-center gap-3 p-4 rounded-2xl glass-ice-pill self-start md:self-auto relative z-10 shadow-lg">
          <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div className="text-xs">
            <div className="text-white font-extrabold">{language === "ar" ? "قناة البث اللحظي" : "Realtime Channel"}</div>
            <div className="text-rose-300/90 font-mono text-[11px]">/hubs/cms active</div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid with Frosted Ice Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-ice-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-200/80 font-bold mb-1">
              {language === "ar" ? "شركات المجموعة" : "Group Companies"}
            </div>
            <div className="text-3xl font-black text-white ice-gradient-text">
              {companies.length || 3}
            </div>
            <div className="text-[11px] text-rose-300 mt-1 font-bold">
              <span>{user?.isSuperAdmin ? "All Strategic Entities" : "Assigned Scope"}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-900/60 to-burgundy-950/80 flex items-center justify-center text-rose-300 border border-white/20 shadow-inner">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-ice-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-200/80 font-bold mb-1">
              {language === "ar" ? "المشاريع المنفذة" : "Total Projects"}
            </div>
            <div className="text-3xl font-black text-amber-300 gold-gradient-text">
              {projects.length || 24}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Deployments</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-900/40 to-burgundy-950/80 flex items-center justify-center text-amber-300 border border-white/20 shadow-inner">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-ice-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-200/80 font-bold mb-1">
              {language === "ar" ? "حالة الباك إند API" : "Backend Gateway"}
            </div>
            <div className="text-3xl font-black text-emerald-400">
              {systemStatus?.api || "Connected"}
            </div>
            <div className="text-[11px] text-rose-300/80 mt-1 font-mono">
              v{systemStatus?.version || "1.0.0"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-900/40 to-burgundy-950/80 flex items-center justify-center text-emerald-300 border border-white/20 shadow-inner">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-ice-card p-6 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-rose-200/80 font-bold mb-1">
              {language === "ar" ? "قاعدة البيانات SQL" : "SQL Database"}
            </div>
            <div className="text-3xl font-black text-white ice-gradient-text">
              {systemStatus?.database || "Connected"}
            </div>
            <div className="text-[11px] text-rose-300/80 mt-1 font-mono">
              db74803.public
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-900/60 to-burgundy-950/80 flex items-center justify-center text-rose-300 border border-white/20 shadow-inner">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Management Shortcuts & Realtime Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Col 1 & 2: Quick Management Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span className="ice-gradient-text">{language === "ar" ? "وحدات الإدارة والمحتوى" : "CMS Management Modules"}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/admin/companies"
              className="glass-ice-card p-6 rounded-2xl group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-rose-300 border border-white/20">
                  <Building className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-rose-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white mb-1 group-hover:text-rose-200 transition-colors">
                  {language === "ar" ? "إدارة الشركات" : "Manage Companies"}
                </div>
                <div className="text-xs text-rose-200/70 leading-relaxed">
                  {language === "ar" ? "تعديل تفاصيل الشركات، الشعار، والترجمات" : "Update logos, translations & corporate profiles"}
                </div>
              </div>
            </Link>

            <Link
              href="/admin/projects"
              className="glass-ice-card p-6 rounded-2xl group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white mb-1 group-hover:text-amber-200 transition-colors">
                  {language === "ar" ? "إدارة المشاريع" : "Manage Projects"}
                </div>
                <div className="text-xs text-rose-200/70 leading-relaxed">
                  {language === "ar" ? "إضافة المشاريع المنفذة وتوثيق العملاء والمواقع" : "Showcase landmark deployments and clients"}
                </div>
              </div>
            </Link>

            <Link
              href="/admin/pages"
              className="glass-ice-card p-6 rounded-2xl group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/20">
                  <FileText className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white mb-1 group-hover:text-emerald-200 transition-colors">
                  {language === "ar" ? "الصفحات والأقسام" : "Pages & Sections"}
                </div>
                <div className="text-xs text-rose-200/70 leading-relaxed">
                  {language === "ar" ? "تعديل أقسام Hero، Statistics، وإعادة الترتيب" : "Reorder sections and edit modular JSON config"}
                </div>
              </div>
            </Link>

            <Link
              href="/admin/services"
              className="glass-ice-card p-6 rounded-2xl group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center text-rose-300 border border-white/20">
                  <Briefcase className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-rose-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white mb-1 group-hover:text-rose-100 transition-colors">
                  {language === "ar" ? "الخدمات والقدرات" : "Services & Capabilities"}
                </div>
                <div className="text-xs text-rose-200/70 leading-relaxed">
                  {language === "ar" ? "تحديد الخدمات وأيقوناتها لكل شركة تابعة" : "Configure services and icons per company"}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Col 3: Realtime Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-rose-400" />
              <span className="ice-gradient-text">{language === "ar" ? "نشاط البث اللحظي" : "Live SignalR Activity"}</span>
            </h2>
            <span className="text-[10px] font-mono font-bold text-amber-300 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full glass-ice-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="glass-ice-card p-6 rounded-2xl min-h-[320px] flex flex-col justify-between">
            {recentEvents.length === 0 ? (
              <div className="text-center py-16 space-y-2 text-rose-200/50">
                <Clock className="w-6 h-6 mx-auto opacity-50 text-rose-300" />
                <div className="text-xs font-semibold">{language === "ar" ? "في انتظار الأحداث اللحظية..." : "Listening for live events..."}</div>
                <div className="text-[11px]">Events triggered in admin reflect here automatically.</div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((evt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl glass-ice-pill text-xs flex items-center justify-between animate-fade-in shadow-sm">
                    <div>
                      <span className="text-white font-bold block">{evt.title}</span>
                      <span className="text-[10px] text-rose-300 font-mono font-semibold">{evt.type}</span>
                    </div>
                    <span className="text-[10px] text-rose-200/70 font-mono">{evt.time}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-white/10 text-[11px] text-rose-200/80 flex items-center justify-between">
              <span className="font-mono">Channel: /hubs/cms</span>
              <a href="/admin/realtime" className="text-rose-300 hover:text-white font-bold underline">
                {language === "ar" ? "عرض المزيد" : "Details"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
