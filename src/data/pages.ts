// Registro das páginas fixas: SEO de cada uma e se já pode ser indexada.
// indexable: false => <meta robots="noindex"> e fora do sitemap (página ainda sem conteúdo suficiente).
// Palavras-chave: research/mapa-de-palavras-chave.md
export interface PageMeta {
  path: string;
  title: string;
  description: string;
  keyword: string;
  indexable: boolean;
  priority: number;
}

export const PAGES: Record<string, PageMeta> = {
  home: {
    path: '/',
    title: 'VESPRO™ | Oil Painting Wallpapers in 4K for Mac, PC & iPhone',
    description:
      'Impasto oil painting wallpapers in 4K for MacBook, PC, iPhone and ultrawide. Thick brushstrokes, real texture. Instant download.',
    keyword: 'oil painting wallpapers 4k',
    indexable: true,
    priority: 1.0,
  },
  oil: {
    path: '/oil-painting-wallpapers',
    title: 'Oil Painting Wallpapers 4K: Impasto Art for Every Screen | VESPRO™',
    description:
      'Oil painting wallpapers in 4K with real impasto texture: landscapes, cities, sea, cars and more. For MacBook, PC, iPhone and ultrawide.',
    keyword: 'painting wallpapers / oil painting wallpaper 4k',
    indexable: true,
    priority: 0.9,
  },
  iphone: {
    path: '/iphone-wallpapers',
    title: 'Painted iPhone Wallpapers 4K: Oil Painting Backgrounds | VESPRO™',
    description:
      'Oil painting iPhone wallpapers sized for every iPhone screen, from the mini to the Pro Max. Lock screen ready. Instant download.',
    keyword: 'iphone wallpaper 4k / painted iphone wallpaper',
    indexable: false,
    priority: 0.8,
  },
  macbook: {
    path: '/macbook-wallpapers',
    title: 'MacBook Wallpapers 4K: Oil Painting Desktop Art | VESPRO™',
    description:
      'Oil painting wallpapers for MacBook Air, MacBook Pro and iMac, in 4K and 5K ratios. Sharp on Retina displays.',
    keyword: 'macbook wallpaper 4k / mac wallpaper',
    indexable: true,
    priority: 0.8,
  },
  desktop: {
    path: '/4k-desktop-wallpapers',
    title: '4K Desktop Wallpapers: Oil Painting Art for PC & Windows | VESPRO™',
    description:
      '4K oil painting desktop wallpapers (3840×2160) for Windows PCs, laptops and monitors. Instant download.',
    keyword: 'desktop wallpaper 4k / wallpaper 4k pc',
    indexable: true,
    priority: 0.8,
  },
  ultrawide: {
    path: '/ultrawide-wallpapers',
    title: 'Ultrawide Wallpapers: 2560×1080 & 3440×1440 Oil Paintings | VESPRO™',
    description:
      'Oil painting wallpapers for ultrawide monitors in 21:9 and 32:9: 2560×1080, 3440×1440 and 5120×1440.',
    keyword: 'wallpaper 2560x1080 / ultrawide wallpaper',
    indexable: false,
    priority: 0.7,
  },
  free: {
    path: '/free-4k-wallpapers',
    title: 'Free 4K Wallpapers: 12 Oil Painting Wallpapers for Desktop & Phone | VESPRO™',
    description:
      'Download 12 free oil painting wallpapers in 4K for desktop and phone. Delivered to your inbox instantly.',
    keyword: 'free 4k wallpapers / free downloadable wallpapers for desktop',
    indexable: true,
    priority: 0.8,
  },
  catalog: {
    path: '/wallpapers',
    title: 'All Wallpapers: Oil Painting Collections | VESPRO™',
    description: 'Browse every VESPRO™ oil painting wallpaper by theme, color and device.',
    keyword: 'oil painting wallpapers collection',
    indexable: true,
    priority: 0.9,
  },
  complete: {
    path: '/collections/complete',
    title: 'VESPRO™ Editions: The Complete Collection of Oil Painting Wallpapers in 4K',
    description: 'Every VESPRO™ oil painting wallpaper in 4K in one download, plus every new release. One-time payment, instant delivery.',
    keyword: 'wallpaper collection / 4k wallpaper collection',
    indexable: true,
    priority: 0.9,
  },
  thanks: {
    path: '/thank-you',
    title: 'Thank you, your wallpapers are ready | VESPRO™',
    description: 'Your VESPRO™ wallpapers are on their way to your inbox.',
    keyword: '',
    indexable: false,
    priority: 0,
  },
  links: {
    path: '/get-my-links',
    title: 'Get your download links again | VESPRO™',
    description: 'Already bought? Enter your email and we will resend your VESPRO™ download links.',
    keyword: '',
    indexable: false,
    priority: 0,
  },
  about: {
    path: '/about',
    title: 'Our Story: Why We Paint Wallpapers | VESPRO™',
    description: 'VESPRO™ paints impasto oil painting wallpapers for the screens you look at all day. Why oil paint, how an edition comes together, and what we believe.',
    keyword: 'vespro',
    indexable: true,
    priority: 0.5,
  },
  contact: {
    path: '/contact',
    title: 'Contact VESPRO™ | Support, Orders & Licensing',
    description: 'Talk to a real person at VESPRO™ about downloads, orders, refunds or commercial licensing. We reply within one working day.',
    keyword: '',
    indexable: true,
    priority: 0.4,
  },
  license: {
    path: '/license',
    title: 'License: Personal & Commercial Use | VESPRO™',
    description: 'What you can and cannot do with VESPRO™ wallpapers, and how to get a commercial license.',
    keyword: '',
    indexable: true,
    priority: 0.3,
  },
  refunds: {
    path: '/refunds',
    title: 'Refund Policy | VESPRO™',
    description: 'Our money-back guarantee on digital wallpaper purchases.',
    keyword: '',
    indexable: true,
    priority: 0.2,
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | VESPRO™',
    description: 'How VESPRO™ collects and uses your data.',
    keyword: '',
    indexable: true,
    priority: 0.2,
  },
  terms: {
    path: '/terms',
    title: 'Terms of Service | VESPRO™',
    description: 'Terms for using vesprowallpapers.com and buying VESPRO™ wallpapers.',
    keyword: '',
    indexable: true,
    priority: 0.2,
  },
};
