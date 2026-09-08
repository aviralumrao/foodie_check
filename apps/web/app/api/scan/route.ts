import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const front = formData.get("front") as File;
    const back = formData.get("back") as File;

    if (!front || !back) {
      return NextResponse.json({ error: "Missing front or back image" }, { status: 400 });
    }

    // 1. Upload images to Supabase Storage
    const timestamp = Date.now();
    const frontPath = `${timestamp}_front_${front.name}`;
    const backPath = `${timestamp}_back_${back.name}`;

    await Promise.all([
      supabase.storage.from("scan-images").upload(frontPath, front),
      supabase.storage.from("scan-images").upload(backPath, back)
    ]);

    const frontUrl = supabase.storage.from("scan-images").getPublicUrl(frontPath).data.publicUrl;
    const backUrl = supabase.storage.from("scan-images").getPublicUrl(backPath).data.publicUrl;

    // 2. Forward to FastAPI OCR Engine
    const ocrReq = new FormData();
    ocrReq.append("front", front);
    ocrReq.append("back", back);

    const ocrResponse = await fetch(`${process.env.OCR_SERVICE_URL}/evaluate`, {
      method: "POST",
      body: ocrReq,
    });
    
    if (!ocrResponse.ok) throw new Error("OCR Service failed");
    const ocrData = await ocrResponse.json();

    // 3. Insert record into Supabase
    const { data: dbData, error: dbError } = await supabase.from("scans").insert({
      product_name: ocrData.fields?.common_name || "Unknown Product",
      front_image_url: frontUrl,
      back_image_url: backUrl,
      raw_ocr: ocrData.fields,
      rules_result: ocrData.rules,
      passed: ocrData.summary.passed,
      needs_review: ocrData.summary.needs_review,
      failed: ocrData.summary.failed,
      overall_status: ocrData.summary.overall_status
    }).select("id").single();

    if (dbError) throw dbError;

    return NextResponse.json({ scanId: dbData.id, ...ocrData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}