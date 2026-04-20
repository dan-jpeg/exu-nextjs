'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import TopNav from '@/components/TopNav';
import RichTextContent from '@/components/RichTextContent';
import type { Work } from '@/lib/types';
import { selectedWorks } from '@/data';

type ViewMode = 'grid' | 'archive';

export default function WorkPage() {
  const [firestoreWorks, setFirestoreWorks] = useState<Work[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [lightbox, setLightbox] = useState<{ work: Work; imageIndex: number } | null>(null);

  useEffect(() => {
    fetch('/api/works')
      .then((r) => r.json())
      .then(setFirestoreWorks)
      .catch(() => {});
  }, []);

  const allWorks: Work[] = [
    ...firestoreWorks,
    ...(selectedWorks as unknown as Work[]),
  ];

  // Group by year, sorted newest first
  const worksByYear = allWorks.reduce<Record<string, Work[]>>((acc, work) => {
    const year = work.year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(work);
    return acc;
  }, {});
  const years = Object.keys(worksByYear).sort((a, b) => Number(b) - Number(a));

  // Keyboard nav for lightbox
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!lightbox) return;
      const { work, imageIndex } = lightbox;
      const images = work.media?.filter((m) => m.type === 'image') ?? [];
      if (e.key === 'ArrowRight' && imageIndex < images.length - 1) {
        setLightbox({ work, imageIndex: imageIndex + 1 });
      }
      if (e.key === 'ArrowLeft' && imageIndex > 0) {
        setLightbox({ work, imageIndex: imageIndex - 1 });
      }
      if (e.key === 'Escape') setLightbox(null);
    },
    [lightbox]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const lightboxImages = lightbox?.work.media?.filter((m) => m.type === 'image') ?? [];
  const lightboxImage = lightboxImages[lightbox?.imageIndex ?? 0];

  return (
    <div className="min-h-screen bg-white">
      <TopNav active="work" />

      <div className="pt-[52px]">
        {/* Archive toggle */}
        <div className="flex justify-end px-8 py-4 border-b border-neutral-100">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'archive' : 'grid')}
            className="text-xs tracking-widest hover:opacity-50 transition-opacity"
          >
            {viewMode === 'grid' ? 'ARCHIVE VIEW' : 'GRID VIEW'}
          </button>
        </div>

        {viewMode === 'grid' ? (
          /* ── Grid view: rows by year ── */
          <div className="px-8 py-8">
            {years.map((year) => (
              <div key={year} className="mb-12">
                <p className="text-xs tracking-widest text-neutral-400 mb-4">{year}</p>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {worksByYear[year].map((work) => {
                    const thumb = work.media?.find((m) => m.type === 'image');
                    return (
                      <button
                        key={work.id}
                        onClick={() => setLightbox({ work, imageIndex: 0 })}
                        className="group relative aspect-square overflow-hidden"
                      >
                        {thumb ? (
                          <Image
                            src={thumb.url}
                            alt={work.title}
                            fill
                            sizes="(max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            className="object-cover transition-opacity group-hover:opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                            <span className="text-xs text-neutral-300">{work.title}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Archive view: year rows with all images ── */
          <div className="px-8 py-8">
            {years.map((year) => (
              <div key={year} className="mb-16">
                <p className="text-xs tracking-widest text-neutral-400 mb-6 border-b border-neutral-100 pb-2">
                  {year}
                </p>
                {worksByYear[year].map((work) => (
                  <div key={work.id} className="mb-8">
                    <p className="text-xs mb-3 text-neutral-600">{work.title}</p>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {work.media
                        ?.filter((m) => m.type === 'image')
                        .map((m, i) => (
                          <button
                            key={i}
                            onClick={() => setLightbox({ work, imageIndex: i })}
                            className="relative aspect-square overflow-hidden"
                          >
                            <Image
                              src={m.url}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 25vw, (max-width: 1024px) 16vw, 12vw"
                              className="object-cover transition-opacity hover:opacity-80"
                            />
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Blurred grid background — clicking closes */}
          <div
            className="absolute inset-0 backdrop-blur-md bg-white/60"
            onClick={() => setLightbox(null)}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full pointer-events-none">
            {/* Main image */}
            <div className="flex-1 flex items-center justify-center px-16 py-12">
              {lightboxImage ? (
                <div className="relative h-full w-full pointer-events-auto">
                  <Image
                    src={lightboxImage.url}
                    alt={lightbox.work.title}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="text-sm text-neutral-400">No image</div>
              )}
            </div>

            {/* Bottom info */}
            <div className="pointer-events-auto bg-white/90 backdrop-blur-sm px-8 py-5 border-t border-neutral-100">
              <div className="flex items-start justify-between max-w-4xl mx-auto">
                <div>
                  <p className="text-sm font-medium">{lightbox.work.title}</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {lightbox.work.year}
                    {lightbox.work.dimensions ? ` — ${lightbox.work.dimensions}` : ''}
                    {lightbox.work.material ? ` — ${lightbox.work.material}` : ''}
                  </p>
                  {lightbox.work.description && (
                    <RichTextContent html={lightbox.work.description} className="mt-2 max-w-xl text-xs text-neutral-500" />
                  )}
                </div>

                {/* Image nav + close */}
                <div className="flex items-center gap-4 ml-8 shrink-0">
                  {lightboxImages.length > 1 && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          setLightbox((prev) =>
                            prev && prev.imageIndex > 0
                              ? { ...prev, imageIndex: prev.imageIndex - 1 }
                              : prev
                          )
                        }
                        disabled={lightbox.imageIndex === 0}
                        className="text-xs text-neutral-400 hover:text-neutral-800 disabled:opacity-20 transition-colors"
                      >
                        ←
                      </button>
                      <span className="text-xs text-neutral-400">
                        {lightbox.imageIndex + 1} / {lightboxImages.length}
                      </span>
                      <button
                        onClick={() =>
                          setLightbox((prev) =>
                            prev && prev.imageIndex < lightboxImages.length - 1
                              ? { ...prev, imageIndex: prev.imageIndex + 1 }
                              : prev
                          )
                        }
                        disabled={lightbox.imageIndex === lightboxImages.length - 1}
                        className="text-xs text-neutral-400 hover:text-neutral-800 disabled:opacity-20 transition-colors"
                      >
                        →
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setLightbox(null)}
                    className="text-xs text-neutral-400 hover:text-neutral-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
