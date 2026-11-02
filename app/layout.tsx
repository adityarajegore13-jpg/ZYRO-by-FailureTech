import type { Metadata } from 'next';
import './globals.css';
import { AudioEngine } from '@/components/audio/AudioEngine';
import { PlayerDock } from '@/components/audio/PlayerDock';

export const metadata: Metadata = {
  title: 'ZYRO by FailureTech — Zero Friction. Pure Sound.',
  description: 'The audio-visual streaming experience by FailureTech. Next-gen music platform for Gen Z with lossless audio, 3D visualizers, and curated crates.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-obsidian text-frost selection:bg-mint selection:text-obsidian antialiased pb-32">
        {/* Headless Audio Engine singleton */}
        <AudioEngine />

        {/* Main Page Content */}
        {children}

        {/* Global Floating Player Dock */}
        <PlayerDock />
      </body>
    </html>
  );
}
