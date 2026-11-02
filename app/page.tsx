'use client';

/**
 * ZYRO by FailureTech — Next-Gen Music Streaming Web App
 * Desktop persistent sidebar + center content feed + mobile bottom navigation,
 * dynamic tabs (Stream, Search, Library, Liked), 3 horizontal carousels,
 * Bollywood Vault, and local browser persistence.
 */

import React, { useState } from 'react';
import {
  Play,
  Pause,
  Search,
  Radio,
  Sliders,
  Sparkles,
  Zap,
  Disc3,
  Heart,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePlayerStore, AppNavTab } from '@/stores/usePlayerStore';
import { Sidebar } from '@/components/navigation/Sidebar';
import { MobileNav } from '@/components/navigation/MobileNav';
import { HomeFeed } from '@/components/discovery/HomeFeed';
import { SearchView } from '@/components/search/SearchView';
import { LibraryView } from '@/components/library/LibraryView';
import { ArtistsView } from '@/components/artists/ArtistsView';
import { BollywoodCrates } from '@/components/discovery/BollywoodCrates';
import { HybridFeed } from '@/components/discovery/HybridFeed';
import { PlaylistModal } from '@/components/library/PlaylistModal';
import { VideoModal } from '@/components/video/VideoModal';

export default function HomePage() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    activeTab,
    setActiveTab,
    toastMessage,
    showToast
  } = usePlayerStore();

  const [headerSearchInput, setHeaderSearchInput] = useState('');

  const handleHeaderSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen bg-[#060709] text-[#F1F5F9] flex flex-row w-full selection:bg-[#00FFA3] selection:text-[#060709]">
      {/* =========================================================================
          DESKTOP PERSISTENT LEFT SIDEBAR
          ========================================================================= */}
      <Sidebar />

      {/* =========================================================================
          GLOBAL MODALS & TOAST NOTIFICATION
          ========================================================================= */}
      <PlaylistModal />
      <VideoModal />

      {toastMessage && (
        <div className="fixed bottom-28 md:bottom-28 right-4 md:right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#0E1117]/95 border border-[#00FFA3]/40 text-[#F1F5F9] text-xs font-mono shadow-[0_15px_40px_rgba(0,0,0,0.9),0_0_25px_rgba(0,255,163,0.2)] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          CENTER MAIN CONTENT SCROLLER
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 pb-36 md:pb-32">
        {/* Top Header Bar */}
        <header className="sticky top-0 w-full h-16 md:h-20 z-30 bg-[#060709]/80 backdrop-blur-2xl border-b border-[#1A1F2C] px-4 md:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Brand or Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Mobile Brand Logo */}
            <div
              onClick={() => setActiveTab('feed')}
              className="lg:hidden flex items-center gap-2 cursor-pointer flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#00FFA3]">
                <Radio size={16} />
              </div>
              <span className="font-display font-black text-lg text-white">ZYRO</span>
            </div>

            {/* Quick Header Search Bar */}
            <form onSubmit={handleHeaderSearchSubmit} className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={headerSearchInput}
                onChange={(e) => setHeaderSearchInput(e.target.value)}
                onFocus={() => {
                  if (activeTab !== 'search') setActiveTab('search');
                }}
                placeholder="Search frequencies, artists, Bollywood..."
                className="w-full bg-[#0E1117]/80 border border-[#1A1F2C] hover:border-white/20 focus:border-[#00FFA3] rounded-full pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-[#64748B] focus:outline-none transition-all"
              />
            </form>
          </div>

          {/* Center Navigation Pills (Desktop Only) */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#0E1117]/60 border border-[#1A1F2C]">
            {[
              { tab: 'feed', label: 'Stream' },
              { tab: 'search', label: 'Explore' },
              { tab: 'artists', label: 'Artists' },
              { tab: 'library', label: 'Vault Library' }
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab as AppNavTab)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all ${
                  activeTab === item.tab
                    ? 'bg-white text-[#060709] font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right: Master Launch Orbit Button */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={togglePlay}
              className="px-4 md:px-5 py-2 rounded-full bg-white text-[#060709] text-xs font-mono font-bold hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] flex items-center gap-2"
            >
              {isPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
              <span className="hidden sm:inline-block">
                {isPlaying ? 'Pause Orbit' : 'Launch Orbit'}
              </span>
            </button>
          </div>
        </header>

        {/* =====================================================================
            VIEW 1: SEARCH VIEW
            ===================================================================== */}
        {activeTab === 'search' && <SearchView />}

        {/* =====================================================================
            VIEW 2: ARTISTS VAULT VIEW
            ===================================================================== */}
        {activeTab === 'artists' && <ArtistsView />}

        {/* =====================================================================
            VIEW 3: LIBRARY & LIKED SONGS VIEW
            ===================================================================== */}
        {(activeTab === 'library' || activeTab === 'liked' || activeTab === 'playlists') && (
          <LibraryView />
        )}

        {/* =====================================================================
            VIEW 3: MAIN DISCOVERY STREAM (FEED)
            ===================================================================== */}
        {activeTab === 'feed' && (
          <main className="flex flex-col w-full">
            {/* HERO SECTION */}
            <section id="hero" className="w-full max-w-7xl mx-auto px-4 md:px-6 pt-10 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit">
                  <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse shadow-[0_0_8px_#00FFA3]" />
                  <span className="text-xs font-mono text-[#F1F5F9] tracking-wider uppercase">
                    LIVE ORBIT 01 // 1411 KBPS LOSSLESS PCM
                  </span>
                </div>

                <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white">
                  Zero Friction.<br />
                  <span className="bg-gradient-to-r from-white via-[#00E5FF] to-[#00FFA3] bg-clip-text text-transparent">
                    Pure Sound.
                  </span>
                </h1>

                <p className="text-base md:text-lg text-[#94A3B8] max-w-xl font-normal leading-relaxed">
                  The audio-visual streaming experience by FailureTech. Engineered for Gen Z creators, sonic explorers, and zero-latency spatial fidelity.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    onClick={togglePlay}
                    className="px-7 py-3.5 rounded-full bg-white text-[#060709] font-bold text-sm md:text-base hover:scale-105 active:scale-95 transition-all shadow-[0_0_35px_rgba(255,255,255,0.3),0_0_15px_#00FFA3] flex items-center gap-2.5"
                  >
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    <span>{isPlaying ? 'Pause Playback' : 'Launch Orbit'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('search')}
                    className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/50 text-white font-semibold text-sm backdrop-blur-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.06)] flex items-center gap-2"
                  >
                    <Search size={16} />
                    <span>Explore Frequencies</span>
                  </button>
                </div>

                {/* Telemetry Numbers */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#1A1F2C] max-w-lg">
                  <div>
                    <div className="text-sm md:text-base font-bold font-mono text-white">&lt; 0.18ms</div>
                    <div className="text-[10px] md:text-xs text-[#64748B] uppercase tracking-wider">Neural Latency</div>
                  </div>
                  <div>
                    <div className="text-sm md:text-base font-bold font-mono text-white">360° Binaural</div>
                    <div className="text-[10px] md:text-xs text-[#64748B] uppercase tracking-wider">Spatial Field</div>
                  </div>
                  <div>
                    <div className="text-sm md:text-base font-bold font-mono text-white">24-Bit / 192k</div>
                    <div className="text-[10px] md:text-xs text-[#64748B] uppercase tracking-wider">Direct Master</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Floating Music Card Visual Showcase */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md p-5 md:p-6 rounded-3xl bg-[#0F131A]/80 border border-[#1A1F2C] backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(0,255,163,0.15)] flex flex-col gap-5">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/15 shadow-[0_0_25px_rgba(0,229,255,0.2)] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentTrack.artworkUrl}
                      alt={currentTrack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060709] via-transparent to-transparent opacity-85" />
                    
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[11px] font-mono text-[#00FFA3] font-semibold uppercase truncate block">
                          {currentTrack.category} • {currentTrack.genre}
                        </span>
                        <h3 className="text-lg md:text-xl font-bold text-white tracking-wide truncate">
                          {currentTrack.title}
                        </h3>
                        <p className="text-xs text-[#94A3B8] font-mono truncate">
                          {currentTrack.artist}
                        </p>
                      </div>

                      <button
                        onClick={togglePlay}
                        className="w-12 h-12 rounded-full bg-white text-[#060709] flex-shrink-0 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(255,255,255,0.6)]"
                      >
                        {isPlaying ? (
                          <Pause size={20} fill="currentColor" />
                        ) : (
                          <Play size={20} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] border-t border-white/10 pt-3">
                    <span>Bitrate: {currentTrack.bitrate || '1411 KBPS PCM'}</span>
                    <span>BPM: {currentTrack.bpm}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* HYBRID MUSIC ENGINE STREAM VAULT (JIOSAAVN & AUDIUS) */}
            <HybridFeed />

            {/* HOME FEED DISCOVERY (CATEGORY FILTER & CAROUSELS) */}
            <HomeFeed />

            {/* DEDICATED DESI RESONANCE / BOLLYWOOD VAULT SECTION */}
            <BollywoodCrates />

            {/* REAL-TIME DSP ENGINE (AUDIO LAB) */}
            <section id="sound-lab" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16">
              <div className="p-6 md:p-10 rounded-3xl bg-[#0F131A]/70 border border-[#1A1F2C] backdrop-blur-2xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div className="flex flex-col gap-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit text-xs font-mono text-[#00FFA3]">
                    <Sliders size={13} className="text-[#00FFA3]" />
                    <span>REAL-TIME DSP SCULPTOR</span>
                  </div>
                  <h3 className="font-display text-2xl md:text-4xl font-extrabold text-white">
                    Zero-G Sound Sculptor
                  </h3>
                  <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed">
                    Tweak live frequency harmonics, filter cutoff envelopes, and sub-bass resonance in real-time. Experience audio directly mapped to your senses.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                    <span className="text-xs text-white font-medium">Sub-Bass Boost</span>
                    <input type="range" min="0.5" max="2.5" step="0.1" defaultValue="1.0" className="w-full cursor-pointer accent-[#00FFA3]" />
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                    <span className="text-xs text-white font-medium">Lowpass Cutoff</span>
                    <input type="range" min="800" max="8000" step="100" defaultValue="3500" className="w-full cursor-pointer accent-[#00FFA3]" />
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                    <span className="text-xs text-white font-medium">Spatial 360 Width</span>
                    <input type="range" min="0.2" max="1.0" step="0.05" defaultValue="0.8" className="w-full cursor-pointer accent-[#00FFA3]" />
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                    <span className="text-xs text-white font-medium">High Treble Clarity</span>
                    <input type="range" min="0.5" max="2.0" step="0.1" defaultValue="1.0" className="w-full cursor-pointer accent-[#00FFA3]" />
                  </div>
                </div>
              </div>
            </section>

            {/* LIVE ORBIT ROOMS */}
            <section id="live-rooms" className="w-full max-w-7xl mx-auto px-4 md:px-6 py-16">
              <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-3">
                <span className="text-xs font-mono text-[#00E5FF] tracking-widest uppercase">
                  COMMUNAL SYNAPSE // DEMONSTRATION
                </span>
                <h2 className="font-display text-3xl md:text-5xl font-extrabold text-white">
                  Live Orbit Rooms
                </h2>
                <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed">
                  Interactive demonstration of synchronized spatial audio spaces across global creator hubs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-[#0E1117]/80 border border-[#1A1F2C] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#00FFA3] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
                      2,410 LISTENERS
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] border border-white/10 px-1.5 py-0.5 rounded">SIMULATED</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Shibuya Cyber Drift</h4>
                    <p className="text-xs text-[#94A3B8] font-mono">Playing: Midnight Protocol (130 BPM)</p>
                  </div>
                  <button
                    onClick={() => showToast('CONNECTING // Synchronizing to "Shibuya Cyber Drift" [Demo]')}
                    className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white text-white hover:text-[#060709] font-mono text-xs border border-white/20 transition-all"
                  >
                    Enter Demo Room
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#0E1117]/80 border border-[#1A1F2C] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#00FFA3] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
                      840 LISTENERS
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] border border-white/10 px-1.5 py-0.5 rounded">SIMULATED</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">FailureTech Alpha Lab</h4>
                    <p className="text-xs text-[#94A3B8] font-mono">Testing: 3D Zero-G Binaural v3.0</p>
                  </div>
                  <button
                    onClick={() => showToast('CONNECTING // Synchronizing to "FailureTech Alpha Lab" [Demo]')}
                    className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white text-white hover:text-[#060709] font-mono text-xs border border-white/20 transition-all"
                  >
                    Enter Demo Room
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#0E1117]/80 border border-[#1A1F2C] flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#00FFA3] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
                      5,120 LISTENERS
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] border border-white/10 px-1.5 py-0.5 rounded">SIMULATED</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Mumbai Desi Underground</h4>
                    <p className="text-xs text-[#94A3B8] font-mono">Playing: Zingaat Ultra Phonk</p>
                  </div>
                  <button
                    onClick={() => showToast('CONNECTING // Synchronizing to "Mumbai Desi Underground" [Demo]')}
                    className="w-full py-2.5 rounded-full bg-white/5 hover:bg-white text-white hover:text-[#060709] font-mono text-xs border border-white/20 transition-all"
                  >
                    Enter Demo Room
                  </button>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="w-full border-t border-[#1A1F2C] bg-[#060709] py-12 px-6 mt-12">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-lg text-white">ZYRO</span>
                  <span className="text-xs text-[#94A3B8]">by FailureTech Inc. © 2026</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-[#00FFA3]">
                  <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
                  <span>ALL SYSTEMS NOMINAL // ORBIT ONLINE</span>
                </div>
              </div>
            </footer>
          </main>
        )}
      </div>

      {/* =========================================================================
          MOBILE BOTTOM NAVIGATION (TOUCH OPTIMIZED)
          ========================================================================= */}
      <MobileNav />
    </div>
  );
}
