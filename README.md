# 🎨 CANTING (Catat Penting) - Hackathon Antigravity 2026

![CANTING Logo](public/logo.png)

> **Empowering Batik SMEs in Surabaya with Agentic AI.**

**CANTING** is an innovative Agentic AI solution deployed on WhatsApp, designed specifically to transform the operations of Batik SMEs in Surabaya from complex manual systems into a "light and fast" digital ecosystem. Aligned with the Antigravity theme, this project addresses the challenge of operational drag—including manual inventory management, slow payment verification, and repetitive customer support—that currently hinders the productivity of 385,054 SMEs in Surabaya.

---

## Key Features

- **WhatsApp-First Interface**: Seamless interaction for sellers and customers on the world's most popular messaging platform.
- **Multimodal Stock Updates**: Sellers can update inventory levels simply by sending voice notes.
- **Visual Verification**: Real-time AI processing of payment proofs and product damage claims.
- **Batik Guide (RAG)**: A context-aware assistant providing education on the philosophy and history of Surabaya batik motifs.
- **Autonomous Operations**: An agentic assistant with the authority to execute tasks independently, reducing administrative burden.

## Tech Stack

- **Core Framework**: [Next.js](https://nextjs.org/)
- **AI Engine**: [Google Gemini 3.1 Flash Lite](https://ai.google.dev/)
- **Database & Auth**: [PostgreSQL](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Google Cloud Platform](https://cloud.google.com/)

## Getting Started

### Prerequisites

- Node.js 18+
- npm / pnpm / yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/AdnanBayu/canting-chatbot-hackathon.git
   cd canting-chatbot-hackathon
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   CLOUDFLARE_R2_TOKEN=your_r2_token
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

---

## API Documentation
https://api-stg.canting.my.id/docs#/owner/list_users_owner_users_get

---

## Cultural Preservation

Beyond operational efficiency, CANTING serves as a strategic tool for cultural preservation. By removing technical and administrative burdens, we empower local batik artisans to focus on their craft while remaining competitive in the global e-commerce market.