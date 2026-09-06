import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  title: { fontSize: 20, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#555", marginBottom: 16 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  summaryBox: { padding: 8, borderRadius: 4, width: "30%", textAlign: "center" },
  tableHeader: { flexDirection: "row", borderBottom: 1, paddingBottom: 4, marginBottom: 4 },
  tableRow: { flexDirection: "row", borderBottom: 0.5, borderColor: "#ddd", paddingVertical: 6 },
  colField: { width: "30%" },
  colReview: { width: "50%" },
  colStatus: { width: "20%" },
  disclaimer: { marginTop: 24, padding: 12, backgroundColor: "#eee", fontSize: 9 },
});

const statusColor: Record<string, string> = {
  passed: "#2E7D4F",
  needs_review: "#C08A3E",
  failed: "#B23A2E",
};

interface ReportPDFProps {
  report: { summary: { passed: number; needs_review: number; failed: number }; rules: any[] };
  scanId: string;
}

export function ReportPDF({ report, scanId }: ReportPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Pack Sure — Compliance Report</Text>
        <Text style={styles.subtitle}>Scan ID: {scanId} · Generated: {new Date().toLocaleString()}</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryBox, { backgroundColor: "#e6f4ea" }]}>
            <Text>{report.summary.passed}</Text>
            <Text>Passed</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: "#fdf1e0" }]}>
            <Text>{report.summary.needs_review}</Text>
            <Text>Review</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: "#fbe9e7" }]}>
            <Text>{report.summary.failed}</Text>
            <Text>Failed</Text>
          </View>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.colField}>Legal Metrology</Text>
          <Text style={styles.colReview}>Review</Text>
          <Text style={styles.colStatus}>Status</Text>
        </View>

        {report.rules.map((rule: any) => (
          <View style={styles.tableRow} key={rule.rule_id}>
            <Text style={styles.colField}>{rule.description}</Text>
            <Text style={styles.colReview}>{rule.evidence?.value ?? "Not found"}</Text>
            <Text style={{ ...styles.colStatus, color: statusColor[rule.status] }}>
              {rule.status.replace("_", " ")}
            </Text>
          </View>
        ))}

        <Text style={styles.disclaimer}>
          Automated result, generated {new Date().toLocaleDateString()}. Subject to manual verification.
        </Text>
      </Page>
    </Document>
  );
}