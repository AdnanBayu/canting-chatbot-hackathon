"use client";

import { Button } from "@/components/ui/button";

const statusStyles = {
  DIKIRIM: 'bg-[#D1E7E0] text-black',
  DIPROSES: 'bg-orange-200 text-black',
  TUNDA: 'bg-yellow-200 text-black',
  DITOLAK: 'bg-red-200 text-black',
}

export interface PesananItem {
  id: string;
  name: string;
  product: string;
  status: keyof typeof statusStyles;
  amount: string;
}

interface PesananTableProps {
  data: PesananItem[];
  showAction?: boolean;
  showHead?: boolean;
  showPage?: boolean;
}

export default function PesananTable({ data, showAction, showHead, showPage }: PesananTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {showHead && <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-700">Daftar Pesanan</h3>
      </div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4 font-bold">ID Pesanan</th>
              <th className="px-6 py-4 font-bold">Pelanggan</th>
              <th className="px-6 py-4 font-bold">Produk</th>
              <th className="px-6 py-4 font-bold">Status</th>
              <th className="px-6 py-4 font-bold">Total</th>
              {showAction && <th className="px-6 py-4 font-bold text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-[#0D3B2E]">{item.id}</td>
                <td className="px-6 py-4 text-gray-500">{item.name}</td>
                <td className="px-6 py-4 text-gray-500">{item.product}</td>
                <td className="px-6 py-4">
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full
                    ${statusStyles[item.status] ?? 'bg-gray-200 text-black'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-[#0D3B2E]">{item.amount}</td>
                {showAction && (
                  <td className="px-6 py-4 text-center">
                    <Button size="sm">
                      Aksi
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        {showPage && <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <p className="text-xs text-slate-400">Menampilkan 10 dari {data.length} pesanan</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>}
      </div>
    </div>
  );
}
