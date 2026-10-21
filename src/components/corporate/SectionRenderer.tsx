"use client";

import React from "react";
import { PageSection, Project, Service } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import {
  Server,
  Cloud,
  Cpu,
  ShieldCheck,
  Building,
  Building2,
  HardHat,
  Truck,
  Warehouse,
  Globe,
  Activity,
  Award,
  Layers,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Play,
  Calendar,
  Users,
  Quote,
  Clock,
  Sparkles
} from "lucide-react";

interface SectionRendererProps {
  sections: PageSection[];
  companyName: string;
  projects?: Project[];
  services?: Service[];
}

export default function SectionRenderer({
  sections,
  companyName,
  projects = [],
  services = []
}: SectionRendererProps) {
  const { language } = useLanguage();

  const iconMap: Record<string, React.ReactNode> = {
    Cloud: <Cloud className="w-6 h-6 text-rose-300" />,
    Cpu: <Cpu className="w-6 h-6 text-amber-300" />,
    ShieldCheck: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
    HardHat: <HardHat className="w-6 h-6 text-amber-400" />,
    Building2: <Building2 className="w-6 h-6 text-rose-300" />,
    Truck: <Truck className="w-6 h-6 text-emerald-400" />,
    Warehouse: <Warehouse className="w-6 h-6 text-rose-300" />,
    Globe: <Globe className="w-6 h-6 text-cyan-300" />,
    Activity: <Activity className="w-6 h-6 text-rose-400" />,
    Award: <Award className="w-6 h-6 text-amber-300" />,
    Layers: <Layers className="w-6 h-6 text-rose-300" />,
    CheckCircle2: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
    Building: <Building className="w-6 h-6 text-white" />,
    Server: <Server className="w-6 h-6 text-rose-300" />,
    Users: <Users className="w-6 h-6 text-white" />,
    Sparkles: <Sparkles className="w-6 h-6 text-amber-300" />
  };

  const sanitizeHtml = (dirty: string): string => {
    if (!dirty) return "";
    return dirty
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:[^"']*/gi, "")
      .replace(/\s+on\w+\s*=\s*(["']).*?\1/gi, "")
      .replace(/\s+on\w+\s*=\s*[^>\s]+/gi, "");
  };

  return (
    <div className="space-y-28 select-none">
      {sections.filter(s => s.isVisible).map((section) => {
        let config: any = {};
        try {
          config = JSON.parse(section.configurationJson || "{}");
        } catch {
          config = {};
        }

        const getLocalized = (key: string, fallback = "") => {
          if (config[key] && typeof config[key] === "object") {
            return config[key][language] || config[key]["en"] || fallback;
          }
          if (language === "ar" && config[`${key}_ar`]) {
            return config[`${key}_ar`];
          }
          if (language === "en" && config[`${key}_en`]) {
            return config[`${key}_en`];
          }
          return config[key] || fallback;
        };

        const secTitle = getLocalized("title");
        const secSubtitle = getLocalized("subtitle");
        const secDescription = getLocalized("description") || getLocalized("content");
        const secBadge = getLocalized("badge");

        switch (section.sectionType) {
          case "Hero":
            return (
              <section key={section.id} className="relative pt-12 pb-24 text-center overflow-hidden">
                {/* Glacial Cyan-Ice & Burgundy ambient gradient wash */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-950/20 via-rose-950/15 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
                  {secBadge && (
                    <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black glass-ice-pill border border-sky-400/40 text-white shadow-xl shadow-black/40">
                      <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
                      <span className="ice-cyan-gradient-text">{secBadge}</span>
                    </span>
                  )}
                  <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                    {secTitle ? (
                      <span className="ice-cyan-gradient-text">{secTitle}</span>
                    ) : (
                      companyName
                    )}
                  </h1>
                  <p className="text-base sm:text-xl text-sky-100/90 leading-relaxed max-w-2xl mx-auto font-normal">
                    {secSubtitle || secDescription}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    {config.ctaText && (
                      <a
                        href={config.ctaUrl || "#services"}
                        className="px-8 py-3.5 rounded-2xl luxury-ice-button text-white font-extrabold text-sm transition-all shadow-xl hover:scale-105 cursor-pointer"
                      >
                        {getLocalized("ctaText", language === "ar" ? "استكشاف الخدمات" : "Explore Services")}
                      </a>
                    )}
                    {config.secondaryCtaText && (
                      <a
                        href={config.secondaryCtaUrl || "#contact"}
                        className="px-8 py-3.5 rounded-2xl glass-ice-button border-sky-400/30 text-white font-extrabold text-sm transition-all hover:scale-105 cursor-pointer"
                      >
                        {getLocalized("secondaryCtaText", language === "ar" ? "تواصل معنا" : "Contact Us")}
                      </a>
                    )}
                  </div>
                </div>
              </section>
            );

          case "Statistics":
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {(config.stats || []).map((stat: any, i: number) => (
                    <div key={i} className="glass-ice-card p-6 rounded-3xl text-center border border-sky-400/30 hover:border-sky-300/70 transition-all shadow-2xl group">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-2xl glass-ice-pill border border-sky-400/30 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        {iconMap[stat.icon] || <Activity className="w-6 h-6 text-sky-300" />}
                      </div>
                      <div className="text-3xl font-black text-white mb-1 ice-cyan-gradient-text">
                        {stat.value}
                      </div>
                      <div className="text-xs text-slate-200 font-bold">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "Services":
          case "ServicesGrid":
            return (
              <section key={section.id} id="services" className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="px-4 py-1.5 rounded-full text-[11px] font-black glass-ice-pill border border-white/30 text-white uppercase tracking-widest">
                    Capabilities
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {secTitle || (language === "ar" ? "الخدمات والقدرات المؤسسية" : "Strategic Capabilities")}
                  </h2>
                  <p className="text-rose-100/70 text-sm">
                    {secSubtitle}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {services.map((svc) => (
                    <div key={svc.id} className="glass-ice-card p-8 rounded-3xl border border-white/20 flex flex-col justify-between shadow-2xl group">
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl glass-ice-pill border border-white/25 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {iconMap[svc.icon || ""] || <Cloud className="w-6 h-6 text-rose-300" />}
                        </div>
                        <h3 className="text-xl font-black text-white group-hover:text-rose-200 transition-colors">
                          {svc.name}
                        </h3>
                        <p className="text-rose-100/70 text-xs sm:text-sm leading-relaxed">
                          {svc.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "Projects":
          case "ProjectsGrid":
            return (
              <section key={section.id} id="projects" className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <span className="px-4 py-1.5 rounded-full text-[11px] font-black glass-ice-pill border border-white/30 text-white uppercase tracking-widest">
                    Milestones
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {secTitle || (language === "ar" ? "أبرز المشاريع والإنجازات" : "Featured Deployments")}
                  </h2>
                  <p className="text-rose-100/70 text-sm">
                    {secSubtitle}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {projects.map((proj) => (
                    <div key={proj.id} className="glass-ice-card rounded-3xl overflow-hidden border border-white/20 flex flex-col justify-between shadow-2xl group">
                      <div className="h-52 bg-gradient-to-tr from-burgundy-950 via-rose-950 to-[#25040d] relative p-6 flex flex-col justify-between border-b border-white/10">
                        <span className="self-start px-3.5 py-1 rounded-full text-xs font-black glass-ice-pill border border-white/30 text-white">
                          {proj.status}
                        </span>
                        <div>
                          <span className="text-xs text-rose-300 font-bold">{proj.clientName}</span>
                          <h4 className="text-2xl font-black text-white mt-1 group-hover:text-rose-100 transition-colors">{proj.name}</h4>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <p className="text-rose-100/75 text-xs sm:text-sm leading-relaxed">
                          {proj.shortDescription || proj.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-rose-300/70 pt-3 border-t border-white/10">
                          <span className="font-medium">{proj.location}</span>
                          <span className="font-mono font-bold text-white">{proj.startDate ? new Date(proj.startDate).getFullYear() : 2026}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "Features":
            const features = config.features || [
              { title: "Enterprise Grade", desc: "Built with scalable cloud architectures and security protocols.", icon: "ShieldCheck" },
              { title: "Global Footprint", desc: "Executing high-profile projects across key regional markets.", icon: "Globe" },
              { title: "Continuous Innovation", desc: "Pioneering technological and operational excellence.", icon: "Cpu" }
            ];
            return (
              <section key={section.id} className="max-w-7xl mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {secTitle || (language === "ar" ? "المزايا المؤسسية" : "Strategic Advantages")}
                  </h2>
                  {secSubtitle && <p className="text-rose-100/70 text-sm">{secSubtitle}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {features.map((f: any, i: number) => (
                    <div key={i} className="glass-ice-card p-8 rounded-3xl border border-white/20 space-y-4 shadow-xl">
                      <div className="w-12 h-12 rounded-2xl glass-ice-pill border border-white/25 flex items-center justify-center">
                        {iconMap[f.icon] || <Sparkles className="w-6 h-6 text-amber-300" />}
                      </div>
                      <h3 className="text-xl font-black text-white">{f.title}</h3>
                      <p className="text-rose-100/70 text-xs sm:text-sm leading-relaxed">{f.desc || f.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );

          case "Contact":
            return (
              <section key={section.id} id="contact" className="max-w-5xl mx-auto px-4">
                <div className="glass-ice-burgundy p-10 sm:p-14 rounded-3xl border border-white/25 text-center space-y-6 shadow-2xl">
                  <h2 className="text-3xl sm:text-4xl font-black text-white">
                    {secTitle || (language === "ar" ? "تواصل مع الإدارة التنفيذية" : "Executive Inquiry")}
                  </h2>
                  <p className="text-rose-100/80 text-sm max-w-xl mx-auto leading-relaxed">
                    {secSubtitle || (language === "ar" ? "نرحب بفرص الشراكة الاستراتيجية والمشاريع المؤسسية الكبرى." : "Partner with our senior executive team on nation-building initiatives.")}
                  </p>
                  <div className="pt-4 flex flex-wrap justify-center gap-6 text-sm">
                    <a
                      href="mailto:info@mtigroup.com"
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl luxury-ice-button text-white font-black transition-all shadow-xl"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{language === "ar" ? "مراسلة الإدارة" : "Email Advisory"}</span>
                    </a>
                  </div>
                </div>
              </section>
            );

          case "CustomHTML":
            const safeHtml = sanitizeHtml(config.html || config.customHtml || "");
            return (
              <section key={section.id} className="max-w-5xl mx-auto px-4">
                <div
                  className="glass-ice-card p-8 sm:p-10 rounded-3xl border border-white/20 prose prose-invert max-w-none text-rose-100/80"
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              </section>
            );

          default:
            return (
              <section key={section.id} className="max-w-4xl mx-auto px-4">
                <div className="glass-ice-card p-8 rounded-3xl border border-white/20">
                  <h3 className="text-xl font-black text-white mb-3">{secTitle || section.sectionType}</h3>
                  <p className="text-rose-100/70 text-sm leading-relaxed">{secDescription}</p>
                </div>
              </section>
            );
        }
      })}
    </div>
  );
}
