'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import TopNav from '@/components/TopNav';
import RichTextContent from '@/components/RichTextContent';
import { getContentItems, blockFontFamilies } from '@/lib/types';
import type { Exhibition } from '@/lib/types';
import { exhibitions2 } from '@/data';

export default function ExhibitionsPage() {
  const [firestoreExhibitions, setFirestoreExhibitions] = useState<Exhibition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<{ url: string; caption?: string } | null>(null);

  const openLightbox = useCallback((url: string, caption?: string) => setLightbox({ url, caption }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);

  useEffect(() => {
    fetch('/api/exhibitions')
      .then((r) => r.json())
      .then((data) => {
        setFirestoreExhibitions(data);
      })
      .catch(() => {});
  }, []);

  const allExhibitions: Exhibition[] = [
    ...firestoreExhibitions,
    ...(exhibitions2 as unknown as Exhibition[]),
  ];

  const selected = allExhibitions.find((e) => e.id === selectedId) ?? allExhibitions[0];
  const contentItems = selected ? getContentItems(selected) : [];

  // Scroll center panel to top when selection changes
  useEffect(() => {
    centerRef.current?.scrollTo({ top: 0 });
  }, [selected?.id]);

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      <TopNav active="exhibitions" />

      {/* 3-column layout below fixed nav */}
      <div className="flex flex-1 overflow-hidden pt-[52px]">

        {/* ── LEFT: Exhibition list ── */}
        <aside className="w-52 shrink-0 overflow-y-auto  px-4 py-8">
          {allExhibitions.map((ex) => {
            const isActive = selected?.id === ex.id;
            const [venue, city] = ex.location ? ex.location.split(/,(.+)/).map((s: string) => s.trim()) : ['', ''];
            const year = ex.date?.match(/\d{4}/)?.[0];
            return (
              <button
                key={ex.id}
                onClick={() => setSelectedId(ex.id)}
                className="w-full text-left mb-7 group"
              >
                <div className="flex justify-between items-baseline gap-2">
                  <p className={`text-xs font-bold uppercase leading-snug tracking-wide transition-colors ${isActive ? 'text-black' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                    {ex.title}
                  </p>
                  <p className={`text-xs shrink-0 transition-colors ${isActive ? 'text-black' : 'text-neutral-400 group-hover:text-neutral-600'}`}>
                    {year}
                  </p>
                </div>
                {ex.location && (
                  <div className="flex justify-between items-baseline gap-2 mt-0.5">
                    <p className={`text-xs uppercase tracking-wide transition-colors ${isActive ? 'text-neutral-500' : 'text-neutral-400 group-hover:text-neutral-500'}`}>
                      {venue}
                    </p>
                    {city && (
                      <p className={`text-xs uppercase shrink-0 tracking-wide transition-colors ${isActive ? 'text-neutral-500' : 'text-neutral-400 group-hover:text-neutral-500'}`}>
                        {city}
                      </p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </aside>

        {/* ── CENTER: Images ── */}
        <main ref={centerRef} className="flex-1 overflow-y-auto px-8 py-8">
          {contentItems.length === 0 && (
            <p className="text-xs text-neutral-300 mt-16 text-center">No images</p>
          )}
          {contentItems.map((item) => (
            <div key={item.id} className="mb-6">
              {item.type === 'image' && item.url ? (
                <>
                  <button
                    onClick={() => openLightbox(item.url!, item.caption)}
                    className="w-full cursor-zoom-in block"
                    aria-label="View full screen"
                  >
                    <Image
                      src={item.url}
                      alt={item.caption ?? ''}
                      width={1600}
                      height={1200}
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="h-auto w-full object-contain pointer-events-none"
                    />
                  </button>
                  {item.caption && (
                    <p className="mt-2 text-xs text-neutral-400">{item.caption}</p>
                  )}
                </>
              ) : item.type === 'text' && item.text ? (
                <RichTextContent
                  html={item.text}
                  className="max-w-prose text-neutral-700"
                  style={{
                    fontSize: item.fontSize ? `${item.fontSize}px` : undefined,
                    marginLeft: item.marginX ? `${item.marginX}px` : undefined,
                    marginRight: item.marginX ? `${item.marginX}px` : undefined,
                    fontFamily: item.blockFont ? blockFontFamilies[item.blockFont] : undefined,
                    textAlign: item.textAlign ?? undefined,
                  }}
                />
              ) : null}
            </div>
          ))}
        </main>

        {/* ── RIGHT: Exhibition info ── */}
        <aside className="w-64 shrink-0 overflow-y-auto  px-6 py-8">
          {selected ? (
            <>
              <p className="text-xs font-medium tracking-wide leading-snug mb-1">
                {selected.title}
              </p>
              <p className="text-xs text-neutral-400 mb-6">{selected.date}</p>

              {selected.header && (
                <p className="text-xs leading-relaxed text-neutral-700 mb-4">
                  {selected.header}
                </p>
              )}
              {selected.subheader && (
                <p className="text-xs leading-relaxed text-neutral-400 mb-6">
                  {selected.subheader}
                </p>
              )}
              {selected.textContent && (
                <RichTextContent html={selected.textContent} className="mb-6 text-xs text-neutral-700" />
              )}
              {selected.footnote && (
                <RichTextContent html={selected.footnote} className="mb-6 text-xs text-neutral-400" />
              )}

              {selected.workIncluded?.length > 0 && (
                <div className="border-t border-neutral-100 pt-6">
                  <p className="text-xs tracking-widest uppercase mb-4">Works included</p>
                  {selected.workIncluded.map((w) => (
                    <div key={w.id} className="mb-4">
                      <p className="text-xs font-medium">{w.title}</p>
                      <p className="text-xs text-neutral-400">{w.year}</p>
                      {w.dimensions && (
                        <p className="text-xs text-neutral-400">{w.dimensions}</p>
                      )}
                      {w.material && (
                        <p className="text-xs text-neutral-400">{w.material}</p>
                      )}
                      {w.description && (
                        <RichTextContent html={w.description} className="mt-1 text-xs text-neutral-500" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selected.url && (
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  Exhibition link ↗
                </a>
              )}
            </>
          ) : (
            <p className="text-xs text-neutral-300">Select an exhibition</p>
          )}
        </aside>
      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-5 text-neutral-500 text-2xl leading-none opacity-70 hover:opacity-100 cursor-pointer"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ✕
          </button>
          <div
            className="relative max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.url}
              alt={lightbox.caption ?? ''}
              width={2400}
              height={1800}
              className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain"
            />
            {lightbox.caption && (
              <p className="mt-2 text-xs text-neutral-400 text-center">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
