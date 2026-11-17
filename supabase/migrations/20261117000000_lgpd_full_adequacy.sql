-- ==============================================================================
-- MIGRAÇÃO: Adequação Integral LGPD — Mascârello Haus Advocacia
-- Data: 2026-11-17
-- Itens cobertos:
--   1. Bucket `form-attachments` estritamente privado + RLS restrita + backfill `url` -> `path`
--   2. Publicação do Aviso de Privacidade v2.3 (17/11/2026) e Termos de Uso v1.1 (17/11/2026)
--   3. Sincronização de `lgpd_cookies` (fonte única sem GA/Marketing) e `lgpd_governance`
--   4. Função auxiliar de expurgo por prazo de retenção (Art. 16 LGPD)
-- ==============================================================================

-- 1. Restringir `public.is_staff()` exclusivamente a usuários com perfil staff em `public.profiles`
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'dpo', 'editor')
  );
$$;

-- 2. Tornar o bucket `form-attachments` privado e remover MIME de ZIP
UPDATE storage.buckets
SET
  public = false,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/ogg',
    'video/mp4',
    'audio/mp4',
    'video/webm'
  ]
WHERE id = 'form-attachments';

-- 3. Políticas RLS em `storage.objects` para `form-attachments`:
--    - anon / authenticated: APENAS INSERT (sem SELECT, UPDATE ou DELETE)
--    - staff autenticado (admin/dpo/editor): SELECT e DELETE
DROP POLICY IF EXISTS "Allow viewing form attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow public form file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Block dangerous file extensions on form-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view form attachments" ON storage.objects;
DROP POLICY IF EXISTS "Staff can delete form attachments" ON storage.objects;

CREATE POLICY "Allow public form file uploads"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'form-attachments'
    AND NOT (
      lower(name) ~ '\.(exe|dll|bat|cmd|sh|bash|ps1|psm1|vbs|vbe|js|jse|jsx|ts|tsx|mjs|cjs|wsf|wsh|msc|php|phtml|php3|php4|php5|phps|asp|aspx|jsp|py|pyc|rb|pl|cgi|jar|war|msi|msp|scr|pif|com|hta|cpl|reg|lnk|inf|scf|url|iso|img|vhd|vhdx|dmg|pkg|deb|rpm|apk|docm|dotm|xlsm|xltm|xlam|pptm|potm|ppam|sldm|html|htm|xhtml|svg|xml|xsl|xslt|swf|wasm|zip)$'
    )
  );

CREATE POLICY "Staff can view form attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'form-attachments' AND public.is_staff());

CREATE POLICY "Staff can delete form attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'form-attachments' AND public.is_staff());

-- 4. Backfill dos registros antigos: extrair `path` da URL pública e remover o campo `url`
CREATE OR REPLACE FUNCTION pg_temp.strip_attachment_urls(arr JSONB)
RETURNS JSONB
LANGUAGE sql
AS $$
  SELECT COALESCE(
    jsonb_agg(
      (
        CASE
          WHEN (elem->>'path') IS NULL OR (elem->>'path') = '' THEN
            CASE
              WHEN position('/form-attachments/' in COALESCE(elem->>'url', '')) > 0 THEN
                jsonb_set(
                  elem,
                  '{path}',
                  to_jsonb(
                    split_part(
                      split_part(elem->>'url', '/form-attachments/', 2),
                      '?',
                      1
                    )
                  )
                )
              ELSE elem
            END
          ELSE elem
        END
      ) - 'url'
    ),
    '[]'::jsonb
  )
  FROM jsonb_array_elements(COALESCE(arr, '[]'::jsonb)) AS elem;
$$;

UPDATE public.contact_messages
SET attachments_json = pg_temp.strip_attachment_urls(attachments_json)
WHERE attachments_json IS NOT NULL
  AND attachments_json::text LIKE '%"url"%';

UPDATE public.data_subject_requests
SET attachments_json = pg_temp.strip_attachment_urls(attachments_json)
WHERE attachments_json IS NOT NULL
  AND attachments_json::text LIKE '%"url"%';

