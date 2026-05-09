"use client";

import React from 'react';
import { BookOpen, Copy } from 'lucide-react';

export interface ShipmentLogItem {
    title: string;
    description: string;
    time: string;
    current: boolean;
}

interface ShipmentLogsProps {
    logs: ShipmentLogItem[];
}

export default function ShipmentLogs({ logs }: ShipmentLogsProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                    <div className="p-1 bg-emerald-50 text-emerald-900 rounded">
                        <BookOpen size={16} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Catatan Pengiriman</h3>
                </div>
                <button className="flex items-center space-x-1 text-xs font-bold text-gray-400 hover:text-slate-600 transition-colors uppercase tracking-tight">
                    <Copy size={12} />
                    <span>Copy Receipt ID</span>
                </button>
            </div>

            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                {logs.map((log, idx) => (
                    <div key={idx} className="relative flex items-start pl-8 group">
                        {/* Timeline Node */}
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 transition-all ${log.current ? 'bg-emerald-900 scale-110' : 'bg-gray-200'}`}>
                            {log.current && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-bold ${log.current ? 'text-slate-900' : 'text-gray-500'}`}>
                                    {log.title}
                                </h4>
                                <span className="text-xs text-gray-400 font-medium">{log.time}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-md">
                                {log.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
