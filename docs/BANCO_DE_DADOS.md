# Modelagem de Banco de Dados — Supabase PostgreSQL

## 🗄️ Estrutura de Tabelas

A modelagem reflete fielmente as necessidades de conteúdo público, segurança e LGPD:

1. **`profiles`**: Usuários autorizados a acessar o `/admin` (`admin`, `editor`, `dpo`).
2. **`pages`**: Conteúdo estruturado das páginas institucionais.
3. **`posts`, `categories`, `tags`, `post_tags`**: Blog e artigos jurídicos.
4. **`media`**: Metadados das mídias hospedadas no Storage.
5. **`practice_areas`**: Áreas de atuação jurídica do escritório.
6. **`team_members`**: Equipe de advogados e sócios.
7. **`testimonials`**: Depoimentos institucionais.
8. **`legal_documents` & `legal_document_versions`**: Documentos jurídicos versionados (Políticas, Termos, Código de Conduta).
9. **`quizzes`, `quiz_questions`, `quiz_options`, `quiz_results_rules`**: Questionário de Conformidade LGPD.
10. **`contact_messages`**: Mensagens do Fale Conosco.
11. **`data_subject_requests`**: Requisições de titulares de dados (LGPD Art. 18).
12. **`consent_records`**: Registros comprobatórios de consentimento de cookies e formulários.
13. **`site_settings`**: Configurações globais (redes sociais, WhatsApp, rodapé, scripts).
14. **`redirects`**: Mapeamento de URLs 301.
15. **`audit_log`**: Log de auditoria de alterações do painel.

---

## 🔒 Políticas de Row Level Security (RLS)

- **Regra Geral:** `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` aplicado em 100% das tabelas.
- **Público:** Permissão exclusiva de `SELECT` em registros marcados como `published = true` e vigentes.
- **Dados Pessoais:** Leitura e alteração restritas aos papéis `admin` e `dpo` autenticados.
- **Auditoria:** Somente `INSERT` permitido por triggers internas e leitura por administradores.
