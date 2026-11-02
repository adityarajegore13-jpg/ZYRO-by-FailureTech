'use client';

/**
 * ZYRO by FailureTech — Minimalist 3D Fluid Waves Visualizer
 * High-performance, lightweight 3D canvas mesh undulating in deep void space.
 * Features chill sine-ribbon fluid dynamics, procedural bass/kick reactivity,
 * soft mint/cyan atmospheric auroras, and an ultra-slow ambient idle loop.
 */

import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/stores/usePlayerStore';

export interface Visualizer3DProps {
  isPlaying?: boolean;
  className?: string;
  intensity?: number;
  reactiveBass?: number; // Optional 0..1 external bass override
}

interface Particle {
  x: number;
  y: number;
  z: number;
  radius: number;
  speedY: number;
  alpha: number;
  pulsePhase: number;
  colorType: 'mint' | 'cyan';
}

export const Visualizer3D: React.FC<Visualizer3DProps> = ({
  isPlaying: isPlayingProp,
  className = '',
  intensity = 1.0,
  reactiveBass
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Hook into global player store if isPlaying is not explicitly provided via prop
  const storeIsPlaying = usePlayerStore((s) => s.isPlaying);
  const activeIsPlaying = isPlayingProp !== undefined ? isPlayingProp : storeIsPlaying;

  // Animation & reactivity refs to avoid re-renders
  const stateRef = useRef({
    isPlaying: activeIsPlaying,
    time: 0,
    bassPulse: 0,
    amplitudeLerp: 0.5,
    speedLerp: 0.003,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0
  });

  // Keep stateRef in sync with prop/store
  useEffect(() => {
    stateRef.current.isPlaying = activeIsPlaying;
  }, [activeIsPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Handle high-DPI scaling safely
    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width || window.innerWidth;
      height = rect.height || window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // Subtle interactive mouse parallax
    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / (width || 1) - 0.5) * 2;
      const normY = (e.clientY / (height || 1) - 0.5) * 2;
      stateRef.current.targetMouseX = normX;
      stateRef.current.targetMouseY = normY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize 28 zero-g ambient particles
    const particles: Particle[] = Array.from({ length: 28 }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: Math.random() * 800,
      z: 0.5 + Math.random() * 2.2,
      radius: 0.8 + Math.random() * 1.6,
      speedY: 0.2 + Math.random() * 0.45,
      alpha: 0.2 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
      colorType: Math.random() > 0.5 ? 'mint' : 'cyan'
    }));

    // Configuration for the 6 layered 3D sine ribbons
    const ribbonCount = 6;
    const pointsPerRibbon = 44;

    // Main 60fps render loop
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      const state = stateRef.current;

      // Mouse lerping for cinematic fluid parallax
      state.mouseX += (state.targetMouseX - state.mouseX) * 0.05;
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.05;

      // Reactivity: Gentle simulated kick cadence (~124 BPM -> 2.06 Hz) when playing
      const targetAmp = state.isPlaying ? 1.0 : 0.28;
      const targetSpeed = state.isPlaying ? 0.012 : 0.0028;

      state.amplitudeLerp += (targetAmp - state.amplitudeLerp) * 0.06;
      state.speedLerp += (targetSpeed - state.speedLerp) * 0.04;

      // Internal bass pulse calculation
      const kickCycle = (now / 1000) * 2.06 * Math.PI;
      const rawKick = Math.max(0, Math.sin(kickCycle));
      const proceduralBass = Math.pow(rawKick, 4) * 0.45;
      const currentBass = reactiveBass !== undefined ? reactiveBass : proceduralBass;
      state.bassPulse = state.bassPulse * 0.85 + (state.isPlaying ? currentBass : 0) * 0.15;

      state.time += state.speedLerp * (1 + state.bassPulse * 0.5);

      // 1. CLEAR WITH DEEP VOID BLACK (#060709)
      ctx.fillStyle = '#060709';
      ctx.fillRect(0, 0, width, height);

      // 2. SOFT-BLUR LIQUID AURORA GLOWS (Mint #00FFA3 & Cyan #00E5FF at 20-30% opacity)
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      // Cyan ambient bloom (slow drift towards lower right)
      const cyanOrbX = centerX + Math.cos(state.time * 0.4) * (width * 0.22) + state.mouseX * 30;
      const cyanOrbY = centerY + Math.sin(state.time * 0.3) * (height * 0.18) + state.mouseY * 20;
      const cyanRadius = Math.max(width, height) * 0.45;
      const cyanGradient = ctx.createRadialGradient(cyanOrbX, cyanOrbY, 0, cyanOrbX, cyanOrbY, cyanRadius);
      cyanGradient.addColorStop(0, 'rgba(0, 229, 255, 0.22)');
      cyanGradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.08)');
      cyanGradient.addColorStop(1, 'rgba(6, 7, 9, 0)');

      ctx.fillStyle = cyanGradient;
      ctx.fillRect(0, 0, width, height);

      // Mint ambient bloom (slow drift towards upper left)
      const mintOrbX = centerX - Math.sin(state.time * 0.35) * (width * 0.24) - state.mouseX * 30;
      const mintOrbY = centerY - Math.cos(state.time * 0.45) * (height * 0.16) - state.mouseY * 20;
      const mintRadius = Math.max(width, height) * 0.48;
      const mintGradient = ctx.createRadialGradient(mintOrbX, mintOrbY, 0, mintOrbX, mintOrbY, mintRadius);
      mintGradient.addColorStop(0, 'rgba(0, 255, 163, 0.24)');
      mintGradient.addColorStop(0.5, 'rgba(0, 255, 163, 0.09)');
      mintGradient.addColorStop(1, 'rgba(6, 7, 9, 0)');

      ctx.fillStyle = mintGradient;
      ctx.fillRect(0, 0, width, height);

      // 3. ZERO-G FLOATING PARTICLES (Deep atmosphere)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speedY * (1 + state.bassPulse * 0.8);
        if (p.y < -40) {
          p.y = height + 40;
          p.x = (Math.random() - 0.5) * width * 1.2;
        }

        const pScale = 1 / p.z;
        const screenPx = centerX + (p.x + state.mouseX * 50 * pScale) * pScale;
        const screenPy = centerY + (p.y - centerY + state.mouseY * 40 * pScale) * pScale;

        const pulse = 0.7 + 0.3 * Math.sin(state.time * 2 + p.pulsePhase);
        const alpha = p.alpha * pulse * (state.isPlaying ? 0.35 : 0.18);

        ctx.fillStyle = p.colorType === 'mint'
          ? `rgba(0, 255, 163, ${alpha})`
          : `rgba(0, 229, 255, ${alpha})`;

        ctx.beginPath();
        ctx.arc(screenPx, screenPy, p.radius * pScale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. 3D UNDULATING SINE-RIBBONS & FLUID MESH
      const ribbonCoords: Array<Array<{ x: number; y: number }>> = [];

      for (let r = 0; r < ribbonCount; r++) {
        const ribbonRatio = r / (ribbonCount - 1);
        const zDepth = 0.8 + r * 0.38; // Z depth scale (front to back)
        const perspective = 1 / zDepth;

        // Base elevation for this ribbon layer (spread along bottom half)
        const baseElevation = height * (0.42 + ribbonRatio * 0.32);

        // Amplitude increases with music play state & bass kick
        const waveAmp = (32 + ribbonRatio * 28) * state.amplitudeLerp * intensity * (1 + state.bassPulse * 0.45);

        const currentRibbonPoints: Array<{ x: number; y: number }> = [];

        for (let i = 0; i < pointsPerRibbon; i++) {
          const normX = i / (pointsPerRibbon - 1);
          // Spread wider than screen for seamless edge clipping
          const worldX = (normX - 0.5) * width * 1.35;

          // Multi-harmonic sine waves
          const f1 = 0.0032;
          const f2 = 0.0068;
          const f3 = 0.0125;

          const harmonic1 = Math.sin(worldX * f1 + state.time * 2.2 + r * 0.85) * (waveAmp * 0.65);
          const harmonic2 = Math.cos(worldX * f2 - state.time * 1.6 + r * 1.3) * (waveAmp * 0.35);
          const harmonic3 = Math.sin(worldX * f3 + state.time * 3.1 + r * 2.0) * (waveAmp * 0.18);

          const worldY = baseElevation + harmonic1 + harmonic2 + harmonic3;

          // 3D Perspective projection + Parallax
          const projX = centerX + (worldX + state.mouseX * 60 * (1 - ribbonRatio * 0.4)) * perspective;
          const projY = centerY + (worldY - centerY + state.mouseY * 45 * (1 - ribbonRatio * 0.4)) * perspective;

          currentRibbonPoints.push({ x: projX, y: projY });
        }

        ribbonCoords.push(currentRibbonPoints);

        // Draw Ribbon Fill (from spline to bottom of viewport)
        if (currentRibbonPoints.length > 1) {
          ctx.beginPath();
          ctx.moveTo(currentRibbonPoints[0].x, currentRibbonPoints[0].y);

          for (let i = 0; i < currentRibbonPoints.length - 1; i++) {
            const p0 = currentRibbonPoints[i];
            const p1 = currentRibbonPoints[i + 1];
            const midX = (p0.x + p1.x) * 0.5;
            const midY = (p0.y + p1.y) * 0.5;
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          }

          const lastPt = currentRibbonPoints[currentRibbonPoints.length - 1];
          ctx.lineTo(lastPt.x, lastPt.y);
          ctx.lineTo(lastPt.x, height + 60);
          ctx.lineTo(currentRibbonPoints[0].x, height + 60);
          ctx.closePath();

          // Ribbon vertical gradient: Soft Mint (#00FFA3) and Ice Cyan (#00E5FF) at 20-30% opacity
          const ribbonGradient = ctx.createLinearGradient(0, currentRibbonPoints[0].y - 30, 0, height);
          const mintAlpha = (0.28 - ribbonRatio * 0.08) * state.amplitudeLerp;
          const cyanAlpha = (0.22 - ribbonRatio * 0.06) * state.amplitudeLerp;

          if (r % 2 === 0) {
            ribbonGradient.addColorStop(0, `rgba(0, 255, 163, ${mintAlpha})`);
            ribbonGradient.addColorStop(0.4, `rgba(0, 229, 255, ${cyanAlpha * 0.7})`);
            ribbonGradient.addColorStop(1, 'rgba(6, 7, 9, 0)');
          } else {
            ribbonGradient.addColorStop(0, `rgba(0, 229, 255, ${cyanAlpha})`);
            ribbonGradient.addColorStop(0.4, `rgba(0, 255, 163, ${mintAlpha * 0.7})`);
            ribbonGradient.addColorStop(1, 'rgba(6, 7, 9, 0)');
          }

          ctx.fillStyle = ribbonGradient;
          ctx.fill();

          // Smooth glowing crest line (top edge)
          ctx.beginPath();
          ctx.moveTo(currentRibbonPoints[0].x, currentRibbonPoints[0].y);
          for (let i = 0; i < currentRibbonPoints.length - 1; i++) {
            const p0 = currentRibbonPoints[i];
            const p1 = currentRibbonPoints[i + 1];
            const midX = (p0.x + p1.x) * 0.5;
            const midY = (p0.y + p1.y) * 0.5;
            ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
          }
          ctx.lineTo(lastPt.x, lastPt.y);

          ctx.lineWidth = 1.2 * perspective;
          ctx.strokeStyle = r % 2 === 0
            ? `rgba(0, 255, 163, ${0.35 * state.amplitudeLerp})`
            : `rgba(0, 229, 255, ${0.32 * state.amplitudeLerp})`;
          ctx.stroke();
        }
      }

      // 5. SUBTLE LIQUID MESH RIBS (Connecting layers with delicate, soft-blur filaments)
      for (let r = 0; r < ribbonCoords.length - 1; r++) {
        const topRow = ribbonCoords[r];
        const bottomRow = ribbonCoords[r + 1];
        if (!topRow || !bottomRow) continue;

        ctx.lineWidth = 0.75;
        // Connect every 3rd point across adjacent ribbons
        for (let i = 0; i < topRow.length; i += 3) {
          const ptTop = topRow[i];
          const ptBottom = bottomRow[i];
          if (!ptTop || !ptBottom) continue;

          ctx.beginPath();
          ctx.moveTo(ptTop.x, ptTop.y);
          ctx.lineTo(ptBottom.x, ptBottom.y);
          ctx.strokeStyle = `rgba(0, 255, 163, ${0.06 * state.amplitudeLerp})`;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [intensity, reactiveBass]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-[#060709] ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default Visualizer3D;

