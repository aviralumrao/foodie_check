"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import UploadCard from "@/components/scan/UploadCard";
import PillButton from "@/components/ui/Button";

export default function Home() {
  const handleGenerateReport = () => {
    // Handle report generation
    console.log("Generating report");
  };

  return (

    <>
    <Navbar/>
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 pt-32 scroll-pt-32">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Initiate New Scan</h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            Upload high-resolution images of the product packaging to begin
            automated compliance verification.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12 w-full max-w-4xl justify-center items-center">
          <UploadCard label="Front Packaging Image" />

          <UploadCard label="Back Packaging Image" />
        </div>

        {/* Generate Report Button */}
        <PillButton 
          text="Generate Report"
          onClick={handleGenerateReport}
        />
      </main>
      <Footer />
    </>
  );
}
