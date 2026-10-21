"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { MediaFile } from "@/types";
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  File,
  HardDrive
} from "lucide-react";

export default function AdminMediaPage() {
  const { language } = useLanguage();

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    const res = await api.getAdminMedia();
    if (res.success && res.data) {
      setFiles(res.data);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    const res = await api.uploadMedia(formData);
    setUploading(false);

    if (res.success) {
      fetchMedia();
    } else {
      alert(res.message || "Upload failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this media asset?")) {
      await api.deleteMedia(id);
      fetchMedia();
    }
  };

  const copyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            {language === "ar" ? "المكتبة والملفات (Media Library)" : "Media Library & Assets"}
          </h1>
          <p className="text-xs text-slate-400">
            {language === "ar"
              ? "رفع وإدارة الصور والملفات عبر IMediaStorageService"
              : "Upload and manage corporate branding assets via IMediaStorageService abstraction"}
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30">
          <UploadCloud className="w-4 h-4" />
          <span>{uploading ? "Uploading..." : language === "ar" ? "رفع ملف جديد" : "Upload Asset"}</span>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            accept="image/*,.pdf,.mp4"
          />
        </label>
      </div>

      {/* Grid of Assets */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-xs glass-panel rounded-2xl border border-white/10">
            <HardDrive className="w-8 h-8 mx-auto mb-2 opacity-40 text-brand-400" />
            <div>No media uploaded yet. Click Upload Asset to add brand logos or covers.</div>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between group"
            >
              <div className="h-28 bg-dark-800 flex items-center justify-center p-2 relative overflow-hidden">
                {file.contentType.startsWith("image/") ? (
                  <img
                    src={file.url}
                    alt={file.altText || file.fileName}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <File className="w-10 h-10 text-brand-400 opacity-60" />
                )}
              </div>
              <div className="p-3 border-t border-white/5 space-y-1">
                <div className="text-[11px] font-semibold text-white truncate" title={file.originalFileName}>
                  {file.originalFileName}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {(file.fileSize / 1024).toFixed(1)} KB
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-white/5">
                  <button
                    onClick={() => copyUrl(file.id, file.url)}
                    className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
                    title="Copy URL"
                  >
                    {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
