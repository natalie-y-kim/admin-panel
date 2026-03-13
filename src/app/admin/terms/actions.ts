"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import {
  getOptionalIntegerValue,
  getRequiredIntegerValue,
  getTextValue,
} from "../_lib/crud";

export async function createTermAction(formData: FormData) {
  await requireSuperadmin();

  const term = getTextValue(formData, "term");
  const definition = getTextValue(formData, "definition");
  const example = getTextValue(formData, "example");
  const priority = getRequiredIntegerValue(formData, "priority");
  const termTypeId = getOptionalIntegerValue(formData, "term_type_id");

  if (!term || !definition || !example || priority === null) {
    redirect("/admin/terms/new?error=All%20required%20fields%20must%20be%20filled.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("terms").insert({
    term,
    definition,
    example,
    priority,
    term_type_id: termTypeId,
  });

  if (error) {
    redirect("/admin/terms/new?error=Failed%20to%20create%20term.");
  }

  revalidatePath("/admin/terms");
  redirect("/admin/terms?success=Term%20created%20successfully.");
}

export async function updateTermAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const term = getTextValue(formData, "term");
  const definition = getTextValue(formData, "definition");
  const example = getTextValue(formData, "example");
  const priority = getRequiredIntegerValue(formData, "priority");
  const termTypeId = getOptionalIntegerValue(formData, "term_type_id");

  if (!id) {
    redirect("/admin/terms?error=Invalid%20term%20ID.");
  }

  if (!term || !definition || !example || priority === null) {
    redirect(
      `/admin/terms/${id}/edit?error=${encodeURIComponent("All required fields must be filled.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("terms")
    .update({
      term,
      definition,
      example,
      priority,
      term_type_id: termTypeId,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/terms/${id}/edit?error=${encodeURIComponent("Failed to update term.")}`,
    );
  }

  revalidatePath("/admin/terms");
  revalidatePath(`/admin/terms/${id}/edit`);
  redirect("/admin/terms?success=Term%20updated%20successfully.");
}

export async function deleteTermAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");

  if (!id) {
    redirect("/admin/terms?error=Invalid%20term%20ID.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("terms").delete().eq("id", id);

  if (error) {
    redirect("/admin/terms?error=Failed%20to%20delete%20term.");
  }

  revalidatePath("/admin/terms");
  redirect("/admin/terms?success=Term%20deleted%20successfully.");
}
