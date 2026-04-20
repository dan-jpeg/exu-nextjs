/**
 * Data fetching helpers.
 * Pattern: Firestore first (newly uploaded content), fall back to data.js (static baseline).
 * Firestore items are prepended so they appear before the static content.
 */

import type { Work, Video, Exhibition } from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

async function fetchFromApi<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getWorks(): Promise<Work[]> {
  const { selectedWorks } = await import('../data.js');
  const firestoreWorks = await fetchFromApi<Work>('/api/works');
  // Firestore items first (newest), then static baseline
  return [...firestoreWorks, ...(selectedWorks as Work[])];
}

export async function getVideos(): Promise<Video[]> {
  const { videos } = await import('../data.js');
  const firestoreVideos = await fetchFromApi<Video>('/api/videos');
  return [...firestoreVideos, ...(videos as Video[])];
}

export async function getExhibitions(): Promise<Exhibition[]> {
  const { exhibitions2 } = await import('../data.js');
  const firestoreExhibitions = await fetchFromApi<Exhibition>('/api/exhibitions');
  return [...firestoreExhibitions, ...(exhibitions2 as Exhibition[])];
}
