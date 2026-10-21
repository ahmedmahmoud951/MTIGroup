"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { signalRClient } from "@/lib/signalr";
import { Company } from "@/types";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Building2,
  Clock,
  FileText,
  PhoneCall,
  Send,
  Sparkles,
  Globe,
  CheckCircle2,
  Share2
} from "lucide-react";

export default function Footer() {
  const { language, t } = useLanguage();
  const isAr = language === "ar";

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [companies, setCompanies] = useState<Company[]>([]);

  const loadData = async () => {
    try {
      const [settingsRes, compRes] = await Promise.all([
        api.getHoldingSettings(),
        api.getPublicCompanies(language).catch(() => ({ success: false, data: [] }))
      ]);

      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      if (compRes.success && compRes.data) {
        setCompanies(compRes.data);
      }
    } catch (e) {
      console.warn("Failed loading footer data:", e);
    }
  };

  useEffect(() => {
    loadData();
    const unsubSettings = signalRClient.subscribe("SettingsUpdated", (data) => {
      if (data && typeof data === "object") {
        setSettings((prev) => ({ ...prev, ...data }));
      }
      loadData();
    });
    const unsubComp = signalRClient.subscribe("CompanyUpdated", () => {
      loadData();
    });
    return () => {
      unsubSettings();
      unsubComp();
    };
  }, [language]);

  // Dynamic values with Egyptian corporate defaults
  const logoUrl = settings.Group_LogoUrl || "/images/companies/mti-group-logo.svg";
  const groupName = isAr
    ? settings.Group_Name_ar || "مجموعة شركات إم تي آي القابضة"
    : settings.Group_Name_en || "MTI Group Holding";

  const groupAddress = isAr
    ? settings.Group_Address_ar || "برج إم تي آي، القطاع الأول، التجمع الخامس، القاهرة الجديدة، جمهورية مصر العربية"
    : settings.Group_Address_en || "MTI Group Tower, Sector 1, New Cairo, Cairo, Egypt";

  const groupAddress2 = isAr
    ? settings.Group_Address2_ar || "مجمع الأعمال، القرية الذكية، طريق مصر - الإسكندرية الصحراوي، الجيزة، مصر"
    : settings.Group_Address2_en || "Smart Village Business Complex, Km 28 Cairo-Alex Desert Road, Giza, Egypt";

  const phone = settings.Group_Phone || "+20 2 2813 4500";
  const mobile = settings.Group_Mobile || "+20 10 0123 4567";
  const hotline = settings.Group_Hotline || "19852";
  const email = settings.Group_Email || "contact@mtigroup-eg.com";
  const investmentEmail = settings.Group_Email_Investment || "investment@mtigroup-eg.com";
  const whatsapp = settings.Group_WhatsApp || "+201001234567";

  const workingHours = isAr
    ? settings.Group_WorkingHours_ar || "الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً (الجمعة والسبت عطلة رسمية)"
    : settings.Group_WorkingHours_en || "Sunday - Thursday: 9:00 AM - 5:00 PM (Fri & Sat Weekend)";

  const commercialRegistry = settings.Group_CommercialRegistry || "س.ت: 104829 - استثمار القاهرة";
  const taxNumber = settings.Group_TaxNumber || "ب.ض: 482-931-205";

  const aboutText = isAr
    ? settings.Footer_About_ar || "مجموعة شركات استثمارية مصرية متعددة القطاعات، تقود الابتكار في التقنية السحابية، المقاولات الإنشائية، والحلول اللوجستية الحديثة في جمهورية مصر العربية."
    : settings.Footer_About_en || "A premier Egyptian diversified conglomerate leading innovation across enterprise cloud, smart civil contracting, and global supply chain logistics.";

  const rightsText = isAr
    ? settings.Footer_Rights_ar || "مجموعة شركات إم تي آي القابضة مصر. جميع الحقوق محفوظة."
    : settings.Footer_Rights_en || "MTI Group Holding Egypt. All Rights Reserved.";

  return (
    <footer className="w-full border-t border-sky-400/30 bg-gradient-to-b from-[#14020b]/98 via-[#1c0412]/98 to-[#0d0107] mt-auto text-sky-100/75 text-sm select-none relative overflow-hidden">
      {/* Top Glacial Cyan-Ice Shimmer Beam */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-sky-400/90 to-transparent opacity-90 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
      
      {/* Ambient Atmospheric Velvet Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/20 via-transparent to-transparent pointer-events-none" />

      {/* ==============================================================
          1. TOP EGYPTIAN EXECUTIVE CONTACT CARDS RIBBON
          ============================================================== */}
      <div className="border-b border-sky-400/20 bg-sky-950/20 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Cairo Headquarters */}
            <div className="p-4 rounded-2xl glass-ice-card flex items-start gap-3.5 border border-sky-400/30 group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200 shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.3)] group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5 text-sky-300" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-sky-300 tracking-wider block">
                  {isAr ? "المقر الإداري الرئيسي - القاهرة" : "Cairo Executive HQ"}
                </span>
                <p className="text-xs text-white/90 font-medium leading-relaxed">
                  {groupAddress}
                </p>
                {groupAddress2 && (
                  <p className="text-[11px] text-sky-200/70 pt-1 border-t border-sky-400/10">
                    <span className="font-bold text-amber-300">{isAr ? "فرع العمليات: " : "Branch: "}</span>
                    {groupAddress2}
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Egyptian Phone Lines & Hotline */}
            <div className="p-4 rounded-2xl glass-ice-card flex items-start gap-3.5 border border-sky-400/30 group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-emerald-300 tracking-wider block">
                    {isAr ? "أرقام التواصل والخط الساخن" : "Hotline & Direct Lines"}
                  </span>
                  {hotline && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-[10px] font-black font-mono border border-emerald-400/40">
                      {hotline}
                    </span>
                  )}
                </div>
                <div className="space-y-1 pt-0.5">
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    dir="ltr"
                    className="block text-xs font-mono font-bold text-white hover:text-sky-300 transition-colors"
                  >
                    {phone}
                  </a>
                  {mobile && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${mobile.replace(/\s+/g, "")}`}
                        dir="ltr"
                        className="text-[11px] font-mono text-sky-200 hover:text-white transition-colors"
                      >
                        {mobile}
                      </a>
                      {whatsapp && (
                        <a
                          href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                          className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold hover:bg-emerald-500/30 transition-all"
                        >
                          WhatsApp
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Card 3: Central Corporate Email & Investments */}
            <div className="p-4 rounded-2xl glass-ice-card flex items-start gap-3.5 border border-sky-400/30 group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-200 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.3)] group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5 text-rose-300" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-rose-300 tracking-wider block">
                  {isAr ? "البريد والتعاقدات المؤسسية" : "Corporate & Investments"}
                </span>
                <div className="space-y-1">
                  <a
                    href={`mailto:${email}`}
                    className="block text-xs font-mono font-bold text-white hover:text-rose-200 transition-colors truncate"
                  >
                    {email}
                  </a>
                  {investmentEmail && (
                    <a
                      href={`mailto:${investmentEmail}`}
                      className="block text-[11px] font-mono text-rose-200/80 hover:text-white transition-colors truncate"
                    >
                      {investmentEmail}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Card 4: Working Hours & Support */}
            <div className="p-4 rounded-2xl glass-ice-card flex items-start gap-3.5 border border-sky-400/30 group hover:border-sky-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-200 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase text-amber-300 tracking-wider block">
                  {isAr ? "ساعات العمل الرسمية" : "Official Working Hours"}
                </span>
                <p className="text-xs text-white/90 font-medium leading-relaxed">
                  {workingHours}
                </p>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isAr ? "الاستقبال والمقر الرئيسي متاح" : "HQ Open for Executive Visits"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          2. MAIN FOOTER SITEMAP & GROUP PORTFOLIO
          ============================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Holding Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3.5">
              {/* Logo Pedestal */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 via-rose-600 to-burgundy-900 p-0.5 shadow-lg shadow-sky-950/70">
                <div className="w-full h-full bg-[#16020c] rounded-[14px] flex items-center justify-center border border-sky-300/30 p-1 overflow-hidden">
                  {logoUrl ? (
                    <Image
                      key={logoUrl}
                      src={getImageUrl(logoUrl)}
                      alt={groupName}
                      width={44}
                      height={44}
                      className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                      unoptimized={true}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes("mti-group-logo.svg")) {
                          target.src = "/images/companies/mti-group-logo.svg";
                        }
                      }}
                    />
                  ) : (
                    <span className="font-black text-sm ice-cyan-gradient-text">MTI</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-extrabold text-base text-white ice-gradient-text block leading-tight">
                  {groupName}
                </span>
                <span className="text-[10px] text-sky-300/80 font-bold uppercase tracking-wider block">
                  {isAr ? "صرح استثماري مصري رائد" : "Premier Egyptian Conglomerate"}
                </span>
              </div>
            </div>

            <p className="text-xs text-sky-100/80 leading-relaxed font-normal">
              {aboutText}
            </p>

            {/* Social Links Dock with Glowing Hover */}
            <div className="flex items-center gap-2 pt-2">
              {settings.Group_Social_LinkedIn && (
                <a
                  href={settings.Group_Social_LinkedIn}
                  aria-label="LinkedIn"
                  className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-400/30 flex items-center justify-center text-sky-300 hover:text-white hover:bg-sky-500/30 hover:border-sky-300 transition-all shadow-md"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.Group_Social_Facebook && (
                <a
                  href={settings.Group_Social_Facebook}
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-400/30 flex items-center justify-center text-sky-300 hover:text-white hover:bg-sky-500/30 hover:border-sky-300 transition-all shadow-md"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
              {settings.Group_Social_Twitter && (
                <a
                  href={settings.Group_Social_Twitter}
                  aria-label="Twitter / X"
                  className="w-8 h-8 rounded-xl bg-sky-950/60 border border-sky-400/30 flex items-center justify-center text-sky-300 hover:text-white hover:bg-sky-500/30 hover:border-sky-300 transition-all shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-400/30 flex items-center justify-center text-emerald-300 hover:text-white hover:bg-emerald-500/30 hover:border-emerald-300 transition-all shadow-md"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Dynamic Subsidiary Companies (Loaded from Database) */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-sky-300" />
              <span>{isAr ? "شركات المجموعة التابعة" : "Subsidiary Companies"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              {companies.length > 0 ? (
                companies.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/company/${c.slug}`}
                      className="hover:text-sky-300 transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 group-hover:scale-150 transition-transform shadow-[0_0_6px_#38bdf8]" />
                      <span className="text-white/90 group-hover:text-sky-200">{c.name}</span>
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/company/mti-technology" className="hover:text-sky-300 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>{isAr ? "إم تي آي للتكنولوجيا والسحاب" : "MTI Technology & Cloud"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/company/mti-contracting" className="hover:text-amber-300 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{isAr ? "إم تي آي للمقاولات والإنشاءات" : "MTI Contracting & Civil"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/company/mti-logistics" className="hover:text-emerald-300 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{isAr ? "إم تي آي للخدمات اللوجستية" : "MTI Logistics & Supply"}</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Col 3: Corporate Links & Governance */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? "الروابط المؤسسية والحوكمة" : "Governance & Links"}</span>
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <a href="/#companies" className="hover:text-white transition-colors">
                  {isAr ? "المنظومة المدارية للشركات" : "Orbital Subsidiaries Constellation"}
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-white transition-colors">
                  {isAr ? "الرؤية والهدف الاستراتيجي" : "Corporate Vision & Strategy"}
                </a>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-sky-300 transition-colors flex items-center gap-1.5 text-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>{t("nav.admin")}</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://companygroup.runasp.net/swagger"
                  className="hover:text-rose-300 transition-colors flex items-center gap-1 text-slate-300"
                >
                  <span>OpenAPI Swagger Gateway</span>
                  <ExternalLink className="w-3 h-3 text-rose-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Egyptian Commercial Registration */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? "بيانات التسجيل والحوكمة بمصر" : "Egyptian Legal Status"}</span>
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-400/20 space-y-1">
                <span className="text-[10px] text-sky-300 font-bold block">
                  {isAr ? "السجل التجاري المصري:" : "Commercial Registry:"}
                </span>
                <span className="font-mono text-white font-bold block">
                  {commercialRegistry}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-400/20 space-y-1">
                <span className="text-[10px] text-sky-300 font-bold block">
                  {isAr ? "البطاقة الضريبية للمجموعة:" : "Tax Registration Card:"}
                </span>
                <span className="font-mono text-white font-bold block">
                  {taxNumber}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-300 pt-1 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{isAr ? "مجموعة استثمارية معتمدة وفق القوانين المصرية" : "Registered Egyptian Holding Group"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==============================================================
            3. BOTTOM COPYRIGHT & SECURITY SEAL
            ============================================================== */}
        <div className="pt-8 border-t border-sky-400/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-200/70 font-medium">
          <p>© {new Date().getFullYear()} {rightsText}</p>
          <div className="flex items-center gap-6">
            <span className="text-sky-300/80 font-mono text-[11px]">
              {isAr ? "القاهرة الجديدة • جمهورية مصر العربية" : "New Cairo • Arab Republic of Egypt"}
            </span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SQL Server & SignalR Active
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
