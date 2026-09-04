import json
from rules.checks import CHECK_FUNCTIONS

def load_rules(path="rules/ruleset.json"):
    with open(path) as f:
        return json.load(f)

def run_rule_engine(fields, all_text_blocks, rules_path="rules/ruleset.json"):
    rules = load_rules(rules_path)
    results = []
    for rule in rules:
        field_data = fields.get(rule["field"])
        check_fn = CHECK_FUNCTIONS[rule["check"]]
        status = check_fn(field_data, rule, all_text_blocks)
        results.append({
            "rule_id": rule["id"],
            "clause": rule["clause"],
            "field": rule["field"],
            "description": rule["description"],
            "status": status,
            "evidence": field_data,
        })
    return results