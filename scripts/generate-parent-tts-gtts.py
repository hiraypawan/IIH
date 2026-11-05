# Generate parent-reel voice-over audio using gTTS (free, unlimited, no API key).
# Setup: pip install gTTS
# Run:   python scripts/generate-parent-tts-gtts.py
# Output: assets/audio/parent/{en,hi,mr}/0.mp3 ... 39.mp3
import json, os, time
from gtts import gTTS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINES = os.path.join(ROOT, 'scripts', 'parent-lines.json')
OUT_BASE = os.path.join(ROOT, 'assets', 'audio', 'parent')

with open(LINES, encoding='utf-8') as f:
    texts = json.load(f)

for lang in ['en', 'hi', 'mr']:
    d = os.path.join(OUT_BASE, lang)
    os.makedirs(d, exist_ok=True)
    for i, text in enumerate(texts[lang]):
        out = os.path.join(d, f'{i}.mp3')
        if os.path.exists(out):
            print(f'skip {lang}/{i}')
            continue
        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(out)
            print(f'ok {lang}/{i}')
        except Exception as e:
            print(f'FAIL {lang}/{i}: {e}')
        time.sleep(1)
print('Done.')
