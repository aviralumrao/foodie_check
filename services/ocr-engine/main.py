from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
import numpy as np
import cv2
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ocr = PaddleOCR(
   use_doc_orientation_classify=False,
    use_doc_unwarping=False,
    use_textline_orientation=True,
    lang="en",
    enable_mkldnn=False,
)

def run_ocr(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    result = ocr.predict(img)

    blocks = []
    for res in result:
        texts = res["rec_texts"]
        scores = res["rec_scores"]
        boxes = res["rec_boxes"]
        for text, score, box in zip(texts, scores, boxes):
            blocks.append({
                "text": text,
                "bbox": box.tolist() if hasattr(box, "tolist") else box,
                "confidence": float(score),
            })
    return blocks

@app.post("/ocr")
async def extract_text(front: UploadFile = File(...), back: UploadFile = File(...)):
    front_bytes = await front.read()
    back_bytes = await back.read()

    result = {
        "front": run_ocr(front_bytes),
        "back": run_ocr(back_bytes),
    }

    with open("results/latest_scan.json", "w") as f:
        json.dump(result, f, indent=2)

    return result