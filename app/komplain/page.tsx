import {
    Clock,
    CheckCircle2,
    TrendingDown,
    MessageSquare,
    History
} from 'lucide-react';

import StatCard from '@/components/SummaryCard';
import RefundRequestCard from '@/components/RefundRequestCard';
import WhatsAppLogItem from '@/components/WhatsAppLogItem';
import type { WhatsAppTag } from '@/components/WhatsAppLogItem';

const REFUND_REQUESTS = [
    {
        orderId: '#BTK-9021',
        time: '2h ago',
        tagText: 'Defective',
        tagColor: 'bg-rose-100 text-rose-700',
        item: 'Hand-drawn Silk Parang - Indigo',
        description:
            'There is a significant wax smudge in the center of the fabric. It was not mentioned in the product description. I would like a full refund.',
        imageColor: 'bg-amber-950',
    },
    {
        orderId: '#BTK-8854',
        time: '5h ago',
        tagText: 'Wrong Item',
        tagColor: 'bg-slate-100 text-slate-600',
        item: 'Mega Mendung Scarf - Crimson',
        description:
            'Ordered Crimson, received Azure Blue instead. Please exchange or refund the amount. Photo attached shows the color mismatch.',
        imageColor: 'bg-red-600',
    },
] as const;

const WHATSAPP_LOGS: { phone: string; time: string; message: string; tags: WhatsAppTag[] }[] = [
    {
        phone: '+62 812-4421-XXXX',
        time: '10:45 AM',
        message: 'Halo Admin, paket saya belum sampai sudah 5 hari dari estimasi. Mohon cek resi JNE 8829...',
        tags: [
            { label: 'Shipping', type: 'category' },
            { label: 'Replied', type: 'status' },
        ],
    },
    {
        phone: '+62 857-1192-XXXX',
        time: '09:12 AM',
        message: 'Batiknya luntur pas dicuci pertama kali, padahal sudah pakai lerak. Bagaimana solusinya?',
        tags: [
            { label: 'Quality', type: 'category' },
            { label: 'Urgent', type: 'urgent' },
        ],
    },
    {
        phone: '+62 813-8821-XXXX',
        time: 'Yesterday',
        message: 'Apakah ada stok untuk motif Parang Kencana ukuran XL? Saya butuh 10 pcs untuk seragam.',
        tags: [
            { label: 'Inquiry', type: 'category' },
            { label: 'Closed', type: 'status' },
        ],
    },
    {
        phone: '+62 821-3321-XXXX',
        time: 'Yesterday',
        message: 'Terima kasih admin, refund sudah masuk ke rekening saya. Pelayanan sangat baik.',
        tags: [
            { label: 'Feedback', type: 'category' },
            { label: 'Closed', type: 'status' },
        ],
    },
];

export default function Komplain() {
    return (
        <div className="flex flex-col">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-[#0D3B2E]">Komplain</h2>
                <p className="text-sm text-gray-500">Kelola ketidakpuasan pelanggan dan pengembalian barang dengan presisi.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <StatCard
                    icon={<Clock size={16} className="text-emerald-600" />}
                    iconBg="bg-emerald-50"
                    title="Tertunda"
                    value="12"
                    subValue=""
                    subColor=""
                    showProgress={false}
                />
                <StatCard
                    icon={<CheckCircle2 size={16} className="text-slate-600" />}
                    iconBg="bg-slate-50"
                    title="Teratasi Hari Ini"
                    value="48"
                    subValue=""
                    subColor=""
                    showProgress={false}
                />
                <StatCard
                    icon={<TrendingDown size={16} className="text-rose-600" />}
                    iconBg="bg-rose-50"
                    title="Rerata Respon"
                    value="1.4 jam"
                    subValue=""
                    subColor=""
                    showProgress={false}
                />
                <StatCard
                    icon={<TrendingDown size={16} className="text-rose-600" />}
                    iconBg="bg-rose-50"
                    title="Refund Rate"
                    value="2.1%"
                    subValue=""
                    subColor=""
                    showProgress={false}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Active Refund Requests */}
                <div className="xl:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Active Refund Requests</h3>
                        <button className="text-emerald-700 text-xs font-bold hover:underline">View All</button>
                    </div>

                    {REFUND_REQUESTS.map((req) => (
                        <RefundRequestCard key={req.orderId} {...req} />
                    ))}
                </div>

                {/* WhatsApp Log */}
                <div className="xl:col-span-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">WhatsApp Log</h3>
                        <MessageSquare className="text-slate-400" size={18} />
                    </div>

                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6">
                            {WHATSAPP_LOGS.map((log, i) => (
                                <WhatsAppLogItem key={i} {...log} />
                            ))}
                        </div>
                        <button className="w-full py-4 border-t border-dashed border-slate-200 text-slate-400 text-xs font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                            <History size={14} />
                            Tampilkan Pesan Lebih Lama
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}