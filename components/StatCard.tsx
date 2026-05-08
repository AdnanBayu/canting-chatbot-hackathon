import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  subColor: string;
  progress?: number;
  showProgress?: boolean;
  caption?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function StatCard({ 
  title, 
  value, 
  subValue, 
  subColor, 
  progress, 
  showProgress = true, 
  caption, 
  icon, 
  iconBg 
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{title}</p>
        <div className={`${iconBg} p-2 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <h4 className="text-2xl font-bold text-[#0D3B2E]">{value}</h4>
        <span className={`text-[10px] font-bold ${subColor}`}>{subValue}</span>
        {subValue.includes('+') && <span className="text-emerald-500 text-[10px]">↑</span>}
      </div>
      {showProgress ? (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div style={{ width: `${progress}%` }} className="h-full bg-[#0D3B2E]"></div>
        </div>
      ) : (
        <p className="text-[10px] text-gray-400">{caption}</p>
      )}
    </div>
  );
}
