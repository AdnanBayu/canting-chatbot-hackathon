"use client";

export interface ShipmentItem {
    id: string;
    destination: string;
    courier: string;
    progress: number;
    status: string;
    color: string;
}

interface ActiveShipmentListProps {
    shipments: ShipmentItem[];
    selectedId: string;
    onSelect: (shipment: ShipmentItem) => void;
}

export default function ActiveShipmentList({ shipments, selectedId, onSelect }: ActiveShipmentListProps) {
    return (
        <div className="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-fit">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pengiriman Aktif</span>
                <span className="text-xs font-bold text-slate-900">{shipments.length} Pesanan</span>
            </div>

            <div className="divide-y divide-gray-50 overflow-y-auto max-h-[700px]">
                {shipments.map((order) => (
                    <div
                        key={order.id}
                        onClick={() => onSelect(order)}
                        className={`p-5 cursor-pointer transition-all hover:bg-slate-50 ${selectedId === order.id ? 'bg-slate-50 ring-1 ring-inset ring-emerald-500/10' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-sm text-slate-800">{order.id}</h4>
                                <p className="text-[11px] text-gray-400">Ke: {order.destination}</p>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-1 rounded bg-slate-900 text-white uppercase tracking-tighter">
                                {order.courier}
                            </span>
                        </div>

                        <div className="mt-4">
                            <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${order.color}`}
                                    style={{ width: `${order.progress}%` }}
                                ></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[10px] text-gray-500 font-medium italic">{order.status}</span>
                                <span className="text-[10px] text-slate-900 font-bold">{order.progress}%</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
