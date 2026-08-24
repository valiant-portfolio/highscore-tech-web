// YouTube links for the Studio gallery.
//
// We host the work on YouTube rather than paying to store and stream video
// ourselves: YouTube handles transcoding, bandwidth and mobile playback for
// free, gives us a thumbnail per piece, and the videos earn reach on YouTube
// at the same time. We keep only the link.
//
// People paste whatever the app gave them, so accept every shape YouTube
// hands out — watch links, share links, Shorts, embeds, and live.

const PATTERNS: RegExp[] = [
  /[?&]v=([A-Za-z0-9_-]{11})/,              // youtube.com/watch?v=ID
  /youtu\.be\/([A-Za-z0-9_-]{11})/,         // youtu.be/ID           (share button)
  /\/shorts\/([A-Za-z0-9_-]{11})/,          // youtube.com/shorts/ID
  /\/embed\/([A-Za-z0-9_-]{11})/,           // youtube.com/embed/ID
  /\/live\/([A-Za-z0-9_-]{11})/,            // youtube.com/live/ID
];

/** The 11-character video id, or null when this isn't a YouTube link. */
export function youtubeId(input: string | null | undefined): string | null {
  const raw = (input ?? '').trim();
  if (!raw) return null;
  // A bare id pasted on its own is the most common thing after a full URL.
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  for (const re of PATTERNS) {
    const m = raw.match(re);
    if (m) return m[1];
  }
  return null;
}

export const isYoutube = (url: string | null | undefined) => youtubeId(url) !== null;

/** Privacy-friendly embed host: no cookie until the viewer actually plays. */
export const youtubeEmbedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/**
 * Thumbnail. `maxresdefault` is missing on plenty of videos and 404s to a grey
 * placeholder, so default to `hqdefault`, which YouTube always generates.
 */
export const youtubeThumb = (id: string, quality: 'hq' | 'max' = 'hq') =>
  `https://i.ytimg.com/vi/${id}/${quality === 'max' ? 'maxresdefault' : 'hqdefault'}.jpg`;
