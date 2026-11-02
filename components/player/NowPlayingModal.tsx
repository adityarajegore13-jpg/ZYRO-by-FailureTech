'use client';

/**
 * ZYRO by FailureTech — Aesthetic "Now Playing" Modal
 * Full-screen expanded view with Gen Z mood: chill, moody, sleek, and atmospheric.
 * Features:
 * - Minimalist 3D fluid mesh waves backdrop (Visualizer3D)
 * - Floating vinyl-square artwork with rounded-3xl corners & ambient cover drop-shadow
 * - Clean vinyl-spin toggle option (smooth 360° groove rotation)
 * - Modern Gen Z typography with bold title, muted artist, and 'HQ 320K' badge
 * - Ultra-clean frost cards (backdrop-blur-2xl, 1px border rgba(255, 255, 255, 0.08))
 * - Sleek scrub bar with glowing mint playhead
 * - Tactile Play/Pause button with soft neon bloom
 * - Neatly aligned Shuffle, Like (❤️), and Close/Minimize (↓) controls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ChevronDown,
  Volume2,
  VolumeX,
  Disc3,
  Sparkles,
  Radio,
  Sliders
} from 'lucide-react';
import { create } from 'zustand';
import { usePlayerStore } from '@/stores/usePlayerStore';
import { Visualizer3D } from './Visualizer3D';

// Standalone Modal State Store for zero-config global triggering
interface NowPlayingModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useNowPlayingModal = create<NowPlayingModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen }))
}));

export interface NowPlayingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose
}) => {
  const modalStore = useNowPlayingModal();
  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : modalStore.isOpen;

  const handleClose = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      modalStore.close();
    }
  };

  // Global Player Store Integration
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
    likedSongs,
    toggleLike
  } = usePlayerStore();

  // Local UI Modes
  const [isVinylMode, setIsVinylMode] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const isCurrentLiked = likedSongs.includes(currentTrack.id);

  // Keyboard shortcut listener (Escape to close) & custom event triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };

    const handleOpenEvent = () => modalStore.open();
    const handleCloseEvent = () => modalStore.close();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('zyro:open-now-playing', handleOpenEvent);
    window.addEventListener('zyro:close-now-playing', handleCloseEvent);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('zyro:open-now-playing', handleOpenEvent);
      window.removeEventListener('zyro:close-now-playing', handleCloseEvent);
    };
  }, [isModalOpen, modalStore]);

  // Scrub Bar Calculations
  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (displayTime / duration) * 100)) : 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const cycleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#060709] text-[#F1F5F9] select-none animate-in fade-in duration-300"
      style={{
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Now Playing View"
    >
      {/* =========================================================================
          BACKGROUND: 3D MINIMALIST FLUID WAVES CANVAS & ATMOSPHERIC VIGNETTE
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Visualizer3D isPlaying={isPlaying} />
        {/* Soft atmospheric gradient & radial vignette for ultra-clean readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060709]/80 via-[#060709]/40 to-[#060709]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,7,9,0.75)_100%)]" />
      </div>

      {/* =========================================================================
          TOP BAR: MINIMIZE BUTTON, NOW PLAYING BADGE & VINYL SPIN TOGGLE
          ========================================================================= */}
      <header className="relative z-10 w-full px-5 py-4 sm:px-8 sm:py-6 flex items-center justify-between gap-4">
        {/* Left: Minimize (↓) Button */}
        <button
          onClick={handleClose}
          className="group flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.04] hover:bg-white/[0.1] active:scale-90 border border-white/[0.08] backdrop-blur-2xl transition-all shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
          title="Minimize Now Playing (Esc)"
          aria-label="Minimize Now Playing"
        >
          <ChevronDown
            size={22}
            className="text-[#94A3B8] group-hover:text-white group-hover:translate-y-0.5 transition-all"
          />
        </button>

        {/* Center: Context Breadcrumb */}
        <div className="flex flex-col items-center min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-[#94A3B8]">
              Now Playing
            </span>
          </div>
          <span className="text-xs font-mono text-[#F1F5F9]/70 truncate max-w-[200px] sm:max-w-xs mt-0.5">
            {currentTrack.movieOrAlbum || currentTrack.genre || 'ZYRO Vault Master'}
          </span>
        </div>

        {/* Right: Vinyl Spin Toggle Option */}
        <button
          onClick={() => setIsVinylMode((prev) => !prev)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all border backdrop-blur-2xl ${
            isVinylMode
              ? 'bg-[#00FFA3]/15 text-[#00FFA3] border-[#00FFA3]/40 shadow-[0_0_15px_rgba(0,255,163,0.25)]'
              : 'bg-white/[0.04] text-[#94A3B8] border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
          }`}
          title="Toggle Vinyl Spin Mode"
        >
          <Disc3 size={15} className={isVinylMode && isPlaying ? 'animate-spin' : ''} />
          <span className="hidden sm:inline font-semibold">Vinyl Mode</span>
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              isVinylMode ? 'bg-[#00FFA3] shadow-[0_0_6px_#00FFA3]' : 'bg-white/20'
            }`}
          />
        </button>
      </header>

      {/* =========================================================================
          CENTERPIECE: FLOATING VINYL-SQUARE ARTWORK / SPINNING VINYL DISC
          ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-2 min-h-0">
        <div className="relative flex items-center justify-center">
          {/* Subtle ambient drop-shadow matching the cover colors (#00FFA3 & #00E5FF) */}
          <div
            className={`absolute -inset-6 sm:-inset-10 rounded-full blur-3xl transition-all duration-1000 -z-10 ${
              isPlaying
                ? 'opacity-40 bg-gradient-to-tr from-[#00FFA3]/35 via-[#00E5FF]/25 to-transparent scale-105'
                : 'opacity-20 bg-gradient-to-tr from-[#00FFA3]/20 via-[#00E5FF]/10 to-transparent scale-95'
            }`}
          />

          {!isVinylMode ? (
            /* MODE 1: Floating Vinyl-Square Artwork (rounded-3xl, ambient glow, tactile float) */
            <div
              className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-w-[80vw] max-h-[44vh] rounded-3xl overflow-hidden border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(0,255,163,0.12)] backdrop-blur-2xl transition-transform duration-700 ${
                isPlaying ? 'scale-100 hover:scale-[1.02]' : 'scale-95 opacity-90'
              }`}
            >
              {/* High-res artwork image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />

              {/* Glossy frost glass corner reflection highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] pointer-events-none" />

              {/* Subtle inner border for ultra-crisp edge refinement */}
              <div className="absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10 pointer-events-none" />
            </div>
          ) : (
            /* MODE 2: Vinyl-Spin Disc with Micro-grooves, Center Label & 360° Rotation */
            <div className="relative flex items-center justify-center">
              {/* Peeking Album Jacket Behind */}
              <div className="absolute -left-8 sm:-left-12 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden border border-white/[0.08] opacity-60 shadow-2xl scale-90 -rotate-3 transition-transform pointer-events-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
              </div>

              {/* Vinyl Disc Body */}
              <div
                className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 max-w-[80vw] max-h-[44vh] rounded-full border border-white/[0.08] shadow-[0_30px_70px_rgba(0,0,0,0.95),0_0_35px_rgba(0,255,163,0.18)] flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: '#090B0F',
                  backgroundImage: `
                    radial-gradient(circle at center, transparent 38%, rgba(255, 255, 255, 0.04) 39%, transparent 40%),
                    radial-gradient(circle at center, transparent 48%, rgba(255, 255, 255, 0.03) 49%, transparent 50%),
                    radial-gradient(circle at center, transparent 58%, rgba(255, 255, 255, 0.035) 59%, transparent 60%),
                    radial-gradient(circle at center, transparent 68%, rgba(255, 255, 255, 0.03) 69%, transparent 70%),
                    radial-gradient(circle at center, transparent 78%, rgba(255, 255, 255, 0.04) 79%, transparent 80%),
                    radial-gradient(circle at center, transparent 88%, rgba(255, 255, 255, 0.035) 89%, transparent 90%)
                  `,
                  animation: 'spin 18s linear infinite',
                  animationPlayState: isPlaying ? 'running' : 'paused'
                }}
              >
                {/* Iridescent Specular Sheen (Vinyl Light Reflection) */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none opacity-45"
                  style={{
                    background:
                      'conic-gradient(from 45deg, transparent 0deg, rgba(255,255,255,0.12) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.08) 225deg, transparent 270deg)'
                  }}
                />

                {/* Center Label with Artwork */}
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-white/20 shadow-inner flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={currentTrack.artworkUrl}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover scale-110"
                  />
                  <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px]" />

                  {/* Vinyl Spindle Center Hole */}
                  <div className="absolute w-5 h-5 rounded-full bg-[#060709] border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
          BOTTOM SECTION: TRACK INFO, SCRUB BAR, TRANSPORT CONTROLS & FOOTER
          ========================================================================= */}
      <footer className="relative z-10 w-full max-w-2xl mx-auto px-6 pb-6 sm:pb-8 flex flex-col gap-4">
        
        {/* Track Info Block: Modern Gen Z Minimalist Typography */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col min-w-0">
            {/* Minimal High-Tech Badges */}
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/30 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(0,255,163,0.2)]">
                {currentTrack.quality || 'HQ 320K'}
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-full">
                {currentTrack.genre || 'Electronic'}
              </span>
              {currentTrack.bpm && (
                <span className="text-[10px] font-mono text-[#94A3B8] bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full hidden sm:inline-block">
                  {currentTrack.bpm} BPM
                </span>
              )}
            </div>

            {/* Bold Track Title */}
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#F1F5F9] truncate"
              title={currentTrack.title}
            >
              {currentTrack.title}
            </h2>

            {/* Muted Artist Name */}
            <p
              className="text-sm sm:text-base text-[#64748B] font-medium tracking-tight mt-0.5 truncate"
              title={currentTrack.artist}
            >
              {currentTrack.artist}
            </p>
          </div>

          {/* Like (❤️) Button beside track title for tactile reachability */}
          <button
            onClick={() => toggleLike(currentTrack.id)}
            className={`p-3 rounded-2xl transition-all duration-200 border ${
              isCurrentLiked
                ? 'text-[#00FFA3] bg-[#00FFA3]/10 border-[#00FFA3]/30 drop-shadow-[0_0_12px_rgba(0,255,163,0.5)] scale-105'
                : 'text-[#64748B] hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.08]'
            }`}
            title={isCurrentLiked ? 'Unlike song' : 'Save to Liked Songs'}
            aria-label="Save to Liked Songs"
          >
            <Heart size={22} fill={isCurrentLiked ? '#00FFA3' : 'none'} />
          </button>
        </div>

        {/* Progress Scrub Bar with Glowing Mint Playhead */}
        <div className="flex flex-col gap-1.5 w-full mt-1">
          <div
            ref={scrubberRef}
            onClick={handleScrubberClick}
            onMouseDown={() => setIsScrubbing(true)}
            onMouseUp={() => setIsScrubbing(false)}
            className="group relative w-full h-3 flex items-center cursor-pointer select-none"
            role="slider"
            aria-label="Progress Bar"
            aria-valuenow={currentTime}
            aria-valuemin={0}
            aria-valuemax={duration || 100}
          >
            {/* Background Rail */}
            <div className="w-full h-1 group-hover:h-1.5 rounded-full bg-white/[0.08] overflow-hidden transition-all duration-150">
              {/* Progress Fill (Mint to Cyan Gradient) */}
              <div
                className="h-full rounded-full transition-all duration-75"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(to right, #00FFA3 0%, #00E5FF 100%)'
                }}
              />
            </div>

            {/* Glowing Mint Playhead */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#00FFA3] shadow-[0_0_14px_#00FFA3,0_0_24px_rgba(0,255,163,0.6)] border-2 border-[#060709] transition-transform duration-75 group-hover:scale-125"
              style={{ left: `${progressPercent}%` }}
            />
          </div>

          {/* Time Telemetry */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#94A3B8] px-0.5">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Minimalist, Intuitive Transport Controls Bar */}
        <div className="flex items-center justify-between w-full max-w-lg mx-auto py-2">
          {/* Shuffle Button */}
          <button
            onClick={() => setIsShuffle((prev) => !prev)}
            className={`relative p-2.5 rounded-full transition-all ${
              isShuffle
                ? 'text-[#00FFA3] drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]'
                : 'text-[#64748B] hover:text-white hover:bg-white/[0.05]'
            }`}
            title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
            aria-label="Shuffle"
          >
            <Shuffle size={20} />
            {isShuffle && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00FFA3] shadow-[0_0_4px_#00FFA3]" />
            )}
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-3 text-[#94A3B8] hover:text-white hover:bg-white/[0.06] rounded-full active:scale-95 transition-all"
            title="Previous Track"
            aria-label="Previous Track"
          >
            <SkipBack size={24} />
          </button>

          {/* Tactile Play/Pause Button with Soft Neon Bloom */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#F1F5F9] text-[#060709] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-[0_0_35px_rgba(0,255,163,0.35),0_0_15px_rgba(0,229,255,0.25)] hover:shadow-[0_0_45px_rgba(0,255,163,0.55),0_0_25px_rgba(0,229,255,0.4)]"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause size={26} fill="currentColor" />
            ) : (
              <Play size={26} fill="currentColor" className="ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-3 text-[#94A3B8] hover:text-white hover:bg-white/[0.06] rounded-full active:scale-95 transition-all"
            title="Next Track"
            aria-label="Next Track"
          >
            <SkipForward size={24} />
          </button>

          {/* Repeat Mode Cycle Button */}
          <button
            onClick={cycleRepeat}
            className={`relative p-2.5 rounded-full transition-all ${
              repeatMode !== 'off'
                ? 'text-[#00FFA3] drop-shadow-[0_0_8px_rgba(0,255,163,0.5)]'
                : 'text-[#64748B] hover:text-white hover:bg-white/[0.05]'
            }`}
            title={`Repeat: ${repeatMode.toUpperCase()}`}
            aria-label="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
            {repeatMode !== 'off' && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00FFA3] shadow-[0_0_4px_#00FFA3]" />
            )}
          </button>
        </div>

        {/* Subtle Bottom Utility Bar: Volume Scrubber & Audio Spec */}
        <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-2xl text-xs font-mono text-[#94A3B8]">
          {/* Volume Group */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-[#94A3B8] hover:text-white p-1 rounded transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1 rounded-full appearance-none bg-white/10 cursor-pointer accent-[#00FFA3]"
              aria-label="Volume"
            />
          </div>

          {/* Audio Engine Telemetry */}
          <div className="flex items-center gap-2 text-[10px] tracking-wider uppercase">
            <span className="flex items-center gap-1 text-[#00FFA3]">
              <Radio size={10} className="animate-pulse" />
              <span>360° SPATIAL</span>
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[#94A3B8] hidden sm:inline">LOSSLESS FLAC</span>
          </div>
        </div>

      </footer>
    </div>
  );
};

export default NowPlayingModal;

