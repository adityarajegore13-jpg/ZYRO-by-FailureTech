/**
 * ZYRO by FailureTech — Master Audio Catalog
 * Strongly typed audio definitions for the 110 local Bollywood, Punjabi,
 * Marathi, and Desi Hip-Hop media files.
 */

import { LOCAL_BOLLYWOOD_TRACKS, LocalMediaTrack } from './bollywoodLibrary';

export type MusicCategory = 'All' | 'Bollywood' | 'Punjabi' | 'Marathi' | 'Singles' | 'Videos';

export interface Track {
  id: string;
  title: string;
  artist: string;
  primaryArtist?: string;
  artistFolder?: string;
  collaborators?: string[];
  category?: MusicCategory | string;
  genre: string;
  src: string;
  artworkUrl: string;
  duration: number; // in seconds
  bpm?: number;
  source?: 'saavn' | 'audius' | 'local';
  quality?: string;
  key?: string;
  bitrate?: string;
  tags?: string[];
  movieOrAlbum?: string;
  era?: string;
  vibeTag?: string;
  isTrending?: boolean;
  singers?: string[];
  language?: string;
  isVideo?: boolean;
  mediaType?: 'audio' | 'video';
  fileFormat?: string;
  originalFilename?: string;
  crate?: string;
  fileSize?: number;
}

export interface ArtistProfile {
  name: string;
  folder: string;
  trackCount: number;
  collabCount: number;
  totalTracks: number;
  artworkUrl: string;
  genres: string[];
  trackIds: string[];
}

// Master local collection (105 active artist-organized tracks)
export const TRACK_CATALOG: Track[] = LOCAL_BOLLYWOOD_TRACKS.map((t, idx) => ({
  ...t,
  isTrending: idx < 12 // Top 12 tracks featured in Trending
}));

export function getTrackById(id: string): Track | undefined {
  return TRACK_CATALOG.find((track) => track.id === id);
}

export function getTracksByCategory(category: MusicCategory | string): Track[] {
  if (category === 'All') return TRACK_CATALOG;
  if (category === 'Videos') return TRACK_CATALOG.filter((t) => t.isVideo);
  return TRACK_CATALOG.filter(
    (track) => track.category?.toLowerCase() === category.toLowerCase() || track.crate?.toLowerCase() === category.toLowerCase()
  );
}

export function getTrendingTracks(): Track[] {
  return TRACK_CATALOG.filter((track) => track.isTrending);
}

export function getBollywoodTracks(): Track[] {
  return TRACK_CATALOG.filter((track) => track.category === 'Bollywood' || track.crate === 'Bollywood');
}

export function getMarathiTracks(): Track[] {
  return TRACK_CATALOG.filter((track) => track.category === 'Marathi' || track.crate === 'Sambata');
}

export function getPunjabiTracks(): Track[] {
  return TRACK_CATALOG.filter((track) => track.category === 'Punjabi' || track.crate === 'Moosetape');
}

export function getSinglesTracks(): Track[] {
  return TRACK_CATALOG.filter((track) => track.category === 'Singles' || track.crate === 'Singles');
}

export function getVideoTracks(): Track[] {
  return TRACK_CATALOG.filter((track) => track.isVideo);
}

export function getAllArtists(): ArtistProfile[] {
  const artistMap = new Map<string, ArtistProfile>();

  for (const track of TRACK_CATALOG) {
    const primary = track.primaryArtist || track.artist;
    if (!artistMap.has(primary)) {
      artistMap.set(primary, {
        name: primary,
        folder: track.artistFolder || primary,
        trackCount: 0,
        collabCount: 0,
        totalTracks: 0,
        artworkUrl: track.artworkUrl,
        genres: [],
        trackIds: []
      });
    }

    const primaryProf = artistMap.get(primary)!;
    primaryProf.trackCount += 1;
    primaryProf.totalTracks += 1;
    if (!primaryProf.trackIds.includes(track.id)) {
      primaryProf.trackIds.push(track.id);
    }
    if (track.genre && !primaryProf.genres.includes(track.genre)) {
      primaryProf.genres.push(track.genre);
    }

    // Register collaborating artists so their profiles exist and include this track
    if (track.collaborators) {
      for (const collab of track.collaborators) {
        if (collab.toLowerCase() === primary.toLowerCase()) continue;
        if (!artistMap.has(collab)) {
          artistMap.set(collab, {
            name: collab,
            folder: track.artistFolder || primary,
            trackCount: 0,
            collabCount: 0,
            totalTracks: 0,
            artworkUrl: track.artworkUrl,
            genres: [],
            trackIds: []
          });
        }
        const collabProf = artistMap.get(collab)!;
        collabProf.collabCount += 1;
        collabProf.totalTracks += 1;
        if (!collabProf.trackIds.includes(track.id)) {
          collabProf.trackIds.push(track.id);
        }
        if (track.genre && !collabProf.genres.includes(track.genre)) {
          collabProf.genres.push(track.genre);
        }
      }
    }
  }

  // Sort by total track count descending
  return Array.from(artistMap.values()).sort((a, b) => b.totalTracks - a.totalTracks);
}

export function getTracksByArtist(artistName: string): Track[] {
  const clean = artistName.trim().toLowerCase();
  return TRACK_CATALOG.filter((track) => {
    const primary = (track.primaryArtist || track.artist).toLowerCase();
    if (primary === clean || primary.includes(clean)) return true;
    if (track.collaborators && track.collaborators.some((c) => c.toLowerCase() === clean || c.toLowerCase().includes(clean))) {
      return true;
    }
    return false;
  });
}

export function searchTracks(query: string): Track[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];
  return TRACK_CATALOG.filter((track) => {
    return (
      track.title.toLowerCase().includes(clean) ||
      track.artist.toLowerCase().includes(clean) ||
      (track.primaryArtist && track.primaryArtist.toLowerCase().includes(clean)) ||
      (track.collaborators && track.collaborators.some((c) => c.toLowerCase().includes(clean))) ||
      track.genre.toLowerCase().includes(clean) ||
      (track.movieOrAlbum && track.movieOrAlbum.toLowerCase().includes(clean)) ||
      (track.crate && track.crate.toLowerCase().includes(clean)) ||
      (track.tags && track.tags.some((t) => t.toLowerCase().includes(clean)))
    );
  });
}

export function getNextTrack(currentId: string): Track {
  const currentIndex = TRACK_CATALOG.findIndex((track) => track.id === currentId);
  if (currentIndex === -1) return TRACK_CATALOG[0];
  const nextIndex = (currentIndex + 1) % TRACK_CATALOG.length;
  return TRACK_CATALOG[nextIndex];
}

export function getPrevTrack(currentId: string): Track {
  const currentIndex = TRACK_CATALOG.findIndex((track) => track.id === currentId);
  if (currentIndex === -1) return TRACK_CATALOG[0];
  const prevIndex = (currentIndex - 1 + TRACK_CATALOG.length) % TRACK_CATALOG.length;
  return TRACK_CATALOG[prevIndex];
}
