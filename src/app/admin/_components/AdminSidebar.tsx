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
    <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-6 lg:w-64">
      <nav className="space-y-5" aria-label="Admin navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-800">
              {group.label}
            </p>
            <div className="mt-2 ml-2 grid gap-1 border-l border-slate-200 pl-3 sm:grid-cols-2 lg:grid-cols-1">
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
                        ? "rounded-md bg-slate-900 px-2 py-1.5 text-sm font-medium text-white shadow-sm"
                        : "rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100"
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
