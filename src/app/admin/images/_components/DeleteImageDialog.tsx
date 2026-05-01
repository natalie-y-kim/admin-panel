"use client";

import { deleteImageAction } from "../actions";

interface DeleteImageDialogProps {
  imageId: string;
}

export function DeleteImageDialog({ imageId }: DeleteImageDialogProps) {
  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    const details = e.currentTarget.closest("details");
    if (details) details.open = false;
  };

  return (
    <details className="relative">
      <summary className="inline-flex cursor-pointer list-none rounded-md border border-red-300 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950">
        Delete
      </summary>
      <div className="absolute bottom-full right-0 z-10 mb-2 w-48 rounded-md border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Confirm delete for this image?
        </p>
        <form action={deleteImageAction} className="mt-3 flex gap-2">
          <input type="hidden" name="id" value={imageId} />
          <button
            type="submit"
            className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-500 dark:bg-red-700 dark:hover:bg-red-600"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </form>
      </div>
    </details>
  );
}
