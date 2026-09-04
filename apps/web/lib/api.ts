// Types matching the /evaluate endpoint response
export interface FieldEvidence {
  value?: string;
  confidence?: number;
  source?: number[][];
  status?: string;
  front?: FieldEvidence;
  back?: FieldEvidence;
}

export interface RuleResult {
  rule_id: string;
  clause: string;
  field: string;
  description: string;
  status: "passed" | "needs_review" | "failed";
  evidence: FieldEvidence | FieldEvidence[] | null;
}

export interface EvaluateResponse {
  fields: Record<string, FieldEvidence | FieldEvidence[] | null>;
  rules: RuleResult[];
  summary: {
    passed: number;
    needs_review: number;
    failed: number;
  };
}

export async function runOcrScan(frontFile: File, backFile: File): Promise<EvaluateResponse> {
  const formData = new FormData();
  formData.append("front", frontFile);
  formData.append("back", backFile);

  const res = await fetch("http://localhost:8000/evaluate", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("Compliance evaluation request failed");
  return res.json();
}