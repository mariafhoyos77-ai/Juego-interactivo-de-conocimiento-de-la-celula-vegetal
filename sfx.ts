/** Efectos de sonido sintetizados con Web Audio (sin archivos externos). */
let ctx: AudioContext | null = null;
let muted = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  start: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.08
) {
  const c = getCtx();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  gain.gain.setValueAtTime(0, c.currentTime + start);
  gain.gain.linearRampToValueAtTime(volume, c.currentTime + start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + duration);
  osc.connect(gain).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + duration + 0.05);
}

export const sfx = {
  setMuted(v: boolean) {
    muted = v;
  },
  isMuted() {
    return muted;
  },
  click() {
    tone(660, 0, 0.08, "triangle", 0.05);
  },
  checkpoint() {
    tone(523, 0, 0.18, "sine");
    tone(659, 0.12, 0.18, "sine");
    tone(784, 0.24, 0.3, "sine");
  },
  correct() {
    tone(523, 0, 0.15, "triangle");
    tone(659, 0.1, 0.15, "triangle");
    tone(784, 0.2, 0.15, "triangle");
    tone(1047, 0.3, 0.4, "triangle");
  },
  wrong() {
    tone(220, 0, 0.25, "sawtooth", 0.05);
    tone(185, 0.18, 0.35, "sawtooth", 0.05);
  },
  fanfare() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((n, i) => tone(n, i * 0.12, 0.3, "triangle", 0.07));
  },
};
