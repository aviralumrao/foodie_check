FIELD_PATTERNS = {
    "net_quantity": r"(?:Net\s*Wt\.?|Net\s*Quantity)\s*[:\-]?\s*(\d+\.?\d*)\s*(g|kg|ml|l)",
    "mrp": r"(?:MRP|M\.R\.P\.?)[^\d₹]*[₹Rs\.]*\s*(\d+\.?\d*)",
    "mfg_date": r"(?:MFD|Mfg\.?\s*Date|Packed\s*on)[:\-]?\s*(\d{2}[/\-]\d{4}|\w+\s\d{4})",
}

COMMON_NAME_KEYWORDS = ["composite chocolate", "chocolate", "biscuits", "namkeen", "wafer", "candy", "snack"]

ADDRESS_KEYWORDS = ["mfd by", "marketed by", "packed by", "pvt", "ltd", "distt", "pin"]
PINCODE_PATTERN = r"\b\d{6}\b"

HEDGE_PHRASES = ["under the seal", "see below", "see cap", "see lid"]