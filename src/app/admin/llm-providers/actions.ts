"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { getTextValue } from "../_lib/crud";

export async function createLlmProviderAction(formData: FormData) {
  await requireSuperadmin();

  const name = getTextValue(formData, "name");

  if (!name) {
    redirect("/admin/llm-providers/new?error=Name%20is%20required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").insert({ name });

  if (error) {
    redirect("/admin/llm-providers/new?error=Failed%20to%20create%20LLM%20provider.");
  }

  revalidatePath("/admin/llm-providers");
  redirect("/admin/llm-providers?success=LLM%20provider%20created%20successfully.");
}

export async function updateLlmProviderAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const name = getTextValue(formData, "name");

  if (!id) {
    redirect("/admin/llm-providers?error=Invalid%20LLM%20provider%20ID.");
  }

  if (!name) {
    redirect(
      `/admin/llm-providers/${id}/edit?error=${encodeURIComponent("Name is required.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").update({ name }).eq("id", id);

  if (error) {
    redirect(
      `/admin/llm-providers/${id}/edit?error=${encodeURIComponent("Failed to update LLM provider.")}`,
    );
  }

  revalidatePath("/admin/llm-providers");
  revalidatePath(`/admin/llm-providers/${id}/edit`);
  redirect("/admin/llm-providers?success=LLM%20provider%20updated%20successfully.");
}

export async function deleteLlmProviderAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");

  if (!id) {
    redirect("/admin/llm-providers?error=Invalid%20LLM%20provider%20ID.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);

  if (error) {
    redirect("/admin/llm-providers?error=Failed%20to%20delete%20LLM%20provider.");
  }

  revalidatePath("/admin/llm-providers");
  redirect("/admin/llm-providers?success=LLM%20provider%20deleted%20successfully.");
}
