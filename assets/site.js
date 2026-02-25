(() => {
  'use strict';

  // Navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // hCaptcha explicit render hook
  window.hcaptchaOnload = function hcaptchaOnload() {
    const container = document.getElementById('hcaptcha-container');
    if (container && window.hcaptcha) {
      try {
        window.hcaptcha.render(container, {
          sitekey: container.getAttribute('data-sitekey') || ''
        });
      } catch (e) {
        // No-op: hCaptcha can fail if blocked by extensions
      }
    }
  };

  // Theme controls
  const themeSelect = document.querySelector('#theme-select');
  const minimalSelect = document.querySelector('#minimal-select');
  const minimalLabel = document.querySelector('.theme-minimal-label');
  const themes = ['arcane', 'romantic', 'minimal'];

  function applyTheme(theme) {
    const applied = themes.includes(theme) ? theme : 'arcane';
    document.body.dataset.theme = applied;
    if (themeSelect) themeSelect.value = applied;
    if (minimalSelect) minimalSelect.classList.toggle('is-hidden', applied !== 'minimal');
    if (minimalLabel) minimalLabel.classList.toggle('is-hidden', applied !== 'minimal');
  }

  function applyMinimalMode(mode) {
    const next = mode === 'dark' ? 'dark' : 'light';
    document.body.dataset.minimalMode = next;
    if (minimalSelect) minimalSelect.value = next;
  }

  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      const next = themeSelect.value;
      localStorage.setItem('theme', next);
      applyTheme(next);
    });
  }

  if (minimalSelect) {
    minimalSelect.addEventListener('change', () => {
      const next = minimalSelect.value;
      localStorage.setItem('minimalMode', next);
      applyMinimalMode(next);
    });
  }

  applyTheme(localStorage.getItem('theme') || 'arcane');
  applyMinimalMode(localStorage.getItem('minimalMode') || 'light');

  // Email copy
  const emailText = 'hello@zylcodex.tech';
  const emailCopy = document.querySelector('#email-copy');
  if (emailCopy) {
    const setCopyLabel = (text) => {
      emailCopy.textContent = text;
      setTimeout(() => {
        emailCopy.textContent = 'Email: click to copy';
      }, 1500);
    };

    emailCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(emailText);
        setCopyLabel('Copied');
      } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = emailText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        setCopyLabel('Copied');
      }
    });
  }

  // Subscribe form
  const subscribeForm = document.querySelector('#subscribe-form');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const emailInput = subscribeForm.querySelector('input[name="email"]');
      const email = emailInput ? emailInput.value.trim() : '';
      const hcaptchaResponse = document.querySelector('[name="h-captcha-response"]');
      const token = hcaptchaResponse ? hcaptchaResponse.value.trim() : '';

      if (!email || !email.includes('@')) {
        alert('Please enter a valid email.');
        return;
      }
      if (!token) {
        alert('Please complete the captcha.');
        return;
      }

      try {
        const response = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, hcaptcha_token: token })
        });

        const contentType = response.headers.get('content-type') || '';
        const result = contentType.includes('application/json')
          ? await response.json()
          : { ok: false, error: await response.text() };

        if (response.ok && result.ok) {
          alert('Subscribed. Please check your email.');
          emailInput.value = '';
          if (window.hcaptcha) window.hcaptcha.reset();
        } else {
          alert(`Subscribe failed: ${result.error || 'Please try again.'}`);
        }
      } catch (error) {
        alert('Subscribe failed: network error.');
      }
    });
  }

  // Music player
  const musicPlayerContainer = document.querySelector('.music-player');
  const discTrigger = document.querySelector('.disc-trigger');
  const bgm = document.getElementById('bgm');
  const musicBtn = document.getElementById('music-toggle');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const playlistSelect = document.getElementById('playlist-select');
  const progressBar = document.getElementById('progress-bar');
  const volumeSlider = document.getElementById('volume-slider');
  const timeDisplay = document.getElementById('time-display');

  const playlist = [
    { title: '海与天', file: 'bgm2.mp3' },
    { title: '秋殇别恋', file: 'bgm3.mp3' },
    { title: 'P.T. Adamczyk、Dawid Podsiadlo - Phantom', file: 'bgm4.mp3' },
    { title: '夜的钢琴曲五', file: 'bgm5.mp3' },
    { title: '可不可以', file: 'bgm6.mp3' },
    { title: '九万字', file: 'bgm7.mp3' },
    { title: '借过一下', file: 'bgm8.mp3' },
    { title: 'take my hand', file: 'bgm.mp3' }
  ];

  if (bgm && musicBtn && volumeSlider && playlistSelect && progressBar) {
    const formatTime = (timeInSeconds) => {
      if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) return '0:00';
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = Math.floor(timeInSeconds % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const updateTimeDisplay = () => {
      if (!timeDisplay) return;
      const current = formatTime(bgm.currentTime);
      const total = formatTime(bgm.duration);
      timeDisplay.textContent = `${current} / ${total}`;
    };
    const scriptTag = document.querySelector('script[src*="site.js"]');
    const scriptUrl = scriptTag ? new URL(scriptTag.src, window.location.href) : null;
    const assetPrefix = scriptUrl ? scriptUrl.href.replace(/site\.js(?:\?.*)?$/, '') : 'assets/';

    if (discTrigger && musicPlayerContainer) {
      discTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        musicPlayerContainer.classList.toggle('expanded');
      });
    }

    playlist.forEach((song, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = song.title;
      playlistSelect.appendChild(option);
    });

    const savedVolume = localStorage.getItem('bgm_volume');
    bgm.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.3;
    volumeSlider.value = String(bgm.volume);

    let currentSongIndex = parseInt(sessionStorage.getItem('bgm_index') || '0', 10);
    if (Number.isNaN(currentSongIndex) || currentSongIndex < 0 || currentSongIndex >= playlist.length) {
      currentSongIndex = 0;
    }

    const loadSong = (index) => {
      currentSongIndex = index;
      const song = playlist[index];
      bgm.src = assetPrefix + song.file;
      playlistSelect.value = String(index);
      sessionStorage.setItem('bgm_index', String(index));
      updateTimeDisplay();
    };

    const playMusic = () => {
      bgm.play().then(() => {
        musicBtn.textContent = 'Pause';
        if (musicPlayerContainer) {
          musicPlayerContainer.classList.add('playing');
          musicPlayerContainer.classList.add('expanded');
        }
        sessionStorage.setItem('bgm_playing', 'true');
      }).catch(() => {
        musicBtn.textContent = 'Play';
        if (musicPlayerContainer) musicPlayerContainer.classList.remove('playing');
        sessionStorage.setItem('bgm_playing', 'false');
      });
    };

    const pauseMusic = () => {
      bgm.pause();
      musicBtn.textContent = 'Play';
      if (musicPlayerContainer) musicPlayerContainer.classList.remove('playing');
      sessionStorage.setItem('bgm_playing', 'false');
    };

    const changeSong = (index) => {
      loadSong(index);
      playMusic();
    };

    loadSong(currentSongIndex);

    const savedTime = sessionStorage.getItem('bgm_time');
    if (savedTime) bgm.currentTime = parseFloat(savedTime);

    musicBtn.addEventListener('click', () => {
      if (bgm.paused) playMusic();
      else pauseMusic();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const newIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        changeSong(newIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const newIndex = (currentSongIndex + 1) % playlist.length;
        changeSong(newIndex);
      });
    }

    playlistSelect.addEventListener('change', (e) => {
      changeSong(parseInt(e.target.value, 10));
    });

    bgm.addEventListener('ended', () => {
      const newIndex = (currentSongIndex + 1) % playlist.length;
      changeSong(newIndex);
    });

    bgm.addEventListener('timeupdate', () => {
      if (bgm.duration) {
        progressBar.value = String((bgm.currentTime / bgm.duration) * 100);
      }
      updateTimeDisplay();
    });

    progressBar.addEventListener('input', (e) => {
      if (bgm.duration) {
        bgm.currentTime = (parseFloat(e.target.value) / 100) * bgm.duration;
      }
    });

    volumeSlider.addEventListener('input', (e) => {
      bgm.volume = parseFloat(e.target.value);
      localStorage.setItem('bgm_volume', String(bgm.volume));
    });

    bgm.addEventListener('error', () => {
      const newIndex = (currentSongIndex + 1) % playlist.length;
      changeSong(newIndex);
    });

    bgm.addEventListener('loadedmetadata', updateTimeDisplay);
    bgm.addEventListener('durationchange', updateTimeDisplay);

    window.addEventListener('beforeunload', () => {
      sessionStorage.setItem('bgm_time', String(bgm.currentTime));
    });

    const shouldPlay = sessionStorage.getItem('bgm_playing');
    if (shouldPlay === 'true') {
      playMusic();
    } else if (shouldPlay === null) {
      bgm.play().then(() => {
        musicBtn.textContent = 'Pause';
        sessionStorage.setItem('bgm_playing', 'true');
      }).catch(() => {
        musicBtn.textContent = 'Play';
        const unlockAudio = () => {
          if (bgm.paused) playMusic();
          document.removeEventListener('click', unlockAudio);
        };
        document.addEventListener('click', unlockAudio);
      });
    } else {
      musicBtn.textContent = 'Play';
    }
  }
})();
