export type WhatsAppTagType = 'GENERAL' | 'REPLIED' | 'URGENT'

export interface WhatsAppLogItemProps {
    phone_number: string;
    timestamp: string;
    message_snippet: string;
    tags?: WhatsAppTagType[];
}

const TAG_STYLES: Record<WhatsAppTagType, string> = {
    GENERAL: 'bg-slate-100 text-slate-500',
    REPLIED: 'bg-emerald-100 text-emerald-700',
    URGENT: 'bg-rose-100 text-rose-600',
};

export default function WhatsAppLogItem({ phone_number, timestamp, message_snippet, tags }: WhatsAppLogItemProps) {
    return (
        <div className="border-b border-slate-100 last:border-0 py-4">
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800 text-sm">{phone_number}</span>
                <span className="text-[10px] text-slate-400">{timestamp}</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                {message_snippet}
            </p>
            <div className="flex gap-2 flex-wrap">
                {tags?.map((tag, i) => (
                    <span
                        key={i}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${TAG_STYLES[tag]}`}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}
