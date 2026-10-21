import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MTIGroup | Leading Enterprise Holding & Corporate Platform",
  description: "Official Corporate Platform of MTI Group Holding - Powering digital cloud ecosystems, infrastructure contracting, and regional supply chain logistics.",
  keywords: "MTI Group, Holding, Saudi Arabia, Cloud, AI, Contracting, Logistics, Vision 2030",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable}`}>
      <body className="text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-rose-900 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
