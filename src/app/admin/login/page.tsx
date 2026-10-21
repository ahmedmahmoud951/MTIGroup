"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShieldCheck, Lock, User, ArrowLeft, ArrowRight, AlertCircle, KeyRound, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { language, t } = useLanguage();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        router.push("/admin");
      } else {
        setError(result.error || (language === "ar" ? "اسم المستخدم أو كلمة المرور غير صحيحة." : "Invalid username or password."));
      }
    } catch (err: any) {
      setError(err?.message || (language === "ar" ? "فشل تسجيل الدخول. يرجى التحقق من الاتصال." : "Login failed. Please verify connection."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-rose-50 flex flex-col justify-center items-center px-4 relative overflow-hidden select-none">

      {/* Top back link */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between max-w-5xl mx-auto w-full z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-ice-pill text-xs font-bold text-white hover:border-white/50 transition-all duration-300 shadow-md"
        >
          {language === "ar" ? <ArrowRight className="w-4 h-4 text-rose-300" /> : <ArrowLeft className="w-4 h-4 text-rose-300" />}
          <span>{language === "ar" ? "العودة للبوابة الرئيسية" : "Back to Main Portal"}</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-white font-mono glass-ice-pill px-3 py-1.5 rounded-full shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>MTIGroup CMS v1.0</span>
        </div>
      </div>

      {/* Login Card with Frosted Ice Glass & Burgundy */}
      <div className="w-full max-w-md glass-ice-burgundy p-8 sm:p-10 rounded-3xl relative z-10 shadow-2xl">
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-burgundy-700 via-rose-600 to-amber-500 p-0.5 mx-auto shadow-xl shadow-rose-950/70 group">
            <div className="w-full h-full bg-[#180308] rounded-[14px] flex items-center justify-center font-black text-2xl burgundy-ice-gradient-text tracking-wider border border-white/20">
              MTI
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span className="ice-gradient-text">{t("admin.login.title")}</span>
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </h1>
          <p className="text-xs text-rose-200/80 max-w-xs mx-auto">
            {t("admin.login.subtitle")}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 shadow-lg animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-rose-200/90 mb-2">
              {t("admin.login.username")}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-[#16030d]/85 border border-sky-400/25 text-white text-sm focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-rose-300/40"
                placeholder="admin"
              />
              <User className="w-4 h-4 text-sky-400/70 absolute top-4 right-3.5 rtl:right-auto rtl:left-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-rose-200/90 mb-2">
              {t("admin.login.password")}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-[#16030d]/85 border border-sky-400/25 text-white text-sm focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30 transition-all placeholder:text-rose-300/40 font-mono"
                placeholder="••••••••••••"
              />
              <Lock className="w-4 h-4 text-sky-400/70 absolute top-4 right-3.5 rtl:right-auto rtl:left-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl luxury-ice-button text-white font-extrabold text-sm tracking-wide disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/70"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-rose-100" />
                <span>{t("admin.login.submit")}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Helper Box with Frosted Glass Styling */}
        <div className="mt-8 p-4 rounded-2xl glass-ice-pill text-xs text-rose-200/90 space-y-2.5 shadow-md">
          <div className="font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
            <ShieldCheck className="w-4 h-4 text-rose-300" />
            <span>{language === "ar" ? "بيانات الدخول المصرح بها (SuperAdmin):" : "Authorized SuperAdmin Credentials:"}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-rose-200/80">{language === "ar" ? "اسم المستخدم:" : "Username:"}</span>
            <span className="font-mono font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">admin</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-rose-200/80">{language === "ar" ? "كلمة المرور:" : "Password:"}</span>
            <span className="font-mono font-bold text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/20">admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