UPDATE public.data_subject_requests
SET attachment_storage_path = split_part(split_part(attachment_storage_path, '/form-attachments/', 2), '?', 1)
WHERE attachment_storage_path LIKE '%/form-attachments/%';

UPDATE public.whistleblower_reports
SET attachments_json = pg_temp.strip_attachment_urls(attachments_json)
WHERE attachments_json IS NOT NULL
  AND attachments_json::text LIKE '%"url"%';

UPDATE public.quiz_submissions
SET attachments_json = pg_temp.strip_attachment_urls(attachments_json)
WHERE attachments_json IS NOT NULL
  AND attachments_json::text LIKE '%"url"%';

-- 5. Atualizar `site_settings` para que Aviso v2.3 (17/11/2026) e Termos v1.1 (17/11/2026)
--    sejam a versão publicada no banco (sobrepondo eventuais rascunhos v2.1/v2.2 antigos).
DO $$
DECLARE
  v_privacy_html TEXT := $priv$
<h3>1. Compromisso com a sua Privacidade e Identificação do Controlador</h3>
<p>A <strong>Mascârello Haus Sociedade de Advogados</strong> (Mascârello Haus Advocacia), inscrita no CNPJ sob o nº <strong>38.282.320/0001-54</strong>, com sede na Esquina com a Rua Coronel Alberto Schmidt, n.º 10, Edifício Laura, 1.º Andar, Sala 5, Rua Brasil - Centro, Videira - SC, CEP 89560-198, atua como <strong>Controladora de Dados Pessoais</strong>. Valorizamos a confiança de nossos clientes, parceiros, colaboradores e visitantes, estruturando nossas rotinas em conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (Lei Federal nº 13.709/2018 — LGPD)</strong> e com as resoluções da <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>.</p>
<p><strong>Canais de contato do Controlador:</strong> E-mail geral <a href="mailto:contato@mascarellohaus.adv.br">contato@mascarellohaus.adv.br</a> | Privacidade <a href="mailto:privacidade@mascarellohaus.adv.br">privacidade@mascarellohaus.adv.br</a> | WhatsApp +55 (49) 98822-0982.</p>

