'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { videos } from '@/data.js';

const COLS = 3;

export default function VideoSection() {
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [hoveredVideo, setHoveredVideo] = useState(null);

    return (
        <div className="w-full h-full overflow-auto">
            <div className="mx-[30px]">
                <div className="grid md:grid-cols-12 gap-x-1">
                    {/* Video grid — starts at column 4, 3-wide groups */}
                    {videos.map((video, index) => {
                        const row = Math.floor(index / COLS);
                        const col = index % COLS;
                        return (
                            <motion.div
                                key={video.id}
                                className="col-span-2 h-[145px] relative cursor-pointer"
                                style={{
                                    gridColumn: `${4 + col * 2} / span 2`,
                                    gridRow: row + 1,
                                    marginTop: row === 0 ? '80px' : '4px',
                                }}
                                onHoverStart={() => setHoveredVideo(video.id)}
                                onHoverEnd={() => setHoveredVideo(null)}
                                onClick={() => setSelectedVideo(video)}
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity duration-300"
                                />
                                {hoveredVideo === video.id && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-20"
                                    >
                                        <div className="text-black text-sm space-y-1 text-center">
                                            <p className="font-newsreader italic">{video.title}</p>
                                            <p className="font-alte-haas">{video.year}</p>
                                            <p className="font-alte-haas">{video.duration}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Video player modal */}
            {selectedVideo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
                    onClick={() => setSelectedVideo(null)}
                >
                    <button
                        onClick={() => setSelectedVideo(null)}
                        className="absolute top-8 right-8 text-white hover:opacity-70 font-alte-haas text-xs tracking-widest"
                    >
                        CLOSE
                    </button>
                    <video
                        controls
                        autoPlay
                        className="max-w-[90vw] max-h-[90vh]"
                        src={selectedVideo.videoUrl}
                        onClick={(e) => e.stopPropagation()}
                    />
                </motion.div>
            )}
        </div>
    );
}
