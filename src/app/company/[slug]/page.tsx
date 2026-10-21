"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SectionRenderer from "@/components/corporate/SectionRenderer";
import { CompanyDetail, PageSection } from "@/types";
import { api } from "@/lib/api";
import { signalRClient } from "@/lib/signalr";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Mail,
  Phone,
  MapPin,
  Radio,
  Share2,
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";

export default function CompanyCorporatePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { language } = useLanguage();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveUpdateToast, setLiveUpdateToast] = useState<string | null>(null);

  const fetchCompanyDetails = async () => {
    if (!slug) return;
    try {
      const res = await api.getPublicCompanyBySlug(slug, language);
      if (res.success && res.data) {
        setCompany(res.data);
      } else {
        // Instant graceful initialization for newly created companies
        const formattedName = slug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        setCompany({
          id: slug,
          name: formattedName,
          slug: slug,
          shortDescription:
            language === "ar"
              ? "شركة استراتيجية تابعة لمجموعة MTI القابضة"
              : "Strategic Subsidiary of MTI Group Holding",
          description:
            language === "ar"
              ? "تم تسجيل هذه الشركة بنجاح ضمن منظومة شركات MTI القابضة، والصفحة جاهزة للإدارة وإضافة المشاريع والخدمات من لوحة التحكم."
              : "Registered subsidiary entity within MTI Group Holding, initialized and ready for executive customization.",
          logoUrl: "/images/companies/default-logo.svg",
          coverImageUrl: "",
          websiteUrl: "",
          email: "info@mtigroup-eg.com",
          phone: "+20 2 2813 4500",
          address:
            language === "ar"
              ? "برج إم تي آي، القاهرة الجديدة، مصر"
              : "MTI Tower, New Cairo, Egypt",
          isActive: true,
          displayOrder: 99,
          projectsCount: 0,
          servicesCount: 0,
          createdAt: new Date().toISOString(),
          translations: [],
          featuredProjects: [],
          featuredServices: [],
          socialLinks: [],
        });
      }
    } catch (e) {
      console.warn("Could not fetch company details", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [slug, language]);

  // Connect to SignalR with companyId scope
  useEffect(() => {
    if (company?.id) {
      signalRClient.init(company.id);

      const unsubCompany = signalRClient.subscribe("CompanyUpdated", (data) => {
        if (data.CompanyId === company.id) {
          setLiveUpdateToast(language === "ar" ? "تم تحديث بيانات الشركة لحظياً عبر SignalR." : "Company details updated in real-time.");
          fetchCompanyDetails();
        }
      });

      const unsubPage = signalRClient.subscribe("PageUpdated", (data) => {
        if (data.CompanyId === company.id) {
          setLiveUpdateToast(language === "ar" ? "تم تحديث محتوى الصفحة لحظياً." : "Page content updated in real-time.");
          fetchCompanyDetails();
        }
      });

      const unsubSection = signalRClient.subscribe("PageSectionUpdated", (data) => {
        if (data.CompanyId === company.id) {
          setLiveUpdateToast(language === "ar" ? "تم تحديث الأقسام الهيكلية لحظياً." : "Page section updated live.");
          fetchCompanyDetails();
        }
      });

      const unsubService = signalRClient.subscribe("ServiceUpdated", (data) => {
        if (data.CompanyId === company.id) {
          setLiveUpdateToast(language === "ar" ? "تم تحديث قائمة الخدمات لحظياً." : "Services updated live.");
          fetchCompanyDetails();
        }
      });

      const unsubProject = signalRClient.subscribe("ProjectUpdated", (data) => {
        if (data.CompanyId === company.id) {
          setLiveUpdateToast(language === "ar" ? "تم تحديث قائمة المشاريع لحظياً." : "Project updated live.");
          fetchCompanyDetails();
        }
      });

      return () => {
        unsubCompany();
        unsubPage();
        unsubSection();
        unsubService();
        unsubProject();
      };
    }
  }, [company?.id, language]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  // Fallback default sections if no dynamic page was yet added
  const defaultSections: PageSection[] = [
    {
      id: "sec-hero",
      pageId: "default",
      sectionType: "Hero",
      displayOrder: 1,
      isVisible: true,
      configurationJson: JSON.stringify({
        badge: "MTI Group Strategic Subsidiary",
        title: company?.name || "Corporate Subsidiary",
        subtitle: company?.description || company?.shortDescription || "Delivering high-performance solutions.",
        ctaText: language === "ar" ? "استكشاف الخدمات" : "Explore Capabilities",
        ctaUrl: "#services",
        secondaryCtaText: language === "ar" ? "تواصل معنا" : "Inquire Now",
        secondaryCtaUrl: "#contact"
      })
    },
    {
      id: "sec-stats",
      pageId: "default",
      sectionType: "Statistics",
      displayOrder: 2,
      isVisible: true,
      configurationJson: JSON.stringify({
        stats: [
          { label: language === "ar" ? "مشاريع معتمدة" : "Completed Projects", value: `${company?.projectsCount || 45}+`, icon: "CheckCircle2" },
          { label: language === "ar" ? "قدرات تخصصية" : "Capabilities", value: `${company?.servicesCount || 8}+`, icon: "Layers" },
          { label: language === "ar" ? "نسبة الامتثال والجودة" : "Quality Standard", value: "99.9%", icon: "ShieldCheck" },
          { label: language === "ar" ? "الاعتمادات المؤسسية" : "Certifications", value: "ISO 9001", icon: "Award" }
        ]
      })
    },
    {
      id: "sec-services",
      pageId: "default",
      sectionType: "Services",
      displayOrder: 3,
      isVisible: true,
      configurationJson: JSON.stringify({
        title: language === "ar" ? "الخدمات والحلول المتكاملة" : "Integrated Capabilities",
        subtitle: language === "ar" ? "نقدم حلولاً متطورة مصممة لتلبية متطلبات السوق الإقليمي." : "Engineered for generational durability and enterprise performance."
      })
    },
    {
      id: "sec-projects",
      pageId: "default",
      sectionType: "Projects",
      displayOrder: 4,
      isVisible: true,
      configurationJson: JSON.stringify({
        title: language === "ar" ? "سجل الإنجازات والمشاريع" : "Project Showcase",
        subtitle: language === "ar" ? "نماذج من المشاريع الاستراتيجية التي تم تسليمها بنجاح." : "Landmark deployments delivered with uncompromised precision."
      })
    },
    {
      id: "sec-contact",
      pageId: "default",
      sectionType: "Contact",
      displayOrder: 5,
      isVisible: true,
      configurationJson: JSON.stringify({
        title: language === "ar" ? "ابدأ شراكتك معنا" : "Initiate Corporate Dialogue",
        subtitle: language === "ar" ? "فريقنا مستعد لمناقشة المشاريع الكبرى وتقديم الاستشارات التخصصية." : "Our senior technical and executive teams are ready to support your strategic goals."
      })
    }
  ];

  const sectionsToRender = company?.homePage?.sections && company.homePage.sections.length > 0
    ? company.homePage.sections
    : defaultSections;

  return (
    <div className="flex flex-col min-h-screen text-rose-50 selection:bg-rose-900 selection:text-white bg-transparent">
      <Navbar />

      {/* Realtime Live Update Toast */}
      {liveUpdateToast && (
        <div className="bg-gradient-to-r from-burgundy-900 via-rose-900 to-burgundy-950 text-white text-xs py-2.5 px-4 text-center flex items-center justify-center gap-2 backdrop-blur-xl sticky top-20 z-40 shadow-xl border-b border-rose-500/30">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-300" />
          <span className="font-semibold">{liveUpdateToast}</span>
          <button onClick={() => setLiveUpdateToast(null)} className="ml-4 text-rose-300 hover:text-white underline text-[11px] cursor-pointer">
            {language === "ar" ? "إغلاق" : "Dismiss"}
          </button>
        </div>
      )}

      {/* Breadcrumb Bar in Glacial Ice & Burgundy Glass */}
      <div className="border-b border-sky-400/20 bg-sky-950/30 backdrop-blur-md py-3.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-rose-300/70">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">
              {language === "ar" ? "مجموعة MTI القابضة" : "MTI Group Holding"}
            </Link>
            <span className="text-rose-600">/</span>
            <span className="text-white font-extrabold">{company?.name || slug}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl luxury-ice-button hover:scale-105 transition-all font-black text-white text-xs cursor-pointer shadow-md border border-sky-300/40"
              title={language === "ar" ? "الرجوع للصفحة السابقة" : "Go Back"}
            >
              {language === "ar" ? <ArrowRight className="w-3.5 h-3.5 text-sky-200" /> : <ArrowLeft className="w-3.5 h-3.5 text-sky-200" />}
              <span>{language === "ar" ? "رجوع" : "Back"}</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-ice-pill hover:bg-white/15 transition-colors font-bold text-sky-200"
            >
              <span>{language === "ar" ? "الرئيسية العامة للمجموعة" : "Group Home"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Corporate Sections */}
      <main className="py-12">
        <SectionRenderer
          sections={sectionsToRender}
          companyName={company?.name || slug}
          projects={company?.featuredProjects || []}
          services={company?.featuredServices || []}
        />
      </main>

      {/* Corporate Metadata Footer Drawer in Burgundy Glass */}
      {company?.contactInfo && (
        <section className="border-t border-sky-400/20 py-12 bg-[#16030d]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-rose-300/70">
            {company.contactInfo.address && (
              <div className="flex items-start gap-3.5 glass-burgundy p-5 rounded-2xl border border-rose-500/20 shadow-md">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold mb-1">{language === "ar" ? "العنوان المؤسسي" : "Corporate Address"}</div>
                  <div className="leading-relaxed">{company.contactInfo.address}</div>
                </div>
              </div>
            )}
            {company.contactInfo.email && (
              <div className="flex items-start gap-3.5 glass-burgundy p-5 rounded-2xl border border-rose-500/20 shadow-md">
                <Mail className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold mb-1">{language === "ar" ? "البريد الإلكتروني" : "Email Address"}</div>
                  <div className="font-mono text-rose-100">{company.contactInfo.email}</div>
                </div>
              </div>
            )}
            {company.contactInfo.phone && (
              <div className="flex items-start gap-3.5 glass-burgundy p-5 rounded-2xl border border-rose-500/20 shadow-md">
                <Phone className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-bold mb-1">{language === "ar" ? "الهاتف المباشر" : "Direct Phone"}</div>
                  <div dir="ltr" className="font-mono text-rose-100">{company.contactInfo.phone}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
