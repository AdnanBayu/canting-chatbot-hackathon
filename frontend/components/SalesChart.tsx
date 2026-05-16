"use client";

import React, { useEffect, useState } from 'react';

/**
 * Mockup data for Sales Trends
 * revenue: height for Revenue (Pendapatan)
 * target: height for Target
 */
const MOCK_SALES_DATA = [
  { day: 'Senin', revenue: '70%', target: '85%' },
  { day: 'Selasa', revenue: '85%', target: '95%' },
  { day: 'Rabu', revenue: '95%', target: '100%' },
  { day: 'Kamis', revenue: '75%', target: '88%' },
  { day: 'Jumat', revenue: '90%', target: '95%' },
  { day: 'Sabtu', revenue: '100%', target: '100%' },
  { day: 'Minggu', revenue: '60%', target: '90%' },
];

export default function SalesChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure the transition is visible after mount
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-bold text-[#0D3B2E]">Tren Penjualan</h3>
        <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#0D3B2E]"></div> Pendapatan
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#D1E7E0]"></div> Target
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between h-48 gap-2">
        {MOCK_SALES_DATA.map((item) => (
          <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group h-full">
            {/* Bar Container - flex-1 ensures it takes the available vertical space */}
            <div className="w-full relative flex-1 flex flex-col justify-end bg-gray-50/50 rounded-t-md overflow-hidden">
              {/* Target Bar */}
              <div
                style={{ height: mounted ? item.target : '0%' }}
                className="absolute bottom-0 w-full bg-[#D1E7E0] opacity-50 transition-all duration-700 ease-out"
              />
              {/* Revenue Bar */}
              <div
                style={{ height: mounted ? item.revenue : '0%' }}
                className="absolute bottom-0 w-full bg-[#0D3B2E] transition-all duration-700 delay-100 ease-out group-hover:bg-[#155a47] shadow-sm"
              />
            </div>
            {/* Label */}
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
