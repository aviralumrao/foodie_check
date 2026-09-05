import re
from mapping.patterns import FIELD_PATTERNS, COMMON_NAME_KEYWORDS, ADDRESS_KEYWORDS, PINCODE_PATTERN


def extract_field(field_name, text_blocks):
    """Try to match a field pattern against all text blocks."""
    pattern = FIELD_PATTERNS[field_name]
    for block in text_blocks:
        match = re.search(pattern, block["text"], re.IGNORECASE)
        if match:
            return {
                "value": match.group(1).strip() if match.lastindex else match.group(0).strip(),
                "confidence": block["confidence"],
                "source": block["bbox"],
            }
    return None


def extract_field_fuzzy(field_name, text_blocks):
    """Fallback: join all text blocks and search across the full text."""
    pattern = FIELD_PATTERNS[field_name]
    full_text = " ".join(b["text"] for b in text_blocks)
    match = re.search(pattern, full_text, re.IGNORECASE)
    if match:
        value = match.group(1).strip() if match.lastindex else match.group(0).strip()
        return {"value": value, "confidence": 0.75, "source": "combined_text"}
    return None


def extract_common_name(text_blocks):
    """Find a common/generic product name by keyword matching."""
    for block in text_blocks:
        text_lower = block["text"].lower()
        for keyword in COMMON_NAME_KEYWORDS:
            if keyword in text_lower:
                return {
                    "value": block["text"],
                    "confidence": block["confidence"],
                    "source": block["bbox"],
                }
    return None


def score_address_block(text):
    score = sum(1 for kw in ADDRESS_KEYWORDS if kw in text.lower())
    if re.search(PINCODE_PATTERN, text):
        score += 2
    return score


def find_addresses(text_blocks, threshold=2):
    return [b for b in text_blocks if score_address_block(b["text"]) >= threshold]


def merge_field(front_result, back_result):
    if front_result and back_result:
        if front_result["value"] != back_result["value"]:
            return {"status": "conflict", "front": front_result, "back": back_result}
        return front_result if front_result["confidence"] >= back_result["confidence"] else back_result
    return front_result or back_result


def map_fields(front_blocks, back_blocks):
    fields = {}
    all_blocks = front_blocks + back_blocks

    # Pattern-based fields: try per-block first, then fuzzy across combined text
    for name in FIELD_PATTERNS:
        front_result = extract_field(name, front_blocks)
        back_result = extract_field(name, back_blocks)
        merged = merge_field(front_result, back_result)
        if merged is None:
            merged = extract_field_fuzzy(name, all_blocks)
        fields[name] = merged

    # Common/generic name by keyword
    fields["common_name"] = extract_common_name(front_blocks) or extract_common_name(back_blocks)

    # Manufacturer/packer address
    addresses = find_addresses(front_blocks) + find_addresses(back_blocks)
    # If threshold=2 found nothing, try threshold=1
    if not addresses:
        addresses = find_addresses(all_blocks, threshold=1)
    fields["manufacturer_address"] = addresses if addresses else None

    return fields
