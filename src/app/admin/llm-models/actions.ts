"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import {
  getRequiredIntegerValue,
  getTextValue,
  normalizeBoolean,
} from "../_lib/crud";

export async function createLlmModelAction(formData: FormData) {
  await requireSuperadmin();

  const name = getTextValue(formData, "name");
  const llmProviderId = getRequiredIntegerValue(formData, "llm_provider_id");
  const providerModelId = getTextValue(formData, "provider_model_id");
  const isTemperatureSupported = normalizeBoolean(
    formData.get("is_temperature_supported"),
  );

  if (!name || !providerModelId || llmProviderId === null) {
    redirect("/admin/llm-models/new?error=All%20required%20fields%20must%20be%20filled.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").insert({
    name,
    llm_provider_id: llmProviderId,
    provider_model_id: providerModelId,
    is_temperature_supported: isTemperatureSupported,
  });

  if (error) {
    redirect("/admin/llm-models/new?error=Failed%20to%20create%20LLM%20model.");
  }

  revalidatePath("/admin/llm-models");
  redirect("/admin/llm-models?success=LLM%20model%20created%20successfully.");
}

export async function updateLlmModelAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const name = getTextValue(formData, "name");
  const llmProviderId = getRequiredIntegerValue(formData, "llm_provider_id");
  const providerModelId = getTextValue(formData, "provider_model_id");
  const isTemperatureSupported = normalizeBoolean(
    formData.get("is_temperature_supported"),
  );

  if (!id) {
    redirect("/admin/llm-models?error=Invalid%20LLM%20model%20ID.");
  }

  if (!name || !providerModelId || llmProviderId === null) {
    redirect(
      `/admin/llm-models/${id}/edit?error=${encodeURIComponent("All required fields must be filled.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("llm_models")
    .update({
      name,
      llm_provider_id: llmProviderId,
      provider_model_id: providerModelId,
      is_temperature_supported: isTemperatureSupported,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/llm-models/${id}/edit?error=${encodeURIComponent("Failed to update LLM model.")}`,
    );
  }

  revalidatePath("/admin/llm-models");
  revalidatePath(`/admin/llm-models/${id}/edit`);
  redirect("/admin/llm-models?success=LLM%20model%20updated%20successfully.");
}

export async function deleteLlmModelAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");

  if (!id) {
    redirect("/admin/llm-models?error=Invalid%20LLM%20model%20ID.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("llm_models").delete().eq("id", id);

  if (error) {
    redirect("/admin/llm-models?error=Failed%20to%20delete%20LLM%20model.");
  }

  revalidatePath("/admin/llm-models");
  redirect("/admin/llm-models?success=LLM%20model%20deleted%20successfully.");
}