<h3>2. Quadro de Transparência por Canal de Coleta (Art. 9º da LGPD)</h3>
<p>A tabela abaixo detalha os dados coletados em cada canal do portal, suas finalidades, bases legais, prazos de retenção e eventual compartilhamento:</p>
<table>
  <thead>
    <tr>
      <th>Canal</th>
      <th>Dados coletados</th>
      <th>Finalidade</th>
      <th>Base legal</th>
      <th>Retenção</th>
      <th>Compartilhamento</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Formulário de Contato</strong></td>
      <td>Nome, e-mail ou telefone, assunto e mensagem (além de eventuais anexos voluntários).</td>
      <td>Responder à solicitação de atendimento e conduzir procedimentos preliminares relacionados a eventual contratação de serviços jurídicos.</td>
      <td><strong>Art. 7º, V</strong> (procedimentos preliminares relacionados a contrato).</td>
      <td>2 anos (caso não evolua para contratação de serviços)</td>
      <td>Infraestrutura tecnológica (Supabase e Vercel) e equipe interna de atendimento.</td>
    </tr>
    <tr>
      <td><strong>Central do Titular (LGPD)</strong></td>
      <td>Nome completo, e-mail ou telefone, tipo de requisição, descrição e documento comprobatório de identidade/representação.</td>
      <td>Receber, validar identidade, processar e responder às requisições de direitos dos titulares e emitir protocolo de acompanhamento.</td>
      <td><strong>Art. 7º, II</strong> (cumprimento de obrigação legal — Art. 18 da LGPD).</td>
      <td>5 anos (para comprovação de atendimento legal — Art. 18 e Art. 37 da LGPD)</td>
      <td>Acesso restrito à Encarregada (DPO), equipe de governança e infraestrutura de banco de dados (Supabase).</td>
    </tr>
    <tr>
      <td><strong>Canal de Denúncias</strong></td>
      <td>Descrição do relato, local/canal da ocorrência, data aproximada, envolvidos e evidências anexadas (identificação opcional; admite relato anônimo).</td>
      <td>Apurar irregularidades, violações éticas ou ilícitos em programa de integridade e cumprir deveres legais/regulatórios.</td>
      <td><strong>Art. 7º, II e VI</strong>; e, quando houver dados pessoais sensíveis no relato, <strong>Art. 11, II, "a" e "d"</strong>.</td>
      <td>[PREENCHER — Prazo de retenção do Canal de Denúncias após conclusão da apuração]</td>
      <td>Comitê de Ética/Compliance, Encarregada (DPO) e, quando estritamente necessário, autoridades competentes ou assessoria jurídica externa.</td>
    </tr>
    <tr>
      <td><strong>Questionário de Conformidade de Fornecedores</strong></td>
      <td>Razão social, CNPJ, endereço, responsável pelo preenchimento, e-mail, telefone e respostas/evidências de governança LGPD.</td>
      <td>Avaliar o nível de maturidade em proteção de dados de fornecedores e parceiros para diligência pré-contratual e gestão de risco.</td>
      <td><strong>Art. 7º, V e IX</strong> (procedimentos preliminares a contrato e legítimo interesse).</td>
      <td>2 anos (ou durante a vigência de eventual relação contratual)</td>
      <td>Equipe jurídica/compliance interna e infraestrutura (Supabase).</td>
    </tr>
    <tr>
      <td><strong>WhatsApp e E-mail Institucional</strong></td>
      <td>Nome, número de telefone, endereço de e-mail e conteúdo das mensagens/documentos enviados.</td>
      <td>Atendimento direto, agendamento de reuniões e tratativas preliminares para prestação de serviços advocatícios.</td>
      <td><strong>Art. 7º, V</strong> (procedimentos preliminares a contrato).</td>
      <td>2 anos (caso não evolua para relação contratual)</td>
      <td>Provedor de mensageria/e-mail e equipe de atendimento do escritório.</td>
    </tr>
    <tr>
      <td><strong>Cookies e Armazenamento Local</strong></td>
      <td>Preferências de consentimento, semente anti-bot (<code>mh_sec_seed</code>), controle de envio (<code>mh_rl_*</code>) e, se autorizado, rascunhos locais (<code>mh_form_state_*</code>).</td>
      <td>Segurança contra abuso/spam, manutenção de sessão administrativa e salvamento opcional de rascunhos de formulários.</td>
      <td>Necessários: <strong>Art. 7º, IX</strong> (legítimo interesse). Opcionais (funcionais): <strong>Art. 7º, I</strong> (consentimento).</td>
      <td>Sessão até 12 meses (funcionais até revogação).</td>
      <td>Processamento local no navegador do titular (sem compartilhamento publicitário).</td>
    </tr>
  </tbody>
</table>

<h3>3. Princípios e Bases Legais Complementares (Arts. 6º, 7º, 10 e 11)</h3>
<p>Todo tratamento realizado pelo escritório observa os princípios da finalidade, adequação, necessidade (minimização), livre acesso, qualidade, transparência, segurança, prevenção, não discriminação e responsabilização. Quando utilizamos a base legal de <strong>Legítimo Interesse (Art. 7º, IX e Art. 10)</strong> — como em controles de segurança anti-spam e diligência de integridade —, mantemos <strong>Teste de Balanceamento (LIA — Legitimate Interest Assessment)</strong> formalmente documentado, disponível mediante solicitação ao Encarregado (DPO).</p>

