"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { getImageUrl } from "@/lib/image";
import { signalRClient } from "@/lib/signalr";
import { SiteSetting, SystemSetting } from "@/types";
import {
  Settings,
  Save,
  ShieldAlert,
  Globe,
  Sliders,
  Upload,
  Sparkles,
  LayoutTemplate,
  Orbit,
  BarChart3,
  CheckCircle2,
  RefreshCw,
  Image as ImageIcon,
  Building2,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Crown,
  PhoneCall,
  Clock,
  FileText,
  Share2,
  Send,
  MessageSquare
} from "lucide-react";

export default function AdminSettingsPage() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"identity" | "hero" | "subsidiaries" | "contacts" | "vision" | "system">("identity");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State for all holding and homepage CMS parameters with Egyptian corporate defaults
  const [formValues, setFormValues] = useState<Record<string, string>>({
    Group_LogoUrl: "/images/companies/mti-group-logo.svg",
    Group_Name_en: "MTI Group Holding",
    Group_Name_ar: "مجموعة شركات إم تي آي القابضة",
    Group_Tagline_en: "Pioneering Egyptian Enterprise, Construction & Technology",
    Group_Tagline_ar: "الريادة والتميز في قيادة قطاعات التكنولوجيا والمقاولات واللوجستيات في مصر",
    
    // Egyptian Contacts & Locations
    Group_Email: "contact@mtigroup-eg.com",
    Group_Email_Investment: "investment@mtigroup-eg.com",
    Group_Email_Support: "support@mtigroup-eg.com",
    Group_Phone: "+20 2 2813 4500",
    Group_Mobile: "+20 10 0123 4567",
    Group_Hotline: "19852",
    Group_WhatsApp: "+201001234567",
    Group_Address_en: "MTI Group Tower, Sector 1, New Cairo, Cairo, Egypt",
    Group_Address_ar: "برج إم تي آي، القطاع الأول، التجمع الخامس، القاهرة الجديدة، جمهورية مصر العربية",
    Group_Address2_en: "Smart Village Business Complex, Km 28 Cairo-Alex Desert Road, Giza, Egypt",
    Group_Address2_ar: "مجمع الأعمال، القرية الذكية، طريق مصر - الإسكندرية الصحراوي، الجيزة، مصر",
    Group_WorkingHours_en: "Sunday - Thursday: 9:00 AM - 5:00 PM (Fri & Sat Weekend)",
    Group_WorkingHours_ar: "الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً (الجمعة والسبت عطلة رسمية)",
    Group_CommercialRegistry: "س.ت: 104829 - استثمار القاهرة",
    Group_TaxNumber: "ب.ض: 482-931-205",
    
    // Social Media
    Group_Social_LinkedIn: "https://linkedin.com/company/mti-group-egypt",
    Group_Social_Facebook: "https://facebook.com/mtigroupegypt",
    Group_Social_Twitter: "https://x.com/mtigroupegypt",
    Group_Social_YouTube: "https://youtube.com/@mtigroupegypt",
    Group_Social_Instagram: "https://instagram.com/mtigroupegypt",

    // Homepage Hero CMS
    Home_HeroBadge_en: "Egyptian Strategic Conglomerate & Investment",
    Home_HeroBadge_ar: "الريادة المؤسسية والاستثمار الاستراتيجي بمصر",
    Home_HeroTitle_en: "Pioneering Egypt's Future Across Next-Gen Industrial, Civil & Digital Giants",
    Home_HeroTitle_ar: "منظومة استثمارية متكاملة تقود المستقبل في قطاعات الأعمال الحيوية بمصر",
    Home_HeroSubtitle_en: "A premier Egyptian conglomerate orchestrating high-impact enterprise technology, generational civil infrastructure, and resilient automated supply chains across Egypt and the MENA region.",
    Home_HeroSubtitle_ar: "مجموعة قابضة مصرية رائدة تُدير وتُمكّن شركات متخصصة في التحول الرقمي السحابي، المشاريع الإنشائية الكبرى، والحلول اللوجستية المتطورة لتعزيز التنمية الاقتصادية الشاملة.",
    Home_CtaCompanies_en: "Explore Strategic Subsidiaries",
    Home_CtaCompanies_ar: "استكشف منظومة شركاتنا",
    Home_CtaContact_en: "Executive Inquiries",
    Home_CtaContact_ar: "تواصل مع الإدارة العليا",

    // Subsidiaries Section CMS
    Home_SubsBadge_en: "Strategic Subsidiaries Constellation",
    Home_SubsBadge_ar: "منظومة الشركات الاستراتيجية",
    Home_SubsTitle_en: "STRATEGIC SUBSIDIARIES",
    Home_SubsTitle_ar: "شركاتنا الاستراتيجية",
    Home_SubsSubtitle_en: "Explore our specialized corporate entities revolving around MTI Group, driving technological innovation, mega infrastructure, and resilient supply chains.",
    Home_SubsSubtitle_ar: "استعرض منظومة الشركات المتخصصة التابعة لمجموعة MTI والمصممة لتلبية متطلبات المشاريع الكبرى.",

    // Key Stats
    Home_Stat1_Value: "4+",
    Home_Stat1_Label_en: "Strategic Subsidiaries",
    Home_Stat1_Label_ar: "شركات تشغيلية كبرى",
    Home_Stat2_Value: "25+",
    Home_Stat2_Label_en: "Years of Egyptian Market Leadership",
    Home_Stat2_Label_ar: "عاماً من الريادة بالسوق المصري",
    Home_Stat3_Value: "EGP 5B+",
    Home_Stat3_Label_en: "Portfolio Capital Value",
    Home_Stat3_Label_ar: "قيمة المحفظة الاستثمارية",
    Home_Stat4_Value: "150+",
    Home_Stat4_Label_en: "Delivered Projects Across Egypt",
    Home_Stat4_Label_ar: "مشروع وطني منجز بمصر",

    // Vision
    Home_VisionBadge_en: "Executive Vision & Governance",
    Home_VisionBadge_ar: "الرؤية والهدف الاستراتيجي",
    Home_VisionTitle_en: "Building Long-Term Value Through Synergy & Sustainable Egyptian Development",
    Home_VisionTitle_ar: "نبني المستقبل بشراكات مستدامة واستثمارات رائدة تدعم الاقتصاد المصري",
    Home_VisionText_en: "At MTI Group Holding, we empower our subsidiary entities with capital, cutting-edge digital governance, and strategic market access to deliver transformative mega-projects across technology, civil contracting, and global logistics in Egypt and the region.",
    Home_VisionText_ar: "في مجموعة MTI القابضة، نُمكّن شركاتنا التابعة بالرأسمال، والحوكمة الرقمية المتقدمة، والرؤية الاستراتيجية لتحقيق مشاريع استثنائية تقود مسيرة التطور الاقتصادي والصناعي في مصر.",

    // Bottom Partnership CTA
    Home_ContactTitle_en: "Looking to Partner with MTI Group Subsidiaries?",
    Home_ContactTitle_ar: "هل تبحث عن شراكة استراتيجية مع إحدى شركاتنا في مصر؟",
    Home_ContactSubtitle_en: "Our executive and business development teams in Cairo are ready to discuss strategic joint ventures and procurement.",
    Home_ContactSubtitle_ar: "فريقنا الاستثماري والتنفيذي بمقر القاهرة الجديدة مستعد للتواصل ومناقشة فرص التكامل التجاري والمشاريع المشتركة.",

    // Footer CMS
    Footer_About_en: "A premier Egyptian diversified conglomerate leading innovation across enterprise cloud, smart civil contracting, and global supply chain logistics.",
    Footer_About_ar: "مجموعة شركات استثمارية مصرية متعددة القطاعات، تقود الابتكار في التقنية السحابية، المقاولات الإنشائية، والحلول اللوجستية الحديثة في جمهورية مصر العربية.",
    Footer_Rights_en: "MTI Group Holding Egypt. All Rights Reserved.",
    Footer_Rights_ar: "مجموعة شركات إم تي آي القابضة مصر. جميع الحقوق محفوظة."
  });

  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [holdingRes, sysRes, siteRes] = await Promise.all([
        api.getHoldingSettings(),
        api.getSystemSettings(),
        api.getSiteSettings().catch(() => ({ success: false, data: [] }))
      ]);

      let merged = { ...formValues };

      if (holdingRes.success && holdingRes.data) {
        merged = { ...merged, ...holdingRes.data };
      }

      if (siteRes.success && siteRes.data && Array.isArray(siteRes.data)) {
        siteRes.data.forEach((s) => {
          if (!s.settingKey) return;
          const keyWithLang = s.languageCode ? `${s.settingKey}_${s.languageCode}` : s.settingKey;
          merged[keyWithLang] = s.settingValue || "";
          if (!s.languageCode) {
            merged[s.settingKey] = s.settingValue || "";
          }
        });
      }

      setFormValues(merged);

      if (sysRes.success && sysRes.data) {
        setSystemSettings(sysRes.data);
      }
    } catch (err: any) {
      console.warn("Failed fetching settings:", err);
      setErrorMessage(err?.message || "Failed to load settings from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // Quick apply logo helper that persists immediately and broadcasts in real-time
  const handleApplyLogo = async (logoUrl: string) => {
    handleChange("Group_LogoUrl", logoUrl);
    const updated = { ...formValues, Group_LogoUrl: logoUrl };
    try {
      await api.updateHoldingSettings(updated);
      await api.upsertSiteSetting({ settingKey: "Group_LogoUrl", settingValue: logoUrl }).catch(() => {});
      signalRClient.notify("SettingsUpdated", updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to auto-persist logo:", err);
    }
  };

  // Logo file upload handler
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      setErrorMessage(null);

      const res = await api.uploadMedia(file);
      if (res.success && res.data) {
        const logoUrl = (res.data as any).fileUrl || res.data.url;
        await handleApplyLogo(logoUrl);
      } else {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const result = event.target?.result as string;
          if (result) {
            await handleApplyLogo(result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.error("Logo upload failed:", err);
      setErrorMessage(isAr ? "تعذر رفع اللوجو. يمكنك وضع رابط الصورة مباشرة." : "Failed to upload logo file.");
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      // 1. Save to Next.js API / Local storage
      await api.updateHoldingSettings(formValues);

      // 2. Also upsert core holding settings to SQL Server via API Gateway
      const directSiteSettings = [
        { settingKey: "Group_LogoUrl", settingValue: formValues.Group_LogoUrl },
        { settingKey: "Group_Name", settingValue: formValues.Group_Name_en, languageCode: "en" },
        { settingKey: "Group_Name", settingValue: formValues.Group_Name_ar, languageCode: "ar" },
        { settingKey: "Group_Tagline", settingValue: formValues.Group_Tagline_en, languageCode: "en" },
        { settingKey: "Group_Tagline", settingValue: formValues.Group_Tagline_ar, languageCode: "ar" },
        { settingKey: "Group_Email", settingValue: formValues.Group_Email },
        { settingKey: "Group_Email_Investment", settingValue: formValues.Group_Email_Investment },
        { settingKey: "Group_Email_Support", settingValue: formValues.Group_Email_Support },
        { settingKey: "Group_Phone", settingValue: formValues.Group_Phone },
        { settingKey: "Group_Mobile", settingValue: formValues.Group_Mobile },
        { settingKey: "Group_Hotline", settingValue: formValues.Group_Hotline },
        { settingKey: "Group_WhatsApp", settingValue: formValues.Group_WhatsApp },
        { settingKey: "Group_Address", settingValue: formValues.Group_Address_en, languageCode: "en" },
        { settingKey: "Group_Address", settingValue: formValues.Group_Address_ar, languageCode: "ar" },
        { settingKey: "Group_Address2", settingValue: formValues.Group_Address2_en, languageCode: "en" },
        { settingKey: "Group_Address2", settingValue: formValues.Group_Address2_ar, languageCode: "ar" },
        { settingKey: "Group_WorkingHours", settingValue: formValues.Group_WorkingHours_en, languageCode: "en" },
        { settingKey: "Group_WorkingHours", settingValue: formValues.Group_WorkingHours_ar, languageCode: "ar" },
        { settingKey: "Group_CommercialRegistry", settingValue: formValues.Group_CommercialRegistry },
        { settingKey: "Group_TaxNumber", settingValue: formValues.Group_TaxNumber },
      ];

      await Promise.allSettled(
        directSiteSettings.map((s) => api.upsertSiteSetting(s))
      );

      // 3. BROADCAST REAL-TIME to all active views and other browser tabs
      signalRClient.notify("SettingsUpdated", formValues);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      console.error("Error saving settings:", err);
      setErrorMessage(err?.message || "Failed to persist settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl pb-20">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-200 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Settings className="w-5 h-5 text-sky-300 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isAr ? "لوحة تحكم وهوية المجموعة والصفحة الرئيسية" : "Holding Identity & Homepage CMS"}
              </h1>
              <p className="text-xs text-sky-200/80 font-medium">
                {isAr
                  ? "تحكم كامل في لوجو MTI Group، المقرات المصرية، أرقام الهواتف والخط الساخن، والفوتر، وكافة نصوص الواجهة"
                  : "Complete management over MTI Group holding logo, Egyptian headquarters, phones, hotline, footer & homepage"}
              </p>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-6 py-3 rounded-2xl luxury-ice-button font-black text-xs text-white flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
              <span>{isAr ? "جاري الحفظ والمزامنة..." : "Saving & Syncing..."}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-sky-200" />
              <span>{isAr ? "حفظ وتطبيق التغييرات لحظياً" : "Save & Broadcast Changes"}</span>
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-950/40 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {isAr
              ? "تم حفظ وتحديث إعدادات المجموعة، المقرات المصرية، والفوتر بنجاح، وتحديث البث المباشر عبر SignalR!"
              : "Holding identity, Egyptian HQ contacts, and footer updated successfully and broadcasted live!"}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-bold flex items-center gap-3 shadow-lg">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl glass-ice border border-sky-400/30">
        <button
          onClick={() => setActiveTab("identity")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "identity"
              ? "luxury-ice-button text-white shadow-md"
              : "text-sky-200/70 hover:text-white hover:bg-sky-950/40"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>{isAr ? "هوية ولوجو MTI Group" : "Holding Logo & Identity"}</span>
        </button>

        <button
          onClick={() => setActiveTab("hero")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "hero"
              ? "luxury-ice-button text-white shadow-md"
              : "text-sky-200/70 hover:text-white hover:bg-sky-950/40"
          }`}
        >
          <LayoutTemplate className="w-4 h-4 text-sky-300" />
          <span>{isAr ? "واجهة الصفحة الرئيسية (Hero)" : "Hero Section CMS"}</span>
        </button>

        <button
          onClick={() => setActiveTab("subsidiaries")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "subsidiaries"
              ? "luxury-ice-button text-white shadow-md"
              : "text-sky-200/70 hover:text-white hover:bg-sky-950/40"
          }`}
        >
          <Orbit className="w-4 h-4 text-sky-400" />
          <span>{isAr ? "شركاتنا الاستراتيجية (المدار)" : "Subsidiaries & Orbit"}</span>
        </button>

        <button
          onClick={() => setActiveTab("contacts")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "contacts"
              ? "luxury-ice-button text-white shadow-md"
              : "text-sky-200/70 hover:text-white hover:bg-sky-950/40"
          }`}
        >
          <MapPin className="w-4 h-4 text-emerald-300" />
          <span>{isAr ? "المقرات والفوتر والتواصل بمصر" : "Egyptian Contacts & Footer"}</span>
        </button>

        <button
          onClick={() => setActiveTab("vision")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "vision"
              ? "luxury-ice-button text-white shadow-md"
              : "text-sky-200/70 hover:text-white hover:bg-sky-950/40"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-300" />
          <span>{isAr ? "الإحصائيات ورؤية المجموعة" : "Stats & Holding Vision"}</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "system"
              ? "luxury-ice-button text-white shadow-md"
              : "text-sky-200/70 hover:text-white hover:bg-sky-950/40"
          }`}
        >
          <Sliders className="w-4 h-4 text-rose-300" />
          <span>{isAr ? "إعدادات النظام العامة" : "System Config"}</span>
        </button>
      </div>

      {/* ==============================================================
          TAB 1: HOLDING LOGO & IDENTITY
          ============================================================== */}
      {activeTab === "identity" && (
        <div className="space-y-6">
          {/* Logo Showcase & Uploader Card */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Logo Preview Pedestal with Orbital Glowing Rings */}
              <div className="relative flex flex-col items-center shrink-0">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-sky-400/30 via-[#2f061f] to-[#12020b] p-1 border-2 border-sky-400/60 shadow-[0_0_35px_rgba(56,189,248,0.4)] flex items-center justify-center relative group">
                  <div className="w-full h-full rounded-[22px] bg-[#12020b]/90 flex items-center justify-center p-3 overflow-hidden">
                    {formValues.Group_LogoUrl ? (
                      <Image
                        src={getImageUrl(formValues.Group_LogoUrl)}
                        alt="MTI Group Logo"
                        width={96}
                        height={96}
                        className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]"
                        unoptimized={formValues.Group_LogoUrl.endsWith(".svg")}
                      />
                    ) : (
                      <span className="text-2xl font-black ice-cyan-gradient-text">MTI</span>
                    )}
                  </div>

                  {/* Holding Apex Badge */}
                  <div className="absolute -bottom-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-[10px] font-black text-white shadow-md border border-amber-300/40">
                    CENTRAL LOGO
                  </div>
                </div>

                <span className="text-[10px] text-sky-200/80 font-bold mt-4">
                  {isAr ? "اللوجو يظهر في مركز المدار والناف بار والفوتر" : "Appears in Orbit Center, Navbar & Footer"}
                </span>
              </div>

              {/* Logo Controls */}
              <div className="flex-1 space-y-4 text-xs w-full">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? "لوجو مجموعة إم تي آي القابضة (MTI Group Logo)" : "MTI Group Holding Logo"}</span>
                  </h3>
                  <p className="text-sky-100/70 text-[11px] mt-0.5">
                    {isAr
                      ? "قم برفع ملف لوجو (SVG, PNG, WebP) أو أدخل رابط الصورة المباشر. اللوجو سيظهر فوراً في الدائرة المركزية للمدار."
                      : "Upload a high-res SVG, PNG, or WebP logo file, or input a direct media URL."}
                  </p>
                </div>

                {/* Upload Action Button */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="px-5 py-2.5 rounded-xl luxury-ice-button font-bold text-white flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
                    ) : (
                      <Upload className="w-4 h-4 text-sky-200" />
                    )}
                    <span>{isAr ? (uploadingLogo ? "جاري الرفع..." : "رفع لوجو جديد من الجهاز") : (uploadingLogo ? "Uploading..." : "Upload Logo File")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyLogo("/images/companies/mti-group-logo.svg")}
                    className="px-4 py-2.5 rounded-xl bg-sky-950/50 hover:bg-sky-900/60 text-sky-200 border border-sky-400/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    {isAr ? "استعادة اللوجو الأيقوني الافتراضي (SVG)" : "Reset to Default Monogram"}
                  </button>
                </div>

                {/* Direct Logo URL Input & Instant Apply */}
                <div>
                  <label className="block text-sky-200/90 font-bold mb-1">
                    {isAr ? "رابط اللوجو المباشر (Logo Path / URL):" : "Direct Logo Path / URL:"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formValues.Group_LogoUrl || ""}
                      onChange={(e) => handleChange("Group_LogoUrl", e.target.value)}
                      placeholder="/images/companies/mti-group-logo.svg"
                      className="flex-1 px-4 py-2 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono text-xs focus:outline-none focus:border-sky-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyLogo(formValues.Group_LogoUrl)}
                      className="px-4 py-2 rounded-xl luxury-ice-button text-white text-xs font-bold shrink-0 shadow-md cursor-pointer hover:scale-105 transition-all flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAr ? "تطبيق وتحديث لحظي" : "Apply Realtime"}</span>
                    </button>
                  </div>
                </div>

                {/* Preset Fast Selection Cards */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-sky-300/80 block mb-2">
                    {isAr ? "أو اختر قالباً جاهزاً بضغطة واحدة:" : "Or select an official template:"}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { name: isAr ? "المونوغرام الملكي" : "Royal Monogram", url: "/images/companies/mti-group-logo.svg" },
                      { name: isAr ? "الماسة المؤسسية" : "Corporate Diamond", url: "/images/companies/default-logo.svg" },
                      { name: isAr ? "التقنية السحابية" : "Tech Hex", url: "/images/companies/tech-logo.svg" },
                      { name: isAr ? "برج الإنشاءات" : "Contracting Apex", url: "/images/companies/contracting-logo.svg" },
                    ].map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => handleApplyLogo(preset.url)}
                        className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                          formValues.Group_LogoUrl === preset.url
                            ? "bg-sky-500/20 border-sky-400 text-white shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                            : "glass-ice-pill border-white/10 text-sky-200/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-[#14020c] p-0.5 border border-sky-400/30 shrink-0">
                          <Image
                            src={preset.url}
                            alt={preset.name}
                            width={24}
                            height={24}
                            className="w-full h-full object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Group General Details */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <Building2 className="w-4 h-4 text-sky-400" />
              <span>{isAr ? "اسم المجموعة القابضة والشعار اللفظي" : "Corporate Holding Identity"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "اسم المجموعة (بالعربية):" : "Group Name (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Name_ar || ""}
                  onChange={(e) => handleChange("Group_Name_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "اسم المجموعة (بالإنجليزية):" : "Group Name (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Name_en || ""}
                  onChange={(e) => handleChange("Group_Name_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "شعار المجموعة اللفظي (بالعربية):" : "Group Tagline (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Tagline_ar || ""}
                  onChange={(e) => handleChange("Group_Tagline_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "شعار المجموعة اللفظي (بالإنجليزية):" : "Group Tagline (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Tagline_en || ""}
                  onChange={(e) => handleChange("Group_Tagline_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 2: HERO SECTION CMS
          ============================================================== */}
      {activeTab === "hero" && (
        <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-6">
          <div className="border-b border-sky-400/20 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-sky-300" />
              <span>{isAr ? "نصوص البانر الرئيسي في الصفحة الأولى (Hero Section)" : "Homepage Hero Section CMS"}</span>
            </h3>
            <p className="text-sky-100/70 text-[11px] mt-0.5">
              {isAr
                ? "تحكم في العنوان الرئيسي والشعار الترويجي وأزرار الاتصال في الواجهة الرئيسية"
                : "Manage top banner heading, subtitle description, and call-to-action buttons"}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Hero Badge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الشريط العلوي الصغير (Badge بالعربية):" : "Top Ribbon Badge (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_HeroBadge_ar || ""}
                  onChange={(e) => handleChange("Home_HeroBadge_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الشريط العلوي الصغير (Badge بالإنجليزية):" : "Top Ribbon Badge (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_HeroBadge_en || ""}
                  onChange={(e) => handleChange("Home_HeroBadge_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>
            </div>

            {/* Main Hero Heading */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "العنوان الرئيسي الكبير (بالعربية):" : "Main Hero Heading (Arabic):"}
                </label>
                <textarea
                  rows={2}
                  value={formValues.Home_HeroTitle_ar || ""}
                  onChange={(e) => handleChange("Home_HeroTitle_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "العنوان الرئيسي الكبير (بالإنجليزية):" : "Main Hero Heading (English):"}
                </label>
                <textarea
                  rows={2}
                  value={formValues.Home_HeroTitle_en || ""}
                  onChange={(e) => handleChange("Home_HeroTitle_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>
            </div>

            {/* Hero Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الوصف التفصيلي الترحيبي (بالعربية):" : "Hero Subtitle Description (Arabic):"}
                </label>
                <textarea
                  rows={3}
                  value={formValues.Home_HeroSubtitle_ar || ""}
                  onChange={(e) => handleChange("Home_HeroSubtitle_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الوصف التفصيلي الترحيبي (بالإنجليزية):" : "Hero Subtitle Description (English):"}
                </label>
                <textarea
                  rows={3}
                  value={formValues.Home_HeroSubtitle_en || ""}
                  onChange={(e) => handleChange("Home_HeroSubtitle_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed font-sans"
                />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "نص زر استكشاف الشركات (بالعربية):" : "Explore CTA Button (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_CtaCompanies_ar || ""}
                  onChange={(e) => handleChange("Home_CtaCompanies_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "نص زر استكشاف الشركات (بالإنجليزية):" : "Explore CTA Button (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_CtaCompanies_en || ""}
                  onChange={(e) => handleChange("Home_CtaCompanies_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 3: SUBSIDIARIES SECTION CMS
          ============================================================== */}
      {activeTab === "subsidiaries" && (
        <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-6">
          <div className="border-b border-sky-400/20 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Orbit className="w-4 h-4 text-sky-400" />
              <span>{isAr ? "قسم شركاتنا الاستراتيجية والتصميم المداري" : "Strategic Subsidiaries & Orbital Section"}</span>
            </h3>
            <p className="text-sky-100/70 text-[11px] mt-0.5">
              {isAr
                ? "التحكم في عنوان ووصف قسم الشركات التابعة التي تدور حول MTI Group"
                : "Manage title, ribbon badge, and description for the orbital subsidiaries showcase"}
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Section Badge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "شريط القسم الصغير (بالعربية):" : "Section Ribbon (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_SubsBadge_ar || ""}
                  onChange={(e) => handleChange("Home_SubsBadge_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "شريط القسم الصغير (بالإنجليزية):" : "Section Ribbon (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_SubsBadge_en || ""}
                  onChange={(e) => handleChange("Home_SubsBadge_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>
            </div>

            {/* Section Main Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "عنوان قسم الشركات (بالعربية):" : "Subsidiaries Title (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_SubsTitle_ar || ""}
                  onChange={(e) => handleChange("Home_SubsTitle_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-black text-sm focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "عنوان قسم الشركات (بالإنجليزية):" : "Subsidiaries Title (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_SubsTitle_en || ""}
                  onChange={(e) => handleChange("Home_SubsTitle_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-black text-sm focus:outline-none focus:border-sky-300 font-sans uppercase"
                />
              </div>
            </div>

            {/* Section Subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "وصف قسم الشركات (بالعربية):" : "Subsidiaries Description (Arabic):"}
                </label>
                <textarea
                  rows={3}
                  value={formValues.Home_SubsSubtitle_ar || ""}
                  onChange={(e) => handleChange("Home_SubsSubtitle_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "وصف قسم الشركات (بالإنجليزية):" : "Subsidiaries Description (English):"}
                </label>
                <textarea
                  rows={3}
                  value={formValues.Home_SubsSubtitle_en || ""}
                  onChange={(e) => handleChange("Home_SubsSubtitle_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 4: EGYPTIAN CONTACTS, HEADQUARTERS & FOOTER CMS
          ============================================================== */}
      {activeTab === "contacts" && (
        <div className="space-y-6">
          {/* Card 1: Headquarters & Operations Locations in Egypt */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4 text-xs">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "مقرات وفروع المجموعة في مصر" : "Egyptian Corporate Headquarters & Branches"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "المقر الإداري الرئيسي بمصر (بالعربية):" : "Cairo Main HQ (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Address_ar || ""}
                  onChange={(e) => handleChange("Group_Address_ar", e.target.value)}
                  placeholder="برج إم تي آي، القطاع الأول، التجمع الخامس، القاهرة الجديدة، مصر"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "المقر الإداري الرئيسي بمصر (بالإنجليزية):" : "Cairo Main HQ (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Address_en || ""}
                  onChange={(e) => handleChange("Group_Address_en", e.target.value)}
                  placeholder="MTI Group Tower, Sector 1, New Cairo, Cairo, Egypt"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الفرع الثاني / العمليات بالقرية الذكية (بالعربية):" : "Smart Village Branch (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Address2_ar || ""}
                  onChange={(e) => handleChange("Group_Address2_ar", e.target.value)}
                  placeholder="مجمع الأعمال، القرية الذكية، طريق مصر - إسكندرية الصحراوي، الجيزة"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الفرع الثاني / العمليات بالقرية الذكية (بالإنجليزية):" : "Smart Village Branch (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Address2_en || ""}
                  onChange={(e) => handleChange("Group_Address2_en", e.target.value)}
                  placeholder="Smart Village Business Complex, Km 28 Cairo-Alex Desert Road, Giza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Egyptian Phone Lines, Hotline & WhatsApp */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4 text-xs">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <PhoneCall className="w-4 h-4 text-sky-300" />
              <span>{isAr ? "أرقام التواصل المصرية والخط الساخن والواتساب" : "Egyptian Contact Numbers & Hotline"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الهاتف الأرضي للقاهرة:" : "Cairo Landline Phone:"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Phone || ""}
                  onChange={(e) => handleChange("Group_Phone", e.target.value)}
                  placeholder="+20 2 2813 4500"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono font-bold focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الموبايل المصري الرسمي:" : "Egyptian Mobile Line:"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Mobile || ""}
                  onChange={(e) => handleChange("Group_Mobile", e.target.value)}
                  placeholder="+20 10 0123 4567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono font-bold focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "الخط الساخن الموحد (Hotline):" : "Unified Corporate Hotline:"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_Hotline || ""}
                  onChange={(e) => handleChange("Group_Hotline", e.target.value)}
                  placeholder="19852"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-emerald-300 font-mono font-black text-sm focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "رقم الواتساب للدردشة المباشرة:" : "Direct WhatsApp Number:"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_WhatsApp || ""}
                  onChange={(e) => handleChange("Group_WhatsApp", e.target.value)}
                  placeholder="+201001234567"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Official Emails */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4 text-xs">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <Mail className="w-4 h-4 text-rose-300" />
              <span>{isAr ? "عناوين البريد الإلكتروني الرسمي للإدارات" : "Departmental Corporate Emails"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "البريد العام للإدارة والاتصال:" : "General Corporate Email:"}
                </label>
                <input
                  type="email"
                  value={formValues.Group_Email || ""}
                  onChange={(e) => handleChange("Group_Email", e.target.value)}
                  placeholder="contact@mtigroup-eg.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "بريد الاستثمار والشراكات:" : "Investment & Partnerships Email:"}
                </label>
                <input
                  type="email"
                  value={formValues.Group_Email_Investment || ""}
                  onChange={(e) => handleChange("Group_Email_Investment", e.target.value)}
                  placeholder="investment@mtigroup-eg.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "بريد خدمة العملاء والدعم:" : "Support & Client Relations:"}
                </label>
                <input
                  type="email"
                  value={formValues.Group_Email_Support || ""}
                  onChange={(e) => handleChange("Group_Email_Support", e.target.value)}
                  placeholder="support@mtigroup-eg.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono focus:outline-none focus:border-sky-300"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Working Hours & Commercial Legal Status */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4 text-xs">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <FileText className="w-4 h-4 text-amber-300" />
              <span>{isAr ? "مواعيد العمل والسجل التجاري والبطاقة الضريبية بمصر" : "Working Hours & Egyptian Commercial Registration"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "مواعيد وساعات العمل (بالعربية):" : "Working Hours (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_WorkingHours_ar || ""}
                  onChange={(e) => handleChange("Group_WorkingHours_ar", e.target.value)}
                  placeholder="الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "مواعيد وساعات العمل (بالإنجليزية):" : "Working Hours (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_WorkingHours_en || ""}
                  onChange={(e) => handleChange("Group_WorkingHours_en", e.target.value)}
                  placeholder="Sunday - Thursday: 9:00 AM - 5:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "رقم السجل التجاري المصري:" : "Egyptian Commercial Registry:"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_CommercialRegistry || ""}
                  onChange={(e) => handleChange("Group_CommercialRegistry", e.target.value)}
                  placeholder="س.ت: 104829 - استثمار القاهرة"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono font-bold focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "رقم البطاقة الضريبية للمجموعة:" : "Egyptian Tax Card Number:"}
                </label>
                <input
                  type="text"
                  value={formValues.Group_TaxNumber || ""}
                  onChange={(e) => handleChange("Group_TaxNumber", e.target.value)}
                  placeholder="ب.ض: 482-931-205"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Social Media Channels */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4 text-xs">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <Share2 className="w-4 h-4 text-sky-300" />
              <span>{isAr ? "روابط منصات التواصل الاجتماعي الرسمية" : "Official Social Media Channels"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">LinkedIn URL:</label>
                <input
                  type="text"
                  value={formValues.Group_Social_LinkedIn || ""}
                  onChange={(e) => handleChange("Group_Social_LinkedIn", e.target.value)}
                  placeholder="https://linkedin.com/company/mti-group-egypt"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono text-xs focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">Facebook URL:</label>
                <input
                  type="text"
                  value={formValues.Group_Social_Facebook || ""}
                  onChange={(e) => handleChange("Group_Social_Facebook", e.target.value)}
                  placeholder="https://facebook.com/mtigroupegypt"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono text-xs focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">X (Twitter) URL:</label>
                <input
                  type="text"
                  value={formValues.Group_Social_Twitter || ""}
                  onChange={(e) => handleChange("Group_Social_Twitter", e.target.value)}
                  placeholder="https://x.com/mtigroupegypt"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono text-xs focus:outline-none focus:border-sky-300"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">YouTube Channel URL:</label>
                <input
                  type="text"
                  value={formValues.Group_Social_YouTube || ""}
                  onChange={(e) => handleChange("Group_Social_YouTube", e.target.value)}
                  placeholder="https://youtube.com/@mtigroupegypt"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-mono text-xs focus:outline-none focus:border-sky-300"
                />
              </div>
            </div>
          </div>

          {/* Card 6: Footer About & Copyright Text */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4 text-xs">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <Globe className="w-4 h-4 text-rose-300" />
              <span>{isAr ? "نصوص الفوتر وقسم الشراكات أسفل الصفحة" : "Footer Narrative & Partnership CTA Texts"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "عنوان قسم الشراكات أسفل الصفحة (بالعربية):" : "Partnership Section Title (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_ContactTitle_ar || ""}
                  onChange={(e) => handleChange("Home_ContactTitle_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "عنوان قسم الشراكات أسفل الصفحة (بالإنجليزية):" : "Partnership Section Title (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_ContactTitle_en || ""}
                  onChange={(e) => handleChange("Home_ContactTitle_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "نبذة الفوتر التعريفية (بالعربية):" : "Footer About Text (Arabic):"}
                </label>
                <textarea
                  rows={3}
                  value={formValues.Footer_About_ar || ""}
                  onChange={(e) => handleChange("Footer_About_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "نبذة الفوتر التعريفية (بالإنجليزية):" : "Footer About Text (English):"}
                </label>
                <textarea
                  rows={3}
                  value={formValues.Footer_About_en || ""}
                  onChange={(e) => handleChange("Footer_About_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "حقوق الملكية بالفوتر (بالعربية):" : "Footer Rights Text (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Footer_Rights_ar || ""}
                  onChange={(e) => handleChange("Footer_Rights_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "حقوق الملكية بالفوتر (بالإنجليزية):" : "Footer Rights Text (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Footer_Rights_en || ""}
                  onChange={(e) => handleChange("Footer_Rights_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 5: STATS & CORPORATE VISION CMS
          ============================================================== */}
      {activeTab === "vision" && (
        <div className="space-y-6">
          {/* Key Stats Strip */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-6">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "أرقام وإحصائيات النجاح في الصفحة الرئيسية" : "Homepage Key Performance Metrics"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Stat 1 */}
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/30 space-y-2">
                <span className="text-[10px] text-sky-300 font-bold">{isAr ? "المؤشر الأول" : "Metric #1"}</span>
                <input
                  type="text"
                  value={formValues.Home_Stat1_Value || ""}
                  onChange={(e) => handleChange("Home_Stat1_Value", e.target.value)}
                  placeholder="4+"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white font-black text-lg focus:outline-none"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat1_Label_ar || ""}
                  onChange={(e) => handleChange("Home_Stat1_Label_ar", e.target.value)}
                  placeholder="الوصف بالعربية"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat1_Label_en || ""}
                  onChange={(e) => handleChange("Home_Stat1_Label_en", e.target.value)}
                  placeholder="Label in English"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none font-sans"
                />
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/30 space-y-2">
                <span className="text-[10px] text-sky-300 font-bold">{isAr ? "المؤشر الثاني" : "Metric #2"}</span>
                <input
                  type="text"
                  value={formValues.Home_Stat2_Value || ""}
                  onChange={(e) => handleChange("Home_Stat2_Value", e.target.value)}
                  placeholder="25+"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white font-black text-lg focus:outline-none"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat2_Label_ar || ""}
                  onChange={(e) => handleChange("Home_Stat2_Label_ar", e.target.value)}
                  placeholder="الوصف بالعربية"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat2_Label_en || ""}
                  onChange={(e) => handleChange("Home_Stat2_Label_en", e.target.value)}
                  placeholder="Label in English"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none font-sans"
                />
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/30 space-y-2">
                <span className="text-[10px] text-sky-300 font-bold">{isAr ? "المؤشر الثالث" : "Metric #3"}</span>
                <input
                  type="text"
                  value={formValues.Home_Stat3_Value || ""}
                  onChange={(e) => handleChange("Home_Stat3_Value", e.target.value)}
                  placeholder="EGP 5B+"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white font-black text-lg focus:outline-none text-emerald-300"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat3_Label_ar || ""}
                  onChange={(e) => handleChange("Home_Stat3_Label_ar", e.target.value)}
                  placeholder="الوصف بالعربية"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat3_Label_en || ""}
                  onChange={(e) => handleChange("Home_Stat3_Label_en", e.target.value)}
                  placeholder="Label in English"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none font-sans"
                />
              </div>

              {/* Stat 4 */}
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-400/30 space-y-2">
                <span className="text-[10px] text-sky-300 font-bold">{isAr ? "المؤشر الرابع" : "Metric #4"}</span>
                <input
                  type="text"
                  value={formValues.Home_Stat4_Value || ""}
                  onChange={(e) => handleChange("Home_Stat4_Value", e.target.value)}
                  placeholder="150+"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white font-black text-lg focus:outline-none text-amber-300"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat4_Label_ar || ""}
                  onChange={(e) => handleChange("Home_Stat4_Label_ar", e.target.value)}
                  placeholder="الوصف بالعربية"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none"
                />
                <input
                  type="text"
                  value={formValues.Home_Stat4_Label_en || ""}
                  onChange={(e) => handleChange("Home_Stat4_Label_en", e.target.value)}
                  placeholder="Label in English"
                  className="w-full px-3 py-1.5 rounded-lg bg-[#14020c] border border-sky-400/40 text-white text-xs font-bold focus:outline-none font-sans"
                />
              </div>
            </div>
          </div>

          {/* Vision Section Narrative */}
          <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4 text-xs">
            <h3 className="text-base font-black text-white flex items-center gap-2 border-b border-sky-400/20 pb-3">
              <Globe className="w-4 h-4 text-sky-300" />
              <span>{isAr ? "رؤية ورسالة المجموعة (About MTI Holding)" : "Corporate Vision Narrative"}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "عنوان الرؤية (بالعربية):" : "Vision Title (Arabic):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_VisionTitle_ar || ""}
                  onChange={(e) => handleChange("Home_VisionTitle_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "عنوان الرؤية (بالإنجليزية):" : "Vision Title (English):"}
                </label>
                <input
                  type="text"
                  value={formValues.Home_VisionTitle_en || ""}
                  onChange={(e) => handleChange("Home_VisionTitle_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-bold focus:outline-none focus:border-sky-300 font-sans"
                />
              </div>

              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "نص الرؤية والاستراتيجية (بالعربية):" : "Vision Text (Arabic):"}
                </label>
                <textarea
                  rows={4}
                  value={formValues.Home_VisionText_ar || ""}
                  onChange={(e) => handleChange("Home_VisionText_ar", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-sky-200 font-bold mb-1">
                  {isAr ? "نص الرؤية والاستراتيجية (بالإنجليزية):" : "Vision Text (English):"}
                </label>
                <textarea
                  rows={4}
                  value={formValues.Home_VisionText_en || ""}
                  onChange={(e) => handleChange("Home_VisionText_en", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#14020c]/90 border border-sky-400/40 text-white font-medium focus:outline-none focus:border-sky-300 leading-relaxed font-sans"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==============================================================
          TAB 6: SYSTEM CONFIGURATION
          ============================================================== */}
      {activeTab === "system" && (
        <div className="glass-ice-card p-6 sm:p-8 rounded-3xl border border-sky-400/40 space-y-4">
          <div className="border-b border-sky-400/20 pb-3 flex items-center justify-between">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>{isAr ? "متغيرات النظام المخزنة في SQL Server" : "System Settings (SQL Server Persisted)"}</span>
            </h3>
            <span className="text-[11px] font-mono text-sky-300 px-2.5 py-0.5 rounded-full bg-sky-950/60 border border-sky-400/30">
              {systemSettings.length} Parameters
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {systemSettings.length === 0 ? (
              <p className="text-sky-200/60 italic py-4">No system parameters registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className="border-b border-sky-400/20 text-sky-300 font-mono text-[11px]">
                      <th className="py-2.5 px-3">Setting Key</th>
                      <th className="py-2.5 px-3">Value</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-400/10">
                    {systemSettings.map((s) => (
                      <tr key={s.id} className="hover:bg-sky-500/5">
                        <td className="py-2.5 px-3 font-mono font-bold text-sky-200">{s.settingKey}</td>
                        <td className="py-2.5 px-3 font-mono text-white max-w-xs truncate">{s.settingValue}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-300 text-[10px] font-mono border border-sky-400/20">
                            {(s as any).category || (s.isEncrypted ? "Security" : "System")}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-sky-100/70 text-[11px]">{s.description || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Sticky Save Bar at Bottom */}
      <div className="sticky bottom-6 z-30 p-4 rounded-2xl glass-ice border border-sky-400/40 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
          <span className="text-xs text-sky-100 font-bold">
            {isAr
              ? "يتم تطبيق التعديلات فوراً على الصفحة الرئيسية والفوتر وكافة روابط التواصل والمدار."
              : "Changes are applied in realtime across homepage, footer, Egyptian HQ contacts, and orbit."}
          </span>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl luxury-ice-button font-black text-xs text-white flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-sky-200" />
              <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-sky-200" />
              <span>{isAr ? "حفظ كافة الإعدادات" : "Save All Settings"}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
