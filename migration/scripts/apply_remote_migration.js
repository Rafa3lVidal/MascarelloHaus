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

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    throw new Error(`Erro SQL (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function run() {
  console.log('--- Aplicando migração inicial no projeto Mascârello Haus (iwzimemdxchmcrvlyhxg) ---');
  const migrationPath = path.join(__dirname, '..', '..', 'supabase', 'migrations', '20261022000000_initial_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  console.log('Enviando DDL para o PostgreSQL...');
  const result = await executeSql(sql);
  console.log('✓ Migração aplicada com sucesso!');

  // Configuração dos Buckets de Storage
  console.log('\n--- Configurando Buckets de Storage no Supabase ---');
  const storageSql = `
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES 
      ('public-media', 'public-media', true, 52428800, null),
      ('private-attachments', 'private-attachments', false, 20971520, null)
    ON CONFLICT (id) DO UPDATE SET 
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit;

    -- Políticas de Storage
    DO $$ BEGIN
      CREATE POLICY "Public Read Media Bucket" ON storage.objects
        FOR SELECT USING (bucket_id = 'public-media');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE POLICY "Staff Upload Media Bucket" ON storage.objects
        FOR INSERT WITH CHECK (
          bucket_id = 'public-media' AND 
          EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
        );
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `;
  
  await executeSql(storageSql);
  console.log('✓ Buckets public-media e private-attachments configurados com sucesso!');

  // Validar tabelas criadas
  const checkTablesSql = `
    SELECT table_name, (
      SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public'
    ) as column_count
    FROM information_schema.tables t
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  const tables = await executeSql(checkTablesSql);
  console.log('\nTabelas ativas no schema public:');
  console.table(tables);
}

run().catch(err => {
  console.error('Falha na migração:', err);
  process.exit(1);
});
