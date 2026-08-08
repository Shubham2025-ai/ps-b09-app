"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hashFile } from "@/lib/clientHash";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

function ReportWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAnonymous = searchParams.get("mode") !== "confidential";
  const { t, lang } = useLanguage();

  const CATEGORIES = [
    { key: "verbal", label: t.categories.verbal },
    { key: "physical", label: t.categories.physical },
    { key: "discrimination", label: t.categories.discrimination },
    { key: "inappropriate", label: t.categories.inappropriate },
    { key: "retaliation", label: t.categories.retaliation },
    { key: "other", label: t.categories.other },
  ];

  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [immediateDanger, setImmediateDanger] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = 5;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const hash = await hashFile(f);
    setFileHash(hash);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Category is always stored in English in the DB, regardless of display language,
      // so classification/routing logic stays consistent across languages
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description, immediateDanger, isAnonymous }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
        setSubmitting(false);
        return;
      }
      if (file && fileHash) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caseId", data.caseId);
        formData.append("fileHash", fileHash);
        await fetch("/api/evidence/upload", { method: "POST", body: formData });
      }
      router.push(`/report/confirmation?code=${data.trackingCode}&severity=${data.severity}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const stepLabel = t.stepOf.replace("{step}", String(step)).replace("{total}", String(totalSteps));

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-lg mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-calm-text-muted">
            {stepLabel} · {isAnonymous ? t.anonymous : t.confidential}
          </p>
          <LanguageSwitcher />
        </div>
        <div className="h-1 bg-calm-border rounded-full mb-8 mt-3 overflow-hidden">
          <motion.div
            className="h-full bg-calm-accent"
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <div>
                <h2 className="text-xl font-serif-warm mb-4">{t.incidentType}</h2>
                <div className="flex flex-col gap-3">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => {
                        setCategory(c.label);
                        setStep(2);
                      }}
                      className={`text-left px-5 py-4 rounded-xl border bg-calm-surface min-h-[44px] transition-colors ${
                        category === c.label
                          ? "border-calm-accent border-2"
                          : "border-calm-border hover:border-calm-accent"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-xl font-serif-warm mb-2">{t.describeTitle}</h2>
                <p className="text-sm text-calm-text-muted mb-4">{t.describeSubtitle}</p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={8}
                  className="w-full p-4 rounded-xl border border-calm-border bg-calm-surface text-calm-text"
                  placeholder={t.describePlaceholder}
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl border border-calm-border min-h-[44px]"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={description.trim().length < 10}
                    className="px-5 py-3 rounded-xl bg-calm-accent text-white min-h-[44px] disabled:opacity-40"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-xl font-serif-warm mb-2">{t.evidenceTitle}</h2>
                <input type="file" onChange={handleFileChange} className="mb-3" />
                {fileHash && (
                  <div className="p-4 bg-calm-surface border border-calm-border rounded-xl text-sm">
                    <p className="mb-1">{t.evidenceHashNote}</p>
                    <code className="text-xs break-all font-mono-precise text-calm-text-muted">
                      {fileHash}
                    </code>
                  </div>
                )}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl border border-calm-border min-h-[44px]"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="px-5 py-3 rounded-xl bg-calm-accent text-white min-h-[44px]"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="bg-danger-bg border border-danger-border rounded-xl p-6">
                <h2 className="text-xl font-serif-warm mb-2 text-danger-text">{t.dangerTitle}</h2>
                <p className="text-sm text-calm-text-muted mb-6">{t.dangerSubtitle}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setImmediateDanger(true);
                      setStep(5);
                    }}
                    className="px-6 py-3 rounded-xl bg-danger-border text-white min-h-[44px] font-semibold"
                  >
                    {t.yes}
                  </button>
                  <button
                    onClick={() => {
                      setImmediateDanger(false);
                      setStep(5);
                    }}
                    className="px-6 py-3 rounded-xl border border-calm-border bg-calm-surface min-h-[44px]"
                  >
                    {t.no}
                  </button>
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-xl font-serif-warm mb-4">{t.reviewTitle}</h2>
                <div className="bg-calm-surface border border-calm-border rounded-xl p-4 space-y-2 text-sm">
                  <p><strong>{t.category}:</strong> {category}</p>
                  <p><strong>{t.description}:</strong> {description}</p>
                  <p><strong>{t.evidence}:</strong> {file ? file.name : t.none}</p>
                  <p><strong>{t.dangerFlagged}:</strong> {immediateDanger ? t.yes : t.no}</p>
                </div>
                {error && <p className="text-danger-text text-sm mt-3">{error}</p>}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(4)}
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl border border-calm-border min-h-[44px]"
                  >
                    {t.back}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="px-5 py-3 rounded-xl bg-calm-accent text-white min-h-[44px] disabled:opacity-60"
                  >
                    {submitting ? t.submitting : t.submit}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ReportWizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-calm-bg" />}>
      <ReportWizardContent />
    </Suspense>
  );
}