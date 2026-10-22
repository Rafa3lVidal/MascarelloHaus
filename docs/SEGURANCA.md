# Controles de Segurança e OWASP — Mascârello Haus

Este documento especifica os controles técnicos de segurança aplicados no projeto com base no OWASP Top 10 e OWASP ASVS Nível 2.

---

## 🛡️ Controles Aplicados

### 1. Prevenção de Injeção e Integridade do Banco
- Uso de ORM / query builder parametrizado via Supabase Client e PostgreSQL.
- Row Level Security (RLS) mandatório com políticas granulares baseadas em JWT e perfis de autenticação.

### 2. Autenticação e Gestão de Sessões
- Supabase Auth com hash Argon2id para senhas.
- Exigência mandatória de MFA (TOTP) para acesso ao painel administrativo.
- Sessões expiram automaticamente e tokens são renovados via refresh token seguro.

### 3. Prevenção de XSS e Sanitização
- Todo conteúdo HTML formatado vindo do editor Rich Text é estritamente sanitizado com DOMPurify antes da gravação e renderização.
- React realiza escape nativo em interpolações JSX.

### 4. Headers HTTP de Segurança (`vercel.json`)
- `Content-Security-Policy`: Política restritiva definindo origens autorizadas para scripts, estilos, conexões e fontes.
- `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`.
- `X-Content-Type-Options: nosniff`.
- `X-Frame-Options: DENY` e CSP `frame-ancestors 'none'`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy`: Bloqueio de microfone, câmera e geolocalização desnecessárias.

### 5. Proteção de Chaves e Segredos
- A chave `service_role` nunca é embutida no frontend nem versionada no repositório.
- Apenas a `anon key` pública é utilizada no cliente sob proteção de RLS.
