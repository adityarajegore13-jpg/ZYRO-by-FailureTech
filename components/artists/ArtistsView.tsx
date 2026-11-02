'use client';

/**
 * ZYRO by FailureTech — Verified Artists Hub & Deep Profile View
 * Organizes and displays all 35 verified music artists, their real artwork,
 * primary tracks, featured collaborations, and instant audio/video transport.
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Play,
  Pause,
  Heart,
  Plus,
  ArrowLeft,
  Music,
  Film,
  Sparkles,
  Search,
  SlidersHorizontal,
  Flame,
  Radio,
  Disc3,
  Clock,
  Layers
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { getAllArtists, getTracksByArtist, ArtistProfile, Track } from '@/lib/audio/catalog';

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const ArtistsView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    setTrack,
    togglePlay,
    playAllTracks,
    enqueue,
    likedSongs,
    toggleLike,
    setPlaylistModalOpen,
    setTrackToAddToPlaylist,
    openVideoPlayer,
    selectedArtist,
    setSelectedArtist
  } = usePlayerStore();

  const [artistSearch, setArtistSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'tracks-desc' | 'name-asc' | 'collabs-desc'>('tracks-desc');

  const allArtists = useMemo(() => getAllArtists(), []);

  // Collect unique genres
  const allGenres = useMemo(() => {
    const s = new Set<string>();
    for (const a of allArtists) {
      for (const g of a.genres) {
        if (g) s.add(g);
      }
    }
    return ['All', ...Array.from(s).sort()];
  }, [allArtists]);

  // Filtered artists list
  const filteredArtists = useMemo(() => {
    let list = allArtists;

    if (selectedGenre !== 'All') {
      list = list.filter((a) => a.genres.includes(selectedGenre));
    }

    if (artistSearch.trim()) {
      const q = artistSearch.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    const sorted = [...list];
    if (sortBy === 'tracks-desc') {
      sorted.sort((a, b) => b.totalTracks - a.totalTracks);
    } else if (sortBy === 'name-asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'collabs-desc') {
      sorted.sort((a, b) => b.collabCount - a.collabCount);
    }

    return sorted;
  }, [allArtists, artistSearch, selectedGenre, sortBy]);

  // If an artist profile is selected, fetch their tracks
  const activeArtistProfile = useMemo(() => {
    if (!selectedArtist) return null;
    return allArtists.find((a) => a.name.toLowerCase() === selectedArtist.toLowerCase()) || null;
  }, [selectedArtist, allArtists]);

  const artistTracks = useMemo(() => {
    if (!selectedArtist) return [];
    return getTracksByArtist(selectedArtist);
  }, [selectedArtist]);

  const totalArtistDurationMins = useMemo(() => {
    const totalSecs = artistTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    return Math.round(totalSecs / 60);
  }, [artistTracks]);

  // Split into primary tracks and collaborations
  const primaryTracks = useMemo(() => {
    if (!selectedArtist) return [];
    const clean = selectedArtist.toLowerCase();
    return artistTracks.filter(
      (t) => (t.primaryArtist || t.artist).toLowerCase() === clean
    );
  }, [artistTracks, selectedArtist]);

  const collabTracks = useMemo(() => {
    if (!selectedArtist) return [];
    const clean = selectedArtist.toLowerCase();
    return artistTracks.filter(
      (t) => (t.primaryArtist || t.artist).toLowerCase() !== clean
    );
  }, [artistTracks, selectedArtist]);

  // =========================================================================
  // VIEW: INDIVIDUAL ARTIST PROFILE
  // =========================================================================
  if (activeArtistProfile) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 animate-in fade-in duration-200">
        {/* Back Button */}
        <button
          onClick={() => setSelectedArtist(null)}
          className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-[#00FFA3] transition-colors w-fit group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Artists</span>
        </button>

        {/* Artist Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-[#1A1F2C] p-6 md:p-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 bg-[#0E1117]/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {/* Blurred Background Artwork Vignette */}
          <div
            className="absolute inset-0 opacity-20 blur-3xl pointer-events-none scale-125"
            style={{
              backgroundImage: `url(${activeArtistProfile.artworkUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-transparent pointer-events-none" />

          {/* Left: Avatar & Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 z-10">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(0,255,163,0.25)] flex-shrink-0 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeArtistProfile.artworkUrl}
                alt={activeArtistProfile.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
                <span className="text-[10px] font-mono text-[#00FFA3] tracking-wider uppercase font-semibold">
                  Verified Artist Profile
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                {activeArtistProfile.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[#94A3B8]">
                <span>{artistTracks.length} tracks</span>
                <span>•</span>
                <span>~{totalArtistDurationMins} mins</span>
                {activeArtistProfile.genres.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-[#00E5FF]">{activeArtistProfile.genres.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Master Launch Button */}
          <div className="flex items-center gap-3 z-10 w-full sm:w-auto">
            <button
              onClick={() => playAllTracks(artistTracks)}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-full bg-[#00FFA3] text-[#060709] font-mono text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,255,163,0.4)] flex items-center justify-center gap-2"
            >
              <Play size={15} fill="currentColor" />
              <span>Play All ({artistTracks.length})</span>
            </button>
          </div>
        </div>

        {/* Tracks Section */}
        <div className="flex flex-col gap-8">
          {/* 1. Primary Artist Catalog */}
          {primaryTracks.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#1A1F2C] pb-3">
                <div className="flex items-center gap-2">
                  <Music size={16} className="text-[#00FFA3]" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Primary Releases ({primaryTracks.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#64748B]">Folder: /music/Artists/{activeArtistProfile.folder}</span>
              </div>

              <div className="flex flex-col divide-y divide-[#1A1F2C]/60 bg-[#0E1117]/50 rounded-2xl border border-[#1A1F2C] overflow-hidden">
                {primaryTracks.map((track, i) => {
                  const isCurrent = currentTrack.id === track.id;
                  const isTrackPlaying = isCurrent && isPlaying;
                  const isTrackLiked = likedSongs.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (track.isVideo) {
                          openVideoPlayer(track);
                        } else {
                          setTrack(track);
                        }
                      }}
                      className={`group flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.04] transition-all cursor-pointer ${
                        isCurrent ? 'bg-white/[0.06] border-l-2 border-l-[#00FFA3]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                        <span className="w-5 text-center text-xs font-mono text-[#64748B] group-hover:hidden">
                          {(i + 1).toString().padStart(2, '0')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (track.isVideo) {
                              openVideoPlayer(track);
                            } else {
                              if (isCurrent) togglePlay();
                              else setTrack(track);
                            }
                          }}
                          className="w-5 text-center text-white hidden group-hover:flex items-center justify-center"
                        >
                          {isTrackPlaying ? (
                            <Pause size={13} fill="currentColor" className="text-[#00FFA3]" />
                          ) : (
                            <Play size={13} fill="currentColor" />
                          )}
                        </button>

                        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={track.artworkUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          {track.isVideo && (
                            <div className="absolute top-1 right-1 bg-black/70 rounded p-0.5 text-white">
                              <Film size={10} />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isCurrent ? 'text-[#00FFA3]' : 'text-white group-hover:text-white'
                            }`}
                          >
                            {track.title}
                          </span>
                          <span className="text-xs font-mono text-[#64748B] truncate">
                            {track.movieOrAlbum ? `${track.movieOrAlbum} • ` : ''}
                            {track.genre}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono border border-white/10 text-[#94A3B8]">
                          {track.quality || (track.isVideo ? '1080P HD' : '320K MP3')}
                        </span>

                        <span className="text-xs font-mono text-[#64748B] w-12 text-right">
                          {formatDuration(track.duration)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isTrackLiked
                              ? 'text-[#FF0055]'
                              : 'text-[#64748B] hover:text-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Heart size={14} fill={isTrackLiked ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackToAddToPlaylist(track);
                            setPlaylistModalOpen(true);
                          }}
                          className="p-1.5 text-[#64748B] hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                          title="Add to playlist"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Featured Collaborations & Co-Credits */}
          {collabTracks.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#1A1F2C] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#00E5FF]" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                    Featured In & Collaborations ({collabTracks.length})
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#64748B]">Cross-referenced library tracks</span>
              </div>

              <div className="flex flex-col divide-y divide-[#1A1F2C]/60 bg-[#0E1117]/50 rounded-2xl border border-[#1A1F2C] overflow-hidden">
                {collabTracks.map((track, i) => {
                  const isCurrent = currentTrack.id === track.id;
                  const isTrackPlaying = isCurrent && isPlaying;
                  const isTrackLiked = likedSongs.includes(track.id);

                  return (
                    <div
                      key={track.id}
                      onClick={() => {
                        if (track.isVideo) {
                          openVideoPlayer(track);
                        } else {
                          setTrack(track);
                        }
                      }}
                      className={`group flex items-center justify-between p-3.5 sm:p-4 hover:bg-white/[0.04] transition-all cursor-pointer ${
                        isCurrent ? 'bg-white/[0.06] border-l-2 border-l-[#00E5FF]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1 pr-4">
                        <span className="w-5 text-center text-xs font-mono text-[#64748B] group-hover:hidden">
                          {(i + 1).toString().padStart(2, '0')}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (track.isVideo) {
                              openVideoPlayer(track);
                            } else {
                              if (isCurrent) togglePlay();
                              else setTrack(track);
                            }
                          }}
                          className="w-5 text-center text-white hidden group-hover:flex items-center justify-center"
                        >
                          {isTrackPlaying ? (
                            <Pause size={13} fill="currentColor" className="text-[#00E5FF]" />
                          ) : (
                            <Play size={13} fill="currentColor" />
                          )}
                        </button>

                        <div className="relative w-11 h-11 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={track.artworkUrl}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          {track.isVideo && (
                            <div className="absolute top-1 right-1 bg-black/70 rounded p-0.5 text-white">
                              <Film size={10} />
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isCurrent ? 'text-[#00E5FF]' : 'text-white group-hover:text-white'
                            }`}
                          >
                            {track.title}
                          </span>
                          <span className="text-xs font-mono text-[#64748B] truncate">
                            Lead: {track.artist} • {track.movieOrAlbum || track.genre}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-mono text-[#64748B] w-12 text-right">
                          {formatDuration(track.duration)}
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isTrackLiked
                              ? 'text-[#FF0055]'
                              : 'text-[#64748B] hover:text-white opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          <Heart size={14} fill={isTrackLiked ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackToAddToPlaylist(track);
                            setPlaylistModalOpen(true);
                          }}
                          className="p-1.5 text-[#64748B] hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                          title="Add to playlist"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: ALL ARTISTS GRID
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1A1F2C] pb-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
            <span className="text-[10px] font-mono text-[#00FFA3] uppercase tracking-wider font-semibold">
              Music Vault // 35 Verified Artists
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Artists & Creators
          </h1>
          <p className="text-xs md:text-sm font-mono text-[#94A3B8]">
            Browse your organized local library by verified artist. Click any artist to view all primary tracks and collaborative releases.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={artistSearch}
            onChange={(e) => setArtistSearch(e.target.value)}
            placeholder="Search artists..."
            className="w-full bg-[#0E1117] border border-[#1A1F2C] focus:border-[#00FFA3] rounded-full pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Filter and Sorting Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Genre Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none max-w-2xl">
          {allGenres.slice(0, 8).map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all whitespace-nowrap ${
                selectedGenre === genre
                  ? 'bg-white text-[#060709] font-bold shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                  : 'bg-[#0E1117] text-[#94A3B8] border border-[#1A1F2C] hover:text-white hover:border-white/20'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8]">
          <SlidersHorizontal size={13} className="text-[#64748B]" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#0E1117] border border-[#1A1F2C] text-white rounded-lg px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#00FFA3]"
          >
            <option value="tracks-desc">Most Tracks</option>
            <option value="name-asc">Artist Name (A-Z)</option>
            <option value="collabs-desc">Most Collaborations</option>
          </select>
        </div>
      </div>

      {/* Artists Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {filteredArtists.map((artist) => {
          return (
            <div
              key={artist.name}
              onClick={() => setSelectedArtist(artist.name)}
              className="group flex flex-col p-3 rounded-2xl bg-[#0E1117]/80 hover:bg-[#141822] border border-[#1A1F2C] hover:border-[#00FFA3]/40 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-[0_15px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(0,255,163,0.15)] hover:-translate-y-1 relative"
            >
              {/* Artwork Container */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/10 mb-3 bg-[#060709]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={artist.artworkUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Hover Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const tracks = getTracksByArtist(artist.name);
                    playAllTracks(tracks);
                  }}
                  className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-[#00FFA3] text-[#060709] flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.5)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200"
                  title={`Play all songs by ${artist.name}`}
                >
                  <Play size={14} fill="currentColor" />
                </button>
              </div>

              {/* Artist Name & Stats */}
              <h3 className="text-sm font-bold text-white group-hover:text-[#00FFA3] transition-colors truncate">
                {artist.name}
              </h3>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] mt-1">
                <span>
                  {artist.trackCount} {artist.trackCount === 1 ? 'song' : 'songs'}
                </span>
                {artist.collabCount > 0 && (
                  <span className="text-[#00E5FF]">+{artist.collabCount} feat</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredArtists.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <Users size={32} className="text-[#64748B]" />
          <p className="text-sm font-mono text-[#94A3B8]">No artists found matching "{artistSearch}"</p>
          <button
            onClick={() => {
              setArtistSearch('');
              setSelectedGenre('All');
            }}
            className="text-xs font-mono text-[#00FFA3] hover:underline"
          >
            Clear search filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ArtistsView;
