import re
from mapping.patterns import FIELD_PATTERNS, COMMON_NAME_KEYWORDS, ADDRESS_KEYWORDS, PINCODE_PATTERN

def extract_field(field_name, text_blocks):
    pattern = FIELD_PATTERNS[field_name]
    for block in text_blocks:
        match = re.search(pattern, block["text"], re.IGNORECASE)
        if match:
            return {"value": match.group(1), "confidence": block["confidence"], "source": block["bbox"]}
    return None

def extract_common_name(text_blocks):
    for block in text_blocks:
        text_lower = block["text"].lower()
        for keyword in COMMON_NAME_KEYWORDS:
            if keyword in text_lower:
                return {"value": block["text"], "confidence": block["confidence"], "source": block["bbox"]}
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
    for name in FIELD_PATTERNS:
        fields[name] = merge_field(extract_field(name, front_blocks), extract_field(name, back_blocks))

    fields["common_name"] = extract_common_name(front_blocks) or extract_common_name(back_blocks)
    addresses = find_addresses(front_blocks) + find_addresses(back_blocks)
    fields["manufacturer_address"] = addresses if addresses else None

    return fields