"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CaseDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [caseData, setCaseData] = useState<any>(null);
  const [tab, setTab] = useState<"overview" | "evidence" | "audit" | "actions">("overview");
  const [auditData, setAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  const loadCase = () => {
    fetch(`/api/ic/cases/${id}`)
      .then((res) => res.json())
      .then((data) => setCaseData(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const loadAudit = () => {
    fetch(`/api/ic/cases/${id}/audit`)
      .then((res) => res.json())
      .then((data) => setAuditData(data));
  };

  const updateStatus = async (status: string) => {
    setStatusMessage("Updating...");
    await fetch(`/api/ic/cases/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadCase();
    setStatusMessage(`Status updated to ${status}`);
    setTimeout(() => setStatusMessage(""), 3000);
  };

  if (loading || !caseData) return <div className="p-10 text-ops-text">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 my-10 bg-ops-surface rounded-xl border border-ops-border text-ops-text">
      <h1 className="text-xl font-semibold">{caseData.trackingCode}</h1>
      <p className="text-ops-text-muted">
        {caseData.category} · {caseData.severity} · <strong className="text-ops-text">{caseData.status}</strong>
      </p>

      <div className="flex gap-2 border-b border-ops-border mt-6">
        {(["overview", "evidence", "audit", "actions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              if (t === "audit") loadAudit();
            }}
            className={`px-4 py-2 bg-transparent capitalize cursor-pointer border-b-2 ${
              tab === t
                ? "border-ops-accent font-semibold text-ops-text"
                : "border-transparent text-ops-text-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && (
          <div>
            <p className="font-semibold">Description:</p>
            <p className="bg-ops-bg p-3 rounded-md text-ops-text">{caseData.description}</p>
            <p><strong>AI Severity Reasoning:</strong> {caseData.severityReasoning}</p>
            <p><strong>Immediate Danger Flagged:</strong> {caseData.immediateDanger ? "Yes" : "No"}</p>
            <p><strong>Assigned To:</strong> {caseData.assignedTo?.email || "Unassigned"}</p>
          </div>
        )}

        {tab === "evidence" && (
          <div>
            {caseData.evidence.length === 0 && <p className="text-ops-text-muted">No evidence uploaded.</p>}
            {caseData.evidence.map((e: any) => (
              <div key={e.id} className="p-3 border border-ops-border rounded-md mb-2">
                <p className="font-semibold">{e.fileName}</p>
                <p className="text-xs text-ops-text-muted break-all font-mono">Hash: {e.fileHash}</p>
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/evidence/${e.id}/view-url`);
                    const data = await res.json();
                    if (data.url) window.open(data.url, "_blank");
                    else alert("Could not load file");
                  }}
                  className="text-ops-accent bg-transparent border-none cursor-pointer p-0 underline text-sm"
                >
                  View file
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === "audit" && (
          <div>
            {!auditData && <p className="text-ops-text-muted">Loading audit trail...</p>}
            {auditData && (
              <>
                <div
                  className={`flex items-center gap-3 rounded-lg p-4 mb-6 border ${
                    auditData.verification.valid
                      ? "bg-status-resolved-bg border-status-resolved"
                      : "bg-status-urgent-bg border-status-urgent"
                  }`}
                >
                  <span
                    className={`text-2xl ${
                      auditData.verification.valid ? "text-status-resolved" : "text-status-urgent"
                    }`}
                  >
                    {auditData.verification.valid ? "✓" : "✗"}
                  </span>
                  <div>
                    <p className="font-semibold text-ops-text m-0">
                      {auditData.verification.valid
                        ? "Chain verified — no tampering detected"
                        : "Chain broken — tampering detected"}
                    </p>
                    {!auditData.verification.valid && (
                      <p className="text-sm text-ops-text-muted m-0 mt-1">
                        Row <code className="font-mono">{auditData.verification.brokenAtRowId}</code> (
                        {auditData.verification.brokenAtAction}) does not match its recorded hash
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  {auditData.rows.map((r: any, i: number) => {
                    const isBroken =
                      !auditData.verification.valid && r.id === auditData.verification.brokenAtRowId;
                    return (
                      <div key={r.id} className="flex gap-3 relative">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full mt-1.5 ${
                              isBroken ? "bg-status-urgent" : "bg-status-resolved"
                            }`}
                          />
                          {i < auditData.rows.length - 1 && (
                            <div
                              className={`w-0.5 flex-1 ${isBroken ? "bg-status-urgent" : "bg-ops-border"}`}
                              style={{ minHeight: 32 }}
                            />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <p className="m-0 text-ops-text">
                            <span className="font-semibold">{r.action}</span>{" "}
                            <span className="text-ops-text-muted text-sm">by {r.actorRole}</span>
                          </p>
                          <p className="m-0 text-xs text-ops-text-muted">
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                          <p className="m-0 mt-1 font-mono text-xs text-ops-text-muted break-all">
                            {r.rowHash.slice(0, 24)}...
                          </p>
                          {isBroken && (
                            <p className="mt-1 text-xs text-status-urgent font-semibold">
                              ⚠ Hash mismatch — this row was altered outside the application
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "actions" && (
          <div>
            <p className="font-semibold">Update Status</p>
            {statusMessage && <p className="text-status-resolved text-sm">{statusMessage}</p>}
            <div className="flex gap-2 flex-wrap">
              {["SUBMITTED", "UNDER_REVIEW", "ACTION_TAKEN", "CLOSED"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  disabled={caseData.status === s}
                  className="px-3 py-2 bg-ops-bg border border-ops-border rounded-md text-ops-text disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}