const fs = require('fs');
const path = require('path');

const MEDIA_FILE = path.join(__dirname, '..', 'snapshot', 'raw_data', 'media.json');
const OUT_DIR = path.join(__dirname, '..', 'snapshot', 'media');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const mediaList = JSON.parse(fs.readFileSync(MEDIA_FILE, 'utf-8'));

async function downloadMedia(item) {
  const url = item.source_url;
  if (!url) return null;

  try {
    const parsed = new URL(url);
    // Preservar caminho relativo ex: uploads/2025/01/areas-de-atuacao-1.png
    const pathname = parsed.pathname; // ex: /wp-content/uploads/2025/01/areas-de-atuacao-1.png
    const subpath = pathname.replace(/^\/wp-content\/uploads\//, '');
    const dest = path.join(OUT_DIR, subpath);
    const destDir = path.dirname(dest);

    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    if (fs.existsSync(dest)) {
      return { id: item.id, url, path: subpath, status: 'cached' };
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    return { id: item.id, url, path: subpath, size: buffer.byteLength, status: 'downloaded' };
  } catch (err) {
    console.error(`Erro ao baixar mídia #${item.id} (${url}):`, err.message);
    return { id: item.id, url, error: err.message, status: 'failed' };
  }
}

async function runPool(items, concurrency = 5) {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      const res = await downloadMedia(current);
      results.push(res);
      if (results.length % 20 === 0 || results.length === items.length) {
        console.log(`Baixadas ${results.length}/${items.length} mídias...`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

async function run() {
  console.log(`--- Iniciando download de ${mediaList.length} mídias originais ---`);
  const results = await runPool(mediaList, 5);
  
  const catalog = mediaList.map(m => {
    const r = results.find(x => x && x.id === m.id);
    return {
      id: m.id,
      slug: m.slug,
      title: m.title?.rendered,
      source_url: m.source_url,
      local_path: r?.path || null,
      mime_type: m.mime_type,
      media_type: m.media_type,
      alt_text: m.alt_text,
      width: m.media_details?.width || null,
      height: m.media_details?.height || null,
      file_size: m.media_details?.filesize || null
    };
  });

  fs.writeFileSync(path.join(OUT_DIR, 'media_catalog.json'), JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`✓ Todas as mídias salvas e catalogadas em media_catalog.json!`);
}

run().catch(console.error);
