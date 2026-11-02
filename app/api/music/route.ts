/**
 * ZYRO by FailureTech — Next.js Local Music API Route
 * Serves the normalized 110 local Bollywood audio and video tracks.
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedTrack, HybridApiResponse } from '@/types/audio';
import { TRACK_CATALOG, Track } from '@/lib/audio/catalog';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const category = (searchParams.get('category') || 'all').toLowerCase();
    const artist = (searchParams.get('artist') || '').trim().toLowerCase();

    let list = TRACK_CATALOG;

    if (category !== 'all') {
      list = list.filter(
        (t) =>
          t.category?.toLowerCase() === category ||
          t.crate?.toLowerCase() === category
      );
    }

    if (artist) {
      list = list.filter(
        (t) =>
          t.artist.toLowerCase().includes(artist) ||
          (t.primaryArtist && t.primaryArtist.toLowerCase().includes(artist)) ||
          (t.collaborators && t.collaborators.some((c) => c.toLowerCase().includes(artist)))
      );
    }

    if (q) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          (t.primaryArtist && t.primaryArtist.toLowerCase().includes(q)) ||
          (t.collaborators && t.collaborators.some((c) => c.toLowerCase().includes(q))) ||
          (t.movieOrAlbum && t.movieOrAlbum.toLowerCase().includes(q)) ||
          (t.genre && t.genre.toLowerCase().includes(q)) ||
          (t.crate && t.crate.toLowerCase().includes(q))
      );
    }

    const tracks: UnifiedTrack[] = list.map((t): UnifiedTrack => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      src: t.src,
      artworkUrl: t.artworkUrl,
      duration: t.duration,
      genre: t.genre,
      source: 'local',
      quality: t.isVideo ? '1080P HD' : '320K MP3',
      movieOrAlbum: t.movieOrAlbum,
      bpm: t.bpm,
      year: new Date().getFullYear().toString()
    }));

    const response: HybridApiResponse = {
      success: true,
      count: tracks.length,
      data: tracks,
      sources: {
        saavn: 0,
        audius: 0,
        local: tracks.length
      },
      cachedAt: new Date().toISOString()
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        count: 0,
        data: [],
        sources: { saavn: 0, audius: 0, local: 0 },
        error: error?.message || 'Failed to fetch local audio streams'
      },
      { status: 500 }
    );
  }
}
