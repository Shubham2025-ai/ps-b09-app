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
        body: JSON.stringify({
          category,
          description,
          immediateDanger,
          isAnonymous,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Submission failed");
        setSubmitting(false);
        return;
      }

      // Upload evidence if present, now that we have a caseId
      if (file && fileHash) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caseId", data.caseId);
        formData.append("fileHash", fileHash);
        await fetch("/api/evidence/upload", { method: "POST", body: formData });
      }

      router.push(`/report/confirmation?code=${data.trackingCode}&severity=${data.severity}`);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: 24 }}>
      <p style={{ color: "#888", fontSize: 13 }}>
        Step {step} of {totalSteps} — {isAnonymous ? "Anonymous" : "Confidential"} report
      </p>

      {step === 1 && (
        <div>
          <h2>What type of incident?</h2>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setStep(2);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: 14,
                marginBottom: 8,
                border: category === c ? "2px solid #333" : "1px solid #ccc",
                borderRadius: 8,
                background: "white",
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div>
          <h2>Describe what happened</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            style={{ width: "100%", padding: 12, fontSize: 14 }}
            placeholder="Include date, location, and what occurred. Take your time."
          />
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={() => setStep(1)}>Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={description.trim().length < 10}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2>Evidence (optional)</h2>
          <input type="file" onChange={handleFileChange} />
          {fileHash && (
            <div style={{ marginTop: 12, padding: 12, background: "#f5f5f5", borderRadius: 6, fontSize: 13 }}>
              <p style={{ margin: 0 }}>File hash computed — this proves your file can't be altered later:</p>
              <code style={{ fontSize: 11, wordBreak: "break-all" }}>{fileHash}</code>
            </div>
          )}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={() => setStep(2)}>Back</button>
            <button onClick={() => setStep(4)}>Next</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 style={{ color: "#b91c1c" }}>Are you in immediate physical danger?</h2>
          <p style={{ color: "#666" }}>This helps us route your report to the right responder urgently.</p>
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              onClick={() => {
                setImmediateDanger(true);
                setStep(5);
              }}
              style={{ padding: "12px 24px", background: "#fee2e2", border: "1px solid #b91c1c" }}
            >
              Yes
            </button>
            <button
              onClick={() => {
                setImmediateDanger(false);
                setStep(5);
              }}
              style={{ padding: "12px 24px" }}
            >
              No
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2>Review & Submit</h2>
          <p><strong>Category:</strong> {category}</p>
          <p><strong>Description:</strong> {description}</p>
          <p><strong>Evidence:</strong> {file ? file.name : "None"}</p>
          <p><strong>Immediate danger flagged:</strong> {immediateDanger ? "Yes" : "No"}</p>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button onClick={() => setStep(4)} disabled={submitting}>Back</button>
            <button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}