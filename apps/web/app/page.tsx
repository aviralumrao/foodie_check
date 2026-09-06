"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import UploadSection from "@/components/scan/UploadSection";
import ReportSection from "@/components/scan/ReportSection";
import { runOcrScan, EvaluateResponse } from "@/lib/api";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "@/components/scan/ReportPDF";

export default function Home() {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<EvaluateResponse | null>(null);
  const [scanTimestamp, setScanTimestamp] = useState<string>("");
  const [scanId, setScanId] = useState<string>("");

  const handleGenerateReport = async () => {
    if (!frontFile || !backFile) {
      alert("Please upload both front and back packaging images");
      return;
    }
    setLoading(true);
    try {
      const result = await runOcrScan(frontFile, backFile);
      setReportData(result);
      setScanTimestamp(new Date().toLocaleString());

      const commonNameField = result.fields.common_name;
      const productName =
        commonNameField && !Array.isArray(commonNameField) && "value" in commonNameField
          ? commonNameField.value || "Unknown Product"
          : "Unknown Product";

      const newScanId = `SC-${Date.now().toString().slice(-8)}`;
      setScanId(newScanId);

      const scanRecord = {
        id: newScanId,
        timestamp: new Date().toISOString(),
        productName,
        summary: result.summary,
        rules: result.rules,
      };

      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      history.unshift(scanRecord);
      localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));
    } catch (err: any) {
      console.error(err);
      alert(`Error generating report: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnother = () => {
    setReportData(null);
    setFrontFile(null);
    setBackFile(null);
    setScanTimestamp("");
    setScanId("");
  };

  const handleDownloadPDF = async () => {
    if (!reportData) return;
    const blob = await pdf(<ReportPDF report={reportData} scanId={scanId} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compliance-report-${scanId}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center px-4 py-12 pt-32">
        {!reportData ? (
          <UploadSection
            frontFile={frontFile}
            backFile={backFile}
            onFrontSelect={setFrontFile}
            onBackSelect={setBackFile}
            onGenerate={handleGenerateReport}
            loading={loading}
          />
        ) : (
          <>
            <UploadSection
              frontFile={frontFile}
              backFile={backFile}
              onFrontSelect={() => {}}
              onBackSelect={() => {}}
              onGenerate={handleCheckAnother}
              actionLabel="Check Another"
              loading={false}
            />

            <ReportSection
              reportData={reportData}
              scanTimestamp={scanTimestamp}
              scanId={scanId}
              onDownloadPDF={handleDownloadPDF}
            />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}