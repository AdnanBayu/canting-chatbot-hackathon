interface PesananTableRingkasProps {
  id: string;
  name: string;
  product: string;
  status: string;
  amount: string;
}

export default function PesananTableRingkas({ id, name, product, status, amount }: PesananTableRingkasProps) {
  return (
    <tr className="group hover:bg-gray-50 transition-colors">
      <td className="py-4 font-medium text-[#0D3B2E]">{id}</td>
      <td className="py-4 text-gray-500">{name}</td>
      <td className="py-4 text-gray-500">{product}</td>
      <td className="py-4">
        <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full ${status === 'DIKIRIM' ? 'bg-[#D1E7E0] text-[#0D3B2E]' : 'bg-gray-100 text-gray-500'
          }`}>
          {status}
        </span>
      </td>
      <td className="py-4 font-bold text-[#0D3B2E]">{amount}</td>
    </tr>
  );
}
