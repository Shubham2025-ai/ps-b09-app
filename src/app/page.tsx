import Link from "next/link";
import { ShieldCheck, Lock, Fingerprint, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-calm-surface border border-calm-border text-xs text-calm-text-muted mb-6">
          <ShieldCheck size={14} className="text-calm-accent" />
          Confidential · Tamper-evident · POSH Act aligned
        </div>

        <h1 className="text-4xl font-serif-warm mb-4 leading-tight">
          A safer way to report workplace harassment
        </h1>
        <p className="text-calm-text-muted mb-10 text-lg">
          Every report is confidential. Every piece of evidence is cryptographically
          protected. Every case is tracked transparently, start to finish.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
          <Link
            href="/report"
            className="px-8 py-3.5 rounded-xl bg-calm-accent text-white font-medium"
          >
            Report an Incident
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl border border-calm-border font-medium"
          >
            Staff Login
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-4">
            <Lock size={20} className="text-calm-accent mb-2" />
            <p className="font-semibold text-sm mb-1">Anonymous option</p>
            <p className="text-xs text-calm-text-muted">
              Report with no identity stored, ever.
            </p>
          </div>
          <div className="p-4">
            <Fingerprint size={20} className="text-calm-accent mb-2" />
            <p className="font-semibold text-sm mb-1">Tamper-evident records</p>
            <p className="text-xs text-calm-text-muted">
              Cryptographic hash chain, not just a promise.
            </p>
          </div>
          <div className="p-4">
            <Clock size={20} className="text-calm-accent mb-2" />
            <p className="font-semibold text-sm mb-1">Real-time tracking</p>
            <p className="text-xs text-calm-text-muted">
              Know your case status, always.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}