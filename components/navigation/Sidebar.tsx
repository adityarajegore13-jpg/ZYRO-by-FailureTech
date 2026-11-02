'use client';

/**
 * ZYRO by FailureTech — Desktop Persistent Left Navigation
 * Houses brand identity, main navigation tabs, user custom playlists,
 * and quick-create actions.
 */

import React from 'react';
import {
  Compass,
  Search,
  Library,
  Heart,
  FolderPlus,
  Radio,
  Flame,
  Music,
  Disc3,
  Sliders,
  Users
} from 'lucide-react';
import { usePlayerStore, AppNavTab } from '@/stores/usePlayerStore';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setSelectedArtist,
    likedSongs,
    playlists,
    playPlaylist,
    setPlaylistModalOpen
  } = usePlayerStore();

  const navItems: { tab: AppNavTab; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { tab: 'feed', label: 'Stream & Orbit', icon: <Compass size={18} /> },
    { tab: 'search', label: 'Search & Explore', icon: <Search size={18} /> },
    { tab: 'artists', label: 'Artists Vault', icon: <Users size={18} />, badge: 35 },
    { tab: 'library', label: 'Your Library', icon: <Library size={18} /> },
    {
      tab: 'liked',
      label: 'Liked Frequencies',
      icon: <Heart size={18} />,
      badge: likedSongs.length > 0 ? likedSongs.length : undefined
    }
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col justify-between h-screen sticky top-0 bg-[#060709] border-r border-[#1A1F2C] p-5 z-30 select-none">
      <div className="flex flex-col gap-8">
        {/* Brand Header */}
        <div
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.25)] group-hover:scale-105 transition-all">
            <Radio size={18} className="text-[#00FFA3]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-xl tracking-wider text-white">
                ZYRO
              </span>
              <span className="text-[9px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/30 px-1 py-0.2 rounded uppercase">
                v2.4
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#64748B] tracking-wider uppercase">
              by FailureTech
            </span>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider px-3 mb-1">
            Menu
          </span>
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/15 shadow-[0_0_15px_rgba(0,255,163,0.1)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#00FFA3]' : 'text-[#64748B]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Custom Playlists Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider">
              Playlists ({playlists.length})
            </span>
            <button
              onClick={() => setPlaylistModalOpen(true)}
              className="p-1 text-[#94A3B8] hover:text-[#00FFA3] transition-colors"
              title="Create new playlist"
            >
              <FolderPlus size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => {
                  setActiveTab('library');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono text-[#94A3B8] hover:text-white hover:bg-white/5 text-left group transition-all"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Disc3 size={13} className="text-[#64748B] group-hover:text-[#00E5FF] flex-shrink-0" />
                  <span className="truncate">{playlist.name}</span>
                </div>
                <span className="text-[10px] text-[#64748B] flex-shrink-0">
                  {playlist.trackIds.length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer System Telemetry Status */}
      <div className="pt-4 border-t border-[#1A1F2C] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B]">
          <span className="flex items-center gap-1.5 text-[#00FFA3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
            ONLINE
          </span>
          <span>1411K PCM</span>
        </div>
        <div className="text-[10px] font-mono text-[#64748B] truncate">
          Engine: Zero-G HRTF Binaural
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
