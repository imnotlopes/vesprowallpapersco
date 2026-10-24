// Redes sociais (rodapé e menu do celular). url vazia = ainda não criada: o ícone aparece, sem link.
import { SITE } from '../config';
export const SOCIAL = [
  { name: 'Instagram', ...SITE.instagram, svg: '<g fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/></g><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor"/>' },
  { name: 'TikTok', ...SITE.tiktok, svg: '<path fill="currentColor" d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.6c-1.4.1-2.6-.3-3.9-1.1v5.6c0 3.3-2.3 5.9-5.6 5.9-3.1 0-5.5-2.4-5.5-5.4 0-3.4 3-5.9 6.5-5.3v2.8c-1.6-.4-3.6.5-3.6 2.5 0 1.5 1.2 2.6 2.6 2.6 1.6 0 2.7-1.1 2.7-3.1V3h2.9z"/>' },
  { name: 'Facebook', ...SITE.facebook, svg: '<path fill="currentColor" d="M13.4 21v-7.6h2.6l.4-3h-3V8.5c0-.9.3-1.5 1.5-1.5h1.6V4.3c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.7v3h2.6V21h3.1z"/>' },
];
