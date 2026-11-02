/**
 * ZYRO Audio Engine & Player Store by FailureTech
 * Production-grade Web Audio API & HTML5 Audio hybrid engine
 * Zero-autoplay rejection, real Web Audio DSP graph, and graceful native fallback.
 */

class ZyroPlayerStore {
  constructor() {
    // 1. Authorized Track Catalog
    this.tracks = [
      {
        id: 'zerog',
        title: 'ZEROG // 01',
        artist: 'KAIRO x FAILURETECH',
        genre: 'Zero-G Ambient',
        bpm: 112,
        duration: '00:32',
        durationSec: 32,
        audioSrc: 'audio/track-1.wav',
        fallbackSrc: 'public/audio/track-1.wav',
        cover: 'assets/zerog.jpg',
        key: 'F# Min',
        bitrate: '1411 KBPS LOSSLESS WAV',
        tags: ['ambient', 'chill', 'spatial', 'zero-g', 'focus', 'kairo']
      },
      {
        id: 'neuraldrift',
        title: 'NEURAL DRIFT // 02',
        artist: 'NEON PROTOCOL',
        genre: 'Cyber Phonk Synth',
        bpm: 128,
        duration: '00:32',
        durationSec: 32,
        audioSrc: 'audio/track-2.wav',
        fallbackSrc: 'public/audio/track-2.wav',
        cover: 'assets/cyberdrift.jpg',
        key: 'D Min',
        bitrate: '1411 KBPS LOSSLESS WAV',
        tags: ['phonk', 'cyber', 'drift', 'synth', 'bass', 'neon']
      },
      {
        id: 'chromapulse',
        title: 'CHROMA PULSE // 03',
        artist: 'ORBITAL SYNC',
        genre: 'Liquid Chrome Glitch',
        bpm: 140,
        duration: '00:32',
        durationSec: 32,
        audioSrc: 'audio/track-3.wav',
        fallbackSrc: 'public/audio/track-3.wav',
        cover: 'assets/chromapulse.jpg',
        key: 'A Min',
        bitrate: '1411 KBPS LOSSLESS WAV',
        tags: ['glitch', 'future', 'chrome', 'electronic', 'energy', 'orbital']
      }
    ];

    // State
    this.currentTrackIndex = 0;
    this.isPlaying = false;
    this.currentTime = 0;
    this.duration = 32;
    this.volume = 0.85;
    this.isMuted = false;
    this.isSpatial = true;
    this.isWebAudioConnected = false;

    // DSP Parameters
    this.dspParams = {
      bassBoost: 1.0,        // 0.5 to 2.5
      filterCutoff: 3500,    // 800Hz to 8000Hz
      trebleClarity: 1.0,    // 0.5 to 2.0
      spatialWidth: 0.8,     // 0.0 to 1.0
      glitchRate: 0.0
    };

    // Web Audio API Nodes
    this.audioCtx = null;
    this.sourceNode = null;
    this.bassFilter = null;
    this.trebleFilter = null;
    this.lowpassFilter = null;
    this.stereoPanner = null;
    this.analyser = null;
    this.masterGain = null;

    // Native HTML5 Audio Element
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.volume = this.volume;
    this.audioElement.src = this.tracks[0].audioSrc;

    // Subscriptions
    this.listeners = new Set();

    this.bindAudioEvents();
  }

