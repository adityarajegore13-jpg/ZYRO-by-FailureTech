'use client';

/**
 * ZYRO by FailureTech — Playlist Modal
 * Create new playlists and add selected songs into custom local playlists.
 */

import React, { useState } from 'react';
import { X, Plus, FolderPlus, Check, Music } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

export const PlaylistModal: React.FC = () => {
  const {
    isPlaylistModalOpen,
    setPlaylistModalOpen,
    trackToAddToPlaylist,
    setTrackToAddToPlaylist,
    playlists,
    createPlaylist,
    addTrackToPlaylist
  } = usePlayerStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>(
    playlists.length > 0 && trackToAddToPlaylist ? 'existing' : 'new'
  );

  if (!isPlaylistModalOpen) return null;

  const handleClose = () => {
    setPlaylistModalOpen(false);
    setTrackToAddToPlaylist(null);
    setName('');
    setDescription('');
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialTracks = trackToAddToPlaylist ? [trackToAddToPlaylist.id] : [];
    createPlaylist(name, description, initialTracks);
    handleClose();
  };

  const handleAddToExisting = (playlistId: string) => {
    if (!trackToAddToPlaylist) return;
    addTrackToPlaylist(playlistId, trackToAddToPlaylist.id);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-5 relative border border-[#1A1F2C] shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_35px_rgba(0,255,163,0.15)]"
        style={{
          backgroundColor: 'rgba(14, 17, 23, 0.96)',
          backdropFilter: 'blur(32px)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1F2C] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 flex items-center justify-center text-[#00FFA3]">
              <FolderPlus size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {trackToAddToPlaylist ? 'Add to Playlist' : 'Create Custom Playlist'}
              </h3>
              {trackToAddToPlaylist && (
                <p className="text-xs text-[#94A3B8] font-mono truncate max-w-[240px]">
                  Track: {trackToAddToPlaylist.title}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-[#94A3B8] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch if a track is actively selected */}
        {trackToAddToPlaylist && playlists.length > 0 && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('existing')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'existing'
                  ? 'bg-white/15 text-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Choose Existing
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === 'new'
                  ? 'bg-white/15 text-white font-bold shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Create New
            </button>
          </div>
        )}

        {/* Tab 1: Existing Playlists */}
        {activeTab === 'existing' && trackToAddToPlaylist && playlists.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {playlists.map((playlist) => {
              const hasTrack = playlist.trackIds.includes(trackToAddToPlaylist.id);
              return (
                <button
                  key={playlist.id}
                  onClick={() => !hasTrack && handleAddToExisting(playlist.id)}
                  disabled={hasTrack}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                    hasTrack
                      ? 'bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed'
                      : 'bg-white/[0.04] border-white/10 hover:border-[#00FFA3]/40 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#94A3B8] flex-shrink-0">
                      <Music size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{playlist.name}</h4>
                      <span className="text-[11px] font-mono text-[#94A3B8]">
                        {playlist.trackIds.length} tracks
                      </span>
                    </div>
                  </div>

                  {hasTrack ? (
                    <span className="text-[10px] font-mono text-[#00FFA3] flex items-center gap-1 bg-[#00FFA3]/10 px-2 py-0.5 rounded-full">
                      <Check size={12} /> Added
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#00E5FF]">+ Add</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Tab 2: Create New Playlist Form */
          <form onSubmit={handleCreateNew} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-[#94A3B8]">Playlist Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Late Night Synthwave, Mumbai Desi Vibes"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#00FFA3] transition-colors"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-[#94A3B8]">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short aesthetic description for your sound crate..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-[#64748B] text-sm focus:outline-none focus:border-[#00FFA3] transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-mono text-[#94A3B8] hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-6 py-2.5 rounded-full bg-white text-[#060709] text-xs font-mono font-bold hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Create & Save</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PlaylistModal;
