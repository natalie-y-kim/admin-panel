"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:sticky lg:top-6 lg:w-64">
      <nav className="space-y-5" aria-label="Admin navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="rounded-md border border-purple-200 bg-purple-50 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-purple-900 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-100">
              {group.label}
            </p>
            <div className="mt-2 ml-2 grid gap-1 border-l border-purple-100 pl-3 dark:border-purple-500/30 sm:grid-cols-2 lg:grid-cols-1">
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
                        ? "rounded-md bg-purple-800 px-2 py-1.5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:bg-purple-500 dark:focus:ring-offset-slate-950"
                        : "rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-offset-slate-950"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
