'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VideoBackground from '@/components/VideoBackground';
import { selectedWorks } from '@/data';

const NAV_H = 64;
const ROW_MAX_WIDTH = 833;
const ROW_HEIGHT = 412;
const ROW_GAP = 7;

export default function AltWorksPage() {
  const router = useRouter();
  const heroRef = useRef(null);
  const mainRef = useRef(null);
  const lastScrollY = useRef(0);
  const sectionRefs = useRef([]);
  const [firestoreWorks, setFirestoreWorks] = useState([]);
  const [emailCopied, setEmailCopied] = useState(false);
  const [navLocked, setNavLocked] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    fetch('/api/works')
      .then((r) => (r.ok ? r.json() : []))
      .then(setFirestoreWorks)
      .catch(() => {});
  }, []);

  // Skip the hero on arrival if a sibling page asked us to — smooth animate.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('skipHero') === '1') {
      sessionStorage.removeItem('skipHero');
      requestAnimationFrame(() => {
        mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, []);

  // Enable vertical scroll-snap paging while this page is mounted.
  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;
    const prev = scrollRoot.style.scrollSnapType;
    scrollRoot.style.scrollSnapType = 'y mandatory';
    return () => {
      scrollRoot.style.scrollSnapType = prev;
    };
  }, []);

  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;

    const check = () => {
      const heroBottom = heroRef.current
        ? heroRef.current.getBoundingClientRect().bottom
        : 0;
      const locked = heroBottom <= 0;
      setNavLocked(locked);

      const currentY = scrollRoot.scrollTop;
      if (locked) {
        const delta = currentY - lastScrollY.current;
        if (delta > 5) setNavVisible(false);
        else if (delta < -5) setNavVisible(true);
      } else {
        setNavVisible(true);
      }
      lastScrollY.current = currentY;
    };

    scrollRoot.addEventListener('scroll', check, { passive: true });
    check();
    return () => scrollRoot.removeEventListener('scroll', check);
  }, []);

  function handleTab(tab) {
    sessionStorage.setItem('skipHero', '1');
    router.push(`/?tab=${tab}`);
  }

  function handleIndex() {
    router.push('/?tab=exhibitions');
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText('ediexxu@gmail.com')
      .then(() => {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      })
      .catch(() => {});
  }

  const seen = new Set(firestoreWorks.map((w) => w.id));
  const allWorks = [
    ...firestoreWorks,
    ...selectedWorks.filter((w) => !seen.has(w.id)),
  ];

  const visibleWorks = allWorks.filter(
    (w) => (w.media ?? []).some((m) => m.type === 'image' && m.url)
  );

  // Track which work section is currently in view for the page indicator.
  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;
    const nodes = sectionRefs.current.filter(Boolean);
    if (nodes.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = nodes.indexOf(visible.target);
          if (idx >= 0) setActiveIndex(idx);
        }
      },
      { root: scrollRoot, threshold: [0.5, 0.75] }
    );
    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [visibleWorks.length]);

  function jumpTo(idx) {
    const node = sectionRefs.current[idx];
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const navContent = (
    <div
      className="h-full flex flex-col items-center justify-center text-center text-[11px] uppercase font-bold leading-tight font-alte-haas"
      style={{ color: 'rgb(102,102,102)' }}
    >
      <div className="flex gap-4">
        <span onClick={handleIndex} className="cursor-pointer hover:opacity-60">INDEX</span>
        <a
          href="https://edie-xu-portfolio.s3.us-east-2.amazonaws.com/assets/Edie+X+Resume-1.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-60"
        >
          CV
        </a>
        <span onClick={handleCopyEmail} className="cursor-pointer hover:opacity-60">
          {emailCopied ? 'EMAIL COPIED :)' : 'EMAIL'}
        </span>
        <a
          href="https://www.instagram.com/e__xu/"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-60"
        >
          INSTAGRAM
        </a>
        <span onClick={() => handleTab('videos')} className="cursor-pointer hover:opacity-60">VIDEO</span>
      </div>
      <div className="flex gap-4 mt-1">
        <span onClick={() => handleTab('exhibitions')} className="cursor-pointer hover:opacity-60 font-normal">
          Exhibition
        </span>
        <span onClick={() => handleTab('work')} className="cursor-pointer hover:opacity-60 font-normal">
          Works
        </span>
        <Link href="/alt-works" className="cursor-pointer hover:opacity-60 font-bold">
          +
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <VideoBackground />

      <span
        className="fixed top-6 left-6 z-10 text-white text-xs italic font-bold pointer-events-none select-none"
        style={{ fontFamily: '"Times New Roman", serif' }}
      >
        EDIE XU
      </span>

      <div
        ref={heroRef}
        style={{ height: `calc(100vh - ${NAV_H}px)`, scrollSnapAlign: 'start' }}
      />

      <main ref={mainRef} className="relative z-20 bg-white w-full">
        {navLocked && (
          <div
            className="fixed top-0 left-0 right-0 z-40 bg-white transition-transform duration-300 ease-out"
            style={{
              height: NAV_H,
              transform: navVisible ? 'translateY(0)' : `translateY(-${NAV_H}px)`,
            }}
          >
            {navContent}
          </div>
        )}

        <div className={navLocked ? 'invisible' : 'bg-white'} style={{ height: NAV_H }}>
          {!navLocked && navContent}
        </div>

        <div>
          {visibleWorks.map((work, i) => {
            const images = work.media.filter((m) => m.type === 'image' && m.url);
            return (
              <WorkRow
                key={work.id}
                ref={(el) => { sectionRefs.current[i] = el; }}
                work={work}
                images={images}
                onImageClick={(image) => setLightbox({ image, work })}
              />
            );
          })}
        </div>
      </main>

      {navLocked && visibleWorks.length > 1 && (
        <div
          className="fixed right-6 z-40 flex flex-col items-end font-alte-haas text-[16px] select-none"
          style={{
            bottom: `calc(50vh - ${NAV_H / 2}px - ${(ROW_HEIGHT + 28) / 2}px)`,
            gap: '32px',
            color: 'black',
          }}
        >
          {visibleWorks.map((_, i) => (
            <span
              key={i}
              onClick={() => jumpTo(i)}
              className="cursor-pointer transition-opacity"
              style={{
                opacity: i === activeIndex ? 0.8 : 0.2,
                fontWeight: i === activeIndex ? 700 : 400,
              }}
            >
              {i + 1}
            </span>
          ))}
        </div>
      )}

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

const WorkRow = forwardRef(function WorkRow({ work, images, onImageClick }, ref) {
  return (
    <section
      ref={ref}
      className="flex items-center justify-center"
      style={{
        height: `calc(100vh - ${NAV_H}px)`,
        scrollSnapAlign: 'start',
      }}
    >
      <div className="w-full mx-auto px-4" style={{ maxWidth: `${ROW_MAX_WIDTH}px` }}>
        <header className="flex justify-between items-baseline mb-3 mx-[22px]">
          <span
            className="font-alte-haas font-bold uppercase text-[13.5px] text-black"
            style={{ letterSpacing: '-0.4px' }}
          >
            {work.title}
          </span>
          <span
            className="font-alte-haas font-bold uppercase text-[13.5px] text-black"
            style={{ letterSpacing: '-0.4px' }}
          >
            {work.year}
          </span>
        </header>
        <div className="overflow-x-auto no-scrollbar mx-[22px] rounded-t-[6px]">
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
      </div>
    </section>
  );
});
