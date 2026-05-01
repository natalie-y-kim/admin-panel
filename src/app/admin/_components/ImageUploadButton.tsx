"use client";

import { useId, useState, type ChangeEvent } from "react";

type ImageUploadButtonProps = {
  name: string;
  label: string;
  description: string;
  required?: boolean;
};

export function ImageUploadButton({
  name,
  label,
  description,
  required = false,
}: ImageUploadButtonProps) {
  const id = useId();
  const [selectedFileName, setSelectedFileName] = useState("No file selected");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSelectedFileName(file?.name ?? "No file selected");
  }

  return (
    <div>
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        required={required}
        className="sr-only"
        onChange={handleFileChange}
      />
      <label
        htmlFor={id}
        className="group flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:border-slate-400 hover:bg-slate-900 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#f2a65a]"
      >
        <span className="truncate">{label}</span>
        <span className="truncate rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 transition group-hover:bg-white/15">
          {selectedFileName}
        </span>
      </label>
      <p className="mt-2 text-xs text-slate-500">{description}</p>
    </div>
  );
}
