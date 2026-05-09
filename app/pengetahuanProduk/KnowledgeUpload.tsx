"use client";

import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface LocalFile {
    id: string;
    name: string;
    size: string;
    status: 'idle' | 'uploading' | 'success';
}

export default function KnowledgeUpload() {
    const [files, setFiles] = useState<LocalFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                status: 'idle' as const
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const simulateUpload = () => {
        setFiles(prev => prev.map(f => ({ ...f, status: 'uploading' })));

        // Mocking backend processing delay
        setTimeout(() => {
            setFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
        }, 2000);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".pdf,.docx,.txt"
            />

            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2 text-[#0D3B2E]">
                    <Upload size={18} />
                    <span className="font-bold text-sm">Tambah Pengetahuan Baru</span>
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    PDF, DOCX, TXT (MAX 50MB)
                </span>
            </div>

            <div
                onClick={triggerFileInput}
                className="border-2 border-dashed border-gray-100 rounded-2xl py-12 flex flex-col items-center justify-center bg-gray-50/30 cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/20 transition-all group"
            >
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Upload className="text-emerald-800" size={28} />
                </div>
                <p className="text-sm font-bold text-slate-800">Klik atau seret file ke sini</p>
                <p className="text-xs text-gray-400 mt-2">Pastikan format file sesuai untuk hasil training maksimal</p>
            </div>

            {files.length > 0 && (
                <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">File Terpilih</h4>
                        <button
                            onClick={() => setFiles([])}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                        >
                            Hapus Semua
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg ${file.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                        <FileText size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate max-w-[150px]">{file.name}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{file.size}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {file.status === 'uploading' && <Loader2 className="animate-spin text-emerald-600" size={16} />}
                                    {file.status === 'success' && <CheckCircle2 className="text-emerald-500" size={16} />}
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1 hover:bg-rose-50 hover:text-rose-500 rounded-md transition-colors text-gray-300"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        size='md'
                        onClick={simulateUpload}
                        disabled={files.every(f => f.status === 'success') || files.some(f => f.status === 'uploading')}
                        className="w-full mt-6 py-6 bg-[#0D3B2E] hover:bg-[#155a47] text-white font-bold text-sm shadow-xl shadow-emerald-900/10"
                    >
                        {files.some(f => f.status === 'uploading') ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memproses Pengetahuan...
                            </>
                        ) : files.every(f => f.status === 'success') ? (
                            'Pengetahuan Berhasil Ditambahkan'
                        ) : (
                            'Train Chatbot Sekarang'
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}