  /**
   * Bind continuous HTML5 Audio Element events
   */
  bindAudioEvents() {
    this.audioElement.addEventListener('timeupdate', () => {
      this.currentTime = this.audioElement.currentTime;
      this.duration = this.audioElement.duration || this.getCurrentTrack().durationSec;
      this.notify('time', {
        currentTime: this.currentTime,
        duration: this.duration,
        progress: this.duration > 0 ? (this.currentTime / this.duration) : 0
      });
    });

    this.audioElement.addEventListener('play', () => {
      this.isPlaying = true;
      this.notify('state', { isPlaying: true });
    });

    this.audioElement.addEventListener('pause', () => {
      this.isPlaying = false;
      this.notify('state', { isPlaying: false });
    });

    // Auto-advance to next track on track completion
    this.audioElement.addEventListener('ended', () => {
      this.next();
    });

    this.audioElement.addEventListener('volumechange', () => {
      this.volume = this.audioElement.volume;
      this.isMuted = this.audioElement.muted;
      this.notify('volume', { volume: this.volume, isMuted: this.isMuted });
    });

    this.audioElement.addEventListener('error', (e) => {
      console.warn('[ZYRO Audio] Primary source failed, attempting fallback path:', e);
      const cur = this.getCurrentTrack();
      if (this.audioElement.src.indexOf(cur.fallbackSrc) === -1) {
        this.audioElement.src = cur.fallbackSrc;
        if (this.isPlaying) {
          this.audioElement.play().catch(err => console.error('[ZYRO Audio] Fallback failed:', err));
        }
      }
    });
  }

  /**
   * Initialize Web Audio API graph strictly on user interaction
   */
  initWebAudio() {
    if (this.isWebAudioConnected) {
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtxClass) {
        console.warn('[ZYRO Audio] Web Audio API not supported. Relying on HTML5 Audio.');
        return;
      }

      this.audioCtx = new AudioCtxClass();

      // Create DSP Node Chain:
      // Source -> Bass (lowshelf) -> Treble (highshelf) -> Lowpass (lowpass) -> StereoPanner -> Analyser -> MasterGain -> Destination
      this.bassFilter = this.audioCtx.createBiquadFilter();
      this.bassFilter.type = 'lowshelf';
      this.bassFilter.frequency.setValueAtTime(150, this.audioCtx.currentTime);
      this.bassFilter.gain.setValueAtTime(4.0 * this.dspParams.bassBoost, this.audioCtx.currentTime);

      this.trebleFilter = this.audioCtx.createBiquadFilter();
      this.trebleFilter.type = 'highshelf';
      this.trebleFilter.frequency.setValueAtTime(4500, this.audioCtx.currentTime);
      this.trebleFilter.gain.setValueAtTime(0, this.audioCtx.currentTime);

      this.lowpassFilter = this.audioCtx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.setValueAtTime(this.dspParams.filterCutoff, this.audioCtx.currentTime);
      this.lowpassFilter.Q.setValueAtTime(2.2, this.audioCtx.currentTime);

      if (this.audioCtx.createStereoPanner) {
        this.stereoPanner = this.audioCtx.createStereoPanner();
        this.stereoPanner.pan.setValueAtTime(0, this.audioCtx.currentTime);
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.85;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);

      // Connect HTML5 Audio element as source
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);

      // Wire chain
      let lastNode = this.sourceNode;
      lastNode.connect(this.bassFilter);
      lastNode = this.bassFilter;

      lastNode.connect(this.trebleFilter);
      lastNode = this.trebleFilter;

      lastNode.connect(this.lowpassFilter);
      lastNode = this.lowpassFilter;

      if (this.stereoPanner) {
        lastNode.connect(this.stereoPanner);
        lastNode = this.stereoPanner;
      }

      lastNode.connect(this.analyser);
      this.analyser.connect(this.masterGain);
      this.masterGain.connect(this.audioCtx.destination);

