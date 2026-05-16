"use client";

import { Download, History, Loader2, Calendar, FileText, FileSpreadsheet } from 'lucide-react';

export interface ReportHistoryItem {
    report_id: string;
    report_type: string;
    format: string;
    start_date: string;
    end_date: string;
    created_at: string;
    status: string;
}

interface ReportHistoryTableProps {
    history: ReportHistoryItem[];
    isLoading: boolean;
    onRefresh: () => void;
    onDownload: (id: string, type: string, format: string) => void;
}

export default function ReportHistoryTable({ 
    history, 
    isLoading, 
    onRefresh, 
    onDownload 
}: ReportHistoryTableProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#0D3B2E] rounded-lg">
                        <History size={18} className="text-white" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg">Riwayat Laporan</h3>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="text-sm font-bold text-[#0D3B2E] hover:bg-[#0D3B2E]/5 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Perbarui Data
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-white border-b border-gray-100">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Dibuat</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tipe Laporan</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Periode</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Format</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <Loader2 className="animate-spin mx-auto mb-2 text-[#0D3B2E]" size={24} />
                                    <p className="text-sm font-medium">Memuat riwayat...</p>
                                </td>
                            </tr>
                        ) : history.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    <div className="mb-3 text-gray-300 flex justify-center">
                                        <FileText size={48} />
                                    </div>
                                    <p className="text-sm font-medium">Belum ada riwayat laporan</p>
                                    <p className="text-xs text-gray-400 mt-1">Laporan yang Anda buat akan muncul di sini</p>
                                </td>
                            </tr>
                        ) : (
                            history.map((item) => (
                                <tr key={item.report_id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800">
                                                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                            <span className="text-[11px] text-gray-400">
                                                {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                            {item.report_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                            <Calendar size={14} className="text-gray-400" />
                                            {item.start_date} - {item.end_date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.format.toUpperCase() === 'PDF' ? (
                                            <div className="flex items-center gap-1.5 text-red-600">
                                                <FileText size={16} />
                                                <span className="text-xs font-bold tracking-tight">PDF</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-emerald-600">
                                                <FileSpreadsheet size={16} />
                                                <span className="text-xs font-bold tracking-tight">XLSX</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                                                item.status === 'FAILED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => onDownload(item.report_id, item.report_type, item.format)}
                                            className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 hover:bg-slate-100 text-[#0D3B2E] text-xs font-bold rounded-lg border border-slate-200 transition-all"
                                        >
                                            <Download size={14} />
                                            Unduh
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
