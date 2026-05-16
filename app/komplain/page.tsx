"use client";

import {
    Clock,
    CheckCircle2,
    MessageSquare
} from 'lucide-react';

import { authenticatedFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

import Header from '@/components/Header';
import StatCard from '@/components/SummaryCard';
import RefundRequestCard, { RefundRequestCardProps } from '@/app/komplain/RefundRequestCard';
import WhatsAppLogItem, { WhatsAppLogItemProps } from '@/app/komplain/WhatsAppLogItem';

interface ComplaintSummary {
    pending_tickets: number;
    resolved_today: number;
    average_response_time_hours: number;
    refund_rate_percentage: number;
}

export default function Komplain() {
    const [loading, setLoading] = useState(true);

    const [summary, setSummary] = useState<ComplaintSummary | null>(null);
    const [complaintRequests, setComplaintRequests] = useState<RefundRequestCardProps[]>([]);
    const [logs, setLogs] = useState<WhatsAppLogItemProps[]>([]);

    const fetchRefundRequests = async () => {
        try {
            setLoading(true);

            // fetch stock data from api
            const [summaryRes, complaintRes, logRes] = await Promise.all([
                authenticatedFetch('/complaints/summary'),
                authenticatedFetch('/complaints/active-requests'),
                authenticatedFetch('/complaints/logs'),
            ]);

            // process summary card data
            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setSummary(summaryData);
            }

            // process complaint data
            if (complaintRes.ok) {
                const result = await complaintRes.json();
                const rawComplaints = result || [];
                console.log(result);

                const mappedComplaintRequests: RefundRequestCardProps[] = rawComplaints.map((item: any) => {
                    return {
                        request_id: item.request_id,
                        full_id: item.full_id,
                        order_id: item.order_id,
                        buyer_phone: item.buyer_phone,
                        requested_at: item.requested_at.split('T')[0],
                        issue_type: item.issue_type,
                        product_name: item.product_name,
                        customer_message: item.customer_message,
                    };
                });
                setComplaintRequests(mappedComplaintRequests);
            }

            // process whatsapp log data
            if (logRes.ok) {
                const result = await logRes.json();
                const rawLogs = result || [];

                const mappedLogs: WhatsAppLogItemProps[] = rawLogs.map((item: any) => {
                    return {
                        phone_number: item.phone_number.slice(0, 13),
                        // phone_number: item.phone_number.slice,   there are some non regular phone number
                        timestamp: item.timestamp.split('T')[0],
                        message_snippet: item.message_snippet,
                        tags: item.tags,
                    };
                });
                setLogs(mappedLogs);
            }

        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRefundRequests();
    }, []);

    const SUMMARY_CONFIG = [
        {
            key: 'pending',
            title: "Tertunda",
            value: (summary?.pending_tickets ?? 0).toString(),
            subValue: "Butuh penanganan",
            subColor: "text-rose-500",
            icon: <Clock className="text-rose-600" size={16} />,
            iconBg: "bg-rose-50"
        },
        {
            key: 'resolved',
            title: "Teratasi Hari Ini",
            value: (summary?.resolved_today ?? 0).toString(),
            subValue: "Selesai",
            subColor: "text-emerald-500",
            icon: <CheckCircle2 className="text-[#0D3B2E]" size={16} />,
            iconBg: "bg-[#D1E7E0]"
        },
        {
            key: 'refund_rate',
            title: "Refund Rate",
            value: `${(summary?.refund_rate_percentage ?? 0).toFixed(1)}%`,
            subValue: "Indikator kualitas",
            subColor: "text-blue-500",
            icon: <MessageSquare className="text-blue-600" size={16} />,
            iconBg: "bg-blue-50"
        }
    ];

    return (
        <div className="flex flex-col">
            <Header
                title="Komplain"
                description="Kelola ketidakpuasan pelanggan dan pengembalian barang dengan presisi"
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {SUMMARY_CONFIG.map((stat) => (
                    <StatCard
                        key={stat.key}
                        title={stat.title}
                        value={loading ? '...' : stat.value}
                        subValue={stat.subValue}
                        subColor={stat.subColor}
                        showProgress={false}
                        icon={stat.icon}
                        iconBg={stat.iconBg}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Active Refund Requests */}
                <div className="xl:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Komplain Aktif</h3>
                        {/* <button className="text-emerald-700 text-xs font-bold hover:underline">Lihat Semua</button> */}
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
                            <p className="text-slate-400 text-sm">Memuat komplain...</p>
                        </div>
                    ) : complaintRequests.length > 0 ? (
                        complaintRequests.map((req) => (
                            <RefundRequestCard key={req.request_id} {...req} />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-100">
                            <p className="text-slate-400 text-sm">Tidak ada komplain aktif</p>
                        </div>
                    )}
                </div>

                {/* WhatsApp Log */}
                <div className="xl:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Histori WhatsApp</h3>
                        <MessageSquare className="text-slate-400" size={18} />
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6">
                            {loading ? (
                                <p className="text-slate-400 text-sm py-4 text-center">Memuat histori...</p>
                            ) : logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <WhatsAppLogItem key={i} {...log} />
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm py-4 text-center">Tidak ada histori pesan</p>
                            )}
                        </div>
                        {/* <button className="w-full py-4 border-t border-dashed border-slate-200 text-slate-400 text-xs font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                            <History size={14} />
                            Tampilkan Pesan Lebih Lama
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
}