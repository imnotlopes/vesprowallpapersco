# Klaviyo: como configurar

O site **não manda e-mail sozinho**. Ele registra eventos no Klaviyo, e cada evento dispara um fluxo
(Flow) que você monta uma vez lá dentro. Os links de download vêm junto com o evento.

A página de obrigado também mostra os links na hora, então quem compra recebe mesmo se um fluxo falhar.

## 1. Conta e chave

1. Crie a conta em klaviyo.com (o plano grátis atende até 250 contatos).
2. **Settings → Domains → Sending domain**: autentique `vesprowallpapers.com` (registros DNS na Vercel).
   Remetente e resposta: `VESPRO™ <support@vesprowallpapers.com>`.
3. **Settings → API keys → Create Private API Key**. Dê acesso **Full** a Events, Profiles, Subscriptions e Lists.
   Cole a chave na Vercel como `KLAVIYO_PRIVATE_KEY`. Nunca cole a chave no código nem no chat.
4. **Audience → Lists & Segments → Create list** "VESPRO™ Newsletter" (*single opt-in*).
   Copie o ID da lista (aparece na URL / em Settings da lista) para `KLAVIYO_LIST_ID`.

Só entra nessa lista quem marcou a caixa de novidades (pack grátis) ou a caixa do carrinho.

## 2. Eventos que o site envia

| Evento (Metric)            | Quando                                            | Dados úteis no e-mail |
|----------------------------|---------------------------------------------------|-----------------------|
| `Requested Free Pack`      | pedido do pack grátis                              | `event.DownloadLink`, `event.Device` |
| `Placed Order`             | pagamento confirmado no Stripe                     | `event.Items` (ProductName, DownloadLink), `event.ItemNames`, valor do pedido |
| `Requested Download Links` | página "Get my download links"                     | `event.Items` |
| `Started Checkout`         | carrinho → checkout, **só se a pessoa marcou a caixa** | `event.CartURL`, `event.Items` (ProductName, Price), valor |

Os eventos só aparecem no Klaviyo depois que acontecem pela primeira vez. Faça um teste no modo de teste
do Stripe, ou peça o pack grátis com seu e-mail, antes de montar o fluxo.

## 3. Fluxos (Flows → Create flow → Build your own → trigger "Metric")

### A) Entrega do pack grátis: trigger `Requested Free Pack`
- E-mail imediato. Assunto: **Your 12 free VESPRO™ wallpapers**
- Botão com link: `{{ event.DownloadLink }}`
- Texto sugerido: "Here are your 12 oil painting wallpapers in full resolution. Quick question: which
  screen are you dressing up: Mac, Windows PC or iPhone? Just reply and we'll send picks that fit it."

### B) Entrega do pedido: trigger `Placed Order`
- E-mail imediato. Assunto: **Your VESPRO™ wallpapers are ready to download**
- Num bloco de texto/HTML:
  ```
  {% for item in event.Items %}
    <p><b>{{ item.ProductName }}</b><br>
    <a href="{{ item.DownloadLink }}">Download</a></p>
  {% endfor %}
  ```
- Rodapé: "Personal use license. Lost this email? Get your links again at vesprowallpapers.com/get-my-links".
- Peça ao Klaviyo para marcar este e-mail como **transactional** (nas configurações do e-mail do fluxo).
  Assim ele chega mesmo para quem se descadastrou das novidades.

### C) Reenvio de links: trigger `Requested Download Links`
- Igual ao B (mesmo laço `event.Items`), assunto **Your VESPRO™ download links**. Também transacional.

### D) Carrinho abandonado: trigger `Started Checkout`
- **Flow filter**: "Placed Order zero times since starting this flow".
- Espera de **1 hora** → e-mail 1: "Your wallpapers are still waiting"
  - Itens: `{% for item in event.Items %}{{ item.ProductName }}{% endfor %}`
  - Botão "Finish my order" → `{{ event.CartURL }}` (reabre o carrinho no site com os mesmos packs)
- Espera de **23 horas** → e-mail 2: mostre a Coleção Completa ("Get all 37 for $14.99").
- O evento só existe para quem marcou a caixa de consentimento no carrinho.

### E) Boas-vindas da newsletter: trigger "Added to list" VESPRO™ Newsletter
- Fica para a etapa 5 (sequência de e-mails).

## 4. Variáveis na Vercel

```
KLAVIYO_PRIVATE_KEY=pk_...
KLAVIYO_LIST_ID=...
DELIVERY_LINKS={"free":"…","complete":"…","ocean":"…", …}
```

Depois de ligar tudo: faça uma compra no modo de teste do Stripe e confira em Klaviyo →
Analytics → Metrics se o `Placed Order` chegou com os links.
