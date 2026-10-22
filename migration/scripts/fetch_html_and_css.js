const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '..', 'snapshot', 'raw_data', 'urls_summary.json');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

const HTML_DIR = path.join(__dirname, '..', 'snapshot', 'html');
const CSS_DIR = path.join(__dirname, '..', 'snapshot', 'css');

async function downloadFile(url, dest) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buffer));
    return true;
  } catch (err) {
    console.error(`Falha ao baixar ${url}: ${err.message}`);
    return false;
  }
}

async function run() {
  const allUrls = [
    { type: 'home', slug: 'home', link: 'https://mascarellohaus.adv.br/' },
    ...summary.pages.map(p => ({ type: 'page', slug: p.slug, link: p.link })),
    ...summary.posts.map(p => ({ type: 'post', slug: p.slug, link: p.link }))
  ];

  console.log(`Total de URLs a baixar: ${allUrls.length}`);

  const discoveredLinks = new Set();
  const cssUrls = new Set();
  const formsDetected = [];

  for (const item of allUrls) {
    console.log(`Baixando [${item.type}] ${item.slug} (${item.link})...`);
    try {
      const res = await fetch(item.link);
      if (!res.ok) {
        console.warn(`Aviso: ${item.link} retornou status ${res.status}`);
        continue;
      }
      const html = await res.text();
      const filename = `${item.type}_${item.slug}.html`;
      fs.writeFileSync(path.join(HTML_DIR, filename), html, 'utf-8');

      // Extrair CSS links
      const cssRegex = /<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi;
      let match;
      while ((match = cssRegex.exec(html)) !== null) {
        cssUrls.add(match[1]);
      }

      // Extrair links internos
      const linkRegex = /href=["'](https?:\/\/mascarellohaus\.adv\.br[^"']*)["']/gi;
      while ((match = linkRegex.exec(html)) !== null) {
        discoveredLinks.add(match[1]);
      }

      // Detectar formulários
      if (html.includes('<form') || html.includes('wpforms')) {
        const formMatches = html.match(/<form[\s\S]*?<\/form>/gi) || [];
        formsDetected.push({
          page: item.slug,
          url: item.link,
          formCount: formMatches.length,
          forms: formMatches.map(f => {
            const idMatch = f.match(/id=["']([^"']+)["']/i);
            const classMatch = f.match(/class=["']([^"']+)["']/i);
            const actionMatch = f.match(/action=["']([^"']+)["']/i);
            return {
              id: idMatch ? idMatch[1] : null,
              class: classMatch ? classMatch[1] : null,
              action: actionMatch ? actionMatch[1] : null,
              inputs: (f.match(/<input[^>]+>/gi) || []).map(inp => {
                const name = inp.match(/name=["']([^"']+)["']/i);
                const type = inp.match(/type=["']([^"']+)["']/i);
                return { name: name ? name[1] : null, type: type ? type[1] : null };
              })
            };
          })
        });
      }

    } catch (err) {
      console.error(`Erro ao processar ${item.link}:`, err.message);
    }
  }

  // Baixar arquivos CSS
  console.log(`\nBaixando ${cssUrls.size} arquivos CSS...`);
  const cssList = Array.from(cssUrls);
  fs.writeFileSync(path.join(CSS_DIR, 'css_sources.json'), JSON.stringify(cssList, null, 2), 'utf-8');

  for (let i = 0; i < cssList.length; i++) {
    const url = cssList[i];
    try {
      const parsed = new URL(url);
      const safeName = parsed.pathname.replace(/[^a-zA-Z0-9_-]/g, '_') + '.css';
      const dest = path.join(CSS_DIR, safeName);
      if (!fs.existsSync(dest)) {
        await downloadFile(url, dest);
      }
    } catch (e) {
      console.warn(`CSS inválido: ${url}`);
    }
  }

  // Salvar relatórios
  fs.writeFileSync(path.join(__dirname, '..', 'snapshot', 'discovered_links.json'), JSON.stringify(Array.from(discoveredLinks), null, 2), 'utf-8');
  fs.writeFileSync(path.join(__dirname, '..', 'snapshot', 'detected_forms.json'), JSON.stringify(formsDetected, null, 2), 'utf-8');

  console.log('\n✓ Processamento concluído com sucesso!');
  console.log(`- HTMLs baixados: ${allUrls.length}`);
  console.log(`- Arquivos CSS catalogados: ${cssUrls.size}`);
  console.log(`- Links internos mapeados: ${discoveredLinks.size}`);
  console.log(`- Formulários detectados: ${formsDetected.length}`);
}

run().catch(console.error);
