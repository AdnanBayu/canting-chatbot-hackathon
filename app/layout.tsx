import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CANTING - Dashboard UMKM Batik",
  description: "Sistem pengelolaan UMKM Batik Surabaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#F8FAFB] text-[#1A2B2B]">
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 overflow-y-auto bg-white">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}