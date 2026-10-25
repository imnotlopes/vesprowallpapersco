# Monta as pastas de entrega (uma por produto) para subir no Google Drive.
# Usa hard links (mesmo disco): cada arquivo aparece em várias pastas sem ocupar espaço de novo.
import json, os, re, shutil, subprocess, sys

SITE = r'C:\Users\Familia\Desktop\SITES\vespro-brand'
OLD = r'C:\Users\Familia\Desktop\SITES\landing Impasto inglês\oil wallpaper\desktop'
OUT = r'C:\Users\Familia\Desktop\SITES\VESPRO entregas'
FOLDERS = {'signature': 'Expansão Exclusiva Vespro™', 'sporting': 'Coleção Sporting Vespro™', 'shadows': 'Coleção Shadows Vespro™'}
# Versões de celular (composições verticais próprias, vindas da landing BR). Só 9 obras do catálogo têm:
# obra -> arquivo em _site-limpas/celular (720 × 1279). Viram PNG 1080 × 1920 em arts/Celular (fora do git)
# e entram numa subpasta "Phone" ao lado dos arquivos de computador.
PHONE_SRC = r'C:\Users\Familia\Desktop\SITES\landing Impasto\oil wallpaper\_site-limpas\celular'
PHONE_DIR = os.path.join(SITE, 'arts', 'Celular')
PHONES = {'superyacht-sunset': '01.webp', 'havana-classic-cars': '12.webp', 'lake-house-golden-hour': '13.webp', 'snow-angel': '14.webp',
          'helicopter-rescue-sea': '16.webp', 'new-york-skyline-toast': '19.webp', 'surfer-giant-wave': '22.webp', 'shaka-rainbow-sea': '23.webp',
          'snowboarder-among-the-peaks': '15.webp'}

dump = subprocess.run(['node', '--experimental-strip-types', '--no-warnings', '-e',
    "Promise.all([import('./src/data/wallpapers.ts'), import('./api/_lib/products.js')]).then(([w, p]) => console.log(JSON.stringify({"
    "items: w.WALLPAPERS.map(x => ({ slug: x.slug, title: x.title, source: x.source, file: x.file, collection: x.collection })),"
    "free: w.FREE_SLUGS, products: Object.fromEntries(Object.entries(p.PRODUCTS).map(([k, v]) => [k, { name: v.name.replace(/\\u00a0/g, ' '), kind: v.kind }]))"
    "})))"], cwd=SITE, capture_output=True, text=True, encoding='utf-8')
if dump.returncode: sys.exit(dump.stderr)
data = json.loads(dump.stdout)
items, products = data['items'], data['products']

clean = lambda f: re.sub(r'^(Cópia de |Copia de )+', '', f)[:-4]
def source_path(w):
    if w.get('source'):
        return next(os.path.join(OLD, f) for f in os.listdir(OLD) if f.startswith(w['source'] + '-'))
    folder = os.path.join(SITE, 'arts', FOLDERS[w['collection']], 'Desktop')
    names = [f for f in os.listdir(folder) if f.lower().endswith('.png')]
    hits = [f for f in names if clean(f) == w['file']] or [f for f in names if clean(f).startswith(w['file'])]
    if len(hits) != 1: sys.exit(f"arquivo de {w['slug']} não encontrado: {hits}")
    return os.path.join(folder, hits[0])

def phone_path(slug):
    if slug not in PHONES: return None
    dest = os.path.join(PHONE_DIR, slug + '.png')
    if not os.path.exists(dest):
        from PIL import Image
        os.makedirs(PHONE_DIR, exist_ok=True)
        Image.open(os.path.join(PHONE_SRC, PHONES[slug])).convert('RGB').resize((1080, 1920), Image.LANCZOS).save(dest)
    return dest

def with_phone(w, dest_dir, name):
    """Coloca o arquivo de computador e, se a obra tiver, a versão de celular na subpasta Phone."""
    place(source_path(w), dest_dir, name)
    ph = phone_path(w['slug'])
    if ph: place(ph, os.path.join(dest_dir, 'Phone'), name)

safe = lambda s: re.sub(r'[<>:"/\\|?*™]', '', s).replace('&', 'and').strip()
def place(src, dest_dir, name):
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, safe(name) + os.path.splitext(src)[1].lower())
    if not os.path.exists(dest):
        try: os.link(src, dest)
        except OSError: shutil.copy2(src, dest)
    return dest

LICENSE = """VESPRO(TM) WALLPAPERS: PERSONAL LICENSE

Thank you for your purchase.

You may use these wallpapers on your own devices: computers, laptops, monitors, tablets and phones.
You may not resell, share, redistribute or use them in products, stores, apps or marketing.
For a commercial license, write to support@vesprowallpapers.com.

Lost your link? Get it again at https://www.vesprowallpapers.com/get-my-links
"""
def license_in(d):
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'LICENSE.txt'), 'w', encoding='utf-8').write(LICENSE)

# refaz só as pastas de entrega; arquivos soltos na raiz (como DELIVERY_LINKS.txt) ficam
os.makedirs(OUT, exist_ok=True)
for d in os.listdir(OUT):
    if os.path.isdir(os.path.join(OUT, d)): shutil.rmtree(os.path.join(OUT, d))
by_coll = {}
for w in items: by_coll.setdefault(w['collection'], []).append(w)

ed_dir = os.path.join(OUT, 'VESPRO Editions The Complete Collection')
license_in(ed_dir)
summary = {}
for key, p in products.items():
    if p['kind'] != 'pack': continue
    ws = by_coll.get(key, [])
    top = os.path.join(OUT, 'VESPRO ' + safe(p['name'].replace('VESPRO™ ', '')))
    license_in(top)
    for i, w in enumerate(ws, 1):
        with_phone(w, top, f'{i:02d} {w["title"]}')
        with_phone(w, os.path.join(ed_dir, safe(p['name'].replace('VESPRO™ ', ''))), f'{i:02d} {w["title"]}')
    summary[key] = (os.path.basename(top), len(ws))

# exclusivas do Editions: as do site sem coleção + as que só vêm no download (nomes neutros)
excl = os.path.join(ed_dir, 'Editions Exclusives')
n = 0
for w in by_coll.get(None, []):
    n += 1; with_phone(w, excl, f'Exclusive {n:02d}')
for coll, folder in FOLDERS.items():
    d = os.path.join(SITE, 'arts', folder, 'Desktop')
    used = {os.path.basename(source_path(w)) for w in by_coll.get(coll, [])}
    for f in sorted(os.listdir(d)):
        if f.lower().endswith('.png') and f not in used:
            n += 1; place(os.path.join(d, f), excl, f'Exclusive {n:02d}')

# pack grátis
free_dir = os.path.join(OUT, 'VESPRO First Strokes 12 Free Wallpapers')
license_in(free_dir)
by_slug = {w['slug']: w for w in items}
for i, s in enumerate(data['free'], 1):
    with_phone(by_slug[s], free_dir, f'{i:02d} {by_slug[s]["title"]}')

count = lambda d: sum(1 for _, _, fs in os.walk(d) for f in fs if f != 'LICENSE.txt')
phones = sum(1 for dp, _, fs in os.walk(OUT) for f in fs if os.path.basename(dp) == 'Phone')
print('Versões de celular colocadas:', phones)
print('Editions:', count(ed_dir), 'arquivos (exclusivas:', n, ')')
print('Grátis:', count(free_dir))
for k, (name, c) in summary.items(): print(f'{k}: {c}  ->  {name}')
