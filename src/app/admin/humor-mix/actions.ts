"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";
import { createClient } from "@/lib/supabase/server";
import { getRequiredIntegerValue, getTextValue } from "../_lib/crud";

export async function updateHumorMixAction(formData: FormData) {
  await requireSuperadmin();

  const id = getTextValue(formData, "id");
  const humorFlavorId = getRequiredIntegerValue(formData, "humor_flavor_id");
  const captionCount = getRequiredIntegerValue(formData, "caption_count");

  if (!id) {
    redirect("/admin/humor-mix?error=Invalid%20humor%20mix%20ID.");
  }

  if (humorFlavorId === null || captionCount === null) {
    redirect(
      `/admin/humor-mix/${id}/edit?error=${encodeURIComponent("Humor flavor and caption count are required.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({
      humor_flavor_id: humorFlavorId,
      caption_count: captionCount,
    })
    .eq("id", id);

  if (error) {
    redirect(
      `/admin/humor-mix/${id}/edit?error=${encodeURIComponent("Failed to update humor mix.")}`,
    );
  }

  revalidatePath("/admin/humor-mix");
  revalidatePath(`/admin/humor-mix/${id}/edit`);
  redirect("/admin/humor-mix?success=Humor%20mix%20updated%20successfully.");
}
