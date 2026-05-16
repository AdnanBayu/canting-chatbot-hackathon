"use client";

import React from 'react';
import { FileText, FileSpreadsheet, Loader2 } from 'lucide-react';

interface ReportDownloadOptionsProps {
    onDownload: (format: 'pdf' | 'excel') => void;
    isGenerating: boolean;
}

export default function ReportDownloadOptions({ onDownload, isGenerating }: ReportDownloadOptionsProps) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex-1">
            <div className="flex items-center space-x-3 mb-8">
                <span className="w-6 h-6 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-xs font-bold">3</span>
                <h3 className="font-semibold text-lg text-black">Buat Laporan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF Option */}
                <div className="border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center text-center justify-between">
                    <div className="mb-4">
                        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-500 mb-3 mx-auto">
                            <FileText size={28} />
                        </div>
                        <h4 className="font-bold text-slate-900">Laporan PDF</h4>
                        <p className="text-xs text-gray-500 mt-1">Laporan visual untuk dicetak atau presentasi.</p>
                    </div>
                    <button 
                        onClick={() => onDownload('pdf')}
                        disabled={isGenerating}
                        className="w-full bg-[#064e3b] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#053d2e] transition-colors uppercase tracking-wide flex items-center justify-center"
                    >
                        {isGenerating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                        {isGenerating ? 'Generating...' : 'Download PDF'}
                    </button>
                </div>

                {/* Excel Option */}
                <div className="border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center text-center justify-between">
                    <div className="mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-3 mx-auto">
                            <FileSpreadsheet size={28} />
                        </div>
                        <h4 className="font-bold text-slate-900">Laporan Excel</h4>
                        <p className="text-xs text-gray-500 mt-1">Data mentah untuk analisis.</p>
                    </div>
                    <button 
                        onClick={() => onDownload('excel')}
                        disabled={isGenerating}
                        className="w-full border border-[#064e3b] text-[#064e3b] py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors uppercase tracking-wide flex items-center justify-center"
                    >
                        {isGenerating ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                        {isGenerating ? 'Generating...' : 'Download XLSX'}
                    </button>
                </div>
            </div>
        </section>
    );
}