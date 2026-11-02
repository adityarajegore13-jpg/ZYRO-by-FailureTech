'use client';

/**
 * ZYRO by FailureTech — Instant Live Search View
 * Instant search across your 110 local Bollywood audio and video tracks.
 * Features quick-clear (✕), instant results grid, media filter pills,
 * and seamless audio/video transport.
 */

import React, { useState, useMemo } from 'react';
import {
  Search as SearchIcon,
  X,
  Play,
  Pause,
  Heart,
  ListPlus,
  Plus,
  Sparkles,
  Film,
  Music,
  Disc3
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { TRACK_CATALOG, searchTracks, Track } from '@/lib/audio/catalog';

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const SearchView: React.FC = () => {
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
    searchQuery: globalSearchQuery,
    setSearchQuery: setGlobalSearchQuery,
    openVideoPlayer,
    setSelectedArtist,
    showToast
  } = usePlayerStore();

  const [query, setQuery] = useState(globalSearchQuery || '');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'video' | 'audio'>('all');

  const popularTags = [
    'All',
    'Videos',
    'Arijit Singh',
    'Sidhu Moose Wala',
    'Sambata',
    'Atif Aslam',
    'Yo Yo Honey Singh',
    'Anuv Jain',
    'Mohit Chauhan',
    'Pritam',
    'Vishal Mishra',
    'Diljit Dosanjh',
    'The Local Train',
    'DIVINE',
    'KR$NA'
  ];

  // Instant search across the artist-organized local tracks
  const results = useMemo(() => {
    let list: Track[] = query.trim() ? searchTracks(query.trim()) : TRACK_CATALOG;

    // Tag filter
    if (selectedTag === 'Videos') {
      list = list.filter((t) => t.isVideo);
    } else if (selectedTag !== 'All') {
      const tagLower = selectedTag.toLowerCase();
      list = list.filter(
        (t) =>
          (t.artist && t.artist.toLowerCase().includes(tagLower)) ||
          (t.primaryArtist && t.primaryArtist.toLowerCase().includes(tagLower)) ||
          (t.collaborators && t.collaborators.some((c) => c.toLowerCase().includes(tagLower))) ||
          (t.title && t.title.toLowerCase().includes(tagLower)) ||
          (t.category && t.category.toLowerCase().includes(tagLower)) ||
          (t.movieOrAlbum && t.movieOrAlbum.toLowerCase().includes(tagLower)) ||
          (t.genre && t.genre.toLowerCase().includes(tagLower)) ||
          (t.crate && t.crate.toLowerCase().includes(tagLower))
      );
    }

    // Media type filter
    if (mediaTypeFilter === 'video') {
      list = list.filter((t) => t.isVideo);
    } else if (mediaTypeFilter === 'audio') {
      list = list.filter((t) => !t.isVideo);
    }

    return list;
  }, [query, selectedTag, mediaTypeFilter]);

  const handleOpenAddToPlaylist = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    setTrackToAddToPlaylist(track);
    setPlaylistModalOpen(true);
  };

  const handleTrackPlay = (track: Track) => {
    if (!track.src) {
      showToast('No playable media file found for this track.');
      return;
    }
    if (currentTrack.id === track.id) {
      togglePlay();
    } else {
      setTrack(track);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      {/* Search Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit text-xs font-mono text-[#00E5FF]">
            <Sparkles size={13} className="text-[#00E5FF]" />
            <span>NEURAL SEARCH INDEX</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00FFA3]/10 border border-[#00FFA3]/20 w-fit text-xs font-mono text-[#00FFA3]">
            <Disc3 size={13} className="text-[#00FFA3]" />
            <span>LOCAL BOLLYWOOD LIBRARY // 110 TRACKS</span>
          </div>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
          Explore Your Bollywood Vault
        </h1>
        <p className="text-sm md:text-base text-[#94A3B8] max-w-2xl">
          Instantly search your local music library across Bollywood soundtracks, Sidhu Moose Wala, Sambata Hip-Hop, and Honey Singh singles.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative w-full max-w-3xl">
        <div className="relative flex items-center rounded-2xl bg-[#0E1117]/90 border border-[#1A1F2C] focus-within:border-[#00FFA3] focus-within:shadow-[0_0_25px_rgba(0,255,163,0.18)] transition-all">
          <SearchIcon size={20} className="ml-4 text-[#94A3B8] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setGlobalSearchQuery(e.target.value);
            }}
            placeholder="Search by title, artist, movie, or crate (e.g. Tu Chahiye, Moosetape, Sambata)..."
            className="w-full bg-transparent px-4 py-4 text-sm md:text-base text-white placeholder-[#64748B] focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setGlobalSearchQuery('');
              }}
              className="mr-4 p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-mono text-[#64748B] flex-shrink-0 mr-1">Quick:</span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (tag === 'All') {
                  setSelectedTag('All');
                } else if (tag === selectedTag) {
                  setSelectedTag('All');
                } else {
                  setSelectedTag(tag);
                }
              }}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all flex-shrink-0 border ${
                selectedTag === tag
                  ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 shadow-[0_0_12px_rgba(0,255,163,0.2)]'
                  : 'bg-white/5 text-[#94A3B8] border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {tag === 'Videos' && <Film size={11} className="inline mr-1" />}
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Summary & Media Filter */}
      <div className="flex items-center justify-between border-b border-[#1A1F2C] pb-3">
        <span className="text-xs font-mono text-[#94A3B8] tracking-wider uppercase">
          {query || selectedTag !== 'All' ? `Results (${results.length})` : `All Local Tracks (${results.length})`}
        </span>

        {/* Media filter tabs */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setMediaTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              mediaTypeFilter === 'all'
                ? 'text-[#00FFA3] bg-[#00FFA3]/10 font-bold'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            All ({TRACK_CATALOG.length})
          </button>
          <button
            onClick={() => setMediaTypeFilter('video')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              mediaTypeFilter === 'video'
                ? 'text-[#00E5FF] bg-[#00E5FF]/10 font-bold'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            <Film size={12} />
            <span>Videos ({TRACK_CATALOG.filter((t) => t.isVideo).length})</span>
          </button>
          <button
            onClick={() => setMediaTypeFilter('audio')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              mediaTypeFilter === 'audio'
                ? 'text-[#00FFA3] bg-[#00FFA3]/10 font-bold'
                : 'text-[#64748B] hover:text-white'
            }`}
          >
            <Music size={12} />
            <span>Audio ({TRACK_CATALOG.filter((t) => !t.isVideo).length})</span>
          </button>
        </div>
      </div>

      {/* Results Grid or Empty State */}
      {results.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-[#0E1117]/60 border border-[#1A1F2C]">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-[#64748B]">
            <SearchIcon size={32} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No local tracks matched &quot;{query}&quot;</h3>
          <p className="text-sm text-[#94A3B8] max-w-md mb-6 leading-relaxed">
            Try searching for artists like <span className="text-[#00FFA3]">Atif Aslam</span>, <span className="text-[#00FFA3]">Sidhu Moose Wala</span>, or <span className="text-[#00FFA3]">Sambata</span>.
          </p>
          <button
            onClick={() => {
              setQuery('');
              setGlobalSearchQuery('');
              setSelectedTag('All');
              setMediaTypeFilter('all');
            }}
            className="px-6 py-2.5 rounded-full bg-white text-[#060709] text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Clear Filters & Browse All Tracks
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map((track) => {
            const isCurrent = currentTrack.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isLiked = likedSongs.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => handleTrackPlay(track)}
                className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                  isCurrent
                    ? 'ring-1 ring-[#00FFA3] shadow-[0_0_25px_rgba(0,255,163,0.18)]'
                    : 'hover:border-[#00E5FF]/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.1)]'
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

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                    <span
                      className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border flex items-center gap-1 ${
                        track.isVideo
                          ? 'text-[#00E5FF] bg-[#060709]/85 border-[#00E5FF]/40'
                          : 'text-[#00FFA3] bg-[#060709]/85 border-[#00FFA3]/40'
                      }`}
                    >
                      {track.isVideo ? <Film size={10} /> : <Music size={10} />}
                      <span>{track.isVideo ? 'VIDEO' : track.crate || track.category}</span>
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
                      handleTrackPlay(track);
                    }}
                    className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.6)] ${
                      isCurrent
                        ? 'bg-[#00FFA3] text-[#060709] scale-100 opacity-100'
                        : 'bg-white text-[#060709] opacity-0 group-hover:opacity-100 group-hover:scale-105'
                    }`}
                  >
                    {isCurrentPlaying ? (
                      <Pause size={20} fill="currentColor" />
                    ) : (
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    )}
                  </button>

                  {/* Watch Video button on card */}
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
                    <h4 className="text-sm md:text-base font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors" title={track.title}>
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
                  <div className="flex items-center justify-between pt-2 border-t border-[#1A1F2C] gap-1">
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
                        onClick={(e) => {
                          e.stopPropagation();
                          enqueue(track);
                        }}
                        className="p-1.5 text-[#64748B] hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Add to queue"
                      >
                        <ListPlus size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenAddToPlaylist(track, e)}
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
    </div>
  );
};

export default SearchView;
