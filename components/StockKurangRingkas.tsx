import React from 'react';

interface StockKurangRingkasProps {
  label: string;
  warning: string;
  icon: React.ReactNode;
}

export default function StockKurangRingkas({ label, warning, icon }: StockKurangRingkasProps) {
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
