const fs = require('fs');
const path = require('path');

const PROJECT_REF = 'iwzimemdxchmcrvlyhxg';
const TOKEN = 'sbp_fc988fd3048cfc32c05e03b4f2404b55d343b7f5';

async function executeSql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Erro SQL (${res.status}): ${err}`);
  }
  return await res.json();
}

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

async function run() {
  console.log('--- Iniciando Importação Idempotente de Conteúdo no Supabase ---');

  const snapshotDir = path.join(__dirname, '..', 'snapshot');
  const rawDir = path.join(snapshotDir, 'raw_data');

  const categories = JSON.parse(fs.readFileSync(path.join(rawDir, 'categories.json'), 'utf-8'));
  const pages = JSON.parse(fs.readFileSync(path.join(rawDir, 'pages.json'), 'utf-8'));
  const posts = JSON.parse(fs.readFileSync(path.join(rawDir, 'posts.json'), 'utf-8'));
  const seoData = fs.existsSync(path.join(snapshotDir, 'seo', 'seo_metadata.json'))
    ? JSON.parse(fs.readFileSync(path.join(snapshotDir, 'seo', 'seo_metadata.json'), 'utf-8'))
    : {};

  // 1. IMPORTAR CATEGORIAS
  console.log(`\nImportando ${categories.length} categorias...`);
  for (const cat of categories) {
    const sql = `
      INSERT INTO public.categories (wp_id, name, slug, description)
      VALUES (${cat.id}, ${escapeSql(cat.name)}, ${escapeSql(cat.slug)}, ${escapeSql(cat.description)})
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description;
    `;
    await executeSql(sql);
  }
  console.log('✓ Categorias importadas!');

  // 2. IMPORTAR REDIRECIONAMENTOS 301 LEGADOS (/novosite/*)
  console.log('\nConfigurando redirecionamentos 301...');
  const legacyRoutes = [
    { src: '/novosite/artigos-e-publicacoes/', tgt: '/artigos-e-publicacoes/' },
    { src: '/novosite/codigo-de-conduta/', tgt: '/codigo-de-conduta/' },
    { src: '/novosite/canal-de-denuncias/', tgt: '/canal-de-denuncias/' },
    { src: '/novosite/compliance/', tgt: '/compliance/' },
    { src: '/novosite/direito-digital-e-tecnologia/', tgt: '/direito-digital-e-tecnologia/' },
    { src: '/novosite/protecao-de-dados-lgpd/', tgt: '/protecao-de-dados-lgpd/' },
    { src: '/novosite/direito-do-trabalho/', tgt: '/direito-do-trabalho/' },
    { src: '/novosite/direito-previdenciario/', tgt: '/direito-previdenciario/' },
    { src: '/novosite/direito-civil-e-empresarial/', tgt: '/direito-civil-e-empresarial/' }
  ];

  for (const r of legacyRoutes) {
    const sql = `
      INSERT INTO public.redirects (source_path, target_path, status_code, is_active)
      VALUES (${escapeSql(r.src)}, ${escapeSql(r.tgt)}, 301, true)
      ON CONFLICT (source_path) DO UPDATE SET
        target_path = EXCLUDED.target_path,
        status_code = EXCLUDED.status_code;
    `;
    await executeSql(sql);
  }
  console.log('✓ 9 redirecionamentos 301 importados!');

  // 3. IMPORTAR PÁGINAS INSTITUCIONAIS
  console.log(`\nImportando ${pages.length} páginas institucionais...`);
  for (const p of pages) {
    const seo = seoData[`page_${p.slug}`] || {};
    const title = p.title?.rendered || p.slug;
    const content = p.content?.rendered || '';
    const sql = `
      INSERT INTO public.pages (wp_id, title, slug, content_html, is_published, seo_title, seo_description)
      VALUES (
        ${p.id},
        ${escapeSql(title)},
        ${escapeSql(p.slug)},
        ${escapeSql(content)},
        true,
        ${escapeSql(seo.title || title)},
        ${escapeSql(seo.description || '')}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        content_html = EXCLUDED.content_html,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description;
    `;
    await executeSql(sql);
  }
  console.log('✓ Páginas institucionais importadas!');

  // 4. IMPORTAR POSTS E ARTIGOS
  console.log(`\nImportando ${posts.length} posts...`);
  for (const post of posts) {
    const seo = seoData[`post_${post.slug}`] || {};
    const title = post.title?.rendered || post.slug;
    const content = post.content?.rendered || '';
    const excerpt = post.excerpt?.rendered || '';
    const catWpId = post.categories?.[0] || null;

    const sql = `
      INSERT INTO public.posts (
        wp_id, title, slug, content_html, excerpt, status,
        category_id, seo_title, seo_description, published_at
      )
      VALUES (
        ${post.id},
        ${escapeSql(title)},
        ${escapeSql(post.slug)},
        ${escapeSql(content)},
        ${escapeSql(excerpt)},
        'published',
        (SELECT id FROM public.categories WHERE wp_id = ${catWpId || 'NULL'} LIMIT 1),
        ${escapeSql(seo.title || title)},
        ${escapeSql(seo.description || '')},
        ${escapeSql(post.date || new Date().toISOString())}
      )
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        content_html = EXCLUDED.content_html,
        excerpt = EXCLUDED.excerpt,
        seo_title = EXCLUDED.seo_title,
        seo_description = EXCLUDED.seo_description;
    `;
    await executeSql(sql);
  }
  console.log('✓ Posts e publicações importados!');

  // 5. IMPORTAR SITE SETTINGS
  console.log('\nConfigurando site_settings...');
  const settings = [
    {
      key: 'general',
      value: {
        site_name: 'Mascârello Haus Advocacia',
        tagline: 'Soluções Jurídicas Estratégicas',
        whatsapp: '+5549999281878',
        whatsapp_url: 'https://wa.me/5549999281878',
        contact_email: 'contato@mascarellohaus.adv.br',
        dpo_email: 'privacidade@mascarellohaus.adv.br',
        address: 'Videira / Caçador — Santa Catarina',
        instagram_url: 'https://www.instagram.com/mascarellohaus.adv/',
        linkedin_url: 'https://www.linkedin.com/company/mascarello-haus-advocacia/'
      }
    },
    {
      key: 'lgpd_policy',
      value: {
        current_version: '1.0',
        dpo_name: 'Encarregado pelo Tratamento de Dados Pessoais',
        dpo_email: 'privacidade@mascarellohaus.adv.br',
        response_time_days: 15
      }
    }
  ];

  for (const s of settings) {
    const sql = `
      INSERT INTO public.site_settings (key, value_json)
      VALUES (${escapeSql(s.key)}, ${escapeSql(JSON.stringify(s.value))}::jsonb)
      ON CONFLICT (key) DO UPDATE SET
        value_json = EXCLUDED.value_json;
    `;
    await executeSql(sql);
  }
  console.log('✓ Configurações gerais salvas em site_settings!');

  // 6. VERIFICAÇÃO FINAL
  const checkCount = await executeSql(`
    SELECT 
      (SELECT count(*) FROM public.pages) as total_pages,
      (SELECT count(*) FROM public.posts) as total_posts,
      (SELECT count(*) FROM public.categories) as total_categories,
      (SELECT count(*) FROM public.redirects) as total_redirects,
      (SELECT count(*) FROM public.site_settings) as total_settings;
  `);

  console.log('\n--- Resumo de Dados Importados no Supabase ---');
  console.table(checkCount);
}

run().catch(err => {
  console.error('Falha na importação:', err);
  process.exit(1);
});
