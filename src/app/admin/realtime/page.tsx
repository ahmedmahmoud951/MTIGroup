"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { api } from "@/lib/api";
import { signalRClient } from "@/lib/signalr";
import { RealtimeConfig } from "@/types";
import {
  Radio,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Database,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function AdminRealtimePage() {
  const { language } = useLanguage();

  const [config, setConfig] = useState<RealtimeConfig | null>(null);
  const [status, setStatus] = useState<string>("connecting");
  const [eventsLog, setEventsLog] = useState<Array<{ name: string; time: string; payload: any }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    setLoading(true);
    const conf = await api.getRealtimeConfig();
    setConfig(conf);
    setStatus(signalRClient.status);
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();

    const registeredEvents = [
      "CompanyCreated",
      "CompanyUpdated",
      "CompanyDeleted",
      "ProjectCreated",
      "ProjectUpdated",
      "ServiceUpdated",
      "PageUpdated",
      "PageSectionUpdated",
      "NotificationCreated",
      "SettingsUpdated"
    ];

    const unsubs = registeredEvents.map((evt) =>
      signalRClient.subscribe(evt, (data) => {
        setEventsLog((prev) => [
          { name: evt, time: new Date().toLocaleTimeString(), payload: data },
          ...prev.slice(0, 19),
        ]);
      })
    );

    const interval = setInterval(() => {
      setStatus(signalRClient.status);
    }, 3000);

    return () => {
      unsubs.forEach((u) => u());
      clearInterval(interval);
    };
  }, []);

  const handleReconnect = async () => {
    setStatus("connecting");
    await signalRClient.init();
    setStatus(signalRClient.status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-brand-400 animate-pulse" />
            <span>{language === "ar" ? "مراقبة البث الحي (SignalR Live)" : "Realtime SignalR Hub Monitor"}</span>
          </h1>
          <p className="text-xs text-slate-400">
            {language === "ar"
              ? "قراءة إعدادات SignalR ديناميكياً من جدول SQL Server بدون أي رابط Hardcoded"
              : "Database-driven SignalR hub configuration dynamically fetched from SQL Server"}
          </p>
        </div>

        <button
          onClick={handleReconnect}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-semibold border border-white/10 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{language === "ar" ? "إعادة مزامنة الاتصال" : "Reconnect"}</span>
        </button>
      </div>

      {/* SQL Driven Config Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-bold text-white">
              SQL Server Persisted Configuration
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Endpoint: GET /api/v1/config/realtime
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-dark-800 border border-white/5 space-y-1">
            <span className="text-slate-400 block text-[10px]">Hub Name</span>
            <span className="font-mono font-bold text-white text-sm">{config?.hubName || "cms"}</span>
          </div>

          <div className="p-4 rounded-xl bg-dark-800 border border-white/5 space-y-1">
            <span className="text-slate-400 block text-[10px]">Resolved Gateway Full URL</span>
            <span className="font-mono text-brand-300 truncate block text-[11px]">{config?.fullUrl || "Loading..."}</span>
          </div>

          <div className="p-4 rounded-xl bg-dark-800 border border-white/5 space-y-1">
            <span className="text-slate-400 block text-[10px]">Connection State</span>
            <span className="flex items-center gap-1.5 font-bold text-sm text-emerald-400 capitalize">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Live Event Stream */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Incoming Live Events Console</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {eventsLog.length} events logged
          </span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {eventsLog.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono">
              Listening for events on /hubs/cms... Try creating or editing a company, project, or section in another tab.
            </div>
          ) : (
            eventsLog.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-dark-800 border border-white/5 flex items-start justify-between gap-4 text-xs animate-fade-in"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-brand-300 font-mono">{item.name}</span>
                    <span className="text-[10px] text-slate-500">{item.time}</span>
                  </div>
                  <pre className="mt-1 text-[10px] text-slate-400 font-mono bg-dark-900 p-2 rounded max-w-xl overflow-x-auto">
                    {JSON.stringify(item.payload, null, 2)}
                  </pre>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
