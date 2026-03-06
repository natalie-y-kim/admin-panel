import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { error } from "console";

type SuperadminProfile = {
  is_superadmin: boolean;
};

export async function requireSuperadmin(): Promise<{ user: User }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("IMAGES PAGE USER", user);
  console.log("IMAGES PAGE ERROR", userError);

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single<SuperadminProfile>();

  if (profileError || !profile?.is_superadmin) {
    redirect("/admin/access-denied");
  }

  return { user };
}
