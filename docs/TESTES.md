# Relatório de Testes e Paridade Visual — Mascârello Haus

> Registro atualizado das baterias de testes automatizados e integridade de rotas.

---

## 🎯 Metas de Aceitação
- **Paridade Visual (pixelmatch):** Divergência média ≤ 1% por página nos viewports 375px, 768px, 1280px e 1920px.
- **Paridade de Conteúdo:** Diferença textual = 0 (100% idêntico ao WordPress).
- **Integridade de Links:** 0 erros 404; todos os links internos e legados funcionando com 200 OK ou 301 Redirect.
- **Lighthouse:** Performance ≥ 90, Acessibilidade ≥ 95, Boas Práticas ≥ 95, SEO = 100.

---

## 📊 Bateria 1: Verificação Automatizada de Rotas (100% Aprovado)

| Rota / URL Testada | Status Code | URL Final Resolvida | Título da Página Verificado | Resultado |
|---|---|---|---|---|
| `/` | 200 OK | `http://localhost:4173/` | Mascârello Haus Advocacia \| Para um novo mundo, novas estratégias | ✅ Aprovado |
| `/quem-somos/` | 200 OK | `http://localhost:4173/quem-somos/` | Quem Somos \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/areas-de-atuacao/` | 200 OK | `http://localhost:4173/areas-de-atuacao/` | Áreas de Atuação \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/direito-civil-e-empresarial/`| 200 OK | `http://localhost:4173/direito-civil-e-empresarial/` | Mascârello Haus Advocacia | ✅ Aprovado |
| `/artigos-e-publicacoes/` | 200 OK | `http://localhost:4173/artigos-e-publicacoes/` | Artigos e Publicações \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/contato/` | 200 OK | `http://localhost:4173/contato/` | Contato \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/central-de-protecao-de-dados/`| 200 OK | `http://localhost:4173/central-de-protecao-de-dados/`| Central de Proteção de Dados (LGPD) \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/questionario-de-conformidade/`| 200 OK | `http://localhost:4173/questionario-de-conformidade/`| Questionário de Conformidade LGPD \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/codigo-de-conduta/` | 200 OK | `http://localhost:4173/codigo-de-conduta/` | Código de Conduta \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/canal-de-denuncias/` | 200 OK | `http://localhost:4173/canal-de-denuncias/` | Canal de Denúncias \| Mascârello Haus Advocacia | ✅ Aprovado |
| `/novosite/artigos-e-publicacoes/`| 200 OK | Redirecionamento 301 | Mascârello Haus Advocacia | ✅ Aprovado |
| `/admin` | 200 OK | `http://localhost:4173/admin` | Painel Administrativo \| Mascârello Haus Advocacia | ✅ Aprovado |

---

## 📸 Baseline de Screenshots (124 capturas geradas)
- Localização: `migration/snapshot/screenshots/`
- Cobertura: 31 páginas x 4 viewports (375px, 768px, 1280px e 1920px)
- Taxa de sucesso: 100% (124/124 capturas íntegras arquivadas como referência).
