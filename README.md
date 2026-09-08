# Pack Sure

**Pack Sure** (formerly Foodie Check) is an automated food-packaging compliance scanner developed for the **Ministry of Consumer Affairs, Food & Public Distribution** under Smart India Hackathon (SIH) 2026. 

The system evaluates packaged commodity labels against the **Legal Metrology (Packaged Commodities) Rules, 2011**. Users upload front and back images of a product package, the OCR service extracts label text, and a JSON-driven rule engine verifies required declarations.

## 🚀 Live Demo

**Production URL:** [https://foodie-check.vercel.app/](https://foodie-check.vercel.app/)

---

## 🧠 How It Works

The core pipeline uses a structured microservice architecture rather than a single monolithic ML model:

1. **OCR Extraction:** A Python FastAPI service uses `PaddleOCR` to extract raw text, confidences, and bounding boxes from uploaded label photos.
2. **Field Mapping:** Regex and keyword classifiers map the raw OCR blocks to standardized legal fields (e.g., net quantity, MRP, manufacturer details).
3. **Rule Engine:** A JSON-driven engine checks the mapped fields against 8 specific clauses of the Legal Metrology Rules, 2011.
4. **Scoring & Output:** The engine outputs a verdict per rule (`passed`, `failed`, `needs_review`, `not_applicable`) and calculates an overall product compliance status.
5. **PDF Generation:** The frontend dynamically generates a downloadable compliance report PDF using `@react-pdf/renderer`.

### The Ruleset
Currently, the engine validates the following clauses:
* **Rule 6(1)(a):** Manufacturer Address
* **Rule 6(1)(b):** Common Name
* **Rule 6(1)(c):** Net Quantity
* **Rule 6(1)(d):** MRP (Maximum Retail Price)
* **Rule 6(1)(e):** Manufacturing Date
* **Rule 6(1)(f):** Consumer Care Details
* **Rule 6(1)(g):** Country of Origin (Returns `not_applicable` for domestic products)
* **Rule 27:** Registration Number

*Note: Font-size readability (Rule 7) and Principal Display Panel placement (Rule 9) require advanced Computer Vision and are slated for future ML implementation.*

---

## 🏗 Architecture

```text
pack_sure/
├── apps/
│   └── web/                    # Next.js 16 (Turbopack, App Router), TypeScript, Tailwind
│       ├── app/
│       │   ├── api/scan/       # POST: Uploads images to Supabase, calls OCR, saves scan
│       │   ├── api/scans/      # GET: Fetches the 50 most recent scans for history
│       │   ├── history/        # History dashboard & analytics
│       │   ├── about/          # Project overview, workflow, and team
│       │   └── page.tsx        # Core scan interface & dynamic PDF report generation
│       └── lib/
│           ├── supabase.ts     # Supabase client using Service Role key
│           └── api.ts          # OCR service communication types & helpers
└── services/
    └── ocr-engine/             # Python FastAPI service
        ├── main.py             # /ocr and /evaluate endpoints
        ├── mapping/            # Regex/keyword field extraction
        └── rules/              # Legal Metrology ruleset (8 clauses) & validation engine