# Mascârello Haus — Migração WordPress para Vite + Supabase + Vercel

Projeto de migração e modernização do site institucional da **Mascârello Haus Advocacia** (`https://mascarellohaus.adv.br/`).

---

## 📌 Visão Geral

- **Objetivo:** Recriação 1:1 (fidelidade visual e de conteúdo total) a partir da base WordPress/Elementor para uma arquitetura moderna com **Vite + React + TypeScript**, **Supabase** (PostgreSQL, Auth com MFA, Storage, Edge Functions) e hospedagem com CI/CD na **Vercel**.
- **Painel Administrativo:** Interface restrita (`/admin`) para gestão dinâmica de páginas, artigos, documentos de conformidade LGPD, requisições de titulares, equipe, áreas de atuação e configurações gerais.
- **Desenvolvimento e Distribuição:** Desenvolvido por **ApexCode** (Rafael Vidal - [www.apexcode.dev.br](https://www.apexcode.dev.br/)).

---

## 🗂️ Estrutura de Documentação

Consulte os arquivos na pasta `docs/`:

- [`PLANO.md`](./PLANO.md) — Cronograma detalhado de execução por fases e checklist.
- [`INVENTARIO.md`](./INVENTARIO.md) — Mapeamento completo de URLs, páginas, artigos, mídias e formulários.
- [`ARQUITETURA.md`](./ARQUITETURA.md) — Decisões de arquitetura (ADRs), fluxo de dados e infraestrutura.
- [`BANCO_DE_DADOS.md`](./BANCO_DE_DADOS.md) — Modelagem relacional, RLS e migrações.
- [`PAINEL_ADMIN.md`](./PAINEL_ADMIN.md) — Guia de uso para administração de conteúdo.
- [`SEGURANCA.md`](./SEGURANCA.md) — Controles OWASP, CSP, RLS e auditoria.
- [`LGPD.md`](./LGPD.md) — Tratamento de dados pessoais, base legal e gestão do canal do Encarregado (DPO).
- [`SKILLS_E_FERRAMENTAS.md`](./SKILLS_E_FERRAMENTAS.md) — Inventário de dependências e ferramentas instaladas.
- [`TESTES.md`](./TESTES.md) — Testes de paridade visual (Playwright/pixelmatch), E2E e Lighthouse.
- [`DIVERGENCIAS.md`](./DIVERGENCIAS.md) — Registro transparente de eventuais adaptações técnicas.
- [`DEPLOY_E_ROLLBACK.md`](./DEPLOY_E_ROLLBACK.md) — Procedimentos de publicação e plano de contingência.
- [`CHANGELOG.md`](./CHANGELOG.md) — Histórico de mudanças por versão/fase.

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js (versão 20 LTS ou superior)
- npm ou pnpm
- Supabase CLI (opcional para desenvolvimento local do banco)

### Instalação
```bash
# Clonar repositório e alternar para a branch de trabalho
git clone https://github.com/Rafa3lVidal/MascarelloHaus.git
cd MascarelloHaus
git checkout migracao-vite

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env.local

# Rodar servidor de desenvolvimento
npm run dev
```
