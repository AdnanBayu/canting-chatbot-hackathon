interface HeaderProps {
    title: string;
    description: string;
}

export default function Header({ title, description }: HeaderProps) {
    return (
        <header className="mb-8">
            <h2 className="text-2xl font-bold text-[#0D3B2E]">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
        </header>
    );
}