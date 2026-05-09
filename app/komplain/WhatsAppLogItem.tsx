export type WhatsAppTagType = 'category' | 'status' | 'urgent';

export interface WhatsAppTag {
    label: string;
    type: WhatsAppTagType;
}

interface WhatsAppLogItemProps {
    phone: string;
    time: string;
    message: string;
    tags: WhatsAppTag[];
}

const TAG_STYLES: Record<WhatsAppTagType, string> = {
    category: 'bg-slate-100 text-slate-500',
    status: 'bg-emerald-100 text-emerald-700',
    urgent: 'bg-rose-100 text-rose-600',
};

export default function WhatsAppLogItem({ phone, time, message, tags }: WhatsAppLogItemProps) {
    return (
        <div className="border-b border-slate-100 last:border-0 py-4">
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800 text-sm">{phone}</span>
                <span className="text-[10px] text-slate-400">{time}</span>
            </div>
            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                &quot;{message}&quot;
            </p>
            <div className="flex gap-2 flex-wrap">
                {tags.map((tag, i) => (
                    <span
                        key={i}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${TAG_STYLES[tag.type]}`}
                    >
                        {tag.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
