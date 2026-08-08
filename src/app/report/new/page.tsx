"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { hashFile } from "@/lib/clientHash";

const CATEGORIES = [
  "Verbal harassment",
  "Physical harassment",
  "Discrimination",
  "Inappropriate conduct",
  "Retaliation",
  "Other",
];

export default function ReportWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAnonymous = searchParams.get("mode") !== "confidential";

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

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-lg mx-auto px-5 py-10">
        <p className="text-sm text-calm-text-muted mb-1">
          Step {step} of {totalSteps} · {isAnonymous ? "Anonymous" : "Confidential"} report
        </p>
        <div className="h-1 bg-calm-border rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-calm-accent transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-serif-warm mb-4">What type of incident?</h2>
            <div className="flex flex-col gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCategory(c);
                    setStep(2);
                  }}
                  className={`text-left px-5 py-4 rounded-xl border bg-calm-surface min-h-[44px] transition-colors ${
                    category === c
                      ? "border-calm-accent border-2"
                      : "border-calm-border hover:border-calm-accent"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-serif-warm mb-2">Describe what happened</h2>
            <p className="text-sm text-calm-text-muted mb-4">
              Include date, location, and what occurred. Take your time.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl border border-calm-border bg-calm-surface text-calm-text"
              placeholder="Write in your own words..."
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-calm-border min-h-[44px]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={description.trim().length < 10}
                className="px-5 py-3 rounded-xl bg-calm-accent text-white min-h-[44px] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-serif-warm mb-2">Evidence (optional)</h2>
            <input type="file" onChange={handleFileChange} className="mb-3" />
            {fileHash && (
              <div className="p-4 bg-calm-surface border border-calm-border rounded-xl text-sm">
                <p className="mb-1">This proves your file can't be altered later:</p>
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
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-5 py-3 rounded-xl bg-calm-accent text-white min-h-[44px]"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-danger-bg border border-danger-border rounded-xl p-6">
            <h2 className="text-xl font-serif-warm mb-2 text-danger-text">
              Are you in immediate physical danger?
            </h2>
            <p className="text-sm text-calm-text-muted mb-6">
              This helps us route your report to the right responder urgently.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setImmediateDanger(true);
                  setStep(5);
                }}
                className="px-6 py-3 rounded-xl bg-danger-border text-white min-h-[44px] font-semibold"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setImmediateDanger(false);
                  setStep(5);
                }}
                className="px-6 py-3 rounded-xl border border-calm-border bg-calm-surface min-h-[44px]"
              >
                No
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="text-xl font-serif-warm mb-4">Review & Submit</h2>
            <div className="bg-calm-surface border border-calm-border rounded-xl p-4 space-y-2 text-sm">
              <p><strong>Category:</strong> {category}</p>
              <p><strong>Description:</strong> {description}</p>
              <p><strong>Evidence:</strong> {file ? file.name : "None"}</p>
              <p><strong>Immediate danger flagged:</strong> {immediateDanger ? "Yes" : "No"}</p>
            </div>
            {error && <p className="text-danger-text text-sm mt-3">{error}</p>}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(4)}
                disabled={submitting}
                className="px-5 py-3 rounded-xl border border-calm-border min-h-[44px]"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-3 rounded-xl bg-calm-accent text-white min-h-[44px] disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}