/* Procedural sound and music for Nexus Defender. No external audio assets. */
const GameAudio = (() => {
  const tracks = [
    { bpm: 108, root: 110, wave: "triangle", notes: [0, 7, 12, 7, 3, 7, 10, 7, 0, 7, 12, 14, 3, 7, 10, 7], bass: [0, 0, 3, 5] },
    { bpm: 96, root: 123.47, wave: "sine", notes: [0, 4, 7, 12, 7, 4, 2, 7, 0, 5, 9, 12, 9, 5, 4, 2], bass: [0, 5, 7, 4] },
    { bpm: 122, root: 98, wave: "sawtooth", notes: [0, 0, 7, 0, 3, 0, 8, 7, 0, 0, 10, 7, 3, 0, 8, 5], bass: [0, 3, 5, 7] },
    { bpm: 104, root: 130.81, wave: "triangle", notes: [0, 4, 7, 11, 12, 11, 7, 4, 5, 9, 12, 16, 12, 9, 7, 4], bass: [0, 5, 4, 7] },
    { bpm: 116, root: 82.41, wave: "sawtooth", notes: [0, 1, 7, 1, 5, 1, 8, 7, 0, 1, 10, 8, 5, 1, 7, 1], bass: [0, 1, 5, 8] },
    { bpm: 132, root: 110, wave: "square", notes: [0, 7, 10, 7, 3, 10, 12, 10, 0, 7, 12, 14, 5, 10, 7, 3], bass: [0, 3, 5, 7] },
    { bpm: 144, root: 82.41, wave: "sawtooth", notes: [0, 1, 7, 8, 0, 1, 10, 8, 5, 1, 7, 10, 0, 1, 12, 8], bass: [0, 1, 5, 8] }
  ];
  let context, musicBus, effectsBus, limiter, timer;
  let scene = 0, previousScene = null, changedAt = 0, nextNote = 0, step = 0;
  let effectsVolume = 0.7, musicVolume = 0.35;
  const lastPlayed = new Map();

  function ensure() {
    const AudioEngine = window.AudioContext || window.webkitAudioContext;
    if (!AudioEngine) return null;
    if (!context) {
      context = new AudioEngine();
      limiter = context.createDynamicsCompressor();
      limiter.threshold.value = -14; limiter.ratio.value = 4;
      limiter.attack.value = 0.006; limiter.release.value = 0.16;
      musicBus = context.createGain(); effectsBus = context.createGain();
      musicBus.gain.value = musicVolume;
      effectsBus.gain.value = effectsVolume;
      musicBus.connect(limiter); effectsBus.connect(limiter);
      limiter.connect(context.destination);
    }
    if (context.state === "suspended") context.resume();
    return context;
  }

  function setVolumes(music, effects) {
    musicVolume = Math.max(0, Math.min(1, music));
    effectsVolume = Math.max(0, Math.min(1, effects));
    if (context) {
      const now = context.currentTime;
      musicBus.gain.setTargetAtTime(timer ? musicVolume : 0, now, 0.04);
      effectsBus.gain.setTargetAtTime(effectsVolume, now, 0.03);
    }
  }

  function tone(frequency, end, duration, wave, amount, when, destination, pan = 0) {
    if (!context || amount <= 0) return;
    const oscillator = context.createOscillator(), gain = context.createGain();
    const t = Math.max(context.currentTime, when);
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), t);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), t + duration);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amount), t + Math.min(0.018, duration * 0.18));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    oscillator.connect(gain);
    if (context.createStereoPanner && pan) {
      const panner = context.createStereoPanner();
      panner.pan.value = Math.max(-0.8, Math.min(0.8, pan));
      gain.connect(panner); panner.connect(destination);
    } else gain.connect(destination);
    oscillator.start(t); oscillator.stop(t + duration + 0.01);
  }

  function hiss(duration, amount, when, destination) {
    if (!context || amount <= 0) return;
    const size = Math.ceil(context.sampleRate * duration);
    const buffer = context.createBuffer(1, size, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer; filter.type = "highpass"; filter.frequency.value = 1100;
    const t = Math.max(context.currentTime, when);
    gain.gain.setValueAtTime(Math.max(0.0001, amount), t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    source.connect(filter); filter.connect(gain); gain.connect(destination);
    source.start(t); source.stop(t + duration);
  }

  function play(type, skin = "cyan", position = 0) {
    if (!ensure() || effectsVolume <= 0) return;
    const now = context.currentTime;
    const minimumGap = type === "enemyShot" ? 0.035 : type === "warning" ? 0.08
      : type === "ultimatePulse" ? 0.06 : 0;
    if (now - (lastPlayed.get(type) || -1) < minimumGap) return;
    lastPlayed.set(type, now);
    if (type === "playerShot") {
      if (skin === "violet") {
        tone(760, 550, 0.095, "triangle", 0.035, now, effectsBus, -0.24);
        tone(920, 680, 0.095, "sine", 0.029, now + 0.022, effectsBus, 0.24);
      } else if (skin === "gold") {
        tone(180, 78, 0.19, "sawtooth", 0.072, now, effectsBus, position);
        tone(440, 190, 0.105, "triangle", 0.026, now, effectsBus);
      } else {
        tone(880, 470, 0.062, "triangle", 0.035, now, effectsBus, position);
        tone(1250, 880, 0.043, "sine", 0.018, now, effectsBus);
      }
    } else if (type === "ultimate") {
      const root = skin === "gold" ? 110 : skin === "violet" ? 220 : 330;
      [0, 7, 12].forEach((semitones, index) =>
        tone(root * 2 ** (semitones / 12), root * 2 ** ((semitones + 5) / 12),
          0.42 + index * 0.08, "triangle", 0.065, now + index * 0.035, effectsBus));
      hiss(0.24, 0.023, now, effectsBus);
    } else if (type === "ultimatePulse") {
      tone(680, 290, 0.15, "triangle", 0.06, now, effectsBus);
    } else {
      const presets = {
        collision: [240, 55, 0.27, "sawtooth", 0.10],
        powerUp: [420, 890, 0.22, "sine", 0.06],
        dash: [170, 760, 0.17, "sawtooth", 0.06],
        dashReady: [520, 780, 0.13, "sine", 0.045],
        enemyShot: [310, 170, 0.09, "square", 0.025],
        minePulse: [148, 52, 0.32, "sawtooth", 0.083],
        glitchShift: [840, 205, 0.18, "square", 0.038],
        warning: [560, 390, 0.13, "sine", 0.023],
        level: [330, 660, 0.26, "triangle", 0.065],
        boss: [120, 43, 0.5, "sawtooth", 0.085],
        bossDefeat: [280, 900, 0.5, "triangle", 0.075]
      };
      const preset = presets[type];
      if (!preset) return;
      tone(...preset, now, effectsBus, position);
      if (["collision", "dash", "boss", "minePulse", "glitchShift"].includes(type))
        hiss(type === "minePulse" ? 0.2 : 0.12, 0.018, now, effectsBus);
      if (type === "bossDefeat" || type === "powerUp")
        tone(preset[0] * 1.5, preset[1] * 1.4, preset[2] * 0.75,
          "sine", preset[4] * 0.48, now + 0.06, effectsBus);
    }
  }

  function frequency(root, semitones) { return root * 2 ** (semitones / 12); }
  function playStep(track, index, when, weight) {
    if (weight < 0.03) return;
    const note = track.notes[index % 16];
    const stepLength = 60 / track.bpm / 4;
    tone(frequency(track.root, note) * 2, frequency(track.root, note) * 2,
      stepLength * 0.83, track.wave, 0.045 * weight, when, musicBus);
    if (index % 4 === 0) {
      const bass = frequency(track.root, track.bass[Math.floor(index / 4) % 4]) / 2;
      tone(bass, bass * 0.98, stepLength * 3.2, "sine", 0.06 * weight, when, musicBus);
      tone(92, 43, 0.1, "sine", 0.025 * weight, when, musicBus);
    }
    if (index % 2 === 1 && track.bpm >= 108) hiss(0.035, 0.006 * weight, when, musicBus);
    if (index % 8 === 0) {
      const pad = frequency(track.root, track.bass[Math.floor(index / 4) % 4]);
      tone(pad, pad, stepLength * 7.2, "sine", 0.013 * weight, when, musicBus);
      tone(pad * 1.5, pad * 1.5, stepLength * 7.2, "sine", 0.009 * weight, when, musicBus);
    }
  }

  function schedule() {
    if (!context || !timer) return;
    if (nextNote < context.currentTime - 0.2) nextNote = context.currentTime + 0.03;
    let scheduled = 0;
    while (nextNote < context.currentTime + 0.16 && scheduled++ < 8) {
      const mix = previousScene === null ? 1 : Math.max(0, Math.min(1, (nextNote - changedAt) / 1.2));
      if (previousScene !== null) playStep(tracks[previousScene], step, nextNote, 1 - mix);
      playStep(tracks[scene], step, nextNote, mix);
      if (mix >= 1) previousScene = null;
      nextNote += 60 / tracks[scene].bpm / 4;
      step++;
    }
  }

  function music(scenario, boss, phaseTwo, volume) {
    if (!ensure()) return;
    setVolumes(volume, effectsVolume);
    const nextScene = boss ? phaseTwo ? 6 : 5 : Math.max(0, Math.min(4, scenario));
    if (nextScene !== scene) {
      previousScene = timer ? scene : null;
      scene = nextScene; changedAt = context.currentTime;
    }
    if (!timer) {
      musicBus.gain.setTargetAtTime(musicVolume, context.currentTime, 0.12);
      nextNote = context.currentTime + 0.04;
      timer = window.setInterval(schedule, 25);
      schedule();
    }
  }

  function stop() {
    if (timer) window.clearInterval(timer);
    timer = null;
    if (context) musicBus.gain.setTargetAtTime(0, context.currentTime, 0.08);
  }

  function status() { return { playing: Boolean(timer), scene, trackCount: tracks.length }; }
  return Object.freeze({ ensure, setVolumes, play, music, stop, status });
})();
