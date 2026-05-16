"use client";

import { useState } from 'react';

import Header from '@/components/Header';
import ActiveShipmentList, { ShipmentItem } from '@/app/pengiriman/ActiveShipmentList';
import ShipmentTrackingMap from '@/app/pengiriman/ShipmentTrackingMap';
import ShipmentLogs, { ShipmentLogItem } from '@/app/pengiriman/ShipmentLogs';

const ACTIVE_SHIPMENTS: ShipmentItem[] = [
    { id: '#ORD-2023-9842', destination: 'Denpasar, Bali', courier: 'J&T EXPRESS', progress: 75, status: 'Sampai di Denpasar', color: 'bg-emerald-600' },
    { id: '#ORD-2023-9845', destination: 'Jombang, Jatim', courier: 'JNE REG', progress: 33, status: 'Paket sudah diambil kurir', color: 'bg-blue-400' },
    { id: '#ORD-2023-9850', destination: 'Jakarta Pusat', courier: 'J&T CARGO', progress: 100, status: 'Diterima pembeli', color: 'bg-rose-400' },
    { id: '#ORD-2023-9852', destination: 'Surabaya, Jatim', courier: 'JNE YES', progress: 25, status: 'Sedang diproses di DC Cakung', color: 'bg-blue-400' },
];

const SHIPMENT_LOGS_DATA: Record<string, ShipmentLogItem[]> = {
    '#ORD-2023-9842': [
        { title: 'Tiba di DC Denpasar', description: 'Paket telah tiba di sorting center Denpasar, Bali.', time: '10:45', current: true },
        { title: 'Berangkat dari DC Solo', description: 'Paket telah keluar main hub di Surakarta melalui jalur udara.', time: '04:12', current: false },
        { title: 'Paket Diserahkan', description: 'Toko telah menyerahkan paket ke kurir J&T.', time: 'Kemarin', current: false },
        { title: 'Label Pengiriman Telah Dibuat', description: 'Nomor tracker untuk pesanan adalah #ORD-2023-9842.', time: 'Kemarin', current: false },
    ],
    '#ORD-2023-9845': [
        { title: 'Kurir Menuju Lokasi', description: 'Kurir JNE sedang menuju lokasi penjemputan paket.', time: '14:20', current: true },
        { title: 'Label Dibuat', description: 'Proses administrasi pengiriman telah selesai.', time: '12:00', current: false },
    ],
    '#ORD-2023-9850': [
        { title: 'Paket Diterima', description: 'Paket telah diterima oleh Ibu Sarah di Jakarta Pusat.', time: 'Tadi Pagi', current: true },
        { title: 'Menuju Alamat Tujuan', description: 'Kurir dalam perjalanan ke alamat penerima.', time: '08:00', current: false },
    ],
    '#ORD-2023-9852': [
        { title: 'Sorting di DC Cakung', description: 'Paket sedang diproses di fasilitas logistik Cakung.', time: 'Baru Saja', current: true },
        { title: 'Penjemputan Berhasil', description: 'Paket telah diambil dari toko.', time: 'Kemarin', current: false },
    ],
};

export default function Pengiriman() {
    const [selectedOrder, setSelectedOrder] = useState<ShipmentItem>(ACTIVE_SHIPMENTS[0]);

    const currentLogs = SHIPMENT_LOGS_DATA[selectedOrder.id] || [];

    return (
        <div className="flex flex-col">
            <Header
                title="Status Pengiriman"
                description="Monitor pengiriman produk ke tangan pelanggan secara real-time"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Active Shipments */}
                <ActiveShipmentList
                    shipments={ACTIVE_SHIPMENTS}
                    selectedId={selectedOrder.id}
                    onSelect={setSelectedOrder}
                />

                {/* Right Column: Tracking Details */}
                <div className="lg:col-span-8 space-y-6">
                    <ShipmentTrackingMap selectedOrder={selectedOrder} />
                    <ShipmentLogs logs={currentLogs} />
                </div>
            </div>
        </div>
    );
}