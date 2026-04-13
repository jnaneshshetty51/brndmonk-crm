import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#6B5B95] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6">B</div>
        <h1 className="text-6xl font-bold text-[#2D3142] mb-2">404</h1>
        <p className="text-[#6B7280] mb-6">This page doesn&apos;t exist.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-[#6B5B95] text-white font-semibold rounded-lg hover:bg-[#5A4A84] transition-colors text-sm">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
