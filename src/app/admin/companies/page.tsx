"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Company } from "@/types";
import { signalRClient } from "@/lib/signalr";
import { getImageUrl } from "@/lib/image";
import {
  Building,
  Plus,
  Search,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  X,
  Save,
  Globe,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ShieldCheck,
  Loader2,
  AlertCircle
} from "lucide-react";

export default function AdminCompaniesPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descAr, setDescAr] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Loading & error feedback states
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [liveNotification, setLiveNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Predefined logo templates
  const presetLogos = [
    { name: "MTI Tech (Cyan Hex)", url: "/images/companies/tech-logo.svg" },
    { name: "MTI Contracting (Tower)", url: "/images/companies/contracting-logo.svg" },
    { name: "MTI Logistics (Wings)", url: "/images/companies/logistics-logo.svg" },
    { name: "MTI Corporate (Diamond)", url: "/images/companies/default-logo.svg" },
  ];

  const fetchCompanies = async () => {
    setLoading(true);
    const res = await api.getAdminCompanies(search);
    if (res.success && res.data) {
      setCompanies(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  // Real-time synchronization via SignalR & window focus
  useEffect(() => {
    signalRClient.init();

    const unsubCreated = signalRClient.subscribe("CompanyCreated", (data) => {
      setLiveNotification(language === "ar" ? `تحديث لحظي: تمت إضافة شركة جديدة (${data.CompanyName || ""})` : `Realtime: New company created (${data.CompanyName || ""})`);
      fetchCompanies();
      setTimeout(() => setLiveNotification(null), 5000);
    });

    const unsubUpdated = signalRClient.subscribe("CompanyUpdated", (data) => {
      setLiveNotification(language === "ar" ? `تحديث لحظي: تم تعديل بيانات الشركة (${data.CompanyName || ""})` : `Realtime: Company updated (${data.CompanyName || ""})`);
      fetchCompanies();
      setTimeout(() => setLiveNotification(null), 5000);
    });

    const unsubDeleted = signalRClient.subscribe("CompanyDeleted", () => {
      setLiveNotification(language === "ar" ? "تحديث لحظي: تم حذف سجل شركة" : "Realtime: Company record deleted");
      fetchCompanies();
      setTimeout(() => setLiveNotification(null), 5000);
    });

    const unsubReconnected = signalRClient.subscribe("Reconnected", () => {
      fetchCompanies();
    });

    const handleFocus = () => {
      fetchCompanies();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
      unsubReconnected();
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [language]);

  const openCreateModal = () => {
    setEditingCompany(null);
    setName("");
    setSlug("");
    setShortDesc("");
    setDesc("");
    setNameAr("");
    setDescAr("");
    setLogoUrl("/images/companies/default-logo.svg");
    setCoverImageUrl("/images/companies/tech-cover.jpg");
    setWebsiteUrl("");
    setEmail("");
    setPhone("");
    setDisplayOrder(companies.length + 1);
    setIsActive(true);
    setUploadError(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Company) => {
    setEditingCompany(c);
    setName(c.name);
    setSlug(c.slug);
    setShortDesc(c.shortDescription || "");
    setDesc(c.description || "");
    const arTrans = c.translations?.find((t) => t.languageCode === "ar");
    setNameAr(arTrans?.name || "");
    setDescAr(arTrans?.description || "");
    setLogoUrl(c.logoUrl || "/images/companies/default-logo.svg");
    setCoverImageUrl(c.coverImageUrl || "");
    setWebsiteUrl(c.websiteUrl || "");
    setEmail(c.email || "");
    setPhone(c.phone || "");
    setDisplayOrder(c.displayOrder);
    setIsActive(c.isActive);
    setUploadError(null);
    setSaveError(null);
    setIsModalOpen(true);
  };

  // Upload file directly to server media storage (/api/v1/admin/media/upload)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setUploadError(language === "ar" ? "حجم الملف يتجاوز الحد المسموح (20 ميجابايت)" : "File size exceeds 20 MB limit");
      return;
    }

    const validExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadError(language === "ar" ? "نوع الملف غير مدعوم. الصيغ المدعومة: PNG, JPG, WebP, SVG" : "Unsupported format. Allowed: PNG, JPG, WebP, SVG");
      return;
    }

    try {
      setIsUploadingLogo(true);
      setUploadError(null);

      const res = await api.uploadMedia(file, editingCompany?.id);
      if (res.success && res.data?.url) {
        setLogoUrl(res.data.url);
      } else {
        setUploadError(res.message || (language === "ar" ? "فشل رفع الصورة إلى الخادم" : "Failed to upload image to server"));
      }
    } catch (err: any) {
      setUploadError(err?.message || (language === "ar" ? "خطأ في عملية الرفع" : "Upload error"));
    } finally {
      setIsUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    // Safeguard against raw oversized Base64 that exceeds DB column length
    if (logoUrl.startsWith("data:") && logoUrl.length > 500) {
      setSaveError(
        language === "ar"
          ? "لا يمكن حفظ صورة Base64 ضخمة كشعار مباشر. يرجى الضغط على زر 'رفع شعار جديد' لرفع الملف للخادم أو اختيار شعار من النماذج الجاهزة."
          : "Cannot save raw Base64 data directly. Please use 'Upload New Logo' button to save to server or select a preset."
      );
      return;
    }

    setIsSaving(true);

    const payload: any = {
      name,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      shortDescription: shortDesc,
      description: desc,
      logoUrl: logoUrl.trim(),
      coverImageUrl: coverImageUrl.trim(),
      websiteUrl,
      email,
      phone,
      displayOrder: Number(displayOrder),
      isActive,
      translations: [
        { languageCode: "en", name, shortDescription: shortDesc, description: desc },
        ...(nameAr ? [{ languageCode: "ar", name: nameAr, shortDescription: shortDesc, description: descAr }] : []),
      ],
    };

    try {
      const res = editingCompany
        ? await api.updateCompany(editingCompany.id, payload)
        : await api.createCompany(payload);

      if (res.success) {
        setIsModalOpen(false);
        await fetchCompanies();
        // Broadcast in real-time across the app & other open tabs
        signalRClient.notify(editingCompany ? "CompanyUpdated" : "CompanyCreated", {
          CompanyId: editingCompany?.id || (res.data as any)?.id,
          CompanyName: nameAr || name,
          Slug: slug,
        });
      } else {
        setSaveError(res.message || (language === "ar" ? "فشل في حفظ بيانات الشركة" : "Failed to save company"));
      }
    } catch (err: any) {
      setSaveError(err?.message || (language === "ar" ? "خطأ أثناء الاتصال بالخادم" : "Server communication error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t("admin.companies.deleteConfirm"))) {
      await api.deleteCompany(id);
      fetchCompanies();
      signalRClient.notify("CompanyDeleted", { CompanyId: id });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span className="ice-gradient-text">{t("admin.companies.title")}</span>
            <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-sky-200/70 mt-1">
            {t("admin.companies.subtitle")}
          </p>
        </div>

        {user?.isSuperAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl luxury-ice-button text-white text-xs font-black transition-all hover:scale-105 shadow-lg shadow-rose-950/70 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-200" />
            <span>{t("admin.companies.add")}</span>
          </button>
        )}
      </div>

      {/* Live SignalR Update Notification Banner */}
      {liveNotification && (
        <div className="p-3.5 px-5 rounded-2xl bg-sky-950/80 border border-sky-400/60 shadow-[0_0_20px_rgba(56,189,248,0.3)] flex items-center justify-between text-xs font-bold text-sky-100 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
            <span>{liveNotification}</span>
          </div>
          <button
            onClick={() => setLiveNotification(null)}
            className="text-sky-300 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar with Glacial Ice Styling */}
      <div className="glass-ice p-4 rounded-2xl border border-sky-400/30 flex items-center gap-3 shadow-lg shadow-rose-950/30">
        <Search className="w-4 h-4 text-sky-300" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("admin.companies.search")}
          className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder:text-sky-300/40"
        />
      </div>

      {/* Companies Table in Glow-Edge Card */}
      <div className="glass-ice-card glow-edge-card rounded-3xl border border-sky-400/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-sky-950/40 border-b border-sky-400/20 text-sky-200/80 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">{t("admin.companies.th.company")}</th>
                <th className="p-4">{t("admin.companies.th.slug")}</th>
                <th className="p-4">{t("admin.companies.th.order")}</th>
                <th className="p-4">{t("admin.companies.th.projects")}</th>
                <th className="p-4">{t("admin.companies.th.status")}</th>
                <th className="p-4 text-center">{t("admin.companies.th.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-rose-100/90 font-medium">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-sky-400/5 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-3.5">
                    {/* Glowing Logo Avatar */}
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400/30 via-rose-600/30 to-burgundy-950/80 p-0.5 border border-sky-300/40 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                      <div className="w-full h-full bg-[#100307]/90 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                        {c.logoUrl ? (
                          <img
                            src={getImageUrl(c.logoUrl)}
                            alt={c.name}
                            className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fallback = e.currentTarget.nextElementSibling;
                              if (fallback) (fallback as HTMLElement).style.display = "block";
                            }}
                          />
                        ) : null}
                        <span
                          style={{ display: c.logoUrl ? "none" : "block" }}
                          className="font-black text-xs ice-cyan-gradient-text"
                        >
                          {c.name.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-black text-white hover:text-sky-200 transition-colors">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-sky-200/60 font-mono font-normal">
                        {c.email || "contact@mtigroup.com"}
                      </div>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-sky-300/80">/company/{c.slug}</td>
                  <td className="p-4 font-mono font-bold text-white">{c.displayOrder}</td>
                  <td className="p-4 font-bold text-sky-300">{c.projectsCount || 0}</td>
                  <td className="p-4">
                    {c.isActive ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                        {t("status.active")}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-400/30">
                        {t("status.inactive")}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/company/${c.slug}`}
                        className="p-2 rounded-xl glass-ice-pill hover:bg-white/15 text-sky-300 hover:text-white transition-all shadow-sm"
                        title={t("common.viewPublicPage")}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(c)}
                        className="p-2 rounded-xl glass-ice-pill hover:bg-sky-400/20 text-sky-200 hover:text-white border border-sky-400/30 transition-all shadow-sm cursor-pointer"
                        title={t("edit")}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {user?.isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all shadow-sm cursor-pointer"
                          title={t("delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Company Modal with Logo Manager */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="modal-glass-container w-full max-w-2xl rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 sm:px-7 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span className="ice-gradient-text">
                  {editingCompany ? t("admin.companies.edit") : t("admin.companies.add")}
                </span>
                <Sparkles className="w-4 h-4 text-sky-400" />
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl glass-ice-pill text-sky-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form wrapping scrollable body and sticky pinned footer */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="modal-scroll-body flex-1 p-6 sm:p-7 space-y-5 text-xs">
                {/* Brand Logo & Asset Upload Section */}
                <div className="p-4 rounded-2xl glass-ice border border-sky-400/30 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <span>{t("admin.companies.logo")}</span>
                    </label>
                    <span className="text-[10px] text-sky-300/80 font-mono">SVG / PNG / JPG / WebP</span>
                  </div>

                  <p className="text-[11px] text-rose-200/80">
                    {t("admin.companies.logoHelp")}
                  </p>

                  {/* Preset Logo Selection Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-sky-300/80 block">
                      {t("admin.companies.logoPresets")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {presetLogos.map((preset, pIdx) => (
                        <button
                          type="button"
                          key={pIdx}
                          onClick={() => setLogoUrl(preset.url)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                            logoUrl === preset.url
                              ? "bg-sky-500/20 text-white border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                              : "glass-ice-pill text-sky-200/70 border-white/10 hover:border-sky-400/40"
                          }`}
                        >
                          <img src={preset.url} alt="" className="w-3.5 h-3.5 object-contain" />
                          <span>{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Logo Preview & File Uploader */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                    {/* Live Glowing Logo Box - Exact Logo Pedestal Preview */}
                    <div className="logo-pedestal relative">
                      {isUploadingLogo ? (
                        <div className="flex flex-col items-center justify-center gap-1 text-sky-300">
                          <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                          <span className="text-[10px] font-bold">{language === "ar" ? "جاري الرفع..." : "Uploading..."}</span>
                        </div>
                      ) : logoUrl ? (
                        <img
                          src={getImageUrl(logoUrl)}
                          alt="Logo Preview"
                          className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(56,189,248,0.7)]"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <span className="font-bold text-xs text-sky-300">Logo</span>
                      )}
                    </div>

                    {/* Upload Button & URL Input */}
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          disabled={isUploadingLogo}
                          onClick={() => fileInputRef.current?.click()}
                          className={`px-4 py-2 rounded-xl luxury-ice-button text-white border border-sky-300/40 font-bold flex items-center gap-2 transition-all shadow-md shadow-sky-950/40 ${
                            isUploadingLogo ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:scale-105"
                          }`}
                        >
                          {isUploadingLogo ? (
                            <Loader2 className="w-3.5 h-3.5 text-sky-200 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5 text-sky-200" />
                          )}
                          <span>
                            {isUploadingLogo
                              ? (language === "ar" ? "جاري رفع الشعار..." : "Uploading Logo...")
                              : t("admin.companies.uploadLogo")}
                          </span>
                        </button>
                        
                        {logoUrl ? (
                          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-950/80 border border-sky-400/40 text-sky-100 text-[11px] font-mono">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                            <span className="truncate max-w-[220px]">
                              {logoUrl.startsWith("/uploads/")
                                ? (language === "ar" ? "تم الرفع على السيرفر" : "Uploaded to Server")
                                : logoUrl.startsWith("data:")
                                ? (language === "ar" ? "ملف صورة محلي" : "Local Image")
                                : logoUrl}
                            </span>
                            <button
                              type="button"
                              onClick={() => setLogoUrl("")}
                              className="text-rose-300 hover:text-white p-0.5 ml-1 cursor-pointer font-bold"
                              title={language === "ar" ? "مسح اللوجو" : "Remove"}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-sky-200/70">
                            {language === "ar" ? "لم يتم تحديد لوجو بعد" : "No logo selected yet"}
                          </span>
                        )}
                      </div>

                      {uploadError && (
                        <div className="text-xs text-rose-300 font-bold bg-rose-950/80 border border-rose-500/40 p-2.5 rounded-xl flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{uploadError}</span>
                        </div>
                      )}

                      {/* Explicit Logo URL Field with high contrast text */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-bold text-sky-200 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-sky-400" />
                            <span>{language === "ar" ? "رابط أو مسار الشعار المباشر:" : "Direct Logo URL / Path:"}</span>
                          </label>
                          <span className="text-[10px] text-sky-300/80 font-mono">/images/companies/... or https://</span>
                        </div>
                        <input
                          type="text"
                          dir="ltr"
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="e.g. /images/companies/mti-tech.svg or https://..."
                          className="w-full px-4 py-2.5 rounded-xl bg-[#180410] border-2 border-sky-400/60 !text-sky-100 font-mono text-xs font-bold focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/40 shadow-inner placeholder:text-sky-300/40 text-left selection:bg-sky-500 selection:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company Names: Arabic & English */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.nameEn")} *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"
                      placeholder="MTI Technology"
                    />
                  </div>
                  <div>
                    <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.nameAr")}</label>
                    <input
                      type="text"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"
                      placeholder="إم تي آي للتكنولوجيا والحلول السحابية"
                    />
                  </div>
                </div>

                {/* Slug & Display Order */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.slugField")} *</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white font-mono focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"
                      placeholder="mti-technology"
                    />
                  </div>
                  <div>
                    <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.order")}</label>
                    <input
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20 font-mono"
                    />
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.shortDescEn")}</label>
                  <textarea
                    rows={2}
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"
                  />
                </div>

                <div>
                  <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.descAr")}</label>
                  <textarea
                    rows={3}
                    value={descAr}
                    onChange={(e) => setDescAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/20"
                  />
                </div>

                {/* Contact Information & URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.website")}</label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.email")}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sky-200 font-bold mb-1.5">{t("admin.companies.phone")}</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-300 font-mono"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded bg-[#140307] border-sky-400/30 text-sky-400 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-white font-bold cursor-pointer">
                    {t("admin.companies.active")}
                  </label>
                </div>
              </div>

              {/* Save Error Alert Banner */}
              {saveError && (
                <div className="px-6 py-2.5 bg-rose-950/90 border-t border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {/* Pinned Sticky Action Footer - ALWAYS 100% VISIBLE */}
              <div className="modal-sticky-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl glass-ice-pill hover:bg-white/10 text-sky-200 font-bold cursor-pointer transition-all disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingLogo}
                  className={`px-7 py-2.5 rounded-xl luxury-ice-button text-white font-black flex items-center gap-2 shadow-lg shadow-rose-950/60 transition-all ${
                    isSaving || isUploadingLogo
                      ? "opacity-60 cursor-not-allowed"
                      : "cursor-pointer hover:scale-105"
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 text-sky-200 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-sky-200" />
                  )}
                  <span>
                    {isSaving
                      ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                      : t("save")}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
