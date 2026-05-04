'use client';

import { useState, useRef, useEffect } from 'react';
import { selectedWorks } from '@/data';

// 0 = captions always visible under each photo
// 1 = captions only appear when hovering the photo
const CAPTION_VISIBILITY = 0;

export default function WorkSection({ firestoreWorks = [] }) {
  const [pinnedWork, setPinnedWork] = useState(null);
  const [hoveredImageIdx, setHoveredImageIdx] = useState(null);
  const [lightbox, setLightbox] = useState(null); // { image, work }
  const stripRef = useRef(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const onWheel = (e) => {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (el.scrollLeft === 0 && delta < 0) return; // at start, scrolling back — let page scroll
      e.preventDefault();
      e.stopPropagation();
      el.scrollLeft += delta;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const seenWorkIds = new Set(firestoreWorks.map((w) => w.id));
  const allWorks = [
    ...firestoreWorks,
    ...selectedWorks.filter((w) => !seenWorkIds.has(w.id)),
  ];

  // Default to first work; if Firestore loads later, keep existing selection.
  useEffect(() => {
    setPinnedWork((prev) => prev ?? allWorks[0] ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firestoreWorks]);

  const displayWork = pinnedWork;
  const images = displayWork?.media?.filter((m) => m.type === 'image') ?? [];

  return (
    <div className="h-full relative" style={{ paddingTop: '180px' }}>

      {/* Full-width photo strip */}
      <div ref={stripRef} className="overflow-x-auto overflow-y-hidden no-scrollbar" style={{ height: '60vh' }}>
        <div className="flex gap-2 h-full items-stretch">
          {images.map((m, i) => {
            const showCaption =
              m.caption &&
              (CAPTION_VISIBILITY === 0 || hoveredImageIdx === i);
            return (
              <div
                key={i}
                className="flex flex-col shrink-0 h-full"
                style={i === 0 ? { paddingLeft: '20vw' } : undefined}
                onMouseEnter={() => setHoveredImageIdx(i)}
                onMouseLeave={() => setHoveredImageIdx(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt=""
                  className="w-auto object-cover cursor-pointer"
                  style={{ height: 'calc(60vh - 3rem)' }}
                  onClick={() => setLightbox({ image: m, work: displayWork })}
                />
                <div className="h-10 mt-2 max-w-[240px]">
                  {showCaption && (
                    <p className="font-alte-haas text-[11px] text-neutral-500 leading-relaxed">
                      {m.caption}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
          onClick={() => setLightbox(null)}
        >
          <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
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

      {/* Left sidebar overlaid on top of photo strip */}
      <aside
        className="absolute top-[180px] left-0 w-44 pl-8 pr-4 overflow-y-auto no-scrollbar z-10 uppercase pt-2"
        style={{ height: '60vh', fontFamily: '"Times New Roman", serif', color: 'rgb(102,102,102)' }}
      >
        <h3 className="text-xs italic my-3">WORKS</h3>
        <ul className="pl-6 transition-all duration-300 ease-in-out">
          {allWorks.map((work) => (
            <li
              key={work.id}
              onClick={() => setPinnedWork(pinnedWork?.id === work.id ? null : work)}
              className={`text-xs cursor-pointer hover:underline m-0 p-0 leading-tight ${
                work.id === displayWork?.id ? 'underline underline-offset-2' : ''
              }`}
            >
              {work.title}
            </li>
          ))}
        </ul>
      </aside>

    </div>
  );
}
