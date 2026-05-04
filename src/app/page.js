'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VideoBackground from '@/components/VideoBackground';
import ExhibitionsSection from '@/components/ExhibitionsSection';
import WorkSection from '@/components/WorkSection';
import VideoSection from '@/components/VideoSection';

const NAV_H = 32;

function HomeInner() {
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'exhibitions';
  const exhibitionId = searchParams.get('exhibition') || null;

  const [navLocked, setNavLocked] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [firestoreExhibitions, setFirestoreExhibitions] = useState([]);
  const [firestoreWorks, setFirestoreWorks] = useState([]);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    fetch('/api/exhibitions')
      .then((r) => r.ok ? r.json() : [])
      .then(setFirestoreExhibitions)
      .catch(() => {});
    fetch('/api/works')
      .then((r) => r.ok ? r.json() : [])
      .then(setFirestoreWorks)
      .catch(() => {});
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
      if (activeTab === 'exhibitions' && exhibitionId && locked) {
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
  }, [activeTab, exhibitionId]);

  function handleTabClick(tab) {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (tab === 'exhibitions') {
      router.push('/?tab=exhibitions', { scroll: false });
      return;
    }
    if (activeTab === tab) return;
    router.push(`/?tab=${tab}`, { scroll: false });
  }

  function handleExhibitionSelect(id) {
    router.push(`/?tab=exhibitions&exhibition=${id}`, { scroll: false });
  }

  function handleIndexClick() {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    router.push(`/?tab=exhibitions`, { scroll: false });
  }

  function handleCopyEmail() {
    navigator.clipboard.writeText('ediexxu@gmail.com')
      .then(() => {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      })
      .catch(() => {});
  }

  const navContent = (
    <div className="h-full flex items-center justify-center font-alte-haas text-[12px] tracking-wide gap-6">
      <button
        onClick={() => handleTabClick('exhibitions')}
        className={`hover:opacity-50 transition-opacity ${activeTab === 'exhibitions' ? 'font-bold' : 'font-normal'}`}
      >
        Exhibition
      </button>
      <button
        onClick={() => handleTabClick('work')}
        className={`hover:opacity-50 transition-opacity ${activeTab === 'work' ? 'font-bold' : 'font-normal'}`}
      >
        Works
      </button>
      <button
        onClick={() => handleTabClick('videos')}
        className={`hover:opacity-50 transition-opacity ${activeTab === 'videos' ? 'font-bold' : 'font-normal'}`}
      >
        Video
      </button>
      <a
        href="https://edie-xu-portfolio.s3.us-east-2.amazonaws.com/assets/Edie+X+Resume-1.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className="font-normal hover:opacity-50 transition-opacity"
      >
        CV
      </a>
    </div>
  );

  const footer = navLocked && !exhibitionId && (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white flex items-center justify-between px-6 py-3 font-alte-haas text-[11px] tracking-wide">
      <span
        className="font-bold cursor-pointer hover:opacity-50 transition-opacity"
        onClick={handleIndexClick}
      >
        EDIE XU
      </span>
      <div className="flex gap-5 text-neutral-400">
        <span
          onClick={handleCopyEmail}
          className="cursor-pointer hover:text-black transition-colors"
        >
          {emailCopied ? 'COPIED :)' : 'EMAIL'}
        </span>
        <a
          href="https://www.instagram.com/e__xu/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black transition-colors"
        >
          INSTAGRAM
        </a>
      </div>
    </div>
  );

  return (
    <>
      <VideoBackground />

      <span className="fixed top-6 left-1/2 -translate-x-1/2 z-10 text-white text-xs pointer-events-none select-none font-alte-haas font-bold">
        EDIE XU
      </span>

      <div ref={heroRef} style={{ height: `calc(100vh - ${NAV_H + 0}px)` }} />

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

        {footer}

        {activeTab === 'exhibitions' ? (
          <div className="relative" style={{ minHeight: `calc(100vh - ${NAV_H}px)` }}>
            <ExhibitionsSection
              selectedId={exhibitionId}
              onSelectId={handleExhibitionSelect}
              firestoreExhibitions={firestoreExhibitions}
              scrollEnabled={navLocked}
            />
          </div>
        ) : (
          <div
            className="relative overflow-hidden"
            style={{ height: `calc(100vh - ${NAV_H}px)` }}
          >
            {activeTab === 'work' && <WorkSection firestoreWorks={firestoreWorks} />}
            {activeTab === 'videos' && <VideoSection />}
          </div>
        )}

      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
