'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { selectedWorks } from '@/data';
import RichTextContent from '@/components/RichTextContent';

export default function WorkSection() {
  const [firestoreWorks, setFirestoreWorks] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [lightbox, setLightbox] = useState(null); // { work, imageIndex }

  useEffect(() => {
    fetch('/api/works')
      .then((r) => r.ok ? r.json() : [])
      .then(setFirestoreWorks)
      .catch(() => {});
  }, []);

  // Deduplicate by id — Firestore version wins when both exist
  const seenWorkIds = new Set(firestoreWorks.map((w) => w.id));
  const allWorks = [
    ...firestoreWorks,
    ...selectedWorks.filter((w) => !seenWorkIds.has(w.id)),
  ];

  const worksByYear = allWorks.reduce((acc, work) => {
    const year = work.year || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(work);
    return acc;
  }, {});
  const years = Object.keys(worksByYear).sort((a, b) => Number(b) - Number(a));

  const handleKey = useCallback((e) => {
    if (!lightbox) return;
    const images = lightbox.work.media?.filter((m) => m.type === 'image') ?? [];
    if (e.key === 'ArrowRight' && lightbox.imageIndex < images.length - 1)
      setLightbox((p) => ({ ...p, imageIndex: p.imageIndex + 1 }));
    if (e.key === 'ArrowLeft' && lightbox.imageIndex > 0)
      setLightbox((p) => ({ ...p, imageIndex: p.imageIndex - 1 }));
    if (e.key === 'Escape') setLightbox(null);
  }, [lightbox]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const lightboxImages = lightbox?.work.media?.filter((m) => m.type === 'image') ?? [];
  const lightboxImage = lightboxImages[lightbox?.imageIndex ?? 0];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Archive toggle */}
      <div className="flex justify-end px-8 py-3 border-b border-neutral-100 shrink-0">
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'archive' : 'grid')}
          className="text-xs tracking-widest hover:opacity-50 transition-opacity"
        >
          {viewMode === 'grid' ? 'ARCHIVE VIEW' : 'GRID VIEW'}
        </button>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-y-auto px-8 py-8">
        {viewMode === 'grid' ? (
          years.map((year) => (
            <div key={year} className="mb-12">
              <p className="text-xs tracking-widest text-neutral-400 mb-4">{year}</p>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {worksByYear[year].map((work) => {
                  const thumb = work.media?.find((m) => m.type === 'image');
                  return (
                    <button key={work.id} onClick={() => setLightbox({ work, imageIndex: 0 })}
                      className="aspect-square overflow-hidden group relative">
                      {thumb ? (
                        <Image
                          src={thumb.url}
                          alt={work.title}
                          fill
                          className="object-cover group-hover:opacity-80 transition-opacity"
                          sizes="(max-width: 768px) 33vw, 20vw"
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
          ))
        ) : (
          years.map((year) => (
            <div key={year} className="mb-16">
              <p className="text-xs tracking-widest text-neutral-400 mb-4 border-b border-neutral-100 pb-2">{year}</p>
              {worksByYear[year].map((work) => (
                <div key={work.id} className="mb-8">
                  <p className="text-xs mb-3 text-neutral-600">{work.title}</p>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {work.media?.filter((m) => m.type === 'image').map((m, i) => (
                      <button key={i} onClick={() => setLightbox({ work, imageIndex: i })}
                        className="aspect-square overflow-hidden relative">
                        <Image
                          src={m.url}
                          alt=""
                          fill
                          className="object-cover hover:opacity-80 transition-opacity"
                          sizes="(max-width: 768px) 25vw, 16vw"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="absolute inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 backdrop-blur-md bg-white/60" onClick={() => setLightbox(null)} />
          <div className="relative z-10 flex flex-col h-full pointer-events-none">
            <div className="flex-1 flex items-center justify-center px-16 py-12">
              {lightboxImage && (
                <Image
                  src={lightboxImage.url}
                  alt={lightbox.work.title}
                  width={1600}
                  height={1200}
                  className="max-h-full max-w-full object-contain pointer-events-auto"
                  style={{ width: 'auto', height: 'auto' }}
                  priority
                />
              )}
            </div>
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
                <div className="flex items-center gap-4 ml-8 shrink-0">
                  {lightboxImages.length > 1 && (
                    <div className="flex items-center gap-3">
                      <button onClick={() => setLightbox((p) => p && p.imageIndex > 0 ? { ...p, imageIndex: p.imageIndex - 1 } : p)}
                        disabled={lightbox.imageIndex === 0}
                        className="text-xs text-neutral-400 hover:text-neutral-800 disabled:opacity-20">←</button>
                      <span className="text-xs text-neutral-400">{lightbox.imageIndex + 1} / {lightboxImages.length}</span>
                      <button onClick={() => setLightbox((p) => p && p.imageIndex < lightboxImages.length - 1 ? { ...p, imageIndex: p.imageIndex + 1 } : p)}
                        disabled={lightbox.imageIndex === lightboxImages.length - 1}
                        className="text-xs text-neutral-400 hover:text-neutral-800 disabled:opacity-20">→</button>
                    </div>
                  )}
                  <button onClick={() => setLightbox(null)} className="text-xs text-neutral-400 hover:text-neutral-800">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
