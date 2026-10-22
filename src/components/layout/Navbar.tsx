"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { signalRClient, SignalRStatus } from "@/lib/signalr";
import { ShieldCheck, Globe, LogIn, LayoutDashboard, Radio, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/image";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [signalRStatus, setSignalRStatus] = useState<SignalRStatus>("Connecting");
  const [holdingLogo, setHoldingLogo] = useState<string | null>("/images/companies/mti-holding.png");
  const [holdingNameAr, setHoldingNameAr] = useState<string>("مجموعة إم تي آي");
  const [holdingNameEn, setHoldingNameEn] = useState<string>("MTI Group");

  const loadHoldingSettings = async () => {
    try {
      const res = await api.getHoldingSettings();
      if (res.success && res.data) {
        if (res.data.Group_LogoUrl) setHoldingLogo(res.data.Group_LogoUrl);
        if (res.data.Group_Name_ar) setHoldingNameAr(res.data.Group_Name_ar);
        if (res.data.Group_Name_en) setHoldingNameEn(res.data.Group_Name_en);
      }
    } catch (e) {
      // Fallback to defaults
    }
  };

  useEffect(() => {
    loadHoldingSettings();
    signalRClient.init();
    const unsubStatus = signalRClient.onStatusChange((status) => {
      setSignalRStatus(status);
    });

    const unsubSettings = signalRClient.subscribe("SettingsUpdated", (data) => {
      if (data && typeof data === "object") {
        if (data.Group_LogoUrl) setHoldingLogo(data.Group_LogoUrl);
        if (data.Group_Name_ar) setHoldingNameAr(data.Group_Name_ar);
        if (data.Group_Name_en) setHoldingNameEn(data.Group_Name_en);
      }
      loadHoldingSettings();
    });

    return () => {
      unsubStatus();
      unsubSettings();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#16030d]/85 backdrop-blur-2xl border-b border-sky-400/30 shadow-2xl shadow-black/70 relative">
      {/* Top Glacial Cyan-Ice Light Shimmer */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/90 to-transparent opacity-90 shadow-[0_0_10px_rgba(56,189,248,0.6)]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between">
        {/* Brand Logo - Enlarged Luxury Pedestal */}
        <Link href="/" className="flex items-center gap-4 group select-none">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-sky-400 via-rose-500 to-sky-300 p-0.5 shadow-xl shadow-sky-950/80 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.7)] transition-all duration-300 shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center border border-sky-300/50 p-1.5 overflow-hidden shadow-inner">
              {holdingLogo ? (
                <Image
                  key={holdingLogo}
                  src={getImageUrl(holdingLogo)}
                  alt="MTI Group"
                  width={80}
                  height={80}
                  priority
                  className="w-full h-full object-contain filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform"
                  unoptimized={true}
                  onError={() => setHoldingLogo("/images/companies/mti-holding.webp")}
                />
              ) : (
                <span className="font-black text-2xl ice-cyan-gradient-text tracking-wider">
                  MTI
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-sky-200 transition-colors flex items-center gap-2">
              <span className="ice-gradient-text">
                {language === "ar"
                  ? holdingNameAr.replace(/القابضة/g, "").replace(/\s+/g, " ").trim()
                  : holdingNameEn.replace(/Holding/gi, "").replace(/\s+/g, " ").trim()}
              </span>
            </span>
            <span className="block text-[11px] sm:text-xs uppercase tracking-widest text-sky-300/90 font-bold mt-0.5">
              {language === "ar" ? "الريادة في قطاعات المستقبل" : "Pioneering Modern Industries"}
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-rose-200/80">
          <Link href="/" className="hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all">
            {t("nav.home")}
          </Link>
          <Link href="/#companies" className="hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all">
            {t("nav.companies")}
          </Link>
          <Link href="/#about" className="hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all">
            {t("nav.about")}
          </Link>
          <Link href="/#contact" className="hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] transition-all">
            {t("nav.contact")}
          </Link>
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Realtime Status Indicator */}
          <div
            title={`SignalR Hub: ${signalRStatus}`}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-ice-pill text-xs shadow-md"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                signalRStatus === "Connected"
                  ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"
                  : signalRStatus === "Connecting"
                  ? "bg-amber-400 animate-ping"
                  : signalRStatus === "Reconnecting"
                  ? "bg-amber-500 animate-pulse"
                  : "bg-rose-500"
              }`}
            />
            <span className="text-white text-[11px] font-mono font-semibold tracking-wide">
              {signalRStatus === "Connected"
                ? "Live SignalR"
                : signalRStatus === "Reconnecting"
                ? "Reconnecting"
                : signalRStatus === "Connecting"
                ? "Connecting"
                : "Disconnected"}
            </span>
          </div>

          {/* Universal Back Button for all subpages */}
          {pathname !== "/" && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl luxury-ice-button text-xs font-black text-white transition-all hover:scale-105 cursor-pointer shadow-md border border-sky-300/50"
              title={language === "ar" ? "الرجوع للصفحة السابقة" : "Go Back"}
            >
              {language === "ar" ? <ArrowRight className="w-3.5 h-3.5 text-sky-200" /> : <ArrowLeft className="w-3.5 h-3.5 text-sky-200" />}
              <span>{language === "ar" ? "رجوع" : "Back"}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl glass-ice-pill hover:bg-white/15 text-xs font-bold text-white transition-all hover:scale-105 cursor-pointer shadow-md"
          >
            <Globe className="w-3.5 h-3.5 text-rose-300" />
            <span>{language === "ar" ? "English" : "العربية"}</span>
          </button>

          {/* Admin Login / Dashboard Button */}
          {isAuthenticated ? (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl luxury-ice-button text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-rose-950/60"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-rose-100" />
              <span>{t("admin.dashboard")}</span>
            </Link>
          ) : (
            <Link
              href="/admin/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-ice-button text-white text-xs font-bold hover:scale-105 transition-all cursor-pointer shadow-md"
            >
              <LogIn className="w-3.5 h-3.5 text-rose-300" />
              <span>{t("nav.admin")}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
