const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const summaryPath = path.join(__dirname, '..', 'snapshot', 'raw_data', 'urls_summary.json');
const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'snapshot', 'screenshots');
const SEO_DIR = path.join(__dirname, '..', 'snapshot', 'seo');

if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
if (!fs.existsSync(SEO_DIR)) fs.mkdirSync(SEO_DIR, { recursive: true });

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
  { name: '1920', width: 1920, height: 1080 }
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          window.scrollTo(0, 0);
          resolve();
        }
      }, 100);
    });
  });
}

async function extractSeoData(page) {
  return await page.evaluate(() => {
    const getMeta = (selector, attr = 'content') => {
      const el = document.querySelector(selector);
      return el ? el.getAttribute(attr) : null;
    };

    const jsonLdScripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map(s => {
      try { return JSON.parse(s.textContent); } catch (e) { return s.textContent; }
    });

    return {
      title: document.title,
      canonical: getMeta('link[rel="canonical"]', 'href'),
      description: getMeta('meta[name="description"]'),
      robots: getMeta('meta[name="robots"]'),
      ogTitle: getMeta('meta[property="og:title"]'),
      ogDescription: getMeta('meta[property="og:description"]'),
      ogUrl: getMeta('meta[property="og:url"]'),
      ogSiteName: getMeta('meta[property="og:site_name"]'),
      ogImage: getMeta('meta[property="og:image"]'),
      ogType: getMeta('meta[property="og:type"]'),
      twitterCard: getMeta('meta[name="twitter:card"]'),
      twitterTitle: getMeta('meta[name="twitter:title"]'),
      twitterDescription: getMeta('meta[name="twitter:description"]'),
      twitterImage: getMeta('meta[name="twitter:image"]'),
      schemaOrg: jsonLdScripts
    };
  });
}

async function run() {
  const allUrls = [
    { type: 'home', slug: 'home', link: 'https://mascarellohaus.adv.br/' },
    ...summary.pages.map(p => ({ type: 'page', slug: p.slug, link: p.link })),
    ...summary.posts.map(p => ({ type: 'post', slug: p.slug, link: p.link }))
  ];

  console.log(`Iniciando captura de ${allUrls.length} páginas em 4 breakpoints...`);

  const browser = await chromium.launch({ headless: true });
  const allSeo = {};

  for (const item of allUrls) {
    console.log(`\nProcessando [${item.type}] ${item.slug} (${item.link})...`);
    const pageDir = path.join(SCREENSHOTS_DIR, `${item.type}_${item.slug}`);
    if (!fs.existsSync(pageDir)) fs.mkdirSync(pageDir, { recursive: true });

    let seoExtracted = false;

    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1
      });
      const page = await context.newPage();

      try {
        await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        // Aguarda carregar recursos adicionais
        try {
          await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch (e) {
          // segue se der timeout de networkidle
        }

        // Scroll para acionar lazy-loading
        await autoScroll(page);
        await page.waitForTimeout(1000);

        // Extrai SEO uma vez (no primeiro viewport)
        if (!seoExtracted) {
          allSeo[`${item.type}_${item.slug}`] = await extractSeoData(page);
          seoExtracted = true;
        }

        const screenshotPath = path.join(pageDir, `${vp.name}px.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`  ✓ Capturado ${vp.name}px`);
      } catch (err) {
        console.error(`  ✗ Erro em ${item.slug} (${vp.name}px):`, err.message);
      } finally {
        await page.close();
        await context.close();
      }
    }
  }

  await browser.close();

  fs.writeFileSync(path.join(SEO_DIR, 'seo_metadata.json'), JSON.stringify(allSeo, null, 2), 'utf-8');
  console.log('\n✓ Todas as capturas de baseline e metadados SEO concluídos com sucesso!');
}

run().catch(err => {
  console.error('Falha geral no runner:', err);
  process.exit(1);
});
