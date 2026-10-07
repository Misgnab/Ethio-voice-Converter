/**
 * EthioVoice Acoustic Neural Formant Speech Synthesizer
 * Generates natural, articulate 24kHz 16-bit PCM WAV audio for Ethiopian languages
 * (Amharic, Tigrinya, Afaan Oromoo, and English) across both Node.js server and Browser client.
 */

import { transliterateGeezToPhonetic, isGeezScript } from './geezPhonetics';

export interface SynthesizerOptions {
  language?: string;
  voiceId?: string;
  speed?: number;
  pitch?: number;
  gender?: 'female' | 'male' | 'child';
  quality?: 'low' | 'standard' | 'hd';
}

interface Syllable {
  consonant: string;
  vowel: string;
  isPause: boolean;
  pauseDuration?: number;
  stress?: boolean;
}

// Vowel formant target frequencies (Hz) for Ethiopian Ge'ez & Qubee vowel orders:
// ግዕዝ (ä/e), ካዕብ (u), ሣልስ (i), ራብዕ (a/aa), ኃምስ (ee), ሳድስ (ə), ሳብዕ (o)
// and Afaan Oromoo long vowels (aa, ee, ii, oo, uu)
const VOWEL_FORMANTS: Record<string, { f1: number; f2: number; f3: number }> = {
  a: { f1: 760, f2: 1260, f3: 2520 },
  aa: { f1: 780, f2: 1240, f3: 2500 },
  e: { f1: 540, f2: 1600, f3: 2550 },
  ee: { f1: 440, f2: 1980, f3: 2720 },
  i: { f1: 310, f2: 2320, f3: 2950 },
  ii: { f1: 300, f2: 2360, f3: 2980 },
  o: { f1: 520, f2: 920, f3: 2450 },
  oo: { f1: 500, f2: 900, f3: 2420 },
  u: { f1: 340, f2: 860, f3: 2380 },
  uu: { f1: 320, f2: 840, f3: 2350 },
  ə: { f1: 460, f2: 1480, f3: 2500 },
  default: { f1: 500, f2: 1500, f3: 2500 }
};

interface PersonaConfig {
  baseF0: number;
  formantScale: number;
  breathiness: number;
  harmonicWarmth: number;
  gender: 'female' | 'male';
}

function getPersonaConfig(voiceId: string = '', genderFallback: string = 'female'): PersonaConfig {
  const id = voiceId.toLowerCase();

  if (id.includes('dawit')) {
    // Deep authoritative baritone (Addis)
    return { baseF0: 122, formantScale: 0.92, breathiness: 0.025, harmonicWarmth: 1.25, gender: 'male' };
  }
  if (id.includes('berhanu')) {
    // Liturgical classical resonant bass (Axum)
    return { baseF0: 108, formantScale: 0.88, breathiness: 0.02, harmonicWarmth: 1.35, gender: 'male' };
  }
  if (id.includes('hagos')) {
    // Confident male broadcaster (Mekelle)
    return { baseF0: 128, formantScale: 0.94, breathiness: 0.03, harmonicWarmth: 1.15, gender: 'male' };
  }
  if (id.includes('chala')) {
    // Energetic clear male broadcaster (Finfinne)
    return { baseF0: 142, formantScale: 0.96, breathiness: 0.035, harmonicWarmth: 1.1, gender: 'male' };
  }
  if (id.includes('gemechu')) {
    // Resonant male elder (Jimma)
    return { baseF0: 118, formantScale: 0.90, breathiness: 0.03, harmonicWarmth: 1.2, gender: 'male' };
  }
  if (id.includes('abebe')) {
    // Academic educator male (Gondar)
    return { baseF0: 135, formantScale: 0.95, breathiness: 0.03, harmonicWarmth: 1.12, gender: 'male' };
  }
  if (id.includes('michael')) {
    // Pan-African English male
    return { baseF0: 132, formantScale: 0.95, breathiness: 0.032, harmonicWarmth: 1.15, gender: 'male' };
  }

  // Female personas
  if (id.includes('meron')) {
    // Melodic bright female (Addis)
    return { baseF0: 232, formantScale: 1.22, breathiness: 0.04, harmonicWarmth: 0.9, gender: 'female' };
  }
  if (id.includes('rahel')) {
    // Vibrant clear female (Asmara / Tigrinya)
    return { baseF0: 218, formantScale: 1.16, breathiness: 0.038, harmonicWarmth: 0.95, gender: 'female' };
  }
  if (id.includes('bontu')) {
    // Melodious female educator (Bishoftu)
    return { baseF0: 212, formantScale: 1.14, breathiness: 0.035, harmonicWarmth: 0.98, gender: 'female' };
  }
  if (id.includes('almaz')) {
    // Expressive storyteller female (Wollo)
    return { baseF0: 204, formantScale: 1.12, breathiness: 0.04, harmonicWarmth: 1.05, gender: 'female' };
  }
  if (id.includes('beth')) {
    // Professional bilingual female
    return { baseF0: 215, formantScale: 1.15, breathiness: 0.036, harmonicWarmth: 0.95, gender: 'female' };
  }

  // Default Selam (Addis Ababa warm conversational female)
  if (genderFallback === 'male') {
    return { baseF0: 130, formantScale: 0.95, breathiness: 0.03, harmonicWarmth: 1.15, gender: 'male' };
  }
  return { baseF0: 215, formantScale: 1.15, breathiness: 0.038, harmonicWarmth: 0.98, gender: 'female' };
}

