'use client';

import { useState } from 'react';
import { selectedWorks } from '@/data';

const ROW_MAX_WIDTH = 833;
const ROW_HEIGHT = 412;
const ROW_GAP = 7;
const ROW_PADDING = 42;

export default function WorkSection({ firestoreWorks = [] }) {
  const [lightbox, setLightbox] = useState(null);

  const seen = new Set(firestoreWorks.map((w) => w.id));
  const allWorks = [
    ...firestoreWorks,
    ...selectedWorks.filter((w) => !seen.has(w.id)),
  ];

  return (
    <>
      <div className="mx-auto px-4 pt-24 pb-24" style={{ maxWidth: `${ROW_MAX_WIDTH}px` }}>
        {allWorks.map((work) => {
          const images = (work.media ?? []).filter((m) => m.type === 'image' && m.url);
          if (images.length === 0) return null;
          return (
            <WorkRow
              key={work.id}
              work={work}
              images={images}
              onImageClick={(image) => setLightbox({ image, work })}
            />
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center cursor-zoom-out"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          onClick={() => setLightbox(null)}
        >
          <div className="flex flex-col items-center cursor-zoom-out" onClick={() => setLightbox(null)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.image.url}
              alt=""
              className="max-h-[80vh] max-w-[90vw] w-auto object-contain"
            />
            {(lightbox.image.caption || lightbox.work?.title) && (
              <div className="mt-3 text-center">
                {lightbox.image.caption && (
                  <p className="font-alte-haas text-[11px] text-neutral-500">{lightbox.image.caption}</p>
                )}
                {lightbox.work?.title && (
                  <p className="font-alte-haas text-[11px] text-neutral-400 uppercase mt-0.5">{lightbox.work.title}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function WorkRow({ work, images, onImageClick }) {
  return (
    <section style={{ paddingTop: `${ROW_PADDING}px`, paddingBottom: `${ROW_PADDING}px` }}>
      <header className="flex justify-between items-baseline mb-3">
        <span
          className="font-alte-haas font-bold uppercase text-[11px] text-black"
          style={{ letterSpacing: '-0.4px' }}
        >
          {work.title}
        </span>
        <span
          className="font-alte-haas font-bold uppercase text-[11px] text-black"
          style={{ letterSpacing: '-0.4px' }}
        >
          {work.year}
        </span>
      </header>
      <div className="overflow-x-auto no-scrollbar mx-[22px]">
        <div
          className="flex items-stretch"
          style={{ height: `${ROW_HEIGHT}px`, gap: `${ROW_GAP}px` }}
        >
          {images.map((m, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={m.url}
              alt={m.caption ?? ''}
              className="h-full w-auto object-cover shrink-0 select-none cursor-zoom-in"
              draggable={false}
              onClick={() => onImageClick(m)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
