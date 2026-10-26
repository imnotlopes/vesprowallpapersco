# Capas dos e-mails (Klaviyo): uma imagem JPG por produto em public/img/email/<chave>.jpg, 600x338.
# Usa as prévias públicas do site (as mesmas, com marca d'água, que já aparecem nas páginas); JPG porque
# alguns leitores de e-mail (Outlook no Windows) não abrem WebP. O Editions e o pack grátis viram um mosaico 2x2.
# Rodar: python scripts/email-covers.py
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'img', 'w')
OUT = os.path.join(ROOT, 'public', 'img', 'email')
W, H = 600, 338

COVERS = {
    'signature': 'portofino-harbour',
    'shadows': 'tiger-crossing-the-stream-noir',
    'ocean': 'tall-ship-open-sea',
    'cities': 'new-york-skyline-toast',
    'cars': 'black-sports-car-horse-ranch',
    'sporting': 'polo-at-the-mansion',
    'winter': 'skiers-snowy-mountain',
    'animals': 'galloping-horses',
    'still-life': 'chess-reflection-water',
}
MOSAICS = {
    'complete': ['portofino-harbour', 'black-sports-car-horse-ranch', 'tall-ship-open-sea', 'new-york-skyline-toast'],
    'free': ['snow-angel', 'havana-classic-cars', 'superyacht-sunset', 'galloping-horses'],
}


def fit(slug, w, h):
    im = Image.open(os.path.join(SRC, f'{slug}.webp')).convert('RGB')
    s = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((l, t, l + w, t + h))


os.makedirs(OUT, exist_ok=True)
for key, slug in COVERS.items():
    fit(slug, W, H).save(os.path.join(OUT, f'{key}.jpg'), quality=82, optimize=True, progressive=True)
for key, slugs in MOSAICS.items():
    gap, cw, ch = 4, (W - 4) // 2, (H - 4) // 2
    canvas = Image.new('RGB', (W, H), (6, 10, 16))
    for i, slug in enumerate(slugs):
        canvas.paste(fit(slug, cw, ch), ((i % 2) * (cw + gap), (i // 2) * (ch + gap)))
    canvas.save(os.path.join(OUT, f'{key}.jpg'), quality=82, optimize=True, progressive=True)
print('Capas:', sorted(os.listdir(OUT)))
