"use client";

import { useState } from 'react';
import KnowledgeUpload from '@/components/KnowledgeUpload';
import DocumentLibrary, { DocumentItem } from '@/components/DocumentLibrary';

const DOCUMENTS: DocumentItem[] = [
    { name: 'Soga_Dyeing_Manual_v2.pdf', size: '4.2 MB', category: 'Teknik Batik', date: '24 Jan 2024', status: 'Indexed' },
    { name: 'Parang_Sogan_Pattern_Specs.docx', size: '1.8 MB', category: 'Spesifikasi Pola', date: '22 Jan 2024', status: 'Indexed' },
    { name: 'Sejarah_Batik_Surabaya.pdf', size: '12.5 MB', category: 'Filosofi & Sejarah', date: '15 Jan 2024', status: 'Processing' },
    { name: 'Manual_Canting_Elektrik.pdf', size: '2.1 MB', category: 'Alat & Bahan', date: '10 Jan 2024', status: 'Indexed' },
];

export default function PengetahuanProduk() {
    const [documents] = useState<DocumentItem[]>(DOCUMENTS);

    return (
        <main className="flex flex-col">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-[#0D3B2E]">Pengetahuan Produk</h2>
                <p className="text-sm text-gray-500">Kelola informasi pengetahuan chatbot mengenai spesifikasi, pola batik, teknik batik, dan lain-lain</p>
            </header>

            <div className="grid grid-cols-12 gap-6">
                {/* Upload Section */}
                <div className="col-span-12">
                    <KnowledgeUpload />
                </div>

                {/* Document Library */}
                <div className="col-span-12">
                    <DocumentLibrary documents={documents} />
                </div>
            </div>
        </main>
    )
}