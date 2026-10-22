const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://mascarellohaus.adv.br';
const OUT_DIR = path.join(__dirname, '..', 'snapshot', 'raw_data');

async function fetchAll(endpoint) {
  let page = 1;
  let allItems = [];
  while (true) {
    const url = `${BASE_URL}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}`;
    console.log(`Fetching ${url}...`);
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400 && allItems.length > 0) {
        // Out of pages in pagination
        break;
      }
      throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    }
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) break;
    allItems = allItems.concat(items);
    const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
    console.log(`Endpoint ${endpoint}: loaded page ${page}/${totalPages} (${items.length} items)`);
    if (page >= totalPages) break;
    page++;
  }
  return allItems;
}

async function run() {
  console.log('--- Iniciando extração de dados da API WordPress ---');
  
  // 1. Pages
  const pages = await fetchAll('pages');
  fs.writeFileSync(path.join(OUT_DIR, 'pages.json'), JSON.stringify(pages, null, 2), 'utf-8');
  console.log(`✓ Salvas ${pages.length} páginas em pages.json`);

  // 2. Posts
  const posts = await fetchAll('posts');
  fs.writeFileSync(path.join(OUT_DIR, 'posts.json'), JSON.stringify(posts, null, 2), 'utf-8');
  console.log(`✓ Salvos ${posts.length} posts em posts.json`);

  // 3. Categories
  const categories = await fetchAll('categories');
  fs.writeFileSync(path.join(OUT_DIR, 'categories.json'), JSON.stringify(categories, null, 2), 'utf-8');
  console.log(`✓ Salvas ${categories.length} categorias em categories.json`);

  // 4. Media
  const media = await fetchAll('media');
  fs.writeFileSync(path.join(OUT_DIR, 'media.json'), JSON.stringify(media, null, 2), 'utf-8');
  console.log(`✓ Salvos ${media.length} itens de mídia em media.json`);

  // Gerar resumo de URLs
  const summary = {
    extractedAt: new Date().toISOString(),
    totals: {
      pages: pages.length,
      posts: posts.length,
      categories: categories.length,
      media: media.length
    },
    pages: pages.map(p => ({
      id: p.id,
      slug: p.slug,
      link: p.link,
      title: p.title?.rendered,
      status: p.status,
      date: p.date,
      modified: p.modified,
      parent: p.parent
    })),
    posts: posts.map(p => ({
      id: p.id,
      slug: p.slug,
      link: p.link,
      title: p.title?.rendered,
      status: p.status,
      date: p.date,
      categories: p.categories
    }))
  };

  fs.writeFileSync(path.join(OUT_DIR, 'urls_summary.json'), JSON.stringify(summary, null, 2), 'utf-8');
  console.log(`✓ Resumo consolidado salvo em urls_summary.json`);
}

run().catch(err => {
  console.error('Erro na extração:', err);
  process.exit(1);
});
