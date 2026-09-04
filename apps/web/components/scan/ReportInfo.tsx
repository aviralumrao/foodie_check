interface ReportInfoProps {
  name: string;
  category: string;
  scanId: string;
  dateTime: string;
  serial: string;
}

export default function ReportInfo({ name, category, scanId, dateTime, serial }: ReportInfoProps) {
  const rows: [string, string][] = [
    ["Name", name],
    ["Category", category],
    ["Scan Reference ID", scanId],
    ["Date and Time", dateTime],
    ["Serial Number", serial],
  ];

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-6 text-neutral-900">Report Generated</h1>
      <div className="space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex gap-2 text-sm">
            <span className="font-bold w-48 text-neutral-700">{label}:</span>
            <span className="text-neutral-600">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
