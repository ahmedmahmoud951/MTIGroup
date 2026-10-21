"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { AuditLogItem } from "@/types";
import { ShieldCheck, RefreshCw, Search, Filter, Calendar, Laptop, User, Tag } from "lucide-react";

export default function AdminAuditLogsPage() {
  const { language } = useLanguage();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    const res = await api.getAdminAuditLogs(150);
    if (res.success && res.data) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.username && log.username.toLowerCase().includes(search.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(search.toLowerCase())) ||
      (log.entityName && log.entityName.toLowerCase().includes(search.toLowerCase())) ||
      (log.ipAddress && log.ipAddress.includes(search));

    const matchesAction = filterAction === "all" || log.action.toLowerCase() === filterAction.toLowerCase();

    return matchesSearch && matchesAction;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
      case "createuser":
      case "createcompany":
      case "createproject":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "update":
      case "updateuser":
      case "updatecompany":
      case "updateproject":
      case "updatepage":
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
      case "delete":
      case "deleteuser":
      case "deletecompany":
      case "deleteproject":
      case "deletepage":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "userlogin":
      case "userlogout":
        return "bg-brand-500/10 text-brand-400 border-brand-500/20";
      case "assignadmin":
      case "removeadmin":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "publish":
      case "unpublish":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-white/5 text-slate-300 border-white/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-brand-400" />
            <span>{language === "ar" ? "سجل الرقابة والعمليات (Audit Logs)" : "Security & Audit Logs"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === "ar"
              ? "تسجيل غير قابل للتعديل لجميع العمليات الحساسة وإجراءات المشرفين عبر النظام"
              : "Immutable audit trail of all administrative events, authentications, and state mutations"}
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>{language === "ar" ? "تحديث السجل" : "Refresh Log"}</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "ar" ? "بحث بالمستخدم، الإجراء، الشركة أو عنوان IP..." : "Search by user, action, company or IP..."}
            className="w-full pl-9 pr-4 rtl:pl-4 rtl:pr-9 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
          />
        </div>

        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-brand-500"
        >
          <option value="all" className="bg-dark-900 text-white">All Actions</option>
          <option value="UserLogin" className="bg-dark-900 text-white">User Login</option>
          <option value="UserLogout" className="bg-dark-900 text-white">User Logout</option>
          <option value="CreateUser" className="bg-dark-900 text-white">Create User</option>
          <option value="UpdateUser" className="bg-dark-900 text-white">Update User</option>
          <option value="DeleteUser" className="bg-dark-900 text-white">Delete User</option>
          <option value="CreateCompany" className="bg-dark-900 text-white">Create Company</option>
          <option value="UpdateCompany" className="bg-dark-900 text-white">Update Company</option>
          <option value="DeleteCompany" className="bg-dark-900 text-white">Delete Company</option>
          <option value="AssignAdmin" className="bg-dark-900 text-white">Assign Admin</option>
          <option value="RemoveAdmin" className="bg-dark-900 text-white">Remove Admin</option>
          <option value="Publish" className="bg-dark-900 text-white">Publish</option>
          <option value="Unpublish" className="bg-dark-900 text-white">Unpublish</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                <th className="p-4 text-start font-semibold">User</th>
                <th className="p-4 text-start font-semibold">Action</th>
                <th className="p-4 text-start font-semibold">Entity</th>
                <th className="p-4 text-start font-semibold">IP Address</th>
                <th className="p-4 text-start font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-500">
                    <div className="w-8 h-8 mx-auto rounded-full border-2 border-brand-500 border-t-transparent animate-spin mb-3" />
                    <span>Loading audit stream...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center font-bold text-slate-300 uppercase">
                          {log.username?.[0] || "U"}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{log.username || "System"}</span>
                          {log.userId && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              {log.userId.substring(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.entityName}</span>
                        {log.entityId && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            ({log.entityId.substring(0, 8)}...)
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-400">
                      {log.ipAddress || "::1"}
                    </td>

                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
