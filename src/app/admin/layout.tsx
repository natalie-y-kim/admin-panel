import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
          <p className="mr-2 text-sm font-semibold text-slate-800">
            Humor Admin
          </p>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              href="/admin"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Users
            </Link>
            <Link
              href="/admin/images"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Images
            </Link>
            <Link
              href="/admin/captions"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Captions
            </Link>
            <Link
              href="/admin/humor-flavors"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Humor Flavors
            </Link>
            <Link
              href="/admin/humor-flavor-steps"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Flavor Steps
            </Link>
            <Link
              href="/admin/caption-requests"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Caption Requests
            </Link>
            <Link
              href="/admin/llm-prompt-chains"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Prompt Chains
            </Link>
            <Link
              href="/admin/llm-responses"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              LLM Responses
            </Link>
            <Link
              href="/logout"
              prefetch={false}
              className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
