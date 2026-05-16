"use client";

import { useState } from 'react';
import { authenticatedFetch } from '@/lib/api';

import Header from '@/components/Header';
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
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async (format: 'pdf' | 'excel') => {
        try {
            setIsGenerating(true);

            // Step 1: Generate the report (POST)
            const generateRes = await authenticatedFetch('/reports/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report_type: reportType === 'payments' ? 'RECEIPTS' : reportType.toUpperCase(),
                    format: format === 'pdf' ? 'PDF' : 'XLSX',
                    start_date: startDate,
                    end_date: endDate
                })
            });

            if (!generateRes.ok) {
                const errorData = await generateRes.text().catch(() => 'No response body');
                throw new Error(`Failed to start report generation (Status: ${generateRes.status}). Details: ${errorData}`);
            }

            const { report_id } = await generateRes.json();

            if (!report_id) {
                throw new Error('API did not return a report_id');
            }

            // Step 2: Download the report (GET)
            const downloadRes = await authenticatedFetch(`/reports/download/${report_id}`, {
                method: 'GET'
            });

            if (!downloadRes.ok) {
                throw new Error('Failed to download the generated report');
            }

            // Handle the response as a blob for download
            const blob = await downloadRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;

            // Set filename based on type and date
            const filename = `laporan-${reportType}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
            a.download = filename;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Gagal membuat laporan. Silakan coba lagi.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="flex flex-col">
            <Header
                title="Laporan"
                description="Kelola dan undur data operasional bisnis anda untuk analisis eksternal"
            />

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
                    <ReportDownloadOptions
                        onDownload={handleDownload}
                        isGenerating={isGenerating}
                    />
                </div>
            </div>
        </main>
    );
}