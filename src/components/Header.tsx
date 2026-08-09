"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Shield, LogOut, Bell } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;

  const isOps = ["IC_MEMBER", "RESPONDER", "ADMIN"].includes(role || "");
  const bg = isOps ? "bg-ops-surface border-ops-border" : "bg-calm-surface border-calm-border";
  const text = isOps ? "text-ops-text" : "text-calm-text";
  const muted = isOps ? "text-ops-text-muted" : "text-calm-text-muted";
  const accent = isOps ? "text-ops-accent" : "text-calm-accent";

  const roleLinks: Record<string, { href: string; label: string }[]> = {
    IC_MEMBER: [{ href: "/ic", label: "Case Queue" }],
    RESPONDER: [{ href: "/responder", label: "Urgent Queue" }],
    ADMIN: [
      { href: "/admin", label: "Admin" },
      { href: "/admin/audit", label: "Audit Integrity" },
    ],
    COMPLAINANT: [{ href: "/my-cases", label: "My Reports" }],
  };

  const links = role ? roleLinks[role] || [] : [];

  return (
    <header className={`border-b ${bg} sticky top-0 z-10`}>
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className={`flex items-center gap-2 font-semibold ${text}`}>
          <Shield size={18} className={accent} />
          <span className="hidden sm:inline">Workplace Safety</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? `${accent} font-medium` : muted}
            >
              {l.label}
            </Link>
          ))}

          <Link
            href="/about"
            className={pathname === "/about" ? `${accent} font-medium` : muted}
          >
            About
          </Link>

          {session && (
            <>
              <Link href="/notifications" className={muted} title="Notifications">
                <Bell size={16} />
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={`flex items-center gap-1 ${muted} hover:${accent}`}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          )}

          {!session && (
            <Link href="/login" className={accent}>
              Staff Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}