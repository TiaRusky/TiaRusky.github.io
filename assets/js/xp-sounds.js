/**
 * xp-sounds.js - Windows XP sound effects synthesized via Web Audio API
 * No external audio files needed — everything generated on-the-fly.
 */

const XPSounds = (() => {
  let audioCtx_ = null;
  let muted_ = false;
  let initialized_ = false;

  // ---- AudioContext init (must happen on user gesture) ----
  function init() {
    if (initialized_ && audioCtx_ && audioCtx_.state === 'running') return;
    try {
      audioCtx_ = new (window.AudioContext || window.webkitAudioContext)();
      initialized_ = true;
    } catch(e) {
      console.warn('Web Audio API not available');
    }
  }

  function ensureCtx() {
    if (!audioCtx_ || audioCtx_.state === 'closed') {
      init();
    }
    return audioCtx_ && audioCtx_.state !== 'closed';
  }

  // ---- Helpers ----

  /** Create a short oscillator sweep */
  function sweep(freqStart, freqEnd, duration, type, vol = 0.12) {
    if (muted_) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.linearRampToValueAtTime(freqEnd, now + duration);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  /** Short noise burst for clicks */
  function noiseBurst(duration, vol = 0.06) {
    if (muted_) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    // Bandpass filter for a "click" feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
  }

  /** Two-tone "tick" */
  function tick(vol = 0.08) {
    if (muted_) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    [2400, 3200].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.015);
      gain.gain.setValueAtTime(vol, now + i * 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.015 + 0.03);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.015);
      osc.stop(now + i * 0.015 + 0.04);
    });
  }

  /** Play a sequence of notes (for startup jingle) */
  function playSequence(notes, totalTime, vol = 0.1, type = 'sine') {
    if (muted_) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const noteDuration = totalTime / notes.length;
    notes.forEach((freq, i) => {
      const startTime = now + i * noteDuration;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.02);
      gain.gain.setValueAtTime(vol, startTime + noteDuration * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + noteDuration);
    });
  }

  /** Deep "error" sound — detuned low oscillators */
  function errorSound() {
    if (muted_) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.6;
    [110, 130, 165].forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(freq * 0.7, now + dur);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0, now + dur * 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      // Lowpass filter for muddy feel
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(100, now + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.01);
    });
  }

  /** Soft notification ping */
  function ping(vol = 0.08) {
    if (muted_) return;
    const ctx = ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.08);
    osc.frequency.linearRampToValueAtTime(1000, now + 0.2);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // ---- Public Sound Library ----

  /** Windows XP startup jingle — a gentle rising chord progression */
  function startup() {
    if (muted_) return;
    // Classic XP-ish rising melody (A4-based): E4 → A4 → C#5 → E5 → A5
    const melody = [329.63, 440, 554.37, 659.25, 880];
    playSequence(melody, 1.6, 0.07, 'triangle');
    // Layer soft pad underneath
    setTimeout(() => {
      const ctx = ensureCtx();
      if (!ctx || muted_) return;
      const now = ctx.currentTime;
      [440, 554, 659].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2);
      });
    }, 50);
  }

  /** Click sound — short tick */
  function click() {
    noiseBurst(0.02, 0.045);
    tick(0.03);
  }

  /** Window opens — ascending sweep */
  function windowOpen() {
    sweep(600, 1800, 0.12, 'sine', 0.06);
  }

  /** Window closes — descending sweep */
  function windowClose() {
    sweep(1200, 300, 0.15, 'sine', 0.05);
  }

  /** Window minimizes — quick descending sweep */
  function minimize() {
    sweep(800, 200, 0.1, 'triangle', 0.05);
  }

  /** Window maximizes — quick ascending sweep */
  function maximize() {
    sweep(400, 1200, 0.1, 'triangle', 0.06);
  }

  /** Start menu opens — soft pop */
  function menuOpen() {
    tick(0.07);
  }

  /** Error / critical stop — low "dun" */
  function error() {
    errorSound();
  }

  /** Notification balloon */
  function notify() {
    ping(0.07);
  }

  /** Generic button/UI click */
  function uiClick() {
    tick(0.04);
  }

  // ---- Mute control ----

  function toggleMute() {
    muted_ = !muted_;
    updateMuteIcon();
    return muted_;
  }

  function isMuted() {
    return muted_;
  }

  function updateMuteIcon() {
    const icon = document.getElementById('sound-icon');
    if (icon) {
      icon.innerHTML = muted_ ? '🔇' : '🔊';
    }
  }

  // ---- Expose init for early user gesture ----
  return {
    init,
    startup,
    click,
    windowOpen,
    windowClose,
    minimize,
    maximize,
    menuOpen,
    error,
    notify,
    uiClick,
    toggleMute,
    isMuted,
    updateMuteIcon
  };
})();
