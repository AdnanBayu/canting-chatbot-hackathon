"use client";

import { useState } from 'react';
import ActiveShipmentList, { ShipmentItem } from '@/components/ActiveShipmentList';
import ShipmentTrackingMap from '@/components/ShipmentTrackingMap';
import ShipmentLogs, { ShipmentLogItem } from '@/components/ShipmentLogs';

const ACTIVE_SHIPMENTS: ShipmentItem[] = [
    { id: '#ORD-2023-9842', destination: 'Denpasar, Bali', courier: 'J&T EXPRESS', progress: 75, status: 'Sampai di Denpasar', color: 'bg-emerald-600' },
    { id: '#ORD-2023-9845', destination: 'Jombang, Jatim', courier: 'JNE REG', progress: 33, status: 'Paket sudah diambil kurir', color: 'bg-blue-400' },
    { id: '#ORD-2023-9850', destination: 'Jakarta Pusat', courier: 'J&T CARGO', progress: 100, status: 'Diterima pembeli', color: 'bg-rose-400' },
    { id: '#ORD-2023-9852', destination: 'Surabaya, Jatim', courier: 'JNE YES', progress: 25, status: 'Sedang diproses di DC Cakung', color: 'bg-blue-400' },
];

const SHIPMENT_LOGS: ShipmentLogItem[] = [
    { title: 'Tiba di DC Denpasar', description: 'Paket telah tiba di sorting center Denpasar, Bali.', time: '10:45', current: true },
    { title: 'Berangkat dari DC Solo', description: 'Paket telah keluar main hub di Surakarta melalui jalur udara.', time: '04:12', current: false },
    { title: 'Paket Diserahkan', description: 'Toko telah menyerahkan paket ke kurir J&T.', time: 'Kemarin', current: false },
    { title: 'Label Pengiriman Telah Dibuat', description: 'Nomor tracker untuk pesanan adalah #ORD-2023-9842.', time: 'Kemarin', current: false },
];

export default function Pengiriman() {
    const [selectedOrder, setSelectedOrder] = useState<ShipmentItem>(ACTIVE_SHIPMENTS[0]);

    return (
        <div className="flex flex-col">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-[#0D3B2E]">Status Pengiriman</h2>
                <p className="text-sm text-gray-500">Monitor pengiriman produk ke tangan pelanggan secara real-time</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Active Shipments */}
                <ActiveShipmentList 
                    shipments={ACTIVE_SHIPMENTS} 
                    selectedId={selectedOrder.id} 
                    onSelect={setSelectedOrder} 
                />

                {/* Right Column: Tracking Details */}
                <div className="lg:col-span-8 space-y-6">
                    <ShipmentTrackingMap />
                    <ShipmentLogs logs={SHIPMENT_LOGS} />
                </div>
            </div>
        </div>
    );
}