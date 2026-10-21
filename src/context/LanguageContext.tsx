"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "ar" | "en";

interface LanguageContextType {
  language: Language;
  direction: "rtl" | "ltr";
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    "group.name": "مجموعة إم تي آي القابضة",
    "group.tagline": "الريادة في التكنولوجيا والإنشاءات والخدمات اللوجستية",
    "nav.home": "الرئيسية",
    "nav.companies": "شركات المجموعة",
    "nav.about": "عن المجموعة",
    "nav.contact": "تواصل معنا",
    "nav.admin": "بوابة الإدارة",
    "hero.badge": "مجموعة استثمارية متعددة القطاعات",
    "hero.title": "ريادة استراتيجية تشكل ملامح المستقبل",
    "hero.subtitle": "تجمع مجموعة MTI تحت مظلتها شركات رائدة في مجالات التحول الرقمي، الحلول السحابية والذكاء الاصطناعي، الإنشاءات الكبرى، والخدمات اللوجستية الإقليمية.",
    "hero.explore": "استكشف شركات المجموعة",
    "hero.contact": "اتصل بنا",
    "companies.title": "شركات مجموعة MTI",
    "companies.subtitle": "منظومة متكاملة من الشركات التابعة الرائدة في مجالاتها الحيوية",
    "companies.viewCorporate": "زيارة صفحة الشركة",
    "companies.projects": "مشاريع منجزة",
    "companies.services": "خدمات تخصصية",
    "footer.rights": "جميع الحقوق محفوظة لمجموعة MTI القابضة",
    "admin.login.title": "تسجيل الدخول للإدارة",
    "admin.login.subtitle": "نظام إدارة المحتوى المؤسسي CMS لمجموعة MTI",
    "admin.login.username": "اسم المستخدم أو البريد الإلكتروني",
    "admin.login.password": "كلمة المرور",
    "admin.login.submit": "تسجيل الدخول",
    "admin.dashboard": "لوحة التحكم",
    "admin.companies": "إدارة الشركات",
    "admin.projects": "المشاريع",
    "admin.services": "الخدمات",
    "admin.pages": "الصفحات والأقسام",
    "admin.media": "المكتبة والملفات",
    "admin.users": "المستخدمون والصلاحيات",
    "admin.settings": "إعدادات النظام",
    "admin.realtime": "مراقبة البث الحي (SignalR)",
    "admin.system": "حالة النظام",
    "admin.logout": "تسجيل الخروج",
    "realtime.connected": "متصل بالبث الحي",
    "realtime.connecting": "جاري الاتصال...",
    "realtime.disconnected": "غير متصل",
    "status.active": "نشط",
    "status.inactive": "معطل",
    "save": "حفظ التغييرات",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "create": "إضافة جديد",
    "actions": "الإجراءات",
    "search": "بحث...",
    "common.loading": "جاري التحميل...",
    "common.backToPortal": "العودة للبوابة الرئيسية",
    "common.viewPublicPage": "معاينة الصفحة العامة",
    "common.strategicEntity": "شركة استراتيجية",
    "common.explore": "استكشف الشركة",
    "common.projectsCount": "مشاريع معتمدة",
    "common.servicesCount": "قدرات تخصصية",
    "admin.companies.title": "إدارة شركات المجموعة",
    "admin.companies.subtitle": "إضافة وتعديل بيانات الشركات، الهوية البصرية، والشعارات الرسمية",
    "admin.companies.add": "إضافة شركة جديدة",
    "admin.companies.edit": "تعديل بيانات الشركة",
    "admin.companies.search": "البحث بالاسم أو الرابط التعريفي...",
    "admin.companies.th.company": "الشركة والشعار",
    "admin.companies.th.slug": "الرابط (Slug)",
    "admin.companies.th.order": "الترتيب",
    "admin.companies.th.projects": "المشاريع",
    "admin.companies.th.status": "الحالة",
    "admin.companies.th.actions": "الإجراءات",
    "admin.companies.logo": "شعار الشركة (Logo)",
    "admin.companies.logoHelp": "اختر من النماذج المسبقة أو قم برفع صورة مخصصة من جهازك أو أدخل الرابط:",
    "admin.companies.logoPresets": "شعارات جاهزة:",
    "admin.companies.uploadLogo": "رفع شعار من جهازك",
    "admin.companies.coverImage": "صورة الغلاف (Cover Image)",
    "admin.companies.nameEn": "اسم الشركة (بالإنجليزية)",
    "admin.companies.nameAr": "اسم الشركة (بالعربية)",
    "admin.companies.slugField": "الرابط التعريفي الفريد (Slug)",
    "admin.companies.shortDescEn": "الوصف المختصر (بالإنجليزية)",
    "admin.companies.descAr": "الوصف التفصيلي (بالعربية)",
    "admin.companies.website": "الموقع الإلكتروني الرسمي",
    "admin.companies.email": "البريد الإلكتروني للشركة",
    "admin.companies.phone": "رقم الهاتف والاتصال",
    "admin.companies.order": "ترتيب العرض",
    "admin.companies.active": "نشطة ومعروضة في البوابة العامة",
    "admin.companies.deleteConfirm": "هل أنت متأكد من رغبتك في حذف هذه الشركة نهائياً؟",
    "admin.liveFeed": "نشاط البث اللحظي المباشر",
    "admin.noEvents": "في انتظار الأحداث اللحظية من النظام...",
    "admin.liveChannel": "قناة البث اللحظي",
    "admin.kpi.companies": "شركات المجموعة",
    "admin.kpi.projects": "المشاريع المنفذة",
    "admin.kpi.gateway": "بوابة الباك إند API",
    "admin.kpi.database": "قاعدة البيانات SQL",
  },
  en: {
    "group.name": "MTI Group Holding",
    "group.tagline": "Excellence in Enterprise, Construction & Logistics",
    "nav.home": "Home",
    "nav.companies": "Group Companies",
    "nav.about": "About MTI",
    "nav.contact": "Contact Us",
    "nav.admin": "Admin Portal",
    "hero.badge": "Diversified Multi-Sector Holding",
    "hero.title": "Strategic Leadership Architecting The Future",
    "hero.subtitle": "MTI Group consolidates visionary market leaders across digital cloud platforms, enterprise AI, mega-infrastructure contracting, and multimodal regional logistics.",
    "hero.explore": "Explore Companies",
    "hero.contact": "Contact Group",
    "companies.title": "MTI Group Companies",
    "companies.subtitle": "An integrated corporate ecosystem powering economic transformation",
    "companies.viewCorporate": "Corporate Profile",
    "companies.projects": "Delivered Projects",
    "companies.services": "Specialized Capabilities",
    "footer.rights": "All rights reserved. MTI Group Holding",
    "admin.login.title": "Corporate CMS Login",
    "admin.login.subtitle": "Enterprise Management Portal for MTI Group",
    "admin.login.username": "Username or Email",
    "admin.login.password": "Password",
    "admin.login.submit": "Sign In to Admin",
    "admin.dashboard": "Dashboard",
    "admin.companies": "Companies",
    "admin.projects": "Projects",
    "admin.services": "Services",
    "admin.pages": "Pages & Sections",
    "admin.media": "Media Library",
    "admin.users": "Users & Access",
    "admin.settings": "Settings",
    "admin.realtime": "Realtime SignalR",
    "admin.system": "System Status",
    "admin.logout": "Logout",
    "realtime.connected": "Live Stream Active",
    "realtime.connecting": "Connecting...",
    "realtime.disconnected": "Offline",
    "status.active": "Active",
    "status.inactive": "Inactive",
    "save": "Save Changes",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Add New",
    "actions": "Actions",
    "search": "Search...",
    "common.loading": "Loading...",
    "common.backToPortal": "Back to Main Portal",
    "common.viewPublicPage": "View Public Page",
    "common.strategicEntity": "Strategic Entity",
    "common.explore": "Explore Entity",
    "common.projectsCount": "Delivered Projects",
    "common.servicesCount": "Specialized Capabilities",
    "admin.companies.title": "Group Companies Management",
    "admin.companies.subtitle": "Manage corporate entities, visual branding, and official logos",
    "admin.companies.add": "Add New Company",
    "admin.companies.edit": "Edit Company Profile",
    "admin.companies.search": "Search by name or slug...",
    "admin.companies.th.company": "Company & Logo",
    "admin.companies.th.slug": "Slug Identifier",
    "admin.companies.th.order": "Order",
    "admin.companies.th.projects": "Projects",
    "admin.companies.th.status": "Status",
    "admin.companies.th.actions": "Actions",
    "admin.companies.logo": "Company Logo",
    "admin.companies.logoHelp": "Choose from presets, upload a file from your device, or enter a URL:",
    "admin.companies.logoPresets": "Preset Logos:",
    "admin.companies.uploadLogo": "Upload Logo from PC",
    "admin.companies.coverImage": "Cover Image URL",
    "admin.companies.nameEn": "Company Name (English)",
    "admin.companies.nameAr": "Company Name (Arabic)",
    "admin.companies.slugField": "Unique URL Slug",
    "admin.companies.shortDescEn": "Short Description (English)",
    "admin.companies.descAr": "Detailed Description (Arabic)",
    "admin.companies.website": "Official Website URL",
    "admin.companies.email": "Corporate Email",
    "admin.companies.phone": "Phone & Contact",
    "admin.companies.order": "Display Order",
    "admin.companies.active": "Active in Public Portfolio",
    "admin.companies.deleteConfirm": "Are you sure you want to permanently delete this company?",
    "admin.liveFeed": "Live Realtime Activity Stream",
    "admin.noEvents": "Waiting for live events from system...",
    "admin.liveChannel": "Realtime Channel",
    "admin.kpi.companies": "Group Companies",
    "admin.kpi.projects": "Total Projects",
    "admin.kpi.gateway": "Backend API Gateway",
    "admin.kpi.database": "SQL Database",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar");

  useEffect(() => {
    const saved = localStorage.getItem("mti_lang") as Language;
    if (saved === "ar" || saved === "en") {
      setLanguageState(saved);
      document.documentElement.dir = saved === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = saved;
    } else {
      document.documentElement.dir = "rtl";
      document.documentElement.lang = "ar";
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("mti_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  const toggleLanguage = () => {
    const next = language === "ar" ? "en" : "ar";
    setLanguage(next);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const direction = language === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
