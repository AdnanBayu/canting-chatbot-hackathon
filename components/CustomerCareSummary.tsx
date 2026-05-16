"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";

export interface CustomerCareAPI {
  pending_tickets: number;
  resolved_today: number;
}

interface CustomerCareTableProps {
  complaintsCount: number;
  refundsCount: number;
  isLoading?: boolean;
}

export default function CustomerCareSummary({
  complaintsCount,
  refundsCount,
  isLoading = false
}: CustomerCareTableProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="font-bold text-[#0D3B2E] mb-6">Customer Care</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#F8FAFB] p-4 rounded-lg">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Komplain</p>
          {isLoading ? <p className="text-2xl font-bold">...</p> : <p className="text-2xl font-bold text-rose-600">{complaintsCount}</p>}
          <p className="text-[10px] text-gray-400 mt-1">Menunggu penyelesaian</p>
        </div>
        <div className="bg-[#F8FAFB] p-4 rounded-lg">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Refunds</p>
          {isLoading ? <p className="text-2xl font-bold">...</p> : <p className="text-2xl font-bold text-[#0D3B2E]">{refundsCount}</p>}
          <p className="text-[10px] text-gray-400 mt-1">Minggu ini</p>
        </div>
      </div>
      <Link href="/komplain">
        <Button
          variant="primary"
          className="w-full font-bold text-slate-600 border-slate-200"
        >
          Manage Tickets
        </Button>
      </Link>
    </div>
  );
}
