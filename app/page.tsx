"use client";

import {
  LayoutDashboard,
  Package,
  BookOpen,
  Loader,
  BanknoteArrowDown,
  ShoppingCart,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import StatCard from '@/components/SummaryCard';
import PesananTable, { PesananItem } from '@/components/PesananTable';
import CustomerCareSummary from '@/components/CustomerCareSummary';
import StockWarningSummary from '@/components/StockWarningSummary';
import { authenticatedFetch } from '@/lib/api';

const STOCK_WARNINGS = [
  {
    label: "Indigo Dye Powder",
    warning: "Only 1.2kg left",
    icon: <div className="bg-blue-50 p-2 rounded text-blue-500"><LayoutDashboard size={16} /></div>
  },
  {
    label: "Primisima Cotton",
    warning: "Only 2 rolls left",
    icon: <div className="bg-purple-50 p-2 rounded text-purple-500"><Package size={16} /></div>
  },
  {
    label: "Canting Tip #2",
    warning: "Low stock: 5 units",
    icon: <div className="bg-orange-50 p-2 rounded text-orange-500"><BookOpen size={16} /></div>
  }
];

export default function Home() {
  const [recentOrders, setRecentOrders] = useState<PesananItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await authenticatedFetch('/dashboard/orders/recent');

        if (response.ok) {
          const result = await response.json();
          const rawOrders = Array.isArray(result) ? result : (result.data || []);

          const mappedOrders: PesananItem[] = rawOrders.map((item: any) => {
            let uiStatus: any = 'TUNDA';
            const apiStatus = item.status?.toUpperCase() || '';

            if (apiStatus.includes('SENT') || apiStatus.includes('COMPLETED') || apiStatus.includes('DELIVERED')) {
              uiStatus = 'DIKIRIM';
            } else if (apiStatus.includes('PROCESS') || apiStatus.includes('PAID')) {
              uiStatus = 'DIPROSES';
            } else if (apiStatus.includes('CANCEL') || apiStatus.includes('FAIL') || apiStatus.includes('REJECT') || apiStatus.includes('DITOLAK')) {
              uiStatus = 'DITOLAK';
            }

            return {
              id: item.id,
              name: item.customer,
              product: item.product,
              status: uiStatus,
              amount: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0
              }).format(item.total || 0)
            };
          });

          setRecentOrders(mappedOrders);
        }
      } catch (error) {

        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <>
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#0D3B2E]">Ringkasan Usaha</h2>
        <p className="text-sm text-gray-500">Monitor bisnis UMKM batik milik anda</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="PENJUALAN HARI INI"
              value="Rp 4.2M"
              subValue="+12%"
              subColor="text-emerald-500"
              progress={45}
              icon={<Loader className="text-[#0D3B2E]" size={16} />}
              iconBg="bg-[#D1E7E0]"
            />
            <StatCard
              title="PENDAPATAN BULAN INI"
              value="Rp 82M"
              subValue="82%"
              subColor="text-gray-400"
              progress={82}
              icon={<BanknoteArrowDown className="text-[#0D3B2E]" size={16} />}
              iconBg="bg-[#D1E7E0]"
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
              <a href="/pesanan" className="text-xs font-bold text-[#0D3B2E] hover:underline">Lihat Semua</a>
            </div>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader className="animate-spin text-[#0D3B2E]" size={24} />
                  <span className="ml-2 text-gray-500">Loading orders...</span>
                </div>
              ) : (
                <PesananTable data={recentOrders} />
              )}
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Care */}
          <CustomerCareSummary
            complaintsCount={3}
            refundsCount={1}
          />

          {/* Stock Warning */}
          <StockWarningSummary items={STOCK_WARNINGS} />
        </div>
      </div>
    </>
  );
}