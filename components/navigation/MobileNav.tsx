'use client';

/**
 * ZYRO by FailureTech — Mobile Bottom Navigation Bar
 * Touch-optimized bottom bar for small screens and tablets.
 */

import React from 'react';
import { Compass, Search, Library, Heart, Disc3, Users } from 'lucide-react';
import { usePlayerStore, AppNavTab } from '@/stores/usePlayerStore';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, likedSongs } = usePlayerStore();

  const tabs: { tab: AppNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'feed', label: 'Stream', icon: <Compass size={18} /> },
    { tab: 'search', label: 'Search', icon: <Search size={18} /> },
    { tab: 'artists', label: 'Artists', icon: <Users size={18} /> },
    { tab: 'library', label: 'Library', icon: <Library size={18} /> },
    {
      tab: 'liked',
      label: 'Liked',
      icon: <Heart size={18} />,
      badge: likedSongs.length > 0 ? likedSongs.length : undefined
    }
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#060709]/95 backdrop-blur-2xl border-t border-[#1A1F2C] px-4 flex items-center justify-around select-none"
      aria-label="Mobile Navigation"
    >
      {tabs.map((t) => {
        const isActive = activeTab === t.tab;
        return (
          <button
            key={t.tab}
            onClick={() => setActiveTab(t.tab)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-all relative ${
              isActive ? 'text-[#00FFA3]' : 'text-[#64748B] hover:text-white'
            }`}
          >
            <div className="relative">
              {t.icon}
              {t.badge !== undefined && (
                <span className="absolute -top-1 -right-2 text-[8px] font-mono w-3.5 h-3.5 rounded-full bg-[#00FFA3] text-[#060709] font-bold flex items-center justify-center">
                  {t.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-mono tracking-wider">{t.label}</span>
            {isActive && (
              <span className="absolute -bottom-1 w-6 h-0.5 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
