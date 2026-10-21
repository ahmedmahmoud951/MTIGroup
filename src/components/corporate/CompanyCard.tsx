"use client";

import React from "react";
import Link from "next/link";
import { Company } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  FolderGit2,
  Briefcase,
  Globe,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  HardHat,
  Truck,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { getImageUrl } from "@/lib/image";

interface CompanyCardProps {
  company: Company;
  index: number;
}

export default function CompanyCard({ company, index }: CompanyCardProps) {
  const { language } = useLanguage();

  // Helper to determine sector metadata (badge, icon, color accents)
  const getSectorMeta = () => {
    const slug = company.slug?.toLowerCase() || "";
    const name = company.name?.toLowerCase() || "";

    if (slug.includes("tech") || name.includes("tech") || name.includes("تكنولوجيا")) {
      return {
        label: language === "ar" ? "الحوسبة والذكاء الاصطناعي" : "Cloud & AI Tech",
        icon: Cpu,
        glowColor: "rgba(56, 189, 248, 0.4)",
        borderColor: "border-sky-400/50",
        badgeBg: "bg-sky-500/20 text-sky-200 border-sky-400/40",
        pedestalRing: "border-sky-300/60 shadow-[0_0_20px_rgba(56,189,248,0.4)]",
        sectorKey: "tech",
      };
    }
    if (slug.includes("contract") || slug.includes("build") || name.includes("إنشاء") || name.includes("مقاولات")) {
      return {
        label: language === "ar" ? "الهندسة والبنى التحتية" : "Civil & Infrastructure",
        icon: HardHat,
        glowColor: "rgba(245, 158, 11, 0.4)",
        borderColor: "border-amber-400/50",
        badgeBg: "bg-amber-500/20 text-amber-200 border-amber-400/40",
        pedestalRing: "border-amber-300/60 shadow-[0_0_20px_rgba(245,158,11,0.4)]",
        sectorKey: "infra",
      };
    }
    if (slug.includes("logistic") || slug.includes("supply") || name.includes("لوجست") || name.includes("إمداد")) {
      return {
        label: language === "ar" ? "اللوجستيات وسلاسل الإمداد" : "Supply Chain & Logistics",
        icon: Truck,
        glowColor: "rgba(16, 185, 129, 0.4)",
        borderColor: "border-emerald-400/50",
        badgeBg: "bg-emerald-500/20 text-emerald-200 border-emerald-400/40",
        pedestalRing: "border-emerald-300/60 shadow-[0_0_20px_rgba(16,185,129,0.4)]",
        sectorKey: "logistics",
      };
    }
    return {
      label: language === "ar" ? "قطاع أعمال استراتيجي" : "Strategic Enterprise",
      icon: Sparkles,
      glowColor: "rgba(244, 63, 94, 0.4)",
      borderColor: "border-rose-400/50",
      badgeBg: "bg-rose-500/20 text-rose-200 border-rose-400/40",
      pedestalRing: "border-rose-300/60 shadow-[0_0_20px_rgba(244,63,94,0.4)]",
      sectorKey: "holding",
    };
  };

  const meta = getSectorMeta();
  const SectorIcon = meta.icon;

  return (
    <div
      className={`group relative rounded-3xl glass-ice-card p-6 sm:p-7 flex flex-col justify-between select-none transition-all duration-300 border-2 ${meta.borderColor} hover:shadow-2xl`}
      style={{
        boxShadow: `0 24px 60px -10px rgba(0, 0, 0, 0.9), 0 0 25px -5px ${meta.glowColor}`
      }}
    >
      {/* Dynamic Sector Light Reflection on Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-300/80 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header: Iconic Crystal Logo Showcase & Sector Badges */}
        <div className="flex items-start justify-between gap-4 mb-5">
          {/* Logo Pedestal */}
          <div className={`logo-pedestal ${meta.pedestalRing} transition-transform group-hover:scale-105`}>
            {company.logoUrl ? (
              <img
                src={getImageUrl(company.logoUrl)}
                alt={company.name}
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fallback = e.currentTarget.nextElementSibling;
                  if (fallback) (fallback as HTMLElement).style.display = "flex";
                }}
              />
            ) : null}
            <span
              style={{ display: company.logoUrl ? "none" : "flex" }}
              className="font-black text-2xl ice-cyan-gradient-text tracking-wider items-center justify-center"
            >
              {company.name.slice(0, 3).toUpperCase()}
            </span>
          </div>

          {/* Status & Sector Badges */}
          <div className="flex flex-col items-end gap-1.5 text-right rtl:text-left">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold glass-ice-pill text-white flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              <span>{language === "ar" ? "شركة تابعة نشطة" : "Active Subsidiary"}</span>
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${meta.badgeBg}`}>
              <SectorIcon className="w-3 h-3" />
              <span>{meta.label}</span>
            </span>
          </div>
        </div>

        {/* Company Title */}
        <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-sky-200 transition-colors mb-2.5 tracking-tight leading-snug">
          {company.name}
        </h3>

        {/* Clear & Legible Description */}
        <p className="text-sky-100/90 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-3 font-normal">
          {company.shortDescription || company.description || (language === "ar" ? "شركة استراتيجية رائدة ضمن محفظة استثمارات مجموعة إم تي آي القابضة." : "Leading strategic entity operating under MTI Group Holding ecosystem.")}
        </p>

        {/* Coordinated Metric Compartments */}
        <div className="grid grid-cols-2 gap-2.5 py-3.5 my-3.5 border-y border-sky-400/20 bg-sky-950/20 rounded-2xl px-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200 shrink-0 shadow-inner">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-black text-white ice-cyan-gradient-text leading-tight">
                {company.projectsCount || 12}+
              </div>
              <div className="text-[11px] text-sky-200/80 font-bold">
                {language === "ar" ? "مشاريع معتمدة" : "Projects"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-200 shrink-0 shadow-inner">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-black text-white burgundy-ice-gradient-text leading-tight">
                {company.servicesCount || 6}+
              </div>
              <div className="text-[11px] text-rose-200/80 font-bold">
                {language === "ar" ? "قدرات تخصصية" : "Capabilities"}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Standard Guarantee Note */}
        <div className="flex items-center gap-2 text-[11px] text-sky-200/80 mb-5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{language === "ar" ? "حوكمة تشغيلية متكاملة تحت مظلة MTI" : "MTI Holding Certified Governance"}</span>
        </div>
      </div>

      {/* Action Footer: Wide Luxury Button & Official Website Link */}
      <div className="pt-2 flex items-center gap-2.5">
        <Link
          href={`/company/${company.slug}`}
          className="flex-1 py-3 px-4 rounded-xl luxury-ice-button text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg shadow-black/50 cursor-pointer"
        >
          <span>{language === "ar" ? "استعراض تفاصيل الشركة" : "View Company Details"}</span>
          {language === "ar" ? (
            <ChevronLeft className="w-4 h-4 text-sky-200 transition-transform group-hover:-translate-x-1" />
          ) : (
            <ChevronRight className="w-4 h-4 text-sky-200 transition-transform group-hover:translate-x-1" />
          )}
        </Link>

        {company.websiteUrl && (
          <a
            href={company.websiteUrl}
            className="w-11 h-11 rounded-xl bg-sky-950/40 border border-sky-400/40 hover:border-sky-300 hover:bg-sky-500/20 text-sky-200 hover:text-white transition-all flex items-center justify-center shrink-0 shadow-md cursor-pointer"
            title={language === "ar" ? "الموقع الإلكتروني الرسمي" : "Official Website"}
          >
            <Globe className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
