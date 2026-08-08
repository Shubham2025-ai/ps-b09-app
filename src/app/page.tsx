import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-calm-bg text-calm-text flex items-center justify-center">
      <div className="max-w-md text-center px-6">
        <h1 className="text-3xl font-serif-warm mb-3">Workplace Safety Reporting</h1>
        <p className="text-calm-text-muted mb-8">
          Confidential, secure reporting with protected evidence and transparent case tracking.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/report"
            className="px-6 py-3 rounded-xl bg-calm-accent text-white font-medium"
          >
            Report an Incident
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border border-calm-border"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
}