# Gera os modelos dos e-mails do Klaviyo em docs/emails/*.html (e a versão em texto, *.txt).
# Os três e-mails dividem as mesmas partes (topo, logo, itens com capa, ofertas, ajuda e rodapé), no estilo
# de e-mail de loja grande: saudação, o que a pessoa recebeu, resumo do pedido e "You might also like".
# Os dados vêm dos eventos do site (api/_lib/email-data.js): Items[] e Recommendations[] com capa, preço e link.
# Rodar: python scripts/emails.py  (depois copiar cada HTML para o template do Klaviyo)
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'docs', 'emails')
SITE = 'https://www.vesprowallpapers.com'

BG, CARD, PANEL, LINE, GOLD, TEXT, MUTED, DIM = '#e9e6e0', '#060a10', '#0b1118', '#1d2530', '#d9b878', '#d9d9d9', '#a6a6a6', '#8a8f96'
FONT = "-apple-system,'Segoe UI',Helvetica,Arial,sans-serif"
SERIF = "Georgia,'Times New Roman',serif"


def head(title, preheader):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
</head>
<body style="margin:0;padding:0;background:{BG};">
  <div style="display:none;max-height:0;overflow:hidden;">{preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{BG};padding:16px 12px 40px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:{CARD};border-radius:16px;overflow:hidden;font-family:{FONT};">
'''


def topbar(left, right):
    return f'''        <tr><td style="padding:18px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-size:11px;letter-spacing:1px;color:{DIM};">{left}</td>
            <td align="right" style="font-size:11px;letter-spacing:1px;color:{DIM};">{right}</td>
          </tr></table>
        </td></tr>
'''


LOGO = f'''        <tr><td align="center" style="padding:26px 32px 4px;">
          <a href="{SITE}" style="text-decoration:none;"><img src="{SITE}/img/brand/apple-touch-icon.png" width="56" height="56" alt="VESPRO" style="display:block;border:0;border-radius:12px;margin:0 auto;" /></a>
          <div style="font-family:{SERIF};font-size:13px;letter-spacing:6px;color:{GOLD};padding-top:10px;">VESPRO</div>
        </td></tr>
'''


def hero(eyebrow, h1, body):
    return f'''        <tr><td align="center" style="padding:22px 40px 4px;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:{GOLD};font-weight:700;">{eyebrow}</p>
          <h1 style="margin:0;font-family:{SERIF};font-weight:400;font-size:32px;line-height:1.15;color:#ffffff;">{h1}</h1>
        </td></tr>
        <tr><td align="center" style="padding:14px 44px 6px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:{TEXT};">{body}</p>
        </td></tr>
'''


def note(text):
    """Faixa dourada curta, como a estimativa de entrega das lojas grandes."""
    return f'''        <tr><td align="center" style="padding:14px 32px 0;">
          <p style="margin:0;font-size:12px;letter-spacing:1px;color:{GOLD};">{text}</p>
        </td></tr>
'''


def divider(pad='26px 32px 0'):
    return f'''        <tr><td style="padding:{pad};"><div style="border-top:1px solid {LINE};font-size:0;line-height:0;">&nbsp;</div></td></tr>
'''


def section_title(text, pad='24px 32px 4px'):
    return f'''        <tr><td style="padding:{pad};">
          <p style="margin:0;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:{GOLD};font-weight:700;">{text}</p>
        </td></tr>
'''


def button(href, label, solid=True, small=False):
    pad = '9px 16px' if small else '13px 26px'
    size = '11px' if small else '13px'
    if solid:
        style = f'background:{GOLD};color:{CARD};'
    else:
        style = f'background:transparent;color:#ffffff;border:1px solid #3a4048;'
    return (f'<a href="{href}" style="display:inline-block;padding:{pad};border-radius:999px;{style}font-size:{size};'
            f'font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">{label}</a>')


def items(with_price):
    price = (f'{{% if item.Price %}}<p style="margin:0 0 10px;font-size:14px;color:#ffffff;">{{{{ item.Price }}}}</p>{{% endif %}}'
             if with_price else '')
    return f'''        <tr><td style="padding:18px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            {{% for item in event.Items %}}
            <tr><td style="padding:16px 0;{{% if not forloop.last %}}border-bottom:1px solid {LINE};{{% endif %}}">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                <td width="136" valign="top"><a href="{{{{ item.DownloadLink }}}}"><img src="{{{{ item.ImageURL }}}}" width="136" alt="" style="display:block;width:136px;height:auto;border:0;border-radius:8px;" /></a></td>
                <td valign="top" style="padding-left:16px;">
                  <p style="margin:0 0 4px;font-size:15px;line-height:1.35;color:#ffffff;font-weight:600;">{{{{ item.ProductName }}}}</p>
                  <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:{MUTED};">Full-resolution files in a Google Drive folder</p>
                  {price}{button('{{ item.DownloadLink }}', 'Download', small=True)}
                </td>
              </tr></table>
            </td></tr>
            {{% endfor %}}
          </table>
        </td></tr>
'''


def rows(pairs, bold_last=False):
    """Linhas rótulo / valor (detalhes e pagamento). Cada par pode trazer uma condição Django."""
    out = []
    for i, (label, value, cond) in enumerate(pairs):
        last = bold_last and i == len(pairs) - 1
        color = '#ffffff' if last else TEXT
        weight = '700' if last else '400'
        size = '15px' if last else '13px'
        row = (f'<tr><td style="padding:5px 0;font-size:{size};color:{MUTED if not last else "#ffffff"};font-weight:{weight};">{label}</td>'
               f'<td align="right" style="padding:5px 0;font-size:{size};color:{color};font-weight:{weight};">{value}</td></tr>')
        out.append(f'{{% if {cond} %}}{row}{{% endif %}}' if cond else row)
    body = '\n              '.join(out)
    return f'''        <tr><td style="padding:10px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              {body}
          </table>
        </td></tr>
'''


def setup():
    return section_title('Set it in 30 seconds') + f'''        <tr><td style="padding:8px 32px 0;">
          <p style="margin:0 0 6px;font-size:13px;line-height:1.55;color:{TEXT};"><b style="color:#fff;">Mac:</b> System Settings, Wallpaper, Add Photo, then pick the painting.</p>
          <p style="margin:0 0 6px;font-size:13px;line-height:1.55;color:{TEXT};"><b style="color:#fff;">Windows:</b> right-click the file and choose Set as desktop background.</p>
          <p style="margin:0;font-size:13px;line-height:1.55;color:{TEXT};"><b style="color:#fff;">iPhone:</b> open the Phone folder when there is one, save the image to Photos, then Share, Use as Wallpaper.</p>
        </td></tr>
'''


def recommendations(title='You might also like'):
    card = f'''<td width="33%" valign="top" style="padding:0 5px;">
                <a href="{{{{ r.URL }}}}"><img src="{{{{ r.ImageURL }}}}" width="168" alt="" style="display:block;width:100%;max-width:168px;height:auto;border:0;border-radius:8px;" /></a>
                <p style="margin:10px 0 2px;font-size:13px;line-height:1.3;color:#ffffff;font-weight:600;">VESPRO™ {{{{ r.Collection }}}}</p>
                <p style="margin:0 0 6px;font-size:11px;line-height:1.4;color:{MUTED};">{{{{ r.Note }}}}</p>
                <p style="margin:0 0 10px;font-size:13px;color:{GOLD};font-weight:700;">{{% if r.WasPrice %}}<span style="color:{DIM};font-weight:400;text-decoration:line-through;">{{{{ r.WasPrice }}}}</span> {{% endif %}}{{{{ r.Price }}}}</p>
                <a href="{{{{ r.URL }}}}" style="font-size:12px;font-weight:700;color:#ffffff;text-decoration:underline;">{{{{ r.CTA }}}} &rsaquo;</a>
              </td>'''
    return ('        {% if event.Recommendations %}\n' + divider() + section_title(title, '24px 32px 14px') +
            f'''        <tr><td style="padding:0 27px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
              {{% for r in event.Recommendations %}}{card}{{% endfor %}}
          </tr></table>
        </td></tr>
        {{% endif %}}
''')


def boxed(text):
    return f'''        <tr><td style="padding:26px 32px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #6b5c3e;border-radius:12px;">
            <tr><td style="padding:16px 20px;font-size:13px;line-height:1.55;color:{TEXT};">{text}</td></tr>
          </table>
        </td></tr>
'''


def help_grid():
    def cell(href, label):
        return f'<td width="50%" style="padding:7px 0;"><a href="{href}" style="font-size:13px;color:#ffffff;text-decoration:none;">{label}</a></td>'
    return divider() + section_title('Need help?', '22px 32px 6px') + f'''        <tr><td style="padding:0 32px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>{cell(f'{SITE}/get-my-links', 'My downloads')}{cell(f'{SITE}/refunds', '14-day guarantee')}</tr>
            <tr>{cell(f'{SITE}/license', 'License')}{cell('mailto:support@vesprowallpapers.com', 'Contact us')}</tr>
          </table>
        </td></tr>
'''


def footer(extra):
    links = ' &nbsp;·&nbsp; '.join(
        f'<a href="{h}" style="color:{TEXT};text-decoration:none;">{t}</a>' for h, t in [
            (f'{SITE}/wallpapers', 'Collections'), (f'{SITE}/collections/complete', 'Editions'),
            (f'{SITE}/free-4k-wallpapers', 'Free wallpapers'), ('https://www.instagram.com/vesprowallpapers.co/', 'Instagram')])
    return divider('28px 32px 0') + f'''        <tr><td align="center" style="padding:22px 32px 34px;">
          <div style="font-family:{SERIF};font-size:18px;letter-spacing:7px;color:#ffffff;padding-bottom:12px;">VESPRO</div>
          <p style="margin:0 0 16px;font-size:12px;line-height:1.6;">{links}</p>
          <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:{DIM};">{extra}</p>
          <p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:{DIM};">Questions? Reply to this email or write to <a href="mailto:support@vesprowallpapers.com" style="color:{GOLD};">support@vesprowallpapers.com</a></p>
          <p style="margin:0;font-size:11px;line-height:1.6;color:#5f646b;">© VESPRO™ &nbsp;·&nbsp; {{% unsubscribe 'Unsubscribe' %}}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
'''


GREETING = 'Hi{% if event.FirstName %}, {{ event.FirstName }}{% endif %}!'
TEXT_RECS = ('{% if event.Recommendations %}You might also like\n'
             '{% for r in event.Recommendations %}VESPRO™ {{ r.Collection|safe }}: {{ r.Price }} ({{ r.Note|safe }})\n{{ r.URL|safe }}\n{% endfor %}\n{% endif %}')
TEXT_SETUP = ('Set it in 30 seconds\nMac: System Settings, Wallpaper, Add Photo, then pick the painting.\n'
              'Windows: right-click the file and choose Set as desktop background.\n'
              'iPhone: open the Phone folder when there is one, save the image to Photos, then Share, Use as Wallpaper.\n\n')
TEXT_FOOT = ('Need help? My downloads: ' + SITE + '/get-my-links · 14-day guarantee: ' + SITE + '/refunds\n'
             'Questions? Reply to this email or write to support@vesprowallpapers.com\n\n{% unsubscribe %}')

EMAILS = {
    'order-delivery': {
        'meta': 'Klaviyo: fluxo Order delivery (gatilho Placed Order, origem API). Assunto: Your VESPRO™ wallpapers are ready to download',
        'html': head('Your VESPRO™ wallpapers are ready to download', 'Your paintings are one click away. Download links inside.')
        + topbar('Order {{ event.OrderNumber }}', '{{ event.OrderDate }}') + LOGO
        + hero('Order confirmed', GREETING, 'Thank you for your order. Your wallpapers are ready: each button opens a Google Drive folder with the files in full resolution.')
        + note('Instant delivery · Full resolution · Yours to keep')
        + items(with_price=True)
        + divider() + section_title('Order details', '22px 32px 4px')
        + rows([('Order number', '{{ event.OrderNumber }}', None), ('Order date', '{{ event.OrderDate }}', None), ('Delivery', 'Instant digital download', None)])
        + divider('16px 32px 0')
        + rows([('Subtotal', '{{ event.Subtotal }}', 'event.Subtotal'), ('Discount', '-{{ event.Discount }}', 'event.Discount'),
                ('Tax', '{{ event.Tax }}', 'event.Tax'), ('Total paid', '{{ event.Total }}', None)], bold_last=True)
        + divider() + setup()
        + recommendations()
        + boxed('Not what you expected? Reply within 14 days and we refund you in full. A real person reads every reply, usually within one working day.')
        + help_grid()
        + footer(f'Personal use license. Lost this email? Get your links again at <a href="{SITE}/get-my-links" style="color:{GOLD};">vesprowallpapers.com/get-my-links</a>'),
        'text': (GREETING + '\n\nOrder confirmed: {{ event.OrderNumber }} · {{ event.OrderDate }}\n'
                 'Thank you for your order. Each link opens a Google Drive folder with your files in full resolution.\n\n'
                 '{% for item in event.Items %}{{ item.ProductName|safe }}{% if item.Price %} · {{ item.Price }}{% endif %}\n'
                 'Download: {{ item.DownloadLink|safe }}\n\n{% endfor %}Total paid: {{ event.Total }}\n\n'
                 + TEXT_SETUP + TEXT_RECS
                 + 'Not what you expected? Reply within 14 days and we refund you in full.\n\n' + TEXT_FOOT),
    },
    'download-links-resend': {
        'meta': 'Klaviyo: fluxo Download links resend (gatilho Requested Download Links, origem API). Assunto: Your VESPRO™ download links',
        'html': head('Your VESPRO™ download links', 'Everything you bought, in one place.')
        + topbar('Your downloads', 'VESPRO™') + LOGO
        + hero('Your downloads', 'Here are your <em style="color:#d9b878;">links</em>.', 'You asked for your download links again, so here is everything you have bought from VESPRO™. Each button opens a Google Drive folder with your files in full resolution.')
        + items(with_price=False)
        + divider() + setup()
        + recommendations('Complete your collection')
        + boxed('Did not ask for this? You can ignore this email: download links only go to the address used at checkout. Need help? Just reply, a real person answers.')
        + help_grid()
        + footer(f'Personal use license. You can request your links anytime at <a href="{SITE}/get-my-links" style="color:{GOLD};">vesprowallpapers.com/get-my-links</a>'),
        'text': ('Here are your links.\n\nYou asked for your download links again, so here is everything you have bought from VESPRO™. '
                 'Each link opens a Google Drive folder with your files in full resolution.\n\n'
                 '{% for item in event.Items %}{{ item.ProductName|safe }}\nDownload: {{ item.DownloadLink|safe }}\n\n{% endfor %}'
                 + TEXT_SETUP + TEXT_RECS
                 + 'Did not ask for this? You can ignore this email: download links only go to the address used at checkout.\n\n' + TEXT_FOOT),
    },
    'free-pack': {
        'meta': 'Klaviyo: fluxo Free pack delivery (site) (gatilho Requested Free Pack, origem API). Assunto: Your 12 free VESPRO™ wallpapers',
        'html': head('Your 12 free VESPRO™ wallpapers', 'Full resolution, ready for your screen.')
        + topbar('VESPRO™ First Strokes', '12 free wallpapers') + LOGO
        + hero('VESPRO™ First Strokes', 'Your 12 free wallpapers are here', 'Thank you for joining us. Here are 12 impasto oil painting wallpapers in full resolution, ready for your desktop, laptop or phone.')
        + note('Full resolution · Desktop and phone versions')
        + f'''        <tr><td style="padding:20px 32px 0;">
          <a href="{{{{ event.DownloadLink }}}}"><img src="{{{{ event.ImageURL|default:'{SITE}/img/email/free.jpg' }}}}" width="536" alt="Four of the twelve free VESPRO paintings" style="display:block;width:100%;height:auto;border:0;border-radius:10px;" /></a>
        </td></tr>
        <tr><td align="center" style="padding:22px 32px 0;">{button('{{ event.DownloadLink }}', 'Download my 12 wallpapers')}</td></tr>
'''
        + divider() + setup()
        + recommendations('Want the rest?')
        + boxed('Quick question: which screen are you dressing up, Mac, Windows or iPhone? Just reply to this email. A real person reads every message.')
        + help_grid()
        + footer('Free for personal use. Thank you for being here.'),
        'text': ('Your 12 free wallpapers are here\n\nThank you for joining us. Here are 12 impasto oil painting wallpapers in full resolution, '
                 'ready for your desktop, laptop or phone.\n\nDownload my 12 wallpapers: {{ event.DownloadLink|safe }}\n\n'
                 + TEXT_SETUP + TEXT_RECS
                 + 'Quick question: which screen are you dressing up, Mac, Windows or iPhone? Just reply to this email.\n\n' + TEXT_FOOT),
    },
}

# Sequência de boas-vindas (gatilho: entrou na lista VESPRO™ Newsletter). Quem entra pode ter vindo do pack grátis, do rodapé
# ou do carrinho, então o texto não supõe que a pessoa pegou o pack. Sem evento: nada de {{ event.* }} aqui.
# Preços e contagens abaixo são fixos no texto: conferir com api/_lib/products.js quando mudarem.
def utm(path, n):
    return f'{SITE}{path}?utm_source=klaviyo&utm_medium=email&utm_campaign=welcome&utm_content=email-{n}'


def picture(href, name, alt):
    return f'''        <tr><td style="padding:20px 32px 0;">
          <a href="{href}"><img src="{SITE}/img/email/{name}.jpg" width="536" alt="{alt}" style="display:block;width:100%;height:auto;border:0;border-radius:10px;" /></a>
        </td></tr>
'''


def cta(href, label):
    return f'''        <tr><td align="center" style="padding:22px 32px 0;">{button(href, label)}</td></tr>
'''


def passage(title, body):
    return section_title(title, '24px 32px 6px') + f'''        <tr><td style="padding:0 32px;">
          <p style="margin:0;font-size:14px;line-height:1.65;color:{TEXT};">{body}</p>
        </td></tr>
'''


def checklist(lines):
    rows_ = ''.join(f'<p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:{TEXT};"><span style="color:{GOLD};">&#10003;</span>&nbsp; {l}</p>' for l in lines)
    return f'''        <tr><td style="padding:20px 32px 0;">{rows_}</td></tr>
'''


def collections(cards, n):
    """Coleções em duas colunas: capa, nome, frase curta e preço."""
    def card(c):
        href = utm(c['path'], n)
        return f'''<td width="50%" valign="top" style="padding:0 5px 22px;">
                <a href="{href}"><img src="{SITE}/img/email/{c['img']}.jpg" width="258" alt="" style="display:block;width:100%;height:auto;border:0;border-radius:8px;" /></a>
                <p style="margin:10px 0 3px;font-size:14px;line-height:1.3;color:#ffffff;font-weight:600;">{c['name']}</p>
                <p style="margin:0 0 6px;font-size:12px;line-height:1.45;color:{MUTED};">{c['note']}</p>
                <p style="margin:0 0 8px;font-size:13px;color:{GOLD};font-weight:700;">{c['price']}</p>
                <a href="{href}" style="font-size:12px;font-weight:700;color:#ffffff;text-decoration:underline;">See collection &rsaquo;</a>
              </td>'''
    trs = ''.join('<tr>' + ''.join(card(c) for c in cards[i:i + 2]) + '</tr>' for i in range(0, len(cards), 2))
    return f'''        <tr><td style="padding:16px 27px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">{trs}</table>
        </td></tr>
'''


FOLLOW = (f'Instagram <a href="https://www.instagram.com/vesprowallpapers.co/" style="color:{GOLD};">@vesprowallpapers.co</a> &nbsp;·&nbsp; '
          f'TikTok <a href="https://www.tiktok.com/@vesprowallpapers" style="color:{GOLD};">@vesprowallpapers</a> &nbsp;·&nbsp; '
          f'<a href="https://www.facebook.com/profile.php?id=61595295119122" style="color:{GOLD};">Facebook</a>')
TEXT_FOLLOW = ('Follow along\nInstagram @vesprowallpapers.co: https://www.instagram.com/vesprowallpapers.co/\n'
               'TikTok @vesprowallpapers: https://www.tiktok.com/@vesprowallpapers\n'
               'Facebook: https://www.facebook.com/profile.php?id=61595295119122\n\n')
TEXT_END = 'Questions? Reply to this email or write to support@vesprowallpapers.com\n\n{% unsubscribe %}'
LIST_NOTE = 'You are receiving this because you asked for new VESPRO™ releases and early access.'

CARDS = [
    {'img': 'shadows', 'path': '/collections/shadows', 'name': 'VESPRO™ Shadows', 'note': 'Reworked in black and white, for dark mode and minimal setups.', 'price': '$4.99'},
    {'img': 'cars', 'path': '/wallpapers/cars', 'name': 'VESPRO™ Grand Touring', 'note': 'Sports cars, classics and the wild things riding in them.', 'price': '$2.49'},
    {'img': 'ocean', 'path': '/wallpapers/ocean', 'name': 'VESPRO™ Tides &amp; Tempests', 'note': 'Giant waves, tall ships and open water.', 'price': '$2.49'},
    {'img': 'cities', 'path': '/wallpapers/cities', 'name': 'VESPRO™ Metropolis', 'note': 'Rainy streets, old-world avenues and skyline nights.', 'price': '$2.49'},
]

EMAILS.update({
    'welcome-1': {
        'meta': 'Klaviyo: fluxo Welcome (gatilho entrou na lista VESPRO™ Newsletter), e-mail 1, dia 2. Assunto: Why thick paint looks so good on a flat screen',
        'html': head('Why thick paint looks so good on a flat screen', 'The old technique behind every VESPRO™ wallpaper.')
        + topbar('Welcome', 'VESPRO™') + LOGO
        + hero('Welcome to VESPRO™', 'Your screen deserves <em style="color:#d9b878;">a painting</em>',
               'Thanks for joining us. Think about how many hours your eyes rest on a screen. We wanted it to feel closer to a painting on a wall, so we started painting wallpapers.')
        + picture(utm('/collections/signature', 1), 'signature', 'Portofino Harbour, a VESPRO oil painting wallpaper')
        + passage('Why impasto', 'Impasto is the old technique of laying paint on so thick that it keeps the shape of the brush. It has ridges, edges and small happy accidents. On a bright, flat screen, that texture gives your eye somewhere to rest.')
        + passage('Made for your screen', 'Each painting is composed for a 16:9 screen first, so nothing important hides behind your icons, your dock or your menu bar.')
        + cta(utm('/collections/signature', 1), 'See the Signature collection')
        + boxed(f'<b style="color:#fff;">Share your setup.</b> Which painting is on your screen right now? Reply with a photo, or tag us. We read every message.<br /><br />{FOLLOW}')
        + footer(LIST_NOTE),
        'text': ('Your screen deserves a painting\n\nThanks for joining us. Think about how many hours your eyes rest on a screen. '
                 'We wanted it to feel closer to a painting on a wall, so we started painting wallpapers.\n\n'
                 'Why impasto\nImpasto is the old technique of laying paint on so thick that it keeps the shape of the brush. It has ridges, edges and small happy accidents. '
                 'On a bright, flat screen, that texture gives your eye somewhere to rest.\n\n'
                 'Made for your screen\nEach painting is composed for a 16:9 screen first, so nothing important hides behind your icons, your dock or your menu bar.\n\n'
                 f'See the Signature collection: {utm("/collections/signature", 1)}\n\n'
                 'Share your setup. Which painting is on your screen right now? Reply with a photo, or tag us. We read every message.\n\n'
                 + TEXT_FOLLOW + LIST_NOTE + '\n' + TEXT_END),
    },
    'welcome-2': {
        'meta': 'Klaviyo: fluxo Welcome, e-mail 2, dia 4. Assunto: Pick a mood for your screen',
        'html': head('Pick a mood for your screen', 'Dark mode, sports cars, open sea or city nights.')
        + topbar('Pick a mood', 'VESPRO™') + LOGO
        + hero('Our collections', 'Pick a <em style="color:#d9b878;">mood</em> for your screen',
               'We release our work the way printmakers do, in editions. Each one has a name, a theme and a mood. Here are four places to start.')
        + collections(CARDS, 2)
        + cta(utm('/wallpapers', 2), 'See every collection')
        + divider() + setup()
        + help_grid()
        + footer(LIST_NOTE),
        'text': ('Pick a mood for your screen\n\nWe release our work the way printmakers do, in editions. Each one has a name, a theme and a mood. Here are four places to start.\n\n'
                 + ''.join(f"{c['name'].replace('&amp;', '&')}: {c['price']}\n{c['note']}\n{utm(c['path'], 2)}\n\n" for c in CARDS)
                 + f'See every collection: {utm("/wallpapers", 2)}\n\n' + TEXT_SETUP
                 + LIST_NOTE + '\n' + TEXT_END),
    },
    'welcome-3': {
        'meta': 'Klaviyo: fluxo Welcome, e-mail 3, dia 7. Assunto: Every painting we have made, one price',
        'html': head('Every painting we have made, one price', '150+ wallpapers, plus every new edition. Pay once.')
        + topbar('VESPRO™ Editions', '$19.99') + LOGO
        + hero('VESPRO™ Editions', 'Every painting. <em style="color:#d9b878;">One price.</em>',
               'If you could not pick just one mood, this is the easy answer: every painting we have made, 150+ so far, plus every edition we release from now on.')
        + picture(utm('/collections/complete', 3), 'complete', 'Four paintings from the VESPRO Editions collection')
        + checklist(['All 9 collections plus exclusive paintings you will not find in any collection',
                     'Every new edition added at no extra cost, through the same download link',
                     'Almost all in 4K (3840 x 2160); the Sporting collection is in HD',
                     'Pay once and keep the files for life. No subscription',
                     '14-day money-back guarantee'])
        + f'''        <tr><td align="center" style="padding:14px 32px 0;">
          <p style="margin:0;font-size:26px;font-family:{SERIF};color:#ffffff;">$19.99</p>
          <p style="margin:4px 0 0;font-size:12px;color:{MUTED};">The 9 collections cost $31.91 bought one by one</p>
        </td></tr>
'''
        + cta(utm('/collections/complete', 3), 'See VESPRO™ Editions')
        + boxed('Not sure yet? Reply to this email with your screen and the kind of paintings you like, and a real person will point you to the right collection.')
        + help_grid()
        + footer(LIST_NOTE),
        'text': ('Every painting. One price.\n\nIf you could not pick just one mood, this is the easy answer: every painting we have made, 150+ so far, plus every edition we release from now on.\n\n'
                 '- All 9 collections plus exclusive paintings you will not find in any collection\n'
                 '- Every new edition added at no extra cost, through the same download link\n'
                 '- Almost all in 4K (3840 x 2160); the Sporting collection is in HD\n'
                 '- Pay once and keep the files for life. No subscription\n'
                 '- 14-day money-back guarantee\n\n'
                 '$19.99 (the 9 collections cost $31.91 bought one by one)\n'
                 f'See VESPRO™ Editions: {utm("/collections/complete", 3)}\n\n'
                 'Not sure yet? Reply to this email with your screen and the kind of paintings you like, and a real person will point you to the right collection.\n\n'
                 + LIST_NOTE + '\n' + TEXT_END),
    },
})

os.makedirs(OUT, exist_ok=True)
for name, e in EMAILS.items():
    html = e['html'].replace('<!doctype html>\n', f'<!doctype html>\n<!-- {e["meta"]}\n     Gerado por scripts/emails.py: edite lá e rode de novo. -->\n', 1)
    for ext, body in (('html', html), ('txt', e['text'])):
        with open(os.path.join(OUT, f'{name}.{ext}'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(body)
    print(name, len(html), 'bytes')
