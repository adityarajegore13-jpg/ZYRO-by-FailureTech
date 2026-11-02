'use client';

/**
 * ZYRO by FailureTech — Home Discovery Feed
 * Dynamic category filter bar, horizontal carousels (Trending, Bollywood, Moosetape, Sambata, Singles),
 * and interactive 1:1 glass cards with instant heart toggling and audio/video transport.
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  Heart,
  ListPlus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Flame,
  Radio,
  Disc3,
  Film,
  Music,
  Zap
} from 'lucide-react';
import { usePlayerStore } from '@/stores/usePlayerStore';
import {
  Track,
  MusicCategory,
  getTracksByCategory,
  getTrendingTracks,
  getBollywoodTracks,
  getMarathiTracks,
  getPunjabiTracks,
  getSinglesTracks,
  getVideoTracks
} from '@/lib/audio/catalog';

interface CarouselProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tracks: Track[];
}

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const HorizontalCarousel: React.FC<CarouselProps> = ({ title, subtitle, icon, tracks }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    currentTrack,
    isPlaying,
    setTrack,
    togglePlay,
    enqueue,
    likedSongs,
    toggleLike,
    setPlaylistModalOpen,
    setTrackToAddToPlaylist,
    openVideoPlayer,
    setSelectedArtist
  } = usePlayerStore();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 py-4 w-full">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#00FFA3]">
            {icon}
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold font-display text-white tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-[#94A3B8] font-mono">{subtitle}</p>
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#94A3B8] hover:text-white border border-white/10 transition-colors"
            title="Scroll Left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-[#94A3B8] hover:text-white border border-white/10 transition-colors"
            title="Scroll Right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-5 overflow-x-auto pb-4 scroll-smooth scrollbar-none"
      >
        {tracks.map((track) => {
          const isCurrent = currentTrack.id === track.id;
          const isCurrentPlaying = isCurrent && isPlaying;
          const isLiked = likedSongs.includes(track.id);

          return (
            <div
              key={track.id}
              onClick={() => {
                if (isCurrent) togglePlay();
                else setTrack(track);
              }}
              className={`group flex-shrink-0 w-60 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isCurrent
                  ? 'ring-1 ring-[#00FFA3] shadow-[0_0_25px_rgba(0,255,163,0.2)]'
                  : 'hover:border-[#00E5FF]/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.12)]'
              }`}
              style={{
                backgroundColor: 'rgba(14, 17, 23, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: isCurrent ? '1px solid #00FFA3' : '1px solid #1A1F2C'
              }}
            >
              {/* Cover Art with 1:1 Aspect Ratio */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#060709]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-black/30" />

                {/* Badges: Format & Duration */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span
                    className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full backdrop-blur-md border flex items-center gap-1 ${
                      track.isVideo
                        ? 'text-[#00E5FF] bg-[#060709]/85 border-[#00E5FF]/40 shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                        : 'text-[#00FFA3] bg-[#060709]/85 border-[#00FFA3]/40'
                    }`}
                  >
                    {track.isVideo ? <Film size={10} /> : <Music size={10} />}
                    <span>{track.isVideo ? 'VIDEO' : track.crate || track.category}</span>
                  </span>

                  <span className="text-[10px] font-mono text-[#94A3B8] bg-[#060709]/85 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
                    {formatDuration(track.duration)}
                  </span>
                </div>

                {/* Play Button Overlay */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCurrent) togglePlay();
                    else setTrack(track);
                  }}
                  className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.6)] ${
                    isCurrent
                      ? 'bg-[#00FFA3] text-[#060709] scale-100 opacity-100'
                      : 'bg-white text-[#060709] opacity-0 group-hover:opacity-100 group-hover:scale-105'
                  }`}
                >
                  {isCurrentPlaying ? (
                    <Pause size={18} fill="currentColor" />
                  ) : (
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  )}
                </button>

                {/* Watch Video button on card */}
                {track.isVideo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTrack(track);
                      openVideoPlayer(track);
                    }}
                    className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#060709] text-[9px] font-mono font-bold border border-[#00E5FF]/40 backdrop-blur-md transition-all flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                    title="Watch HD Video"
                  >
                    <Film size={10} />
                    <span>Watch</span>
                  </button>
                )}
              </div>

              {/* Card Metadata Details */}
              <div className="p-3.5 flex flex-col gap-2.5">
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] font-mono text-[#00FFA3] tracking-wider uppercase truncate">
                    {track.movieOrAlbum || track.crate || 'Bollywood'}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors" title={track.title}>
                    {track.title}
                  </h4>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedArtist(track.primaryArtist || track.artist);
                    }}
                    className="text-xs text-[#94A3B8] hover:text-[#00FFA3] font-mono truncate transition-colors cursor-pointer"
                    title={`View ${track.artist} profile`}
                  >
                    {track.artist}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1A1F2C]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      className={`p-1 rounded-lg transition-colors ${
                        isLiked ? 'text-[#00FFA3]' : 'text-[#64748B] hover:text-white'
                      }`}
                      title={isLiked ? 'Unlike' : 'Like'}
                    >
                      <Heart size={14} fill={isLiked ? '#00FFA3' : 'none'} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        enqueue(track);
                      }}
                      className="p-1 text-[#64748B] hover:text-[#00FFA3] transition-colors"
                      title="Add to queue"
                    >
                      <ListPlus size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTrackToAddToPlaylist(track);
                        setPlaylistModalOpen(true);
                      }}
                      className="p-1 text-[#64748B] hover:text-white transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="text-[9px] font-mono text-[#64748B]">
                    {track.fileFormat || (track.isVideo ? 'MP4' : 'MP3')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const HomeFeed: React.FC = () => {
  const { currentTrack, isPlaying, setTrack, togglePlay, enqueue, likedSongs, toggleLike, setPlaylistModalOpen, setTrackToAddToPlaylist, openVideoPlayer } = usePlayerStore();
  const [selectedCategory, setSelectedCategory] = useState<MusicCategory | 'All'>('All');

  const categories: (MusicCategory | 'All')[] = [
    'All',
    'Bollywood',
    'Punjabi',
    'Marathi',
    'Singles',
    'Videos'
  ];

  // Dynamic filter for the main grid
  const filteredTracks = useMemo(() => {
    return getTracksByCategory(selectedCategory);
  }, [selectedCategory]);

  const trendingTracks = useMemo(() => getTrendingTracks(), []);
  const bollywoodTracks = useMemo(() => getBollywoodTracks(), []);
  const punjabiTracks = useMemo(() => getPunjabiTracks(), []);
  const marathiTracks = useMemo(() => getMarathiTracks(), []);
  const singlesTracks = useMemo(() => getSinglesTracks(), []);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-10">
      {/* Dynamic Filter Bar */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none border-b border-[#1A1F2C]">
        <span className="text-xs font-mono text-[#64748B] uppercase tracking-wider mr-2 hidden sm:inline-block">
          Filter Crate:
        </span>
        {categories.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-xs font-mono tracking-wider transition-all duration-300 flex-shrink-0 flex items-center gap-2 border ${
                isActive
                  ? 'bg-white/15 text-white border-[#00FFA3] shadow-[0_0_15px_rgba(0,255,163,0.2)]'
                  : 'bg-white/5 text-[#94A3B8] border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] shadow-[0_0_6px_#00FFA3]" />
              )}
              <span>{category === 'All' ? '[All Frequencies]' : `[${category}]`}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Grid when specific category is selected */}
      {selectedCategory !== 'All' ? (
        <section className="flex flex-col gap-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-[#00FFA3] uppercase tracking-widest">
                LOCAL CRATE SELECTION
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                {selectedCategory} Vault ({filteredTracks.length} tracks)
              </h2>
            </div>
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-mono text-[#00E5FF] hover:underline"
            >
              View All Carousels &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredTracks.map((track) => {
              const isCurrent = currentTrack.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              const isLiked = likedSongs.includes(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    if (isCurrent) togglePlay();
                    else setTrack(track);
                  }}
                  className={`group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isCurrent
                      ? 'ring-1 ring-[#00FFA3] shadow-[0_0_25px_rgba(0,255,163,0.2)]'
                      : 'hover:border-[#00E5FF]/40 hover:shadow-[0_15px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.12)]'
                  }`}
                  style={{
                    backgroundColor: 'rgba(14, 17, 23, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: isCurrent ? '1px solid #00FFA3' : '1px solid #1A1F2C'
                  }}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-[#060709]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={track.artworkUrl}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E1117] via-transparent to-black/30" />

                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                      <span className="text-[10px] font-mono font-medium text-[#00E5FF] bg-[#060709]/85 border border-[#00E5FF]/30 px-2 py-0.5 rounded-full backdrop-blur-md">
                        {track.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8] bg-[#060709]/85 border border-white/10 px-2 py-0.5 rounded-full backdrop-blur-md">
                        {formatDuration(track.duration)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isCurrent) togglePlay();
                        else setTrack(track);
                      }}
                      className={`absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.6)] ${
                        isCurrent
                          ? 'bg-[#00FFA3] text-[#060709] scale-100 opacity-100'
                          : 'bg-white text-[#060709] opacity-0 group-hover:opacity-100 group-hover:scale-105'
                      }`}
                    >
                      {isCurrentPlaying ? (
                        <Pause size={18} fill="currentColor" />
                      ) : (
                        <Play size={18} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>

                    {track.isVideo && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTrack(track);
                          openVideoPlayer(track);
                        }}
                        className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF] text-[#00E5FF] hover:text-[#060709] text-[9px] font-mono font-bold border border-[#00E5FF]/40 backdrop-blur-md transition-all flex items-center gap-1"
                        title="Watch HD Video"
                      >
                        <Film size={10} />
                        <span>Watch Video</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-mono text-[#00FFA3] tracking-wider uppercase truncate">
                        {track.movieOrAlbum || track.crate || 'Bollywood'}
                      </span>
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#00E5FF] transition-colors">
                        {track.title}
                      </h4>
                      <span className="text-xs text-[#94A3B8] font-mono truncate">
                        {track.artist}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-[#1A1F2C]">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(track.id);
                          }}
                          className={`p-1 rounded-lg transition-colors ${
                            isLiked ? 'text-[#00FFA3]' : 'text-[#64748B] hover:text-white'
                          }`}
                          title={isLiked ? 'Unlike' : 'Like'}
                        >
                          <Heart size={15} fill={isLiked ? '#00FFA3' : 'none'} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            enqueue(track);
                          }}
                          className="p-1 text-[#64748B] hover:text-[#00FFA3] transition-colors"
                          title="Add to queue"
                        >
                          <ListPlus size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTrackToAddToPlaylist(track);
                            setPlaylistModalOpen(true);
                          }}
                          className="p-1 text-[#64748B] hover:text-white transition-colors"
                          title="Add to Playlist"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <span className="text-[10px] font-mono text-[#64748B]">
                        {track.fileFormat || (track.isVideo ? 'MP4' : 'MP3')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        /* Horizontal Carousels across All Local Crates */
        <div className="flex flex-col gap-8">
          <HorizontalCarousel
            title="Trending Bollywood Vault"
            subtitle="Most played romantic and high-energy anthems from your local collection."
            icon={<Flame size={20} className="text-[#00FFA3]" />}
            tracks={trendingTracks}
          />

          <HorizontalCarousel
            title="Bollywood Classics & Music Videos"
            subtitle="Legendary tracks from Atif Aslam, Mohit Chauhan, Pritam, and A.R. Rahman."
            icon={<Film size={20} className="text-[#00E5FF]" />}
            tracks={bollywoodTracks}
          />

          <HorizontalCarousel
            title="Moosetape // Sidhu Moose Wala"
            subtitle="The complete high-octane Moosetape album collection."
            icon={<Zap size={20} className="text-[#00FFA3]" />}
            tracks={punjabiTracks}
          />

          <HorizontalCarousel
            title="Marathi & Desi Hip-Hop // Sambata"
            subtitle="Underground Desi street anthems and heavy bass records."
            icon={<Disc3 size={20} className="text-[#00E5FF]" />}
            tracks={marathiTracks}
          />

          <HorizontalCarousel
            title="Yo Yo Honey Singh & Party Singles"
            subtitle="Club bangers, party beats, and viral Desi singles."
            icon={<Radio size={20} className="text-[#00FFA3]" />}
            tracks={singlesTracks}
          />
        </div>
      )}
    </div>
  );
};

export default HomeFeed;