      this.isWebAudioConnected = true;

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (err) {
      console.warn('[ZYRO Audio] Web Audio Graph initialization bypassed. Falling back to native HTML5 Audio:', err);
      this.isWebAudioConnected = false;
    }
  }

  getCurrentTrack() {
    return this.tracks[this.currentTrackIndex];
  }

  /**
   * Transport controls
   */
  async play(trackIndex = null) {
    this.initWebAudio();

    if (trackIndex !== null && trackIndex !== this.currentTrackIndex) {
      this.currentTrackIndex = ((trackIndex % this.tracks.length) + this.tracks.length) % this.tracks.length;
      const track = this.getCurrentTrack();
      this.audioElement.src = track.audioSrc;
      this.currentTime = 0;
      this.notify('track', track);
    }

    try {
      await this.audioElement.play();
      this.isPlaying = true;
      this.notify('state', { isPlaying: true });
    } catch (err) {
      console.warn('[ZYRO Audio] Autoplay deferred until interaction:', err);
    }
  }

  pause() {
    this.audioElement.pause();
    this.isPlaying = false;
    this.notify('state', { isPlaying: false });
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
    this.play(nextIdx);
  }

  prev() {
    // If more than 3 seconds in, restart track; else go to previous
    if (this.currentTime > 3) {
      this.seek(0);
    } else {
      const prevIdx = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
      this.play(prevIdx);
    }
  }

  seek(seconds) {
    const clamped = Math.max(0, Math.min(seconds, this.duration || 32));
    this.audioElement.currentTime = clamped;
    this.currentTime = clamped;
    this.notify('time', {
      currentTime: clamped,
      duration: this.duration,
      progress: this.duration > 0 ? (clamped / this.duration) : 0
    });
  }

  setVolume(val) {
    const clamped = Math.max(0, Math.min(1, val));
    this.volume = clamped;
    this.audioElement.volume = clamped;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(clamped, this.audioCtx.currentTime);
    }
    this.notify('volume', { volume: clamped, isMuted: this.isMuted });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audioElement.muted = this.isMuted;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.audioCtx.currentTime);
    }
    this.notify('volume', { volume: this.volume, isMuted: this.isMuted });
  }

  setSpatial(enabled) {
    this.isSpatial = enabled;
  }

  /**
   * Audio Lab DSP Parameters Wiring
   */
  setDspParam(param, value) {
    this.dspParams[param] = value;
    if (!this.audioCtx || !this.isWebAudioConnected) return;

    const now = this.audioCtx.currentTime;
    if (param === 'bassBoost' && this.bassFilter) {
      // Scale 0.5-2.5 to -3dB to +12dB
      const gainDb = (value - 1.0) * 8.0 + 3.0;
      this.bassFilter.gain.setTargetAtTime(gainDb, now, 0.05);
    } else if (param === 'filterCutoff' && this.lowpassFilter) {
      this.lowpassFilter.frequency.setTargetAtTime(value, now, 0.05);
    } else if (param === 'trebleClarity' && this.trebleFilter) {
      const gainDb = (value - 1.0) * 6.0;
      this.trebleFilter.gain.setTargetAtTime(gainDb, now, 0.05);
    } else if (param === 'spatialWidth' && this.stereoPanner) {
      // Modulate stereo field spread
      const panVal = Math.sin(now * 0.5) * (value * 0.45);
      this.stereoPanner.pan.setTargetAtTime(panVal, now, 0.1);
    }
  }

  /**
   * Frequency Data for 3D Visualizer & Waveforms
   */
  getFrequencyData() {
    if (!this.analyser) {
      // Fallback pseudo-spectrum if Web Audio not connected
      if (this.isPlaying) {
        const dummy = new Uint8Array(64);
        const t = performance.now() * 0.005;
        for (let i = 0; i < 64; i++) {
          dummy[i] = Math.floor(128 + 120 * Math.sin(t + i * 0.2));
        }
        return dummy;
      }
      return new Uint8Array(64).fill(0);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getAverageFrequency() {
    const data = this.getFrequencyData();
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length;
  }

  getBassEnergy() {
    const data = this.getFrequencyData();
    let sum = 0;
    const bins = Math.min(16, data.length);
    for (let i = 0; i < bins; i++) {
      sum += data[i];
    }
    return sum / bins;
  }

  /**
   * Event Subscription Pattern
   */
  on(event, callback) {
    this.listeners.add({ event, callback });
  }

  notify(event, data) {
    this.listeners.forEach(sub => {
      if (sub.event === event) {
        try {
          sub.callback(data);
        } catch (e) {
          console.error('[ZYRO Store] Listener error:', e);
        }
      }
    });
  }

  getState() {
    return {
      currentTrack: this.getCurrentTrack(),
      currentTrackIndex: this.currentTrackIndex,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      isSpatial: this.isSpatial,
      dspParams: { ...this.dspParams }
    };
  }
}

// Global Singletons
window.zyroPlayerStore = new ZyroPlayerStore();
// Backward compatibility alias
window.zyroAudio = window.zyroPlayerStore;
