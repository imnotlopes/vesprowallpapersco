// Site estático da marca VESPRO (vesprowallpapers.com).
// URLs sem barra no final: /iphone-wallpapers (o Vercel serve iphone-wallpapers.html com cleanUrls).
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.vesprowallpapers.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  compressHTML: true,
});
