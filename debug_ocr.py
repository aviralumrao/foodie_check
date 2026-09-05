"""Dump the latest OCR raw blocks so we can see what text PaddleOCR actually found."""
import json, requests, sys, io
from PIL import Image, ImageDraw

# Re-run the /evaluate but also save the raw scan
# Just read from the backend /ocr endpoint if images still around,
# or parse the latest_report. Let's create a quick debug endpoint.

# For now, let's just add logging to see what OCR text was extracted
# by reading the evaluate response and printing all text blocks.

# Actually let's just add a debug /ocr call and save raw blocks.
print("Let's check if latest_scan.json exists with raw OCR data...")
try:
    with open("services/ocr-engine/results/latest_scan.json") as f:
        data = json.load(f)
    print(f"\n=== FRONT ({len(data.get('front',[]))} blocks) ===")
    for b in data.get("front", []):
        print(f"  [{b['confidence']:.2f}] {b['text']}")
    print(f"\n=== BACK ({len(data.get('back',[]))} blocks) ===")
    for b in data.get("back", []):
        print(f"  [{b['confidence']:.2f}] {b['text']}")
except FileNotFoundError:
    print("latest_scan.json not found - the /evaluate endpoint doesn't save raw scan.")
    print("Let's modify main.py to also save raw OCR blocks during /evaluate.")
