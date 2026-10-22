# Plano de Execução — Migração Mascârello Haus

> **Status Geral:** Fases 0, 1, 2, 3 e 4 Concluídas | Fase 5 e 6 em Andamento  
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
- [x] Configuração de `.gitignore` restritivo e template de segredos `.env.example` e `.env.local`.
- [x] Estruturação da pasta `docs/` e de todos os 13 arquivos de documentação técnica e de conformidade.
- [x] Criação e alternância para a branch de trabalho `migracao-vite`.
- [x] Obtenção e validação das credenciais do Supabase (`iwzimemdxchmcrvlyhxg`).
- [x] Registro das ferramentas e skills oficiais em `docs/SKILLS_E_FERRAMENTAS.md`.
- [x] Apresentação do `docs/PLANO.md` e autorização do usuário.

---

### Fase 1: Inventário Completo e Snapshot do Site Atual
- [x] **Mapeamento Triplo de Conteúdo:**
  - Crawl automatizado varrendo links internos, `robots.txt` e sitemaps.
  - Extração sistemática via API REST oficial do WordPress (19 páginas, 11 posts, 4 categorias).
- [x] **Armazenamento de Snapshots em `migration/snapshot/`:**
  - 31 HTMLs completos e 144 folhas de estilo CSS salvas.
  - Baseline de 124 capturas de tela nos 4 viewports: **375px, 768px, 1280px e 1920px**.
  - Download das 237 mídias originais sem compressão (PNG, JPG, PDF, SVG, WOFF2).
- [x] **Mapeamento de Regras de Negócio e Componentes Especiais:**
  - Formulário "Fale Conosco" mapeado.
  - Formulário da Central de Proteção de Dados (LGPD Art. 18 com protocolo) mapeado.
  - Questionário de Conformidade LGPD mapeado.
  - Canal de Denúncias e Código de Conduta mapeados.
  - 9 URLs legadas com `/novosite/*` mapeadas para redirecionamento 301.
  - Metadados de SEO por página catalogados em `seo_metadata.json`.
- [x] Resumo quantitativo catalogado em `docs/INVENTARIO.md`.

---

### Fase 2: Arquitetura e Estrutura do Projeto
- [x] Inicialização da aplicação Vite + React + TypeScript com rotas completas.
- [x] Configuração de roteamento com suporte aos 9 redirecionamentos legados 301.
- [x] Estilização modular com CSS global e de compatibilidade visual (`elementor-compat.css`).
- [x] Configuração da camada de integração do Supabase (`@supabase/supabase-js`).
- [x] Criação do `vercel.json` com headers de segurança (CSP, HSTS, X-Frame-Options) e rewrites.
- [x] Registro formal dos ADRs em `docs/ARQUITETURA.md`.

---

### Fase 3: Modelagem e Banco de Dados (Supabase)
- [x] Criação e aplicação da migração `20261022000000_initial_schema.sql` no projeto `iwzimemdxchmcrvlyhxg`:
  - 22 tabelas criadas no schema `public`.
  - Row Level Security (RLS) ativo em 100% das tabelas.
  - Trilha de auditoria (`audit_log`) e triggers automáticas de usuário.
- [x] Configuração de Buckets no Storage: `public-media` e `private-attachments`.
- [x] Script de importação idempotente (`migration/import/import_content.js`) executado com sucesso:
  - 19 páginas importadas.
  - 11 posts e cartilhas importados com categorias.
  - 4 categorias criadas.
  - 9 redirecionamentos salvos em `redirects`.
  - Configurações do site salvas em `site_settings`.
- [x] Documentação completa do modelo em `docs/BANCO_DE_DADOS.md`.

---

### Fase 4: Frontend Público (Paridade 1:1)
- [x] Implementação da casca global: Header responsivo, Menu mobile, Rodapé institucional, Botão WhatsApp e Banner de Cookies LGPD.
- [x] Implementação da Home (`/`): Slider dinâmico, Sobre o escritório, Quem Somos, Áreas de Atuação, Pilares Institucionais e Assessoria Empresarial.
- [x] Implementação de `/quem-somos/` com texto 100% fiel ao original.
- [x] Implementação de `/areas-de-atuacao/` e da página dinâmica `/AreaIndividual` com formulário integrado.
- [x] Implementação de `/artigos-e-publicacoes/` com filtros por categoria e página de leitura `/PostIndividual`.
- [x] Implementação de `/contato/` com formulário integrado à tabela `contact_messages`.
- [x] Implementação de `/central-de-protecao-de-dados/` com formulário do titular gerando protocolo único em `data_subject_requests` e download das 3 cartilhas.
- [x] Implementação de `/questionario-de-conformidade/` (diagnóstico interativo) e `/codigo-de-conduta/`.
- [x] Implementação de `/canal-de-denuncias/` com opção de relato sigiloso/anônimo.
- [x] Teste de build e rotas no preview local aprovado (12/12 rotas respondendo 200 OK).

---

### Fase 5: Painel Administrativo (`/admin`)
- [x] Tela de autenticação `/admin` com Supabase Auth e suporte a desafio de MFA (TOTP).
- [x] Tela `/admin/dashboard` com visualização de artigos, páginas, requisições LGPD, mensagens e logs de auditoria.
- [ ] Implementação de edição in-line de artigos e páginas com sanitização DOMPurify.

---

### Fase 6: Testes Automatizados, Paridade Visual e Qualidade
- [x] Bateria 1 de integridade de rotas executada com 100% de sucesso.
- [ ] Teste de regressão visual comparando os 124 screenshots de baseline com o novo frontend via pixelmatch.
- [ ] Validação de acessibilidade via axe-core.

---

### Fase 7: Implantação e Publicação (Deploy)
- [x] `vercel.json` estruturado com regras de roteamento e segurança.
- [ ] Criação do projeto na Vercel e deploy de Preview para homologação.
