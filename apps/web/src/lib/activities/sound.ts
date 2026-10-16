// Voice lines and simple sounds for the child-facing games. There are no recorded clips yet
// (OPEN_QUESTIONS #8): voice lines use the browser's speech synthesis when it has a voice for
// the language, and otherwise fall back to a chime so the child still gets a cue.

type Line = { bn: string; en: string };

function voiceFor(lang: "bn" | "en"): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang.toLowerCase().startsWith(lang)) ?? null;
}

/** Voices load asynchronously in Chrome; ask early so the first line isn't silent. */
export function warmUpSpeech() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.getVoices();
}

/** Says the line in the page's language without waiting for it to finish, so the games keep
 *  their timings. Returns false when no voice could say it (a chime played instead). */
export function say(line: Line, locale: string): boolean {
  const lang = locale === "en" ? "en" : "bn";
  const voice = voiceFor(lang);
  if (!voice) {
    chime();
    return false;
  }
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(line[lang]);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = 0.95;
  utterance.pitch = 1.2;
  speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeech() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

let output: AudioContext | null = null;

function context(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  output ??= new AudioContext();
  void output.resume().catch(() => undefined);
  return output;
}

function tone(frequency: number, start: number, duration: number, volume = 0.18) {
  const ctx = context();
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

/** A soft bell: the calibration star moving, or a cue without a voice. */
export function chime() {
  tone(988, 0, 0.6, 0.14);
  tone(1480, 0.02, 0.5, 0.06);
}

/** A happy rising arpeggio for the reward. */
export function reward() {
  [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.35, 0.12));
}

// A gentle pentatonic tune for Look & watch, looped. Not a traditional rhyme yet (OPEN_QUESTIONS #7).
const TUNE = [392, 440, 523, 440, 392, 330, 392, 0, 392, 440, 523, 587, 523, 440, 392, 0];
const BEAT_S = 0.32;

/** Starts the music; the returned function stops it. */
export function playTune(): () => void {
  let stopped = false;
  let timer = 0;
  const bar = () => {
    if (stopped) return;
    TUNE.forEach((f, i) => f && tone(f, i * BEAT_S, BEAT_S * 0.9, 0.08));
    timer = window.setTimeout(bar, TUNE.length * BEAT_S * 1000);
  };
  bar();
  return () => {
    stopped = true;
    window.clearTimeout(timer);
  };
}

/** Returns false where the phone can't vibrate (iPhone, most laptops), so the caller can show a
 *  visual cue instead. */
export function vibrate(ms: number): boolean {
  try {
    return navigator.vibrate?.(ms) ?? false;
  } catch {
    return false;
  }
}
