# MTI Group Holding — Corporate Web Platform

Modern, executive web platform for **MTI Group Holding (مجموعة إم تي آي القابضة)**, orchestrating strategic subsidiaries across enterprise cloud tech, mega civil contracting, and automated logistics.

## Key Features

- **Orbital Constellation Ecosystem**: High-performance SVG astrolabe displaying real-time corporate subsidiaries revolving around the MTI Group core, with directional outward laser conduits and glowing indicator rays.
- **Glacial Frosted Ice & Apple iPhone Burgundy Design System**: Luxury glassmorphic aesthetic (`backdrop-filter: blur(32px)`) blending crystalline ice-cyan luminosity with deep velvet burgundy.
- **Dynamic Company Routing**: Automatic dynamic routing for all subsidiaries (`/company/[slug]`) with real-time CMS sections, services showcase, and landmark projects.
- **Real-Time Synchronization**: Live updates powered by SignalR hub connection (`https://companygroup.runasp.net/hubs/cms`).
- **Comprehensive Executive Admin Portal**: Full CMS management for corporate entities, page sections, media library, audit trails, and holding settings.
- **Universal Navigation & Unified Tab Experience**: All links navigate cleanly in the same tab with intuitive Back buttons across all corporate sub-pages.
- **Bilingual Interface**: Seamless Arabic & English typography (Inter / Cairo / Outfit).

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS & Custom Glassmorphic CSS Design System (`globals.css`)
- **Real-Time**: Microsoft SignalR Client
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://companygroup.runasp.net
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portal.

## Deployment

The application is optimized for zero-config deployment on Vercel, Netlify, or Azure Static Web Apps.
