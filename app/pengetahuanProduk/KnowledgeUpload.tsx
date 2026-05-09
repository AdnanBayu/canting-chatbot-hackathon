"use client";

import React from 'react';
import { Upload, FileText, X } from 'lucide-react';

export default function KnowledgeUpload() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2 text-gray-700">
                    <Upload size={18} />
                    <span className="font-semibold text-sm">Tambah Pengetahuan</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">PDF, DOCX, TXT (Maksimal 50MB)</span>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-lg py-16 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/20 transition-all">
                <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                    <Upload className="text-emerald-800" size={24} />
                </div>
                <p className="text-sm font-bold text-gray-700">Drag and drop your files here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse from your computer</p>
            </div>

            <div className="flex space-x-4 mt-6">
                <div className="flex-1 flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <FileText className="text-emerald-700" size={20} />
                        <div>
                            <p className="text-xs font-bold text-gray-800">Soga_Dyeing_Manual_v2.pdf</p>
                            <p className="text-[10px] text-gray-500 uppercase">4.2 MB</p>
                        </div>
                    </div>
                    <X size={16} className="text-red-500 cursor-pointer" />
                </div>
                <div className="flex-1 flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                        <FileText className="text-emerald-700" size={20} />
                        <div>
                            <p className="text-xs font-bold text-gray-800">Parang_Sogan_Pattern_Specs.docx</p>
                            <p className="text-[10px] text-gray-500 uppercase">1.8 MB</p>
                        </div>
                    </div>
                    <X size={16} className="text-red-500 cursor-pointer" />
                </div>
            </div>
        </div>
    );
}
