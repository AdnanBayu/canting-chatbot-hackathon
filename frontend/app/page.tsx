"use client";

import {
  Loader,
  BanknoteArrowDown,
  ShoppingCart,
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/api';

import Header from '@/components/Header';
import StatCard from '@/components/SummaryCard';
import PesananTable, { PesananItem } from '@/components/PesananTable';
import CustomerCareSummary, { CustomerCareAPI } from '@/components/CustomerCareSummary';
import StockWarningSummary, { InventoryAlert } from '@/components/StockWarningSummary';

interface DashboardSummary {
  metrics: {
    sales_today: {
      total: number;
      growth_percentage: number;
      currency: string;
    };
    revenue_month: {
      current: number;
      target_percentage: number;
      currency: string;
    };
    active_orders: {
      total: number;
      priority_count: number;
      ready_to_ship: number;
    };
  };
}

export default function Home() {
  const [loading, setLoading] = useState(true);

  const [summaryData, setSummaryData] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<PesananItem[]>([]);
  const [stockAlerts, setStockAlerts] = useState<InventoryAlert[]>([]);
  const [customerCare, setCustomerCare] = useState<CustomerCareAPI | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);

    // fetch datas from api
    try {
      const [ordersRes, summaryRes, alertsRes, customerCareRes] = await Promise.all([
        authenticatedFetch('/orders?limit=5'),
        authenticatedFetch('/dashboard/summary'),
        authenticatedFetch('/dashboard/inventory/alerts'),
        authenticatedFetch('/complaints/summary')
      ]);

      // process summary data
      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        console.log('Dashboard summary response:', JSON.stringify(summary, null, 2));
        setSummaryData(summary);
      }

      // process order data
      if (ordersRes.ok) {
        const result = await ordersRes.json();
        const rawOrders = Array.isArray(result) ? result : (result.data || []);

        const mappedOrders: PesananItem[] = rawOrders.map((item: any) => {

          return {
            id: item.order_id,
            name: item.customer_name,
            product: item.product_summary || "Tanpa Produk",
            status: item.status || 'ALL',
            amount: item.amount
          };
        });
        setRecentOrders(mappedOrders);
      }

      // process customer care alert data
      if (customerCareRes.ok) {
        const data = await customerCareRes.json();
        setCustomerCare(data);
      }

      // process stock alerts data
      if (alertsRes.ok) {
        const alerts = await alertsRes.json();
        setStockAlerts(alerts);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const SUMMARY_CONFIG = [
    {
      key: "penjualan",
      title: "PENJUALAN HARI INI",
      value: summaryData ? summaryData.metrics.sales_today.total.toString() : (loading ? '...' : 'Rp 0'),
      subColor: "text-emerald-500",
      icon: <Loader className="text-[#0D3B2E]" size={16} />,
      iconBg: "bg-[#D1E7E0]"
    },
    {
      key: 'pendapatan',
      title: "PENDAPATAN BULAN INI",
      value: summaryData ? summaryData.metrics.revenue_month.current.toString() : (loading ? '...' : 'Rp 0'),
      subColor: "text-gray-400",
      icon: <BanknoteArrowDown className="text-[#0D3B2E]" size={16} />,
      iconBg: "bg-[#D1E7E0]"
    },
    {
      key: 'pesanan',
      title: "PESANAN AKTIF",
      value: summaryData ? summaryData.metrics.active_orders.total.toString() : (loading ? '...' : '0'),
      subColor: "text-red-500",
      icon: <ShoppingCart className="text-[#0D3B2E]" size={16} />,
      iconBg: "bg-[#D1E7E0]"
    }
  ];

  return (
    <>
      <Header
        title="Ringkasan Usaha"
        description="Monitor bisnis UMKM batik milik anda"
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">

          {/* Quick Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUMMARY_CONFIG.map((stat) => (
              <StatCard
                key={stat.key}
                title={stat.title}
                value={loading ? '...' : stat.value}
                subColor={stat.subColor}
                showProgress={false}
                icon={stat.icon}
                iconBg={stat.iconBg}
              />
            ))}
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
              {loading ? (
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
            complaintsCount={customerCare?.pending_tickets || 0}
            refundsCount={customerCare?.resolved_today || 0}
            isLoading={loading}
          />

          {/* Stock Warning */}
          <StockWarningSummary items={stockAlerts} />
        </div>

      </div>
    </>
  );
}