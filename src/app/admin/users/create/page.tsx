"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Company } from "@/types";
import { UserPlus, ArrowLeft, Save, Shield, Building, KeyRound, Mail, User, Phone } from "lucide-react";
import Link from "next/link";

export default function CreateAdminUserPage() {
  const { language, t } = useLanguage();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Admin"]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableRoles = [
    "SuperAdmin",
    "Admin",
    "ContentManager",
    "Editor",
    "MediaManager",
    "Viewer",
  ];

  useEffect(() => {
    api.getAdminCompanies().then((res) => {
      if (res.success && res.data) setCompanies(res.data);
    });
  }, []);

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleToggleCompany = (compId: string) => {
    if (selectedCompanies.includes(compId)) {
      setSelectedCompanies(selectedCompanies.filter((id) => id !== compId));
    } else {
      setSelectedCompanies([...selectedCompanies, compId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      username: username.trim(),
      email: email.trim(),
      password,
      fullName,
      phone,
      roles: selectedRoles,
      assignedCompanyIds: selectedCompanies,
      isActive,
    };

    const res = await api.createAdminUser(payload);
    setLoading(false);

    if (res.success) {
      router.push("/admin/users");
    } else {
      setError(res.message || "Failed to create administrator");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-brand-400" />
              <span>{language === "ar" ? "إنشاء حساب مسؤول جديد" : "Create New Administrator"}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {language === "ar"
                ? "إضافة مسؤول جديد مع تعيين الصلاحيات والشركات المصرح بها"
                : "Add a new administrator with role permissions and assigned company scope"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === "ar" ? "اسم المستخدم (Username)" : "Username"}</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jdoe_admin"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === "ar" ? "البريد الإلكتروني (Email)" : "Email"}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mtigroup.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === "ar" ? "كلمة المرور (Password)" : "Password"}</span>
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              {language === "ar" ? "الاسم الكامل (Full Name)" : "Full Name"}
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === "ar" ? "رقم الهاتف (Phone)" : "Phone"}</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+966 50 000 0000"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
            />
          </div>
        </div>

        {/* Roles Selection */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-brand-400" />
            <span>{language === "ar" ? "الصلاحيات والأدوار (Roles)" : "Assigned Roles"}</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableRoles.map((role) => (
              <label
                key={role}
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-all ${
                  selectedRoles.includes(role)
                    ? "bg-brand-500/20 border-brand-500 text-brand-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => handleToggleRole(role)}
                  className="rounded border-white/10 bg-white/5 text-brand-600 focus:ring-brand-500"
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Companies Assignment (Scope) */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-brand-400" />
            <span>{language === "ar" ? "الشركات المصرح بها (Company Scope)" : "Assigned Companies Scope"}</span>
          </label>
          <p className="text-[11px] text-slate-500">
            {language === "ar"
              ? "المسؤول يستطيع إدارة الشركات المحددة فقط وفقاً لضوابط Server-Side Scope"
              : "Company admins can only access and modify their assigned subsidiaries"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {companies.map((c) => (
              <label
                key={c.id}
                className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 cursor-pointer transition-all ${
                  selectedCompanies.includes(c.id)
                    ? "bg-brand-500/20 border-brand-500 text-brand-300"
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(c.id)}
                  onChange={() => handleToggleCompany(c.id)}
                  className="rounded border-white/10 bg-white/5 text-brand-600 focus:ring-brand-500"
                />
                <span className="truncate">{c.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="userActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded border-white/10 bg-white/5 text-brand-600 focus:ring-brand-500"
          />
          <label htmlFor="userActive" className="text-xs text-slate-300 font-medium cursor-pointer">
            {language === "ar" ? "الحساب مفعل فوراً (Active)" : "Account is Active"}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
          <Link
            href="/admin/users"
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all"
          >
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Creating..." : (language === "ar" ? "حفظ المسؤول" : "Create Administrator")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
