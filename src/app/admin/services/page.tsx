"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Service, Company } from "@/types";
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Cloud,
  Cpu,
  ShieldCheck,
  Building,
  Truck,
  HardHat
} from "lucide-react";

export default function AdminServicesPage() {
  const { language } = useLanguage();

  const [services, setServices] = useState<Service[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form Fields
  const [companyId, setCompanyId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Cloud");
  const [nameAr, setNameAr] = useState("");
  const [descAr, setDescAr] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [svcRes, compRes] = await Promise.all([
      api.getAdminServices(selectedCompanyId || undefined, search || undefined),
      api.getAdminCompanies(),
    ]);

    if (svcRes.success && svcRes.data) setServices(svcRes.data);
    if (compRes.success && compRes.data) {
      setCompanies(compRes.data);
      if (!companyId && compRes.data.length > 0) setCompanyId(compRes.data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompanyId, search]);

  const openCreateModal = () => {
    setEditingService(null);
    setName("");
    setSlug("");
    setDescription("");
    setIcon("Cloud");
    setNameAr("");
    setDescAr("");
    if (companies.length > 0) setCompanyId(companies[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setName(s.name);
    setSlug(s.slug);
    setCompanyId(s.companyId);
    setDescription(s.description || "");
    setIcon(s.icon || "Cloud");
    const arTrans = s.translations?.find((t) => t.languageCode === "ar");
    setNameAr(arTrans?.name || "");
    setDescAr(arTrans?.description || "");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      companyId,
      name,
      slug: slug.toLowerCase().replace(/\s+/g, "-"),
      description,
      icon,
      displayOrder: 1,
      isActive: true,
      translations: [
        { languageCode: "en", name, description },
        ...(nameAr ? [{ languageCode: "ar", name: nameAr, description: descAr }] : []),
      ],
    };

    if (editingService) {
      await api.updateService(editingService.id, payload);
    } else {
      await api.createService(payload);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this service?")) {
      await api.deleteService(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {language === "ar" ? "إدارة الخدمات المؤسسية" : "Corporate Services"}
          </h1>
          <p className="text-xs text-slate-400">
            {language === "ar" ? "تحديد الخدمات التخصصية لكل شركة فرعية" : "Define specialized capabilities and icons per subsidiary"}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "ar" ? "إضافة خدمة" : "Add Service"}</span>
        </button>
      </div>

      {/* Filter */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder:text-slate-500"
          />
        </div>

        <select
          value={selectedCompanyId}
          onChange={(e) => setSelectedCompanyId(e.target.value)}
          className="px-3 py-2 rounded-xl bg-dark-800 border border-white/10 text-xs text-white focus:outline-none focus:border-brand-500"
        >
          <option value="">{language === "ar" ? "جميع الشركات" : "All Companies"}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">{language === "ar" ? "الخدمة" : "Service"}</th>
                <th className="p-4">{language === "ar" ? "الشركة" : "Company"}</th>
                <th className="p-4">{language === "ar" ? "الأيقونة" : "Icon"}</th>
                <th className="p-4 text-center">{language === "ar" ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <div>{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-normal">{s.description}</div>
                  </td>
                  <td className="p-4 text-brand-300 font-medium">{s.companyName || "Entity"}</td>
                  <td className="p-4 font-mono text-slate-400">{s.icon || "Cloud"}</td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="modal-glass-container w-full max-w-lg rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="ice-gradient-text">{editingService ? "Edit Service" : "Add Service"}</span>
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
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Company</label>
                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#140307]">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Name (EN)</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Name (AR - العربية)</label>
                    <input
                      type="text"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Slug</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white font-mono focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Icon</label>
                    <select
                      value={icon}
                      onChange={(e) => setIcon(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                    >
                      <option value="Cloud" className="bg-[#140307]">Cloud</option>
                      <option value="Cpu" className="bg-[#140307]">Cpu / AI</option>
                      <option value="ShieldCheck" className="bg-[#140307]">Shield / Security</option>
                      <option value="HardHat" className="bg-[#140307]">HardHat / Contracting</option>
                      <option value="Building2" className="bg-[#140307]">Building2 / Towers</option>
                      <option value="Truck" className="bg-[#140307]">Truck / Logistics</option>
                      <option value="Warehouse" className="bg-[#140307]">Warehouse / Storage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                  />
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
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
