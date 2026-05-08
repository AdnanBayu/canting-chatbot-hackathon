import {
    MoreVertical,
    ListFilter,
    Filter
} from 'lucide-react';

export interface Product {
    id: number;
    name: string;
    subtitle: string;
    sku: string;
    category: string;
    stock: number;
    unit: string;
    status: string;
    price: string;
    stockPercentage: number;
    color: string;
}

interface CatalogTableProps {
    products: Product[];
}

export default function CatalogTable({ products }: CatalogTableProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Katalog Produk</h3>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-md transition-colors">
                        <ListFilter size={18} className="text-slate-500" />
                    </button>
                    <button className="p-2 hover:bg-slate-200 rounded-md transition-colors">
                        <Filter size={18} className="text-slate-500" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4">Detail Produk</th>
                            <th className="px-6 py-4">SKU</th>
                            <th className="px-6 py-4">Kategori</th>
                            <th className="px-6 py-4">Jumlah Stok</th>
                            <th className="px-6 py-4">Harga</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded bg-slate-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full bg-indigo-900 opacity-80"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-700">{product.name}</p>
                                            <p className="text-xs text-slate-400">{product.subtitle}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-tight">
                                        {product.sku}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm text-slate-600">{product.category}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="max-w-[180px]">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className={`text-[11px] font-bold ${product.status === 'Low Stock' ? 'text-red-500' : 'text-slate-600'}`}>
                                                {product.stock} {product.unit}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">{product.status}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${product.color}`}
                                                style={{ width: `${product.stockPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-semibold text-sm text-slate-700">
                                    {product.price}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-400 group-hover:text-slate-600">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <p className="text-xs text-slate-400">Showing 1-{products.length} of 1,248 products</p>
                <div className="flex items-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
                        <span className="text-xs font-bold flex items-center gap-1">Previous</span>
                    </button>
                    <button className="w-8 h-8 rounded bg-[#064E3B] text-white text-xs font-bold">1</button>
                    <button className="w-8 h-8 rounded hover:bg-slate-200 text-slate-500 text-xs font-bold">2</button>
                    <button className="w-8 h-8 rounded hover:bg-slate-200 text-slate-500 text-xs font-bold">3</button>
                    <button className="p-1.5 text-slate-600 hover:text-black">
                        <span className="text-xs font-bold flex items-center gap-1">Next</span>
                    </button>
                </div>
            </div>
        </div>
    );
}