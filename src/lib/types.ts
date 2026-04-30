export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface Work {
  id: string;
  category: string;
  location: string;
  title: string;
  description: string;
  year: string;
  dimensions: string;
  material: string;
  media: MediaItem[];
  order?: number;
}

export interface Video {
  id: string;
  title: string;
  safeTitle: string;
  year: string;
  duration: string;
  videoUrl: string;
  thumbnail: string;
  order?: number;
}

export interface WorkIncluded {
  id: number | string;
  title: string;
  year: string;
  dimensions: string;
  material: string;
  description: string;
}

// Ordered content block — either an image (with optional caption) or a text paragraph.
// Used in Firestore-uploaded exhibitions so the artist can freely mix and reorder.
export interface ContentItem {
  id: string;
  type: 'image' | 'text';
  url?: string;       // images only
  caption?: string;   // images only (optional)
  text?: string;      // text paragraphs only
  fontSize?: number;      // text only — base font size in px
  marginX?: number;       // text only — horizontal inset in px
  paddingTop?: number;    // text only — custom top spacing in px
  paddingBottom?: number; // text only — custom bottom spacing in px
  order: number;
}

export interface Exhibition {
  id: string;
  category: string;
  title: string;
  location: string;
  url?: string;
  date: string;
  // New format (Firestore): ordered mix of images + text paragraphs
  contentItems?: ContentItem[];
  // Legacy format (data.js fallback): plain image URLs
  images?: string[];
  header: string;
  subheader: string;
  textContent?: string;
  footnote?: string;
  workIncluded: WorkIncluded[];
  order?: number;
}

// Helper: normalise either format into a sorted ContentItem[]
export function getContentItems(ex: Exhibition): ContentItem[] {
  if (ex.contentItems?.length) {
    return [...ex.contentItems].sort((a, b) => a.order - b.order);
  }
  return (ex.images ?? []).map((url, i) => ({
    id: `legacy-${i}`,
    type: 'image' as const,
    url,
    caption: undefined,
    order: i,
  }));
}
