from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
from sqlalchemy.orm import Session
import numpy as np
import cv2
import json
import uuid
from mapping.field_mapper import map_fields
from rules.engine import run_rule_engine
from database import get_db, init_db
from models import Scan, ComplianceStatus

app = FastAPI(title="Foodie Check OCR Service")


@app.on_event("startup")
def on_startup():
    init_db()

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


@app.post("/evaluate")
async def evaluate_compliance(front: UploadFile = File(...), back: UploadFile = File(...)):
    front_bytes = await front.read()
    back_bytes = await back.read()

    front_blocks = run_ocr(front_bytes)
    back_blocks = run_ocr(back_bytes)

    # Save raw OCR for debugging
    with open("results/latest_scan.json", "w") as f:
        json.dump({"front": front_blocks, "back": back_blocks}, f, indent=2)

    fields = map_fields(front_blocks, back_blocks)
    all_blocks = front_blocks + back_blocks
    rule_results = run_rule_engine(fields, all_blocks)

    passed = sum(1 for r in rule_results if r["status"] == "passed")
    review = sum(1 for r in rule_results if r["status"] == "needs_review")
    failed = sum(1 for r in rule_results if r["status"] == "failed")

    report = {
        "fields": fields,
        "rules": rule_results,
        "summary": {"passed": passed, "needs_review": review, "failed": failed},
    }

    with open("results/latest_report.json", "w") as f:
        json.dump(report, f, indent=2, default=str)

    return report


# ── DB-backed endpoints ─────────────────────────────────────────────

@app.post("/scans")
async def save_scan(
    front: UploadFile = File(...),
    back: UploadFile = File(...),
    user_id: str = Query(default="anonymous"),
    db: Session = Depends(get_db),
):
    """Run OCR + compliance evaluation, then save result to database."""
    front_bytes = await front.read()
    back_bytes = await back.read()

    front_blocks = run_ocr(front_bytes)
    back_blocks = run_ocr(back_bytes)

    fields = map_fields(front_blocks, back_blocks)
    all_blocks = front_blocks + back_blocks
    rule_results = run_rule_engine(fields, all_blocks)

    passed = sum(1 for r in rule_results if r["status"] == "passed")
    review = sum(1 for r in rule_results if r["status"] == "needs_review")
    failed = sum(1 for r in rule_results if r["status"] == "failed")

    scan = Scan(
        id=str(uuid.uuid4()),
        user_id=user_id,
        front_image_url=front.filename or "front.jpg",
        back_image_url=back.filename or "back.jpg",
        raw_ocr={"front": front_blocks, "back": back_blocks},
        rules_result=rule_results,
        passed=passed,
        needs_review=review,
        failed=failed,
        overall_status=(
            ComplianceStatus.COMPLIANT if failed == 0
            else ComplianceStatus.NON_COMPLIANT
        ),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return {
        "scan_id": scan.id,
        "fields": fields,
        "rules": rule_results,
        "summary": {"passed": passed, "needs_review": review, "failed": failed},
        "overall_status": scan.overall_status.value,
        "created_at": scan.created_at.isoformat(),
    }


@app.get("/scans")
def list_scans(
    user_id: str = Query(default="anonymous"),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
):
    """List scan history for a user, newest first."""
    scans = (
        db.query(Scan)
        .filter(Scan.user_id == user_id)
        .order_by(Scan.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    total = db.query(Scan).filter(Scan.user_id == user_id).count()

    return {
        "total": total,
        "scans": [
            {
                "scan_id": s.id,
                "front_image_url": s.front_image_url,
                "back_image_url": s.back_image_url,
                "passed": s.passed,
                "needs_review": s.needs_review,
                "failed": s.failed,
                "overall_status": s.overall_status.value,
                "created_at": s.created_at.isoformat(),
            }
            for s in scans
        ],
    }


@app.get("/scans/{scan_id}")
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    """Get full details of a single scan."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "scan_id": scan.id,
        "user_id": scan.user_id,
        "front_image_url": scan.front_image_url,
        "back_image_url": scan.back_image_url,
        "raw_ocr": scan.raw_ocr,
        "rules_result": scan.rules_result,
        "passed": scan.passed,
        "needs_review": scan.needs_review,
        "failed": scan.failed,
        "overall_status": scan.overall_status.value,
        "created_at": scan.created_at.isoformat(),
    }


@app.delete("/scans/{scan_id}")
def delete_scan(scan_id: str, db: Session = Depends(get_db)):
    """Delete a scan by ID."""
    scan = db.query(Scan).filter(Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    db.delete(scan)
    db.commit()
    return {"detail": "Scan deleted", "scan_id": scan_id}


@app.get("/scans/stats/summary")
def scan_stats(
    user_id: str = Query(default="anonymous"),
    db: Session = Depends(get_db),
):
    """Aggregate stats: total scans, compliance rate, top violations."""
    scans = db.query(Scan).filter(Scan.user_id == user_id).all()
    total = len(scans)
    if total == 0:
        return {"total_scans": 0, "compliant": 0, "non_compliant": 0, "compliance_rate": 0}

    compliant = sum(1 for s in scans if s.overall_status == ComplianceStatus.COMPLIANT)
    return {
        "total_scans": total,
        "compliant": compliant,
        "non_compliant": total - compliant,
        "compliance_rate": round(compliant / total * 100, 1),
    }