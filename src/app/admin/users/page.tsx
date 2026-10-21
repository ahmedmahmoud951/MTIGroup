"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { UserProfile, Company } from "@/types";
import {
  Users,
  Plus,
  UserPlus,
  Shield,
  Building,
  Edit2,
  Trash2,
  X,
  Save,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  Power
} from "lucide-react";

export default function AdminUsersPage() {
  const { language } = useLanguage();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form Fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["Admin"]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  const availableRoles = [
    "SuperAdmin",
    "Admin",
    "ContentManager",
    "Editor",
    "MediaManager",
    "Viewer",
  ];

  const fetchData = async () => {
    setLoading(true);
    const [userRes, compRes] = await Promise.all([
      api.getAdminUsers(),
      api.getAdminCompanies(),
    ]);

    if (userRes.success && userRes.data) setUsers(userRes.data);
    if (compRes.success && compRes.data) setCompanies(compRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setFullName("");
    setPhone("");
    setSelectedRoles(["Admin"]);
    setSelectedCompanies([]);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserProfile) => {
    setEditingUser(u);
    setUsername(u.username);
    setEmail(u.email);
    setPassword("");
    setFullName(u.fullName);
    setPhone(u.phone || "");
    setSelectedRoles(u.roles || []);
    setSelectedCompanies(u.allowedCompanyIds || []);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleToggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleToggleCompany = (compId: string) => {
    if (selectedCompanies.includes(compId)) {
      setSelectedCompanies(selectedCompanies.filter((c) => c !== compId));
    } else {
      setSelectedCompanies([...selectedCompanies, compId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username,
      email,
      password: password || undefined,
      fullName,
      phone,
      roles: selectedRoles,
      assignedCompanyIds: selectedCompanies,
      isActive,
    };

    if (editingUser) {
      await api.updateUser(editingUser.id, payload);
    } else {
      await api.createUser(payload);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this user?")) {
      await api.deleteUser(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {language === "ar" ? "المستخدمون والصلاحيات" : "Users & Multi-Tenant Access"}
          </h1>
          <p className="text-xs text-slate-400">
            {language === "ar"
              ? "تعيين أدوار SuperAdmin، Admin، ومدراء الشركات مع تحديد نطاق الشركات المصرح بها"
              : "Provision administrative accounts and scope permissions per subsidiary company"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/users/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-all"
          >
            <UserPlus className="w-4 h-4 text-brand-400" />
            <span>{language === "ar" ? "صفحة إنشاء مسؤول" : "Create Page"}</span>
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>{language === "ar" ? "إضافة سريعة" : "Quick Add"}</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Roles</th>
                <th className="p-4">Assigned Scope</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600/30 text-brand-300 flex items-center justify-center font-bold text-xs">
                      {u.fullName?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div>{u.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">@{u.username}</div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles?.map((r) => (
                        <span
                          key={r}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    {u.isSuperAdmin ? (
                      <span className="text-amber-400 font-semibold text-[11px]">
                        ★ All Group Entities
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">
                        {u.allowedCompanyIds?.length || 0} Company Assigned
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-all"
                        title="Dedicated User Management Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                      </Link>
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300"
                        title="Quick Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {u.username !== "admin" && (
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="modal-glass-container w-full max-w-xl rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="ice-gradient-text">{editingUser ? "Edit User & Scopes" : "Create New User"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl glass-ice-pill text-sky-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form wrapping scroll body and sticky footer */}
            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-scroll-body flex-1 p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Username</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingUser}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      {editingUser ? "Password (Leave blank to keep)" : "Password"}
                    </label>
                    <input
                      type="password"
                      required={!editingUser}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white"
                    />
                  </div>
                </div>

                {/* Roles Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">Assign Roles</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableRoles.map((role) => (
                      <label
                        key={role}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                          selectedRoles.includes(role)
                            ? "bg-sky-500/20 border-sky-400 text-white"
                            : "glass-ice-pill border-white/5 text-slate-400"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role)}
                          onChange={() => handleToggleRole(role)}
                          className="hidden"
                        />
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-medium">{role}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Company Tenant Scope Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-2">
                    Assign Companies Scope (SuperAdmin bypasses this automatically)
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {companies.map((c) => (
                      <label
                        key={c.id}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          selectedCompanies.includes(c.id)
                            ? "bg-sky-500/20 border-sky-400 text-white"
                            : "glass-ice-pill border-white/5 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building className="w-3.5 h-3.5 text-sky-400" />
                          <span className="font-semibold text-xs">{c.name}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(c.id)}
                          onChange={() => handleToggleCompany(c.id)}
                          className="rounded bg-[#140307] border-sky-400/40 text-sky-400 focus:ring-0"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pinned Sticky Footer */}
              <div className="modal-sticky-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-ice-pill hover:bg-white/10 text-sky-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl luxury-ice-button text-white font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/60 hover:scale-105 transition-all"
                >
                  <Save className="w-4 h-4 text-sky-200" />
                  <span>Save User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
