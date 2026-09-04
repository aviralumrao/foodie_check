from mapping.patterns import HEDGE_PHRASES

def check_presence(field_data, rule, all_text_blocks):
    if field_data is None:
        return "failed"
    if field_data.get("status") == "conflict":
        return "needs_review"
    return "passed"

def check_presence_with_hedge(field_data, rule, all_text_blocks):
    if field_data is not None:
        return "passed"
    nearby_text = " ".join(b["text"].lower() for b in all_text_blocks)
    return "needs_review" if any(p in nearby_text for p in HEDGE_PHRASES) else "failed"

def check_presence_multi(field_data, rule, all_text_blocks):
    if not field_data:
        return "failed"
    return "needs_review" if len(field_data) > 1 else "passed"

CHECK_FUNCTIONS = {
    "presence": check_presence,
    "presence_with_hedge": check_presence_with_hedge,
    "presence_multi": check_presence_multi,
}