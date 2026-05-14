"use client";

import {
    BookCheck,
    PackageOpen,
    ListChecks,
} from 'lucide-react';

import StatCard from '@/components/SummaryCard';
import PesananTable, { PesananItem } from '@/components/PesananTable';
import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api';


export default function Pesanan() {
    const [orders, setOrders] = useState<PesananItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await authenticatedFetch('/dashboard/orders');
                if (response.ok) {
                    const result = await response.json();
                    const rawOrders = result.items || [];

                    const mappedOrders: PesananItem[] = rawOrders.map((item: any) => {
                        let uiStatus: any = 'TUNDA';
                        const apiStatus = item.status?.toUpperCase() || '';

                        if (apiStatus.includes('SENT') || apiStatus.includes('COMPLETED') || apiStatus.includes('DELIVERED')) {
                            uiStatus = 'DIKIRIM';
                        } else if (apiStatus.includes('PROCESS') || apiStatus.includes('PAID')) {
                            uiStatus = 'DIPROSES';
                        } else if (apiStatus.includes('CANCEL') || apiStatus.includes('FAIL') || apiStatus.includes('REJECT')) {
                            uiStatus = 'DITOLAK';
                        }

                        // Summarize products (e.g. "2 Produk")
                        const productCount = item.items?.length || 0;
                        const productSummary = productCount > 0 ? `${productCount} Produk` : 'Tanpa Produk';

                        return {
                            id: item.id,
                            name: item.buyer_phone,
                            product: productSummary,
                            status: uiStatus,
                            amount: new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0
                            }).format(item.total_amount || 0)
                        };
                    });

                    setOrders(mappedOrders);
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
                <h2 className="text-2xl font-bold text-[#0D3B2E]">Pesanan Masuk</h2>
                <p className="text-sm text-gray-500">Kelola antrean produksi dan konfirmasi pembayaran dari pelanggan</p>
            </header>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    title="Menunggu Persetujuan"
                    value="12"
                    subValue="Action Required"
                    subColor="text-red-500"
                    showProgress={false}
                    icon={<ListChecks className="text-[#8B4513]" size={16} />}
                    iconBg="bg-[#FDE7E7]"
                />
                <StatCard
                    title="Diproses Hari Ini"
                    value="28"
                    subValue="+5% vs yesterday"
                    subColor="text-emerald-500"
                    showProgress={false}
                    icon={<PackageOpen className="text-[#8B4513]" size={16} />}
                    iconBg="bg-[#FDE7E7]"
                />
                <StatCard
                    title="Selesai (24 jam)"
                    value="14"
                    subValue="Pesanan"
                    subColor="text-red-500"
                    showProgress={false}
                    icon={<BookCheck className="text-[#0D3B2E]" size={16} />}
                    iconBg="bg-[#D1E7E0]"
                />
            </div>

            {/* Orders Table Area */}
            {isLoading ? (
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
