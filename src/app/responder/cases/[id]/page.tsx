"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ResponderCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [caseData, setCaseData] = useState<any>(null);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    fetch(`/api/ic/cases/${id}`)
      .then((res) => res.json())
      .then((data) => setCaseData(data));
  }, [id]);

  const handleAcknowledge = async () => {
    await fetch(`/api/responder/cases/${id}/acknowledge`, { method: "PATCH" });
    setAcknowledged(true);
    setTimeout(() => router.push("/responder"), 1500);
  };

  if (!caseData)
    return <div className="min-h-screen bg-ops-bg text-ops-text p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-ops-bg text-ops-text">
      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-status-urgent mb-1">
          <AlertTriangle size={20} />
          <h1 className="text-xl font-semibold">Urgent: {caseData.trackingCode}</h1>
        </div>
        <p className="text-ops-text-muted mb-6">{caseData.category}</p>

        <div className="bg-ops-surface border border-ops-border rounded-xl p-4 space-y-3 text-sm">
          <div>
            <p className="text-ops-text-muted mb-1">Description</p>
            <p className="m-0">{caseData.description}</p>
          </div>
          <div>
            <p className="text-ops-text-muted mb-1">Immediate Danger</p>
            <p className="m-0">{caseData.immediateDanger ? "Yes" : "No"}</p>
          </div>
        </div>

        {!acknowledged ? (
          <button
            onClick={handleAcknowledge}
            className="mt-6 w-full px-6 py-3.5 rounded-xl bg-status-urgent text-white font-semibold"
          >
            Acknowledge & Respond
          </button>
        ) : (
          <div className="mt-6 flex items-center gap-2 text-status-resolved">
            <CheckCircle2 size={18} />
            <p className="m-0">Acknowledged. Redirecting to queue...</p>
          </div>
        )}
      </div>
    </div>
  );
}