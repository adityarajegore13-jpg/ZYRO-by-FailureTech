'use client';

/**
 * ZYRO by FailureTech — Hybrid Discovery Feed
 * Real-time client component consuming /api/music.
 * Unifies JioSaavn (Bollywood & Marathi) and Audius API (Global Lo-Fi & EDM).
 * Features 2-col mobile to 5-col desktop frosted glass grid, source badges,
 * and neon skeleton loading states.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Heart,
  ListPlus,
  Plus,
  Sparkles,
  Radio,
  Flame,
  Globe2,
  Disc3,
  RefreshCw,
  Zap
} from 'lucide-react';
import { UnifiedTrack, TrackSource } from '@/types/audio';
import { usePlayerStore } from '@/stores/usePlayerStore';

type HybridCategory = 'all' | 'bollywood' | 'punjabi' | 'marathi' | 'singles';

interface CategoryPill {
  key: HybridCategory;
  label: string;
  icon: React.ReactNode;
}

export const HybridFeed: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    setTrack,
    togglePlay,
    enqueue,
    likedSongs,
    toggleLike,
    setPlaylistModalOpen,
    setTrackToAddToPlaylist
  } = usePlayerStore();

  const [activeCategory, setActiveCategory] = useState<HybridCategory>('all');
  const [tracks, setTracks] = useState<UnifiedTrack[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const categories: CategoryPill[] = [
    { key: 'all', label: 'All Crates', icon: <Sparkles size={14} /> },
    { key: 'bollywood', label: 'Bollywood Hits', icon: <Flame size={14} /> },
    { key: 'punjabi', label: 'Moosetape', icon: <Zap size={14} /> },
    { key: 'marathi', label: 'Marathi // Sambata', icon: <Disc3 size={14} /> },
    { key: 'singles', label: 'Honey Singh Singles', icon: <Radio size={14} /> }
  ];

  // Fetch tracks from hybrid API whenever category changes
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function loadHybridTracks() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/music?category=${activeCategory}`, {
          signal: controller.signal
        });

        if (!res.ok) {
          throw new Error(`API responded with status ${res.status}`);
        }

        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setTracks(data.data);
        } else {
          setTracks([]);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load hybrid music streams');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadHybridTracks();

    return () => {
      controller.abort();
    };
  }, [activeCategory]);

  const handleOpenAddToPlaylist = (track: UnifiedTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackToAddToPlaylist(track as any);
    setPlaylistModalOpen(true);
  };

  return (
    <section id="hybrid-engine" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
            <span className="text-xs font-mono text-[#00FFA3] tracking-widest uppercase">
              DESI STREAM ENGINE // 110 LOCAL MASTER TRACKS
            </span>
          </div>

          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Desi Stream Vault
          </h2>

          <p className="text-sm md:text-base text-[#94A3B8] max-w-2xl leading-relaxed">
            High-fidelity playback pipeline serving your 110 local Bollywood, Sidhu Moose Wala, Sambata Hip-Hop, and Honey Singh tracks.
          </p>
        </div>

        {/* Source Telemetry Stats */}
        <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-[#00E5FF]/30 text-[#00E5FF] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
            <span>24 MUSIC VIDEOS</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-[#00FFA3]/30 text-[#00FFA3] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3]" />
            <span>86 AUDIO TRACKS</span>
          </div>
        </div>
      </div>

      {/* Horizontal Category Pill Filter Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#1A1F2C]">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-2 flex-shrink-0 border ${
                isActive
                  ? 'bg-white/15 text-white border-[#00FFA3] shadow-[0_0_18px_rgba(0,255,163,0.22)]'
                  : 'bg-white/5 text-[#94A3B8] border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-[#00FFA3]' : 'text-[#64748B]'}>{cat.icon}</span>
              <span>[{cat.label}]</span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton with Neon Pulse */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl p-3.5 bg-[#0E1117]/80 border border-[#1A1F2C] flex flex-col gap-3 animate-pulse"
            >
              <div className="relative aspect-square w-full rounded-xl bg-white/[0.04] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#00FFA3]/5 via-transparent to-[#00E5FF]/10 animate-pulse" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="h-3 w-16 bg-white/[0.06] rounded-full" />
                <div className="h-4 w-3/4 bg-white/[0.08] rounded-md" />
                <div className="h-3 w-1/2 bg-white/[0.04] rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error or Retry state */
        <div className="py-16 text-center rounded-3xl bg-[#0E1117]/60 border border-[#1A1F2C] p-8 flex flex-col items-center gap-4">
          <p className="text-sm font-mono text-red-400">{error}</p>
          <button
            onClick={() => setActiveCategory('all')}
            className="px-5 py-2 rounded-full bg-white text-[#060709] text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Reload Hybrid Feed</span>
          </button>
        </div>
      ) : (
        /* Responsive 2-Col Mobile, 5-Col Desktop Frosted Glass Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
          {tracks.map((track) => {
            const isCurrent = currentTrack.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isLiked = likedSongs.includes(track.id);

            return (
              <article
                key={track.id}
                onClick={() => {
                  if (isCurrent) togglePlay();
                  else setTrack(track as any);
                }}
                className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'ring-1 ring-[#00FFA3] shadow-[0_0_25px_rgba(0,255,163,0.22)]'
                    : 'hover:border-[#00E5FF]/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.12)]'
                }`}
                style={{
                  backgroundColor: 'rgba(14, 17, 23, 0.82)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: isCurrent ? '1px solid #00FFA3' : '1px solid #1A1F2C'
                }}
              >
                {/* 1:1 Cover Art Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#060709]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={track.artworkUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-black/30" />

                  {/* Top Badges: Source Badge & Quality */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    {/* Visual Source Badge */}
                    <span
                      className="text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border text-[#00FFA3] bg-[#060709]/85 border-[#00FFA3]/40 shadow-[0_0_8px_rgba(0,255,163,0.25)]"
                    >
                      LOCAL MASTER
                    </span>

                    {/* Quality Indicator */}
                    <span className="text-[9px] font-mono text-[#94A3B8] bg-[#060709]/85 border border-white/10 px-1.5 py-0.5 rounded-full backdrop-blur-md">
                      {track.quality || 'HQ'}
                    </span>
                  </div>

                  {/* Play Overlay Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) togglePlay();
                      else setTrack(track as any);
                    }}
                    className={`absolute inset-0 m-auto w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.6)] ${
                      isCurrent
                        ? 'bg-[#00FFA3] text-[#060709] scale-100 opacity-100 ring-4 ring-[#00FFA3]/30'
                        : 'bg-white text-[#060709] opacity-0 group-hover:opacity-100 group-hover:scale-105'
                    }`}
                    aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  >
                    {isCurrentPlaying ? (
                      <Pause size={17} fill="currentColor" />
                    ) : (
                      <Play size={17} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  {/* Active Equalizer Animation */}
                  {isCurrentPlaying && (
                    <div className="absolute bottom-2 right-2 flex items-end gap-0.5 h-3 px-1.5 py-0.5 rounded bg-[#060709]/80 border border-[#00FFA3]/30">
                      <span className="w-0.5 bg-[#00FFA3] h-2.5 animate-pulse" />
                      <span className="w-0.5 bg-[#00E5FF] h-3 animate-bounce" />
                      <span className="w-0.5 bg-[#00FFA3] h-1.5 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Card Content & Action Bar */}
                <div className="p-3.5 flex flex-col gap-2.5">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-[#00FFA3] tracking-wider uppercase truncate">
                      {track.genre}
                    </span>
                    <h3
                      className="text-xs md:text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors"
                      title={track.title}
                    >
                      {track.title}
                    </h3>
                    <p className="text-[11px] text-[#94A3B8] font-mono truncate" title={track.artist}>
                      {track.artist}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1A1F2C]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className={`p-1 rounded-lg transition-all ${
                          isLiked ? 'text-[#00FFA3]' : 'text-[#64748B] hover:text-white'
                        }`}
                        title={isLiked ? 'Unlike song' : 'Save to Liked Songs'}
                      >
                        <Heart size={14} fill={isLiked ? '#00FFA3' : 'none'} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          enqueue(track as any);
                        }}
                        className="p-1 text-[#64748B] hover:text-[#00E5FF] transition-colors"
                        title="Add to queue"
                      >
                        <ListPlus size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenAddToPlaylist(track, e)}
                        className="p-1 text-[#64748B] hover:text-white transition-colors"
                        title="Add to Playlist"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="text-[9px] font-mono text-[#64748B]">
                      {track.movieOrAlbum ? 'OST' : 'STREAM'}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HybridFeed;
