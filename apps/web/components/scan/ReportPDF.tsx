import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#333" },
  header: { borderBottom: 1, borderColor: "#eee", paddingBottom: 16, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111", marginBottom: 8 },
  
  // Metadata Section
  metaContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  metaCol: { width: "48%" },
  metaRow: { flexDirection: "row", marginBottom: 6 },
  metaLabel: { width: 110, fontWeight: "bold", color: "#555" },
  metaValue: { flex: 1, color: "#111" },

  // Summary Cards
  summaryContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 32 },
  summaryBox: { paddingVertical: 12, paddingHorizontal: 8, borderRadius: 6, width: "23%", textAlign: "center", color: "#fff" },
  summaryValue: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
  summaryLabel: { fontSize: 10, textTransform: "uppercase" },

  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", borderBottom: 1, borderColor: "#ddd", padding: 8, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderBottom: 0.5, borderColor: "#eee", padding: 8, alignItems: "center" },
  colField: { width: "40%", paddingRight: 8, lineHeight: 1.3 },
  colReview: { width: "40%", paddingRight: 8, color: "#555", lineHeight: 1.3 },
  colStatus: { width: "20%" },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, fontSize: 8, textAlign: "center", color: "#fff" },
  
  disclaimer: { marginTop: 32, padding: 12, backgroundColor: "#f9f9f9", fontSize: 8, color: "#777", textAlign: "center", borderRadius: 4 },
});

const statusConfig: Record<string, { bg: string; label: string }> = {
  passed: { bg: "#16a34a", label: "Passed" }, // Green
  needs_review: { bg: "#2563eb", label: "Review" }, // Blue
  failed: { bg: "#dc2626", label: "Failed" }, // Red
  not_applicable: { bg: "#6b7280", label: "N/A" } // Gray
};

interface ReportPDFProps {
  report: { 
    summary: { passed: number; needs_review: number; failed: number; not_applicable?: number }; 
    rules: any[] 
  };
  scanId: string;
  productName: string;
}

export function ReportPDF({ report, scanId, productName }: ReportPDFProps) {
  const timestamp = new Date().toLocaleString();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Pack Sure — Compliance Report</Text>
        </View>

        {/* Metadata matching UI */}
        <View style={styles.metaContainer}>
          <View style={styles.metaCol}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Name:</Text>
              <Text style={styles.metaValue}>{productName || "Unknown Product"}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Category:</Text>
              <Text style={styles.metaValue}>Packaged Commodity</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date and Time:</Text>
              <Text style={styles.metaValue}>{timestamp}</Text>
            </View>
          </View>
          <View style={styles.metaCol}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Scan Reference ID:</Text>
              <Text style={styles.metaValue}>{scanId}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Serial Number:</Text>
              <Text style={styles.metaValue}>{scanId}</Text>
            </View>
          </View>
        </View>

        {/* Summary Metric Boxes */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryBox, { backgroundColor: statusConfig.passed.bg }]}>
            <Text style={styles.summaryValue}>{report.summary.passed}</Text>
            <Text style={styles.summaryLabel}>{statusConfig.passed.label}</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: statusConfig.needs_review.bg }]}>
            <Text style={styles.summaryValue}>{report.summary.needs_review}</Text>
            <Text style={styles.summaryLabel}>{statusConfig.needs_review.label}</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: statusConfig.failed.bg }]}>
            <Text style={styles.summaryValue}>{report.summary.failed}</Text>
            <Text style={styles.summaryLabel}>{statusConfig.failed.label}</Text>
          </View>
          {report.summary.not_applicable !== undefined && (
            <View style={[styles.summaryBox, { backgroundColor: statusConfig.not_applicable.bg }]}>
              <Text style={styles.summaryValue}>{report.summary.not_applicable}</Text>
              <Text style={styles.summaryLabel}>{statusConfig.not_applicable.label}</Text>
            </View>
          )}
        </View>

        {/* Rules Table */}
        <View style={styles.tableHeader}>
          <Text style={styles.colField}>Legal Metrology Clause</Text>
          <Text style={styles.colReview}>Extracted Evidence</Text>
          <Text style={styles.colStatus}>Status</Text>
        </View>

        {report.rules.map((rule: any) => {
          const status = statusConfig[rule.status] || statusConfig.not_applicable;
          return (
            <View style={styles.tableRow} key={rule.rule_id}>
              <Text style={styles.colField}>{rule.description}</Text>
              <Text style={styles.colReview}>{rule.evidence?.value ?? "Not found"}</Text>
              <View style={styles.colStatus}>
                <Text style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                  {status.label}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Footer */}
        <Text style={styles.disclaimer}>
          Automated evaluation generated by Pack Sure on {timestamp}. This report is subject to manual verification and does not constitute formal legal counsel.
        </Text>
      </Page>
    </Document>
  );
}