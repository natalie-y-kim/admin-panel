"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import {
  getNullableTextValue,
  getRequiredIntegerValue,
  getTextValue,
} from "../_lib/crud";

export async function createCaptionExampleAction(formData: FormData) {
  await requireSuperadmin();

  const imageDescription = getTextValue(formData, "image_description");
  const caption = getTextValue(formData, "caption");
  const explanation = getTextValue(formData, "explanation");
  const priority = getRequiredIntegerValue(formData, "priority");
  const imageId = getNullableTextValue(formData, "image_id");

  if (!imageDescription || !caption || !explanation || priority === null) {
    redirect(
      "/admin/caption-examples/new?error=All%20required%20fields%20must%20be%20filled.",
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.from("caption_examples").insert({
    image_description: imageDescription,
    caption,
    explanation,
    priority,
    image_id: imageId,
  });

  if (error) {
    redirect("/admin/caption-examples/new?error=Failed%20to%20create%20caption%20example.");
  }

  revalidatePath("/admin/caption-examples");
  redirect("/admin/caption-examples?success=Caption%20example%20created%20successfully.");
}

export async function updateCaptionExampleAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const imageDescription = getTextValue(formData, "image_description");
  const caption = getTextValue(formData, "caption");
  const explanation = getTextValue(formData, "explanation");
  const priority = getRequiredIntegerValue(formData, "priority");
  const imageId = getNullableTextValue(formData, "image_id");

  if (!id) {
    redirect("/admin/caption-examples?error=Invalid%20caption%20example%20ID.");
  }

  if (!imageDescription || !caption || !explanation || priority === null) {
    redirect(
      `/admin/caption-examples/${id}/edit?error=${encodeURIComponent("All required fields must be filled.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("caption_examples")
    .update({
      image_description: imageDescription,
      caption,
      explanation,
      priority,
      image_id: imageId,
      modified_datetime_utc: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/caption-examples/${id}/edit?error=${encodeURIComponent("Failed to update caption example.")}`,
    );
  }

  revalidatePath("/admin/caption-examples");
  revalidatePath(`/admin/caption-examples/${id}/edit`);
  redirect("/admin/caption-examples?success=Caption%20example%20updated%20successfully.");
}

export async function deleteCaptionExampleAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");

  if (!id) {
    redirect("/admin/caption-examples?error=Invalid%20caption%20example%20ID.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("caption_examples")
    .delete()
    .eq("id", id);

  if (error) {
    redirect("/admin/caption-examples?error=Failed%20to%20delete%20caption%20example.");
  }

  revalidatePath("/admin/caption-examples");
  redirect("/admin/caption-examples?success=Caption%20example%20deleted%20successfully.");
}
