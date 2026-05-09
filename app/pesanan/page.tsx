import {
    ShoppingCart,
    RefreshCcw,
    Inbox,
} from 'lucide-react';

import StatCard from '@/components/SummaryCard';
import PesananTable, { PesananItem } from '@/components/PesananTable';

const ORDERS_DATA: PesananItem[] = [
    { id: "#ORD-2041", name: "Siti Rahmawati", product: "Batik Solo Silk", status: "DIKIRIM", amount: "Rp 1.250.000" },
    { id: "#ORD-2040", name: "Ahmad Fauzi", product: "Parang Kencana Cotton", status: "PENDING", amount: "Rp 450.000" },
    { id: "#ORD-2039", name: "Diana Putri", product: "Mega Mendung Scarf", status: "DIKIRIM", amount: "Rp 850.000" },
];

export default function Pesanan() {
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
                    icon={<Inbox className="text-[#0D3B2E]" size={16} />}
                    iconBg="bg-[#D1E7E0]"
                />
                <StatCard
                    title="Diproses Hari Ini"
                    value="28"
                    subValue="+5% vs yesterday"
                    subColor="text-emerald-500"
                    showProgress={false}
                    icon={<RefreshCcw className="text-[#8B4513]" size={16} />}
                    iconBg="bg-[#FDE7E7]"
                />
                <StatCard
                    title="Selesai (24 jam)"
                    value="14"
                    subValue="Pesanan"
                    subColor="text-red-500"
                    showProgress={false}
                    icon={<ShoppingCart className="text-[#0D3B2E]" size={16} />}
                    iconBg="bg-[#D1E7E0]"
                />
            </div>

            {/* Orders Table Area */}
            <PesananTable data={ORDERS_DATA} showAction={true} showHead={true} showPage={true} />
        </>
    )
}
