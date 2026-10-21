"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Page, PageSection, Company } from "@/types";
import SectionRenderer from "@/components/corporate/SectionRenderer";
import {
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  Save,
  X,
  Layers,
  Eye,
  CheckCircle2,
  Copy,
  Globe,
  Settings,
  Sparkles,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function AdminPagesManager() {
  const { language, t } = useLanguage();

  const [pages, setPages] = useState<Page[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Section Modal
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<"fields" | "json">("fields");

  // Visual Section Form Fields
  const [sectionType, setSectionType] = useState("Hero");
  const [titleAr, setTitleAr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [subtitleAr, setSubtitleAr] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [badgeAr, setBadgeAr] = useState("");
  const [badgeEn, setBadgeEn] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [ctaTextAr, setCtaTextAr] = useState("");
  const [ctaTextEn, setCtaTextEn] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [configJson, setConfigJson] = useState("{}");
  const [isVisible, setIsVisible] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  // Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<"ar" | "en">("ar");

  // Create Page Modal
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [newPageCompanyId, setNewPageCompanyId] = useState("");
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [isHomePage, setIsHomePage] = useState(false);

  const supportedSectionTypes = [
    { value: "Hero", label: "Hero Banner" },
    { value: "TextBlock", label: "Text Block" },
    { value: "Image", label: "Corporate Image" },
    { value: "ImageText", label: "Image + Text Split" },
    { value: "Gallery", label: "Image Gallery" },
    { value: "ProjectsGrid", label: "Projects Grid" },
    { value: "ServicesGrid", label: "Services Grid" },
    { value: "Statistics", label: "KPI & Metrics" },
    { value: "Features", label: "Corporate Pillars" },
    { value: "Timeline", label: "Historical Timeline" },
    { value: "Team", label: "Executive Leadership" },
    { value: "Video", label: "Video Showcase" },
    { value: "Contact", label: "Contact Advisory" },
    { value: "Map", label: "Headquarters Map" },
    { value: "CTA", label: "Call To Action" },
    { value: "Testimonials", label: "Partner Endorsements" },
    { value: "CustomHTML", label: "Custom HTML (Sanitized)" },
  ];

  const fetchPages = async () => {
    setLoading(true);
    const [pageRes, compRes] = await Promise.all([
      api.getAdminPages(),
      api.getAdminCompanies(),
    ]);

    if (pageRes.success && pageRes.data) {
      setPages(pageRes.data);
      if (pageRes.data.length > 0) {
        const first = pageRes.data[0];
        setSelectedPage(first);
        setSections(first.sections || []);
      }
    }
    if (compRes.success && compRes.data) {
      setCompanies(compRes.data);
      if (compRes.data.length > 0) {
        setNewPageCompanyId(compRes.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSelectPage = async (page: Page) => {
    setSelectedPage(page);
    const res = await api.getAdminPage(page.id);
    if (res.success && res.data) {
      setSections(res.data.sections || []);
    } else {
      setSections(page.sections || []);
    }
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    if (!selectedPage) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const reordered = [...sections];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((sec, i) => ({
      ...sec,
      displayOrder: i + 1,
    }));

    setSections(updated);

    await api.reorderPageSections(
      selectedPage.id,
      updated.map((s) => ({ id: s.id, displayOrder: s.displayOrder }))
    );
  };

  const openAddSectionModal = () => {
    setEditingSection(null);
    setSectionType("Hero");
    setTitleAr("");
    setTitleEn("");
    setSubtitleAr("");
    setSubtitleEn("");
    setDescriptionAr("");
    setDescriptionEn("");
    setBadgeAr("");
    setBadgeEn("");
    setImageUrl("");
    setCtaTextAr("");
    setCtaTextEn("");
    setCtaUrl("");
    setConfigJson(JSON.stringify({ badge: "Corporate", title: "Heading", subtitle: "Description text" }, null, 2));
    setDisplayOrder(sections.length + 1);
    setIsVisible(true);
    setActiveEditorTab("fields");
    setIsSectionModalOpen(true);
  };

  const openEditSectionModal = (s: PageSection) => {
    setEditingSection(s);
    setSectionType(s.sectionType || "Hero");

    let cfg: any = {};
    try {
      cfg = JSON.parse(s.configurationJson || "{}");
    } catch {
      cfg = {};
    }

    setTitleAr(cfg.title_ar || (typeof cfg.title === "object" ? cfg.title.ar : cfg.title) || "");
    setTitleEn(cfg.title_en || (typeof cfg.title === "object" ? cfg.title.en : cfg.title) || "");
    setSubtitleAr(cfg.subtitle_ar || (typeof cfg.subtitle === "object" ? cfg.subtitle.ar : cfg.subtitle) || "");
    setSubtitleEn(cfg.subtitle_en || (typeof cfg.subtitle === "object" ? cfg.subtitle.en : cfg.subtitle) || "");
    setDescriptionAr(cfg.description_ar || (typeof cfg.description === "object" ? cfg.description.ar : cfg.description) || "");
    setDescriptionEn(cfg.description_en || (typeof cfg.description === "object" ? cfg.description.en : cfg.description) || "");
    setBadgeAr(cfg.badge_ar || cfg.badge || "");
    setBadgeEn(cfg.badge_en || cfg.badge || "");
    setImageUrl(cfg.imageUrl || "");
    setCtaTextAr(cfg.ctaText_ar || cfg.ctaText || "");
    setCtaTextEn(cfg.ctaText_en || cfg.ctaText || "");
    setCtaUrl(cfg.ctaUrl || "");
    setConfigJson(JSON.stringify(cfg, null, 2));
    setDisplayOrder(s.displayOrder);
    setIsVisible(s.isVisible);
    setActiveEditorTab("fields");
    setIsSectionModalOpen(true);
  };

  const handleDuplicateSection = async (s: PageSection) => {
    if (!selectedPage) return;
    const payload = {
      sectionType: s.sectionType,
      displayOrder: sections.length + 1,
      isVisible: s.isVisible,
      configurationJson: s.configurationJson
    };
    await api.addPageSection(selectedPage.id, payload);
    handleSelectPage(selectedPage);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    let finalConfig: any = {};

    if (activeEditorTab === "json") {
      try {
        finalConfig = JSON.parse(configJson);
      } catch {
        alert("Invalid JSON format");
        return;
      }
    } else {
      // Build config from visual form
      finalConfig = {
        title_ar: titleAr,
        title_en: titleEn,
        title: language === "ar" ? titleAr || titleEn : titleEn || titleAr,
        subtitle_ar: subtitleAr,
        subtitle_en: subtitleEn,
        subtitle: language === "ar" ? subtitleAr || subtitleEn : subtitleEn || subtitleAr,
        description_ar: descriptionAr,
        description_en: descriptionEn,
        description: language === "ar" ? descriptionAr || descriptionEn : descriptionEn || descriptionAr,
        badge_ar: badgeAr,
        badge_en: badgeEn,
        badge: language === "ar" ? badgeAr || badgeEn : badgeEn || badgeAr,
        imageUrl,
        ctaText_ar: ctaTextAr,
        ctaText_en: ctaTextEn,
        ctaText: language === "ar" ? ctaTextAr || ctaTextEn : ctaTextEn || ctaTextAr,
        ctaUrl,
      };

      // Preserve stats or custom nested keys if editing
      if (editingSection) {
        try {
          const old = JSON.parse(editingSection.configurationJson || "{}");
          if (old.stats) finalConfig.stats = old.stats;
          if (old.features) finalConfig.features = old.features;
          if (old.images) finalConfig.images = old.images;
          if (old.milestones) finalConfig.milestones = old.milestones;
          if (old.members) finalConfig.members = old.members;
          if (old.testimonials) finalConfig.testimonials = old.testimonials;
        } catch {
          // ignore
        }
      }
    }

    const payload = {
      sectionType,
      displayOrder: Number(displayOrder),
      isVisible,
      configurationJson: JSON.stringify(finalConfig),
    };

    if (editingSection) {
      await api.updatePageSection(selectedPage.id, editingSection.id, payload);
    } else {
      await api.addPageSection(selectedPage.id, payload);
    }

    setIsSectionModalOpen(false);
    handleSelectPage(selectedPage);
  };

  const handleDeleteSection = async (secId: string) => {
    if (!selectedPage) return;
    if (confirm(language === "ar" ? "هل أنت متأكد من حذف هذا القسم؟" : "Are you sure you want to delete this section?")) {
      await api.deletePageSection(selectedPage.id, secId);
      handleSelectPage(selectedPage);
    }
  };

  const handleTogglePublish = async () => {
    if (!selectedPage) return;
    const newState = !selectedPage.isPublished;
    const res = await api.togglePublishPage(selectedPage.id, newState);
    if (res.success) {
      setSelectedPage({ ...selectedPage, isPublished: newState });
      setPages(pages.map(p => p.id === selectedPage.id ? { ...p, isPublished: newState } : p));
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.createPage({
      companyId: newPageCompanyId,
      title: newPageTitle,
      slug: newPageSlug.toLowerCase().replace(/\s+/g, "-"),
      isHomePage,
      isPublished: true,
      displayOrder: pages.length + 1,
    });

    if (res.success) {
      setIsPageModalOpen(false);
      fetchPages();
    } else {
      alert(res.message || "Failed to create page");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-400" />
            <span>{language === "ar" ? "مُنشئ الصفحات الديناميكي (Page Builder)" : "Dynamic Page Builder"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === "ar"
              ? "بناء وتنسيق أقسام صفحات الشركات ونشرها بصورة حية عبر SignalR"
              : "Design, organize, and publish corporate sections in realtime via SignalR"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedPage && (
            <>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>{language === "ar" ? "معاينة الصفحة" : "Live Preview"}</span>
              </button>

              <button
                onClick={handleTogglePublish}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedPage.isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{selectedPage.isPublished ? (language === "ar" ? "منشورة (Published)" : "Published") : (language === "ar" ? "مسودة (Draft)" : "Draft")}</span>
              </button>
            </>
          )}

          <button
            onClick={() => setIsPageModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "ar" ? "إنشاء صفحة جديدة" : "New Page"}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Pages List */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center justify-between pb-3 border-b border-white/5">
            <span>{language === "ar" ? "صفحات المجموعة" : "Corporate Pages"}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 font-mono">
              {pages.length}
            </span>
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {pages.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPage(p)}
                className={`w-full text-start p-3 rounded-xl text-xs transition-all flex items-center justify-between ${
                  selectedPage?.id === p.id
                    ? "bg-brand-600/20 text-brand-300 border border-brand-500/30"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="space-y-1 truncate pr-2">
                  <div className="font-bold truncate">{p.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {p.companyName} • /{p.slug}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {p.isHomePage && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-brand-500/20 text-brand-300">
                      Home
                    </span>
                  )}
                  {p.isPublished ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Page Builder Canvas */}
        <div className="lg:col-span-3 space-y-4">
          {selectedPage ? (
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
              {/* Page Banner Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{selectedPage.title}</h3>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                      /{selectedPage.slug}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedPage.companyName} • {sections.length} {language === "ar" ? "أقسام مرتبة" : "reorderable sections"}
                  </p>
                </div>

                <button
                  onClick={openAddSectionModal}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === "ar" ? "إضافة قسم جديد" : "Add Section"}</span>
                </button>
              </div>

              {/* Sections List with Reordering Controls */}
              {sections.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-3">
                  <Layers className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm font-medium">
                    {language === "ar" ? "لا توجد أقسام في هذه الصفحة حتى الآن." : "No sections added to this page yet."}
                  </p>
                  <button
                    onClick={openAddSectionModal}
                    className="text-xs text-brand-400 hover:underline"
                  >
                    {language === "ar" ? "ابدأ بإضافة أول قسم" : "Start by adding the first section"}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((sec, idx) => {
                    let previewTitle = "";
                    try {
                      const cfg = JSON.parse(sec.configurationJson || "{}");
                      previewTitle = cfg.title || cfg.badge || "";
                    } catch {
                      // ignore
                    }

                    return (
                      <div
                        key={sec.id}
                        className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4 transition-all hover:border-brand-500/20"
                      >
                        <div className="flex items-center gap-4">
                          {/* Reordering Up / Down buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              disabled={idx === 0}
                              onClick={() => moveSection(idx, "up")}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 transition-all"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={idx === sections.length - 1}
                              onClick={() => moveSection(idx, "down")}
                              className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-20 transition-all"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/10 text-brand-300 border border-brand-500/20">
                                {sec.sectionType}
                              </span>
                              <span className="text-xs font-mono text-slate-500">#{sec.displayOrder}</span>
                              {!sec.isVisible && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-200 font-medium">
                              {previewTitle || sec.sectionType}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDuplicateSection(sec)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs transition-all"
                            title="Duplicate Section"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditSectionModal(sec)}
                            className="p-2 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs transition-all"
                            title="Edit Section"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs transition-all"
                            title="Delete Section"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-16 rounded-2xl border border-white/10 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
              <p className="text-sm">Select a page from the left panel to edit its sections.</p>
            </div>
          )}
        </div>
      </div>

      {/* Section Editor Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="modal-glass-container max-w-2xl w-full rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <span className="ice-gradient-text">{editingSection ? (language === "ar" ? "تعديل قسم الصفحة" : "Edit Page Section") : (language === "ar" ? "إضافة قسم جديد" : "Add Page Section")}</span>
                </h3>

                {/* Mode Switcher */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5">
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab("fields")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeEditorTab === "fields"
                        ? "bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {language === "ar" ? "نماذج مرئية" : "Visual"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveEditorTab("json")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeEditorTab === "json"
                        ? "bg-sky-500/20 text-sky-200 border border-sky-400/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1.5 rounded-xl glass-ice-pill text-sky-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form wrapping scroll body and sticky footer */}
            <form onSubmit={handleSaveSection} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-scroll-body flex-1 p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "نوع القسم (Section Type)" : "Section Type"}
                  </label>
                  <select
                    value={sectionType}
                    onChange={(e) => setSectionType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                  >
                    {supportedSectionTypes.map((t) => (
                      <option key={t.value} value={t.value} className="bg-dark-900 text-white">
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "الترتيب (Display Order)" : "Display Order"}
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                  />
                </div>
              </div>

              {activeEditorTab === "fields" ? (
                <div className="space-y-4">
                  {/* Bilingual Titles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        العنوان (بالعربية)
                      </label>
                      <input
                        type="text"
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        placeholder="عنوان القسم بالعربية"
                        dir="rtl"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Title (English)
                      </label>
                      <input
                        type="text"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        placeholder="Section title in English"
                        dir="ltr"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Bilingual Subtitles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        العنوان الفرعي (بالعربية)
                      </label>
                      <input
                        type="text"
                        value={subtitleAr}
                        onChange={(e) => setSubtitleAr(e.target.value)}
                        dir="rtl"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Subtitle (English)
                      </label>
                      <input
                        type="text"
                        value={subtitleEn}
                        onChange={(e) => setSubtitleEn(e.target.value)}
                        dir="ltr"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Bilingual Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        الوصف / المحتوى (بالعربية)
                      </label>
                      <textarea
                        rows={3}
                        value={descriptionAr}
                        onChange={(e) => setDescriptionAr(e.target.value)}
                        dir="rtl"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Description / Content (English)
                      </label>
                      <textarea
                        rows={3}
                        value={descriptionEn}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        dir="ltr"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
                      />
                    </div>
                  </div>

                  {/* Media URL */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      {language === "ar" ? "رابط الصورة أو الوسائط (Media / Image URL)" : "Image / Media URL"}
                    </label>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500 font-mono"
                    />
                  </div>

                  {/* Button & Link */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">نص الزر (عربي)</label>
                      <input
                        type="text"
                        value={ctaTextAr}
                        onChange={(e) => setCtaTextAr(e.target.value)}
                        dir="rtl"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Button Text (En)</label>
                      <input
                        type="text"
                        value={ctaTextEn}
                        onChange={(e) => setCtaTextEn(e.target.value)}
                        dir="ltr"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">Button URL</label>
                      <input
                        type="text"
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="#contact"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Configuration JSON (Advanced)
                  </label>
                  <textarea
                    rows={10}
                    value={configJson}
                    onChange={(e) => setConfigJson(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-brand-300 text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isVisibleCheck"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                  className="rounded border-white/10 bg-white/5 text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isVisibleCheck" className="text-xs text-slate-300 font-medium">
                  {language === "ar" ? "ظهور القسم للزوار (Visible)" : "Section is Visible"}
                </label>
              </div>

              </div>

              {/* Pinned Sticky Footer */}
              <div className="modal-sticky-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-ice-pill hover:bg-white/10 text-sky-200 text-xs font-medium"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl luxury-ice-button text-white text-xs font-bold shadow-lg shadow-rose-950/60 hover:scale-105 transition-all"
                >
                  {language === "ar" ? "حفظ القسم" : "Save Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {isPreviewOpen && selectedPage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-8">
          <div className="flex items-center justify-between pb-4 border-b border-white/10 max-w-7xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">Live Preview: {selectedPage.title}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-slate-400 font-mono">
                /{selectedPage.slug}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Language Switch for preview */}
              <div className="flex items-center p-1 rounded-xl bg-white/10">
                <button
                  onClick={() => setPreviewLanguage("ar")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewLanguage === "ar" ? "bg-brand-600 text-white" : "text-slate-400"
                  }`}
                >
                  عربي (RTL)
                </button>
                <button
                  onClick={() => setPreviewLanguage("en")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    previewLanguage === "en" ? "bg-brand-600 text-white" : "text-slate-400"
                  }`}
                >
                  English (LTR)
                </button>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            dir={previewLanguage === "ar" ? "rtl" : "ltr"}
            className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto py-8"
          >
            <SectionRenderer
              sections={sections}
              companyName={selectedPage.companyName || "MTI Enterprise"}
            />
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      {isPageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="modal-glass-container max-w-md w-full rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="ice-gradient-text">{language === "ar" ? "إنشاء صفحة جديدة" : "Create New Corporate Page"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPageModalOpen(false)}
                className="p-1.5 rounded-xl glass-ice-pill text-sky-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form with scrollable body and sticky footer */}
            <form onSubmit={handleCreatePage} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-scroll-body flex-1 p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "الشركة التابعة" : "Company"}
                  </label>
                  <select
                    value={newPageCompanyId}
                    onChange={(e) => setNewPageCompanyId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white text-xs focus:border-sky-400"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#140307] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "عنوان الصفحة" : "Page Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    placeholder="e.g. Overview & Capabilities"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white text-xs focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "معرّف الرابط (Slug)" : "URL Slug"}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPageSlug}
                    onChange={(e) => setNewPageSlug(e.target.value)}
                    placeholder="e.g. capabilities"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white text-xs font-mono focus:border-sky-400"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isHomePageCheck"
                    checked={isHomePage}
                    onChange={(e) => setIsHomePage(e.target.checked)}
                    className="rounded border-sky-400/30 bg-[#140307] text-sky-400 focus:ring-0"
                  />
                  <label htmlFor="isHomePageCheck" className="text-xs text-slate-300 cursor-pointer">
                    {language === "ar" ? "الصفحة الرئيسية للشركة" : "Set as Company Home Page"}
                  </label>
                </div>
              </div>

              {/* Pinned Sticky Footer */}
              <div className="modal-sticky-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-ice-pill hover:bg-white/10 text-sky-200 text-xs"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl luxury-ice-button text-white text-xs font-bold shadow-lg shadow-rose-950/60 hover:scale-105 transition-all"
                >
                  {language === "ar" ? "إنشاء الصفحة" : "Create Page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
