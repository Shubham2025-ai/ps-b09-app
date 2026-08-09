"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Block = { id: number; action: string; hash: string; tampered: boolean };

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

const INITIAL_ACTIONS = ["SUBMITTED", "VIEWED", "STATUS_CHANGED", "RESOLVED"];

export function HashChainDemo() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [broken, setBroken] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  const buildChain = async () => {
    let prevHash = "";
    const newBlocks: Block[] = [];
    for (let i = 0; i < INITIAL_ACTIONS.length; i++) {
      const hash = await sha256(prevHash + INITIAL_ACTIONS[i] + i);
      newBlocks.push({ id: i, action: INITIAL_ACTIONS[i], hash, tampered: false });
      prevHash = hash;
    }
    setBlocks(newBlocks);
    setBroken(null);
    setInitialized(true);
  };

  const tamperBlock = (index: number) => {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, action: "TAMPERED", tampered: true } : b))
    );
    setBroken(index);
  };

  const reset = () => {
    setInitialized(false);
    setBlocks([]);
    setBroken(null);
  };

  if (!initialized) {
    return (
      <div className="p-8 rounded-2xl bg-calm-surface border border-calm-border text-center">
        <p className="text-sm text-calm-text-muted mb-4">
          Try it yourself — build a small audit chain, then tamper with one record.
        </p>
        <button
          onClick={buildChain}
          className="px-6 py-3 rounded-xl bg-calm-accent text-white font-medium"
        >
          Build a sample chain
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-calm-surface border border-calm-border">
      <div className="space-y-3">
        {blocks.map((b, i) => {
          const isBroken = broken !== null && i >= broken;
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                isBroken
                  ? "border-danger-border bg-danger-bg"
                  : "border-calm-border bg-calm-bg"
              }`}
            >
              <div>
                <p className={`m-0 font-medium text-sm ${isBroken ? "text-danger-text" : "text-calm-text"}`}>
                  {b.action}
                </p>
                <code className="text-xs text-calm-text-muted break-all">{b.hash}</code>
              </div>
              {!b.tampered && broken === null && (
                <button
                  onClick={() => tamperBlock(i)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-calm-border text-calm-text-muted hover:border-danger-border hover:text-danger-text transition-colors whitespace-nowrap"
                >
                  Tamper with this row
                </button>
              )}
              {isBroken && <XCircle size={18} className="text-danger-text flex-shrink-0" />}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {broken !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 p-3 rounded-xl bg-danger-bg border border-danger-border flex items-center gap-2"
          >
            <XCircle size={16} className="text-danger-text flex-shrink-0" />
            <p className="m-0 text-sm text-danger-text">
              Chain broken at row {broken + 1} — every row after it is now provably invalid,
              since each hash depends on the one before it.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {broken === null && (
        <div className="mt-4 p-3 rounded-xl bg-status-resolved-bg border border-status-resolved flex items-center gap-2">
          <CheckCircle2 size={16} className="text-status-resolved flex-shrink-0" />
          <p className="m-0 text-sm text-status-resolved">Chain intact — click "Tamper" on any row to see what happens.</p>
        </div>
      )}

      <button
        onClick={reset}
        className="mt-4 flex items-center gap-1.5 text-xs text-calm-text-muted hover:text-calm-text"
      >
        <RotateCcw size={12} />
        Reset demo
      </button>
    </div>
  );
}