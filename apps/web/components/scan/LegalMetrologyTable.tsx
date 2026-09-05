import { Check, AlertTriangle, X } from "lucide-react";
import { RuleResult } from "@/lib/api";

type Status = "passed" | "needs_review" | "failed";

export interface DisplayRow {
  field: string;
  review: string;
  status: Status;
}

interface LegalMetrologyTableProps {
  rules?: RuleResult[];
  rows?: DisplayRow[];
}

const statusConfig: Record<
  Status,
  { label: string; bg: string; icon: typeof Check }
> = {
  passed: { label: "Passed", bg: "bg-green-600", icon: Check },
  needs_review: { label: "Review", bg: "bg-blue-700", icon: AlertTriangle },
  failed: { label: "Failed", bg: "bg-red-600", icon: X },
};

function StatusPill({ status }: { status: Status }) {
  const config = statusConfig[status] || statusConfig.failed;
  const Icon = config.icon;

  return (
    <span
      className={`${config.bg} text-white text-xs font-semibold rounded-md px-3 py-1.5 inline-flex items-center gap-1.5`}
    >
      <Icon size={13} strokeWidth={2.5} />
      {config.label}
    </span>
  );
}

// Format a rule result from the API into a human-readable review string
function formatReviewText(rule: RuleResult): string {
  const { status, evidence, field } = rule;

  if (status === "passed") {
    if (evidence && typeof evidence === "object" && "value" in evidence && evidence.value) {
      return `Present — "${evidence.value}"`;
    }
    if (Array.isArray(evidence) && evidence.length > 0) {
      return `Present — ${evidence.length} address block(s) detected`;
    }
    return "Present and verified";
  }

  if (status === "needs_review") {
    if (field === "manufacturer_address" && Array.isArray(evidence) && evidence.length > 1) {
      const texts = evidence.map((e: any) => e.text).filter(Boolean);
      const detail = texts.length > 0 ? ` (${texts.slice(0, 2).join(" + ")})` : "";
      return `Present, but multiple addresses found${detail}. Confirm which is the declared manufacturer/packer address`;
    }
    if (field === "mrp" || field === "mfg_date") {
      return 'Not found on this panel. Label states a reference (e.g. "See under the Seal" / "See below")';
    }
    return "Requires manual verification by inspector";
  }

  // failed
  if (field === "mrp") return "Not declared on scanned panels — Rule 6(1)(d) violation";
  if (field === "mfg_date") return "Not declared on scanned panels — Rule 6(1)(e) violation";
  if (field === "net_quantity") return "Net quantity declaration missing — Rule 6(1)(c) violation";
  if (field === "common_name") return "Common/generic name missing — Rule 6(1)(b) violation";
  if (field === "manufacturer_address") return "Manufacturer/packer address missing — Rule 6(1)(a) violation";

  return "Mandatory declaration not found";
}

// Human-friendly field labels
const FIELD_LABELS: Record<string, string> = {
  common_name: "Common/generic name",
  manufacturer_address: "Manufacturer/packer address",
  net_quantity: "Net quantity",
  mfg_date: "Month/year of manufacture or packing",
  mrp: "MRP (incl. of all taxes)",
  best_before: "Best before / Expiry date",
  consumer_care: "Consumer care details",
  fssai_license: "FSSAI license number",
  lm_registration: "Legal Metrology registration number",
};

export default function LegalMetrologyTable({ rules, rows }: LegalMetrologyTableProps) {
  // If `rules` from API is provided, map it to display rows
  const displayRows: DisplayRow[] = rules
    ? rules.map((r) => ({
        field: FIELD_LABELS[r.field] || r.description || r.field,
        review: formatReviewText(r),
        status: r.status,
      }))
    : rows || [];

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-gray-100 bg-white">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#f0eee6] text-left text-sm text-neutral-900">
            <th className="p-4 font-bold w-1/4">Legal Metrology</th>
            <th className="p-4 font-bold w-1/2">Review</th>
            <th className="p-4 font-bold w-1/4 text-right pr-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {displayRows.map((row, i) => (
            <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
              <td className="p-4 align-middle text-sm font-medium text-neutral-800">
                {row.field}
              </td>
              <td className="p-4 align-middle text-sm text-neutral-600 leading-relaxed">
                {row.review}
              </td>
              <td className="p-4 align-middle text-right pr-6">
                <StatusPill status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
