"use client";

import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';


export interface InventoryAlert {
  item_name: string;
  remaining_stock: number;
  unit: string;
  status: string;
}

interface StockWarningTableProps {
  items: InventoryAlert[];
}

interface StockKurangProps {
  label: string;
  warning: string;
  icon: React.ReactNode;
}

function StockKurang({ label, warning, icon }: StockKurangProps) {
  return (
    <div className="flex items-center gap-4">
      {icon}
      <div>
        <p className="text-sm font-bold text-[#0D3B2E]">{label}</p>
        <p className="text-[10px] text-red-500 font-medium">{warning}</p>
      </div>
    </div>
  );
}

export default function StockWarningSummary({ items }: StockWarningTableProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-[#0D3B2E]">Peringatan Stok Kurang</h3>
        <AlertTriangle className="text-rose-500" size={18} />
      </div>

      <div className="space-y-6">
        {items.map((item, index) => (
          <StockKurang
            key={index}
            label={item.item_name}
            warning={`Sisa ${item.remaining_stock} ${item.unit}`}
            icon={<div className="bg-orange-50 p-2 rounded text-orange-500"><Package size={16} /></div>}
          />
        ))}
      </div>

      <Link href="/stokBarang" className="block mt-8">
        <Button
          variant="danger"
          className="w-full bg-[#0F172A] hover:bg-black text-white py-3">
          Inventory Report
        </Button>
      </Link>
    </div>
  );
}
