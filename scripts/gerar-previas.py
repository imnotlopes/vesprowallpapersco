# Gera as prévias públicas (com a marca d'água VESPRO aprendida) a partir dos originais sem marca.
# Os originais NUNCA entram no repositório: as 37 primeiras ficam na pasta das landings (oil wallpaper/desktop)
# e as coleções novas em arts/ (ignorada pelo git). Só obras que aparecem no site ganham prévia.
# Uso: python scripts/gerar-previas.py            (gera só as que ainda não existem)
#      python scripts/gerar-previas.py --todas    (refaz todas)
import json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = r'C:\Users\Familia\Desktop\SITES\landing Impasto inglês\oil wallpaper\desktop'
ARTS = os.path.join(ROOT, 'arts')
FOLDERS = {   # coleção -> pasta em arts/
    'signature': 'Expansão Exclusiva Vespro™',
    'sporting': 'Coleção Sporting Vespro™',
    'shadows': 'Coleção Shadows Vespro™',
}
MODEL = os.path.join(ROOT, 'scripts', 'marca-dagua')      # A_800.npy, B_800.npy, A_400.npy, B_400.npy
OUT = os.path.join(ROOT, 'public', 'img', 'w')
SIZES = {'800': (800, 450), '400': (400, 225)}
ALL = '--todas' in sys.argv

# catálogo lido direto de src/data/wallpapers.ts (Node 22.6+ entende TypeScript)
dump = subprocess.run(['node', '--experimental-strip-types', '--no-warnings', '-e',
    "import('./src/data/wallpapers.ts').then(m => console.log(JSON.stringify(m.WALLPAPERS.map(w => ({ slug: w.slug, source: w.source, file: w.file, collection: w.collection })))))"],
    cwd=ROOT, capture_output=True, text=True, encoding='utf-8')
if dump.returncode:
    sys.exit(dump.stderr)
items = json.loads(dump.stdout)

def original(w):
    if w.get('source'):
        return next(os.path.join(ORIG, f) for f in os.listdir(ORIG) if f.startswith(w['source'] + '-'))
    folder = os.path.join(ARTS, FOLDERS[w['collection']], 'Desktop')
    names = [f for f in os.listdir(folder) if f.lower().endswith('.png')]
    # o nome no catálogo é o nome do arquivo sem o "Cópia de" (ou o começo dele)
    clean = lambda f: f.replace('Cópia de ', '').replace('Copia de ', '')
    hits = [f for f in names if clean(f)[:-4] == w['file']] or [f for f in names if clean(f).startswith(w['file'])]
    if len(hits) != 1:
        sys.exit(f"arquivo de '{w['slug']}' não encontrado (ou ambíguo) em {folder}: {hits}")
    return os.path.join(folder, hits[0])

done = 0
for key, size in SIZES.items():
    A = np.load(os.path.join(MODEL, f'A_{key}.npy')); B = np.load(os.path.join(MODEL, f'B_{key}.npy'))
    folder = OUT if key == '800' else os.path.join(OUT, key)
    os.makedirs(folder, exist_ok=True)
    for w in items:
        dest = os.path.join(folder, f"{w['slug']}.webp")
        if os.path.exists(dest) and not ALL:
            continue
        im = Image.open(original(w)).convert('RGB')
        im = ImageOps.fit(im, size, Image.LANCZOS)      # recorta no centro se não for 16:9
        x = np.asarray(im, dtype=np.float32) / 255
        y = np.clip(A * x + B, 0, 1)
        Image.fromarray((y * 255 + .5).astype(np.uint8)).save(dest, 'WEBP', quality=80 if key == '800' else 76, method=6)
        done += 1
print(f'{done} prévias geradas em public/img/w ({len(items)} obras no catálogo)')
