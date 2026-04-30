'use client';

import { useState } from 'react';
import { selectedWorks } from '@/data';

// 0 = captions always visible under each photo
// 1 = captions only appear when hovering the photo
const CAPTION_VISIBILITY = 0;

export default function WorkSection({ firestoreWorks = [] }) {
  const [hoveredWork, setHoveredWork] = useState(null);
  const [pinnedWork, setPinnedWork] = useState(null);
  const [hoveredImageIdx, setHoveredImageIdx] = useState(null);

  const seenWorkIds = new Set(firestoreWorks.map((w) => w.id));
  const allWorks = [
    ...firestoreWorks,
    ...selectedWorks.filter((w) => !seenWorkIds.has(w.id)),
  ];

  const displayWork = hoveredWork ?? pinnedWork;
  const images = displayWork?.media?.filter((m) => m.type === 'image') ?? [];

  return (
    <div className="h-full flex" style={{ paddingTop: '180px' }}>

      {/* Left: flat title list */}
      <aside className="w-44 shrink-0 px-6 overflow-y-auto no-scrollbar flex flex-col gap-3">
        {allWorks.map((work) => (
          <span
            key={work.id}
            onMouseEnter={() => setHoveredWork(work)}
            onMouseLeave={() => setHoveredWork(null)}
            onClick={() => setPinnedWork(pinnedWork?.id === work.id ? null : work)}
            className={`font-alte-haas text-[11px] uppercase cursor-pointer leading-tight transition-colors ${
              displayWork?.id === work.id
                ? 'text-black font-bold'
                : 'text-neutral-400 hover:text-black'
            }`}
          >
            {work.title}
          </span>
        ))}
      </aside>

      {/* Right: photo strip with per-image captions */}
      <div className="flex-1 flex flex-col overflow-hidden pr-6">
        <div className="overflow-x-auto overflow-y-hidden no-scrollbar shrink-0" style={{ height: '60vh' }}>
          <div className="flex gap-2 h-full items-stretch">
            {images.map((m, i) => {
              const showCaption =
                m.caption &&
                (CAPTION_VISIBILITY === 0 || hoveredImageIdx === i);
              return (
                <div
                  key={i}
                  className="flex flex-col shrink-0 h-full"
                  style={i === 0 ? { paddingLeft: '120px' } : undefined}
                  onMouseEnter={() => setHoveredImageIdx(i)}
                  onMouseLeave={() => setHoveredImageIdx(null)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt=""
                    className="w-auto object-cover"
                    style={{ height: 'calc(60vh - 3rem)' }}
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
      </div>

    </div>
  );
}
