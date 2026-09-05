FIELD_PATTERNS = {
    "net_quantity": r"(?:Net\s*(?:Wt|Weight|Qty|Quantity|Content|Contents|Vol|Volume)\.?\s*[:\-\.]?\s*(\d+[\.,]?\d*)\s*(?:g|gm|gms|gram|grams|kg|kgs|ml|mL|ltr|l|litre|litres|cc|oz|fl\.?\s*oz))",
    "mrp": r"(?:M\.?\s*R\.?\s*P\.?|Max\.?\s*Retail\s*Price|Maximum\s*Retail\s*Price)\s*[:\-\.]?\s*[₹Rs\.INR]*\s*(\d+[\.,]?\d*)",
    "mfg_date": r"(?:MFD|MFG|Mfg\.?\s*(?:Date|Dt\.?)|Mfd\.?\s*(?:Date|Dt\.?)?|Packed\s*(?:on|Date)|Date\s*of\s*(?:Mfg|Manufacture|Manufacturing|Packing|Pack|Pkg)|Packing\s*Date|Pkg\.?\s*(?:Date|Dt\.?))\s*[:\-\.]?\s*(\d{1,2}\s*[/\-\.]\s*\d{2,4}|\d{1,2}\s*[/\-\.]\s*\d{1,2}\s*[/\-\.]\s*\d{2,4}|\w{3,9}\s*['\-,]?\s*\d{2,4})",
    "best_before": r"(?:Best\s*Before|BB|Exp(?:iry)?\.?\s*(?:Date|Dt\.?)?|Use\s*(?:Before|By)|Expiry|EXP)\s*[:\-\.]?\s*(\d{1,2}\s*[/\-\.]\s*\d{2,4}|\d{1,2}\s*[/\-\.]\s*\d{1,2}\s*[/\-\.]\s*\d{2,4}|\w{3,9}\s*['\-,]?\s*\d{2,4}|\d+\s*(?:months?|days?|years?))",
    "consumer_care": r"(?:Consumer\s*(?:Care|Helpline|Complaints?)|Customer\s*(?:Care|Helpline|Service)|Toll\s*Free|Helpline|Grievance)\s*[:\-\.]?\s*[\d\-\+\(\)\s]{7,}",
    "fssai_license": r"(?:FSSAI\s*(?:Lic|License|Licence)?\.?\s*(?:No\.?)?|Lic\.?\s*No\.?)\s*[:\-\.]?\s*(\d[\d\s]{10,})",
}

COMMON_NAME_KEYWORDS = [
    # Snacks & confections
    "chocolate", "biscuit", "biscuits", "cookie", "cookies", "wafer", "wafers",
    "candy", "candies", "toffee", "toffees", "lollipop", "gum", "chewing gum",
    "namkeen", "bhujia", "chips", "crisps", "snack", "snacks", "nachos",
    "popcorn", "makhana", "papad", "pappad", "murukku", "mixture",
    # Dairy
    "milk", "curd", "yogurt", "yoghurt", "paneer", "cheese", "butter",
    "ghee", "cream", "ice cream", "lassi", "buttermilk", "khoa", "khoya",
    # Beverages
    "juice", "drink", "beverage", "soda", "water", "tea", "coffee",
    "shake", "squash", "sherbet", "sharbat", "nimbu pani", "cold drink",
    # Grains & staples
    "rice", "wheat", "flour", "atta", "maida", "suji", "rava", "semolina",
    "dal", "daal", "lentil", "lentils", "pulses", "besan", "gram flour",
    "oats", "muesli", "cereal", "cornflakes", "noodle", "noodles", "pasta",
    "vermicelli", "sevai", "maggi",
    # Oils & spices
    "oil", "refined oil", "mustard oil", "coconut oil", "sunflower oil",
    "salt", "sugar", "jaggery", "honey", "spice", "spices", "masala",
    "turmeric", "haldi", "chilli", "mirch", "cumin", "jeera", "pickle", "achar",
    # Bakery
    "bread", "pav", "bun", "cake", "rusk", "toast", "muffin", "pastry",
    # Sauces / condiments
    "sauce", "ketchup", "chutney", "jam", "jelly", "mayonnaise", "vinegar",
    "soy sauce", "dressing",
    # Processed / packaged
    "instant", "ready to eat", "ready to cook", "frozen", "canned",
    # Drinks/alcohol
    "beer", "wine", "whisky", "whiskey", "rum", "vodka", "gin", "brandy",
    "liquor", "alcohol", "spirit", "spirits", "extra neutral alcohol",
    # Composite / generic terms
    "composite chocolate", "compound chocolate", "food product", "edible",
    "confectionery", "sweet", "sweets", "mithai", "halwa", "barfi", "ladoo",
    "rasgulla", "gulab jamun",
]

ADDRESS_KEYWORDS = [
    "mfd by", "mfd. by", "manufactured by", "manufactured at",
    "marketed by", "packed by", "packed at", "packer",
    "imported by", "importer", "distributed by", "distributor",
    "pvt", "ltd", "limited", "private", "corporation", "corp",
    "inc", "llp", "industries", "enterprises", "company",
    "distt", "dist", "district", "village", "vill",
    "pin", "pincode", "pin code",
    "road", "street", "lane", "nagar", "colony", "sector",
    "plot", "block", "floor", "building", "tower",
    "state", "india", "delhi", "mumbai", "kolkata", "chennai",
    "bangalore", "bengaluru", "hyderabad", "pune", "ahmedabad",
    "jaipur", "lucknow", "gurgaon", "gurugram", "noida", "ghaziabad",
]
PINCODE_PATTERN = r"\b\d{6}\b"

HEDGE_PHRASES = [
    "under the seal", "see below", "see cap", "see lid",
    "see top", "see bottom", "see pack", "see label",
    "see back", "see front", "see wrapper", "see pouch",
    "printed on", "embossed on", "stamped on", "mentioned on",
    "best before see", "mfg date see", "mfd see",
]