<h3>4. Direitos do Titular, Prazos de Resposta e Petição à ANPD (Arts. 18, 19 e 20)</h3>
<p>Você pode exercer gratuitamente seus direitos através da <strong>Central de Proteção de Dados</strong>:</p>
<ul>
  <li><strong>Confirmação e Acesso (Art. 18, I e II; Art. 19):</strong> Confirmação da existência de tratamento e acesso aos dados em formato simplificado providenciados <strong>imediatamente</strong> (Art. 19, I), ou declaração completa clara em <strong>até 15 dias, contados do requerimento (Art. 19, II)</strong>.</li>
  <li><strong>Correção, Anonimização, Bloqueio ou Eliminação (Art. 18, III, IV e VI):</strong> Retificação de dados incompletos/inexatos e exclusão de dados desnecessários ou tratados com base no consentimento.</li>
  <li><strong>Portabilidade, Compartilhamento e Revogação (Art. 18, V, VII, VIII e IX):</strong> Exportação estruturada, informação sobre entidades públicas/privadas com quem houve compartilhamento e revogação do consentimento a qualquer momento.</li>
  <li><strong>Oposição e Revisão de Decisões Automatizadas (Art. 18, § 2º e Art. 20):</strong> Oposição a tratamentos irregulares e solicitação de revisão humana de critérios automatizados (como o índice do Questionário de Conformidade).</li>
  <li><strong>Direito de Peticionar à ANPD (Art. 18, § 1º):</strong> Caso entenda que o tratamento viola a LGPD ou não tenha ficado satisfeito com a resposta do Controlador, você tem o direito de peticionar diretamente à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong> pelo portal oficial <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">https://www.gov.br/anpd</a>.</li>
</ul>

<h3>5. Faixa Etária e Proteção de Crianças e Adolescentes (Art. 14 da LGPD)</h3>
<p>Este canal é destinado a maiores de 18 anos. O escritório não coleta intencionalmente dados de menores de idade por meio dos formulários do site. Na hipótese estrita de representação jurídica que envolva crianças ou adolescentes, o tratamento ocorre exclusivamente em seu melhor interesse e mediante consentimento específico e em destaque dado por pelo menos um dos pais ou pelo representante legal (Art. 14, § 1º).</p>

<h3>6. Operadores e Transferência Internacional de Dados (Arts. 33 a 36 e Res. CD/ANPD nº 19/2024)</h3>
<p>Não comercializamos dados pessoais. Para operação do portal, contamos com os operadores tecnológicos <strong>Supabase Inc.</strong> (banco de dados e armazenamento privado de anexos), <strong>Vercel Inc.</strong> (hospedagem e mitigação DDoS) e <strong>ApexCode</strong> (desenvolvimento e suporte técnico). A relação completa de operadores, papéis e mecanismos de transferência internacional pode ser consultada na aba <a href="/central-de-protecao-de-dados/?aba=direitos">Direitos, DPO &amp; Operadores</a>. Quando houver processamento em data centers no exterior, aplicam-se os Arts. 33 a 36 da LGPD e a Resolução CD/ANPD nº 19/2024, com Cláusulas-Padrão Contratuais e conexão protegida por encriptação (TLS 1.3 e AES-256).</p>

<h3>7. Segurança da Informação e Comunicação de Incidentes (Arts. 46 a 49 e Res. CD/ANPD nº 15/2024)</h3>
<p>Adotamos controles técnicos de segurança desde a concepção (<em>Privacy by Design</em>): autenticação multifator (2FA), controle de acesso por função (RBAC), anonimização de IP por hash SHA-256, verificação de integridade de anexos, bucket privado com URLs assinadas de curta duração (5 minutos) e trilha de auditoria. Na ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares, a comunicação à ANPD e aos titulares afetados será efetuada no prazo regulamentar de <strong>3 (três) dias úteis</strong>, nos termos da Resolução CD/ANPD nº 15/2024.</p>

