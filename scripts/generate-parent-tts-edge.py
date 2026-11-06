# Generate parent-reel voice-over audio using Microsoft Edge TTS (free, unlimited, neural voices).
# No API key required. Produces far more natural audio than gTTS.
# Setup: pip install edge-tts
# Run:   python scripts/generate-parent-tts-edge.py
# Output: assets/audio/parent/{en,hi,mr}/0.mp3 ... 39.mp3
import asyncio, json, os
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINES = os.path.join(ROOT, 'scripts', 'parent-lines.json')
OUT_BASE = os.path.join(ROOT, 'assets', 'audio', 'parent')

# Pick warm, natural neural voices per language.
VOICES = {
    'en': 'en-US-AriaNeural',   # warm female, great for parent-facing content
    'hi': 'hi-IN-SwaraNeural',  # natural female Hindi
    'mr': 'mr-IN-AarohiNeural', # natural female Marathi
}

# Slight per-language rate tuning (1.0 = normal).
RATE = {'en': '+0%', 'hi': '+0%', 'mr': '+0%'}

with open(LINES, encoding='utf-8') as f:
    texts = json.load(f)

async def gen_one(lang, idx, text):
    out = os.path.join(OUT_BASE, lang, f'{idx}.mp3')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out) and os.path.getsize(out) > 1000:
        print(f'skip {lang}/{idx}')
        return
    communicate = edge_tts.Communicate(text, VOICES[lang], rate=RATE[lang])
    await communicate.save(out)
    print(f'ok {lang}/{idx}')

async def main():
    for lang in ['en', 'hi', 'mr']:
        for i, text in enumerate(texts[lang]):
            if not text or not str(text).strip():
                print(f'empty {lang}/{i}')
                continue
            await gen_one(lang, i, str(text))
            await asyncio.sleep(0.3)  # be gentle with the service
    print('Done.')

asyncio.run(main())
