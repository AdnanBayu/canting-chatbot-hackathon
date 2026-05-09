interface RefundRequestCardProps {
    orderId: string;
    time: string;
    tagText: string;
    tagColor: string;
    item: string;
    description: string;
    imageColor: string;
    onApprove?: () => void;
    onReject?: () => void;
}

export default function RefundRequestCard({
    orderId,
    time,
    tagText,
    tagColor,
    item,
    description,
    imageColor,
    onApprove,
    onReject,
}: RefundRequestCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-4">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-32 h-32 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden bg-slate-100">
                    <div className={`w-full h-full ${imageColor} opacity-80 flex items-center justify-center text-white font-bold`}>
                        Batik
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">ORDER {orderId}</span>
                            <span className="text-slate-400 text-xs">• Requested {time}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-tight ${tagColor}`}>
                            {tagText}
                        </span>
                    </div>
                    <h3 className="text-slate-700 font-semibold mb-2">{item}</h3>
                    <p className="text-slate-500 text-sm italic mb-6 leading-relaxed">
                        &quot;{description}&quot;
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onApprove}
                            className="flex-1 bg-[#064e3b] text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-[#065f46] transition-colors"
                        >
                            Approve Refund
                        </button>
                        <button
                            onClick={onReject}
                            className="flex-1 border border-slate-200 text-slate-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            Reject Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
