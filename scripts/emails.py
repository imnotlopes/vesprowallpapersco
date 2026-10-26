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

os.makedirs(OUT, exist_ok=True)
for name, e in EMAILS.items():
    html = e['html'].replace('<!doctype html>\n', f'<!doctype html>\n<!-- {e["meta"]}\n     Gerado por scripts/emails.py: edite lá e rode de novo. -->\n', 1)
    for ext, body in (('html', html), ('txt', e['text'])):
        with open(os.path.join(OUT, f'{name}.{ext}'), 'w', encoding='utf-8', newline='\n') as f:
            f.write(body)
    print(name, len(html), 'bytes')
