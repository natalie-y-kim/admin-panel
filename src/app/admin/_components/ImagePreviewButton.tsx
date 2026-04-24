"use client";

import { useEffect, useState } from "react";

type ImagePreviewButtonProps = {
  imageUrl: string;
  thumbnailAlt: string;
  previewAlt: string;
};

export function ImagePreviewButton({
  imageUrl,
  thumbnailAlt,
  previewAlt,
}: ImagePreviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="shrink-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2"
        aria-label="View larger image"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={thumbnailAlt}
          className="h-12 w-12 rounded-xl border border-[var(--border)] object-cover transition hover:opacity-85"
        />
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 rounded-full border border-[var(--border)] bg-[color:var(--panel-strong)] px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-[#fff8ef] focus:outline-none focus:ring-2 focus:ring-[#f2a65a] focus:ring-offset-2"
            >
              X
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={previewAlt}
              className="max-h-[85vh] max-w-full rounded-lg object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
