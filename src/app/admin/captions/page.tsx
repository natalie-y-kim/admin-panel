import { requireSuperadmin } from "@/lib/auth/requireSuperadmin";

export default async function AdminCaptionsPage() {
  await requireSuperadmin();

  return (
    <section className="w-full rounded-xl bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Captions</h1>
      <p className="mt-3 text-sm text-slate-600">
        Caption review and management tools will be added in the next phase.
      </p>
    </section>
  );
}
