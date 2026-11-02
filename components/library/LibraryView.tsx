'use client';

/**
 * ZYRO by FailureTech — Local Library & Liked Songs Drawer View
 * Manages favorited tracks, custom playlists, and 20-track listening history
 * entirely on the client side with localStorage persistence.
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  FolderPlus,
  Play,
  Pause,
  Trash2,
  Clock,
  Music,
  Sparkles,
  ArrowLeft,
  ListPlus,
  Share2
} from 'lucide-react';
import { usePlayerStore, Playlist } from '@/stores/usePlayerStore';
import { TRACK_CATALOG, Track } from '@/lib/audio/catalog';

function formatSeconds(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const LibraryView: React.FC = () => {
  const {
    likedSongs,
    playlists,
    history,
    currentTrack,
    isPlaying,
    setTrack,
    togglePlay,
    playAllTracks,
    enqueue,
    toggleLike,
    deletePlaylist,
    removeTrackFromPlaylist,
    playPlaylist,
    setPlaylistModalOpen
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'all' | 'liked' | 'playlists' | 'history'>('all');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  // Derive liked track objects from catalog
  const likedTracks = useMemo(() => {
    return likedSongs
      .map((id) => TRACK_CATALOG.find((t) => t.id === id))
      .filter((t): t is Track => t !== undefined);
  }, [likedSongs]);

  const totalLikedDuration = useMemo(() => {
    const totalSecs = likedTracks.reduce((acc, t) => acc + (t.duration || 0), 0);
    return Math.round(totalSecs / 60);
  }, [likedTracks]);

  const selectedPlaylist = useMemo(() => {
    if (!selectedPlaylistId) return null;
    return playlists.find((p) => p.id === selectedPlaylistId) || null;
  }, [selectedPlaylistId, playlists]);

  const selectedPlaylistTracks = useMemo(() => {
    if (!selectedPlaylist) return [];
    return selectedPlaylist.trackIds
      .map((id) => TRACK_CATALOG.find((t) => t.id === id))
      .filter((t): t is Track => t !== undefined);
  }, [selectedPlaylist]);

  // =========================================================================
  // VIEW: INDIVIDUAL PLAYLIST DETAILS
  // =========================================================================
  if (selectedPlaylist) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8 animate-in fade-in duration-200">
        <button
          onClick={() => setSelectedPlaylistId(null)}
          className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] hover:text-white transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Library</span>
        </button>

        {/* Playlist Banner */}
        <div
          className="p-6 md:p-8 rounded-3xl border border-[#1A1F2C] relative overflow-hidden flex flex-col md:flex-row items-start md:items-end justify-between gap-6"
          style={{
            backgroundColor: 'rgba(14, 17, 23, 0.85)',
            backdropFilter: 'blur(28px)'
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-[#00FFA3]/20 via-[#00E5FF]/20 to-white/5 border border-white/10 flex items-center justify-center text-[#00FFA3] flex-shrink-0 shadow-[0_0_30px_rgba(0,255,163,0.15)]">
              <Music size={48} />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-mono text-[#00FFA3] uppercase tracking-widest">
                CUSTOM LOCAL PLAYLIST
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold font-display text-white">
                {selectedPlaylist.name}
              </h1>
              {selectedPlaylist.description && (
                <p className="text-sm text-[#94A3B8] max-w-xl">{selectedPlaylist.description}</p>
              )}
              <div className="flex items-center gap-3 text-xs font-mono text-[#64748B] pt-1">
                <span>{selectedPlaylistTracks.length} tracks</span>
                <span>•</span>
                <span>Created {new Date(selectedPlaylist.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 z-10 w-full md:w-auto">
            {selectedPlaylistTracks.length > 0 && (
              <button
                onClick={() => playPlaylist(selectedPlaylist.id)}
                className="px-6 py-3 rounded-full bg-white text-[#060709] text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.3)] flex items-center gap-2"
              >
                <Play size={16} fill="currentColor" />
                <span>Play Playlist</span>
              </button>
            )}

            <button
              onClick={() => {
                deletePlaylist(selectedPlaylist.id);
                setSelectedPlaylistId(null);
              }}
              className="p-3 rounded-full bg-white/5 hover:bg-red-500/20 text-[#94A3B8] hover:text-red-400 border border-white/10 hover:border-red-500/40 transition-all"
              title="Delete Playlist"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Playlist Track List */}
        <div className="flex flex-col gap-2">
          {selectedPlaylistTracks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-3">
              <Music size={32} className="text-[#64748B]" />
              <p className="text-sm text-[#94A3B8]">This playlist is empty.</p>
              <span className="text-xs text-[#64748B] font-mono">
                Browse crates or search tracks and click &quot;+&quot; to add songs here.
              </span>
            </div>
          ) : (
            selectedPlaylistTracks.map((track, idx) => {
              const isCurrent = currentTrack.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else setTrack(track);
                  }}
                  className={`p-3 md:px-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                    isCurrent
                      ? 'bg-white/10 border-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.12)]'
                      : 'bg-[#0E1117]/60 border-[#1A1F2C] hover:border-white/20 hover:bg-[#0E1117]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="text-xs font-mono text-[#64748B] w-6 text-center group-hover:hidden">
                      {idx + 1}
                    </span>
                    <button
                      className="w-6 text-[#00FFA3] hidden group-hover:flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) togglePlay();
                        else setTrack(track);
                      }}
                    >
                      {isCurrentPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    </button>

                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-white truncate max-w-xs md:max-w-md">
                        {track.title}
                      </span>
                      <span className="text-xs text-[#94A3B8] font-mono truncate">
                        {track.artist} {track.movieOrAlbum ? `• ${track.movieOrAlbum}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#94A3B8] hidden sm:inline-block">
                      {formatSeconds(track.duration)}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        enqueue(track);
                      }}
                      className="p-1.5 text-[#64748B] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                      title="Add to queue"
                    >
                      <ListPlus size={15} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrackFromPlaylist(selectedPlaylist.id, track.id);
                      }}
                      className="p-1.5 text-[#64748B] hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors"
                      title="Remove from playlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN LIBRARY OVERVIEW
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 w-fit text-xs font-mono text-[#00FFA3]">
            <Sparkles size={13} className="text-[#00FFA3]" />
            <span>LOCAL VAULT STORAGE</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
            Your Sonic Library
          </h1>
          <p className="text-sm md:text-base text-[#94A3B8] max-w-2xl">
            Everything saved in your local browser vault: favorited frequencies, customized playlists, and playback telemetry history.
          </p>
        </div>

        <button
          onClick={() => setPlaylistModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-white text-[#060709] text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-2 w-fit"
        >
          <FolderPlus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1A1F2C] pb-3 overflow-x-auto scrollbar-none">
        {[
          { key: 'all', label: 'All Vault' },
          { key: 'liked', label: `Liked Songs (${likedSongs.length})` },
          { key: 'playlists', label: `Playlists (${playlists.length})` },
          { key: 'history', label: `History (${history.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all flex-shrink-0 ${
              activeTab === tab.key
                ? 'bg-white/15 text-white font-bold border border-white/20 shadow-[0_0_15px_rgba(0,255,163,0.12)]'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Section 1: LIKED SONGS HERO CARD */}
      {(activeTab === 'all' || activeTab === 'liked') && (
        <section className="flex flex-col gap-4">
          <div
            className="p-6 md:p-8 rounded-3xl border border-[#1A1F2C] relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            style={{
              backgroundColor: 'rgba(14, 17, 23, 0.85)',
              backdropFilter: 'blur(28px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.8), 0 0 25px rgba(0,255,163,0.08)'
            }}
          >
            <div className="flex items-center gap-5 z-10">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-[#00FFA3]/30 to-[#00E5FF]/20 border border-[#00FFA3]/40 flex items-center justify-center text-[#00FFA3] flex-shrink-0 shadow-[0_0_25px_rgba(0,255,163,0.3)]">
                <Heart size={36} fill="#00FFA3" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#00FFA3] uppercase tracking-wider">
                  FAVORITED FREQUENCIES
                </span>
                <h3 className="text-xl md:text-3xl font-extrabold text-white">Liked Songs</h3>
                <p className="text-xs md:text-sm text-[#94A3B8] font-mono mt-0.5">
                  {likedTracks.length} tracks • approx. {totalLikedDuration} mins
                </p>
              </div>
            </div>

            {likedTracks.length > 0 && (
              <button
                onClick={() => playAllTracks(likedTracks)}
                className="px-6 py-3 rounded-full bg-[#00FFA3] text-[#060709] text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(0,255,163,0.4)] flex items-center gap-2 z-10"
              >
                <Play size={16} fill="currentColor" />
                <span>Play All Liked</span>
              </button>
            )}
          </div>

          {/* Liked Songs List */}
          {likedTracks.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#64748B] rounded-2xl bg-white/[0.02] border border-white/5">
              No liked songs yet. Tap the heart (❤️) icon on any song to store it here.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {likedTracks.map((track) => {
                const isCurrent = currentTrack.id === track.id;
                const isCurrentPlaying = isCurrent && isPlaying;
                return (
                  <div
                    key={track.id}
                    onClick={() => {
                      if (isCurrent) togglePlay();
                      else setTrack(track);
                    }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                      isCurrent
                        ? 'bg-white/10 border-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.15)]'
                        : 'bg-[#0E1117]/60 border-[#1A1F2C] hover:border-white/20 hover:bg-[#0E1117]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
                        <div
                          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                            isCurrentPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {isCurrentPlaying ? (
                            <Pause size={14} fill="white" className="text-white" />
                          ) : (
                            <Play size={14} fill="white" className="text-white ml-0.5" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate">{track.title}</span>
                        <span className="text-xs text-[#94A3B8] font-mono truncate">{track.artist}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className="p-1.5 text-[#00FFA3] hover:text-[#00FFA3]/70 transition-colors"
                        title="Unlike song"
                      >
                        <Heart size={16} fill="#00FFA3" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          enqueue(track);
                        }}
                        className="p-1.5 text-[#64748B] hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        title="Add to queue"
                      >
                        <ListPlus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Section 2: CUSTOM PLAYLISTS */}
      {(activeTab === 'all' || activeTab === 'playlists') && (
        <section className="flex flex-col gap-4 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white">Custom Playlists</h2>
            <button
              onClick={() => setPlaylistModalOpen(true)}
              className="text-xs font-mono text-[#00FFA3] hover:underline flex items-center gap-1"
            >
              <FolderPlus size={14} />
              <span>+ Create Playlist</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                onClick={() => setSelectedPlaylistId(playlist.id)}
                className="group p-5 rounded-3xl bg-[#0E1117]/80 border border-[#1A1F2C] hover:border-[#00FFA3]/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,163,0.12)] transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FFA3]/20 to-[#00E5FF]/20 border border-white/10 flex items-center justify-center text-[#00FFA3] group-hover:scale-105 transition-transform">
                    <Music size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      {playlist.name}
                    </h3>
                    <p className="text-xs text-[#94A3B8] line-clamp-2 mt-1">
                      {playlist.description || 'Custom user crate.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#1A1F2C] mt-4">
                  <span className="text-xs font-mono text-[#64748B]">
                    {playlist.trackIds.length} tracks
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPlaylist(playlist.id);
                    }}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-[#00FFA3] hover:text-[#060709] transition-all"
                    title="Play playlist"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 3: LISTENING HISTORY (LAST 20 TRACKS) */}
      {(activeTab === 'all' || activeTab === 'history') && (
        <section className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#00E5FF]" />
            <h2 className="text-xl font-bold font-display text-white">Recently Played (Telemetry)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {history.slice(0, 8).map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => setTrack(track)}
                className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/20 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-black flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate">{track.title}</span>
                  <span className="text-[10px] font-mono text-[#94A3B8] truncate">{track.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default LibraryView;
