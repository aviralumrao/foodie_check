"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import KpiCard from "@/components/history/KpiCard";
import TrendChart from "@/components/history/TrendChart";
import ViolationList from "@/components/history/ViolationList";
import RecentScansTable, { ScanRecord } from "@/components/history/RecentScansTable";
import { ScanLine, BadgeCheck, AlertTriangle } from "lucide-react";

// Default/mock scans matching the UI design
const DEFAULT_SCANS: ScanRecord[] = [
  {
    id: "1",
    timestamp: "2023-10-27 14:32",
    productName: "Lay's Classic Potato Chips",
    summary: { passed: 4, needs_review: 1, failed: 0 },
  },
  {
    id: "2",
    timestamp: "2023-10-27 14:32",
    productName: "Lay's Classic Potato Chips",
    summary: { passed: 3, needs_review: 2, failed: 0 },
  },
  {
    id: "3",
    timestamp: "2023-10-27 14:32",
    productName: "Lay's Classic Potato Chips",
    summary: { passed: 5, needs_review: 0, failed: 0 },
  },
  {
    id: "4",
    timestamp: "2023-10-27 14:32",
    productName: "Lay's Classic Potato Chips",
    summary: { passed: 2, needs_review: 1, failed: 2 },
  },
  {
    id: "5",
    timestamp: "2023-10-27 14:32",
    productName: "Lay's Classic Potato Chips",
    summary: { passed: 4, needs_review: 1, failed: 0 },
  },
  {
    id: "6",
    timestamp: "2023-10-27 14:32",
    productName: "Lay's Classic Potato Chips",
    summary: { passed: 5, needs_review: 0, failed: 0 },
  },
];

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanRecord[]>(DEFAULT_SCANS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("scanHistory");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setScans([...parsed, ...DEFAULT_SCANS]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const totalScans = scans.length > 0 ? scans.length : 55;
  const criticalScans = scans.filter((s) => s.summary.failed > 0).length || 3;
  const complianceRate = "93.25%";

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
