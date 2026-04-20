'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const siloShapes = [
  '/assets/silo-icon.svg',
  '/assets/silo-icon-1.svg',
  '/assets/silo-icon-2.svg',
  '/assets/silo-icon-3.svg',
  '/assets/silo-icon-4.svg',
  '/assets/silo-icon-5.svg',
];

export default function SiloHoverButton({
  label = '+',
  speed = 150,
  onClick,
}: {
  label?: string;
  speed?: number;
  onClick?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFirstAppearance, setIsFirstAppearance] = useState(true);

  useEffect(() => {
    if (!isHovered) {
      setIsFirstAppearance(true);
      return;
    }
    setCurrentIndex(Math.floor(Math.random() * siloShapes.length));
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        setIsFirstAppearance(false);
        return (prev + 1) % siloShapes.length;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [isHovered, speed]);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        className="px-[5px] py-[1px] rounded-full text-[10px] lowercase tracking-wider bg-black/10 hover:bg-black hover:text-white transition-colors"
      >
        {label}
      </button>

      {/* Silo shape cycling beside the button */}
      <div className="absolute top-1/2 -translate-y-1/2 left-full ml-2 w-[20px] h-[40px] pointer-events-none">
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.img
              key={currentIndex}
              src={siloShapes[currentIndex]}
              alt=""
              className="w-full h-full object-contain"
              initial={isFirstAppearance ? { opacity: 0.3, y: 10 } : { opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 1 }}
              transition={isFirstAppearance ? { duration: 0.4 } : { duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
