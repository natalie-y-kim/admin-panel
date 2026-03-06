"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";

function normalizeBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function getTextValue(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

export async function createImageAction(formData: FormData) {
  const { user } = await requireSuperadmin();

  const url = getTextValue(formData, "url");
  const imageDescription = getTextValue(formData, "image_description");
  const isPublic = normalizeBoolean(formData.get("is_public"));

  if (!url) {
    redirect("/admin/images/new?error=URL%20is%20required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("images").insert({
    url,
    image_description: imageDescription || null,
    is_public: isPublic,
    profile_id: user.id,
  });

  if (error) {
    redirect("/admin/images/new?error=Failed%20to%20create%20image.");
  }

  revalidatePath("/admin/images");
  redirect("/admin/images?success=Image%20created%20successfully.");
}

export async function updateImageAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const url = getTextValue(formData, "url");
  const imageDescription = getTextValue(formData, "image_description");
  const isPublic = normalizeBoolean(formData.get("is_public"));

  if (!id) {
    redirect("/admin/images?error=Invalid%20image%20ID.");
  }

  if (!url) {
    redirect(
      `/admin/images/${id}/edit?error=${encodeURIComponent("URL is required.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("images")
    .update({
      url,
      image_description: imageDescription || null,
      is_public: isPublic,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/images/${id}/edit?error=${encodeURIComponent("Failed to update image.")}`,
    );
  }

  revalidatePath("/admin/images");
  revalidatePath(`/admin/images/${id}/edit`);
  redirect("/admin/images?success=Image%20updated%20successfully.");
}

export async function deleteImageAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");

  if (!id) {
    redirect("/admin/images?error=Invalid%20image%20ID.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) {
    redirect("/admin/images?error=Failed%20to%20delete%20image.");
  }

  revalidatePath("/admin/images");
  redirect("/admin/images?success=Image%20deleted%20successfully.");
}
