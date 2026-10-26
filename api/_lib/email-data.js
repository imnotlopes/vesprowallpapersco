// Dados de produto para os e-mails do Klaviyo: capa, preço e página de cada coleção, e as ofertas
// do bloco "You might also like". As capas são JPG em public/img/email (geradas por scripts/email-covers.py).
import { PRODUCTS, formatPrice, upgradePrice } from './products.js';

const SITE = process.env.SITE_URL || 'https://www.vesprowallpapers.com';
export const emailImage = (key) => `${SITE}/img/email/${key}.jpg`;

// Ordem das coleções sugeridas: as mais procuradas primeiro.
const SUGGEST = ['signature', 'shadows', 'cars', 'ocean', 'cities', 'sporting', 'winter', 'animals', 'still-life'];

/** Cartão de um produto para o e-mail (sem preço: o preço pago ou o de vitrine entra conforme o caso). */
export const productCard = (key) => ({
  ProductID: key, ProductName: PRODUCTS[key].name, Collection: PRODUCTS[key].collection,
  ImageURL: emailImage(key), URL: `${SITE}${PRODUCTS[key].page}`,
});

/** Até 3 ofertas para quem já tem `owned`: o Editions primeiro e depois coleções que a pessoa ainda não tem.
 *  Logo depois de uma compra (upgradeFrom = id da sessão paga), o Editions vem com o preço de upgrade.
 *  Quem já tem o Editions não recebe ofertas. */
export function recommendations(owned = [], { upgradeFrom, paidCents = 0 } = {}) {
  if (owned.includes('complete')) return [];
  const ed = PRODUCTS.complete;
  const editions = upgradeFrom
    ? { ...productCard('complete'), Price: formatPrice(upgradePrice(paidCents)), WasPrice: formatPrice(ed.price),
        Note: 'Upgrade price: what you just paid counts', CTA: 'Upgrade',
        URL: `${SITE}/api/checkout?upgrade=${encodeURIComponent(upgradeFrom)}&back=thank-you` }
    : { ...productCard('complete'), Price: formatPrice(ed.price), Note: 'Every collection, plus every new release', CTA: 'Get it all' };
  const packs = SUGGEST.filter((k) => !owned.includes(k)).slice(0, 2)
    .map((k) => ({ ...productCard(k), Price: formatPrice(PRODUCTS[k].price), Note: PRODUCTS[k].hd ? 'HD wallpapers' : '4K wallpapers', CTA: 'See collection' }));
  return [editions, ...packs];
}