<h3>8. Encarregado pelo Tratamento de Dados Pessoais — DPO Titular e Substituto (Art. 41 e Res. CD/ANPD nº 18/2024)</h3>
<p>Para dúvidas, exercício de direitos ou solicitação de informações sobre testes de balanceamento (LIA), contate nossos Encarregados:</p>
<ul>
  <li><strong>Encarregada Titular (DPO):</strong> Mirataira Helena Mascarello Haus (OAB/SC 46.446) — <a href="mailto:dpo@mascarellohaus.adv.br">dpo@mascarellohaus.adv.br</a> | WhatsApp: +55 (49) 98822-0982</li>
  <li><strong>Encarregado Substituto (Ausências/Impedimentos — Res. CD/ANPD nº 18/2024):</strong> [PREENCHER — Nome do Encarregado Substituto] — <a href="mailto:dpo@mascarellohaus.adv.br">dpo@mascarellohaus.adv.br</a> | Tel: [PREENCHER — Telefone do Encarregado Substituto]</li>
</ul>
$priv$;

  v_terms_html TEXT := $terms$
<p><em>O presente termo regula o acesso e condições de uso do site https://www.mascarellohaus.adv.br/, bem como os serviços informativos e canais de conformidade oferecidos por meio da aplicação, estabelecendo os direitos e as obrigações dos usuários. O uso do site implica ciência destes Termos.</em></p>

<h3>1. QUEM SOMOS</h3>
<p>A <strong>Mascârello Haus Sociedade de Advogados</strong> (CNPJ 38.282.320/0001-54) é dedicada a atender às necessidades e riscos jurídicos, com atuação estratégica em Compliance, Proteção de Dados Pessoais (LGPD), Direito Empresarial, Civil, Tributário, Trabalhista e Previdenciário.</p>

<h3>2. TERMOS E DEFINIÇÕES</h3>
<p><strong>Cookies e Armazenamento Local:</strong> Arquivos e chaves gerados no navegador ao acessar o site, classificados entre estritamente necessários (segurança e sessão) e opcionais (armazenamento funcional de rascunhos), sujeitos à escolha granular do titular.</p>
<p><strong>Dados Pessoais:</strong> Qualquer informação relacionada a pessoa natural identificada ou identificável tratada nos termos da Lei nº 13.709/2018.</p>
<p><strong>Usuário:</strong> Todas as pessoas físicas que utilizam ou visitam o site, maiores de 18 (dezoito) anos ou legalmente representadas nos termos do Art. 14 da LGPD.</p>

<h3>3. UTILIZAÇÃO DO SITE E REQUISITO ETÁRIO</h3>
<p>O uso do site implica ciência destes Termos Gerais e do <a href="/central-de-protecao-de-dados/?aba=aviso">Aviso de Privacidade</a>. Este site e seus canais digitais são destinados a maiores de 18 (dezoito) anos. Ao submeter formulários na plataforma, o usuário declara possuir 18 anos completos ou atuar mediante representação legal comprovada. Mantemos histórico público de versões destes Termos e do Aviso de Privacidade para plena transparência (Art. 8º, § 2º da LGPD).</p>

<h3>4. RESPONSABILIDADES DO USUÁRIO E SEGURANÇA CIBERNÉTICA</h3>
<p>O usuário compromete-se a fornecer dados verdadeiros, completos e atualizados em todos os formulários, bem como a anexar documentos legítimos quando atuar como procurador ou representante legal de terceiro (Art. 18, § 3º da LGPD). É expressamente vedado utilizar o site para fins ilícitos, tentar burlar controles de acesso, enviar arquivos maliciosos ou realizar relatos sabidamente falsos de má-fé.</p>

<h3>5. PRIVACIDADE, DIREITOS DO TITULAR E CONSULTA DE PROTOCOLOS</h3>
<p>O tratamento de dados pessoais segue rigorosamente a Lei Federal nº 13.709/2018 (LGPD), assegurando o exercício gratuito e facilitado de todos os direitos previstos nos Arts. 18, 19 e 20 através da Central de Proteção de Dados, incluindo o acompanhamento eletrônico por número de protocolo único.</p>

