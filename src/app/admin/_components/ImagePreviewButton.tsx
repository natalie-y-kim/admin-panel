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
        className="shrink-0 rounded focus:outline-none focus:ring-2 focus:ring-slate-400"
        aria-label="View larger image"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={thumbnailAlt}
          className="h-12 w-12 rounded object-cover transition hover:opacity-80"
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
              className="absolute right-3 top-3 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-100"
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
