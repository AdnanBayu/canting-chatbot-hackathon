import { Button } from "@/components/ui/button";

export interface RefundRequestCardProps {
    request_id: string;
    full_id: string;
    order_id: string;
    buyer_phone: string;
    requested_at: string;
    issue_type: string;
    product_name: string;
    customer_message: string;
}

export default function RefundRequestCard({
    request_id,
    full_id,
    order_id,
    buyer_phone,
    requested_at,
    issue_type,
    product_name,
    customer_message,
}: RefundRequestCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-4">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-slate-100">
                    <div className={`w-full h-full opacity-80 flex items-center justify-center text-white font-bold`}>
                        Batik
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">KOMPLAIN {request_id}</span>
                            <span className="text-slate-400 text-xs">• Requested {requested_at}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] text-slate-500 font-bold uppercase tracking-tight`}>
                            {issue_type}
                        </span>
                    </div>
                    <h3 className="text-slate-700 font-semibold mb-2">{product_name}</h3>
                    <p className="text-slate-500 text-sm italic mb-6 leading-relaxed">
                        &quot;{customer_message}&quot;
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            className="w-full font-bold text-slate-600 border-slate-200"
                        >
                            Approve Refund
                        </Button>
                        <Button
                            variant="danger"
                            className="w-full font-bold text-slate-600 border-slate-200"
                        >
                            Reject Request
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
