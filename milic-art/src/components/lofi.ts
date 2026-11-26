/**
 * Musiquita lofi generada en el navegador (WebAudio): original, sin archivos ni licencias.
 * Acordes suaves (Am7 - Fmaj7 - Cmaj7 - G6), bajo, un golpecito de bombo, y una melodía pentatónica al azar.
 */
type Lofi = { start: () => void; stop: () => void; isOn: () => boolean };

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const CHORDS = [
  [57, 60, 64, 67], // Am7
  [53, 57, 60, 64], // Fmaj7
  [48, 55, 59, 64], // Cmaj7
  [55, 59, 62, 64], // G6
];
const BASS = [45, 41, 36, 43];
const PENTA = [69, 72, 74, 76, 79, 81];

export function createLofi(): Lofi {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timer: number | null = null;
  let on = false;
  let step = 0;
  let next = 0;
  const BPM = 68;
  const beat = 60 / BPM;

  function tone(t: number, midi: number, dur: number, vol: number, type: OscillatorType, dest: AudioNode) {
    const o = ctx!.createOscillator();
    const g = ctx!.createGain();
    o.type = type;
    o.frequency.value = mtof(midi);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(dest);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noise(t: number, dur: number, vol: number, hp: number, dest: AudioNode) {
    const n = Math.floor(ctx!.sampleRate * dur);
    const buf = ctx!.createBuffer(1, n, ctx!.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx!.createBufferSource();
    s.buffer = buf;
    const f = ctx!.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = hp;
    const g = ctx!.createGain();
    g.gain.value = vol;
    s.connect(f).connect(g).connect(dest);
    s.start(t);
  }

  function schedule() {
    if (!ctx || !master) return;
    while (next < ctx.currentTime + 0.6) {
      const bar = Math.floor(step / 4) % CHORDS.length;
      const inBar = step % 4;
      if (inBar === 0) {
        CHORDS[bar].forEach((m, i) => tone(next + i * 0.018, m, beat * 3.6, 0.05, "triangle", master!));
        tone(next, BASS[bar], beat * 1.8, 0.13, "sine", master!);
      }
      if (inBar === 0 || inBar === 2) tone(next, 36, 0.22, 0.2, "sine", master!); // bombito
      noise(next + beat * 0.5, 0.05, 0.05, 6000, master!); // hi-hat
      if (inBar === 1 || inBar === 3) noise(next, 0.12, 0.05, 1800, master!); // caja suave
      if (Math.random() < 0.5) tone(next + beat * (Math.random() < 0.5 ? 0 : 0.5), PENTA[Math.floor(Math.random() * PENTA.length)], beat * 1.4, 0.04, "sine", master!);
      next += beat;
      step++;
    }
  }

  return {
    start() {
      if (on) return;
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = ctx ?? new AC();
      void ctx.resume();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1800;
      master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
      master.connect(lp).connect(ctx.destination);
      next = ctx.currentTime + 0.1;
      step = 0;
      on = true;
      schedule();
      timer = window.setInterval(schedule, 250);
    },
    stop() {
      if (!on || !ctx || !master) return;
      on = false;
      if (timer) window.clearInterval(timer);
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      const m = master;
      window.setTimeout(() => m.disconnect(), 800);
    },
    isOn: () => on,
  };
}
