"use client";

import { FileText, MoreVertical, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { authenticatedFetch } from '@/lib/api';

export interface DocumentItem {
    id: string;
    name: string;
    size: number;
    category: string;
    upload_date: string;
    status: string;
}

export default function DocumentLibrary() {
    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await authenticatedFetch('/knowledge/documents');

            if (response.ok) {
                const result = await response.json();
                console.log('DocumentLibrary raw response:', JSON.stringify(result, null, 2));
                const rawDocs = result || [];

                const mappedDocs: DocumentItem[] = rawDocs.map((item: any) => ({
                    id: item.id,
                    name: item.file_name,
                    size: item.file_size,
                    category: item.category,
                    date: item.upload_date.split('T')[0],
                    status: item.status
                }));

                setDocuments(mappedDocs);
            } else {
                const errorBody = await response.text();
                console.error(`DocumentLibrary fetch failed [${response.status}]:`, errorBody);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Perpustakaan Dokumen</h3>
                <Button variant="outline" size="sm" onClick={fetchDocuments} disabled={isLoading} className="text-emerald-700 font-bold h-8 border-none bg-transparent hover:bg-emerald-50">
                    {isLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                    Refresh
                </Button>
            </div>

            <div className="overflow-x-auto">
                {isLoading && documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-emerald-600 mb-4" size={32} />
                        <p className="text-slate-500 font-medium">Memuat data dokumen...</p>
                    </div>
                ) : (
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
                            {documents.length > 0 ? (
                                documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <FileText size={20} className="text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase">{doc.size}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{doc.upload_date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${doc.status === 'Indexed' || doc.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-orange-400'}`}></div>
                                                <span className="text-xs text-gray-700">{doc.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                                        Belum ada dokumen yang diunggah
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <p className="text-xs text-slate-400">Total {documents.length} dokumen</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>Previous</Button>
                    <Button variant="outline" size="sm" disabled={documents.length < 10}>Next</Button>
                </div>
            </div>
        </div>
    );
}
