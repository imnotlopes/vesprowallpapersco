// Configuração central da marca. Rastreamento: mesmo pixel e Clarity das landings VESPRO.
export const SITE = {
  name: 'VESPRO',
  url: 'https://www.vesprowallpapers.com',
  tagline: 'Oil painting wallpapers in 4K',
  description:
    'Hand-finished impasto oil painting wallpapers in 4K for MacBook, PC, iPhone and ultrawide monitors. Instant download, personal license.',
  email: 'support@vesprowallpapers.com',
  instagram: { handle: '@vesprowallpapers.co', url: 'https://www.instagram.com/vesprowallpapers.co/' },
  // redes do rodapé: TikTok e Facebook ainda vão ser criados; com url vazia o ícone aparece sem link
  tiktok: { handle: '', url: '' },
  facebook: { handle: '', url: '' },
  locale: 'en',
  ogImage: '/img/previews/d29.webp',
  metaPixelId: '1665089428567245',
  clarityId: 'yyby7xt2qu',
};

// Menu do topo no padrão de loja global: "Wallpapers" abre o menu grande (coleções + telas); os demais são links.
export const NAV = [
  { href: '/wallpapers', label: 'Wallpapers', mega: true },
  { href: '/collections/complete', label: 'VESPRO™ Editions' },
  { href: '/free-4k-wallpapers', label: 'Free Wallpapers' },
  { href: '/refunds', label: '14-Day Guarantee' },
  { href: '/about', label: 'Our Story' },
];

// Páginas por tela (menu grande, menu do celular e busca)
export const SCREENS = [
  { href: '/macbook-wallpapers', label: 'MacBook wallpapers', q: 'mac macbook laptop apple' },
  { href: '/iphone-wallpapers', label: 'iPhone wallpapers', q: 'iphone phone mobile lock screen' },
  { href: '/4k-desktop-wallpapers', label: '4K desktop wallpapers', q: 'desktop pc windows monitor 4k' },
  { href: '/ultrawide-wallpapers', label: 'Ultrawide wallpapers', q: 'ultrawide 21:9 monitor 3440' },
];

// Colunas do rodapé (a coluna "Support" com o e-mail fica fixa no Footer.astro)
export const FOOTER = [
  {
    title: 'Main menu',
    links: [
      { href: '/wallpapers', label: 'Shop all wallpapers' },
      { href: '/collections/complete', label: 'VESPRO™ Editions' },
      { href: '/collections/signature', label: 'Signature' },
      { href: '/collections/shadows', label: 'Shadows' },
      { href: '/collections/sporting', label: 'Sporting' },
      { href: '/free-4k-wallpapers', label: 'Free wallpapers' },
      { href: '/about', label: 'Our story' },
    ],
  },
  {
    title: 'Useful links',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/get-my-links', label: 'My downloads' },
      { href: '/refunds', label: '14-day guarantee' },
      { href: '/license', label: 'License' },
      { href: '/macbook-wallpapers', label: 'MacBook wallpapers' },
      { href: '/4k-desktop-wallpapers', label: '4K desktop wallpapers' },
      { href: '/iphone-wallpapers', label: 'iPhone wallpapers' },
      { href: '/privacy', label: 'Privacy policy' },
      { href: '/terms', label: 'Terms of service' },
    ],
  },
];
