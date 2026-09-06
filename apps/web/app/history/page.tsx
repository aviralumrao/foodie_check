"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import KpiCard from "@/components/history/KpiCard";
import TrendChart from "@/components/history/TrendChart";
import ViolationList from "@/components/history/ViolationList";
import RecentScansTable, { ScanRecord } from "@/components/history/RecentScansTable";
import { ScanLine, BadgeCheck, AlertTriangle } from "lucide-react";

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanRecord[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("scanHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          queueMicrotask(() => setScans(parsed));
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalScans = scans.length;
  const criticalScans = scans.filter((s) => s.summary.failed > 0).length;
  const passedScans = scans.filter((s) => s.summary.failed === 0).length;
  const complianceRate = totalScans > 0
    ? `${((passedScans / totalScans) * 100).toFixed(2)}%`
    : "0%";

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center px-4 py-12 pt-32 pb-24">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <h1 className="text-5xl font-bold text-center mb-12 text-neutral-900">
            History
          </h1>

          {/* Top KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <KpiCard
              title="Total Scans"
              value={totalScans}
              icon={ScanLine}
            />
            <KpiCard
              title="Compliance Rate"
              value={complianceRate}
              icon={BadgeCheck}
            />
            <KpiCard
              title="Critical Scans"
              value={criticalScans.toString().padStart(2, "0")}
              icon={AlertTriangle}
            />
          </div>

          {/* Middle Section: Chart + Violations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <TrendChart />
            <ViolationList />
          </div>

          {/* Bottom: Recent Scans */}
          <RecentScansTable scans={scans} />
        </div>
      </main>
      <Footer />
    </>
  );
}
