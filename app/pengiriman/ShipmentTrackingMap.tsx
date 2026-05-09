"use client";

import React from 'react';
import { Truck } from 'lucide-react';

export default function ShipmentTrackingMap() {
    return (
        <div className="bg-[#E5E7EB] rounded-2xl h-[320px] relative overflow-hidden shadow-inner border border-gray-200">
            {/* Fake Map Grid Background */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>

            {/* Route Line SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <path
                    d="M 150 200 Q 400 100 700 150"
                    stroke="#064e3b"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray="6 4"
                />
            </svg>

            {/* Location Pins */}
            <div className="absolute left-[130px] top-[190px] flex flex-col items-center">
                <div className="bg-white px-2 py-1 rounded text-[10px] font-bold shadow-sm mb-1">Dari: Solo</div>
                <div className="w-3 h-3 rounded-full bg-emerald-900 border-2 border-white shadow-md"></div>
            </div>

            <div className="absolute right-[120px] top-[140px] flex flex-col items-center">
                <div className="bg-white px-2 py-1 rounded text-[10px] font-bold shadow-sm mb-1">Ke: Denpasar</div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white shadow-md"></div>
            </div>

            {/* Current Location UI */}
            <div className="absolute left-[450px] top-[125px] flex flex-col items-center">
                <div className="bg-emerald-900 text-white px-3 py-1 rounded-md text-[10px] font-bold shadow-lg flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span>Lokasi Sekarang</span>
                </div>
            </div>

            {/* Overlay Estimated Time Card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 flex justify-between items-center border border-white shadow-xl">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg">
                        <Truck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Perkiraan Sampai</p>
                        <p className="text-sm font-bold text-slate-800">Jumat, 24 Nov 2023 (14:30)</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Jarak Tersisa</p>
                    <p className="text-sm font-extrabold text-slate-900">142 km</p>
                </div>
            </div>
        </div>
    );
}
