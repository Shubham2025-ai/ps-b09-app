"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

const STATUS_STEPS = ["SUBMITTED", "UNDER_REVIEW", "ACTION_TAKEN", "CLOSED"];
const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  ACTION_TAKEN: "Action Taken",
  CLOSED: "Closed",
};

export default function TrackCasePage() {
  const params = useParams();
  const code = params.code as string;
  const [caseData, setCaseData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/cases/track/${code}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setCaseData(data))
      .catch(() => setError("Case not found. Check your tracking code."))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading)
    return <div className="min-h-screen bg-calm-bg text-calm-text p-10 text-center">Loading...</div>;

  if (error) {
    return (
      <div className="min-h-screen bg-calm-bg flex flex-col items-center justify-center gap-3">
        <XCircle size={32} className="text-danger-text" />
        <p className="text-danger-text">{error}</p>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(caseData.status);

  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-md mx-auto px-6 py-20">
        <h1 className="text-2xl font-serif-warm text-center mb-10">
          Case {caseData.trackingCode}
        </h1>

        <div>
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex items-center mb-5">
              {i <= currentIndex ? (
                <CheckCircle2 size={20} className="text-calm-accent mr-4 flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-calm-border mr-4 flex-shrink-0" />
              )}
              <span className={i <= currentIndex ? "text-calm-text" : "text-calm-text-muted"}>
                {STATUS_LABELS[s]}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-calm-text-muted mt-8">
          Last updated: {new Date(caseData.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}