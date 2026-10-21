"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CompanyCard from "@/components/corporate/CompanyCard";
import OrbitalConstellation from "@/components/corporate/OrbitalConstellation";
import { Company } from "@/types";
import { api } from "@/lib/api";
import { signalRClient } from "@/lib/signalr";
import { getImageUrl } from "@/lib/image";
import { useLanguage } from "@/context/LanguageContext";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Globe2,
  Sparkles,
  ArrowDown,
  Layers,
  ChevronRight,
  ChevronLeft,
  Radio,
  RefreshCw,
  AlertCircle,
  Cpu,
  HardHat,
  Truck,
  CheckCircle2,
  Search,
  LayoutGrid,
  ListFilter,
  ArrowUpRight,
  FolderGit2,
  Briefcase,
  Orbit,
  Crown,
  PhoneCall,
  MessageSquare,
  MapPin,
  Mail,
  Clock
} from "lucide-react";

const DEFAULT_COMPANIES: Company[] = [
  {
    id: "comp-tech-1",
    name: "إم تي آي للتكنولوجيا والحلول الرقمية",
    slug: "mti-technology",
    description: "بنية سحابية ذكية، حلول ذكاء اصطناعي وأمن سيبراني للمؤسسات والشركات الكبرى بمصر.",
    shortDescription: "التحول الرقمي والحوسبة السحابية المتقدمة",
    logoUrl: "/uploads/f0dbe6ac4a454e93bf4959a6c3433529.png",
    displayOrder: 1,
    isActive: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comp-royal-2",
    name: "إم تي آي رويال للمشاريع والاستثمار",
    slug: "mti-royal",
    description: "تطوير المشاريع الاستثمارية والإنشائية الفاخرة والاستشارات الهندسية المتطورة.",
    shortDescription: "المشاريع الاستثمارية الكبرى والتطوير",
    logoUrl: "/uploads/5b8484ac00dc444488486d67d4ba63e1.png",
    displayOrder: 2,
    isActive: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comp-ecee-3",
    name: "إم تي آي للخدمات اللوجستية (ECEE)",
    slug: "ecee",
    description: "شبكات نقل وتوزيع متطورة، مستودعات ذكية وسلاسل إمداد متكاملة تغطي الموانئ المصرية والمحافظات.",
    shortDescription: "سلاسل الإمداد والنقل واللوجستيات",
    logoUrl: "/uploads/9ffc1447745b422185a27b7b7cbd6534.png",
    displayOrder: 3,
    isActive: true,
    createdAt: "2026-01-01"
  },
  {
    id: "comp-redline-4",
    name: "خط أحمر (Red Line)",
    slug: "red-line",
    description: "حلول تكنولوجية متقدمة، خدمات متكاملة وابتكار مستمر يواكب أعلى معايير الجودة العالمية.",
    shortDescription: "الابتكار والحلول الذكية المتكاملة",
    logoUrl: "/uploads/82592440bc5245d3aa87c033bac6c324.png",
    displayOrder: 4,
    isActive: true,
    createdAt: "2026-01-01"
  }
];

