interface DisclaimerProps {
  date?: string;
}

export default function Disclaimer({ date }: DisclaimerProps) {
  return (
    <div className="bg-[#b3b3b3]/30 border border-gray-300 rounded-xl px-8 py-3 max-w-xl text-center shadow-sm">
      <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-0.5">
        Disclaimer !!
      </p>
      <p className="text-xs text-neutral-700">
        Automated result, generated {date ? `on ${date}` : "[date]"}. Subject to manual verification.
      </p>
    </div>
  );
}
