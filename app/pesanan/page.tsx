"use client";

import {
    BookCheck,
    PackageOpen,
    ListChecks,
    Loader
} from 'lucide-react';

import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/api';

import Header from '@/components/Header';
import StatCard from '@/components/SummaryCard';
import PesananTable, { PesananItem } from '@/components/PesananTable';

export default function Pesanan() {
    const [loading, setLoading] = useState(true);

    const [summaryData, setSummaryData] = useState<any>(null);
    const [orders, setOrders] = useState<PesananItem[]>([]);

    const fetchOrders = async () => {
        try {

            // fetch order data from api
            const [ordersRes, summaryRes] = await Promise.all([
                authenticatedFetch('/orders'),
                authenticatedFetch('/orders/summary'),
            ]);

            // process order data
            if (ordersRes.ok) {
                const result = await ordersRes.json();
                const rawOrders = Array.isArray(result) ? result : (result.data || []);

                const mappedOrders: PesananItem[] = rawOrders.map((item: any) => {
                    return {
                        id: item.order_id,
                        name: item.customer_name,
                        product: item.product_summary,
                        status: item.status || 'ALL',
                        amount: item.amount
                    };
                });
                setOrders(mappedOrders);
            }

            if (summaryRes.ok) {
                const summary = await summaryRes.json();
                setSummaryData(summary)
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const SUMMARY_CONFIG = [
        {
            key: 'awaiting_approval' as const,
            title: "Menunggu Persetujuan",
            subValue: "Action Required",
            subColor: "text-red-500",
            icon: <ListChecks className="text-[#8B4513]" size={16} />,
            iconBg: "bg-[#FDE7E7]"
        },
        {
            key: 'processing_today' as const,
            title: "Diproses Hari Ini",
            subValue: "Sedang Berjalan",
            subColor: "text-emerald-500",
            icon: <PackageOpen className="text-[#8B4513]" size={16} />,
            iconBg: "bg-[#FDE7E7]"
        },
        {
            key: 'completed_24h' as const,
            title: "Selesai (24 jam)",
            subValue: "Pesanan",
            subColor: "text-red-500",
            icon: <BookCheck className="text-[#0D3B2E]" size={16} />,
            iconBg: "bg-[#D1E7E0]"
        }
    ];

    return (
        <>
            <Header
                title="Pesanan Masuk"
                description="Kelola antrean produksi dan konfirmasi pembayaran dari pelanggan"
            />

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {SUMMARY_CONFIG.map((stat) => (
                    <StatCard
                        key={stat.key}
                        title={stat.title}
                        value={(summaryData?.[stat.key] ?? (loading ? '...' : '0')).toString()}
                        subValue={stat.subValue}
                        subColor={stat.subColor}
                        showProgress={false}
                        icon={stat.icon}
                        iconBg={stat.iconBg}
                    />
                ))}
            </div>

            {/* Orders Table Area */}
            {loading ? (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center">
                    <Loader className="animate-spin text-[#0D3B2E] mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Memuat data pesanan...</p>
                </div>
            ) : (
                <PesananTable data={orders} showAction={true} showHead={true} showPage={true} />
            )}
        </>
    )
}