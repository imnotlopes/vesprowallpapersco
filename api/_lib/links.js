// Links de entrega por produto, lidos da variável de ambiente DELIVERY_LINKS (JSON), fora do repositório.
// Ex.: {"free":"https://drive.google.com/…","complete":"https://…","ocean":"https://…"}
import { PRODUCTS, FREE_PACK } from './products.js';

export function deliveryLinks() {
  try { return JSON.parse(process.env.DELIVERY_LINKS || '{}'); } catch { return {}; }
}

/** Itens a entregar para uma lista de chaves de produto (ignora produtos sem link configurado). */
export function itemsFor(keys) {
  const links = deliveryLinks();
  return [...new Set(keys)]
    .map((k) => ({ key: k, name: k === FREE_PACK.key ? FREE_PACK.name : PRODUCTS[k]?.name, link: links[k] }))
    .filter((i) => i.name && i.link);
}
