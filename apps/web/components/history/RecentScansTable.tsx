import { Download } from "lucide-react";

export interface ScanRecord {
  id: string;
  timestamp: string;
  productName: string;
  summary: {
    passed: number;
    needs_review: number;
    failed: number;
  };
}

interface RecentScansTableProps {
  scans: ScanRecord[];
  onDownload?: (scanId: string) => void;
}

export default function RecentScansTable({ scans, onDownload }: RecentScansTableProps) {
  const handleDownload = (scanId: string) => {
    if (onDownload) {
      onDownload(scanId);
    } else {
      alert("Report download coming soon!");
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">Recent Scans</h2>

      <div className="w-full overflow-hidden rounded-xl border border-gray-100 bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#f0eee6] text-left text-sm text-neutral-900 font-bold">
              <th className="p-4 w-1/3">Product</th>
              <th className="p-4 w-1/3">Date & Time</th>
              <th className="p-4 w-1/3 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {scans.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-neutral-500">
                  No scans yet. Generate a report to see it here.
                </td>
              </tr>
            ) : (
              scans.slice(0, 10).map((scan) => (
                <tr key={scan.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="p-4 font-medium text-neutral-800">
                    {scan.productName}
                  </td>
                  <td className="p-4 text-neutral-600">{scan.timestamp}</td>
                  <td className="p-4 text-right pr-6">
                    <button
                      onClick={() => handleDownload(scan.id)}
                      className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    >
                      Download Report
                      <Download size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
