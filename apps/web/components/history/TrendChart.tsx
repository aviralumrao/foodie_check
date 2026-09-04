interface DayData {
  day: string;
  height: string;
}

interface TrendChartProps {
  data?: DayData[];
}

const DEFAULT_WEEK_DATA: DayData[] = [
  { day: "Mon", height: "80%" },
  { day: "Tues", height: "45%" },
  { day: "Wed", height: "60%" },
  { day: "Thurs", height: "30%" },
  { day: "Fri", height: "50%" },
  { day: "Sat", height: "75%" },
  { day: "Sun", height: "15%" },
];

export default function TrendChart({ data = DEFAULT_WEEK_DATA }: TrendChartProps) {
  return (
    <div className="bg-[#faf9f5] border border-gray-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <h2 className="text-lg font-bold text-neutral-900 mb-6">
        Compliance Rate Trend
      </h2>

      <div className="flex items-end justify-between h-48 border-l border-b border-neutral-800 pl-4 pb-2 pr-2 gap-2">
        {data.map((item) => (
          <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end">
            <div
              className="w-full max-w-[28px] bg-neutral-300 rounded-t-sm transition-all hover:bg-neutral-400"
              style={{ height: item.height }}
            />
            <span className="text-xs text-neutral-600 mt-2 font-medium">
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
