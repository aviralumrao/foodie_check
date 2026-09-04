import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

export default function KpiCard({ title, value, icon: Icon }: KpiCardProps) {
  return (
    <div className="bg-[#faf9f5] border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
      <div className="flex items-center justify-between text-neutral-800 font-bold">
        <span className="text-base">{title}</span>
        <Icon size={20} className="text-neutral-700" />
      </div>
      <p className="text-5xl font-extrabold text-neutral-900">{value}</p>
    </div>
  );
}
