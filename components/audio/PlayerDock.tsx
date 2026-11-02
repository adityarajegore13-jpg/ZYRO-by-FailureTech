'use client';

/**
 * ZYRO by FailureTech — Production Grade Player Dock Component
 * Signature glassmorphism styling, responsive layout (Desktop + Mobile),
 * interactive scrubbing, volume persistence, liked songs toggle, and queue drawer.
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Plus,
  X,
  Radio,
  Trash2,
  Film
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { NowPlayingModal } from '@/components/player/NowPlayingModal';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const PlayerDock: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolume,
    toggleMute,
    queue,
    removeFromQueue,
    clearQueue,
    likedSongs,
    toggleLike,
    setPlaylistModalOpen,
    setTrackToAddToPlaylist,
    openVideoPlayer
  } = usePlayerStore();

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isCurrentLiked = likedSongs.includes(currentTrack.id);

  const handleOpenAddToPlaylist = () => {
    setTrackToAddToPlaylist(currentTrack);
    setPlaylistModalOpen(true);
  };

  return (
    <>
      {/* =========================================================================
          QUEUE DRAWER / POPOVER
          ========================================================================= */}
      {isQueueOpen && (
        <div className="fixed bottom-28 md:bottom-28 right-4 md:right-8 z-50 w-80 md:w-96 max-h-96 rounded-2xl bg-[#0E1117]/95 border border-[#1A1F2C] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(0,255,163,0.12)] p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-[#1A1F2C] pb-2">
            <div className="flex items-center gap-2">
              <ListMusic size={16} className="text-[#00FFA3]" />
              <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                Playing Queue ({queue.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              {queue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="text-[10px] font-mono text-[#94A3B8] hover:text-red-400 flex items-center gap-1 transition-colors"
                  title="Clear all queued songs"
                >
                  <Trash2 size={12} />
                  <span>Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsQueueOpen(false)}
                className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-72 pr-1 scrollbar-thin">
            {queue.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#64748B] flex flex-col items-center gap-2">
                <ListMusic size={24} className="opacity-40" />
                <span>Queue is empty. Click &quot;+ Queue&quot; on any card to add songs.</span>
              </div>
            ) : (
              queue.map((track, idx) => (
                <div
                  key={`${track.id}-${idx}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 group transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono text-[#64748B] w-4 text-center">
                      {idx + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#060709] flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={track.artworkUrl} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate max-w-[160px]">
                        {track.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8] truncate max-w-[160px]">
                        {track.artist}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromQueue(idx)}
                    className="p-1 text-[#64748B] hover:text-red-400 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove from queue"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          FLOATING PLAYER DOCK
          ========================================================================= */}
      <aside
        className="fixed bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] md:w-[calc(100%-3rem)] max-w-5xl z-50 rounded-2xl p-3 md:px-6 md:py-3.5 transition-all duration-300 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
        style={{
          backgroundColor: 'rgba(10, 12, 16, 0.94)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid #1A1F2C',
          boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(0,255,163,0.12)'
        }}
        aria-label="ZYRO Music Player Dock"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4">
          
          {/* Left: Track Information & Artwork (Click to expand 3D Now Playing) */}
          <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
            <div
              onClick={() => setIsNowPlayingOpen(true)}
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
              title="Expand Now Playing (3D View)"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsNowPlayingOpen(true);
                }
              }}
            >
              <div
                className="w-11 h-11 md:w-12 md:h-12 rounded-xl overflow-hidden flex-shrink-0 relative border border-[#1A1F2C] shadow-[0_0_15px_rgba(0,229,255,0.2)] group"
                style={{ backgroundColor: '#060709' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="text-xs md:text-sm font-bold text-[#F1F5F9] truncate tracking-wide"
                    title={currentTrack.title}
                  >
                    {currentTrack.title}
                  </span>
                  {currentTrack.movieOrAlbum && (
                    <span
                      className="text-[9px] md:text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 px-1.5 py-0.2 rounded flex-shrink-0 truncate max-w-[90px] md:max-w-[130px]"
                      title={currentTrack.movieOrAlbum}
                    >
                      {currentTrack.movieOrAlbum}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 min-w-0 mt-0.5">
                  <span
                    className="text-[11px] md:text-xs text-[#94A3B8] truncate font-mono"
                    title={currentTrack.artist}
                  >
                    {currentTrack.artist}
                  </span>
                  <span className="text-[9px] text-[#00FFA3] font-mono tracking-wider uppercase truncate hidden sm:inline-block">
                    • {currentTrack.genre}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Heart & Add to Playlist) */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggleLike(currentTrack.id)}
                className={`p-1.5 rounded-lg transition-all ${
                  isCurrentLiked
                    ? 'text-[#00FFA3] drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]'
                    : 'text-[#64748B] hover:text-white hover:bg-white/5'
                }`}
                title={isCurrentLiked ? 'Unlike song' : 'Save to Liked Songs'}
              >
                <Heart size={16} fill={isCurrentLiked ? '#00FFA3' : 'none'} />
              </button>

              <button
                onClick={handleOpenAddToPlaylist}
                className="p-1.5 text-[#64748B] hover:text-white hover:bg-white/5 rounded-lg transition-colors hidden sm:flex"
                title="Add to Playlist"
              >
                <Plus size={16} />
              </button>

              {currentTrack.isVideo && (
                <button
                  onClick={() => openVideoPlayer(currentTrack)}
                  className="px-2 py-1 rounded-lg bg-[#00FFA3]/15 border border-[#00FFA3]/40 text-[#00FFA3] hover:bg-[#00FFA3] hover:text-[#060709] transition-all flex items-center gap-1 text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(0,255,163,0.2)] ml-1"
                  title="Watch Music Video in Theater Mode"
                >
                  <Film size={12} />
                  <span className="hidden sm:inline">Video</span>
                </button>
              )}
            </div>
          </div>

          {/* Center: Transport Controls & Scrubber */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-5/12 max-w-xl">
            {/* Button Row */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* Previous Track */}
              <button
                onClick={prevTrack}
                className="p-1.5 md:p-2 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-full transition-colors"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack size={18} />
              </button>

              {/* Play / Pause Toggle */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-white text-[#060709] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.4),0_0_12px_#00FFA3]"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>

              {/* Next Track */}
              <button
                onClick={nextTrack}
                className="p-1.5 md:p-2 text-[#94A3B8] hover:text-white hover:bg-white/5 rounded-full transition-colors"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Timeline Scrubber Row */}
            <div className="flex items-center gap-2.5 w-full">
              <span className="text-[10px] md:text-[11px] font-mono text-[#94A3B8] w-9 text-right select-none">
                {formatTime(currentTime)}
              </span>

              <div className="relative flex-1 flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={duration || 32}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none bg-white/10 cursor-pointer focus:outline-none accent-[#00FFA3]"
                  style={{
                    background: `linear-gradient(to right, #00FFA3 0%, #00E5FF ${progressPercent}%, rgba(255,255,255,0.12) ${progressPercent}%, rgba(255,255,255,0.12) 100%)`
                  }}
                  aria-label="Playback scrubber"
                />
              </div>

              <span className="text-[10px] md:text-[11px] font-mono text-[#94A3B8] w-9 text-left select-none">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Telemetry, Queue Button & Volume Controls */}
          <div className="flex items-center justify-end gap-3 w-full md:w-1/4">
            {/* Queue Toggle Button */}
            <button
              onClick={() => setIsQueueOpen((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all text-xs font-mono ${
                isQueueOpen || queue.length > 0
                  ? 'text-[#00FFA3] bg-[#00FFA3]/10 border-[#00FFA3]/30 shadow-[0_0_10px_rgba(0,255,163,0.15)]'
                  : 'text-[#94A3B8] border-white/10 hover:border-white/30 hover:text-white'
              }`}
              title="Toggle Queue"
            >
              <ListMusic size={14} />
              <span>{queue.length > 0 ? `${queue.length}` : 'Queue'}</span>
            </button>

            {/* Spatial indicator badge */}
            <div className="hidden xl:flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-frost">
              <Radio size={10} className="text-[#00FFA3] animate-pulse" />
              <span>360°</span>
            </div>

            {/* Volume Group */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-14 md:w-20 h-1 rounded-full appearance-none bg-white/10 cursor-pointer focus:outline-none accent-white"
                aria-label="Volume slider"
              />
            </div>
          </div>

        </div>
      </aside>

      {/* Full-Screen 3D Gen Z Now Playing Modal */}
      <NowPlayingModal
        isOpen={isNowPlayingOpen}
        onClose={() => setIsNowPlayingOpen(false)}
      />
    </>
  );
};

export default PlayerDock;
