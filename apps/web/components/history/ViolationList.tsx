interface ViolationType {
  label: string;
  count: number;
}

interface ViolationListProps {
  violations?: ViolationType[];
}

const DEFAULT_VIOLATIONS: ViolationType[] = [
  { label: "Missing MRP", count: 5 },
  { label: "Font Size", count: 0 },
  { label: "Missing Address", count: 8 },
  { label: "Missing Mfg. Date", count: 17 },
  { label: "Other", count: 12 },
];

export default function ViolationList({ violations = DEFAULT_VIOLATIONS }: ViolationListProps) {
  return (
    <div className="bg-[#faf9f5] border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <h2 className="text-lg font-bold text-neutral-900 mb-6">
        Violation Types
      </h2>

      <div className="space-y-4">
        {violations.map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-center text-sm"
          >
            <span className="font-bold text-neutral-800">{item.label} :</span>
            <span className="text-neutral-600 font-medium">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
