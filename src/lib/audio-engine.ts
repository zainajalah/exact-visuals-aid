// ==========================
// AUDIO SYSTEM
// Tidak pernah autoplay. Dimulai saat user menekan "Mulai perjalanan".
// Kalau file audio tidak ada, pakai Web Audio API sebagai fallback.
// ==========================

type Sfx = "click" | "success" | "whoosh" | "paper";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicEl: HTMLAudioElement | null = null;
let ambientStop: (() => void) | null = null;
let muted = false;
let started = false;

function ensureContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 1;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  slideTo?: number,
) {
  const audio = ensureContext();
  if (!audio || !master) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  const now = audio.currentTime;
  osc.frequency.setValueAtTime(freq, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function noise(duration: number, volume: number, filterFreq: number) {
  const audio = ensureContext();
  if (!audio || !master) return;
  const frames = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  const gain = audio.createGain();
  gain.gain.value = volume;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start();
}

function startAmbient() {
  const audio = ensureContext();
  if (!audio || !master) return;
  const pad = audio.createGain();
  pad.gain.value = 0.0001;
  pad.connect(master);
  pad.gain.exponentialRampToValueAtTime(0.06, audio.currentTime + 4);

  const freqs = [110, 164.81, 220, 277.18];
  const oscs = freqs.map((f, i) => {
    const osc = audio.createOscillator();
    osc.type = i % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = f;
    const lfo = audio.createOscillator();
    const lfoGain = audio.createGain();
    lfo.frequency.value = 0.05 + i * 0.03;
    lfoGain.gain.value = 1.5;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const g = audio.createGain();
    g.gain.value = 0.25 / (i + 1);
    osc.connect(g);
    g.connect(pad);
    osc.start();
    lfo.start();
    return [osc, lfo] as const;
  });

  ambientStop = () => {
    oscs.flat().forEach((o) => {
      try {
        o.stop();
      } catch {
        /* already stopped */
      }
    });
    pad.disconnect();
  };
}

export const audio = {
  start(musicSrc: string, volume: number) {
    if (started) return;
    started = true;
    ensureContext();
    if (musicSrc) {
      try {
        musicEl = new Audio(musicSrc);
        musicEl.loop = true;
        musicEl.volume = muted ? 0 : volume;
        musicEl.play().catch(() => {
          musicEl = null;
          startAmbient();
        });
        musicEl.addEventListener("error", () => {
          musicEl = null;
          startAmbient();
        });
      } catch {
        startAmbient();
      }
    } else {
      startAmbient();
    }
  },

  play(sfx: Sfx) {
    if (muted) return;
    switch (sfx) {
      case "click":
        tone(880, 0.12, "sine", 0.12, 1320);
        break;
      case "success":
        tone(523.25, 0.18, "sine", 0.12);
        setTimeout(() => tone(659.25, 0.18, "sine", 0.12), 90);
        setTimeout(() => tone(783.99, 0.35, "sine", 0.12), 180);
        break;
      case "whoosh":
        noise(0.7, 0.18, 900);
        tone(600, 0.6, "sawtooth", 0.05, 120);
        break;
      case "paper":
        noise(0.35, 0.09, 2600);
        break;
    }
  },

  toggleMute() {
    muted = !muted;
    if (master && ctx) master.gain.value = muted ? 0 : 1;
    if (musicEl) musicEl.volume = muted ? 0 : CONFIG_VOLUME;
    return muted;
  },

  isMuted() {
    return muted;
  },

  stopAll() {
    ambientStop?.();
    ambientStop = null;
    musicEl?.pause();
    musicEl = null;
    started = false;
  },
};

let CONFIG_VOLUME = 0.2;
export function setMusicVolume(v: number) {
  CONFIG_VOLUME = v;
  if (musicEl && !muted) musicEl.volume = v;
}
