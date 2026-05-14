"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import StockKurang from './StockKurang';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

interface StockWarningSummaryProps {
  items: {
    label: string;
    warning: string;
    icon: React.ReactNode;
  }[];
}

export default function StockWarningSummary({ items }: StockWarningSummaryProps) {
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
            label={item.label}
            warning={item.warning}
            icon={item.icon}
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
