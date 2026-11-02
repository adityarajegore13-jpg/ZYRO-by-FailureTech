/**
 * ZYRO by FailureTech — Main Interactive Application Controller
 * High-performance event controller & state synchronizer
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Audio Engine & Player Store Instance
  const player = window.zyroPlayerStore || window.zyroAudio;

  // 2. Initialize 3D Zero-G Visualizer
  let visualizer3D = null;
  const canvasContainer = document.getElementById('visualizer-canvas-container');
  if (canvasContainer && window.Zyro3DVisualizer) {
    visualizer3D = new window.Zyro3DVisualizer('visualizer-canvas-container');
  }

  // 3. Elements Cache
  const heroPlayBtn = document.getElementById('hero-play-toggle');
  const miniPlayBtn = document.getElementById('mini-play-toggle');
  const prevBtn = document.getElementById('btn-prev');
  const nextBtn = document.getElementById('btn-next');
  const miniNextBtn = document.getElementById('mini-btn-next');
  const spatialToggle = document.getElementById('spatial-toggle');
  const btnMute = document.getElementById('btn-mute');
  const iconVolHigh = document.getElementById('icon-vol-high');
  const iconVolMuted = document.getElementById('icon-vol-muted');
  const volumeSlider = document.getElementById('player-volume-slider');

  const waveformCanvas = document.getElementById('waveform-canvas');
  const waveformContainer = document.getElementById('waveform-container');
  const currentTimeDisplay = document.getElementById('current-time-display');
  const totalTimeDisplay = document.getElementById('total-time-display');
  const trackTitleDisplay = document.getElementById('player-track-title');
  const trackArtistDisplay = document.getElementById('player-track-artist');
  const playerCoverImg = document.getElementById('player-cover-img');

  const dockedMiniPlayer = document.getElementById('docked-mini-player');
  const miniTrackName = document.getElementById('mini-track-name');
  const miniTrackSub = document.getElementById('mini-track-sub');
  const miniCoverImg = document.getElementById('mini-cover-img');
  const eqBars = document.querySelectorAll('.eq-bar');

  // Spotlight Search Elements
  const spotlightModal = document.getElementById('spotlight-modal');
  const spotlightTrigger = document.getElementById('nav-search-trigger');
  const spotlightInput = document.getElementById('spotlight-input');
  const spotlightClose = document.getElementById('spotlight-close');
  const spotlightClearBtn = document.getElementById('spotlight-clear-btn');
  const spotlightResults = document.getElementById('spotlight-results');
  const spotlightEmptyState = document.getElementById('spotlight-empty-state');
  const emptyQueryText = document.getElementById('empty-query-text');

  // Mobile Drawer Elements
  const mobileNavBtn = document.getElementById('mobile-nav-btn');
  const mobileDrawerBackdrop = document.getElementById('mobile-drawer-backdrop');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  // Toast Container
  const toastContainer = document.getElementById('zyro-toast-container');

  // ==========================================================================
  // TOAST NOTIFICATIONS HELPER
  // ==========================================================================
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'zyro-toast';
    toast.innerHTML = `
      <span class="toast-dot"></span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, 3200);
  }

  // ==========================================================================
  // STEP 3: SONIC CRATES STATE & LOCAL PERSISTENCE
  // ==========================================================================
  const STORAGE_KEY_CRATES = 'zyro_saved_crates_v1';
  let savedCrates = {};

  try {
    const raw = localStorage.getItem(STORAGE_KEY_CRATES);
    if (raw) savedCrates = JSON.parse(raw);
  } catch (e) {
    console.warn('[ZYRO Crates] LocalStorage unavailable:', e);
  }

  function updateCrateButtonState(btn, trackId) {
    const isSaved = !!savedCrates[trackId];
    const labelSpan = btn.querySelector('.crate-btn-label');
    if (isSaved) {
      btn.classList.add('added');
      if (labelSpan) labelSpan.textContent = 'Saved in Crate ✓';
    } else {
      btn.classList.remove('added');
      if (labelSpan) labelSpan.textContent = 'Add to Crate';
    }
  }

  const crateAddButtons = document.querySelectorAll('.btn-add-crate');
  crateAddButtons.forEach(btn => {
    const trackId = btn.dataset.trackId;
    updateCrateButtonState(btn, trackId);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isCurrentlySaved = !!savedCrates[trackId];
      savedCrates[trackId] = !isCurrentlySaved;

      try {
        localStorage.setItem(STORAGE_KEY_CRATES, JSON.stringify(savedCrates));
      } catch (err) {
        console.warn('[ZYRO Crates] LocalStorage save error:', err);
      }

      updateCrateButtonState(btn, trackId);

      const track = player.tracks.find(t => t.id === trackId) || { title: trackId };
      if (!isCurrentlySaved) {
        showToast(`CRATE UPDATED // "${track.title}" added to your saved crate`);
      } else {
        showToast(`CRATE UPDATED // "${track.title}" removed from crate`);
      }
    });
  });

  // Demo room click notifications
  const roomBtns = document.querySelectorAll('.room-footer-btn');
  roomBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const room = btn.dataset.room || 'Live Orbit Room';
      showToast(`CONNECTING // Synchronizing to "${room}" [Interactive Demonstration]`);
    });
  });

  // ==========================================================================
  // STEP 1 & 2: CORE MUSIC PLAYER & TIMELINE SCRUBBING
  // ==========================================================================
  let waveCtx = null;
  if (waveformCanvas && waveformContainer) {
    waveCtx = waveformCanvas.getContext('2d');
    const resizeWaveform = () => {
      waveformCanvas.width = waveformContainer.clientWidth * window.devicePixelRatio;
      waveformCanvas.height = waveformContainer.clientHeight * window.devicePixelRatio;
    };
    resizeWaveform();
    window.addEventListener('resize', resizeWaveform);
  }

  const barCount = 44;
  const waveformProfile = [];
  for (let i = 0; i < barCount; i++) {
    const norm = i / barCount;
    const bell = Math.sin(norm * Math.PI);
    const noise = Math.sin(i * 1.3) * 0.25 + Math.cos(i * 2.1) * 0.15;
    waveformProfile.push(Math.max(0.15, Math.min(1.0, bell * 0.75 + noise + 0.2)));
  }

  function drawWaveform(progress = 0) {
    if (!waveCtx || !waveformCanvas) return;
    const w = waveformCanvas.width;
    const h = waveformCanvas.height;
    waveCtx.clearRect(0, 0, w, h);

    const gap = 3 * window.devicePixelRatio;
    const totalBarWidth = (w - (barCount - 1) * gap) / barCount;

    let freqData = null;
    if (player.isPlaying) {
      freqData = player.getFrequencyData();
    }

    for (let i = 0; i < barCount; i++) {
      const x = i * (totalBarWidth + gap);
      const norm = i / barCount;
      let barH = waveformProfile[i] * h * 0.82;

      if (freqData) {
        const bin = Math.floor(norm * 24);
        const dynamicBoost = (freqData[bin] / 255) * (h * 0.4);
        barH = Math.min(h * 0.95, barH + dynamicBoost);
      }

      const y = (h - barH) / 2;

      if (norm <= progress) {
        const grad = waveCtx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.5, '#00FFA3');
        grad.addColorStop(1, '#00E5FF');
        waveCtx.fillStyle = grad;
        waveCtx.shadowColor = '#00FFA3';
        waveCtx.shadowBlur = 6 * window.devicePixelRatio;
      } else {
        waveCtx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        waveCtx.shadowBlur = 0;
      }

      waveCtx.beginPath();
      waveCtx.roundRect(x, y, totalBarWidth, barH, 2 * window.devicePixelRatio);
      waveCtx.fill();
    }
  }

  // Interactive Timeline Seeking (Continuous Scrub on Click & Drag)
  let isScrubbing = false;

  function handleScrub(e) {
    if (!waveformContainer) return;
    const rect = waveformContainer.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const progress = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetSeconds = progress * (player.duration || 32);
    player.seek(targetSeconds);
    drawWaveform(progress);
  }

  if (waveformContainer) {
    waveformContainer.addEventListener('mousedown', (e) => {
      isScrubbing = true;
      handleScrub(e);
    });

    waveformContainer.addEventListener('touchstart', (e) => {
      isScrubbing = true;
      handleScrub(e);
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      if (isScrubbing) handleScrub(e);
    });

    window.addEventListener('touchmove', (e) => {
      if (isScrubbing) handleScrub(e);
    }, { passive: true });

    window.addEventListener('mouseup', () => { isScrubbing = false; });
    window.addEventListener('touchend', () => { isScrubbing = false; });
  }

  // Time formatting helper
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // UI Updates from Player Store
  function updatePlayerUI(track) {
    if (trackTitleDisplay) trackTitleDisplay.textContent = track.title;
    if (trackArtistDisplay) trackArtistDisplay.textContent = track.artist;
    if (playerCoverImg) playerCoverImg.src = track.cover;
    if (totalTimeDisplay) totalTimeDisplay.textContent = track.duration;

    if (miniTrackName) miniTrackName.textContent = track.title;
    if (miniTrackSub) miniTrackSub.textContent = track.genre;
    if (miniCoverImg) miniCoverImg.src = track.cover;
  }

  function setPlayButtonState(isPlaying) {
    const playIconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </svg>
    `;
    const pauseIconSvg = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    `;

    const iconHtml = isPlaying ? pauseIconSvg : playIconSvg;
    if (heroPlayBtn) heroPlayBtn.innerHTML = iconHtml;
    if (miniPlayBtn) miniPlayBtn.innerHTML = iconHtml;

    if (isPlaying && heroPlayBtn) {
      heroPlayBtn.style.boxShadow = '0 0 35px #00FFA3, 0 0 15px #00E5FF';
    } else if (heroPlayBtn) {
      heroPlayBtn.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.35)';
    }
  }

  player.on('track', (track) => updatePlayerUI(track));
  player.on('state', ({ isPlaying }) => setPlayButtonState(isPlaying));

  player.on('time', ({ currentTime, duration, progress }) => {
    if (currentTimeDisplay) currentTimeDisplay.textContent = formatTime(currentTime);
    if (totalTimeDisplay && duration) totalTimeDisplay.textContent = formatTime(duration);
    if (!isScrubbing) drawWaveform(progress);
  });

  player.on('volume', ({ volume, isMuted }) => {
    if (volumeSlider) volumeSlider.value = isMuted ? 0 : volume;
    if (iconVolHigh && iconVolMuted) {
      if (isMuted || volume === 0) {
        iconVolHigh.style.display = 'none';
        iconVolMuted.style.display = 'block';
      } else {
        iconVolHigh.style.display = 'block';
        iconVolMuted.style.display = 'none';
      }
    }
  });

  // Equalizer loop
  function animateEqualizer() {
    if (player.isPlaying && eqBars.length > 0) {
      const data = player.getFrequencyData();
      eqBars.forEach((bar, idx) => {
        const val = data[idx * 3] || 10;
        const heightPx = Math.max(3, Math.min(22, (val / 255) * 22));
        bar.style.height = `${heightPx}px`;
      });
    } else if (!player.isPlaying) {
      eqBars.forEach((bar) => { bar.style.height = '4px'; });
    }
    requestAnimationFrame(animateEqualizer);
  }
  animateEqualizer();

  // Transport Click Handlers
  if (heroPlayBtn) heroPlayBtn.addEventListener('click', () => player.toggle());
  if (miniPlayBtn) miniPlayBtn.addEventListener('click', () => player.toggle());
  if (prevBtn) prevBtn.addEventListener('click', () => player.prev());
  if (nextBtn) nextBtn.addEventListener('click', () => player.next());
  if (miniNextBtn) miniNextBtn.addEventListener('click', () => player.next());

  if (spatialToggle) {
    spatialToggle.addEventListener('click', () => {
      const isActive = spatialToggle.classList.toggle('active');
      player.setSpatial(isActive);
      spatialToggle.style.color = isActive ? 'var(--neon-mint)' : 'var(--text-secondary)';
      spatialToggle.style.boxShadow = isActive ? '0 0 15px rgba(0, 255, 163, 0.3)' : 'none';
    });
  }

  if (btnMute) btnMute.addEventListener('click', () => player.toggleMute());
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      player.setVolume(parseFloat(e.target.value));
    });
  }

  // Hero CTAs
  const ctaLaunchOrbit = document.getElementById('cta-launch-orbit');
  const btnNavLaunch = document.getElementById('btn-nav-launch');
  if (ctaLaunchOrbit) ctaLaunchOrbit.addEventListener('click', () => player.play());
  if (btnNavLaunch) btnNavLaunch.addEventListener('click', () => player.play());

  // Crate Cards Genre Filter Buttons
  const filterPills = document.querySelectorAll('.crate-filter-pill');
  const crateCards = document.querySelectorAll('.crate-card');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      crateCards.forEach(card => {
        if (filter === 'all' || card.dataset.genre === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Crate Play Triggers
  const cratePlayTriggers = document.querySelectorAll('.crate-play-trigger');
  cratePlayTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackIdx = parseInt(btn.dataset.trackIndex, 10);
      player.play(trackIdx);
    });
  });

  // ==========================================================================
  // STEP 2: AUDIO LAB WEB AUDIO API SLIDERS WIRING
  // ==========================================================================
  const sliderBass = document.getElementById('slider-bass');
  const sliderCutoff = document.getElementById('slider-cutoff');
  const sliderSpatial = document.getElementById('slider-spatial');
  const sliderGlitch = document.getElementById('slider-glitch');

  const valBass = document.getElementById('val-bass');
  const valCutoff = document.getElementById('val-cutoff');
  const valSpatial = document.getElementById('val-spatial');
  const valGlitch = document.getElementById('val-glitch');

  if (sliderBass) {
    sliderBass.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      player.setDspParam('bassBoost', v);
      if (valBass) valBass.textContent = `${(v * 100).toFixed(0)}%`;
    });
  }

  if (sliderCutoff) {
    sliderCutoff.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      player.setDspParam('filterCutoff', v);
      if (valCutoff) valCutoff.textContent = `${(v / 1000).toFixed(1)} kHz`;
    });
  }

  if (sliderSpatial) {
    sliderSpatial.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      player.setDspParam('spatialWidth', v);
      if (valSpatial) valSpatial.textContent = `${(v * 100).toFixed(0)}%`;
    });
  }

  if (sliderGlitch) {
    sliderGlitch.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      player.setDspParam('trebleClarity', v);
      if (valGlitch) valGlitch.textContent = `${(v * 100).toFixed(0)}%`;
    });
  }

  // 3D Visualizer Mode Presets
  const visModeBtns = document.querySelectorAll('.vis-mode-btn');
  visModeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      visModeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.dataset.mode;
      if (visualizer3D) visualizer3D.setVisualizerMode(mode);
    });
  });

  // Docked Mini Player Visibility on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 480) {
      dockedMiniPlayer.classList.add('visible');
    } else {
      dockedMiniPlayer.classList.remove('visible');
    }
  });

  // ==========================================================================
  // STEP 4: SEARCH & FILTER ENGINE
  // ==========================================================================
  let selectedSearchIndex = -1;
  let filteredSearchTracks = [...player.tracks];

  const renderSearchResults = (query = '') => {
    if (!spotlightResults) return;
    const q = query.toLowerCase().trim();

    filteredSearchTracks = player.tracks.filter(track => {
      if (!q) return true;
      const matchTitle = track.title.toLowerCase().includes(q);
      const matchArtist = track.artist.toLowerCase().includes(q);
      const matchGenre = track.genre.toLowerCase().includes(q);
      const matchTags = track.tags && track.tags.some(t => t.includes(q));
      const matchBpm = `${track.bpm}`.includes(q);
      return matchTitle || matchArtist || matchGenre || matchTags || matchBpm;
    });

    // Clear dynamic list items
    const existingItems = spotlightResults.querySelectorAll('.spotlight-item');
    existingItems.forEach(el => el.remove());

    if (filteredSearchTracks.length === 0) {
      if (spotlightEmptyState) {
        spotlightEmptyState.style.display = 'block';
        if (emptyQueryText) emptyQueryText.textContent = query;
      }
      selectedSearchIndex = -1;
      return;
    }

    if (spotlightEmptyState) spotlightEmptyState.style.display = 'none';

    filteredSearchTracks.forEach((track, idx) => {
      const item = document.createElement('div');
      item.className = 'spotlight-item';
      item.dataset.trackIndex = player.tracks.indexOf(track);
      item.innerHTML = `
        <div>
          <div style="font-weight: 600; color: #FFFFFF;">${track.title}</div>
          <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
            ${track.artist} • ${track.genre} • <span style="font-family: var(--font-mono); color: var(--text-muted);">${track.bpm} BPM</span>
          </div>
        </div>
        <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--neon-mint);">PLAY NOW ↵</span>
      `;

      item.addEventListener('click', () => {
        const tIdx = player.tracks.indexOf(track);
        player.play(tIdx);
        closeSpotlight();
      });

      spotlightResults.appendChild(item);
    });

    selectedSearchIndex = -1;
  };

  const openSpotlight = () => {
    if (!spotlightModal) return;
    spotlightModal.classList.add('active');
    renderSearchResults('');
    setTimeout(() => {
      if (spotlightInput) {
        spotlightInput.value = '';
        spotlightInput.focus();
        if (spotlightClearBtn) spotlightClearBtn.style.display = 'none';
      }
    }, 100);
  };

  const closeSpotlight = () => {
    if (!spotlightModal) return;
    spotlightModal.classList.remove('active');
  };

  if (spotlightTrigger) spotlightTrigger.addEventListener('click', openSpotlight);
  if (spotlightClose) spotlightClose.addEventListener('click', closeSpotlight);
  if (spotlightModal) {
    spotlightModal.addEventListener('click', (e) => {
      if (e.target === spotlightModal) closeSpotlight();
    });
  }

  // Debounced Search Input
  let searchDebounceTimer = null;
  if (spotlightInput) {
    spotlightInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (spotlightClearBtn) {
        spotlightClearBtn.style.display = val.length > 0 ? 'inline-block' : 'none';
      }
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        renderSearchResults(val);
      }, 120);
    });
  }

  if (spotlightClearBtn) {
    spotlightClearBtn.addEventListener('click', () => {
      spotlightInput.value = '';
      spotlightClearBtn.style.display = 'none';
      renderSearchResults('');
      spotlightInput.focus();
    });
  }

  // Keyboard navigation inside Spotlight
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (spotlightModal.classList.contains('active')) closeSpotlight();
      else openSpotlight();
    } else if (e.key === 'Escape') {
      if (spotlightModal.classList.contains('active')) closeSpotlight();
      if (mobileDrawerBackdrop.classList.contains('open')) closeMobileDrawer();
    } else if (spotlightModal.classList.contains('active')) {
      const items = spotlightResults.querySelectorAll('.spotlight-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSearchIndex = (selectedSearchIndex + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('keyboard-selected', i === selectedSearchIndex));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSearchIndex = (selectedSearchIndex - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('keyboard-selected', i === selectedSearchIndex));
      } else if (e.key === 'Enter' && selectedSearchIndex >= 0) {
        e.preventDefault();
        const chosen = items[selectedSearchIndex];
        if (chosen) chosen.click();
      }
    }
  });

  // ==========================================================================
  // MOBILE NAVIGATION DRAWER & SCROLL SPY
  // ==========================================================================
  function openMobileDrawer() {
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.add('open');
  }

  function closeMobileDrawer() {
    if (mobileDrawerBackdrop) mobileDrawerBackdrop.classList.remove('open');
  }

  if (mobileNavBtn) mobileNavBtn.addEventListener('click', openMobileDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerBackdrop) {
    mobileDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === mobileDrawerBackdrop) closeMobileDrawer();
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => closeMobileDrawer());
  });

  // Active navigation link scroll-spy
  const navSections = document.querySelectorAll('section[id]');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 200;
    navSections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        desktopNavLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  });

  // Initial draw
  drawWaveform(0);
});
