import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  console.log("[auth/callback] request url", request.url);
  console.log("[auth/callback] code present", Boolean(code));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}/admin`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/admin`);
      }

      return NextResponse.redirect(`${origin}/admin`);
    }

    console.error("[auth/callback] exchangeCodeForSession error", {
      message: error.message,
      name: error.name,
      status: (error as { status?: number }).status,
      code: (error as { code?: string }).code,
    });
  } else {
    console.error("[auth/callback] Missing OAuth code in callback URL");
  }

  return NextResponse.redirect(`${origin}/login`);
}
