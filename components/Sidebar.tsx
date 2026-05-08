"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BookOpen,
  BarChart3,
  MessageSquare
} from 'lucide-react';

const menuItems = [
  { name: 'Ringkasan', icon: <LayoutDashboard size={20} />, href: '/' },
  { name: 'Stok Barang', icon: <Package size={20} />, href: '/stokBarang' },
  { name: 'Pesanan', icon: <ShoppingCart size={20} />, href: '/pesanan' },
  { name: 'Pengiriman', icon: <Truck size={20} />, href: '/pengiriman' },
  { name: 'Pengetahuan Produk', icon: <BookOpen size={20} />, href: '/pengetahuan' },
  { name: 'Laporan', icon: <BarChart3 size={20} />, href: '/laporan' },
  { name: 'Komplain', icon: <MessageSquare size={20} />, href: '/komplain' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col hidden lg:flex h-screen sticky top-0 shrink-0">
      <div className="p-6">
        <h1 className="text-xl font-bold text-[#0D3B2E] tracking-tight">CANTING</h1>
        <p className="text-xs text-gray-400 mt-1">Pengelolaan UMKM Batik Surabaya</p>
      </div>

      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`w-full flex items-center gap-4 px-6 py-4 text-sm font-medium transition-all border-r-4 ${pathname === item.href
              ? 'bg-[#EBF2F0] text-[#0D3B2E] border-[#0D3B2E]'
              : 'text-gray-500 border-transparent hover:bg-gray-50'
              }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Budi" alt="Pak Budi" />
        </div>
        <div>
          <p className="text-sm font-bold">Pak Arif</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">UMKM Batik Karangmenjangan</p>
        </div>
      </div>
    </aside>
  );
}

