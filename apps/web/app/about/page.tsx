import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 pt-32">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl font-bold mb-6">About Foodie Check</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Foodie Check is an automated compliance verification system for packaged
            commodities under the Legal Metrology (Packaged Commodities) Rules, 2011.
            Built for the Smart India Hackathon 2026.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
