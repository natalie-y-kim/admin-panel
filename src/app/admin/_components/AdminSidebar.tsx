"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const navGroups = [
  {
    label: "Overview",
    links: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Users & Access",
    links: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/allowed-signup-domains", label: "Signup Domains" },
      { href: "/admin/whitelist-email-addresses", label: "Email Whitelist" },
    ],
  },
  {
    label: "Content",
    links: [
      { href: "/admin/images", label: "Images" },
      { href: "/admin/captions", label: "Captions" },
      { href: "/admin/caption-examples", label: "Caption Examples" },
      { href: "/admin/terms", label: "Terms" },
    ],
  },
  {
    label: "Humor Engine",
    links: [
      { href: "/admin/humor-flavors", label: "Humor Flavors" },
      { href: "/admin/humor-flavor-steps", label: "Flavor Steps" },
      { href: "/admin/humor-mix", label: "Humor Mix" },
    ],
  },
  {
    label: "LLM",
    links: [
      { href: "/admin/llm-providers", label: "LLM Providers" },
      { href: "/admin/llm-models", label: "LLM Models" },
      { href: "/admin/llm-prompt-chains", label: "Prompt Chains" },
      { href: "/admin/llm-responses", label: "LLM Responses" },
      { href: "/admin/caption-requests", label: "Caption Requests" },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const activeGroupLabel = useMemo(
    () =>
      navGroups.find((group) =>
        group.links.some((link) => isActivePath(pathname, link.href)),
      )?.label ?? null,
    [pathname],
  );
  const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(
    activeGroupLabel,
  );

  useEffect(() => {
    setOpenGroupLabel(activeGroupLabel);
  }, [activeGroupLabel]);

  return (
    <aside className="w-full shrink-0 rounded-[1.75rem] border border-[var(--border)] bg-[color:var(--panel)] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur lg:sticky lg:top-24 lg:w-72">
      <div className="rounded-[1.25rem] border border-[#ead4bf] bg-[linear-gradient(135deg,#fffaf2,#f6ebdb)] px-4 py-4 dark:border-[#3b2a1f] dark:bg-[linear-gradient(135deg,#131f31,#0c1728)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85f2b] dark:text-[#f2a65a]">
          Workspace
        </p>
        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-100">
          Humor operations
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Review content, manage publishing decisions, and monitor system health.
        </p>
      </div>
      <nav className="space-y-5" aria-label="Admin navigation">
        {navGroups.map((group) => {
          const isOpen = openGroupLabel === group.label;
          const hasActiveLink = group.links.some((link) =>
            isActivePath(pathname, link.href),
          );

          return (
            <div key={group.label} className="pt-1 first:pt-4">
              <button
                type="button"
                onClick={() =>
                  setOpenGroupLabel((current) =>
                    current === group.label ? null : group.label,
                  )
                }
                aria-expanded={isOpen}
                className={
                  hasActiveLink || isOpen
                    ? "flex w-full items-center justify-between rounded-xl border border-[#d9b18d] bg-[#fff8ef] px-3 py-3 text-left text-sm font-semibold text-[#172033] transition hover:bg-[#fff3e6] focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2 dark:border-[#f2a65a]/30 dark:bg-[#f2a65a]/10 dark:text-[#fff3e6] dark:hover:bg-[#f2a65a]/14 dark:focus:ring-offset-slate-950"
                    : "flex w-full items-center justify-between rounded-xl border border-transparent px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-[var(--border)] hover:bg-[color:var(--panel-strong)] focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2 dark:text-slate-200 dark:hover:bg-[var(--panel-muted)] dark:focus:ring-offset-slate-950"
                }
              >
                <span>{group.label}</span>
                <span
                  aria-hidden="true"
                  className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  ▼
                </span>
              </button>

              {isOpen ? (
                <div className="mt-3 grid gap-1 border-l border-[var(--border)] pl-3 sm:grid-cols-2 lg:grid-cols-1">
                  {group.links.map((link) => {
                    const isActive = isActivePath(pathname, link.href);

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={false}
                        aria-current={isActive ? "page" : undefined}
                        className={
                          isActive
                            ? "rounded-xl border border-[#d9b18d] bg-[#172033] px-3 py-2.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2 dark:border-[#f2a65a]/30 dark:bg-[#f2a65a]/16 dark:text-[#fff3e6] dark:focus:ring-offset-slate-950"
                            : "rounded-xl border border-transparent px-3 py-2.5 text-sm text-slate-700 transition hover:border-[var(--border)] hover:bg-[color:var(--panel-strong)] focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2 dark:text-slate-200 dark:hover:bg-[var(--panel-muted)] dark:focus:ring-offset-slate-950"
                        }
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
