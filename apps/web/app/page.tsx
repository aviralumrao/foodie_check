"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import UploadCard from "@/components/scan/UploadCard";
import PillButton from "@/components/ui/Button";
import { runOcrScan } from "@/lib/api";

export default function Home() {
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!frontFile || !backFile) {
      alert("Upload both images first");
      return;
    }
    setLoading(true);
    try {
      const result = await runOcrScan(frontFile, backFile);
      console.log(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 pt-32 scroll-pt-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Initiate New Scan</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Upload high-resolution images of the product packaging to begin
            automated compliance verification.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12 w-full max-w-4xl justify-center items-center">
          <UploadCard label="Front Packaging Image" onFileSelect={setFrontFile} />
          <UploadCard label="Back Packaging Image" onFileSelect={setBackFile} />
        </div>

        <PillButton
          text={loading ? "Scanning..." : "Generate Report"}
          onClick={handleGenerateReport}
        />
      </main>
      <Footer />
    </>
  );
}