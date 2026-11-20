// Text-to-Speech with Mistral Voxtral. Caches each WAV file by model, voice and text,
// so a second run of an unchanged scene does not call the API again.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const MODEL = process.env.VIDEO_TTS_MODEL ?? 'voxtral-mini-tts-3-0';
// One native voice per language: Heidi for German, Mary for British English.
const VOICES = { de: 'voice_481', en: 'voice_1787' };
// Pronunciation hints. Only English IPA phonemes are allowed. Without the hint
// the voice pronounces "b.tree" wrong.
const PHONEME_HINTS = { 'b.tree': ['b', 'i', 't', 'ɹ', 'i'] };

// Returns the path of the WAV file for the text in the language. WAV, because the MP3 files of
// Voxtral have no length header and ffprobe gets their duration wrong by up to 1.6 s.
// The hints are more pronunciation hints for this text. Words are case-sensitive.
export async function speech(text, lang, cacheDir, hints = {}) {
  const phonemeHints = { ...PHONEME_HINTS, ...hints };
  const voice = VOICES[lang];
  if (!voice) {
    throw new Error(`No voice for the language ${lang}`);
  }
  const key = createHash('sha256')
    .update(JSON.stringify([MODEL, voice, phonemeHints, text]))
    .digest('hex')
    .slice(0, 16);
  const file = path.join(cacheDir, `${key}.wav`);
  if (existsSync(file)) {
    return file;
  }
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('Set MISTRAL_API_KEY in the environment or in .env');
  }
  const response = await fetch('https://api.mistral.ai/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      input: text,
      response_format: 'wav',
      voice_id: voice,
      phoneme_hints: phonemeHints,
    }),
  });
  if (!response.ok) {
    throw new Error(`Mistral TTS ${response.status}: ${await response.text()}`);
  }
  const { audio_data } = await response.json();
  mkdirSync(cacheDir, { recursive: true });
  writeFileSync(file, Buffer.from(audio_data, 'base64'));
  return file;
}
