"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { getTextValue } from "../_lib/crud";

export async function createAllowedSignupDomainAction(formData: FormData) {
  await requireSuperadmin();

  const apexDomain = getTextValue(formData, "apex_domain");

  if (!apexDomain) {
    redirect("/admin/allowed-signup-domains/new?error=Domain%20is%20required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("allowed_signup_domains")
    .insert({ apex_domain: apexDomain });

  if (error) {
    redirect("/admin/allowed-signup-domains/new?error=Failed%20to%20create%20signup%20domain.");
  }

  revalidatePath("/admin/allowed-signup-domains");
  redirect(
    "/admin/allowed-signup-domains?success=Signup%20domain%20created%20successfully.",
  );
}

export async function updateAllowedSignupDomainAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const apexDomain = getTextValue(formData, "apex_domain");

  if (!id) {
    redirect("/admin/allowed-signup-domains?error=Invalid%20signup%20domain%20ID.");
  }

  if (!apexDomain) {
    redirect(
      `/admin/allowed-signup-domains/${id}/edit?error=${encodeURIComponent("Domain is required.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("allowed_signup_domains")
    .update({ apex_domain: apexDomain })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/allowed-signup-domains/${id}/edit?error=${encodeURIComponent("Failed to update signup domain.")}`,
    );
  }

  revalidatePath("/admin/allowed-signup-domains");
  revalidatePath(`/admin/allowed-signup-domains/${id}/edit`);
  redirect(
    "/admin/allowed-signup-domains?success=Signup%20domain%20updated%20successfully.",
  );
}

export async function deleteAllowedSignupDomainAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");

  if (!id) {
    redirect("/admin/allowed-signup-domains?error=Invalid%20signup%20domain%20ID.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("allowed_signup_domains")
    .delete()
    .eq("id", id);

  if (error) {
    redirect("/admin/allowed-signup-domains?error=Failed%20to%20delete%20signup%20domain.");
  }

  revalidatePath("/admin/allowed-signup-domains");
  redirect(
    "/admin/allowed-signup-domains?success=Signup%20domain%20deleted%20successfully.",
  );
}
