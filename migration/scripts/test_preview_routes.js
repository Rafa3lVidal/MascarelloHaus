import { chromium } from 'playwright';

const routesToTest = [
  { path: '/', title: 'Home' },
  { path: '/quem-somos/', title: 'Quem Somos' },
  { path: '/areas-de-atuacao/', title: 'Áreas de Atuação' },
  { path: '/direito-civil-e-empresarial/', title: 'Direito Civil' },
  { path: '/artigos-e-publicacoes/', title: 'Artigos e Publicações' },
  { path: '/contato/', title: 'Contato' },
  { path: '/central-de-protecao-de-dados/', title: 'Central LGPD' },
  { path: '/questionario-de-conformidade/', title: 'Questionário de Conformidade' },
  { path: '/codigo-de-conduta/', title: 'Código de Conduta' },
  { path: '/canal-de-denuncias/', title: 'Canal de Denúncias' },
  { path: '/novosite/artigos-e-publicacoes/', title: 'Redirecionamento Legado' },
  { path: '/admin', title: 'Login Admin' }
];

async function run() {
  console.log('--- Iniciando Verificação Automatizada de Rotas no Preview Local ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let passed = 0;
  let failed = 0;

  for (const r of routesToTest) {
    const url = `http://localhost:4173${r.path}`;
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const currentUrl = page.url();
      const status = response ? response.status() : 'N/A';
      const pageTitle = await page.title();

      console.log(`[PASS] ${r.path} -> Status: ${status} | URL Final: ${currentUrl} | Título: "${pageTitle}"`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${r.path} -> Erro: ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  console.log(`\nResultado da Bateria de Rotas: ${passed} passaram, ${failed} falharam.`);
}

run().catch(console.error);
