"use client";

interface SidebarProfileProps {
  namaPemilik: string;
  namaUMKM: string;
}

export default function SidebarProfile({ namaPemilik, namaUMKM }: SidebarProfileProps) {
  return (
    <div className="p-6 border-t border-gray-100 flex items-center gap-3 bg-white">
      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100 shadow-sm">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${namaPemilik}`} alt={namaPemilik} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate">{namaPemilik}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium truncate">{namaUMKM}</p>
      </div>
    </div>
  );
}
