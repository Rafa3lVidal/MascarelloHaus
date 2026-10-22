# Plano de Execução — Migração Mascârello Haus

> **Status Geral:** Em Planejamento / Fase 0  
> **Data:** 22/10/2026  
> **Responsável:** Rafael Vidal / ApexCode  

---

## 🎯 Objetivo Geral

Migrar o site atual [https://mascarellohaus.adv.br/](https://mascarellohaus.adv.br/) da plataforma WordPress/Elementor para uma arquitetura moderna baseada em **Vite + React + TypeScript + Supabase + Vercel**, garantindo:
1. **Fidelidade visual e funcional 1:1** em 4 resoluções de tela (375px, 768px, 1280px e 1920px).
2. **Manutenção integral das URLs** e SEO técnico (incluindo redirecionamentos 301 de caminhos legados como `/novosite/*`).
3. **Gerenciamento dinâmico** de todo o conteúdo público via Painel Administrativo (`/admin`) protegido por MFA.
4. **Conformidade irrestrita com a LGPD** e controles de segurança avançados (OWASP, RLS 100%, CSP estrita).

---

## 🧭 Fases do Projeto

### Fase 0: Preparação do Ambiente, Git e Ferramentas
- [x] Inicialização do repositório Git local e conexão com o remoto `https://github.com/Rafa3lVidal/MascarelloHaus.git`.
- [x] Configuração de `.gitignore` restritivo e template de segredos `.env.example`.
- [x] Estruturação da pasta `docs/` e de todos os 13 arquivos de documentação técnica e de conformidade.
- [ ] Criação e alternância para a branch de trabalho `migracao-vite`.
- [ ] Obtenção e validação das credenciais pendentes da Seção 0 (Vercel, Supabase, Captcha e E-mail Transacional).
- [ ] Registro das ferramentas e MCPs em `docs/SKILLS_E_FERRAMENTAS.md`.
- [ ] Apresentação deste `docs/PLANO.md` e obtenção do "ok" formal do usuário.

---

### Fase 1: Inventário Completo e Snapshot do Site Atual
- [ ] **Mapeamento Triplo de Conteúdo:**
  1. Crawl automatizado a partir da raiz, varrendo todos os links internos, `robots.txt` e sitemaps (`/sitemap.xml`, `/sitemap_index.xml`, `/wp-sitemap.xml`).
  2. Extração sistemática via API REST pública do WordPress (`/wp-json/wp/v2/pages`, `/posts`, `/categories`, `/tags`, `/media`, `/users`).
  3. Integração com exportação WXR (`.xml`) ou backup caso disponibilizado.
- [ ] **Armazenamento de Snapshots em `migration/snapshot/`:**
  - HTML renderizado e CSS computado do Elementor de cada página.
  - Baseline de capturas de tela de página inteira em 4 viewports: **375px, 768px, 1280px e 1920px**.
  - Download das mídias originais (imagens, SVGs, ícones, logos, PDFs/cartilhas) com resolução intacta e atributos alt text.
  - Catálogo de fontes e ícones (Google Fonts, Font Awesome, ícones do Elementor).
- [ ] **Mapeamento de Regras de Negócio e Componentes Especiais:**
  - Formulário "Fale Conosco" (campos, máscaras, validações, mensagens).
  - Formulário da Central de Proteção de Dados (exercício de direitos do titular LGPD, protocolo, upload de anexos).
  - Questionário de Conformidade LGPD (quiz): perguntas, pesos, lógica condicional de resultado e chamadas de ação (CTAs).
  - Banner de Cookies (granularidade de consentimento e categorias).
  - Scripts analíticos e de terceiros (Google Analytics, GTM, Pixel, WhatsApp).
  - Metadados de SEO por página (title, description, canonical, Open Graph, Twitter Cards, Schema.org/JSON-LD).
- [ ] Apresentação do resumo quantitativo em `docs/INVENTARIO.md` para validação.

---

### Fase 2: Arquitetura e Estrutura do Projeto
- [ ] Inicialização da aplicação Vite + React + TypeScript com ESLint, Prettier e TypeScript estrito.
- [ ] Configuração de roteamento compatível com SSG / pré-renderização para preservação de SEO.
- [ ] Configuração do sistema de estilização (preservando o CSS do Elementor/tema original sem bibliotecas que alterem a identidade visual).
- [ ] Configuração da camada de integração do Supabase (`@supabase/supabase-js`).
- [ ] Registro formal dos ADRs (Architectural Decision Records) em `docs/ARQUITETURA.md`.

---

### Fase 3: Modelagem e Banco de Dados (Supabase)
- [ ] Criação de migrações versionadas em `supabase/migrations/`:
  - `profiles` (usuários com papéis `admin`, `editor`, `dpo`).
  - `pages` e blocos de conteúdo estruturado.
  - `posts`, `categories`, `tags`, `post_tags` (blog e publicações jurídicas).
  - `media` (catálogo e metadados de arquivos no Supabase Storage).
  - `practice_areas` (áreas de atuação).
  - `team_members` (advogados e equipe).
  - `testimonials` (depoimentos e avaliações).
  - `legal_documents` e `legal_document_versions` (termos, políticas e código de conduta versionados).
  - `quizzes`, `quiz_questions`, `quiz_options`, `quiz_results_rules`.
  - `contact_messages` (mensagens enviadas no Fale Conosco).
  - `data_subject_requests` (protocolos e histórico de solicitações LGPD).
  - `consent_records` (registros de consentimento com prova de aceite).
  - `site_settings` (menus, rodapé, dados de contato, scripts autorizados).
  - `redirects` (tabela de redirecionamentos 301).
  - `audit_log` (trilha de auditoria imutável).
- [ ] Configuração de políticas de Row Level Security (RLS) em 100% das tabelas.
- [ ] Configuração de Buckets no Storage:
  - `public-media`: acesso público de leitura para imagens e documentos institucionais.
  - `private-attachments`: restrito e seguro para documentos enviados por titulares de dados.
- [ ] Desenvolvimento de Edge Functions para submissão segura de formulários (com Turnstile/hCaptcha, rate limit e notificação por e-mail).
- [ ] Script de importação idempotente de dados (`migration/import/`).
- [ ] Documentação completa do modelo em `docs/BANCO_DE_DADOS.md`.

---

### Fase 4: Frontend Público (Paridade 1:1)
- [ ] Implementação da casca global: Header, Navegação Desktop, Menu Hambúrguer Mobile, Rodapé e Botão flutuante do WhatsApp.
- [ ] Implementação fiel da Home (`/`):
  - Slider principal com mesma tipografia, velocidade e transições.
  - Seções institucionais ("Sobre", "Quem somos", "Áreas de atuação", "Propósito, Visão e Valores").
  - Assessoria empresarial e depoimentos.
- [ ] Implementação das páginas internas:
  - `/quem-somos/`
  - `/areas-de-atuacao/` (listagem e detalhes por especialidade)
  - `/artigos-e-publicacoes/` (listagem, filtros por categoria/tag e página individual de post)
  - `/contato/`
  - `/questionario-de-conformidade/` (fluxo interativo do quiz)
  - `/central-de-protecao-de-dados/` e subpáginas (política de privacidade, política de cookies, termos de uso, formulário LGPD)
  - `/codigo-de-conduta/`
- [ ] Implementação do Banner de Cookies LGPD com bloqueio proativo de scripts não consentidos e registro no Supabase.
- [ ] Otimização de imagens (geração de WebP/AVIF sem perda de qualidade, tags `picture` e `loading="lazy"`).
- [ ] Testes de conformidade e contraste de acessibilidade (axe-core).

---

### Fase 5: Painel Administrativo (`/admin`)
- [ ] Autenticação com Supabase Auth e exigência obrigatória de MFA (TOTP).
- [ ] Bloqueio de cadastros abertos (acesso estritamente sob convite de administrador).
- [ ] Controle granular de permissões baseado em papéis (RBAC): `admin`, `editor`, `dpo`.
- [ ] Módulos administrativos:
  - Gestão de Páginas e Seções.
  - Gestão de Artigos e Publicações (com editor Rich Text sanitizado via DOMPurify).
  - Biblioteca de Mídias e upload direto para o Supabase Storage.
  - Gerenciador do Questionário de Conformidade LGPD e relatórios de preenchimento.
  - Central de Documentos Legais com controle de versões e vigência.
  - Gestão de Requisições do Titular (LGPD) com controle de prazos legais, respostas e protocolo.
  - Caixa de entrada de Mensagens de Contato.
  - Gerenciamento de Equipe, Depoimentos e Configurações Globais.
  - Visualizador de Logs de Auditoria (`audit_log`).
- [ ] Redação do manual de operação para usuários em `docs/PAINEL_ADMIN.md`.

---

### Fase 6: Testes Automatizados, Paridade Visual e Qualidade
- [ ] Testes de regressão visual automatizados com Playwright + pixelmatch contra o baseline da Fase 1 (meta: divergência ≤ 1%).
- [ ] Teste de integridade de conteúdo (diff textual exato de 100% dos textos e artigos).
- [ ] Teste de integridade de links internos e externos (zero links quebrados / 404).
- [ ] Validação dos redirecionamentos 301 (URLs legadas `/novosite/*` apontando com sucesso para os destinos canônicos).
- [ ] Testes E2E dos fluxos: envio de contato, solicitação LGPD, quiz, login administrativo com MFA e edição de conteúdo.
- [ ] Teste de segurança de RLS (validação de que usuários sem privilégio não acessam dados sensíveis).
- [ ] Auditoria de performance e SEO via Lighthouse.
- [ ] Consolidação dos resultados em `docs/TESTES.md` e eventuais particularidades em `docs/DIVERGENCIAS.md`.

---

### Fase 7: Implantação e Publicação (Deploy)
- [ ] Configuração do projeto na Vercel conectado à branch `migracao-vite` para preview builds automáticos.
- [ ] Configuração de headers de segurança via `vercel.json` (CSP estrita, HSTS, X-Content-Type-Options, X-Frame-Options).
- [ ] Configuração de Deploy Hook para acionar rebuild da Vercel sempre que conteúdo for publicado no painel.
- [ ] Apresentação da versão de homologação (Preview Vercel) para validação formal do cliente.
- [ ] Guia de chaveamento de DNS e plano de rollback detalhados em `docs/DEPLOY_E_ROLLBACK.md`.
- [ ] Promoção para produção após aprovação expressa.
