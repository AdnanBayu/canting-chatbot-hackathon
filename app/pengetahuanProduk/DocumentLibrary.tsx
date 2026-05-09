"use client";

import { FileText, MoreVertical } from 'lucide-react';
import { Button } from "@/components/ui/button";

export interface DocumentItem {
    name: string;
    size: string;
    date: string;
    status: string;
}

interface DocumentLibraryProps {
    documents: DocumentItem[];
}

export default function DocumentLibrary({ documents }: DocumentLibraryProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Perpustakaan Dokumen</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="px-6 py-4 font-bold">NAMA DOKUMEN</th>
                            <th className="px-6 py-4 font-bold">TANGGAL UNGGAH</th>
                            <th className="px-6 py-4 font-bold">STATUS</th>
                            <th className="px-6 py-4 text-center font-bold">AKSI</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {documents.map((doc, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <FileText size={20} className="text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase">{doc.size}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">{doc.date}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 rounded-full ${doc.status === 'Indexed' ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>
                                        <span className="text-xs text-gray-700">{doc.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                        <MoreVertical size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <p className="text-xs text-slate-400">Menampilkan 10 dari {documents.length} produk</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
            </div>
        </div>
    );
}
