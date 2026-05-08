"use client";

import {
    ShoppingCart,
    Inbox,
    RefreshCcw,
} from 'lucide-react';

import StatCard from '@/components/StatCard';
import CatalogTable from '@/components/CatalogTable';

export default function StokBarang() {
    // Mock data matching the screenshot
    const products = [
        {
            id: 1,
            name: 'Batik Silk Indigo Parang',
            subtitle: 'Premium Hand-drawn',
            sku: 'SKU-2024-001',
            category: 'Kemeja',
            stock: 85,
            unit: 'Units',
            status: 'Optimal',
            price: 'Rp 1,250,000',
            stockPercentage: 85,
            color: 'bg-emerald-600'
        },
        {
            id: 2,
            name: 'Batik Cotton Mega Mendung',
            subtitle: 'Daily Wear Stamped',
            sku: 'SKU-2024-042',
            category: 'Kemeja',
            stock: 12,
            unit: 'Units',
            status: 'Low Stock',
            price: 'Rp 450,000',
            stockPercentage: 15,
            color: 'bg-red-500'
        },
        {
            id: 3,
            name: 'Premium Raw Silk Bolts',
            subtitle: 'Raw Material',
            sku: 'RM-SILK-01',
            category: 'Bahan',
            stock: 45,
            unit: 'Bolts',
            status: 'Normal',
            price: 'Rp 2,800,000',
            stockPercentage: 45,
            color: 'bg-slate-500'
        },
        {
            id: 4,
            name: 'Indigo Natural Dye Paste',
            subtitle: 'Coloring Agent',
            sku: 'RM-DYE-BL',
            category: 'Bahan',
            stock: 62,
            unit: 'KG',
            status: 'Normal',
            price: 'Rp 120,000',
            stockPercentage: 62,
            color: 'bg-slate-500'
        },
        {
            id: 5,
            name: 'Indigo Natural Dye Paste',
            subtitle: 'Coloring Agent',
            sku: 'RM-DYE-BL',
            category: 'Bahan',
            stock: 62,
            unit: 'KG',
            status: 'Normal',
            price: 'Rp 120,000',
            stockPercentage: 62,
            color: 'bg-slate-500'
        },
    ];

    return (
        <>
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-[#0D3B2E]">Stok Barang</h2>
                <p className="text-sm text-gray-500">Monitor stok persediaan barang dagangan dan status SKU produk</p>
            </header>


            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    title="TOTAL SKU"
                    value="1,248"
                    subValue="+12%"
                    subColor="text-emerald-500"
                    progress={45}
                    icon={<Inbox className="text-[#0D3B2E]" size={16} />}
                    iconBg="bg-[#D1E7E0]"
                />
                <StatCard
                    title="STOK BARANG RENDAH"
                    value="14"
                    subValue="Requires Attention"
                    subColor="text-gray-400"
                    progress={82}
                    icon={<RefreshCcw className="text-[#8B4513]" size={16} />}
                    iconBg="bg-[#FDE7E7]"
                />
                <StatCard
                    title="ESTIMASI NILAI GUDANG"
                    value="RP420M"
                    subValue="Estimated"
                    subColor="text-red-500"
                    showProgress={false}
                    caption="12 ready to ship"
                    icon={<ShoppingCart className="text-[#0D3B2E]" size={16} />}
                    iconBg="bg-[#D1E7E0]"
                />
            </div>

            <CatalogTable products={products} />
        </>
    )
}