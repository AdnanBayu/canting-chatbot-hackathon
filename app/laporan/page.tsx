"use client";

import { useState } from 'react';
import ReportTypeSelector, { ReportOption } from '@/app/laporan/ReportTypeSelector';
import ReportDateRange from '@/app/laporan/ReportDateRange';
import ReportDownloadOptions from '@/app/laporan/ReportDownloadOptions';

const REPORT_OPTIONS: ReportOption[] = [
    { id: 'sales', title: 'Laporan Sales', desc: 'Pendapatan, produk, dan penjualan.' },
    { id: 'refunds', title: 'Pengembalian dan Refunds', desc: 'Catatan pengembalian dan refund yang telah diproses.' },
    { id: 'complaints', title: 'Komplain Pelanggan', desc: 'Status penyelesaian dan pendapat.' },
    { id: 'payments', title: 'Bukti Pembayaran', desc: 'Catatan bukti transaksi bank.' },
];

export default function Laporan() {
    const [reportType, setReportType] = useState('sales');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    return (
        <main className="flex flex-col">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-[#0D3B2E]">Laporan</h2>
                <p className="text-sm text-gray-500">Kelola dan undur data operasional bisnis anda untuk analisis eksternal</p>
            </header>

            {/* Report Builder Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                {/* Step 1: Type Selection */}
                <ReportTypeSelector
                    options={REPORT_OPTIONS}
                    selectedId={reportType}
                    onSelect={setReportType}
                />

                <div className="lg:col-span-7 flex flex-col gap-6">
                    {/* Step 2: Date Picker */}
                    <ReportDateRange
                        startDate={startDate}
                        endDate={endDate}
                        onStartChange={setStartDate}
                        onEndChange={setEndDate}
                    />

                    {/* Step 3: Action Buttons */}
                    <ReportDownloadOptions />
                </div>
            </div>
        </main>
    );
}