// Site estático da marca VESPRO (vesprowallpapers.com).
// URLs sem barra no final: /iphone-wallpapers (o Vercel serve iphone-wallpapers.html com cleanUrls).
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.vesprowallpapers.com',
  trailingSlash: 'never',
  // CSS embutido no HTML (cerca de 12 KB comprimidos): no 4G lento, cada arquivo CSS separado atrasava o primeiro desenho
  build: { format: 'file', inlineStylesheets: 'always' },
  compressHTML: true,
});
