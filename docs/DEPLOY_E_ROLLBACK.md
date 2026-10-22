# Procedimento de Deploy e Rollback — Mascârello Haus

---

## 🚀 Processo de Deploy

### 1. Homologação (Preview)
- Cada push na branch `migracao-vite` gera automaticamente uma URL de Preview na Vercel.
- O link de preview é compartilhado com o cliente para validação visual e testes de navegação.

### 2. Promoção para Produção
- Exige **aprovação formal e explícita** do cliente.
- Merging da branch `migracao-vite` para `main`.
- Verificação de variáveis de ambiente de produção na Vercel e Supabase.

### 3. Apontamento de DNS
- O cliente/administrador de DNS recebe a instrução para apontar os registros CNAME ou A para a Vercel.
- **Nenhum registro DNS é alterado de forma automatizada.**

---

## 🔄 Plano de Rollback

Caso ocorra qualquer imprevisto ou inconsistência grave após o chaveamento de produção:
1. Reverter os registros de DNS no provedor (Cloudflare/Registro.br) para o endereço IP do servidor WordPress original.
2. Como a regra inegociável estabelece manter o WordPress original intacto e inalterado durante todo o processo, a restauração do serviço legado é imediata (tempo de propagação de TTL).
