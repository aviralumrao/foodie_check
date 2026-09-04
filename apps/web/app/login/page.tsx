import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12 pt-32">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
          <p className="text-center text-gray-600 mb-8">
            Authentication coming soon. This page is a placeholder for future login functionality.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