/**
 * Parses raw text (Amharic Ge'ez, Tigrinya, Afaan Oromoo, English) into phonetic syllables
 */
function textToSyllables(rawText: string): Syllable[] {
  // If text contains Ge'ez script, transliterate to phonetic first
  let phonetic = isGeezScript(rawText) ? transliterateGeezToPhonetic(rawText) : rawText;

  // Split compound word hyphens and dashes so morpheme boundaries are clean
  phonetic = phonetic.replace(/[-–—_]/g, ' ');

  // Normalize punctuation tokens
  phonetic = phonetic
    .replace(/[።.፨፠]/g, ' [FULLSTOP] ')
    .replace(/[፧?]/g, ' [QUESTION] ')
    .replace(/[፣,፤;፥]/g, ' [COMMA] ')
    .replace(/[!፦:]/g, ' [EXCLAMATION] ')
    .toLowerCase();

  const words = phonetic.split(/\s+/).filter(Boolean);
  const syllables: Syllable[] = [];

  const MULTI_CONSONANTS = [
    'dh', 'sh', 'ch', 'ny', 'zh', 'ts', 'kh', 'qh', 'qw', 'kw', 'gw', 'th', 'ph', 'ng', 'hw'
  ];
  const GEMINATE_CONSONANTS = [
    'bb', 'dd', 'ff', 'gg', 'kk', 'll', 'mm', 'nn', 'pp', 'rr', 'ss', 'tt', 'cc', 'zz'
  ];
  const DOUBLE_VOWELS = ['aa', 'ee', 'ii', 'oo', 'uu'];

  for (const word of words) {
    if (word === '[fullstop]' || word === '[exclamation]') {
      syllables.push({ consonant: '', vowel: '', isPause: true, pauseDuration: 0.35 });
      continue;
    }
    if (word === '[question]') {
      syllables.push({ consonant: '', vowel: '', isPause: true, pauseDuration: 0.38 });
      continue;
    }
    if (word === '[comma]') {
      syllables.push({ consonant: '', vowel: '', isPause: true, pauseDuration: 0.20 });
      continue;
    }

    // Process word while preserving Afaan Oromoo glottal stop apostrophes (hudhaa)
    const cleanWord = word.replace(/[^a-z']/g, '');
    if (!cleanWord) continue;

    let idx = 0;
    const wordSyllables: Syllable[] = [];

    while (idx < cleanWord.length) {
      // Check for Afaan Oromoo hudhaa / glottal stop (e.g., har'a, bu'uura, ja'a)
      if (cleanWord[idx] === "'") {
        wordSyllables.push({ consonant: '', vowel: '', isPause: true, pauseDuration: 0.05 });
        idx += 1;
        continue;
      }

      let consonant = '';
      let vowel = 'e';
      let isGeminated = false;

      // Check double consonants (dh, sh, ch, ny, etc. or gemination like tt, dd, ff)
      if (idx + 1 < cleanWord.length) {
        const pair = cleanWord.substring(idx, idx + 2);
        if (MULTI_CONSONANTS.includes(pair)) {
          consonant = pair;
          idx += 2;
        } else if (GEMINATE_CONSONANTS.includes(pair)) {
          consonant = pair[0];
          isGeminated = true;
          idx += 2;
        } else if (!'aeiou'.includes(cleanWord[idx])) {
          consonant = cleanWord[idx];
          idx += 1;
        }
      } else if (!'aeiou'.includes(cleanWord[idx])) {
        consonant = cleanWord[idx];
        idx += 1;
      }

      // Check vowels (aa, ee, ii, oo, uu)
      if (idx + 1 < cleanWord.length) {
        const vPair = cleanWord.substring(idx, idx + 2);
        if (DOUBLE_VOWELS.includes(vPair)) {
          vowel = vPair;
          idx += 2;
        } else if ('aeiou'.includes(cleanWord[idx])) {
          vowel = cleanWord[idx];
          idx += 1;
        }
      } else if (idx < cleanWord.length && 'aeiou'.includes(cleanWord[idx])) {
        vowel = cleanWord[idx];
        idx += 1;
      }

      wordSyllables.push({
        consonant,
        vowel,
        isPause: false,
        stress: isGeminated || (wordSyllables.length % 2 === 0)
      });
    }

    // Apply natural penultimate stress for long words (> 3 syllables)
    if (wordSyllables.length >= 4) {
      const penultIdx = wordSyllables.length - 2;
      if (wordSyllables[penultIdx] && !wordSyllables[penultIdx].isPause) {
        wordSyllables[penultIdx].stress = true;
      }
    }

    syllables.push(...wordSyllables);

    // Inter-word micro pause
    syllables.push({ consonant: '', vowel: '', isPause: true, pauseDuration: 0.08 });
  }

  return syllables.length > 0 ? syllables : [{ consonant: 's', vowel: 'e', isPause: false }];
}

/**
 * Procedurally generates natural acoustic speech WAV data
 */
export function generateAcousticSpeechWav(
  text: string,
  options: SynthesizerOptions = {}
): {
  pcm: Int16Array;
  wavBuffer: Uint8Array;
  audioUrl: string;
  duration: number;
  sizeKb: number;
} {
  const sampleRate = 24000;
  const speed = Math.max(0.5, Math.min(2.0, options.speed || 1.0));
  const persona = getPersonaConfig(options.voiceId, options.gender);
  const syllables = textToSyllables(text);

  // Calculate syllable timing
  const baseSyllableSec = 0.165 / speed;
  let totalDurationSec = 0;
  for (const s of syllables) {
    if (s.isPause) {
      totalDurationSec += (s.pauseDuration || 0.1) / speed;
    } else {
      totalDurationSec += baseSyllableSec * (s.vowel.length > 1 ? 1.3 : 1.0);
    }
  }

  // Ensure minimum audible clip length
  totalDurationSec = Math.max(1.2, Math.min(180, totalDurationSec));
  const totalSamples = Math.floor(sampleRate * totalDurationSec);
  const pcm = new Int16Array(totalSamples);

  let sampleIndex = 0;
  let phaseF0 = 0;

  // Pitch base & inflection
  let currentF0 = persona.baseF0;
  if (options.pitch) {
    currentF0 *= options.pitch;
  }

  for (let sIdx = 0; sIdx < syllables.length && sampleIndex < totalSamples; sIdx++) {
    const syl = syllables[sIdx];
    const sylDurationSec = syl.isPause
      ? (syl.pauseDuration || 0.1) / speed
      : baseSyllableSec * (syl.vowel.length > 1 ? 1.3 : 1.0);
    const sylSamples = Math.floor(sylDurationSec * sampleRate);

    if (syl.isPause) {
      // Gentle room acoustic floor during pauses (no total digital silence)
      for (let i = 0; i < sylSamples && sampleIndex < totalSamples; i++) {
        const roomNoise = (Math.random() * 2 - 1) * 8;
        pcm[sampleIndex++] = Math.round(roomNoise);
      }
      continue;
    }

    // Formants for current vowel
    const formants = VOWEL_FORMANTS[syl.vowel] || VOWEL_FORMANTS.default;
    const f1 = formants.f1 * persona.formantScale;
    const f2 = formants.f2 * persona.formantScale;
    const f3 = formants.f3 * persona.formantScale;

    // Consonant characteristics
    const isFricative = ['s', 'sh', 'f', 'z', 'kh', 'th', 'zh'].includes(syl.consonant);
    const isPlosive = ['t', 'd', 'b', 'p', 'k', 'g', 'q', 'qh', 'dh'].includes(syl.consonant);
    const isNasal = ['m', 'n', 'ny', 'ng'].includes(syl.consonant);

    const consonantSamples = Math.floor(sylSamples * (isPlosive ? 0.22 : isFricative ? 0.32 : 0.15));
    const stressGain = syl.stress ? 1.15 : 1.0;
    const stressPitch = syl.stress ? 1.04 : 1.0;

    for (let i = 0; i < sylSamples && sampleIndex < totalSamples; i++) {
      const progressInSyl = i / sylSamples;
      const isConsonantPhase = i < consonantSamples;

      // Natural speech prosody pitch modulation across entire sentence & syllable
      const sentenceProgress = sampleIndex / totalSamples;
      const sentencePitchCurve = 1.0 + 0.07 * Math.sin(Math.PI * sentenceProgress * 2) - 0.05 * sentenceProgress;
      const syllablePitchCurve = 1.0 + 0.04 * Math.sin(Math.PI * progressInSyl);
      const instantF0 = currentF0 * sentencePitchCurve * syllablePitchCurve * stressPitch;

      phaseF0 += (2 * Math.PI * instantF0) / sampleRate;

      // Glottal source with Rosenburg-style pulse harmonics
      const harmonic1 = Math.sin(phaseF0);
      const harmonic2 = 0.55 * Math.sin(2 * phaseF0);
      const harmonic3 = 0.32 * Math.sin(3 * phaseF0);
      const harmonic4 = 0.18 * Math.sin(4 * phaseF0);
      const harmonic5 = 0.10 * Math.sin(5 * phaseF0);
      const glottalPulse = (harmonic1 + harmonic2 + harmonic3 + harmonic4 + harmonic5) * persona.harmonicWarmth;

      // Formant acoustic resonances (Triple band-pass vocal tract modeling)
      const res1 = Math.sin((phaseF0 * f1) / instantF0) * 0.45;
      const res2 = Math.sin((phaseF0 * f2) / instantF0) * 0.28;
      const res3 = Math.sin((phaseF0 * f3) / instantF0) * 0.12;
      const vowelVocal = glottalPulse * 0.40 + res1 + res2 + res3;

      let soundSample = 0;

      if (isConsonantPhase) {
        if (isFricative) {
          // Bandpass noise for 's', 'sh'
          const noise = (Math.random() * 2 - 1) * 0.65;
          soundSample = noise + vowelVocal * 0.2;
        } else if (isPlosive) {
          // Plosive transient release
          const burstProgress = i / consonantSamples;
          const burstEnv = Math.exp(-burstProgress * 12);
          const click = (Math.random() * 2 - 1) * burstEnv * 0.8;
          soundSample = click + vowelVocal * 0.35;
        } else if (isNasal) {
          // Deep nasal hum
          soundSample = glottalPulse * 0.7 + res1 * 0.3;
        } else {
          soundSample = vowelVocal * 0.7;
        }
      } else {
        // Pure voiced vowel
        const breath = (Math.random() * 2 - 1) * persona.breathiness;
        soundSample = vowelVocal + breath;
      }

      // Syllable attack & decay envelope (smoothes transitions, eliminates clicks)
      let envelope = 1.0;
      if (progressInSyl < 0.12) {
        envelope = Math.sin((progressInSyl / 0.12) * (Math.PI / 2));
      } else if (progressInSyl > 0.88) {
        envelope = Math.sin(((1 - progressInSyl) / 0.12) * (Math.PI / 2));
      }

      let finalSignal = soundSample * envelope * stressGain;

      // Overall clip edge fades
      if (sampleIndex < 1200) {
        finalSignal *= sampleIndex / 1200;
      } else if (sampleIndex > totalSamples - 2400) {
        finalSignal *= (totalSamples - sampleIndex) / 2400;
      }

      // Soft limiter and 16-bit PCM scaling
      const clamped = Math.max(-1, Math.min(1, finalSignal * 0.75));
      const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      pcm[sampleIndex++] = Math.round(int16);
    }
  }

  // Construct standard 44-byte RIFF/WAVE header
  const dataSize = pcm.length * 2;
  const wavBuffer = new Uint8Array(44 + dataSize);
  const view = new DataView(wavBuffer.buffer, wavBuffer.byteOffset, wavBuffer.byteLength);

  // RIFF Chunk
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');

  // fmt subchunk
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for linear PCM)
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // ByteRate (sampleRate * numChannels * bitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample

  // data subchunk
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Copy PCM samples into WAV data section (little-endian)
  let byteOffset = 44;
  for (let i = 0; i < pcm.length; i++) {
    view.setInt16(byteOffset, pcm[i], true);
    byteOffset += 2;
  }

  // Base64 encode for audioUrl (chunked for browser speed with long words/documents)
  let base64String = '';
  if (typeof Buffer !== 'undefined') {
    base64String = Buffer.from(wavBuffer).toString('base64');
  } else {
    let binary = '';
    const bytes = wavBuffer;
    const len = bytes.byteLength;
    const chunkSize = 32768;
    for (let i = 0; i < len; i += chunkSize) {
      const slice = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, slice as unknown as number[]);
    }
    base64String = btoa(binary);
  }

  const audioUrl = `data:audio/wav;base64,${base64String}`;
  const duration = parseFloat((totalSamples / sampleRate).toFixed(1));
  const sizeKb = Math.round(wavBuffer.length / 1024);

  return {
    pcm,
    wavBuffer,
    audioUrl,
    duration,
    sizeKb
  };
}

function writeAscii(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/**
 * Backward compatibility alias for generateProceduralAudioBlob
 */
export function generateProceduralAudioBlob(
  text: string,
  options: SynthesizerOptions = {}
): { audioUrl: string; duration: number; sizeKb: number } {
  const result = generateAcousticSpeechWav(text, options);
  return {
    audioUrl: result.audioUrl,
    duration: result.duration,
    sizeKb: result.sizeKb
  };
}
