"use client";

import React from 'react';

interface ReportDateRangeProps {
    startDate: string;
    endDate: string;
    onStartChange: (val: string) => void;
    onEndChange: (val: string) => void;
}

export default function ReportDateRange({ startDate, endDate, onStartChange, onEndChange }: ReportDateRangeProps) {
    return (
        <section className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
                <span className="w-6 h-6 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="font-semibold text-lg text-black">Pilih Periode</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] uppercase font-bold text-black mb-1 tracking-wider">Tanggal Mulai</label>
                    <div className="relative">
                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#064e3b]"
                            value={startDate}
                            onChange={(e) => onStartChange(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] uppercase font-bold text-black mb-1 tracking-wider">Tanggal Selesai</label>
                    <div className="relative">
                        <input
                            type="date"
                            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-black/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#064e3b]"
                            value={endDate}
                            onChange={(e) => onEndChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
