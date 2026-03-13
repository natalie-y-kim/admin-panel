"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { getTextValue } from "../_lib/crud";

export async function createWhitelistEmailAddressAction(formData: FormData) {
  await requireSuperadmin();

  const emailAddress = getTextValue(formData, "email_address");

  if (!emailAddress) {
    redirect("/admin/whitelist-email-addresses/new?error=Email%20address%20is%20required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_email_addresses")
    .insert({ email_address: emailAddress });

  if (error) {
    redirect(
      "/admin/whitelist-email-addresses/new?error=Failed%20to%20create%20whitelist%20address.",
    );
  }

  revalidatePath("/admin/whitelist-email-addresses");
  redirect(
    "/admin/whitelist-email-addresses?success=Whitelist%20address%20created%20successfully.",
  );
}

export async function updateWhitelistEmailAddressAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const emailAddress = getTextValue(formData, "email_address");

  if (!id) {
    redirect("/admin/whitelist-email-addresses?error=Invalid%20whitelist%20address%20ID.");
  }

  if (!emailAddress) {
    redirect(
      `/admin/whitelist-email-addresses/${id}/edit?error=${encodeURIComponent("Email address is required.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_email_addresses")
    .update({
      email_address: emailAddress,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/whitelist-email-addresses/${id}/edit?error=${encodeURIComponent("Failed to update whitelist address.")}`,
    );
  }

  revalidatePath("/admin/whitelist-email-addresses");
  revalidatePath(`/admin/whitelist-email-addresses/${id}/edit`);
  redirect(
    "/admin/whitelist-email-addresses?success=Whitelist%20address%20updated%20successfully.",
  );
}

export async function deleteWhitelistEmailAddressAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");

  if (!id) {
    redirect("/admin/whitelist-email-addresses?error=Invalid%20whitelist%20address%20ID.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("whitelist_email_addresses")
    .delete()
    .eq("id", id);

  if (error) {
    redirect("/admin/whitelist-email-addresses?error=Failed%20to%20delete%20whitelist%20address.");
  }

  revalidatePath("/admin/whitelist-email-addresses");
  redirect(
    "/admin/whitelist-email-addresses?success=Whitelist%20address%20deleted%20successfully.",
  );
}
