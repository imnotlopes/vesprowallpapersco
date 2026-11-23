// Feed de produtos para o Google Merchant Center (RSS 2.0 com o namespace g:), lido por URL todo dia.
// Preço, nome e página vêm de api/_lib/products.js (o mesmo que o checkout cobra) e o texto é o mesmo do JSON-LD
// de cada página (src/data/schema.ts), para o Google ver a mesma coisa no feed e no site.
// Imagens: capas sem marca d'água em /img/merchant/<chave>.jpg (o Google reprova foto com marca d'água).
// As capas são geradas fora do repositório: landing Impasto/oil wallpaper/capas/_gerador-merchant (bash gerar.sh).
import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { PRODUCTS } from '../../api/_lib/products.js';
import { byCollection, countLabel, EDITIONS_LABEL } from '../data/wallpapers';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p: string) => new URL(p, SITE.url).href;
/** Nome da marca sem ™ e sem espaço que não quebra linha (regra dos dados para o Google). */
const plain = (s: string) => s.replace(/\s*™/g, '').replace(/ /g, ' ');

// Taxonomia do Google: Software > Digital Goods & Currency > Desktop Wallpaper
const GOOGLE_CATEGORY = '5035';
// Só diz "4K" no Google o que já é 4K de verdade nos arquivos de entrega (CONTEXTO.md, seção 4).
// As 6 primeiras coleções e a Sporting ainda são 1672 x 941: quando os arquivos 4K entrarem, acrescentar aqui.
const TRUE_4K = new Set(['signature', 'shadows']);
const sem4k = (s: string) => s.replace(/\s*(?:,\s*)?\b(?:in 4K|4K wallpapers|HD wallpapers)\.?/g, '.').replace(/\.\.+/g, '.').replace(/:\s*\./, '.');

function item(key: string) {
  const p = PRODUCTS[key];
  const editions = key === 'complete';
  const count = editions ? EDITIONS_LABEL : countLabel(byCollection(key).length);
  const k4 = TRUE_4K.has(key);
  // mesmos ids do JSON-LD das páginas (sku vespro-editions no Editions, vespro-<chave> nas coleções)
  const id = editions ? 'vespro-editions' : `vespro-${key}`;
  const title = editions
    ? `VESPRO Editions: The Complete Collection, ${count} Oil Painting Wallpapers`
    : `${plain(p.name)}: ${count} Oil Painting Wallpapers${k4 ? ' in 4K' : ''}`;
  const blurb = k4 ? plain(p.blurb) : sem4k(plain(p.blurb));
  const description = editions
    ? `${count} VESPRO impasto oil painting wallpapers, every collection, plus every new edition. One-time payment, instant download.`
    : `${blurb} ${count} impasto oil painting wallpapers for desktop and laptop. One-time payment, instant download.`;
  const f = (tag: string, v: string) => `<g:${tag}>${esc(v)}</g:${tag}>`;
  return [
    '<item>',
    f('id', id),
    f('title', title),
    f('description', description),
    f('link', abs(p.page)),
    f('image_link', abs(`/img/merchant/${key}.jpg`)),
    f('availability', 'in_stock'),
    f('price', `${(p.price / 100).toFixed(2)} USD`),
    f('condition', 'new'),
    f('brand', SITE.name),
    f('identifier_exists', 'no'),
    f('google_product_category', GOOGLE_CATEGORY),
    f('product_type', editions ? 'Digital wallpapers > Bundles' : 'Digital wallpapers > Collections'),
    editions ? f('is_bundle', 'yes') : '',
    '</item>',
  ].filter(Boolean).join('');
}

export const GET: APIRoute = () => {
  const items = Object.keys(PRODUCTS).map(item).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>VESPRO oil painting wallpapers</title>
<link>${SITE.url}</link>
<description>VESPRO collections of impasto oil painting wallpapers. Digital download.</description>
${items}
</channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
