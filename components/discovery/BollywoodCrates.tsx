'use client';

/**
 * ZYRO by FailureTech — Desi Resonance / Bollywood Vault
 * Displays the complete collection of 110 local Bollywood audio and video tracks.
 * Features instant search, sorting (A-Z, Format, etc.), sub-crate filtering,
 * and audio/video playback integration.
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  ListPlus,
  Plus,
  Play,
  Pause,
  Film,
  Music,
  Search,
  ArrowUpDown,
  Sparkles,
  Layers
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { BOLLYWOOD_CATALOG, BollywoodTrack } from '@/lib/audio/bollywoodCatalog';

type SortOption = 'title-asc' | 'title-desc' | 'artist-asc' | 'videos-first' | 'audio-first';
type CrateFilter = 'All' | 'Bollywood' | 'Moosetape' | 'Sambata' | 'Singles' | 'Paresh-Pahuja';
type MediaFilter = 'all' | 'audio' | 'video';

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const BollywoodCrates: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    setTrack,
    togglePlay,
    enqueue,
    likedSongs,
    toggleLike,
    setPlaylistModalOpen,
    setTrackToAddToPlaylist,
    openVideoPlayer,
    setSelectedArtist
  } = usePlayerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrate, setSelectedCrate] = useState<CrateFilter>('All');
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('title-asc');
  const [queuedNotification, setQueuedNotification] = useState<string | null>(null);

  const crates: { id: CrateFilter; label: string; count: number }[] = [
    { id: 'All', label: 'All Crates', count: BOLLYWOOD_CATALOG.length },
    { id: 'Bollywood', label: 'Bollywood Vault', count: BOLLYWOOD_CATALOG.filter((t) => t.crate === 'Bollywood').length },
    { id: 'Moosetape', label: 'Moosetape (Sidhu)', count: BOLLYWOOD_CATALOG.filter((t) => t.crate === 'Moosetape').length },
    { id: 'Sambata', label: 'Sambata Hip-Hop', count: BOLLYWOOD_CATALOG.filter((t) => t.crate === 'Sambata').length },
    { id: 'Singles', label: 'Desi Singles', count: BOLLYWOOD_CATALOG.filter((t) => t.crate === 'Singles').length },
    { id: 'Paresh-Pahuja', label: 'Paresh Pahuja', count: BOLLYWOOD_CATALOG.filter((t) => t.crate === 'Paresh-Pahuja').length }
  ];

  // Instant filtering and sorting
  const displayedTracks = useMemo(() => {
    let list = BOLLYWOOD_CATALOG;

    // 1. Crate filter
    if (selectedCrate !== 'All') {
      list = list.filter((t) => t.crate === selectedCrate || t.category === selectedCrate);
    }

    // 2. Media Type filter
    if (mediaFilter === 'video') {
      list = list.filter((t) => t.isVideo);
    } else if (mediaFilter === 'audio') {
      list = list.filter((t) => !t.isVideo);
    }

    // 3. Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.artist.toLowerCase().includes(query) ||
          (t.movieOrAlbum && t.movieOrAlbum.toLowerCase().includes(query)) ||
          (t.crate && t.crate.toLowerCase().includes(query)) ||
          (t.genre && t.genre.toLowerCase().includes(query))
      );
    }

    // 4. Sorting
    const sorted = [...list];
    switch (sortBy) {
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'artist-asc':
        sorted.sort((a, b) => a.artist.localeCompare(b.artist));
        break;
      case 'videos-first':
        sorted.sort((a, b) => (b.isVideo ? 1 : 0) - (a.isVideo ? 1 : 0));
        break;
      case 'audio-first':
        sorted.sort((a, b) => (a.isVideo ? 1 : 0) - (b.isVideo ? 1 : 0));
        break;
    }

    return sorted;
  }, [selectedCrate, mediaFilter, searchQuery, sortBy]);

  const handleQueueTrack = (track: BollywoodTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    enqueue(track);
    setQueuedNotification(`"${track.title}" added to queue`);
    setTimeout(() => {
      setQueuedNotification(null);
    }, 2800);
  };

  const handlePlayAll = () => {
    if (displayedTracks.length === 0) return;
    const [first, ...rest] = displayedTracks;
    setTrack(first);
    rest.forEach((track) => enqueue(track));
    setQueuedNotification(`Launched ${displayedTracks.length} tracks into Orbit`);
    setTimeout(() => setQueuedNotification(null), 3000);
  };

  return (
    <section id="bollywood-vault" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16 relative">
      {/* Background ambient glow effect */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#00FFA3]/10 via-[#00E5FF]/10 to-transparent blur-[120px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Floating Micro Toast */}
      {queuedNotification && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl bg-[#0E1117]/95 border border-[#00FFA3]/50 text-white text-xs font-mono shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(0,255,163,0.25)] backdrop-blur-2xl transition-all">
          <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
          <span>{queuedNotification}</span>
        </div>
      )}

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
            <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
            <span className="text-[11px] font-mono text-[#00FFA3] tracking-widest uppercase">
              LOCAL DESI COLLECTION // 110 HIGH-FIDELITY TRACKS
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Bollywood Vault &amp; Desi Crates
          </h2>
          <p className="text-[#94A3B8] text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Your personal local collection featuring 86 Lossless Audio tracks &amp; 24 HD Music Videos from Bollywood soundtracks, Sidhu Moose Wala, Sambata Hip-Hop, and Honey Singh singles.
          </p>
        </div>

        {/* Master Action & Stats */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handlePlayAll}
            className="px-6 py-3 rounded-full bg-[#00FFA3] text-[#060709] font-bold text-xs md:text-sm font-mono tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,255,163,0.4)] flex items-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            <span>Launch Crate ({displayedTracks.length})</span>
          </button>
        </div>
      </div>

      {/* Controls Bar: Search, MediaType, Sorting */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0E1117]/80 border border-[#1A1F2C] backdrop-blur-xl mb-6">
        {/* Search inside Bollywood library */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within local collection (title, artist, film)..."
            className="w-full bg-white/[0.03] border border-white/10 focus:border-[#00FFA3] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none transition-all"
          />
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Media type toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono">
            {[
              { id: 'all', label: 'All Media' },
              { id: 'video', label: `Videos (${BOLLYWOOD_CATALOG.filter((t) => t.isVideo).length})` },
              { id: 'audio', label: `Audio (${BOLLYWOOD_CATALOG.filter((t) => !t.isVideo).length})` }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMediaFilter(m.id as MediaFilter)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  mediaFilter === m.id
                    ? 'bg-[#00FFA3] text-[#060709] font-bold shadow-[0_0_10px_rgba(0,255,163,0.2)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-[#94A3B8]">
            <ArrowUpDown size={14} className="text-[#00FFA3]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              <option value="title-asc" className="bg-[#0E1117] text-white">Title (A - Z)</option>
              <option value="title-desc" className="bg-[#0E1117] text-white">Title (Z - A)</option>
              <option value="artist-asc" className="bg-[#0E1117] text-white">Artist (A - Z)</option>
              <option value="videos-first" className="bg-[#0E1117] text-white">Videos First</option>
              <option value="audio-first" className="bg-[#0E1117] text-white">Audio First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sub-Crate Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
        {crates.map((crate) => {
          const isActive = selectedCrate === crate.id;
          return (
            <button
              key={crate.id}
              onClick={() => setSelectedCrate(crate.id)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex items-center gap-2 flex-shrink-0 border ${
                isActive
                  ? 'bg-white/15 text-white border-[#00FFA3] shadow-[0_0_18px_rgba(0,255,163,0.25)]'
                  : 'bg-white/5 text-[#94A3B8] border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-[#00FFA3]' : 'text-[#64748B]'}>
                {crate.id === 'Moosetape' ? '☬' : crate.id === 'Sambata' ? '⚡' : '●'}
              </span>
              <span>{crate.label}</span>
              <span className="text-[10px] opacity-60">({crate.count})</span>
            </button>
          );
        })}
      </div>

      {/* Grid of Local Bollywood Cards */}
      {displayedTracks.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#0E1117]/60 border border-[#1A1F2C]">
          <p className="text-white text-base font-bold mb-2">No local tracks match your filters</p>
          <p className="text-xs text-[#94A3B8] font-mono mb-4">Try clearing the search query or selecting &quot;All Crates&quot;.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCrate('All');
              setMediaFilter('all');
            }}
            className="px-5 py-2 rounded-full bg-white text-[#060709] text-xs font-mono font-bold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedTracks.map((track) => {
            const isCurrent = currentTrack.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isLiked = likedSongs.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isCurrent) togglePlay();
                  else setTrack(track);
                }}
                className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'ring-1 ring-[#00FFA3] shadow-[0_0_25px_rgba(0,255,163,0.2)]'
                    : 'hover:border-[#00E5FF]/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.12)]'
                }`}
                style={{
                  backgroundColor: 'rgba(14, 17, 23, 0.85)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: isCurrent ? '1px solid #00FFA3' : '1px solid #1A1F2C'
                }}
              >
                {/* 1:1 Aspect Ratio Cover Art */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#060709]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={track.artworkUrl}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-black/30" />

                  {/* Top Badges: Media Format & Duration */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span
                      className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border flex items-center gap-1 ${
                        track.isVideo
                          ? 'text-[#00E5FF] bg-[#060709]/85 border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                          : 'text-[#00FFA3] bg-[#060709]/85 border-[#00FFA3]/40'
                      }`}
                    >
                      {track.isVideo ? <Film size={10} /> : <Music size={10} />}
                      <span>{track.isVideo ? 'MUSIC VIDEO' : 'LOCAL AUDIO'}</span>
                    </span>

                    <span className="text-[10px] font-mono text-[#94A3B8] bg-[#060709]/85 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
                      {formatDuration(track.duration)}
                    </span>
                  </div>

                  {/* Play Overlay Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCurrent) togglePlay();
                      else setTrack(track);
                    }}
                    className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.6)] ${
                      isCurrent
                        ? 'bg-[#00FFA3] text-[#060709] scale-100 opacity-100'
                        : 'bg-white text-[#060709] opacity-0 group-hover:opacity-100 group-hover:scale-105'
                    }`}
                    aria-label={isCurrentPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  >
                    {isCurrentPlaying ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  {/* Watch Video direct button on card */}
                  {track.isVideo && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrack(track);
                        openVideoPlayer(track);
                      }}
                      className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#060709] text-[10px] font-mono font-bold border border-[#00E5FF]/40 backdrop-blur-md transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                      title="Watch HD Video"
                    >
                      <Film size={11} />
                      <span>Watch Video</span>
                    </button>
                  )}
                </div>

                {/* Track Details */}
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-[#00FFA3] tracking-wider uppercase truncate">
                      {track.movieOrAlbum || track.crate || 'Bollywood'}
                    </span>
                    <h4
                      className="text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors"
                      title={track.title}
                    >
                      {track.title}
                    </h4>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedArtist(track.primaryArtist || track.artist);
                      }}
                      className="text-xs text-[#94A3B8] hover:text-[#00FFA3] font-mono truncate transition-colors cursor-pointer"
                      title={`View ${track.artist} profile`}
                    >
                      {track.artist}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1A1F2C]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLiked
                            ? 'text-[#00FFA3] hover:text-[#00FFA3]/80'
                            : 'text-[#64748B] hover:text-white hover:bg-white/5'
                        }`}
                        title={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart size={15} fill={isLiked ? '#00FFA3' : 'none'} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleQueueTrack(track, e)}
                        className="p-1.5 text-[#64748B] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Add to queue"
                      >
                        <ListPlus size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrackToAddToPlaylist(track);
                          setPlaylistModalOpen(true);
                        }}
                        className="p-1.5 text-[#64748B] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Add to Playlist"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <span className="text-[10px] font-mono text-[#64748B] bg-white/[0.02] px-2 py-0.5 rounded border border-white/5">
                      {track.fileFormat || (track.isVideo ? 'MP4' : 'MP3')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BollywoodCrates;
