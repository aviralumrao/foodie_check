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
    async function fetchHistory() {
      try {
        const res = await fetch("/api/scans");
        if (res.ok) {
          const data = await res.json();
          // Map the database row to match the existing ScanRecord shape
          const formattedScans = data.map((row: any) => ({
            id: row.id,
            timestamp: row.created_at,
            productName: row.product_name,
            summary: {
              passed: row.passed,
              needs_review: row.needs_review,
              failed: row.failed,
              overall_status: row.overall_status,
            },
            rules: row.rules_result,
          }));
          setScans(formattedScans);
        } else {
          console.error("Failed to fetch scan history");
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchHistory();
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