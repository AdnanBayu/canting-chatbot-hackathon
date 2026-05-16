"use client";

import {
    PackageSearch,
    OctagonAlert,
    CircleDollarSign
} from 'lucide-react';

import { authenticatedFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

import Header from '@/components/Header';
import StatCard from '@/components/SummaryCard';
import StokTable, { ProductItem } from '@/app/stokBarang/StokTable';

interface InventorySummary {
    total_sku: {
        count: number;
        trend_percentage: number;
    };
    low_stock_items: number;
    estimated_warehouse_value: number;
}

export default function StokBarang() {
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    const [products, setProducts] = useState<ProductItem[]>([]);
    const [summary, setSummary] = useState<InventorySummary | null>(null);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            // fetch stock data from api
            const [productsRes, summaryRes] = await Promise.all([
                authenticatedFetch('/inventory/products'),
                authenticatedFetch('/inventory/summary')
            ]);

            // process product data
            if (productsRes.ok) {
                const result = await productsRes.json();
                const rawProducts = Array.isArray(result) ? result : (result.items || result.data || []);

                const mappedProducts: ProductItem[] = rawProducts.map((item: any, index: number) => {
                    // Robustly extract stock data
                    const quantity = Number(item.stock?.quantity ?? item.quantity ?? 0);
                    const status = item.stock?.status || item.status || 'NORMAL';
                    const unit = item.stock?.unit || item.unit || 'Units';

                    // Status display logic
                    let color = 'bg-slate-500';
                    let percentage = Math.min(100, Math.max(0, quantity));

                    if (status === 'LOW') {
                        color = 'bg-red-500';
                        percentage = Math.max(15, quantity);
                    } else if (status === 'NORMAL') {
                        color = 'bg-emerald-600';
                    }

                    return {
                        id: item.id || index + 1,
                        name: item.name || item.product_name || "Produk Tanpa Nama",
                        subtitle: typeof item.category === 'object' ? item.category?.name : (item.category || "General"),
                        sku: item.sku || "NO-SKU",
                        category: typeof item.category === 'object' ? item.category?.name : (item.category || "General"),
                        stock: quantity,
                        status: status === 'LOW' ? 'Low Stock' : 'Optimal',
                        unit: unit,
                        price: new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0
                        }).format(item.price || 0),
                        stockPercentage: percentage,
                        color: color
                    };
                });
                setProducts(mappedProducts);
            }

            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setSummary(summaryData);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        fetchProducts();
    }, []);

    // STAT_CONFIG defined inside to access state
    const STAT_CONFIG = [
        {
            key: 'total_sku',
            title: "TOTAL SKU",
            value: (summary?.total_sku?.count ?? 0).toLocaleString(),
            subValue: "Total barang",
            subColor: "text-emerald-500",
            icon: <PackageSearch className="text-[#0D3B2E]" size={16} />,
            iconBg: "bg-[#D1E7E0]"
        },
        {
            key: 'low_stock_items',
            title: "STOK BARANG RENDAH",
            value: (summary?.low_stock_items ?? 0).toString(),
            subValue: "Butuh perhatian",
            subColor: (summary?.low_stock_items ?? 0) > 0 ? "text-red-500" : "text-gray-400",
            icon: <OctagonAlert className={(summary?.low_stock_items ?? 0) > 0 ? "text-red-600" : "text-[#8B4513]"} size={16} />,
            iconBg: (summary?.low_stock_items ?? 0) > 0 ? "bg-red-50" : "bg-[#FDE7E7]"
        },
        {
            key: 'estimated_warehouse_value',
            title: "ESTIMASI NILAI GUDANG",
            value: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
            }).format(summary?.estimated_warehouse_value ?? 0),
            subValue: "Perkiraan",
            subColor: "text-blue-500",
            icon: <CircleDollarSign className="text-[#0D3B2E]" size={16} />,
            iconBg: "bg-[#D1E7E0]"
        }
    ];

    if (!mounted) return null;

    return (
        <>
            <Header
                title="Stok Barang"
                description="Monitor stok persediaan barang dagangan dan status SKU produk"
            />

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {STAT_CONFIG.map((stat) => (
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

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D3B2E] mb-4"></div>
                    <p className="text-slate-500 font-medium">Memuat data produk...</p>
                </div>
            ) : (
                <StokTable products={products} />
            )}
        </>
    );
}