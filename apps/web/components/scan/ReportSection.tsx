import ReportInfo from "./ReportInfo";
import StatusStat from "./StatusStat";
import LegalMetrologyTable from "./LegalMetrologyTable";
import Disclaimer from "./Disclaimer";
import { Download } from "lucide-react";
import { EvaluateResponse } from "@/lib/api";

interface ReportSectionProps {
  reportData: EvaluateResponse;
  scanTimestamp: string;
  scanId: string;
  onDownloadPDF: () => void;
}

export default function ReportSection({
  reportData,
  scanTimestamp,
  scanId,
  onDownloadPDF,
}: ReportSectionProps) {
  const commonNameField = reportData.fields.common_name;
  const productName =
    commonNameField && !Array.isArray(commonNameField) && "value" in commonNameField
      ? commonNameField.value || "Product Name Not Detected"
      : "Product Name Not Detected";

  return (
    <div className="w-full max-w-4xl mt-16 mb-12">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-12">
        <ReportInfo
          name={productName}
          category="Packaged Commodity"
          scanId={scanId}
          dateTime={scanTimestamp}
          serial={scanId}
        />

        <div className="flex gap-4">
          <StatusStat count={reportData.summary.passed} type="passed" />
          <StatusStat count={reportData.summary.needs_review} type="review" />
          <StatusStat count={reportData.summary.failed} type="failed" />
        </div>
      </div>

      <LegalMetrologyTable rules={reportData.rules} />

      <div className="mt-8 flex flex-col items-center gap-4">
        <Disclaimer date={scanTimestamp} />

        <button
          onClick={onDownloadPDF}
          className="flex items-center gap-3 bg-neutral-900 text-white font-semibold rounded-full px-6 py-3.5 hover:bg-neutral-800 transition-colors"
        >
          Download PDF Report
          <Download size={20} />
        </button>
      </div>
    </div>
  );
}