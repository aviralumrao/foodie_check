type StatType = "passed" | "review" | "failed";

interface StatusStatProps {
  count: number;
  type: StatType;
}

const styles: Record<StatType, { bg: string; text: string }> = {
  passed: { bg: "bg-green-600", text: "Passed" },
  review: { bg: "bg-blue-700", text: "Review" },
  failed: { bg: "bg-red-600", text: "Failed" },
};

export default function StatusStat({ count, type }: StatusStatProps) {
  const { bg, text } = styles[type];

  return (
    <div className={`${bg} text-white rounded-xl px-8 py-5 text-center w-36`}>
      <p className="text-4xl font-extrabold">{count}</p>
      <p className="font-semibold">{text}</p>
    </div>
  );
}
