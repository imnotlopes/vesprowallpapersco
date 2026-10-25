// POST /api/free-pack {email, marketing, device, source, website(honeypot)}
// Registra "Requested Free Pack" no Klaviyo com o link (o fluxo manda o e-mail). Só entra na lista
// de novidades quem marcou a caixa ("marketing" true).
import { trackEvent, subscribe, validEmail, METRICS } from './_lib/klaviyo.js';
import { itemsFor } from './_lib/links.js';
import { FREE_PACK } from './_lib/products.js';
import { allow, ipOf, jsonBody, MIN, DAY } from './_lib/limit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const b = jsonBody(req);
  if (!b) return res.status(400).json({ ok: false, error: 'Invalid request.' });
  if (b.website) return res.status(200).json({ ok: true });          // robô preencheu o campo escondido
  const email = String(b.email || '').trim().toLowerCase();
  if (!validEmail(email)) return res.status(400).json({ ok: false, error: 'Please enter a valid email.' });
  // até 5 pedidos a cada 10 min por IP; o mesmo e-mail recebe no máximo 2 por dia (depois responde ok sem reenviar)
  if (!allow(`free:ip:${ipOf(req)}`, 5, 10 * MIN)) return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a few minutes and try again.' });
  if (!allow(`free:mail:${email}`, 2, DAY)) return res.status(200).json({ ok: true });
  const [item] = itemsFor([FREE_PACK.key]);
  if (!item) return res.status(503).json({ ok: false, error: 'The free pack is not available right now.' });
  const device = String(b.device || '').slice(0, 20), source = String(b.source || '').slice(0, 40);
  try {
    if (b.marketing === true) await subscribe({ email, source: 'Free pack' }).catch((e) => console.error(e));
    await trackEvent({
      email, metric: METRICS.free,
      properties: { DownloadLink: item.link, Device: device, Source: source, MarketingConsent: b.marketing === true },
      profile: { Device: device, FreePack: true },
    });
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ ok: false, error: 'We could not send the email. Please try again.' });
  }
}
