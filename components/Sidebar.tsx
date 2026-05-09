"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  BookOpen,
  BarChart3,
  MessageSquare,
  Menu,
  X
} from 'lucide-react';

import SidebarProfile from './SidebarProfile';

const menuItems = [
  { name: 'Ringkasan', icon: <LayoutDashboard size={20} />, href: '/' },
  { name: 'Stok Barang', icon: <Package size={20} />, href: '/stokBarang' },
  { name: 'Pesanan', icon: <ShoppingCart size={20} />, href: '/pesanan' },
  { name: 'Pengiriman', icon: <Truck size={20} />, href: '/pengiriman' },
  { name: 'Pengetahuan Produk', icon: <BookOpen size={20} />, href: '/pengetahuanProduk' },
  { name: 'Laporan', icon: <BarChart3 size={20} />, href: '/laporan' },
  { name: 'Komplain', icon: <MessageSquare size={20} />, href: '/komplain' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#0D3B2E] text-white rounded-md shadow-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col h-screen 
        transition-transform duration-300 ease-in-out transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:sticky lg:top-0 lg:z-0 lg:shrink-0
      `}>

        {/* Title Bar */}
        <div className="p-6 pt-16 lg:pt-6">
          <h1 className="text-xl font-bold text-[#0D3B2E] tracking-tight">CANTING</h1>
          <p className="text-xs text-gray-400 mt-1">Pengelolaan UMKM Batik Surabaya</p>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 mt-4 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
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

        {/* User Profile */}
        <SidebarProfile 
          namaPemilik="Pak Arif" 
          namaUMKM="UMKM Batik Karangmenjangan" 
        />
      </aside>
    </>
  );
}
