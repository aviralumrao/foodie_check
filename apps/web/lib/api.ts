export async function runOcrScan(frontFile: File, backFile: File) {
  const formData = new FormData();
  formData.append("front", frontFile);
  formData.append("back", backFile);

  const res = await fetch("http://localhost:8000/ocr", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error("OCR request failed");
  return res.json();
}