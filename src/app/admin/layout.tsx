"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { signalRClient } from "@/lib/signalr";
import {
  LayoutDashboard,
  Building,
  FolderGit2,
  Briefcase,
  FileText,
  Compass,
  Image as ImageIcon,
  Users,
  Bell,
  Settings,
  Radio,
  Activity,
  ShieldCheck,
  LogOut,
  Globe,
  ChevronRight,
  ShieldAlert,
  Menu,
  X,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signalRStatus, setSignalRStatus] = useState<string>("Connecting");

  // Don't guard /admin/login
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, isLoginPage, router]);

  useEffect(() => {
    if (isAuthenticated) {
      signalRClient.init();
      const unsub = signalRClient.onStatusChange((status) => {
        setSignalRStatus(status);
      });
      return () => unsub();
    }
  }, [isAuthenticated]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: t("admin.dashboard"), icon: LayoutDashboard },
    { href: "/admin/companies", label: t("admin.companies"), icon: Building },
    { href: "/admin/projects", label: t("admin.projects"), icon: FolderGit2 },
    { href: "/admin/services", label: t("admin.services"), icon: Briefcase },
    { href: "/admin/pages", label: t("admin.pages"), icon: FileText },
    { href: "/admin/navigation", label: language === "ar" ? "القوائم والتنقل" : "Navigation", icon: Compass },
    { href: "/admin/media", label: t("admin.media"), icon: ImageIcon },
    ...(user?.isSuperAdmin
      ? [{ href: "/admin/users", label: t("admin.users"), icon: Users }]
      : []),
    { href: "/admin/notifications", label: language === "ar" ? "التنبيهات اللحظية" : "Notifications", icon: Bell },
    { href: "/admin/realtime", label: t("admin.realtime"), icon: Radio },
    { href: "/admin/system", label: t("admin.system"), icon: Activity },
    { href: "/admin/audit", label: language === "ar" ? "سجل الرقابة" : "Audit Logs", icon: ShieldCheck },
    { href: "/admin/settings", label: t("admin.settings"), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-transparent text-rose-50 flex flex-col md:flex-row relative overflow-hidden select-none">

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-ice border-b border-sky-400/20 relative z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-burgundy-700 via-rose-600 to-amber-500 p-0.5 shadow-md shadow-rose-950/60">
            <div className="w-full h-full bg-[#1a0410] rounded-[6px] flex items-center justify-center font-bold text-white text-xs">
              MTI
            </div>
          </div>
          <span className="font-bold text-sm text-white">MTIGroup Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl glass-ice-pill text-rose-200"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 glass-ice border-r border-sky-400/20 flex flex-col justify-between p-4 transition-transform duration-300 backdrop-blur-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Logo */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-sky-400/20">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-burgundy-700 via-rose-600 to-amber-500 p-0.5 shadow-lg shadow-rose-950/70">
              <div className="w-full h-full bg-[#1a0410] rounded-[14px] flex items-center justify-center font-black text-sm burgundy-ice-gradient-text border border-sky-300/30">
                MTI
              </div>
            </div>
            <div>
              <div className="font-black text-sm text-white ice-gradient-text">MTIGroup CMS</div>
              <div className="text-[10px] text-rose-300/80 uppercase tracking-widest font-bold">
                Control Hub
              </div>
            </div>
          </div>

          {/* User Badge */}
          <div className="px-3.5 py-3 rounded-2xl glass-ice-pill border border-white/15 flex items-center gap-3 shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-burgundy-800 flex items-center justify-center font-bold text-xs text-white border border-white/30 shadow-md">
              {user?.fullName?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">{user?.fullName || "Admin"}</div>
              <div className="text-[10px] text-rose-200/70 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{user?.roles?.[0] || "SuperAdmin"}</span>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "luxury-ice-button text-white font-extrabold shadow-lg shadow-rose-950/60"
                      : "text-rose-200/70 hover:text-white hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-rose-300/80"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-white/10 space-y-2 relative z-10">
          {/* SignalR Live Indicator */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl glass-ice-pill text-[11px] text-rose-200/80">
            <span className="flex items-center gap-2 font-medium">
              <Radio className="w-3.5 h-3.5 text-rose-300" />
              <span>Realtime Hub</span>
            </span>
            <span className={`flex items-center gap-1.5 text-[10px] font-mono font-semibold ${
              signalRStatus === "Connected"
                ? "text-emerald-400"
                : signalRStatus === "Connecting"
                ? "text-amber-400"
                : signalRStatus === "Reconnecting"
                ? "text-amber-500"
                : "text-rose-500"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                signalRStatus === "Connected"
                  ? "bg-emerald-400 animate-pulse"
                  : signalRStatus === "Connecting"
                  ? "bg-amber-400 animate-ping"
                  : signalRStatus === "Reconnecting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`} />
              {signalRStatus}
            </span>
          </div>

          {/* Language Switch */}
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl glass-ice-pill hover:bg-white/15 text-[11px] text-white font-bold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-rose-300" />
              <span>{language === "ar" ? "English" : "العربية"}</span>
            </span>
            <span className="text-[10px] uppercase font-mono text-rose-300">{language}</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              router.push("/admin/login");
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-white text-xs font-bold border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t("admin.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative z-10">
        {/* Top bar on Desktop */}
        <header className="hidden md:flex items-center justify-between h-16 px-8 glass-ice border-b border-sky-400/25 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/80 to-transparent opacity-90 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />

          <div className="flex items-center gap-3 text-xs">
            {/* Universal Back Button */}
            <button
              onClick={() => router.back()}
              className="px-3 py-1.5 rounded-xl glass-ice-pill hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title={language === "ar" ? "الرجوع للصفحة السابقة" : "Go Back"}
            >
              {language === "ar" ? <ArrowRight className="w-3.5 h-3.5 text-sky-300" /> : <ArrowLeft className="w-3.5 h-3.5 text-sky-300" />}
              <span>{language === "ar" ? "رجوع" : "Back"}</span>
            </button>

            <div className="flex items-center gap-2 text-rose-200/70">
              <Link href="/" className="hover:text-white transition-colors">
                {language === "ar" ? "الرئيسية العامة" : "Public Website"}
              </Link>
              <span>/</span>
              <span className="text-white font-bold capitalize ice-gradient-text">
                {pathname.replace("/admin", "").replace("/", "") || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl glass-ice-pill hover:bg-white/15 text-white font-bold border border-white/20 flex items-center gap-2 transition-all hover:scale-105 shadow-md"
            >
              <span>{language === "ar" ? "معاينة البوابة العامة" : "View Live Portal"}</span>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
