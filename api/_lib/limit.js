// Limite de tentativas por chave (IP ou e-mail) para os formulários públicos: evita inscrever e-mails de terceiros
// em massa e disparar muitos e-mails para o mesmo endereço. Fica na memória da função, então vale por instância
// (a Vercel pode ter várias): é uma barreira contra abuso simples, não contra ataque distribuído.
const hits = new Map();

/** true se ainda pode; registra a tentativa. max tentativas a cada windowMs. */
export function allow(key, max, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < 86400000)) hits.delete(k);   // limpa chaves velhas
  return true;
}

/** IP do visitante (a Vercel manda em x-forwarded-for); sem cabeçalho, uma chave fixa. */
export const ipOf = (req) => String(req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'] || 'unknown').split(',')[0].trim();

export const MIN = 60000, HOUR = 3600000, DAY = 86400000;

/** Corpo JSON do pedido; null se vier malformado (em vez de derrubar a função com erro 500). */
export function jsonBody(req) {
  if (typeof req.body !== 'string') return req.body || {};
  try { return JSON.parse(req.body || '{}'); } catch { return null; }
}
