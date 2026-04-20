'use client';

import { useState, useRef, useEffect } from 'react';

const videoUrlWebM = "https://edie-xu-portfolio.s3.us-east-2.amazonaws.com/videos/lp-vid-qhd-webm.webm";
const videoUrlMp4  = "https://edie-xu-portfolio.s3.us-east-2.amazonaws.com/videos/lp_video-safari-hd.mp4";

export default function VideoBackground({ onLoadingChange }) {
    const [loading, setLoading] = useState(true);
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const show = () => {
            setLoading(false);
            onLoadingChange?.(false);
        };
        const hide = () => {
            setLoading(true);
            onLoadingChange?.(true);
        };
        const onError = () => {
            console.error('Video loading error');
            setLoading(false);
            onLoadingChange?.(false);
        };

        // loadeddata fires as soon as the first frame is available — enough to show the video.
        // canplaythrough can stall on slow connections; loadeddata is more reliable for autoplay.
        video.addEventListener('loadeddata', show);
        video.addEventListener('loadstart',  hide);
        video.addEventListener('error',      onError);

        // If the video already has data (e.g. cached), fire immediately
        if (video.readyState >= 2) show();

        return () => {
            video.removeEventListener('loadeddata', show);
            video.removeEventListener('loadstart',  hide);
            video.removeEventListener('error',      onError);
        };
    }, [onLoadingChange]);

    return (
        <div className="pointer-events-none fixed inset-0 z-0 w-full h-full">
            {loading && (
                <div className="absolute inset-0 bg-black" />
            )}
            <video
                ref={videoRef}
                className="pointer-events-none absolute inset-0 w-full h-full object-contain"
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
            >
                {/* Browser picks the first format it supports */}
                <source src={videoUrlWebM} type="video/webm" />
                <source src={videoUrlMp4}  type="video/mp4"  />
            </video>
        </div>
    );
}
