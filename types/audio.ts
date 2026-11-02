/**
 * ZYRO by FailureTech — Unified Audio Schema
 * Bridges disparate streaming endpoints (JioSaavn, Audius, Local)
 * into a single normalized high-fidelity track representation.
 */

export type TrackSource = 'saavn' | 'audius' | 'local';

export interface UnifiedTrack {
  id: string;
  title: string;
  artist: string;
  src: string; // Direct audio stream / MP3 URL
  artworkUrl: string; // High-res poster / artwork
  duration: number; // in seconds
  genre: string;
  source: TrackSource;
  quality: string; // e.g., '320K', 'HQ Stream', '1411K PCM'
  movieOrAlbum?: string;
  year?: string | number;
  language?: string;
  bpm?: number;
  key?: string;
  bitrate?: string;
  tags?: string[];
  isTrending?: boolean;
}

export interface HybridApiResponse {
  success: boolean;
  count: number;
  data: UnifiedTrack[];
  sources: {
    saavn: number;
    audius: number;
    local: number;
  };
  cachedAt?: string;
  error?: string;
}
