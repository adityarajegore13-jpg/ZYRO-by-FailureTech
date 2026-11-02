/**
 * ZYRO by FailureTech — Zustand Player Store with LocalStorage Persistence
 * Manages transport controls, queue, 20-track history, liked songs,
 * custom playlists, responsive navigation state, and video player modal.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Track, TRACK_CATALOG, getNextTrack, getPrevTrack } from '@/lib/audio/catalog';

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  trackIds: string[];
  createdAt: string;
  coverUrl?: string;
}

export type AppNavTab = 'feed' | 'search' | 'artists' | 'library' | 'playlists' | 'liked';

export interface PlayerState {
  // Playback Properties
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  seekRequestedTime: number | null;

  // Queue & History
  queue: Track[];
  history: Track[]; // Last 20 played tracks

  // Local Storage Collections
  likedSongs: string[]; // Track IDs
  playlists: Playlist[];

  // Navigation & Modals
  activeTab: AppNavTab;
  selectedArtist: string | null;
  searchQuery: string;
  isPlaylistModalOpen: boolean;
  trackToAddToPlaylist: Track | null;
  toastMessage: string | null;

  // Video Player Modal
  isVideoModalOpen: boolean;
  activeVideoTrack: Track | null;

  // Playback Actions
  setTrack: (track: Track) => void;
  togglePlay: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  seek: (targetTime: number) => void;
  clearSeekRequest: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  playAllTracks: (tracks: Track[]) => void;

  // Queue Actions
  enqueue: (track: Track) => void;
  playNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;

  // Liked Songs Actions
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;

  // Playlist Actions
  createPlaylist: (name: string, description?: string, initialTrackIds?: string[]) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  addTrackToPlaylist: (playlistId: string, trackId: string) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  playPlaylist: (playlistId: string) => void;

  // UI Actions
  setActiveTab: (tab: AppNavTab) => void;
  setSelectedArtist: (artist: string | null) => void;
  setSearchQuery: (query: string) => void;
  setPlaylistModalOpen: (isOpen: boolean) => void;
  setTrackToAddToPlaylist: (track: Track | null) => void;
  setVideoModalOpen: (isOpen: boolean) => void;
  openVideoPlayer: (track?: Track) => void;
  showToast: (msg: string) => void;
}

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-bollywood-essentials',
    name: 'Bollywood Master Vault',
    description: 'All-time romantic anthems, cinematic classics, and acoustic reflections.',
    trackIds: TRACK_CATALOG.slice(0, 8).map((t) => t.id),
    createdAt: new Date().toISOString()
  },
  {
    id: 'pl-high-velocity',
    name: 'Desi Hip-Hop & Phonk Velocity',
    description: 'High-energy Sambata street rap, Moosetape hits, and Yo Yo Honey Singh party singles.',
    trackIds: TRACK_CATALOG.filter((t) => t.category === 'Punjabi' || t.category === 'Marathi' || t.category === 'Singles')
      .slice(0, 8)
      .map((t) => t.id),
    createdAt: new Date().toISOString()
  }
];

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: TRACK_CATALOG[0] || {
        id: 'default-0',
        title: 'Tu Chahiye',
        artist: 'Atif Aslam',
        genre: 'Bollywood',
        src: '',
        artworkUrl: '/artwork/tu-chahiye-bajrangi-bhaijaan-original-motion-picture-soundtrack.jpg',
        duration: 270
      },
      isPlaying: false,
      currentTime: 0,
      duration: TRACK_CATALOG[0]?.duration || 270,
      volume: 0.85,
      isMuted: false,
      seekRequestedTime: null,
      queue: [],
      history: [TRACK_CATALOG[0] || {} as Track],
      likedSongs: TRACK_CATALOG.slice(0, 3).map((t) => t.id),
      playlists: DEFAULT_PLAYLISTS,
      activeTab: 'feed',
      selectedArtist: null,
      searchQuery: '',
      isPlaylistModalOpen: false,
      trackToAddToPlaylist: null,
      toastMessage: null,
      isVideoModalOpen: false,
      activeVideoTrack: null,

      setTrack: (track: Track) => {
        const { history } = get();
        // Prepend to history, deduplicate, max 20
        const updatedHistory = [track, ...history.filter((t) => t.id !== track.id)].slice(0, 20);

        set({
          currentTrack: track,
          currentTime: 0,
          duration: track.duration,
          isPlaying: true,
          seekRequestedTime: 0,
          history: updatedHistory
        });
      },

      togglePlay: () => {
        set((state) => ({ isPlaying: !state.isPlaying }));
      },

      setPlaying: (isPlaying: boolean) => {
        set({ isPlaying });
      },

      setCurrentTime: (time: number) => {
        set({ currentTime: time });
      },

      setDuration: (duration: number) => {
        if (duration > 0 && !isNaN(duration)) {
          set({ duration });
        }
      },

      setVolume: (volume: number) => {
        const clamped = Math.max(0, Math.min(1, volume));
        set({ volume: clamped, isMuted: clamped === 0 });
      },

      toggleMute: () => {
        set((state) => ({ isMuted: !state.isMuted }));
      },

      seek: (targetTime: number) => {
        const clamped = Math.max(0, Math.min(targetTime, get().duration || 32));
        set({
          currentTime: clamped,
          seekRequestedTime: clamped
        });
      },

      clearSeekRequest: () => {
        set({ seekRequestedTime: null });
      },

      nextTrack: () => {
        const { queue, currentTrack, history } = get();

        // 1. Advance through queue if songs exist
        if (queue.length > 0) {
          const [next, ...remainingQueue] = queue;
          const updatedHistory = [next, ...history.filter((t) => t.id !== next.id)].slice(0, 20);
          set({
            currentTrack: next,
            queue: remainingQueue,
            currentTime: 0,
            duration: next.duration,
            isPlaying: true,
            seekRequestedTime: 0,
            history: updatedHistory
          });
          return;
        }

        // 2. Otherwise cycle through catalog
        const next = getNextTrack(currentTrack.id);
        const updatedHistory = [next, ...history.filter((t) => t.id !== next.id)].slice(0, 20);
        set({
          currentTrack: next,
          currentTime: 0,
          duration: next.duration,
          isPlaying: true,
          seekRequestedTime: 0,
          history: updatedHistory
        });
      },

      prevTrack: () => {
        const { currentTime, currentTrack } = get();
        // If > 3 seconds in, restart track
        if (currentTime > 3) {
          set({ currentTime: 0, seekRequestedTime: 0 });
        } else {
          const prev = getPrevTrack(currentTrack.id);
          set({
            currentTrack: prev,
            currentTime: 0,
            duration: prev.duration,
            isPlaying: true,
            seekRequestedTime: 0
          });
        }
      },

      playAllTracks: (tracks: Track[]) => {
        if (tracks.length === 0) return;
        const [first, ...rest] = tracks;
        get().setTrack(first);
        set({ queue: rest });
        get().showToast(`Launched: "${first.title}" + ${rest.length} queued`);
      },

      // Queue Actions
      enqueue: (track: Track) => {
        set((state) => ({
          queue: [...state.queue, track]
        }));
        get().showToast(`Queued // "${track.title}"`);
      },

      playNext: (track: Track) => {
        set((state) => ({
          queue: [track, ...state.queue]
        }));
        get().showToast(`Playing next // "${track.title}"`);
      },

      removeFromQueue: (index: number) => {
        set((state) => ({
          queue: state.queue.filter((_, i) => i !== index)
        }));
      },

      clearQueue: () => {
        set({ queue: [] });
        get().showToast('Queue cleared');
      },

      // Liked Songs
      toggleLike: (trackId: string) => {
        const { likedSongs, showToast } = get();
        const isAlreadyLiked = likedSongs.includes(trackId);
        const updated = isAlreadyLiked
          ? likedSongs.filter((id) => id !== trackId)
          : [...likedSongs, trackId];

        set({ likedSongs: updated });
        const targetTrack = TRACK_CATALOG.find((t) => t.id === trackId);
        const title = targetTrack ? targetTrack.title : 'Track';
        showToast(isAlreadyLiked ? `Removed "${title}" from Liked Songs` : `Saved "${title}" to Liked Songs ❤️`);
      },

      isLiked: (trackId: string) => {
        return get().likedSongs.includes(trackId);
      },

      // Playlist Management
      createPlaylist: (name: string, description?: string, initialTrackIds: string[] = []) => {
        const newPlaylist: Playlist = {
          id: `pl-${Date.now()}`,
          name: name.trim() || 'Untitled Playlist',
          description: description?.trim() || '',
          trackIds: initialTrackIds,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          playlists: [newPlaylist, ...state.playlists]
        }));
        get().showToast(`Playlist created: "${newPlaylist.name}"`);
        return newPlaylist;
      },

      deletePlaylist: (playlistId: string) => {
        const pl = get().playlists.find((p) => p.id === playlistId);
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== playlistId)
        }));
        get().showToast(`Deleted playlist "${pl?.name || ''}"`);
      },

      addTrackToPlaylist: (playlistId: string, trackId: string) => {
        const { playlists, showToast } = get();
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return;

        if (playlist.trackIds.includes(trackId)) {
          showToast(`Track already exists in "${playlist.name}"`);
          return;
        }

        const updatedPlaylists = playlists.map((p) => {
          if (p.id === playlistId) {
            return { ...p, trackIds: [...p.trackIds, trackId] };
          }
          return p;
        });

        set({ playlists: updatedPlaylists });
        showToast(`Added to "${playlist.name}"`);
      },

      removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
        const { playlists, showToast } = get();
        const playlist = playlists.find((p) => p.id === playlistId);
        if (!playlist) return;

        const updatedPlaylists = playlists.map((p) => {
          if (p.id === playlistId) {
            return { ...p, trackIds: p.trackIds.filter((id) => id !== trackId) };
          }
          return p;
        });

        set({ playlists: updatedPlaylists });
        showToast(`Removed from "${playlist.name}"`);
      },

      playPlaylist: (playlistId: string) => {
        const playlist = get().playlists.find((p) => p.id === playlistId);
        if (!playlist || playlist.trackIds.length === 0) {
          get().showToast('Playlist is empty');
          return;
        }

        const tracks = playlist.trackIds
          .map((id) => TRACK_CATALOG.find((t) => t.id === id))
          .filter((t): t is Track => t !== undefined);

        if (tracks.length > 0) {
          get().playAllTracks(tracks);
        }
      },

      // UI State Actions
      setActiveTab: (tab: AppNavTab) => {
        set({ activeTab: tab });
      },

      setSelectedArtist: (artist: string | null) => {
        set({ selectedArtist: artist });
        if (artist) {
          set({ activeTab: 'artists' });
        }
      },

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      setPlaylistModalOpen: (isOpen: boolean) => {
        set({ isPlaylistModalOpen: isOpen });
      },

      setTrackToAddToPlaylist: (track: Track | null) => {
        set({ trackToAddToPlaylist: track });
      },

      // Video Player Actions
      setVideoModalOpen: (isOpen: boolean) => {
        set({ isVideoModalOpen: isOpen });
      },

      openVideoPlayer: (track?: Track) => {
        const target = track || get().currentTrack;
        set({
          activeVideoTrack: target,
          isVideoModalOpen: true
        });
      },

      showToast: (msg: string) => {
        set({ toastMessage: msg });
        setTimeout(() => {
          if (get().toastMessage === msg) {
            set({ toastMessage: null });
          }
        }, 3200);
      }
    }),
    {
      name: 'zyro-player-storage-v4', // Updated to v4 for verified artist-organized library
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        likedSongs: state.likedSongs,
        playlists: state.playlists,
        history: state.history,
        queue: state.queue,
        currentTrack: state.currentTrack
      })
    }
  )
);
