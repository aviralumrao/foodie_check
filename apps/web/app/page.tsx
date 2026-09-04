"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import UploadSection from "@/components/scan/UploadSection";
import ReportSection from "@/components/scan/ReportSection";
import PillButton from "@/components/ui/Button";
import { runOcrScan, EvaluateResponse } from "@/lib/api";

export default function Home() {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<EvaluateResponse | null>(null);
  const [scanTimestamp, setScanTimestamp] = useState<string>("");

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

      // Extract product name from common_name field
      const commonNameField = result.fields.common_name;
      const productName =
        commonNameField && !Array.isArray(commonNameField) && "value" in commonNameField
          ? commonNameField.value || "Unknown Product"
          : "Unknown Product";

      const scanRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        productName,
        summary: result.summary,
        rules: result.rules,
      };

      // Save to localStorage for history
      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      history.unshift(scanRecord);
      localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50))); // keep last 50
    } catch (err) {
      console.error(err);
      alert("Failed to generate report. Please ensure the OCR service is running on http://localhost:8000");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnother = () => {
    setReportData(null);
    setFrontFile(null);
    setBackFile(null);
    setScanTimestamp("");
  };

  const handleDownloadPDF = () => {
    alert("PDF download feature coming soon!");
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
              loading={false}
            />
            <PillButton text="Check Another" onClick={handleCheckAnother} />

            <ReportSection
              reportData={reportData}
              scanTimestamp={scanTimestamp}
              onDownloadPDF={handleDownloadPDF}
            />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
