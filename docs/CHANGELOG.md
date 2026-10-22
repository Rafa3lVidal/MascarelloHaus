# Changelog — Mascârello Haus

Todas as alterações notáveis deste projeto serão registradas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.3.0] - 2026-10-22
### Concluído
- **Fase 1 (Inventário e Snapshot):**
  - Crawl e extração via REST API de 19 páginas institucionais e 11 publicações.
  - Download das 237 mídias originais sem compressão (PNG, JPG, PDF, SVG, WOFF2).
  - Catalogação dos 4 formulários (Contato, LGPD Art. 18, Canal de Denúncias, Quiz Corporativo).
  - Geração do baseline de 124 capturas de tela nos 4 breakpoints (375px, 768px, 1280px e 1920px).
- **Fase 2 (Arquitetura e Scaffold):**
  - Configuração do projeto Vite + React + TypeScript + React Router.
  - Configuração de `vercel.json` com redirects 301 para caminhos legados (`/novosite/*`) e headers de segurança OWASP.
- **Fase 3 (Banco de Dados Supabase):**
  - Criação e aplicação da migração `20261022000000_initial_schema.sql` com 22 tabelas, RLS 100% ativo e triggers de auditoria.
  - Configuração dos Buckets `public-media` e `private-attachments`.
  - Execução do script de importação idempotente migrando páginas, posts, categorias e metadados SEO para o Supabase.
- **Fase 4 (Frontend Público):**
  - Implementação do Header responsivo, Footer institucional, Botão flutuante de WhatsApp e Banner de Cookies LGPD.
  - Implementação das páginas: Home, Quem Somos, Áreas de Atuação (listagem e dinâmica), Artigos e Publicações, Leitura de Post Individual, Contato, Central de Proteção de Dados, Questionário de Conformidade, Código de Conduta e Canal de Denúncias.
  - Bateria de testes de rotas locais aprovada (12/12 rotas com 200 OK e títulos exatos).

## [0.1.0] - 2026-10-22
### Adicionado
- Inicialização do repositório Git e conexão com a origem remota.
- Configuração do `.gitignore` seguro e `.env.example`.
- Criação da pasta de documentação `docs/` com os 13 arquivos obrigatórios de especificação, arquitetura, segurança e conformidade LGPD.
- Criação e estruturação de `docs/PLANO.md` para aprovação antes do início da Fase 1.
