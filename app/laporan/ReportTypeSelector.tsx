"use client";

import React from 'react';

export interface ReportOption {
    id: string;
    title: string;
    desc: string;
}

interface ReportTypeSelectorProps {
    options: ReportOption[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export default function ReportTypeSelector({ options, selectedId, onSelect }: ReportTypeSelectorProps) {
    return (
        <section className="lg:col-span-5 bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-fit">
            <div className="flex items-center space-x-3 mb-6">
                <span className="w-6 h-6 rounded-full bg-[#064e3b] text-white flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="font-semibold text-lg text-black">Tipe Data</h3>
            </div>
            <div className="space-y-3">
                {options.map((opt) => (
                    <label
                        key={opt.id}
                        className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${selectedId === opt.id ? 'border-[#064e3b] bg-emerald-50/30' : 'border-gray-100 hover:border-gray-200'
                            }`}
                    >
                        <input
                            type="radio"
                            name="reportType"
                            className="mt-1 h-4 w-4 accent-[#064e3b]"
                            checked={selectedId === opt.id}
                            onChange={() => onSelect(opt.id)}
                        />
                        <div className="ml-4">
                            <p className="font-medium text-sm text-slate-900">{opt.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        </section>
    );
}
