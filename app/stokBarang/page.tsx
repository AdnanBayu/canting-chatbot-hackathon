"use client";

import {
    PackageSearch,
    OctagonAlert,
    CircleDollarSign
} from 'lucide-react';

import StatCard from '@/components/SummaryCard';
import StokTable, { ProductItem } from '@/app/stokBarang/StokTable';
import { authenticatedFetch } from '@/lib/api';
import { useEffect, useState, useMemo } from 'react';

export default function StokBarang() {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await authenticatedFetch('/dashboard/products');
            const result = await response.json();
            
            if (result && result.items) {
                const mappedProducts: ProductItem[] = result.items.map((item: any, index: number) => {
                    // Sum up all variants to get total stock
                    const totalStock = Object.values(item.stock_variants || {}).reduce((acc: number, qty: any) => acc + (Number(qty) || 0), 0);
                    
                    // Simple logic for status display
                    let displayStatus = 'Normal';
                    let color = 'bg-slate-500';
                    let percentage = Math.min(100, Math.max(0, totalStock)); // Simplified percentage

                    if (totalStock < 15) {
                        displayStatus = 'Low Stock';
                        color = 'bg-red-500';
                        percentage = Math.max(15, totalStock); // Ensure some bar visibility
                    } else if (totalStock > 50) {
                        displayStatus = 'Optimal';
                        color = 'bg-emerald-600';
                    }

                    return {
                        id: index + 1,
                        name: item.name,
                        subtitle: item.category,
                        sku: item.sku,
                        category: item.category,
                        stock: totalStock,
                        unit: 'Units',
                        status: displayStatus,
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
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const stats = useMemo(() => {
        const totalSku = products.length;
        const lowStockCount = products.filter(p => p.status === 'Low Stock').length;
        const totalValue = products.reduce((acc, p) => {
            const numericPrice = parseInt(p.price.replace(/[^0-9]/g, '')) || 0;
            return acc + (numericPrice * p.stock);
        }, 0);

        return {
            totalSku,
            lowStockCount,
            totalValue: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                notation: 'compact',
                maximumFractionDigits: 1
            }).format(totalValue)
        };
    }, [products]);

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
                    value={stats.totalSku.toLocaleString()}
                    subValue="Total Items"
                    subColor="text-emerald-500"
                    progress={100}
                    icon={<PackageSearch className="text-[#0D3B2E]" size={16} />}
                    iconBg="bg-[#D1E7E0]"
                />
                <StatCard
                    title="STOK BARANG RENDAH"
                    value={stats.lowStockCount.toString()}
                    subValue="Requires Attention"
                    subColor={stats.lowStockCount > 0 ? "text-red-500" : "text-gray-400"}
                    progress={stats.lowStockCount > 0 ? 80 : 0}
                    icon={<OctagonAlert className={stats.lowStockCount > 0 ? "text-red-600" : "text-[#8B4513]"} size={16} />}
                    iconBg={stats.lowStockCount > 0 ? "bg-red-50" : "bg-[#FDE7E7]"}
                />
                <StatCard
                    title="ESTIMASI NILAI GUDANG"
                    value={stats.totalValue}
                    subValue="Estimated"
                    subColor="text-blue-500"
                    showProgress={false}
                    caption="Current stock value"
                    icon={<CircleDollarSign className="text-[#0D3B2E]" size={16} />}
                    iconBg="bg-[#D1E7E0]"
                />
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
    )
}