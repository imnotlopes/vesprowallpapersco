// Sitemap com imagens (formato do Google Imagens). Só entram páginas indexáveis:
// páginas fixas, temas com obras suficientes e cada obra com a própria prévia (title = nome buscável).
import type { APIRoute } from 'astro';
import { SITE } from '../config';
import { PAGES } from '../data/pages';
import { WALLPAPERS, THEMES, themeIndexable, preview } from '../data/wallpapers';
import { PRODUCTS } from '../../api/_lib/products.js';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (p: string) => new URL(p, SITE.url).href;
const today = new Date().toISOString().slice(0, 10);
const url = (loc: string, priority: number, images = '') =>
  `<url><loc>${esc(loc)}</loc><lastmod>${today}</lastmod><priority>${priority.toFixed(1)}</priority>${images}</url>`;

export const GET: APIRoute = () => {
  const urls: string[] = [];
  for (const p of Object.values(PAGES)) {
    if (p.indexable) urls.push(url(p.path === '/' ? abs('/') : abs(p.path), p.priority));
  }
  // páginas próprias das coleções novas (/collections/signature etc.); complete já está em PAGES
  for (const p of Object.values(PRODUCTS)) {
    if (p.kind === 'pack' && p.page.startsWith('/collections/')) urls.push(url(abs(p.page), 0.8));
  }
  for (const t of Object.values(THEMES)) {
    if (themeIndexable(t.key)) urls.push(url(abs(`/wallpapers/${t.key}`), 0.7));
  }
  for (const w of WALLPAPERS) {
    const img = `<image:image><image:loc>${esc(abs(preview(w)))}</image:loc><image:title>${esc(`${w.title}, oil painting wallpaper`)}</image:title></image:image>`;
    urls.push(url(abs(`/wallpaper/${w.slug}`), 0.6, img));
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
