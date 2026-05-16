# 🪡 CANTING
### *Catat Penting — WhatsApp Agentic AI for Batik SMEs*
[![Hackathon](https://img.shields.io/badge/Hackathon-Antigravity%202026-4f46e5?style=for-the-badge)](https://gdg.community.dev/gdg-surabaya/)
[![Organizer](https://img.shields.io/badge/Organizer-GDG%20Surabaya-4285F4?style=for-the-badge&logo=google)](https://gdg.community.dev/gdg-surabaya/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![WhatsApp](https://img.shields.io/badge/Channel-WhatsApp-25D366?style=for-the-badge&logo=whatsapp)](https://www.whatsapp.com/)

**Reducing operational drag for 385,054 Batik SMEs in Surabaya — one message at a time.**

![CANTING Logo](public/logo.png)

[🚀 Live Demo](#) · [📖 Docs](#) · [🐛 Report Bug](#) · [💡 Request Feature](#)

</div>

---

## 📋 Table of Contents

- [Introduction](#-introduction)
- [Problem Statement](#-problem-statement)
- [Solution Architecture](#-solution-architecture)
- [Key Features](#-key-features)
- [Dashboard Modules](#-dashboard-modules)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Screenshots](#-screenshots)
- [Impact & Antigravity Principles](#-impact--antigravity-principles)
- [Team](#-team)

---

## 🌟 Introduction

**CANTING** (*Catat Penting*) is a **WhatsApp-native Agentic AI assistant** purpose-built for Batik micro, small, and medium enterprises (UMKM) in Surabaya. Unlike generic chatbots, CANTING is a full operational co-pilot — it understands your business context, speaks the language of batik artisans, and automates the repetitive work that slows your growth.

This repository contains the **Canting Chatbot Dashboard** — a modern, real-time administrative web interface that gives sellers full visibility and control over their operations, powered by live data from CANTING's backend AI engine.

> *"Built for the artisan. Designed for scale."*

---

## 🎯 Problem Statement

Surabaya is home to **385,054 registered UMKM**, many of which are Batik producers and retailers. Despite their cultural and economic significance, these businesses face crippling operational bottlenecks:

| Challenge | Impact |
|-----------|--------|
| 📦 **Manual stock management** | Hours lost to spreadsheets and handwritten logs |
| 💳 **Slow payment verification** | Delayed order fulfillment and poor customer trust |
| 🏛️ **Lack of instant batik education** | Buyers can't learn motif history → lower conversion |
| 📊 **No accessible business analytics** | Owners fly blind without real-time performance data |
| 🚚 **Fragmented logistics tracking** | No single view of shipment status across couriers |

CANTING is the answer to all five — delivered entirely through WhatsApp, the platform Surabaya's SME owners already use daily.

---

## 🏗️ Solution Architecture

CANTING implements a **Human-in-the-Loop (HITL)** methodology for high-stakes decisions (refunds, large orders, inventory write-offs), ensuring AI augments — not replaces — the owner's judgment. It also uses a **Zero-Downtime Knowledge Update** pipeline, so the chatbot's product knowledge base can be refreshed from the dashboard without any service interruption.

```
┌─────────────────────────────────────────────────────────────┐
│                       WhatsApp Channel                       │
│              (Sellers & Buyers — same interface)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  CANTING AI Engine (Backend)                 │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│   │  NLP / Agent │  │  RAG Engine  │  │  Vision / OCR   │  │
│   │  Routing     │  │  (Batik KB)  │  │  (Proof/Damage) │  │
│   └──────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │  REST API (api-stg.canting.my.id)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Canting Chatbot Dashboard (This Repo)          │
│   Next.js 16 · TypeScript · Tailwind CSS 4 · Lucide React  │
│                                                             │
│   Overview │ Pesanan │ Stok │ Pengiriman │ Laporan │ more  │
└─────────────────────────────────────────────────────────────┘
```

**Core Methodology:**
- ✅ **Human-in-the-Loop** — Critical decisions (refunds, stock corrections) require seller confirmation
- ✅ **Zero-Downtime Knowledge Update** — Upload new product docs via dashboard; RAG refreshes live
- ✅ **Multimodal Input** — Text, voice notes, and images all processed natively over WhatsApp

---

## ✨ Key Features

### 🏪 For Sellers

| Feature | Description |
|---------|-------------|
| 🎙️ **Manajer Gudang Suara** | Update stock levels via WhatsApp voice note or text — no app switching needed |
| 💰 **Kasir Verifikator Cerdas** | Automatic payment notifications and AI-powered transfer receipt photo verification |
| 📈 **Analis Bisnis Otonom** | On-demand generation of dynamic web dashboards with sales, revenue, and inventory insights |

### 🛍️ For Buyers

| Feature | Description |
|---------|-------------|
| 🏛️ **Pemandu Budaya Batik** | Instant cultural education on batik motif history, powered by RAG over a curated knowledge base |
| 🚚 **Pengawas Pesanan** | Real-time logistics tracking for JNE & JNT shipments, surfaced directly in chat |
| 🔍 **Inspektur Kualitas Real-Time** | Photo-based product damage inspection for return/refund claims — fully multimodal |

---

## 📊 Dashboard Modules

The **Canting Chatbot Dashboard** provides a centralized web interface to manage everything CANTING handles on WhatsApp:

### 1. 🏠 Real-Time Overview
- Live metrics: sales today, monthly revenue, and active orders
- Dynamic sales trend charts and stock warning summaries
- Quick view of customer care status and recent order activity

### 2. 📦 Order Management *(Pesanan)*
- Full lifecycle tracking: Pending Payment → Processing → Shipped → Completed
- Detailed order tables with dynamic, color-coded status badges

### 3. 🗄️ Inventory Management *(Stok Barang)*
- SKU-level tracking with visual stock progress bars
- Price management and category-based filtering
- Automatic low-stock alerts and SKU status labeling

### 4. 🚛 Shipping & Logistics *(Pengiriman)*
- Real-time shipment tracking with integrated map views
- Granular activity logs for every shipping stage

### 5. 🧠 Chatbot Knowledge Base *(Pengetahuan Produk)*
- Document library powering the chatbot's RAG engine
- File upload system (PDF, DOCX) for indexing product specs, batik pattern guides, and manuals
- Zero-downtime refresh — updates go live without restarting any service

### 6. 📑 Reporting System *(Laporan)*
- Date-range filtered report generation
- Export to **PDF** and **Excel (XLSX)** for Sales, Payments, and Inventory data

### 7. 🛎️ Customer Complaints *(Komplain)*
- Refund request management with Human-in-the-Loop approval workflow
- WhatsApp interaction logs for full customer communication audit trail

---

## 🛠️ Tech Stack

### Frontend (Dashboard)
| Technology | Purpose |
|------------|---------|
| **Next.js 16** (App Router) | React framework with server components |
| **TypeScript** | Type-safe development |
| **Tailwind CSS 4** | Utility-first styling with custom Batik design system (Emerald + Slate palette) |
| **Lucide React** | Consistent, accessible icon set |

### Backend & AI
| Technology | Purpose |
|------------|---------|
| **Custom Authenticated Fetch** | Secure real-time API integration (`api-stg.canting.my.id`) |
| **RAG Pipeline** | Retrieval-Augmented Generation for batik knowledge base |
| **Multimodal Vision** | OCR & image understanding for payment/damage verification |
| **WhatsApp Business API** | Primary user interaction channel |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| **GCP (Google Cloud Platform)** | Hosting and compute |
| **PostgreSQL** | Primary operational database |
| **JNE / JNT API** | Logistics and shipment tracking |

---

## 📁 Project Structure

```
canting-dashboard/
├── app/                          # Next.js App Router — pages & layouts
│   ├── (dashboard)/              # Route group for authenticated dashboard
│   │   ├── overview/             # Real-time metrics & charts
│   │   ├── pesanan/              # Order management
│   │   ├── stok/                 # Inventory & SKU tracking
│   │   ├── pengiriman/           # Shipping & logistics
│   │   ├── pengetahuan/          # Chatbot knowledge base
│   │   ├── laporan/              # Reports & exports
│   │   └── komplain/             # Customer complaints
│   ├── layout.tsx                # Root layout with navigation
│   └── globals.css               # Global styles & Batik design tokens
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Core design system (buttons, badges, cards)
│   ├── charts/                   # Sales trend & analytics charts
│   ├── tables/                   # Order, inventory, shipment tables
│   ├── navigation/               # Sidebar & top navigation
│   └── modals/                   # Upload, confirm, detail modals
│
├── lib/                          # Utilities & helpers
│   ├── api.ts                    # Authenticated fetch utility
│   ├── utils.ts                  # Shared helper functions
│   └── types.ts                  # Global TypeScript type definitions
│
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind + custom design system
└── tsconfig.json                 # TypeScript configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or `yarn` / `pnpm`)
- Access to the CANTING backend API (contact the team for staging credentials)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/your-org/canting-dashboard.git
cd canting-dashboard
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env.local
# Fill in your values — see the Environment Variables section below
```

**4. Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dashboard will hot-reload as you make changes.

### Other Scripts

```bash
npm run build       # Production build
npm run start       # Start production server
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler check
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and populate the following:

```env
# Backend API
NEXT_PUBLIC_API_BASE_URL=https://api-stg.canting.my.id
API_SECRET_KEY=your_secret_key_here

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_MAPS=true
NEXT_PUBLIC_ENABLE_EXPORT=true
```

> ⚠️ **Never commit `.env.local` to version control.** All secrets must be kept out of your Git history.

For production deployment, set these variables directly in your hosting platform's environment configuration (e.g., Vercel, GCP Cloud Run).

---

## 📸 Screenshots

> 🖼️ *Screenshots coming soon — the dashboard is under active development.*

| Module | Preview |
|--------|---------|
| 🏠 Overview Dashboard | `[screenshot]` |
| 📦 Order Management | `[screenshot]` |
| 🗄️ Inventory / Stock | `[screenshot]` |
| 🚛 Shipping Tracker | `[screenshot]` |
| 🧠 Knowledge Base | `[screenshot]` |
| 📑 Reports & Export | `[screenshot]` |

---

## 🚀 Impact & Antigravity Principles

CANTING directly embodies the **Antigravity 2026** theme of **Efficiency & Speed**:

### ⚡ Speed
- Stock updates that previously took 10+ minutes of manual entry now take **one voice message**
- Payment verification drops from minutes of manual checking to **under 10 seconds** with AI photo analysis
- Buyers get instant batik cultural education — no waiting for the seller to explain each motif

### 🏗️ Efficiency
- One WhatsApp channel replaces 4–5 separate tools (stock app, payment checker, logistics tracker, FAQ sheet, analytics)
- The **Zero-Downtime Knowledge Update** pipeline means the chatbot's product knowledge evolves continuously without technical intervention from the owner
- **Human-in-the-Loop** on critical decisions prevents costly AI errors while keeping the automation benefits intact

### 📊 Projected Impact
| Metric | Before CANTING | After CANTING |
|--------|---------------|---------------|
| Time to verify payment | ~5 minutes | < 10 seconds |
| Stock update frequency | Daily/weekly | Real-time |
| Buyer query response | Hours (manual) | Instant (AI) |
| Report generation | Hours (Excel) | On-demand (1 click) |

---

## 👥 Team

Built with ❤️ for Batik UMKM Surabaya at **Antigravity 2026** by GDG Surabaya.

| Name | Role |
|------|------|
| **M. Adnan Bayu Firdaus** | UI/UX Design & Frontend Development |
| **M. Wisnu Maulana** | Backend Engineering & AI Integration |

---

<div align="center">

**CANTING** — *Reducing the weight of running a business, one message at a time.*

[![GDG Surabaya](https://img.shields.io/badge/GDG-Surabaya-4285F4?style=flat-square&logo=google)](https://gdg.community.dev/gdg-surabaya/)
[![Antigravity 2026](https://img.shields.io/badge/Hackathon-Antigravity%202026-4f46e5?style=flat-square)](https://gdg.community.dev/gdg-surabaya/)

*Made in Surabaya 🏙️ — the city where batik tells stories.*