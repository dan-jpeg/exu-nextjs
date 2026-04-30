'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { getContentItems } from '@/lib/types';
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

function splitTitle(title) {
  const words = title.split(' ');
  if (words.length <= 1) return [title, ''];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function ExhibitionGridCell({ ex, onClick }) {
  const images = getPreviewImages(ex);
  const [imgIdx, setImgIdx] = useState(Math.min(1, images.length - 1));
  const currentImg = images[imgIdx] ?? images[0];
  const [line1, line2] = splitTitle(ex.title);

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setImgIdx(Math.floor(Math.random() * images.length));
    }
  };

  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex flex-col"
      onMouseEnter={handleMouseEnter}
    >
      <div className="flex justify-between uppercase font-alte-haas font-bold w-full mb-3 leading-tight hover:opacity-20 transition-opacity text-[11px]">
        <span>{line1}</span>
        {line2 && <span>{line2}</span>}
      </div>
      {currentImg && (
        <div className="w-full flex justify-center pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImg}
            alt={ex.title}
            className="h-[5vw] w-auto object-cover"
          />
        </div>
      )}
    </div>
  );
}

export default function ExhibitionsSection({ selectedId, onSelectId, firestoreExhibitions = [], scrollEnabled = true }) {
  const centerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);

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
  ];

  const selected = selectedId ? allExhibitions.find((e) => e.id === selectedId) : null;
  const contentItems = selected ? getContentItems(selected) : [];

  const currentIndex = selected ? allExhibitions.findIndex((e) => e.id === selected.id) : -1;
  const prevEx = currentIndex > 0 ? allExhibitions[currentIndex - 1] : null;
  const nextEx = currentIndex >= 0 && currentIndex < allExhibitions.length - 1 ? allExhibitions[currentIndex + 1] : null;

  useEffect(() => {
    centerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [selected?.id]);

  // Grid view — no exhibition selected
  if (!selected) {
    return (
      <div className={`h-full ${scrollEnabled ? 'overflow-y-auto' : 'overflow-hidden'} px-8 pt-8`}>
        <div className="grid grid-cols-6 gap-[4vw]">
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
        <div key={selected.id} className="max-w-xl mx-auto py-10 px-6">
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

      {/* Prev / Next */}
      <div className="fixed bottom-6 right-8 z-10 flex gap-6 font-alte-haas font-bold text-[11px] tracking-wide">
        {prevEx && (
          <button
            onClick={() => onSelectId(prevEx.id)}
            className="hover:opacity-50 transition-opacity"
          >
            ← PREV
          </button>
        )}
        {nextEx && (
          <button
            onClick={() => onSelectId(nextEx.id)}
            className="hover:opacity-50 transition-opacity"
          >
            NEXT →
          </button>
        )}
      </div>

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
