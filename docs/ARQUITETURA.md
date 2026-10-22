# Arquitetura do Sistema — Mascârello Haus

## 🏗️ Visão Geral da Arquitetura

O projeto adota uma arquitetura Jamstack moderna e desacoplada:

```
[ Usuário Final / Browser ]
           │
           ▼
[ Vercel CDN / Edge Network ] ── (Páginas Pré-renderizadas SSG + Assets Otimizados)
           │
           ├── Requisições Públicas de Leitura ─────────► [ Supabase PostgreSQL (via RLS) ]
           │
           ├── Submissão de Formulários / LGPD / Auth ──► [ Supabase Edge Functions / Auth ]
           │                                                        │
           │                                                        ├── [ Supabase Storage ]
           │                                                        └── [ Notificações Resend/SMTP ]
           │
[ Painel Administrativo /admin ] ── (Supabase Auth com MFA) ───► [ Supabase PostgreSQL (RBAC / RLS) ]
```

---

## 📐 Decisões de Arquitetura (ADRs)

### ADR 001: Adoção de Vite + React + TypeScript com SSG
- **Contexto:** Necessidade de alta fidelidade visual ao Elementor com desempenho superior e indexação impecável para buscadores (SEO).
- **Decisão:** Utilizar pré-renderização estática (SSG) das páginas públicas para garantir metatags completas e carregamento instantâneo.
- **Consequências:** Melhor Core Web Vitals, menor custo operacional e indexação garantida no Google.

### ADR 002: Supabase como Backend Integrado
- **Contexto:** Necessidade de persistência relacional robusta, autenticação segura com MFA, armazenamento de arquivos e proteção de dados LGPD.
- **Decisão:** Uso do Supabase com Row Level Security (RLS) mandatório em 100% das tabelas.
- **Consequências:** Regras de acesso aplicadas na camada do banco, sem risco de bypass na camada de frontend.

### ADR 003: Submissão de Formulários via Edge Functions
- **Contexto:** Prevenção de spam, validação de captcha, rate limit e envio de dados sem expor chaves de serviço.
- **Decisão:** Nenhum formulário público realiza `INSERT` direto no banco via anon key; todas as submissões passam por Edge Function com captcha e validação Zod.
- **Consequências:** Superfície de ataque drasticamente reduzida e proteção de dados pessoais em conformidade com a LGPD.
