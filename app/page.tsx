"use client";
import React from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  Inbox,
  RefreshCcw,
  LayoutDashboard,
  Package,
  BookOpen
} from 'lucide-react';

// Import our new components
import StatCard from '@/components/StatCard';
import TableRow from '@/components/PesananTableRingkas';
import StockItem from '@/components/StockKurangRingkas';

export default function Home() {
  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#0D3B2E]">Ringkasan Usaha</h2>
        <p className="text-sm text-gray-500">Monitor bisnis UMKM batik milik anda</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="PENJUALAN HARI INI"
              value="Rp 4.2M"
              subValue="+12%"
              subColor="text-emerald-500"
              progress={45}
              icon={<Inbox className="text-[#0D3B2E]" size={16} />}
              iconBg="bg-[#D1E7E0]"
            />
            <StatCard
              title="PENDAPATAN BULAN INI"
              value="Rp 82M"
              subValue="82%"
              subColor="text-gray-400"
              progress={82}
              icon={<RefreshCcw className="text-[#8B4513]" size={16} />}
              iconBg="bg-[#FDE7E7]"
            />
            <StatCard
              title="PESANAN AKTIF"
              value="48"
              subValue="8 Priority"
              subColor="text-red-500"
              showProgress={false}
              caption="12 ready to ship"
              icon={<ShoppingCart className="text-[#0D3B2E]" size={16} />}
              iconBg="bg-[#D1E7E0]"
            />
          </div>

          {/* Sales Chart Placeholder */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-[#0D3B2E]">Tren Penjualan</h3>
              <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#0D3B2E]"></div> Pendapatan
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#D1E7E0]"></div> Target
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between h-48 gap-2">
              {[
                { day: 'Senin', h: '70%', t: '85%' },
                { day: 'Selasa', h: '85%', t: '95%' },
                { day: 'Rabu', h: '95%', t: '100%' },
                { day: 'Kamis', h: '75%', t: '88%' },
                { day: 'Jumat', h: '90%', t: '95%' },
                { day: 'Sabtu', h: '100%', t: '100%' },
                { day: 'Minggu', h: '60%', t: '90%' },
              ].map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative h-full flex flex-col justify-end bg-gray-50 rounded-t-md overflow-hidden">
                    <div style={{ height: item.t }} className="absolute bottom-0 w-full bg-[#D1E7E0] opacity-50"></div>
                    <div style={{ height: item.h }} className="absolute bottom-0 w-full bg-[#0D3B2E] transition-all group-hover:bg-[#155a47]"></div>
                  </div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#0D3B2E]">Pesanan Terbaru</h3>
              <button className="text-xs font-bold text-[#0D3B2E] hover:underline">Lihat Semua</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-wider border-b border-gray-50">
                    <th className="pb-4 font-bold">ID Pesanan</th>
                    <th className="pb-4 font-bold">Pelanggan</th>
                    <th className="pb-4 font-bold">Produk</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  <TableRow id="#ORD-2041" name="Siti Rahmawati" product="Batik Solo Silk" status="DIKIRIM" amount="Rp 1.250.000" />
                  <TableRow id="#ORD-2040" name="Ahmad Fauzi" product="Parang Kencana Cotton" status="TUNGGU" amount="Rp 450.000" />
                  <TableRow id="#ORD-2039" name="Diana Putri" product="Mega Mendung Scarf" status="DIKIRIM" amount="Rp 850.000" />
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Customer Care */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-[#0D3B2E] mb-6">Customer Care</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F8FAFB] p-4 rounded-lg">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Komplain</p>
                <p className="text-2xl font-bold text-red-600">3</p>
                <p className="text-[10px] text-gray-400">Menunggu penyelesaian</p>
              </div>
              <div className="bg-[#F8FAFB] p-4 rounded-lg">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Refunds</p>
                <p className="text-2xl font-bold text-[#0D3B2E]">1</p>
                <p className="text-[10px] text-gray-400">Minggu ini</p>
              </div>
            </div>
            <button className="w-full py-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50">
              Manage Tickets
            </button>
          </div>

          {/* Stock Warning */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#0D3B2E]">Peringatan Stok Kurang</h3>
              <AlertTriangle className="text-red-500" size={18} />
            </div>

            <div className="space-y-6">
              <StockItem
                label="Indigo Dye Powder"
                warning="Only 1.2kg left"
                icon={<div className="bg-blue-50 p-2 rounded text-blue-500"><LayoutDashboard size={16} /></div>}
              />
              <StockItem
                label="Primisima Cotton"
                warning="Only 2 rolls left"
                icon={<div className="bg-purple-50 p-2 rounded text-purple-500"><Package size={16} /></div>}
              />
              <StockItem
                label="Canting Tip #2"
                warning="Low stock: 5 units"
                icon={<div className="bg-orange-50 p-2 rounded text-orange-500"><BookOpen size={16} /></div>}
              />
            </div>

            <button className="w-full mt-8 py-3 bg-[#0F172A] text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">
              Inventory Report
            </button>
          </div>
        </div>
      </div>
    </>
  );
}