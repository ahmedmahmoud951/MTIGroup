"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { NavigationItem, Company } from "@/types";
import { Compass, Plus, Edit2, Trash2, Save, X, ExternalLink, Globe } from "lucide-react";

export default function AdminNavigationPage() {
  const { language } = useLanguage();
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isExternal, setIsExternal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const compRes = await api.getAdminCompanies();
    if (compRes.success && compRes.data) {
      setCompanies(compRes.data);
    }

    // Load navigation items
    const res = await api.getPublicCompanyNavigation("mti-holding");
    if (res.success && res.data) {
      setNavItems(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle("");
    setUrl("/");
    setDisplayOrder(navItems.length + 1);
    setIsExternal(false);
    setIsVisible(true);
    setIsModalOpen(true);
  };

  const openEditModal = (item: NavigationItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setUrl(item.url);
    setDisplayOrder(item.displayOrder);
    setIsExternal(item.isExternal);
    setIsVisible(item.isVisible);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    // Refresh or update local state
    if (editingItem) {
      setNavItems(navItems.map(i => i.id === editingItem.id ? { ...i, title, url, displayOrder, isExternal, isVisible } : i));
    } else {
      setNavItems([...navItems, {
        id: Math.random().toString(),
        title,
        url,
        displayOrder,
        isExternal,
        isVisible,
        children: []
      }]);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this navigation link?")) {
      setNavItems(navItems.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-400" />
            <span>{language === "ar" ? "إدارة القوائم والتنقل (Navigation)" : "Navigation & Menus"}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {language === "ar"
              ? "تخصيص روابط القوائم الرئيسية وروابط التذييل للموقع والشركات"
              : "Configure header navigation and footer quick links across corporate sites"}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "ar" ? "إضافة رابط جديد" : "Add Nav Link"}</span>
        </button>
      </div>

      {/* Navigation Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400">
                <th className="p-4 text-start font-semibold">Title</th>
                <th className="p-4 text-start font-semibold">URL Destination</th>
                <th className="p-4 text-start font-semibold">Type</th>
                <th className="p-4 text-start font-semibold">Order</th>
                <th className="p-4 text-start font-semibold">Status</th>
                <th className="p-4 text-end font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {navItems.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-bold text-white">
                    {item.title}
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    {item.url}
                  </td>
                  <td className="p-4">
                    {item.isExternal ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400">
                        <ExternalLink className="w-3 h-3" />
                        <span>External</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-brand-500/10 text-brand-300">
                        <Globe className="w-3 h-3" />
                        <span>Internal</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono text-slate-300">
                    #{item.displayOrder}
                  </td>
                  <td className="p-4">
                    {item.isVisible ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                        Visible
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400">
                        Hidden
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-end">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="modal-glass-container max-w-md w-full rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="ice-gradient-text">
                  {editingItem 
                    ? (language === "ar" ? "تعديل عنصر التنقل" : "Edit Nav Item")
                    : (language === "ar" ? "إضافة عنصر تنقل جديد" : "Add Nav Item")}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl glass-ice-pill text-sky-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="modal-scroll-body flex-1 p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "عنوان الرابط" : "Title"}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={language === "ar" ? "مثال: الحوكمة المؤسسية" : "e.g. Corporate Governance"}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white text-xs focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "رابط الوجهة" : "Destination URL"}
                  </label>
                  <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="/#about or https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white text-xs font-mono focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {language === "ar" ? "الترتيب" : "Display Order"}
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white text-xs focus:border-sky-400"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExternal}
                      onChange={(e) => setIsExternal(e.target.checked)}
                      className="rounded border-sky-400/30 bg-[#140307] text-sky-400 focus:ring-0"
                    />
                    <span>{language === "ar" ? "فتح في نافذة جديدة" : "Open in New Tab"}</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="rounded border-sky-400/30 bg-[#140307] text-sky-400 focus:ring-0"
                    />
                    <span>{language === "ar" ? "ظاهر في القائمة" : "Visible"}</span>
                  </label>
                </div>
              </div>

              {/* Pinned Sticky Footer */}
              <div className="modal-sticky-footer px-6 py-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl glass-ice-pill hover:bg-white/10 text-sky-200 text-xs"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl luxury-ice-button text-white text-xs font-bold shadow-lg shadow-rose-950/60 hover:scale-105 transition-all"
                >
                  {language === "ar" ? "حفظ الرابط" : "Save Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
