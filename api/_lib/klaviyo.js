// Klaviyo (API do servidor). O site só registra eventos; quem manda os e-mails são os fluxos do Klaviyo,
// disparados por estes eventos (ver docs/klaviyo.md). Variáveis: KLAVIYO_PRIVATE_KEY, KLAVIYO_LIST_ID.
// A lista (novidades) só recebe quem marcou a caixa de consentimento.
const API = 'https://a.klaviyo.com/api';
const REVISION = '2026-10-15';

export const METRICS = {
  free: 'Requested Free Pack',
  order: 'Placed Order',
  resend: 'Requested Download Links',
  checkout: 'Started Checkout',
};

async function klaviyo(path, body) {
  const key = process.env.KLAVIYO_PRIVATE_KEY;
  if (!key) throw new Error('KLAVIYO_PRIVATE_KEY não configurada');
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Klaviyo-API-Key ${key}`,
      revision: REVISION,
      'Content-Type': 'application/vnd.api+json',
      accept: 'application/vnd.api+json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Klaviyo ${res.status}: ${txt.slice(0, 200)}`);
  }
  return null;   // eventos e inscrições respondem 202 sem corpo
}

/** Registra um evento no perfil do e-mail. uniqueId evita duplicar (ex.: webhook reenviado pelo Stripe). */
export function trackEvent({ email, metric, properties = {}, value, uniqueId, profile = {} }) {
  return klaviyo('/events', {
    data: {
      type: 'event',
      attributes: {
        properties,
        metric: { data: { type: 'metric', attributes: { name: metric } } },
        profile: { data: { type: 'profile', attributes: { email, ...(Object.keys(profile).length ? { properties: profile } : {}) } } },
        ...(value !== undefined ? { value, value_currency: 'USD' } : {}),
        ...(uniqueId ? { unique_id: uniqueId } : {}),
      },
    },
  });
}

/** Inscreve na lista de novidades com consentimento de marketing por e-mail (só chamar se a pessoa marcou). */
export function subscribe({ email, source }) {
  const list = process.env.KLAVIYO_LIST_ID;
  if (!list) return Promise.resolve(null);
  return klaviyo('/profile-subscription-bulk-create-jobs', {
    data: {
      type: 'profile-subscription-bulk-create-job',
      attributes: {
        custom_source: source || 'vesprowallpapers.com',
        profiles: { data: [{ type: 'profile', attributes: { email, subscriptions: { email: { marketing: { consent: 'SUBSCRIBED' } } } } }] },
      },
      relationships: { list: { data: { type: 'list', id: list } } },
    },
  });
}

export const validEmail = (e) => typeof e === 'string' && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
