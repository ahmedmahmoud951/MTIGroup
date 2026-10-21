"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Company, UserProfile } from "@/types";
import {
  Building,
  ArrowLeft,
  ArrowRight,
  Save,
  Globe,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Users,
  UserPlus,
  Trash2,
  X,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function AdminCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { language } = useLanguage();

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [desc, setDesc] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Company Admins Management
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserIdToAssign, setSelectedUserIdToAssign] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);

  const fetchCompanyData = async () => {
    setLoading(true);
    const [compRes, adminsRes, usersRes] = await Promise.all([
      api.getAdminCompany(id),
      api.getCompanyAdmins(id),
      api.getAdminUsers(),
    ]);

    if (compRes.success && compRes.data) {
      setCompany(compRes.data);
      setName(compRes.data.name);
      setSlug(compRes.data.slug);
      setShortDesc(compRes.data.shortDescription || "");
      setDesc(compRes.data.description || "");
      setWebsiteUrl(compRes.data.websiteUrl || "");
      setEmail(compRes.data.email || "");
      setPhone(compRes.data.phone || "");
      setIsActive(compRes.data.isActive);
      setDisplayOrder(compRes.data.displayOrder);
    }

    if (adminsRes.success && adminsRes.data) {
      setAdmins(adminsRes.data);
    }

    if (usersRes.success && usersRes.data) {
      setAllUsers(usersRes.data);
      if (usersRes.data.length > 0) {
        setSelectedUserIdToAssign(usersRes.data[0].id);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchCompanyData();
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.updateCompany(id, {
      name,
      slug,
      shortDescription: shortDesc,
      description: desc,
      websiteUrl,
      email,
      phone,
      isActive,
      displayOrder: Number(displayOrder),
    });

    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } else {
      alert(res.message || "Update failed");
    }
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignError(null);
    if (!selectedUserIdToAssign) return;

    const res = await api.assignCompanyAdmin(id, selectedUserIdToAssign);
    if (res.success) {
      setIsAssignModalOpen(false);
      // Reload admins
      const refreshed = await api.getCompanyAdmins(id);
      if (refreshed.success && refreshed.data) setAdmins(refreshed.data);
    } else {
      setAssignError(res.message || "Failed to assign admin");
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (confirm(language === "ar" ? "هل أنت متأكد من إزالة هذا المسؤول من إدارة الشركة؟" : "Remove this administrator from this company?")) {
      const res = await api.removeCompanyAdmin(id, userId);
      if (res.success) {
        setAdmins(admins.filter((a) => a.id !== userId));
      } else {
        alert(res.message || "Failed to remove admin");
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/companies"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
          >
            {language === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{name || "Company Detail"}</h1>
            <p className="text-xs text-slate-400 font-mono">/company/{slug}</p>
          </div>
        </div>

        <Link
          href={`/company/${slug}`}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{language === "ar" ? "معاينة الصفحة العامة" : "View Live Profile"}</span>
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{language === "ar" ? "تم تحديث بيانات الشركة وتحديث الـ Cache والبث اللحظي." : "Company profile updated and changes broadcasted live via SignalR."}</span>
        </div>
      )}

      {/* Main Details Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-brand-400" />
          <span>{language === "ar" ? "البيانات الأساسية للشركة" : "General Company Attributes"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Company Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Slug</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="text-xs">
          <label className="block text-slate-300 font-semibold mb-1">Short Description</label>
          <textarea
            rows={2}
            value={shortDesc}
            onChange={(e) => setShortDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="text-xs">
          <label className="block text-slate-300 font-semibold mb-1">Full Description</label>
          <textarea
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Corporate Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-white focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            id="compActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded bg-dark-800 text-brand-600"
          />
          <label htmlFor="compActive" className="text-slate-300 font-semibold">
            {language === "ar" ? "الشركة نشطة في الدليل المؤسسي" : "Active in Corporate Directory"}
          </label>
        </div>

        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-brand-600/30"
          >
            <Save className="w-4 h-4" />
            <span>{language === "ar" ? "حفظ التعديلات" : "Save Company"}</span>
          </button>
        </div>
      </form>

      {/* Company Admins Management Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <span>{language === "ar" ? "مسؤولو الشركة (Company Admins)" : "Assigned Company Administrators"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === "ar"
                ? "قائمة المشرفين المسموح لهم بإدارة هذه الشركة ومشاريعها وصفحاتها"
                : "Administrators authorized to manage this subsidiary under Server-Side Company Scope"}
            </p>
          </div>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === "ar" ? "تعيين مسؤول حالي (Assign Admin)" : "Assign Existing Admin"}</span>
          </button>
        </div>

        {admins.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-medium">
              {language === "ar"
                ? "لا يوجد مسؤولو شركة مخصصون. المشرف العام (SuperAdmin) فقط يديرها حالياً."
                : "No specific company admins assigned. SuperAdmin manages this entity directly."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 hover:border-brand-500/20 transition-all"
              >
                <div className="space-y-1 truncate">
                  <div className="font-bold text-white text-xs truncate">{admin.fullName}</div>
                  <div className="text-[11px] text-brand-400 font-mono truncate">{admin.username}</div>
                  <div className="text-[10px] text-slate-500 truncate">{admin.email}</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {admin.roles.map((r) => (
                      <span key={r} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-slate-300">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveAdmin(admin.id)}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all shrink-0"
                  title="Remove from company"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assign Admin Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="modal-glass-container max-w-md w-full rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-400" />
                <span className="ice-gradient-text">{language === "ar" ? "تعيين مسؤول للشركة" : "Assign Company Admin"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1.5 rounded-xl glass-ice-pill text-sky-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form with scrollable body and sticky footer */}
            <form onSubmit={handleAssignAdmin} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-scroll-body flex-1 p-6 space-y-4 text-xs">
                {assignError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {assignError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "اختر المسؤول من النظام" : "Select Administrator"}
                  </label>
                  <select
                    value={selectedUserIdToAssign}
                    onChange={(e) => setSelectedUserIdToAssign(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white text-xs focus:border-sky-400"
                  >
                    {allUsers
                      .filter((u) => !admins.some((a) => a.id === u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id} className="bg-[#140307] text-white">
                          {u.fullName} ({u.username}) - {u.roles.join(", ")}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Pinned Sticky Footer */}
              <div className="modal-sticky-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-ice-pill hover:bg-white/10 text-sky-200 text-xs"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl luxury-ice-button text-white text-xs font-bold shadow-lg shadow-rose-950/60 hover:scale-105 transition-all"
                >
                  {language === "ar" ? "تأكيد التعيين" : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
