"use client";

import { useState } from "react";
import { Fraunces } from "next/font/google";
import { createClient } from "@/lib/supabase/client";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export default function AdminLoginEntry() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f2ea] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(247,176,94,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.14),_transparent_38%)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:32px_32px]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[#fffdf8]/90 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col items-center justify-between px-6 py-8 text-center sm:px-8 sm:py-10 lg:px-12 lg:py-14">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f0c48b] bg-[#fff6e8] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a4b12]">
                <span className="h-2 w-2 rounded-full bg-[#d97706]" />
                Superadmin Workspace
              </div>

              <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                The Humor Project
              </p>
              <h1
                className={`${fraunces.className} mt-4 max-w-xl text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-[#111827] sm:text-6xl lg:text-[4.75rem]`}
              >
                Admin Control Room
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Manage captions, images, requests, and model output from one
                authenticated workspace.
              </p>
            </div>

            <div className="mt-10 w-full max-w-md">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-900 bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                  >
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.04l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.49 0-.71-.06-1.39-.18-2.01H12Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.75c2.92 0 5.37-.97 7.16-2.63l-3.3-2.56c-.92.62-2.1.99-3.86.99-2.81 0-5.19-1.9-6.04-4.46l-3.42 2.64c1.78 3.53 5.43 6.02 9.46 6.02Z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M5.96 13.09A6.01 6.01 0 0 1 5.62 12c0-.38.06-.75.17-1.09L2.37 8.27A9.75 9.75 0 0 0 1.75 12c0 1.38.33 2.68.92 3.82l3.29-2.73Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M12 6.43c1.59 0 3.02.55 4.15 1.64l3.11-3.11C17.37 3.23 14.92 2.25 12 2.25c-4.03 0-7.68 2.49-9.46 6.02l3.42 2.64c.85-2.56 3.23-4.48 6.04-4.48Z"
                    />
                  </svg>
                </span>
                <span>{isLoading ? "Redirecting..." : "Sign in with Google"}</span>
              </button>

              <p className="mt-4 text-sm leading-6 text-slate-500">
                Access is limited to approved accounts and administrator roles.
              </p>

              {errorMessage ? (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
