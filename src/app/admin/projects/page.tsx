"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { Project, Company } from "@/types";
import {
  FolderGit2,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  CheckCircle2,
  Building,
  MapPin
} from "lucide-react";

export default function AdminProjectsPage() {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [projects, setProjects] = useState<Project[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("Completed");
  const [shortDesc, setShortDesc] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [nameAr, setNameAr] = useState("");
  const [descAr, setDescAr] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [projRes, compRes] = await Promise.all([
      api.getAdminProjects(selectedCompanyId || undefined, search || undefined),
      api.getAdminCompanies(),
    ]);

    if (projRes.success && projRes.data) setProjects(projRes.data);
    if (compRes.success && compRes.data) {
      setCompanies(compRes.data);
      if (!companyId && compRes.data.length > 0) {
        setCompanyId(compRes.data[0].id);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedCompanyId, search]);

  const openCreateModal = () => {
    setEditingProject(null);
    setName("");
    setSlug("");
    setClientName("");
    setLocation("");
    setStatus("Completed");
    setShortDesc("");
    setCoverImageUrl("");
    setIsFeatured(false);
    setNameAr("");
    setDescAr("");
    if (companies.length > 0) setCompanyId(companies[0].id);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setSlug(p.slug);
    setCompanyId(p.companyId);
    setClientName(p.clientName || "");
    setLocation(p.location || "");
    setStatus(p.status || "Completed");
    setShortDesc(p.shortDescription || "");
    setCoverImageUrl(p.coverImageUrl || "");
    setIsFeatured(p.isFeatured);
    const arTrans = p.translations?.find((t) => t.languageCode === "ar");
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
      clientName,
      location,
      status,
      shortDescription: shortDesc,
      coverImageUrl,
      isFeatured,
      isActive: true,
      translations: [
        { languageCode: "en", name, shortDescription: shortDesc, location },
        ...(nameAr ? [{ languageCode: "ar", name: nameAr, shortDescription: shortDesc, description: descAr, location }] : []),
      ],
    };

    if (editingProject) {
      await api.updateProject(editingProject.id, payload);
    } else {
      await api.createProject(payload);
    }

    setIsModalOpen(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this project?")) {
      await api.deleteProject(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {language === "ar" ? "إدارة المشاريع والإنجازات" : "Projects & Case Studies"}
          </h1>
          <p className="text-xs text-slate-400">
            {language === "ar" ? "توثيق المشاريع المنفذة مع تحديد الشركة والعميل" : "Record corporate deployments, clients, and project locations"}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>{language === "ar" ? "إضافة مشروع جديد" : "Add Project"}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === "ar" ? "البحث بالاسم أو العميل..." : "Search projects or clients..."}
            className="bg-transparent border-none text-xs text-white focus:outline-none w-full placeholder:text-slate-500"
          />
        </div>

        {/* Company Dropdown filter */}
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

      {/* Projects Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left rtl:text-right">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">{language === "ar" ? "المشروع" : "Project"}</th>
                <th className="p-4">{language === "ar" ? "الشركة التابعة" : "Company"}</th>
                <th className="p-4">{language === "ar" ? "العميل" : "Client"}</th>
                <th className="p-4">{language === "ar" ? "الموقع" : "Location"}</th>
                <th className="p-4">{language === "ar" ? "الحالة" : "Status"}</th>
                <th className="p-4 text-center">{language === "ar" ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">
                    <div>{p.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">/projects/{p.slug}</div>
                  </td>
                  <td className="p-4 text-brand-300 font-medium">
                    {p.companyName || "Company Entity"}
                  </td>
                  <td className="p-4">{p.clientName || "-"}</td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-brand-400" />
                      <span>{p.location || "Saudi Arabia"}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Delete"
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
          <div className="modal-glass-container w-full max-w-xl rounded-3xl">
            {/* Pinned Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#120308]/60 backdrop-blur-md">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="ice-gradient-text">{editingProject ? "Edit Project" : "Add Project"}</span>
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
                    <label className="block text-slate-300 font-semibold mb-1">Project Name (EN)</label>
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
                    <label className="block text-slate-300 font-semibold mb-1">Client Name</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#140307]/80 border border-sky-400/20 text-white focus:outline-none focus:border-sky-400"
                    >
                      <option value="Completed" className="bg-[#140307]">Completed</option>
                      <option value="InProgress" className="bg-[#140307]">In Progress</option>
                      <option value="Planned" className="bg-[#140307]">Planned</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Summary Description</label>
                  <textarea
                    rows={2}
                    value={shortDesc}
                    onChange={(e) => setShortDesc(e.target.value)}
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
