import { ShieldCheck, Lock, FileText } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-calm-bg text-calm-text">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-serif-warm mb-2">About this platform</h1>
        <p className="text-calm-text-muted mb-10">
          Design principles and the framework this system references.
        </p>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-calm-accent" />
              <h2 className="text-lg font-semibold m-0">Reference framework</h2>
            </div>
            <p className="text-sm text-calm-text-muted leading-relaxed">
              This platform's reporting, confidentiality, and escalation design is built
              with reference to <strong className="text-calm-text">ILO Convention 190</strong> —
              the Violence and Harassment Convention (2019), adopted by the International
              Labour Organization as the closest existing global standard for workplace
              harassment protections. Convention 190 calls for confidential reporting
              channels, protection from retaliation, and access to remedies including
              urgent response for immediate danger — each of which maps to a specific
              feature in this system.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <Lock size={18} className="text-calm-accent" />
              <h2 className="text-lg font-semibold m-0">Data protection principles</h2>
            </div>
            <p className="text-sm text-calm-text-muted leading-relaxed">
              Data handling follows data-minimization and purpose-limitation principles
              consistent with GDPR's core tenets. Anonymous reports never capture identity
              at the database schema level — not just hidden in the interface. Confidential
              reports are visible only to the specific Internal Committee member assigned
              to that case.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={18} className="text-calm-accent" />
              <h2 className="text-lg font-semibold m-0">Honest scope</h2>
            </div>
            <p className="text-sm text-calm-text-muted leading-relaxed">
              This is an architectural alignment with international principles, not a
              legal compliance certification for any specific jurisdiction. A production
              deployment in any given country would require review against that
              jurisdiction's binding law, which may add requirements beyond this
              reference framework.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}