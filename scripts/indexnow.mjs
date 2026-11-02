// Avisa o Bing (e os outros buscadores do IndexNow) das páginas que mudaram no site publicado.
// Lê o sitemap no ar, compara o conteúdo de cada página com a última rodada e envia só as diferenças.
// A chave é pública por definição: fica em public/<KEY>.txt e precisa estar no ar antes do primeiro envio.
// Uso: node scripts/indexnow.mjs [--dry-run]   (a Action .github/workflows/indexnow.yml roda a cada publicação)
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const HOST = 'www.vesprowallpapers.com';
const KEY = '56a7aa48d62e41c49eadd8a72217516a';
const KEY_URL = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const STATE = '.indexnow-state.json';
const dryRun = process.argv.includes('--dry-run');

// Só o conteúdo conta: script, estilo e nomes de arquivo com hash mudam sem a página ter mudado.
const fingerprint = (html) => createHash('sha256')
  .update(html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<link\b[^>]*>|\/_astro\/[^"' )]+/gi, ''))
  .digest('hex');

async function pageHashes(urls) {
  const hashes = {};
  const queue = [...urls];
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const res = await fetch(url);
        if (res.ok) hashes[url] = fingerprint(await res.text());
        else console.warn(`ignorada (${res.status}): ${url}`);
      } catch (err) {
        console.warn(`ignorada (${err.message}): ${url}`);
      }
    }
  }));
  return hashes;
}

async function main() {
  const sitemap = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (!urls.length) throw new Error('sitemap sem páginas');

  const before = existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {};
  const hashes = await pageHashes(urls);
  const changed = Object.keys(hashes).filter((u) => hashes[u] !== before[u]);
  const removed = Object.keys(before).filter((u) => !urls.includes(u));
  const urlList = [...changed, ...removed];
  // página que falhou agora mantém a marca antiga e volta a ser comparada na próxima rodada
  const after = { ...Object.fromEntries(urls.filter((u) => before[u]).map((u) => [u, before[u]])), ...hashes };

  console.log(`${urls.length} páginas no sitemap, ${changed.length} novas ou alteradas, ${removed.length} removidas`);
  if (dryRun) { urlList.slice(0, 20).forEach((u) => console.log(u)); return; }
  if (!urlList.length) { writeFileSync(STATE, JSON.stringify(after)); return; }

  // Antes da primeira publicação da chave não há o que enviar; a próxima rodada tenta de novo.
  const live = await fetch(KEY_URL);
  if (!live.ok || (await live.text()).trim() !== KEY) { console.log('chave ainda não está no ar, nada enviado'); return; }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_URL, urlList }),
  });
  if (!res.ok) throw new Error(`IndexNow respondeu ${res.status}: ${await res.text()}`);
  writeFileSync(STATE, JSON.stringify(after));
  console.log(`IndexNow aceitou ${urlList.length} páginas (${res.status})`);
}

main().catch((err) => { console.error(err.message); process.exit(1); });
