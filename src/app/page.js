'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VideoBackground from '@/components/VideoBackground';
import ExhibitionsSection from '@/components/ExhibitionsSection';
import WorkSection from '@/components/WorkSection';

const NAV_H = 108;

function HomeInner() {
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'exhibitions';
  const exhibitionId = searchParams.get('exhibition') || null;

  const [navLocked, setNavLocked] = useState(false);
  const [firestoreExhibitions, setFirestoreExhibitions] = useState([]);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    fetch('/api/exhibitions')
      .then((r) => r.ok ? r.json() : [])
      .then(setFirestoreExhibitions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const scrollRoot = document.getElementById('scroll-root');
    if (!scrollRoot) return;

    const check = () => {
      const heroBottom = heroRef.current
        ? heroRef.current.getBoundingClientRect().bottom
        : 0;
      setNavLocked(heroBottom <= 0);
    };

    scrollRoot.addEventListener('scroll', check, { passive: true });
    check();
    return () => scrollRoot.removeEventListener('scroll', check);
  }, []);

  function handleTabClick(tab) {
    if (activeTab === tab) return;
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    router.replace(`/?tab=${tab}`, { scroll: false });
  }

  function handleExhibitionSelect(id) {
    router.replace(`/?tab=exhibitions&exhibition=${id}`, { scroll: false });
  }

  function handleIndexClick() {
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
    router.replace(`/?tab=exhibitions`, { scroll: false });
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
    <div className="text-center py-7 font-alte-haas font-bold text-[12px] tracking-wide">
      <div className="mb-1 flex justify-center gap-5">
        <span
          onClick={handleIndexClick}
          className="cursor-pointer hover:opacity-50 transition-opacity"
        >
          INDEX
        </span>
        <a
          href="https://edie-xu-portfolio.s3.us-east-2.amazonaws.com/assets/Edie+X+Resume-1.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-50 transition-opacity"
        >
          CV
        </a>
        <span
          onClick={handleCopyEmail}
          className="cursor-pointer hover:opacity-50 transition-opacity"
        >
          {emailCopied ? 'EMAIL COPIED :)' : 'EMAIL'}
        </span>
        <a
          href="https://www.instagram.com/e__xu/"
          target="_blank"
          rel="noopener noreferrer"
          className="cursor-pointer hover:opacity-50 transition-opacity"
        >
          INSTAGRAM
        </a>
        <span
          onClick={() => handleTabClick('videos')}
          className="cursor-pointer hover:opacity-50 transition-opacity"
        >
          VIDEO
        </span>
      </div>
      <div className="flex justify-center gap-5">
        <button
          onClick={() => handleTabClick('exhibitions')}
          className={`cursor-pointer hover:opacity-50 transition-opacity ${activeTab === 'exhibitions' ? 'font-bold' : 'font-normal'}`}
        >
          Exhibition
        </button>
        <button
          onClick={() => handleTabClick('work')}
          className={`cursor-pointer hover:opacity-50 transition-opacity ${activeTab === 'work' ? 'font-bold' : 'font-normal'}`}
        >
          Works
        </button>
      </div>
    </div>
  );

  return (
    <>
      <VideoBackground />

      <span className="fixed top-6 left-6 z-10 text-white text-xs pointer-events-none select-none font-alte-haas font-bold">
        EDIE XU
      </span>

      <div ref={heroRef} style={{ height: `calc(100vh - ${NAV_H + 17}px)` }} />

      <main ref={mainRef} className="relative z-20 bg-white w-full">

        {navLocked && (
          <div
            className="fixed top-0 left-0 right-0 z-40 bg-white"
            style={{ height: NAV_H }}
          >
            {navContent}
          </div>
        )}

        <div
          className={navLocked ? 'invisible' : 'bg-white'}
          style={{ height: NAV_H }}
        >
          {!navLocked && navContent}
        </div>

        {/* Footer — visible in grid view only */}
        {navLocked && activeTab === 'exhibitions' && !exhibitionId && (
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-white pb-4 pt-2 text-center pointer-events-none">
            <p className="font-alte-haas font-bold text-[12px] tracking-wide">EDIE XU</p>
            <p className="font-alte-haas text-[9px] tracking-widest text-neutral-500 mt-1">
              <span>@E__XU</span>
              <span style={{ marginLeft: '25px' }}>EDIEXXU@GMAIL.COM</span>
            </p>
          </div>
        )}

        <div
          className="relative overflow-hidden"
          style={{ height: `calc(100vh - ${NAV_H}px)` }}
        >
          {activeTab === 'exhibitions' && (
            <ExhibitionsSection
              selectedId={exhibitionId}
              onSelectId={handleExhibitionSelect}
              firestoreExhibitions={firestoreExhibitions}
              scrollEnabled={navLocked}
            />
          )}
          {activeTab === 'work' && <WorkSection />}
          {activeTab === 'videos' && (
            <div className="px-16 py-16">
              <p className="text-xs tracking-widest text-neutral-400 font-alte-haas">VIDEO — coming soon</p>
            </div>
          )}
        </div>

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
