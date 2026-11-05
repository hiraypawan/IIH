# Generate lesson voice-over audio using gTTS (free, unlimited, no API key).
# Setup: pip install gTTS
# Run:   python scripts/generate-lesson-tts-gtts.py
# Output: assets/audio/lesson/{en,hi,mr}/0.mp3 ... 328.mp3
import json, os, time
from gtts import gTTS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LINES = os.path.join(ROOT, 'scripts', 'lesson-lines.json')
OUT_BASE = os.path.join(ROOT, 'assets', 'audio', 'lesson')

with open(LINES, encoding='utf-8') as f:
    frames = json.load(f)

for lang in ['en', 'hi', 'mr']:
    d = os.path.join(OUT_BASE, lang)
    os.makedirs(d, exist_ok=True)
    for idx, frame in enumerate(frames):
        out = os.path.join(d, f'{idx}.mp3')
        if os.path.exists(out):
            print(f'skip {lang}/{idx}')
            continue
        text = frame[lang]
        if not text or not text.strip():
            print(f'empty {lang}/{idx}')
            continue
        try:
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(out)
            print(f'ok {lang}/{idx}')
        except Exception as e:
            print(f'FAIL {lang}/{idx}: {e}')
        time.sleep(1)
print('Done.')
