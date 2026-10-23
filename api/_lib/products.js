// Produtos à venda (usado pelas funções da Vercel e pelas páginas do Astro).
// Preços em centavos de dólar. Coleções (kind 'pack') vendidas separadas; o VESPRO™ Editions leva tudo, inclusive lançamentos.
// page = página da coleção no site (as 6 primeiras usam a página do tema; as novas têm página própria em /collections/<chave>).
// Os links de entrega NÃO ficam aqui: vêm da variável de ambiente DELIVERY_LINKS (ver .env.example).
export const CURRENCY = 'usd';

// Marca: sempre VESPRO™. Cada coleção tem nome próprio (collection) e edição, para lançar "Edition 02" depois.
// name = nome completo usado no site, no carrinho, no Stripe e nos e-mails (sem travessões no texto).
export const BRAND = 'VESPRO™';
// O espaço antes e dentro de "Edition 01" não quebra linha (a edição nunca fica sozinha na linha de baixo).
const named = (collection, edition, rest) => ({ collection, edition,
  name: `${BRAND} ${collection}${edition.startsWith('Edition') ? `\u00a0${edition.replace(' ', '\u00a0')}` : `: ${edition}`}`, ...rest });

export const PRODUCTS = {
  complete: named('Editions', 'The Complete Collection', { price: 1999, kind: 'complete', page: '/collections/complete',
    blurb: `Every ${BRAND} oil painting wallpaper, plus every new release.` }),
  ocean: named('Tides & Tempests', 'Edition 01', { price: 249, kind: 'pack', theme: 'ocean', page: '/wallpapers/ocean',
    blurb: 'Giant waves, tall ships and open water, painted in thick impasto. 4K wallpapers.' }),
  cities: named('Metropolis', 'Edition 01', { price: 249, kind: 'pack', theme: 'cities', page: '/wallpapers/cities',
    blurb: 'Rainy streets, old-world avenues and skyline nights in oil paint. 4K wallpapers.' }),
  winter: named('Alpine Hours', 'Edition 01', { price: 249, kind: 'pack', theme: 'winter', page: '/wallpapers/winter',
    blurb: 'Snow, powder and mountain light, painted in thick impasto. 4K wallpapers.' }),
  animals: named('Wild & Noble', 'Edition 01', { price: 249, kind: 'pack', theme: 'animals', page: '/wallpapers/animals',
    blurb: 'Horses at full gallop, big cats and loyal companions in oil paint. 4K wallpapers.' }),
  cars: named('Grand Touring', 'Edition 01', { price: 249, kind: 'pack', theme: 'cars', page: '/wallpapers/cars',
    blurb: 'Sports cars, classics and the wild things riding in them, in oil paint. 4K wallpapers.' }),
  'still-life': named('Still Hours', 'Edition 01', { price: 249, kind: 'pack', theme: 'still-life', page: '/wallpapers/still-life',
    blurb: 'Chess, candlelit kitchens and quiet rooms in moody oil paint. 4K wallpapers.' }),
  signature: named('Signature', 'Edition 01', { price: 799, kind: 'pack', page: '/collections/signature',
    blurb: 'Riviera tennis, tigers, supercars, samurai and quiet luxury: our widest collection, in 4K.' }),
  sporting: named('Sporting', 'Edition 01', { price: 399, kind: 'pack', theme: 'sports', page: '/collections/sporting', hd: true,
    blurb: 'Sailing, skiing, golf, polo and fighter jets, painted in thick impasto. HD wallpapers.' }),
  shadows: named('Shadows', 'Edition 01', { price: 499, kind: 'pack', theme: 'noir', page: '/collections/shadows',
    blurb: 'Our paintings reworked in black and white, for dark mode and minimal setups. 4K wallpapers.' }),
};

export const FREE_PACK = { key: 'free', collection: 'First Strokes', name: `${BRAND} First Strokes: 12 free wallpapers` };

export const productForTheme = (theme) =>
  Object.entries(PRODUCTS).find(([, p]) => p.theme === theme)?.[0] || null;

export const formatPrice = (cents) => `$${(cents / 100).toFixed(2)}`;

/** Limpa uma lista de produtos vinda do carrinho: só chaves conhecidas, sem repetição;
 *  se a Coleção Completa estiver junto, ela substitui os packs (já inclui todos). */
export function normalizeCart(keys) {
  const list = [...new Set((Array.isArray(keys) ? keys : String(keys || '').split(',')).map((k) => String(k).trim()))]
    .filter((k) => PRODUCTS[k]).slice(0, 12);
  return list.includes('complete') ? ['complete'] : list;
}

/** Produtos de um pedido do Stripe (metadata.products = "ocean,cities"; pedidos antigos usam metadata.product). */
export const orderProducts = (metadata = {}) => normalizeCart(metadata.products || metadata.product || '');

// ---- Ofertas para subir o ticket médio (o preço final é sempre calculado aqui, no servidor) ----
// bump:    VESPRO™ Editions com qualquer coleção junto (order bump do "Buy" e oferta do carrinho) sai por bumpPrice
// bundle:  bundleMin coleções ou mais no carrinho saem com bundleOff de desconto cada
// upgrade: depois da compra, o Editions custa o preço cheio menos o que a pessoa pagou (mínimo upgradeMin)
export const OFFERS = { bumpPrice: 1499, bundleMin: 3, bundleOff: 0.2, upgradeMin: 499 };

/** Preço do carrinho. Lista crua do navegador: se tiver o Editions + alguma coleção, é o order bump
 *  (Editions a bumpPrice, substituindo as coleções); só coleções, aplica o desconto de combo. */
export function quote(raw) {
  const list = [...new Set((Array.isArray(raw) ? raw : String(raw || '').split(',')).map((k) => String(k).trim()))]
    .filter((k) => PRODUCTS[k]).slice(0, 12);
  const packs = list.filter((k) => PRODUCTS[k].kind === 'pack');
  const ed = PRODUCTS.complete;
  if (list.includes('complete')) {
    const bump = packs.length > 0;
    const amount = bump ? Math.min(OFFERS.bumpPrice, ed.price) : ed.price;
    return { keys: ['complete'], offer: bump ? 'bump' : null, total: amount,
      lines: [{ key: 'complete', name: ed.name, amount, note: bump ? `Special cart price (${formatPrice(ed.price)} everywhere else)` : '' }] };
  }
  const bundle = packs.length >= OFFERS.bundleMin;
  const lines = packs.map((k) => ({ key: k, name: PRODUCTS[k].name,
    amount: bundle ? Math.round(PRODUCTS[k].price * (1 - OFFERS.bundleOff)) : PRODUCTS[k].price,
    note: bundle ? `Bundle price: ${Math.round(OFFERS.bundleOff * 100)}% off for ${OFFERS.bundleMin}+ collections` : '' }));
  return { keys: packs, offer: bundle ? 'bundle' : null, total: lines.reduce((s, l) => s + l.amount, 0), lines };
}

/** Preço do upgrade pós-compra para o Editions: o que já foi pago conta. */
export const upgradePrice = (paidCents) => Math.max(PRODUCTS.complete.price - paidCents, OFFERS.upgradeMin);
