"use client";

import { useEffect, useState } from 'react';
import { authenticatedFetch } from '@/lib/api';


import Header from '@/components/Header';
import ReportTypeSelector, { ReportOption } from '@/app/laporan/ReportTypeSelector';
import ReportDateRange from '@/app/laporan/ReportDateRange';
import ReportDownloadOptions from '@/app/laporan/ReportDownloadOptions';
import ReportHistoryTable, { ReportHistoryItem } from '@/app/laporan/ReportHistoryTable';

const REPORT_OPTIONS: ReportOption[] = [
    { id: 'sales', title: 'Laporan Sales', desc: 'Pendapatan, produk, dan penjualan.' },
    { id: 'refunds', title: 'Pengembalian dan Refunds', desc: 'Catatan pengembalian dan refund yang telah diproses.' },
    { id: 'complaints', title: 'Komplain Pelanggan', desc: 'Status penyelesaian dan pendapat.' },
    { id: 'payments', title: 'Bukti Pembayaran', desc: 'Catatan bukti transaksi bank.' },
];

// Type moved to ReportHistoryTable.tsx

export default function Laporan() {
    const [reportType, setReportType] = useState('sales');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState<ReportHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    const fetchHistory = async () => {
        try {
            setIsLoadingHistory(true);
            const res = await authenticatedFetch('/reports/history/');
            if (res.ok) {
                const data = await res.json();
                setHistory(Array.isArray(data) ? data : (data.data || []));
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleDownload = async (format: 'pdf' | 'excel') => {
        try {
            setIsGenerating(true);

            // Step 1: Generate the report (POST)
            // Updated to use /proxy as requested
            const generateRes = await authenticatedFetch('/reports/generate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report_type: reportType === 'payments' ? 'PAYMENTS' : reportType.toUpperCase(),
                    format: format === 'pdf' ? 'PDF' : 'XLSX',
                    start_date: startDate,
                    end_date: endDate
                })
            });

            if (!generateRes.ok) {
                const errorData = await generateRes.text().catch(() => 'No response body');
                throw new Error(`Failed to start report generation (Status: ${generateRes.status}). Details: ${errorData}`);
            }

            const responseText = await generateRes.text();
            console.log('Generate report raw response:', responseText);

            let report_id: string | undefined;

            try {
                const data = JSON.parse(responseText);
                // Try all common ID field names
                report_id = data.report_id || data.id || data.reportId || data.report_uuid ||
                    (data.data && (data.data.report_id || data.data.id || data.data.reportId));
            } catch (e) {
                // If not JSON, maybe it's the raw ID string
                const trimmed = responseText.trim();
                if (trimmed && trimmed.length > 5 && !trimmed.includes(' ')) {
                    report_id = trimmed;
                }
            }

            // Fallback: check Location header
            if (!report_id) {
                const locationHeader = generateRes.headers.get('Location');
                if (locationHeader) {
                    const parts = locationHeader.split('/');
                    report_id = parts[parts.length - 1];
                }
            }

            if (!report_id) {
                console.error('Failed to extract report_id from:', responseText);
                throw new Error('API did not return a valid report_id. Response: ' + responseText.substring(0, 100));
            }

            // Step 2: Download the report (GET)
            // Updated to use /proxy as requested
            const downloadRes = await authenticatedFetch(`/reports/download/${report_id}/`, {
                method: 'GET'
            });

            if (!downloadRes.ok) {
                throw new Error('Failed to download the generated report');
            }

            // Refresh history after successful generation
            fetchHistory();

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

    const downloadExistingReport = async (report_id: string, type: string, format: string) => {
        try {
            const downloadRes = await authenticatedFetch(`/reports/download/${report_id}/`, {
                method: 'GET'
            });

            if (!downloadRes.ok) {
                throw new Error('Failed to download the report');
            }

            const blob = await downloadRes.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `laporan-${type.toLowerCase()}-${report_id.substring(0, 8)}.${format.toLowerCase() === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading existing report:', error);
            alert('Gagal mengunduh laporan.');
        }
    };

    return (
        <main className="flex flex-col pb-12">
            <Header
                title="Laporan & Ekspor"
                description="Kelola dan unduh data operasional bisnis anda untuk analisis eksternal"
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

            {/* History Section */}
            <ReportHistoryTable
                history={history}
                isLoading={isLoadingHistory}
                onRefresh={fetchHistory}
                onDownload={downloadExistingReport}
            />
        </main>
    );
}