<h3>6. PROPRIEDADE INTELECTUAL &amp; DIREITOS AUTORAIS</h3>
<p>Todo o conteúdo deste website, marcas, logotipos, textos, artigos jurídicos e cartilhas educativas pertencem com exclusividade à Mascârello Haus Advocacia, sendo permitido o download gratuito das cartilhas para fins educativos e de conscientização interna, vedada a comercialização ou reprodução desautorizada.</p>

<h3>7. DESENVOLVIMENTO TÉCNICO, SUPORTE E LGPD</h3>
<p>A infraestrutura de software deste portal e seu painel de governança LGPD são desenvolvidos e mantidos pela <strong>ApexCode</strong> (<a href="https://www.apexcode.dev.br/" target="_blank" rel="noopener noreferrer">www.apexcode.dev.br</a> | <a href="mailto:contato@apexcode.dev.br">contato@apexcode.dev.br</a> | <a href="https://wa.me/5549999281878" target="_blank" rel="noopener noreferrer">WhatsApp de Suporte Técnico</a>), atuando como operadora tecnológica sob rígidos padrões de segurança da informação.</p>

<h3>8. LEI APLICÁVEL E FORO</h3>
<p>Em eventuais controvérsias decorrentes destes Termos, buscar-se-á a resolução amigável e extrajudicial, inclusive perante o canal da Encarregada de Dados (DPO). Não sendo viável, fica eleito o Foro da Comarca de Videira/SC para dirimir qualquer litígio, ressalvado o foro do domicílio do consumidor, quando aplicável (CDC).</p>
<p><strong>Videira — Santa Catarina | Mascârello Haus Advocacia</strong></p>
$terms$;
BEGIN
  INSERT INTO public.site_settings (key, value_json, updated_at)
  VALUES (
    'legal_documents_config',
    jsonb_build_object(
      'privacyPolicy', jsonb_build_object(
        'title', 'Aviso de Privacidade & Tratamento de Dados',
        'subtitle', 'Transparência & Conformidade Regulatória (Arts. 6º a 49 da LGPD)',
        'version', '2.3',
        'updatedAt', '2026-11-17',
        'customHtml', v_privacy_html
      ),
      'termsOfUse', jsonb_build_object(
        'title', 'Termos de Uso do Site Mascârello Haus',
        'subtitle', 'Termos Gerais, Segurança e Condições de Uso',
        'version', '1.1',
        'updatedAt', '2026-11-17',
        'customHtml', v_terms_html
      ),
      'versionHistory', jsonb_build_array(
        jsonb_build_object(
          'id', 'ver-priv-2.3',
          'docType', 'privacyPolicy',
          'version', '2.3',
          'updatedAt', '2026-11-17',
          'publishedBy', 'Mirataira Helena Mascarello Haus (DPO — OAB/SC 46.446)',
          'changelog', 'Publicação integral do Aviso v2.3: identificação completa do controlador (CNPJ), tabela por canal de coleta (Art. 9º), direito de petição à ANPD (Art. 18, § 1º), LIA documentado, prazos do Art. 19 e atualização de DPO Titular e Substituto.',
          'customHtml', v_privacy_html
        ),
        jsonb_build_object(
          'id', 'ver-priv-2.2',
          'docType', 'privacyPolicy',
          'version', '2.2',
          'updatedAt', '2026-11-16',
          'publishedBy', 'Mirataira Helena Mascarello Haus (DPO)',
          'changelog', 'Adequação às Resoluções CD/ANPD nº 15/2024, nº 18/2024 e nº 19/2024.',
          'customHtml', v_privacy_html
        ),
        jsonb_build_object(
          'id', 'ver-terms-1.1',
          'docType', 'termsOfUse',
          'version', '1.1',
          'updatedAt', '2026-11-17',
          'publishedBy', 'Mirataira Helena Mascarello Haus (DPO — OAB/SC 46.446)',
          'changelog', 'Atualização para "ciência destes Termos", unificação etária (maiores de 18 anos) e ressalva do foro do domicílio do consumidor (CDC).',
          'customHtml', v_terms_html
        )
      )
    ),
    NOW()
  )
  ON CONFLICT (key) DO UPDATE SET
    value_json = EXCLUDED.value_json,
    updated_at = NOW();

  -- Sincronizar também `lgpd_governance` caso já exista registro antigo com email .com.br ou sem OAB
  UPDATE public.site_settings
  SET value_json = value_json
    || jsonb_build_object(
      'dpoName', 'Mirataira Helena Mascarello Haus',
      'dpoEmail', 'dpo@mascarellohaus.adv.br',
      'dpoPhone', '+55 (49) 98822-0982',
      'dpoOab', 'OAB/SC 46.446 — Encarregada Titular',
      'substituteDpoName', '[PREENCHER — Nome do Encarregado Substituto]',
      'substituteDpoEmail', 'dpo@mascarellohaus.adv.br',
      'substituteDpoPhone', '[PREENCHER — Telefone do Encarregado Substituto]'
    ),
    updated_at = NOW()
  WHERE key = 'lgpd_governance';

  -- Sincronizar `lgpd_cookies` removendo _ga, Marketing e __vercel_live_token
  UPDATE public.site_settings
  SET value_json = jsonb_set(
      (value_json - 'marketingTitle' - 'marketingDesc')
      || jsonb_build_object('version', '2.3'),
      '{cookiesTable}',
      jsonb_build_array(
        jsonb_build_object('id', 'ck-consent', 'name', 'lgpd_cookie_consent / lgpd_cookie_preferences', 'provider', 'Mascârello Haus (Próprio)', 'category', 'Necessário', 'purpose', 'Registra a decisão e as preferências de privacidade e cookies do titular no navegador.', 'retention', 'Sessão até 12 meses'),
        jsonb_build_object('id', 'ck-sec-seed', 'name', 'mh_sec_seed', 'provider', 'Mascârello Haus (Próprio)', 'category', 'Necessário', 'purpose', 'Semente de integridade e proteção anti-spam/anti-bot para envio seguro dos formulários.', 'retention', 'Sessão (sessionStorage)'),
        jsonb_build_object('id', 'ck-rate-limit', 'name', 'mh_rl_*', 'provider', 'Mascârello Haus (Próprio)', 'category', 'Necessário', 'purpose', 'Controle local de frequência de envios (rate limit) para prevenir abuso nos formulários.', 'retention', 'Sessão / Temporário'),
        jsonb_build_object('id', 'ck-supabase-auth', 'name', 'sb-iwzimemdxchmcrvlyhxg-auth-token', 'provider', 'Supabase Auth (Restrito à área administrativa)', 'category', 'Necessário', 'purpose', 'Token de sessão exclusiva para autenticação de usuários administradores (/admin).', 'retention', 'Sessão autenticada'),
        jsonb_build_object('id', 'ck-drafts', 'name', 'mh_draft_* / mh_form_state_*', 'provider', 'Mascârello Haus (Próprio)', 'category', 'Funcional', 'purpose', 'Salvamento automático de rascunhos locais nos formulários mediante consentimento funcional.', 'retention', 'Até envio, limpeza ou revogação')
      )
    ),
    updated_at = NOW()
  WHERE key = 'lgpd_cookies';
END $$;

-- 6. Função de expurgo automático de anexos ao término do prazo de retenção (Art. 16 LGPD)
--    Pode ser agendada via pg_cron ou Edge Function administrativa.
CREATE OR REPLACE FUNCTION public.cleanup_expired_form_attachments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_deleted INTEGER := 0;
BEGIN
  DELETE FROM storage.objects
  WHERE bucket_id = 'form-attachments'
    AND (
      (name LIKE 'contato/%' AND created_at < NOW() - INTERVAL '2 years')
      OR (name LIKE 'conformidade/%' AND created_at < NOW() - INTERVAL '2 years')
      OR (name LIKE 'lgpd/%' AND created_at < NOW() - INTERVAL '5 years')
    );

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;
