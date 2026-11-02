'use client';

/**
 * ZYRO by FailureTech — Theater Mode Video Player Modal
 * Provides playback controls for native MP4 / WebM music videos.
 * Features fullscreen, scrub, volume, PiP, and seamless synchronization with the store.
 */

import React, { useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Video, Film, Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';

export const VideoModal: React.FC = () => {
  const {
    isVideoModalOpen,
    activeVideoTrack,
    setVideoModalOpen,
    isPlaying,
    setPlaying,
    setTrack
  } = usePlayerStore();

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoModalOpen) return;

    if (isPlaying) {
      video.play().catch((err) => console.warn('[VideoModal] Playback promise error:', err));
    } else {
      video.pause();
    }
  }, [isPlaying, isVideoModalOpen]);

  if (!isVideoModalOpen || !activeVideoTrack) return null;

  const handleClose = () => {
    setVideoModalOpen(false);
  };

  const handleToggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(Boolean);
    } else {
      video.requestFullscreen().catch(Boolean);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-5xl rounded-3xl overflow-hidden bg-[#0A0D14] border border-[#1A1F2C] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_50px_rgba(0,255,163,0.15)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A1F2C] bg-[#0E1117]/90">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] flex-shrink-0">
              <Film size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#00FFA3] bg-[#00FFA3]/10 border border-[#00FFA3]/20 px-2 py-0.5 rounded-full uppercase">
                  HD MUSIC VIDEO
                </span>
                <span className="text-xs font-mono text-[#94A3B8] truncate hidden sm:inline-block">
                  {activeVideoTrack.movieOrAlbum || 'Bollywood Visual'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate" title={activeVideoTrack.title}>
                {activeVideoTrack.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors hidden sm:flex"
              title="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors"
              title="Close Theater Mode"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          <video
            ref={videoRef}
            src={activeVideoTrack.src}
            controls
            autoPlay={isPlaying}
            playsInline
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Modal Footer Info */}
        <div className="px-5 py-3.5 bg-[#0E1117]/90 border-t border-[#1A1F2C] flex items-center justify-between text-xs font-mono text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <span className="text-[#00FFA3]">● {activeVideoTrack.artist}</span>
            <span>&bull;</span>
            <span>{activeVideoTrack.fileFormat || 'MP4'} Lossless Master</span>
          </div>

          <span className="text-[#64748B] hidden sm:inline-block">
            Press Esc or Click Outside to Return to Audio Dock
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
