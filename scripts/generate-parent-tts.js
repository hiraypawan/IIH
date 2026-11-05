#!/usr/bin/env node
// Generate parent-reel voice-over audio using Google Gemini TTS.
// Usage: GEMINI_API_KEY=... node scripts/generate-parent-tts.js
// Output: assets/audio/parent/{en,hi,mr}/00.wav ... 39.wav
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const OUT_BASE = path.join(ROOT, 'assets', 'audio', 'parent');
const WRAPPER = path.join(ROOT, 'parents', 'IIH _ A short for parents_files', 'index.html');
const MODEL = 'gemini-2.5-flash-preview-tts';
const VOICE = { en: 'Kore', hi: 'Kore', mr: 'Kore' };
const LANG_CODE = { en: 'en-US', hi: 'hi-IN', mr: 'mr-IN' };
const SLEEP_MS = 6500; // free tier ~10 RPM

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Set GEMINI_API_KEY env var. Get one at https://aistudio.google.com/apikey');
  process.exit(1);
}

// Extract the 40 English lines from the wrapper.
const wrapperSrc = fs.readFileSync(WRAPPER, 'utf8');
const m = wrapperSrc.match(/const lines=\[([\s\S]*?)\];/);
if (!m) { console.error('Could not find lines array'); process.exit(1); }
const lines = eval('[' + m[1] + ']');
if (!Array.isArray(lines) || lines.length === 0) { console.error('Bad lines'); process.exit(1); }
console.log('Found', lines.length, 'lines');

// Hindi/Marathi lines are embedded in the reel; for now use English lines for all.
// (Replace with translated arrays if available.)
const texts = { en: lines, hi: lines, mr: lines };

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function generate(text, voice, lang) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: `Read aloud in a warm, natural voice: ${text}` }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const b64 = j?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (!b64) { reject(new Error('No audio: ' + JSON.stringify(j).slice(0, 300))); return; }
          const pcm = Buffer.from(b64, 'base64');
          // Wrap PCM (24kHz, 16-bit, mono) in WAV header.
          const wav = pcmToWav(pcm, 24000, 1, 16);
          resolve(wav);
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function pcmToWav(pcm, sampleRate, channels, bits) {
  const byteRate = sampleRate * channels * bits / 8;
  const blockAlign = channels * bits / 8;
  const dataSize = pcm.length;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(channels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bits, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  pcm.copy(buf, 44);
  return buf;
}

(async () => {
  for (const lang of ['en', 'hi', 'mr']) {
    const dir = path.join(OUT_BASE, lang);
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < texts[lang].length; i++) {
      const out = path.join(dir, `${i}.wav`);
      if (fs.existsSync(out)) { console.log(`skip ${lang}/${i}`); continue; }
      process.stdout.write(`gen ${lang}/${i}... `);
      try {
        const wav = await generate(texts[lang][i], VOICE[lang], LANG_CODE[lang]);
        fs.writeFileSync(out, wav);
        console.log('ok');
      } catch (e) {
        console.log('FAIL:', e.message);
      }
      await sleep(SLEEP_MS);
    }
  }
  console.log('Done.');
})();
