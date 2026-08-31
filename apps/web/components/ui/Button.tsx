import { ReactNode } from "react";
import { CheckCircle } from "lucide-react";

interface PillButtonProps {
  text: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export default function PillButton({ text, icon, onClick }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-neutral-900 text-white font-semibold rounded-full px-6 py-3.5"
    >
      {text}
      {icon ?? <CheckCircle size={22} />}
    </button>
  );
}
