import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/Footer";

const processSteps = [
  {
    step: "01",
    title: "Upload",
    description: "Upload a front and back image of the product packaging through the web app.",
  },
  {
    step: "02",
    title: "Extract",
    description: "OCR reads all visible text from both images, capturing exact wording, position, and confidence.",
  },
  {
    step: "03",
    title: "Map",
    description: "Extracted text is matched to specific declaration types, MRP, net quantity, manufacturer address, and more, using pattern and keyword recognition across both images together.",
  },
  {
    step: "04",
    title: "Verify",
    description: "Each declaration is checked against the actual Legal Metrology (Packaged Commodities) Rules, 2011, clause by clause.",
  },
  {
    step: "05",
    title: "Report",
    description: "Results come back as Passed, Failed, or Needs Review, with a downloadable PDF report and full scan history.",
  },
];

const techStack = [
  { name: "Next.js", use: "Frontend web application" },
  { name: "PaddleOCR", use: "Text extraction from label images" },
  { name: "FastAPI", use: "OCR and rule engine service" },
  { name: "PostgreSQL", use: "Scan and compliance history storage" },
];

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center px-4 py-12 pt-32 max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 text-center">About Pack Sure</h1>
        <p className="text-lg text-gray-600 text-center mb-16 max-w-2xl">
          Automated compliance verification for packaged commodities under the
          Legal Metrology (Packaged Commodities) Rules, 2011.
        </p>

        <section className="w-full mb-16">
          <h2 className="text-2xl font-bold mb-3">The problem</h2>
          <p className="text-gray-700 leading-relaxed">
            Every packaged commodity sold in India must carry mandatory declarations,
            manufacturer details, net quantity, MRP, manufacturing date, and consumer
            care information, in a specified format. With the volume of products moving
            through retail and e-commerce, manually checking every label for compliance
            is slow and easy to fall behind on. Missing declarations, incorrect MRP
            disclosure, and other violations often go unnoticed simply due to scale.
          </p>
        </section>

        <section className="w-full mb-16">
          <h2 className="text-2xl font-bold mb-3">How it works</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Pack Sure doesn't rely on a single black-box model. It's a pipeline: OCR
            reads the label, a mapping layer identifies which text belongs to which
            declaration, and a rule engine checks each one against the actual regulation
            text.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Every result comes back as Passed, Failed, or Needs Review, not a simple
            yes/no. Some declarations, like MRP printed on a sealed flap rather than the
            visible label, genuinely can't be confirmed from a photo alone, and the
            system says so rather than guessing.
          </p>
        </section>

        <section className="w-full mb-16">
          <h2 className="text-2xl font-bold mb-6">The process</h2>
          <div className="flex flex-col gap-6">
            {processSteps.map((item) => (
              <div key={item.step} className="flex gap-6 items-start">
                <span className="text-3xl font-bold text-gray-300 w-12 shrink-0">{item.step}</span>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full mb-16">
          <h2 className="text-2xl font-bold mb-6">Built with</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {techStack.map((tech) => (
              <div key={tech.name} className="bg-[#f7f6f1] rounded-2xl p-4 text-center">
                <p className="font-semibold">{tech.name}</p>
                <p className="text-gray-500 text-xs mt-1">{tech.use}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full mb-16">
          <h2 className="text-2xl font-bold mb-3">Why this matters</h2>
          <p className="text-gray-700 leading-relaxed">
            Legal Metrology declarations exist to protect consumers, transparency on
            price, quantity, and origin is a legal right, not a courtesy. Faster,
            consistent compliance checks mean enforcement officers can review more
            products with the same resources, and violations that would otherwise slip
            through get caught.
          </p>
        </section>

        <section className="w-full bg-[#f7f6f1] rounded-2xl p-6 text-center">
          <p className="font-semibold">Built for Smart India Hackathon 2026</p>
          <p className="text-gray-600 text-sm mt-1">
            Problem Statement SIH26034 — Ministry of Consumer Affairs, Food & Public Distribution
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}