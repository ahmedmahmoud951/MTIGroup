"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Company } from "@/types";
import { getImageUrl } from "@/lib/image";
import { signalRClient } from "@/lib/signalr";
import {
  Sparkles,
  ArrowUpRight,
  Cpu,
  HardHat,
  Truck,
  Building2,
  ExternalLink,
  RotateCw,
  Compass,
  Crown,
  CheckCircle2,
  Layers,
  Zap
} from "lucide-react";

interface OrbitalConstellationProps {
  companies: Company[];
  groupLogoUrl?: string;
  groupName?: string;
  language?: string;
}

export default function OrbitalConstellation({
  companies,
  groupLogoUrl = "/images/companies/mti-holding.png",
  groupName = "MTI Group Holding",
  language = "ar",
}: OrbitalConstellationProps) {
  const isAr = language === "ar";
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [hoveredCompanyId, setHoveredCompanyId] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [realtimePulse, setRealtimePulse] = useState(false);

  // Gentle auto rotation
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.25) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Subscribe to real-time events for instant visual feedback on addition/update
  useEffect(() => {
    const triggerPulse = () => {
      setRealtimePulse(true);
      setTimeout(() => setRealtimePulse(false), 2500);
    };

    const unsubCreated = signalRClient.subscribe("CompanyCreated", triggerPulse);
    const unsubUpdated = signalRClient.subscribe("CompanyUpdated", triggerPulse);
    const unsubDeleted = signalRClient.subscribe("CompanyDeleted", triggerPulse);

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, []);

  // Categorize company sector
  const getCompanySector = (company: Company) => {
    const text = ((company.slug || "") + " " + (company.name || "")).toLowerCase();
    if (text.includes("tech") || text.includes("تكنولوجيا") || text.includes("cloud") || text.includes("سحاب")) {
      return {
        label: isAr ? "التحول الرقمي والسحابي" : "Cloud & AI Tech",
        icon: Cpu,
        color: "#38bdf8",
        glow: "rgba(56, 189, 248, 0.5)",
        border: "border-sky-400",
        bg: "bg-sky-500/15"
      };
    }
    if (text.includes("contract") || text.includes("build") || text.includes("إنشاء") || text.includes("مقاولات") || text.includes("هندسة")) {
      return {
        label: isAr ? "المقاولات والإنشاءات الكبرى" : "Civil Mega Contracting",
        icon: HardHat,
        color: "#f59e0b",
        glow: "rgba(245, 158, 11, 0.5)",
        border: "border-amber-400",
        bg: "bg-amber-500/15"
      };
    }
    if (text.includes("logistic") || text.includes("supply") || text.includes("لوجست") || text.includes("إمداد") || text.includes("نقل")) {
      return {
        label: isAr ? "سلاسل الإمداد والخدمات اللوجستية" : "Smart Logistics & Supply",
        icon: Truck,
        color: "#10b981",
        glow: "rgba(16, 185, 129, 0.5)",
        border: "border-emerald-400",
        bg: "bg-emerald-500/15"
      };
    }
    return {
      label: isAr ? "الاستثمار وإدارة الأصول" : "Strategic Asset Management",
      icon: Building2,
      color: "#f43f5e",
      glow: "rgba(244, 63, 94, 0.5)",
      border: "border-rose-400",
      bg: "bg-rose-500/15"
    };
  };

  // SVG Coordinate Space: 1000 x 1000 with Center at (500, 500)
  const SVG_SIZE = 1000;
  const CENTER = SVG_SIZE / 2;
  
  // Radius dynamically adapts based on number of companies to maximize space
  const ORBIT_RADIUS = useMemo(() => {
    const total = companies.length;
    if (total <= 3) return 345;
    if (total <= 6) return 375;
    return 400;
  }, [companies.length]);

  // Mathematical distribution of companies along the circle in real-time
  const nodePositions = useMemo(() => {
    const total = companies.length;
    if (total === 0) return [];

    return companies.map((company, index) => {
      // Angle starting from top (-90 deg) and stepping evenly based on dynamic N
      const baseAngleDeg = (360 / total) * index - 90;
      const currentAngleDeg = (baseAngleDeg + rotationAngle) % 360;
      const angleRad = (currentAngleDeg * Math.PI) / 180;

      const x = CENTER + ORBIT_RADIUS * Math.cos(angleRad);
      const y = CENTER + ORBIT_RADIUS * Math.sin(angleRad);

      return {
        company,
        x,
        y,
        angleDeg: currentAngleDeg,
        sector: getCompanySector(company)
      };
    });
  }, [companies, rotationAngle, ORBIT_RADIUS, isAr]);

  if (companies.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Top Quick Status Bar */}
      <div className="w-full max-w-5xl lg:max-w-6xl flex items-center justify-between gap-3 mb-6 px-6 py-3.5 rounded-2xl glass-ice border border-sky-400/40">
        <div className="flex items-center gap-2.5">
          <div className={`w-3 h-3 rounded-full bg-sky-400 ${realtimePulse ? "animate-ping bg-emerald-400" : "animate-core-beacon"}`} />
          <span className="text-xs sm:text-sm font-black text-white tracking-wide">
            {isAr ? "المنظومة المدارية لمجموعة MTI القابضة" : "MTI Group Orbital Ecosystem"}
          </span>
          <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40 font-mono font-bold">
            {companies.length} {isAr ? "شركات تدور حول المركز لحظياً" : "Subsidiaries in Real-Time Orbit"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              autoRotate
                ? "bg-sky-500/30 text-white border-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]"
                : "bg-sky-950/40 text-sky-200/75 border-sky-400/20 hover:text-white hover:border-sky-400/40"
            }`}
            title={isAr ? "تشغيل/إيقاف الدوران المداري" : "Toggle Orbit Rotation"}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoRotate ? "animate-spin" : ""}`} />
            <span className="text-[11px]">{isAr ? (autoRotate ? "دوران نشط" : "دوران تلقائي") : (autoRotate ? "Rotating" : "Auto Orbit")}</span>
          </button>

          <button
            onClick={() => setRotationAngle(0)}
            className="p-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-400/20 hover:border-sky-400/40 transition-all cursor-pointer"
            title={isAr ? "إعادة ضبط التوجيه" : "Reset Alignment"}
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ==============================================================
          THE GRAND EXPANDED CIRCULAR ORBITAL STAGE
          ============================================================== */}
      <div className="w-full max-w-5xl lg:max-w-6xl relative min-h-[820px] md:min-h-[900px] lg:min-h-[960px] aspect-square flex items-center justify-center select-none overflow-visible rounded-3xl glass-ice-burgundy border-2 border-sky-400/40 p-4 sm:p-8 shadow-2xl">
        {/* Luminous Glacial Ice & Velvet Space Nebula Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-950/30 via-[#220516]/85 to-[#0b101c]/95 pointer-events-none rounded-3xl" />

        {/* Multi-layered Pulsing Orbital Astrolabe Nebulae */}
        <div className="absolute w-[620px] h-[620px] rounded-full border border-sky-400/25 animate-orbital-wave pointer-events-none" />
        <div className="absolute w-[800px] h-[800px] rounded-full border border-rose-500/20 pointer-events-none" />
        {realtimePulse && (
          <div className="absolute inset-4 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none" />
        )}

        {/* SVG Orbital Geometry, Trajectories & Distinctive Outward Arrows */}
        <svg
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <defs>
            {/* Bold Outward Arrowhead - Cyan */}
            <marker
              id="arrow-outward-cyan"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="11"
              markerHeight="11"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 11 6 L 1 10 L 3.5 6 Z" fill="#38bdf8" />
            </marker>

            {/* Bold Outward Arrowhead - Amber */}
            <marker
              id="arrow-outward-amber"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="11"
              markerHeight="11"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 11 6 L 1 10 L 3.5 6 Z" fill="#f59e0b" />
            </marker>

            {/* Bold Outward Arrowhead - Emerald */}
            <marker
              id="arrow-outward-emerald"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="11"
              markerHeight="11"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 11 6 L 1 10 L 3.5 6 Z" fill="#10b981" />
            </marker>

            {/* Bold Outward Arrowhead - Rose */}
            <marker
              id="arrow-outward-rose"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="11"
              markerHeight="11"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 11 6 L 1 10 L 3.5 6 Z" fill="#f43f5e" />
            </marker>

            {/* Default Frosted Ice Arrowhead */}
            <marker
              id="arrow-outward-ice"
              viewBox="0 0 12 12"
              refX="10"
              refY="6"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 1 2 L 11 6 L 1 10 L 3 6 Z" fill="rgba(186, 230, 253, 0.75)" />
            </marker>

            {/* Radiant Center Aura */}
            <radialGradient id="epicCenterAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.22" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Central Radiance Aura */}
          <circle cx={CENTER} cy={CENTER} r="260" fill="url(#epicCenterAura)" />

          {/* Main Orbital Track Guide (Dashed Cyan-Ice) */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={ORBIT_RADIUS}
            stroke="rgba(56, 189, 248, 0.4)"
            strokeWidth="2"
            strokeDasharray="12 10"
            fill="none"
          />

          {/* Inner & Outer Subtle Astrolabe Circles */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={ORBIT_RADIUS - 65}
            stroke="rgba(244, 63, 94, 0.22)"
            strokeWidth="1.2"
            fill="none"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={ORBIT_RADIUS + 65}
            stroke="rgba(56, 189, 248, 0.2)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            fill="none"
          />

          {/* Distinctive Directional Outward Arrows & Glowing Energy Beams */}
          {nodePositions.map(({ company, x, y, sector, angleDeg }) => {
            const isSelected = selectedCompanyId === company.id;
            const isHovered = hoveredCompanyId === company.id;
            const isActive = isSelected || isHovered;

            // Geometry vector from Center Core (radius ~115px) to Subsidiary Node (radius ~65px)
            const dx = x - CENTER;
            const dy = y - CENTER;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const startX = CENTER + (dx / dist) * 115;
            const startY = CENTER + (dy / dist) * 115;
            const endX = x - (dx / dist) * 65;
            const endY = y - (dy / dist) * 65;

            // Select matching outward arrowhead marker
            let markerId = "arrow-outward-ice";
            if (sector.color === "#38bdf8") markerId = "arrow-outward-cyan";
            else if (sector.color === "#f59e0b") markerId = "arrow-outward-amber";
            else if (sector.color === "#10b981") markerId = "arrow-outward-emerald";
            else if (sector.color === "#f43f5e") markerId = "arrow-outward-rose";

            // Positions along ray for 3 distinctive outward-pointing directional chevrons (> > >)
            const chevronFractions = [0.32, 0.58, 0.82];

            return (
              <g key={`ray-${company.id}`}>
                {/* 1. Origin Emitter Pulse Dot at Core Border */}
                <circle
                  cx={startX}
                  cy={startY}
                  r={isActive ? "5.5" : "4"}
                  fill={sector.color}
                  filter="drop-shadow(0 0 6px currentColor)"
                  opacity={isActive ? 1 : 0.75}
                />

                {/* 2. Soft Ambient Laser Glow Line */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={sector.color}
                  strokeWidth={isActive ? "7" : "3.5"}
                  strokeOpacity={isActive ? "0.38" : "0.15"}
                  strokeLinecap="round"
                />

                {/* 3. Main Radial Conduit Ray with Bold Outward Arrowhead */}
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={isActive ? sector.color : "rgba(186, 230, 253, 0.5)"}
                  strokeWidth={isActive ? "3.5" : "2"}
                  strokeOpacity={isActive ? 1 : 0.65}
                  markerEnd={`url(#${markerId})`}
                  strokeLinecap="round"
                />

                {/* 4. Distinctive Directional Outward Chevrons (Pointing towards Subsidiary) */}
                {chevronFractions.map((f, ci) => {
                  const cx = startX + (endX - startX) * f;
                  const cy = startY + (endY - startY) * f;
                  return (
                    <g
                      key={`chev-${company.id}-${ci}`}
                      transform={`translate(${cx}, ${cy}) rotate(${angleDeg})`}
                    >
                      <path
                        d="M -7 -8 L 5 0 L -7 8"
                        stroke={isActive ? sector.color : "rgba(224, 242, 254, 0.75)"}
                        strokeWidth={isActive ? "3.2" : "2.2"}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        opacity={isActive ? 1 : 0.65}
                        filter={isActive ? `drop-shadow(0 0 8px ${sector.color})` : "none"}
                      />
                    </g>
                  );
                })}

                {/* 5. Animated Laser Energy Stream on Active State */}
                {isActive && (
                  <>
                    <line
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                      stroke={sector.color}
                      strokeWidth="4"
                      strokeDasharray="16 12"
                      className="animate-beam-flow"
                      filter="drop-shadow(0 0 10px currentColor)"
                      opacity="0.95"
                    />
                    {/* Glowing pulse ring where arrow meets the subsidiary */}
                    <circle
                      cx={endX}
                      cy={endY}
                      r="6"
                      fill={sector.color}
                      className="animate-ping"
                      opacity="0.85"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* ==============================================================
            THE APEX CENTRAL CORE: MTI GROUP HOLDING LOGO & GRAND PEDESTAL
            ============================================================== */}
        <div className="absolute z-30 flex flex-col items-center justify-center">
          {/* Rotating Celestial Degree Coordinate Rings */}
          <div className="absolute -inset-10 rounded-full border border-sky-400/40 border-dashed animate-celestial-spin pointer-events-none" />
          <div className="absolute -inset-16 rounded-full border border-rose-500/25 border-dotted animate-celestial-spin-reverse pointer-events-none" />

          {/* Interactive Center Hub */}
          <div
            onClick={() => setSelectedCompanyId(null)}
            className="orbital-center-hub cursor-pointer group p-3 relative text-center select-none"
            title={`${groupName} - Central Holding Core`}
          >
            {/* Center Crown Apex Badge */}
            <div className="absolute -top-4 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-600 to-amber-500 text-[9px] sm:text-[10px] font-black tracking-widest text-white shadow-xl border border-amber-300/50 flex items-center gap-1.5 z-30">
              <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
              <span>MTI GROUP</span>
            </div>

            {/* Enhanced Logo Viewport: 100% Circular, High-Contrast & Crystal Clear */}
            <div className="orbital-logo-viewport rounded-full transition-transform duration-300 group-hover:scale-105">
              {groupLogoUrl ? (
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center p-0 bg-white">
                  <Image
                    key={groupLogoUrl}
                    src={getImageUrl(groupLogoUrl)}
                    alt={groupName || "MTI Group"}
                    width={180}
                    height={180}
                    className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-0"
                    priority
                    unoptimized={true}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.includes("mti-group-logo.svg")) {
                        target.src = "/images/companies/mti-group-logo.svg";
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center font-black text-4xl ice-cyan-gradient-text">
                  MTI
                </div>
              )}
            </div>

            {/* Central Monogram Label */}
            <span className="text-[12px] sm:text-[13px] font-black text-white tracking-wider ice-gradient-text uppercase mt-1">
              MTI GROUP
            </span>

            {/* Glowing Core Radar Pulse */}
            <div className="absolute inset-0 rounded-full border border-sky-300/40 animate-ping opacity-25 pointer-events-none" />
          </div>

          {/* Pedestal Base Tag */}
          <div className="mt-3 px-4 py-1.5 rounded-full glass-ice-pill border border-sky-400/50 text-[10px] sm:text-[11px] font-black text-sky-200 tracking-wider shadow-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isAr ? "المركز الرئيسي للقيادة والاستثمار" : "Executive Holding Core"}</span>
          </div>
        </div>

        {/* ==============================================================
            SATELLITE NODES: SUBSIDIARIES IN REAL-TIME ORBIT
            ============================================================== */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {nodePositions.map(({ company, x, y, sector }) => {
            const isSelected = selectedCompanyId === company.id;
            const isHovered = hoveredCompanyId === company.id;
            const isActive = isSelected || isHovered;
            const SectorIcon = sector.icon;

            // Convert SVG coordinate (0..1000) to percentage (0..100%)
            const leftPercent = (x / SVG_SIZE) * 100;
            const topPercent = (y / SVG_SIZE) * 100;

            // Dynamic Hover Card Placement to completely eliminate clipping
            const isTopHalf = y < CENTER;
            const isFarLeft = x < 280;
            const isFarRight = x > 720;

            const tooltipStyle: React.CSSProperties = {
              position: "absolute",
              zIndex: 70,
              width: "270px",
              maxWidth: "85vw",
              ...(isTopHalf
                ? { top: "calc(100% + 14px)", bottom: "auto" }
                : { bottom: "calc(100% + 14px)", top: "auto" }),
              ...(isFarLeft
                ? { left: "0", right: "auto", transform: "none" }
                : isFarRight
                ? { right: "0", left: "auto", transform: "none" }
                : { left: "50%", transform: "translateX(-50%)" }),
            };

            return (
              <div
                key={company.id}
                style={{
                  left: `${leftPercent}%`,
                  top: `${topPercent}%`,
                  transform: "translate(-50%, -50%)"
                }}
                className="absolute pointer-events-auto"
                onMouseEnter={() => setHoveredCompanyId(company.id)}
                onMouseLeave={() => setHoveredCompanyId(null)}
                onClick={() => setSelectedCompanyId(company.id)}
              >
                {/* Satellite Disc Container */}
                <div
                  className={`orbital-satellite-disc flex flex-col items-center cursor-pointer group relative ${
                    isActive ? "active scale-110 z-40" : "scale-95 hover:scale-105"
                  }`}
                >
                  {/* Floating Integrated Quick Portal Tooltip (Dynamically positioned without clipping) */}
                  {isActive && (
                    <div style={tooltipStyle} className="orbital-node-tooltip">
                      <div className="p-4 rounded-2xl glass-ice-burgundy border-2 border-sky-400/70 shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col items-center gap-2.5 backdrop-blur-2xl">
                        {/* Sector Pill */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-[10px] font-bold text-sky-200 border border-sky-400/40">
                          <SectorIcon className="w-3.5 h-3.5 text-sky-300" />
                          <span>{sector.label}</span>
                        </div>

                        {/* Company Name */}
                        <span className="text-sm font-black text-white text-center leading-snug">
                          {company.name}
                        </span>

                        {/* Brief summary if present */}
                        {company.description && (
                          <p className="text-[11px] text-sky-200/80 text-center line-clamp-2 leading-relaxed">
                            {company.description}
                          </p>
                        )}

                        {/* Metric Counts */}
                        <div className="w-full flex items-center justify-around py-1.5 border-y border-sky-400/20 text-[10px] text-sky-200 font-mono">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-white">{company.projectsCount || 0}</span>
                            <span>{isAr ? "مشاريع" : "Projects"}</span>
                          </div>
                          <div className="w-px h-3 bg-sky-400/30" />
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-white">{company.servicesCount || 0}</span>
                            <span>{isAr ? "خدمات" : "Services"}</span>
                          </div>
                        </div>

                        {/* Direct Button: 'استعراض تفاصيل الشركة' */}
                        <Link
                          href={`/company/${company.slug}`}
                          className="w-full px-4 py-2 rounded-xl luxury-ice-button font-black text-xs text-white flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all mt-0.5"
                        >
                          <span>{isAr ? "استعراض تفاصيل الشركة" : "Explore Subsidiary"}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Outer Crystal Ring with Sector Colors */}
                  <div
                    style={{
                      borderColor: isActive ? sector.color : "rgba(186, 230, 253, 0.7)",
                      boxShadow: isActive
                        ? `0 0 45px ${sector.glow}, 0 16px 40px rgba(0,0,0,0.9)`
                        : "0 10px 28px rgba(0,0,0,0.8)"
                    }}
                    className={`w-32 h-32 sm:w-36 sm:h-36 rounded-2xl p-1.5 flex items-center justify-center transition-all duration-300 relative border-2 ${
                      isActive ? "bg-[#380825]/95 scale-110 z-40" : "bg-[#1d0415]/90 hover:scale-105"
                    }`}
                  >
                    {/* Active Corner Diamond Beacon */}
                    {isActive && (
                      <div
                        style={{ backgroundColor: sector.color }}
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full border-2 border-white animate-core-beacon shadow-md flex items-center justify-center z-10"
                      >
                        <Zap className="w-2 h-2 text-white" />
                      </div>
                    )}

                    {/* Company Logo Disc: Maximized to fill the full card cleanly with pure white backing */}
                    <div className="w-full h-full rounded-xl bg-white border border-sky-300/40 flex items-center justify-center p-2 overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.08),_0_4px_14px_rgba(0,0,0,0.25)]">
                      {company.logoUrl ? (
                        <Image
                          key={`${company.id}-${company.logoUrl}`}
                          src={getImageUrl(company.logoUrl)}
                          alt={company.name}
                          width={140}
                          height={140}
                          priority
                          className="w-full h-full object-contain filter drop-shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-105"
                          unoptimized={true}
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (!target.src.includes("default-logo.svg")) {
                              target.src = "/images/companies/default-logo.svg";
                            }
                          }}
                        />
                      ) : (
                        <SectorIcon className="w-12 h-12 text-sky-700" />
                      )}
                    </div>
                  </div>

                  {/* Company Name Badge directly beneath Disc */}
                  <div className="mt-2.5 flex flex-col items-center">
                    <span
                      style={{
                        borderColor: isActive ? sector.color : "rgba(56, 189, 248, 0.4)",
                        color: isActive ? "#ffffff" : "#bae6fd"
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-wide border whitespace-nowrap shadow-xl transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-sky-950/95 via-[#340723]/95 to-sky-950/95 shadow-[0_0_20px_rgba(56,189,248,0.55)] scale-105"
                          : "bg-[#180310]/85"
                      }`}
                    >
                      {company.name}
                    </span>

                    {/* Sector Sub-Badge */}
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-sky-300/85">
                      <span
                        style={{ backgroundColor: sector.color }}
                        className="w-1.5 h-1.5 rounded-full"
                      />
                      <span>{sector.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
