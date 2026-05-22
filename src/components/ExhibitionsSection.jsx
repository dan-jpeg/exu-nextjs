'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { getContentItems, blockFontFamilies } from '@/lib/types';
import { exhibitions2 } from '@/data';
import RichTextContent from '@/components/RichTextContent';

function getPreviewImages(ex) {
  if (ex.images?.length) return ex.images;
  if (ex.contentItems?.length) {
    return ex.contentItems
      .filter((item) => item.type === 'image' && item.url)
      .map((item) => item.url);
  }
  return [];
}

function ExhibitionGridCell({ ex, onClick }) {
  const images = getPreviewImages(ex);
  const [imgIdx, setImgIdx] = useState(Math.min(1, images.length - 1));
  const currentImg = images[imgIdx] ?? images[0];

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setImgIdx(Math.floor(Math.random() * images.length));
    }
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex flex-col w-1/2 max-w-[250px] md:w-auto md:max-w-none"
      onMouseEnter={handleMouseEnter}
    >
      <div className="flex justify-between uppercase font-alte-haas font-bold w-full mb-1 md:mb-3 leading-tight hover:opacity-20 transition-opacity text-[9px] lg:text-[11px]">
        <span>{ex.title}</span>
        <span>{ex.year ?? (ex.date ? ex.date.match(/\d{4}/)?.[0] : null)}</span>
      </div>
      {currentImg && (
        <div className="w-full flex justify-center md:pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImg}
            alt={ex.title}
            className="h-[120px] md:h-[5vw] w-auto object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default function ExhibitionsSection({ selectedId, onSelectId, firestoreExhibitions = [], scrollEnabled = true }) {
  const centerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);
  const [atBottom, setAtBottom] = useState(false);

  const openLightbox = useCallback((url, caption) => setLightbox({ url, caption }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => { if (e.key === 'Escape') closeLightbox(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);

  const seenIds = new Set(firestoreExhibitions.map((e) => e.id));
  const allExhibitions = [
    ...firestoreExhibitions,
    ...exhibitions2.filter((e) => !seenIds.has(e.id)),
  ].sort((a, b) => {
    const yearOf = (e) => {
      const raw = e.date ?? e.year ?? '';
      const match = String(raw).match(/\d{4}/);
      return match ? Number(match[0]) : -Infinity;
    };
    return yearOf(b) - yearOf(a);
  });

  const selected = selectedId ? allExhibitions.find((e) => e.id === selectedId) : null;
  const contentItems = selected ? getContentItems(selected) : [];

  const currentIndex = selected ? allExhibitions.findIndex((e) => e.id === selected.id) : -1;
  const prevEx = currentIndex > 0 ? allExhibitions[currentIndex - 1] : null;
  const nextEx = currentIndex >= 0 && currentIndex < allExhibitions.length - 1 ? allExhibitions[currentIndex + 1] : null;

  useEffect(() => {
    centerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    setAtBottom(false);
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) return;
    const scrollRoot = document.getElementById('scroll-root');
    const candidates = [scrollRoot, centerRef.current].filter(Boolean);
    if (candidates.length === 0) return;

    const THRESHOLD = 24;
    const check = () => {
      let anyScrollable = false;
      for (const el of candidates) {
        const overflow = el.scrollHeight - el.clientHeight;
        if (overflow > THRESHOLD) anyScrollable = true;
        if (overflow - el.scrollTop > THRESHOLD) {
          setAtBottom(false);
          return;
        }
      }
      setAtBottom(anyScrollable);
    };

    check();
    candidates.forEach((el) => el.addEventListener('scroll', check, { passive: true }));
    window.addEventListener('resize', check);
    return () => {
      candidates.forEach((el) => el.removeEventListener('scroll', check));
      window.removeEventListener('resize', check);
    };
  }, [selected?.id]);

  // Grid view — no exhibition selected
  if (!selected) {
    return (
      <div className="px-4 pt-8 md:px-8">
        <div className="flex flex-col items-center space-y-8 pb-40 md:grid md:grid-cols-6 md:gap-[4vw] md:space-y-0 md:items-stretch md:pb-0">
          {allExhibitions.map((ex) => (
            <ExhibitionGridCell
              key={ex.id}
              ex={ex}
              onClick={() => onSelectId(ex.id)}
            />
          ))}
        </div>
        <div className="h-16" />
      </div>
    );
  }

  // Detail view — exhibition selected
  return (
    <div className="relative h-full overflow-hidden">
      <div
        ref={centerRef}
        className={`h-full ${scrollEnabled ? 'overflow-y-auto' : 'overflow-hidden'}`}
      >
        <div key={selected.id} className="max-w-xl justify-center items-center text-center font-serif pt-40 text-[11px] mx-auto py-10 px-6">
          <header className="exhibition-info mb-8">
            {selected.title && (
              <h1 className="exhibition-info__title uppercase mb-2">{selected.title}</h1>
            )}

            <div className="exhibition-info__meta flex flex-col ">

              {selected.location && (
                <span className="exhibition-info__location">{selected.location}</span>
              )}
              {(selected.date || selected.year) && (
                <span className="exhibition-info__date">{selected.date ?? selected.year}</span>
              )}

            </div>
          </header>

          {contentItems.map((item) => (
            <div
              key={item.id}
              style={
                item.type === 'text'
                  ? {
                      paddingTop: item.paddingTop ? `${item.paddingTop}px` : undefined,
                      paddingBottom: item.paddingBottom ? `${item.paddingBottom}px` : undefined,
                    }
                  : undefined
              }
            >
              {item.type === 'image' && item.url ? (
                <div className="mb-4">
                  <button
                    onClick={() => openLightbox(item.url, item.caption)}
                    className="w-full cursor-zoom-in"
                    aria-label="View full screen"
                  >
                    <Image
                      src={item.url}
                      alt={item.caption ?? ''}
                      width={1200}
                      height={900}
                      className="w-full h-auto object-contain"
                      priority
                    />
                  </button>
                  {item.caption && (
                    <p className="mt-2 text-xs text-neutral-400">{item.caption}</p>
                  )}
                </div>
              ) : item.type === 'text' && item.text ? (
                <RichTextContent
                  html={item.text}
                  className="mb-4 text-neutral-700"
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

          {contentItems.length === 0 && (
            <p className="text-xs text-neutral-300 mt-24 text-center">No content</p>
          )}

          <div className="h-20" />
        </div>
      </div>

      {/* Continue — only after scrolling to the bottom */}
      {nextEx && (
        <div
          className={`fixed bottom-6 left-0 right-0 z-10 flex justify-center italic text-[11px] transition-opacity duration-300 ${
            atBottom ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ fontFamily: '"Times New Roman", serif', color: 'rgb(102,102,102)' }}
        >
          <button
            onClick={() => onSelectId(nextEx.id)}
            className="hover:opacity-50 transition-opacity"
          >
            Continue
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-5 text-white text-2xl leading-none opacity-70 hover:opacity-100"
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
