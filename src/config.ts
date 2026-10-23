// Configuração central da marca. Rastreamento: mesmo pixel e Clarity das landings VESPRO.
export const SITE = {
  name: 'VESPRO',
  url: 'https://www.vesprowallpapers.com',
  tagline: 'Oil painting wallpapers in 4K',
  description:
    'Hand-finished impasto oil painting wallpapers in 4K for MacBook, PC, iPhone and ultrawide monitors. Instant download, personal license.',
  email: 'support@vesprowallpapers.com',
  instagram: { handle: '@vesprowallpapers.co', url: 'https://www.instagram.com/vesprowallpapers.co/' },
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
];

// Páginas por tela (menu grande, menu do celular e busca)
export const SCREENS = [
  { href: '/macbook-wallpapers', label: 'MacBook wallpapers', q: 'mac macbook laptop apple' },
  { href: '/iphone-wallpapers', label: 'iPhone wallpapers', q: 'iphone phone mobile lock screen' },
  { href: '/4k-desktop-wallpapers', label: '4K desktop wallpapers', q: 'desktop pc windows monitor 4k' },
  { href: '/ultrawide-wallpapers', label: 'Ultrawide wallpapers', q: 'ultrawide 21:9 monitor 3440' },
];

export const FOOTER = [
  {
    title: 'Wallpapers',
    links: [
      { href: '/oil-painting-wallpapers', label: 'Oil painting wallpapers' },
      { href: '/macbook-wallpapers', label: 'MacBook wallpapers' },
      { href: '/iphone-wallpapers', label: 'iPhone wallpapers' },
      { href: '/4k-desktop-wallpapers', label: '4K desktop wallpapers' },
      { href: '/ultrawide-wallpapers', label: 'Ultrawide wallpapers' },
      { href: '/free-4k-wallpapers', label: 'Free 4K wallpapers' },
    ],
  },
  {
    title: 'VESPRO™',
    links: [
      { href: '/collections/complete', label: 'VESPRO™ Editions' },
      { href: '/get-my-links', label: 'Get my download links' },
      { href: '/license', label: 'License' },
      { href: '/refunds', label: 'Refunds' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];
