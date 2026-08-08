"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Fingerprint, Clock, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-calm-bg text-calm-text relative overflow-hidden">
      {/* Subtle gradient mesh backdrop */}
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(74,107,92,0.08), transparent 40%), radial-gradient(circle at 80% 60%, rgba(74,107,92,0.06), transparent 40%)",
        }}
      />

      <div className="max-w-2xl mx-auto px-6 py-24 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-calm-surface border border-calm-border text-xs text-calm-text-muted mb-8 shadow-sm"
        >
          <ShieldCheck size={14} className="text-calm-accent" />
          Confidential · Tamper-evident · Verified live
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl font-serif-warm mb-5 leading-[1.15] tracking-tight"
        >
          A safer way to report
          <br />
          workplace harassment
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-calm-text-muted mb-10 text-lg leading-relaxed max-w-lg mx-auto"
        >
          Every report is confidential. Every piece of evidence is cryptographically
          protected. Every case is tracked transparently, start to finish.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-20"
        >
          <Link
            href="/report"
            className="group px-8 py-3.5 rounded-xl bg-calm-accent text-white font-medium shadow-lg shadow-calm-accent/20 hover:shadow-xl hover:shadow-calm-accent/25 transition-all flex items-center justify-center gap-2"
          >
            Report an Incident
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-xl border border-calm-border font-medium hover:bg-calm-surface transition-colors"
          >
            Staff Login
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left"
        >
          {[
            {
              icon: Lock,
              title: "Anonymous option",
              desc: "Report with no identity stored, ever.",
            },
            {
              icon: Fingerprint,
              title: "Tamper-evident records",
              desc: "Cryptographic hash chain, not just a promise.",
            },
            {
              icon: Clock,
              title: "Real-time tracking",
              desc: "Know your case status, always.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="p-5 rounded-2xl bg-calm-surface border border-calm-border hover:border-calm-accent/40 hover:-translate-y-0.5 transition-all shadow-sm"
            >
              <f.icon size={20} className="text-calm-accent mb-3" />
              <p className="font-semibold text-sm mb-1">{f.title}</p>
              <p className="text-xs text-calm-text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}