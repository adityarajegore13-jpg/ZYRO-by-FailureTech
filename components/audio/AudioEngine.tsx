'use client';

/**
 * ZYRO by FailureTech — Headless Audio Engine Component
 * Bridges native HTML5 Audio element events with Zustand player store.
 * Handles playback errors gracefully, verifies playable sources, and guarantees deterministic transport sync.
 */

import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';

export const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    seekRequestedTime,
    setPlaying,
    setCurrentTime,
    setDuration,
    clearSeekRequest,
    nextTrack,
    showToast,
    isVideoModalOpen
  } = usePlayerStore();

  // 1. Sync Audio Source when Current Track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack.src) {
      audio.removeAttribute('src');
      setPlaying(false);
      return;
    }

    const isSameSrc = audio.src === currentTrack.src || audio.src.endsWith(currentTrack.src);
    if (!isSameSrc) {
      audio.src = currentTrack.src;
      audio.load();

      if (isPlaying && !(isVideoModalOpen && currentTrack.isVideo)) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[AudioEngine] Playback promise handled:', err);
            setPlaying(false);
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              showToast(`Unable to stream "${currentTrack.title}". Source may be restricted.`);
            }
          });
        }
      }
    }
  }, [currentTrack, isPlaying, isVideoModalOpen, setPlaying, showToast]);

  // 2. Sync Play/Pause State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack.src) return;

    if (isVideoModalOpen && currentTrack.isVideo) {
      audio.pause();
      return;
    }

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('[AudioEngine] Playback promise rejected (Autoplay Policy):', err);
          setPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack.src, currentTrack.isVideo, isVideoModalOpen, setPlaying]);

  // 3. Sync Volume & Mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  // 4. Handle Direct Seek Requests
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seekRequestedTime === null) return;

    audio.currentTime = seekRequestedTime;
    clearSeekRequest();
  }, [seekRequestedTime, clearSeekRequest]);

  return (
    <audio
      ref={audioRef}
      src={currentTrack.src || undefined}
      crossOrigin="anonymous"
      preload="metadata"
      onTimeUpdate={() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      }}
      onLoadedMetadata={() => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      }}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => {
        // Auto-advance deterministically to next track in catalog
        nextTrack();
      }}
      onError={(e) => {
        console.warn('[AudioEngine] HTML5 Audio Element playback error:', e);
        setPlaying(false);
        if (currentTrack?.title) {
          showToast(`Stream error: "${currentTrack.title}" audio source is unavailable.`);
        }
      }}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  );
};

export default AudioEngine;
