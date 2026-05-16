"use client";

import Header from '@/components/Header';
import KnowledgeUpload from '@/app/pengetahuanProduk/KnowledgeUpload';
import DocumentLibrary from '@/app/pengetahuanProduk/DocumentLibrary';

export default function PengetahuanProduk() {
    return (
        <main className="flex flex-col">
            <Header
                title="Pengetahuan Produk"
                description="Kelola informasi pengetahuan chatbot mengenai spesifikasi, pola batik, teknik batik, dan lain-lain"
            />

            <div className="grid grid-cols-12 gap-6">
                {/* Upload Section */}
                <div className="col-span-12">
                    <KnowledgeUpload />
                </div>

                {/* Document Library */}
                <div className="col-span-12">
                    <DocumentLibrary />
                </div>
            </div>
        </main>
    )
}