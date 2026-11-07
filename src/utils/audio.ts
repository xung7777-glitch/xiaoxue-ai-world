/**
 * Xianxia Web Audio Synthesizer
 * Generates peaceful Guqin notes, crystal bells, sword swishes, and breakthrough chimes.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmAudio: HTMLAudioElement | null = null;
  public isBgmPlaying: boolean = false;
  public onBgmChange?: (playing: boolean) => void;

  public initBgm() {
    if (!this.bgmAudio && typeof window !== 'undefined') {
      this.bgmAudio = new Audio('/assets/audio/xiaoxue_theme_song.mp3');
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0.5;

      this.bgmAudio.onplay = () => {
        this.isBgmPlaying = true;
        if (this.onBgmChange) this.onBgmChange(true);
      };

      this.bgmAudio.onpause = () => {
        this.isBgmPlaying = false;
        if (this.onBgmChange) this.onBgmChange(false);
      };

      this.bgmAudio.onended = () => {
        this.isBgmPlaying = false;
        if (this.onBgmChange) this.onBgmChange(false);
      };
    }
  }

  public toggleBgm() {
    this.initBgm();
    if (!this.bgmAudio) return;

    if (!this.bgmAudio.paused) {
      this.bgmAudio.pause();
    } else {
      this.bgmAudio.play().catch((err) => {
        console.warn('Playback error', err);
        this.isBgmPlaying = false;
        if (this.onBgmChange) this.onBgmChange(false);
      });
    }
  }

  public playBgm() {
    this.initBgm();
    if (this.bgmAudio && this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {});
    }
  }

  public pauseBgm() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play peaceful Chinese pentatonic Guqin / chime sound (Gong, Shang, Jue, Zhi, Yu)
  playChime(noteFreq = 523.25, duration = 1.2) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, this.ctx.currentTime);
      // Gentle pitch bend like a guqin string vibration
      osc.frequency.exponentialRampToValueAtTime(noteFreq * 0.992, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio context autoplay limitations
    }
  }

  // Pentatonic notes (C, D, E, G, A, C5)
  playPentatonic(index = 0) {
    const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
    const freq = scale[index % scale.length];
    this.playChime(freq, 1.4);
  }

  // Qi absorption sparkle
  playQiAbsorb() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((f, idx) => {
        setTimeout(() => {
          this.playChime(f, 0.4);
        }, idx * 70);
      });
    } catch {
      // Ignore audio error
    }
  }

  // Sword slash / flying sword attack
  playSwordSlash() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch {
      // Ignore
    }
  }

  // Breakthrough triumph chime (Major chord flourish)
  playBreakthrough() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playChime(freq, 1.8);
        }, idx * 110);
      });
    } catch {
      // Ignore
    }
  }

  // River water bubble / fish bite
  playWaterSplash() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(240, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // Ignore
    }
  }
}

export const sounds = new SoundSystem();
