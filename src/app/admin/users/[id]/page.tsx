"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { UserProfile, Company } from "@/types";
import { UserCog, ArrowLeft, Save, Shield, Building, KeyRound, Mail, User, Phone, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

export default function EditAdminUserPage() {
  const { language } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Password Reset Box
  const [newPassword, setNewPassword] = useState("");
  const [resettingPw, setResettingPw] = useState(false);

  const availableRoles = [
    "SuperAdmin",
    "Admin",
    "ContentManager",
    "Editor",
    "MediaManager",
    "Viewer",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [userRes, compRes] = await Promise.all([
        api.getAdminUser(userId),
        api.getAdminCompanies(),
      ]);

      if (compRes.success && compRes.data) setCompanies(compRes.data);

      if (userRes.success && userRes.data) {
        const u = userRes.data;
        setUser(u);
        setUsername(u.username);
        setEmail(u.email);
        setFullName(u.fullName);
        setPhone(u.phone || "");
        setSelectedRoles(u.roles || []);
        setSelectedCompanies(u.allowedCompanyIds || []);
        setIsActive(true);
      } else {
        setError(userRes.message || "User not found");
      }
      setLoading(false);
    };

    fetchData();
  }, [userId]);

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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSaving(true);

    const payload = {
      email: email.trim(),
      fullName,
      phone,
      roles: selectedRoles,
      assignedCompanyIds: selectedCompanies,
      isActive,
    };

    const res = await api.updateAdminUser(userId, payload);
    setSaving(false);

    if (res.success) {
      setSuccessMsg(language === "ar" ? "تم تحديث بيانات المسؤول بنجاح" : "Administrator profile updated successfully.");
    } else {
      setError(res.message || "Failed to update user");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setResettingPw(true);
    const res = await api.resetPassword(userId, newPassword);
    setResettingPw(false);
    if (res.success) {
      setNewPassword("");
      setSuccessMsg(language === "ar" ? "تمت إعادة تعيين كلمة المرور بنجاح" : "Password has been successfully reset.");
    } else {
      setError(res.message || "Failed to reset password");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

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
              <UserCog className="w-6 h-6 text-brand-400" />
              <span>{language === "ar" ? "إدارة حساب المسؤول" : "Manage Administrator"}</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {username} • {fullName}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === "ar" ? "اسم المستخدم (Username)" : "Username"}</span>
            </label>
            <input
              type="text"
              disabled
              value={username}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs cursor-not-allowed font-mono"
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

        {/* Companies Assignment */}
        <div className="space-y-2 pt-4 border-t border-white/5">
          <label className="block text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-brand-400" />
            <span>{language === "ar" ? "الشركات المصرح بها (Company Scope)" : "Assigned Companies Scope"}</span>
          </label>
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
            {language === "ar" ? "الحساب مفعل (Account is Active)" : "Account is Active"}
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : (language === "ar" ? "حفظ التعديلات" : "Save Changes")}</span>
          </button>
        </div>
      </form>

      {/* Password Reset Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-amber-400" />
          <span>{language === "ar" ? "إعادة تعيين كلمة المرور (Reset Password)" : "Reset Password"}</span>
        </h3>
        <p className="text-xs text-slate-400">
          {language === "ar"
            ? "تعيين كلمة مرور جديدة آمنة لهذا المسؤول وتشفيرها فورياً في قاعدة البيانات"
            : "Set a new secure password for this administrator and hash it securely in SQL Server"}
        </p>

        <form onSubmit={handleResetPassword} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New secure password"
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={resettingPw}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {resettingPw ? "Resetting..." : (language === "ar" ? "تحديث كلمة المرور" : "Reset Password")}
          </button>
        </form>
      </div>
    </div>
  );
}
