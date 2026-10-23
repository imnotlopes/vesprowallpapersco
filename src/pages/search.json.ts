// Índice da busca do topo (public/js/nav.js baixa este arquivo só quando a busca é aberta).
import type { APIRoute } from 'astro';
import { PRODUCTS } from '../../api/_lib/products.js';
import { WALLPAPERS, THEMES, byCollection, preview } from '../data/wallpapers';
import { SCREENS } from '../config';

export const GET: APIRoute = () => {
  const collections = Object.entries(PRODUCTS).map(([k, p]) => {
    const items = p.kind === 'complete' ? WALLPAPERS : byCollection(k);
    return { t: p.name.replace(/\u00a0/g, ' '), u: p.page, i: preview(items[0], 400), k: 'Collection',
      q: p.kind === 'complete' ? 'complete all everything editions' : `${p.collection} ${p.theme ? `${p.theme} ${THEMES[p.theme].name}` : ''}` };
  });
  const screens = SCREENS.map((s) => ({ t: s.label, u: s.href, i: '', k: 'Screen', q: s.q }));
  const walls = WALLPAPERS.map((w) => ({ t: w.title, u: `/wallpaper/${w.slug}`, i: preview(w, 400), k: THEMES[w.theme].name,
    q: `${w.theme} ${w.colors.join(' ')} ${w.devices.join(' ')}` }));
  return new Response(JSON.stringify([...collections, ...screens, ...walls]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