export default function HomePage() {
  const { language, t } = useLanguage();
  const isAr = language === "ar";

  const [companies, setCompanies] = useState<Company[]>(DEFAULT_COMPANIES);
  const [holdingSettings, setHoldingSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveEvent, setLiveEvent] = useState<string | null>(null);

  // Sector filtering & search for managing large portfolios of companies
  const [selectedSector, setSelectedSector] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Default to orbital view for iconic circular showcase around MTI Group
  const [viewMode, setViewMode] = useState<"orbital" | "grid" | "directory">("orbital");

  const fetchCompanies = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getPublicCompanies(language);
      if (res.success && res.data && res.data.length > 0) {
        setCompanies(res.data);
      }
    } catch (err: any) {
      console.warn("Failed to load companies from API:", err);
    }
  }, [language]);

  const fetchHoldingSettings = useCallback(async () => {
    try {
      const res = await api.getHoldingSettings();
      if (res.success && res.data) {
        setHoldingSettings(res.data);
      }
    } catch (err) {
      console.warn("Failed to load holding settings:", err);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
    fetchHoldingSettings();
  }, [fetchCompanies, fetchHoldingSettings]);

  // Subscribe to real-time events and automatic reconnect data refresh
  useEffect(() => {
    const unsubCreated = signalRClient.subscribe("CompanyCreated", (data) => {
      setLiveEvent(isAr ? `تحديث لحظي: تمت إضافة شركة جديدة (${data.CompanyName || ""})` : `Realtime: New company added (${data.CompanyName || "Update"})`);
      fetchCompanies();
    });

    const unsubUpdated = signalRClient.subscribe("CompanyUpdated", (data) => {
      setLiveEvent(isAr ? `تحديث لحظي: تم تعديل بيانات شركة (${data.CompanyName || ""})` : `Realtime: Company modified (${data.CompanyName || "Update"})`);
      fetchCompanies();
    });

    const unsubDeleted = signalRClient.subscribe("CompanyDeleted", () => {
      setLiveEvent(isAr ? "تحديث لحظي: تم تحديث قائمة الشركات" : "Realtime: Company record removed");
      fetchCompanies();
    });

    const unsubSettings = signalRClient.subscribe("SettingsUpdated", (data) => {
      setLiveEvent(isAr ? "تحديث لحظي: تم تحديث إعدادات وهوية المجموعة والشعار" : "Realtime: Holding settings & logo updated");
      if (data && typeof data === "object") {
        setHoldingSettings((prev) => ({ ...prev, ...data }));
      }
      fetchHoldingSettings();
    });

    const unsubReconnected = signalRClient.subscribe("Reconnected", () => {
      fetchCompanies();
      fetchHoldingSettings();
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubSettings();
      unsubReconnected();
    };
  }, [fetchCompanies, fetchHoldingSettings, isAr]);

  // Holding Identity variables
  const groupLogoUrl = holdingSettings.Group_LogoUrl || "/images/companies/mti-holding.png";
  const groupName = isAr
    ? holdingSettings.Group_Name_ar || "مجموعة شركات إم تي آي القابضة"
    : holdingSettings.Group_Name_en || "MTI Group Holding";

  // Dynamic Homepage Texts from CMS / Holding Settings
  const heroBadge = isAr
    ? holdingSettings.Home_HeroBadge_ar || "الريادة المؤسسية والاستثمار الاستراتيجي"
    : holdingSettings.Home_HeroBadge_en || "Global Strategic Holding & Investment";

  const heroTitle = isAr
    ? holdingSettings.Home_HeroTitle_ar || "تمكين وريادة قطاعات المستقبل"
    : holdingSettings.Home_HeroTitle_en || "POWERING STRATEGIC INDUSTRIES";

  const heroSubtitle = isAr
    ? holdingSettings.Home_HeroSubtitle_ar || "مجموعة قابضة رائدة تجمع بين الحوسبة السحابية المتقدمة، مشاريع المقاولات العملاقة، وشبكات سلاسل الإمداد الذكية لدعم مسيرة التطور والتحول المؤسسي."
    : holdingSettings.Home_HeroSubtitle_en || "A premier conglomerate orchestrating high-impact enterprise technology, generational civil infrastructure, and resilient automated supply chains across the MENA region.";

  const ctaCompanies = isAr
    ? holdingSettings.Home_CtaCompanies_ar || "استكشف منظومة شركاتنا"
    : holdingSettings.Home_CtaCompanies_en || "Explore Strategic Subsidiaries";

  const ctaContact = isAr
    ? holdingSettings.Home_CtaContact_ar || "تواصل مع الإدارة العليا"
    : holdingSettings.Home_CtaContact_en || "Executive Inquiries";

  const subsBadge = isAr
    ? holdingSettings.Home_SubsBadge_ar || "محفظة شركاتنا التابعة"
    : holdingSettings.Home_SubsBadge_en || "Strategic Subsidiaries Constellation";

  const subsTitle = isAr
    ? holdingSettings.Home_SubsTitle_ar || "شركاتنا الاستراتيجية"
    : holdingSettings.Home_SubsTitle_en || "OUR COMPANIES";

  const subsSubtitle = isAr
    ? holdingSettings.Home_SubsSubtitle_ar || "استعرض منظومة الشركات التابعة لمجموعة MTI والمصممة لتلبية متطلبات المشاريع الكبرى."
    : holdingSettings.Home_SubsSubtitle_en || "Explore our specialized corporate entities revolving around MTI Group, driving technological innovation, mega infrastructure, and resilient supply chains.";

  const stat1Value = holdingSettings.Home_Stat1_Value || "4+";
  const stat1Label = isAr ? (holdingSettings.Home_Stat1_Label_ar || "شركات تشغيلية كبرى") : (holdingSettings.Home_Stat1_Label_en || "Strategic Subsidiaries");

  const stat2Value = holdingSettings.Home_Stat2_Value || "25+";
  const stat2Label = isAr ? (holdingSettings.Home_Stat2_Label_ar || "عاماً من الريادة والتميز") : (holdingSettings.Home_Stat2_Label_en || "Years of Market Leadership");

  const stat3Value = holdingSettings.Home_Stat3_Value || "$500M+";
  const stat3Label = isAr ? (holdingSettings.Home_Stat3_Label_ar || "قيمة المحفظة الاستثمارية") : (holdingSettings.Home_Stat3_Label_en || "Portfolio Capital Value");

  const stat4Value = holdingSettings.Home_Stat4_Value || "120+";
  const stat4Label = isAr ? (holdingSettings.Home_Stat4_Label_ar || "مشروع وطني وإقليمي منجز") : (holdingSettings.Home_Stat4_Label_en || "Completed Mega Projects");

  const visionTitle = isAr
    ? holdingSettings.Home_VisionTitle_ar || "قوة استثمارية تجمع بين الابتكار الرقمي والتنفيذ الهندسي وسلاسل الإمداد"
    : holdingSettings.Home_VisionTitle_en || "A diversified investment force uniting digital platforms, mega-engineering & supply chain power";

  const visionText = isAr
    ? holdingSettings.Home_VisionText_ar || "تأسست مجموعة MTI لتكون شريكاً وطنياً وإقليمياً موثوقاً في قيادة المشاريع الكبرى وتمكين التحول المؤسسي الشامل. نحن ندمج بين أحدث تقنيات الحوسبة السحابية والذكاء الاصطناعي، والخبرة الهندسية الميدانية في المشاريع الإنشائية، والشبكات اللوجستية الحديثة لتوفير قيمة مضافة مستدامة."
    : holdingSettings.Home_VisionText_en || "At MTI Group Holding, we empower our subsidiary entities with capital, cutting-edge digital governance, and strategic market access to deliver transformative mega-projects across technology, civil contracting, and global logistics.";

  const contactTitle = isAr
    ? holdingSettings.Home_ContactTitle_ar || "هل تبحث عن شراكة استراتيجية مع إحدى شركاتنا في مصر؟"
    : holdingSettings.Home_ContactTitle_en || "Looking to Partner with MTI Group Subsidiaries?";

  const contactSubtitle = isAr
    ? holdingSettings.Home_ContactSubtitle_ar || "فريقنا الاستثماري والتنفيذي بمقر القاهرة الجديدة مستعد للتواصل ومناقشة فرص التكامل التجاري والمشاريع المشتركة."
    : holdingSettings.Home_ContactSubtitle_en || "Our executive and business development teams in Cairo are ready to discuss strategic joint ventures and procurement.";

  const groupPhone = holdingSettings.Group_Phone || "+20 2 2813 4500";
  const groupMobile = holdingSettings.Group_Mobile || "+20 10 0123 4567";
  const groupHotline = holdingSettings.Group_Hotline || "19852";
  const groupEmail = holdingSettings.Group_Email || "contact@mtigroup-eg.com";
  const groupEmailInvestment = holdingSettings.Group_Email_Investment || "investment@mtigroup-eg.com";
  const groupWhatsApp = holdingSettings.Group_WhatsApp || "+201001234567";
  const groupAddress = isAr
    ? holdingSettings.Group_Address_ar || "برج إم تي آي، القطاع الأول، التجمع الخامس، القاهرة الجديدة، مصر"
    : holdingSettings.Group_Address_en || "MTI Group Tower, Sector 1, New Cairo, Cairo, Egypt";

  // Sector counts
  const sectorCounts = useMemo(() => {
    const isTech = (c: Company) => {
      const text = ((c.slug || "") + " " + (c.name || "")).toLowerCase();
      return text.includes("tech") || text.includes("تكنولوجيا") || text.includes("cloud") || text.includes("سحاب");
    };
    const isInfra = (c: Company) => {
      const text = ((c.slug || "") + " " + (c.name || "")).toLowerCase();
      return text.includes("contract") || text.includes("build") || text.includes("إنشاء") || text.includes("مقاولات") || text.includes("هندسة");
    };
    const isLogistics = (c: Company) => {
      const text = ((c.slug || "") + " " + (c.name || "")).toLowerCase();
      return text.includes("logistic") || text.includes("supply") || text.includes("لوجست") || text.includes("إمداد") || text.includes("نقل");
    };

    const tech = companies.filter(isTech).length;
    const infra = companies.filter(isInfra).length;
    const logistics = companies.filter(isLogistics).length;
    const holding = companies.filter((c) => !isTech(c) && !isInfra(c) && !isLogistics(c)).length;

    return { all: companies.length, tech, infra, logistics, holding };
  }, [companies]);

  // Filtered companies based on active sector & search query
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const text = ((c.slug || "") + " " + (c.name || "")).toLowerCase();

      // Sector check
      if (selectedSector === "tech") {
        if (!(text.includes("tech") || text.includes("تكنولوجيا") || text.includes("cloud") || text.includes("سحاب"))) return false;
      } else if (selectedSector === "infra") {
        if (!(text.includes("contract") || text.includes("build") || text.includes("إنشاء") || text.includes("مقاولات") || text.includes("هندسة"))) return false;
      } else if (selectedSector === "logistics") {
        if (!(text.includes("logistic") || text.includes("supply") || text.includes("لوجست") || text.includes("إمداد") || text.includes("نقل"))) return false;
      } else if (selectedSector === "holding") {
        const matchesOthers = text.includes("tech") || text.includes("contract") || text.includes("build") || text.includes("logistic") || text.includes("supply");
        if (matchesOthers) return false;
      }

      // Search query check
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          c.name?.toLowerCase().includes(q) ||
          c.slug?.toLowerCase().includes(q) ||
          c.shortDescription?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [companies, selectedSector, searchQuery]);

  return (
    <div className="flex flex-col min-h-screen text-white selection:bg-rose-900 selection:text-white bg-transparent">
      <Navbar />

      {/* Realtime Event Toast Banner */}
      {liveEvent && (
        <div className="bg-gradient-to-r from-rose-950/90 via-[#102a4e]/90 to-rose-950/90 text-white text-xs py-2.5 px-4 text-center flex items-center justify-center gap-2 backdrop-blur-2xl sticky top-20 z-40 shadow-2xl border-b border-sky-400/40 animate-fade-in">
          <Radio className="w-3.5 h-3.5 animate-pulse text-sky-300" />
          <span className="font-bold tracking-wide">{liveEvent}</span>
          <button onClick={() => setLiveEvent(null)} className="ml-4 text-sky-200 hover:text-white underline text-[11px] cursor-pointer">
            {isAr ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Hero Section: Glacial Cyan-Ice & iPhone Deep Burgundy */}
      <section className="relative pt-24 pb-28 overflow-hidden border-b border-sky-400/20">
        {/* Architectural Ambient Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c0512]/70 via-[#27071a]/40 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          {/* Frosted Glacial Ice Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-ice-pill border border-sky-300/50 text-white text-xs font-black shadow-xl shadow-sky-950/40">
            <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
            <span className="tracking-widest uppercase ice-cyan-gradient-text">{heroBadge}</span>
          </div>

          {/* Heading with Frosted Cyan-Ice & Vibrant Royal Velvet Gradient */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.14] max-w-5xl mx-auto uppercase">
            {heroTitle.includes(" ") ? (
              <>
                {heroTitle.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="ice-cyan-gradient-text">{heroTitle.split(" ").slice(-2).join(" ")}</span>
              </>
            ) : (
              <span className="ice-cyan-gradient-text">{heroTitle}</span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sky-100/95 text-lg sm:text-2xl max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
            {heroSubtitle}
          </p>

          {/* CTA Buttons: Luxury Ice Buttons with Glow */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#companies"
              className="px-9 py-4 rounded-2xl luxury-ice-button text-white font-black text-sm sm:text-base transition-all flex items-center gap-2.5 cursor-pointer shadow-2xl shadow-rose-950/70 hover:scale-105"
            >
              <span>{ctaCompanies}</span>
              <ArrowDown className="w-4 h-4 animate-bounce text-sky-200" />
            </a>

            <a
              href="#contact"
              className="px-8 py-4 rounded-2xl glass-ice-pill border border-sky-400/40 text-sky-100 font-bold text-sm sm:text-base transition-all hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer shadow-xl"
            >
              <span>{ctaContact}</span>
              <ArrowUpRight className="w-4 h-4 text-sky-300" />
            </a>
          </div>

          {/* Group Metrics Ribbon: Clean Frosted Ice-Burgundy Panels */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 pt-14 max-w-5xl mx-auto text-left rtl:text-right">
            <div className="glass-ice-card p-6 rounded-3xl relative overflow-hidden group">
              <div className="text-3xl font-black text-white mb-1 group-hover:scale-105 transition-transform ice-cyan-gradient-text">
                {stat1Value}
              </div>
              <div className="text-xs text-sky-100 font-bold">{stat1Label}</div>
            </div>

            <div className="glass-ice-card p-6 rounded-3xl relative overflow-hidden group">
              <div className="text-3xl font-black text-white mb-1 group-hover:scale-105 transition-transform ice-cyan-gradient-text">
                {stat2Value}
              </div>
              <div className="text-xs text-sky-100 font-bold">{stat2Label}</div>
            </div>

            <div className="glass-ice-card p-6 rounded-3xl relative overflow-hidden group">
              <div className="text-3xl font-black text-emerald-300 mb-1 group-hover:scale-105 transition-transform">
                {stat3Value}
              </div>
              <div className="text-xs text-sky-100 font-bold">{stat3Label}</div>
            </div>

            <div className="glass-ice-card p-6 rounded-3xl relative overflow-hidden group">
              <div className="text-3xl font-black gold-gradient-text mb-1 group-hover:scale-105 transition-transform">
                {stat4Value}
              </div>
              <div className="text-xs text-sky-100 font-bold">{stat4Label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Pillars / ركائز التميز المؤسسي */}
      <section className="py-16 border-b border-sky-400/15 bg-[#17030e]/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl glass-ice-card flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  {isAr ? "التحول الرقمي والحوسبة السحابية" : "Digital & Cloud Transformation"}
                </h4>
                <p className="text-xs text-sky-100/80 leading-relaxed">
                  {isAr ? "بنية سحابية ذكية وحلول ذكاء اصطناعي وأمن سيبراني للمؤسسات الكبرى." : "Enterprise cloud, advanced AI automation, and proactive cyber protection."}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-ice-card flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-200 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <HardHat className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  {isAr ? "الهندسة والمشاريع الإنشائية العملاقة" : "Civil Mega Infrastructure"}
                </h4>
                <p className="text-xs text-sky-100/80 leading-relaxed">
                  {isAr ? "تطوير البنى التحتية والمباني الإدارية والتجارية بأعلى معايير الاستدامة." : "Generational infrastructure development adhering to global engineering standards."}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl glass-ice-card flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-200 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white mb-1">
                  {isAr ? "سلاسل الإمداد والخدمات اللوجستية" : "Supply Chain & Smart Logistics"}
                </h4>
                <p className="text-xs text-sky-100/80 leading-relaxed">
                  {isAr ? "شبكات نقل متطورة، مستودعات ذكية مبردة، ومراكز توزيع إقليمية سريعة." : "Cold chain storage, automated regional fulfillment, and international freight."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Companies Section: OUR COMPANIES - Next-Generation Portfolio Showcase */}
      <section id="companies" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-ice-pill text-white text-xs font-bold border border-sky-400/40 shadow-lg">
            <Orbit className="w-3.5 h-3.5 text-sky-300 animate-spin-slow" />
            <span>{subsBadge}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            {subsTitle}
          </h2>
          <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            {subsSubtitle}
          </p>
        </div>

        {/* Portfolio Control Bar: Live Search, View Modes & Sector Tabs */}
        <div className="mb-10 space-y-4">
          {/* Top Row: Search Input & View Mode Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl glass-ice border border-sky-400/30">
            {/* Search Box with Glacial Ice Contrast */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-sky-300 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "ابحث باسم الشركة أو المجال..." : "Search subsidiaries by name..."}
                className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2 rounded-xl bg-[#1a0411]/90 border border-sky-400/40 text-sky-100 font-bold text-xs focus:outline-none focus:border-sky-300 placeholder:text-sky-300/50 shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-sky-300 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Switcher (Orbital Constellation, Crystal Grid, Executive Directory) */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] text-sky-200/80 font-bold hidden md:inline">
                {isAr ? "طريقة العرض:" : "Display Mode:"}
              </span>
              <div className="flex items-center p-1 rounded-xl bg-sky-950/60 border border-sky-400/30">
                {/* Orbital Constellation View Button */}
                <button
                  onClick={() => setViewMode("orbital")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "orbital"
                      ? "luxury-ice-button text-white shadow-md"
                      : "text-sky-200/70 hover:text-white"
                  }`}
                  title={isAr ? "عرض المنظومة المدارية الدائرية حول MTI Group" : "Orbital Constellation View"}
                >
                  <Orbit className="w-3.5 h-3.5 text-sky-300" />
                  <span className="text-[11px]">{isAr ? "المدار الدائري" : "Orbital"}</span>
                </button>

                {/* Grid Cards View Button */}
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? "luxury-ice-button text-white shadow-md"
                      : "text-sky-200/70 hover:text-white"
                  }`}
                  title={isAr ? "عرض البطاقات الكريستالية" : "Grid Cards View"}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isAr ? "بطاقات" : "Grid"}</span>
                </button>

                {/* Directory List View Button */}
                <button
                  onClick={() => setViewMode("directory")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "directory"
                      ? "luxury-ice-button text-white shadow-md"
                      : "text-sky-200/70 hover:text-white"
                  }`}
                  title={isAr ? "عرض الدليل التنفيذي الشامل" : "Directory List View"}
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{isAr ? "دليل شامل" : "Directory"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: Sector Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSector("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                selectedSector === "all"
                  ? "luxury-ice-button text-white border-sky-300/80 shadow-lg"
                  : "glass-ice-pill text-sky-200/80 border-sky-400/20 hover:border-sky-300/50"
              }`}
            >
              <span>{isAr ? "كافة الشركات" : "All Subsidiaries"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
                {sectorCounts.all}
              </span>
            </button>

            <button
              onClick={() => setSelectedSector("tech")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                selectedSector === "tech"
                  ? "bg-sky-500/30 text-white border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                  : "glass-ice-pill text-sky-200/80 border-sky-400/20 hover:border-sky-300/50"
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-sky-300" />
              <span>{isAr ? "التكنولوجيا والحوسبة" : "Cloud & Tech"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
                {sectorCounts.tech}
              </span>
            </button>

            <button
              onClick={() => setSelectedSector("infra")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                selectedSector === "infra"
                  ? "bg-amber-500/30 text-white border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  : "glass-ice-pill text-amber-200/80 border-amber-400/20 hover:border-amber-300/50"
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAr ? "المقاولات والإنشاءات" : "Civil & Infra"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
                {sectorCounts.infra}
              </span>
            </button>

            <button
              onClick={() => setSelectedSector("logistics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                selectedSector === "logistics"
                  ? "bg-emerald-500/30 text-white border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "glass-ice-pill text-emerald-200/80 border-emerald-400/20 hover:border-emerald-300/50"
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? "اللوجستيات وسلاسل الإمداد" : "Logistics & Supply"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
                {sectorCounts.logistics}
              </span>
            </button>

            <button
              onClick={() => setSelectedSector("holding")}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer ${
                selectedSector === "holding"
                  ? "bg-rose-500/30 text-white border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                  : "glass-ice-pill text-rose-200/80 border-rose-400/20 hover:border-rose-300/50"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{isAr ? "شركات استراتيجية" : "Strategic Enterprises"}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono">
                {sectorCounts.holding}
              </span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 rounded-3xl glass-ice border border-sky-400/20 animate-pulse flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full border-2 border-sky-400/30 border-t-sky-400 animate-spin" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-ice-card p-8 rounded-3xl border border-rose-500/30 text-center max-w-lg mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">{error}</h4>
            <button
              onClick={fetchCompanies}
              className="px-6 py-2.5 rounded-xl luxury-ice-button text-white text-xs font-bold flex items-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isAr ? "إعادة المحاولة" : "Retry Connection"}</span>
            </button>
          </div>
        )}

        {/* ==============================================================
            1. ORBITAL CONSTELLATION VIEW (CENTERED ON MTI GROUP LOGO)
            ============================================================== */}
        {!loading && !error && viewMode === "orbital" && filteredCompanies.length > 0 && (
          <div className="w-full animate-fade-in">
            <OrbitalConstellation
              companies={filteredCompanies}
              groupLogoUrl={groupLogoUrl}
              groupName={groupName}
              language={language}
            />
          </div>
        )}

        {/* ==============================================================
            2. GRID VIEW (CRYSTAL CARDS)
            ============================================================== */}
        {!loading && !error && viewMode === "grid" && filteredCompanies.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            {filteredCompanies.map((company, index) => (
              <CompanyCard key={company.id} company={company} index={index} />
            ))}
          </div>
        )}

        {/* ==============================================================
            3. DIRECTORY VIEW (EXECUTIVE LIST)
            ============================================================== */}
        {!loading && !error && viewMode === "directory" && filteredCompanies.length > 0 && (
          <div className="space-y-4 animate-fade-in">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="p-5 rounded-3xl glass-ice-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-sky-300/60 transition-all"
              >
                {/* Logo & Meta */}
                <div className="flex items-center gap-4">
                  <div className="logo-pedestal !w-16 !h-16 shrink-0 !rounded-2xl">
                    {company.logoUrl ? (
                      <img
                        src={getImageUrl(company.logoUrl)}
                        alt={company.name}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="font-bold text-sm text-sky-200">
                        {company.name.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-black text-white hover:text-sky-200 transition-colors">
                        {company.name}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                        {isAr ? "نشط" : "Active"}
                      </span>
                    </div>
                    <p className="text-xs text-sky-100/80 max-w-xl line-clamp-1">
                      {company.shortDescription || company.description || "MTI Group Strategic Subsidiary"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-sky-400/10">
                  <Link
                    href={`/company/${company.slug}`}
                    className="px-5 py-2.5 rounded-xl luxury-ice-button text-xs font-bold text-white flex items-center gap-2 hover:scale-105 transition-all shadow-md"
                  >
                    <span>{isAr ? "زيارة صفحة الشركة" : "View Company"}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCompanies.length === 0 && (
          <div className="glass-ice-card p-12 rounded-3xl border border-sky-400/30 text-center max-w-md mx-auto space-y-4">
            <Building2 className="w-12 h-12 text-sky-300/70 mx-auto" />
            <h4 className="text-lg font-bold text-white">
              {isAr ? "لم يتم العثور على شركات مطابقة" : "No Matching Subsidiaries"}
            </h4>
            <p className="text-xs text-sky-100/80">
              {isAr
                ? "جرب البحث بكلمات أخرى أو اختر قطاعاً آخر من القائمة أعلاه."
                : "Try a different search term or select another sector filter above."}
            </p>
            <button
              onClick={() => {
                setSelectedSector("all");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-xl luxury-ice-button text-white text-xs font-bold cursor-pointer"
            >
              {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
            </button>
          </div>
        )}
      </section>

      {/* About Section: Interlaced Frosted Glacial Ice & Vibrant Burgundy */}
      <section id="about" className="py-24 border-t border-sky-400/15 bg-[#17030e]/40 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-sky-300 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>{isAr ? "عن مجموعة MTI القابضة" : "About MTI Group Holding"}</span>
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                {visionTitle}
              </h3>
              <p className="text-sky-100/90 text-sm leading-relaxed">
                {visionText}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3.5 glass-ice-pill p-4 rounded-2xl border border-sky-400/30">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <span className="text-xs font-black text-white">
                    {isAr ? "حوكمة مؤسسية ومعايير أمان دولية" : "Enterprise Governance & ISO Standards"}
                  </span>
                </div>
                <div className="flex items-center gap-3.5 glass-ice-pill p-4 rounded-2xl border border-sky-400/30">
                  <Globe2 className="w-6 h-6 text-sky-300" />
                  <span className="text-xs font-black text-white">
                    {isAr ? "حضور محلي وتوسع إقليمي" : "Regional MENA Footprint"}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Glass Showcase Card */}
            <div className="relative">
              <div className="glass-ice-card p-8 sm:p-10 rounded-3xl border border-sky-400/30 space-y-6 shadow-2xl relative z-10">
                <div className="flex items-center justify-between border-b border-sky-400/20 pb-4">
                  <div className="font-black text-xl text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-sky-300" />
                    <span>{isAr ? "الأداء والنمو الاستراتيجي" : "Strategic Performance"}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-sky-300 glass-ice-pill px-3 py-1 rounded-full">
                    2026/2030
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-sky-100 mb-1.5">
                      <span>{isAr ? "الحلول السحابية والذكاء الاصطناعي" : "Cloud & AI Adoption"}</span>
                      <span className="text-sky-300">98%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-sky-950/80 overflow-hidden border border-sky-400/30">
                      <div className="h-full bg-gradient-to-r from-sky-400 to-sky-200 rounded-full w-[98%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-sky-100 mb-1.5">
                      <span>{isAr ? "إنجاز المشاريع الإنشائية بالموعد" : "On-Time Infra Delivery"}</span>
                      <span className="text-amber-300">96.5%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-sky-950/80 overflow-hidden border border-sky-400/30">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full w-[96.5%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-sky-100 mb-1.5">
                      <span>{isAr ? "كفاءة سلاسل التوريد والخدمات اللوجستية" : "Supply Chain Velocity"}</span>
                      <span className="text-emerald-300">99.2%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-sky-950/80 overflow-hidden border border-sky-400/30">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-200 rounded-full w-[99.2%]" />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/25 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-sky-100 font-bold">
                    {isAr
                      ? "جميع الشركات التابعة معتمدة ومطابقة لأعلى المعايير المصرية والدولية."
                      : "All subsidiaries are certified and fully compliant with international enterprise standards."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Executive Partnership & Egyptian Contact Lounge */}
      <section id="contact" className="py-24 relative overflow-hidden bg-gradient-to-b from-transparent via-[#250518]/40 to-[#12020b]/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="p-8 sm:p-12 rounded-3xl glass-ice-card border border-sky-400/40 relative overflow-hidden shadow-2xl space-y-8">
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full filter blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/15 rounded-full filter blur-3xl pointer-events-none" />

            <div className="text-center max-w-3xl mx-auto space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-ice-pill border border-sky-400/40 text-xs font-bold text-sky-200 shadow-md">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>{isAr ? "مجلس الإدارة والاستثمار المؤسسي" : "Executive Board & Investments"}</span>
              </div>
              <h3 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {contactTitle}
              </h3>
              <p className="text-sky-100/90 text-sm sm:text-base leading-relaxed font-light max-w-2xl mx-auto">
                {contactSubtitle}
              </p>
            </div>

            {/* 4 Quick Contact & Egyptian HQ Capsules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
              {/* Capsule 1: Egyptian Phone & Hotline */}
              <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-400/30 flex items-start gap-3 hover:border-sky-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-emerald-300 font-bold uppercase">{isAr ? "الاتصال المباشر" : "Direct Phone"}</span>
                    {groupHotline && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200 text-[9px] font-mono font-bold">
                        {groupHotline}
                      </span>
                    )}
                  </div>
                  <a href={`tel:${groupPhone.replace(/\s+/g, "")}`} dir="ltr" className="block text-xs font-mono font-bold text-white hover:text-sky-300 transition-colors">
                    {groupPhone}
                  </a>
                  <span className="text-[10px] text-sky-200/70 block">{isAr ? "مقر القاهرة الكبرى" : "Cairo Headquarters"}</span>
                </div>
              </div>

              {/* Capsule 2: WhatsApp Chat */}
              <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-400/30 flex items-start gap-3 hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase">{isAr ? "محادثة فورية" : "Instant Chat"}</span>
                  <a
                    href={`https://wa.me/${groupWhatsApp.replace(/[^0-9]/g, "")}`}
                    className="block text-xs font-bold text-white hover:text-emerald-300 transition-colors"
                  >
                    WhatsApp Business
                  </a>
                  <span className="text-[10px] text-emerald-400/80 font-mono block" dir="ltr">{groupMobile}</span>
                </div>
              </div>

              {/* Capsule 3: Investment Email */}
              <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-400/30 flex items-start gap-3 hover:border-rose-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-rose-300 font-bold uppercase">{isAr ? "بريد التعاقدات" : "Investment Desk"}</span>
                  <a href={`mailto:${groupEmailInvestment || groupEmail}`} className="block text-xs font-mono font-bold text-white hover:text-rose-200 transition-colors truncate">
                    {groupEmailInvestment || groupEmail}
                  </a>
                  <span className="text-[10px] text-sky-200/70 block">{isAr ? "رد سريع خلال 24 ساعة" : "Executive Response"}</span>
                </div>
              </div>

              {/* Capsule 4: Cairo New Cairo HQ */}
              <div className="p-4 rounded-2xl bg-sky-950/50 border border-sky-400/30 flex items-start gap-3 hover:border-amber-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-amber-300 font-bold uppercase">{isAr ? "المقر الإداري" : "Cairo Location"}</span>
                  <p className="text-xs text-white font-medium line-clamp-1">
                    {groupAddress}
                  </p>
                  <span className="text-[10px] text-sky-200/70 block">{isAr ? "جمهورية مصر العربية" : "Arab Republic of Egypt"}</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-sky-400/20 relative z-10">
              <a
                href={`mailto:${groupEmailInvestment || groupEmail}`}
                className="px-8 py-3.5 rounded-2xl luxury-ice-button text-white font-bold text-xs sm:text-sm cursor-pointer shadow-xl shadow-rose-950/60 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Mail className="w-4 h-4 text-sky-200" />
                <span>{isAr ? "مراسلة الإدارة التنفيذية والتعاقدات" : "Contact Executive Board"}</span>
              </a>

              {groupWhatsApp && (
                <a
                  href={`https://wa.me/${groupWhatsApp.replace(/[^0-9]/g, "")}`}
                  className="px-7 py-3.5 rounded-2xl glass-ice-pill border border-emerald-400/40 text-emerald-200 font-bold text-xs sm:text-sm hover:bg-emerald-500/20 hover:text-white transition-all flex items-center gap-2 shadow-lg"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? "محادثة عبر الواتساب" : "Chat on WhatsApp"}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
