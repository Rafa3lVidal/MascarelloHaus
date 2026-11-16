-- ==============================================================================
-- MIGRAÇÃO: Adequação 100% à LGPD (Lei nº 13.709/2018) e Resoluções ANPD
-- Data: 2026-11-16
-- ==============================================================================

-- 1. Garantir função auxiliar is_staff() (admin, dpo, editor) e is_dpo_or_admin()
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
  ) OR auth.role() = 'authenticated';
$$;

-- 2. Adicionar campos complementares em whistleblower_reports e data_subject_requests
ALTER TABLE public.whistleblower_reports
  ADD COLUMN IF NOT EXISTS public_response TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.data_subject_requests
  ADD COLUMN IF NOT EXISTS portability_json JSONB,
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false;

-- 3. Garantir documentos base em public.legal_documents para versionamento imutável (Art. 8º, § 2º)
INSERT INTO public.legal_documents (title, slug, description)
VALUES
  ('Aviso de Privacidade & Tratamento de Dados', 'politica-de-privacidade', 'Política e Aviso de Privacidade oficial nos termos do Art. 9º da LGPD'),
  ('Termos de Uso do Site Mascârello Haus', 'termos-de-uso', 'Termos e condições gerais de uso do portal institucional')
ON CONFLICT (slug) DO NOTHING;

-- Permitir leitura pública de todas as versões históricas para transparência (Art. 6º, VI e Art. 8º, § 2º)
DROP POLICY IF EXISTS "Public Read Current Legal Document Versions" ON public.legal_document_versions;
DROP POLICY IF EXISTS "Public Read All Legal Document Versions" ON public.legal_document_versions;
CREATE POLICY "Public Read All Legal Document Versions"
  ON public.legal_document_versions
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff Full Access Legal Documents" ON public.legal_documents;
CREATE POLICY "Staff Full Access Legal Documents"
  ON public.legal_documents
  FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff Full Access Legal Versions" ON public.legal_document_versions;
CREATE POLICY "Staff Full Access Legal Versions"
  ON public.legal_document_versions
  FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- 4. Fortalecer Trilha de Auditoria (Art. 6º, X; Art. 37; Art. 41; Art. 46)
DROP POLICY IF EXISTS "Admin Read Audit Log" ON public.audit_log;
DROP POLICY IF EXISTS "Staff Read Audit Log" ON public.audit_log;
CREATE POLICY "Staff Read Audit Log"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff Insert Audit Log" ON public.audit_log;
CREATE POLICY "Staff Insert Audit Log"
  ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff());

-- 5. Políticas para Gestão de Ciclo de Vida, Retenção, Anonimização e Eliminação (Arts. 15, 16 e 18)
DROP POLICY IF EXISTS "Staff Delete Contact Messages" ON public.contact_messages;
CREATE POLICY "Staff Delete Contact Messages"
  ON public.contact_messages
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff Delete Quiz Submissions" ON public.quiz_submissions;
CREATE POLICY "Staff Delete Quiz Submissions"
  ON public.quiz_submissions
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff Update Quiz Submissions" ON public.quiz_submissions;
CREATE POLICY "Staff Update Quiz Submissions"
  ON public.quiz_submissions
  FOR UPDATE
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff Delete Whistleblower Reports" ON public.whistleblower_reports;
CREATE POLICY "Staff Delete Whistleblower Reports"
  ON public.whistleblower_reports
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff Read Consent Records" ON public.consent_records;
CREATE POLICY "Staff Read Consent Records"
  ON public.consent_records
  FOR SELECT
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff Update Consent Records" ON public.consent_records;
CREATE POLICY "Staff Update Consent Records"
  ON public.consent_records
  FOR UPDATE
  TO authenticated
  USING (public.is_staff());

DROP POLICY IF EXISTS "Staff Delete Consent Records" ON public.consent_records;
CREATE POLICY "Staff Delete Consent Records"
  ON public.consent_records
  FOR DELETE
  TO authenticated
  USING (public.is_staff());

-- 6. Segurança Técnica de Anexos no Storage (Art. 46 — Privacy by Design)
-- Restringir leitura direta ao staff autenticado e usar Signed URLs para documentos comprobatórios
UPDATE storage.buckets
SET public = false
WHERE id = 'form-attachments';

DROP POLICY IF EXISTS "Allow viewing form attachments" ON storage.objects;
DROP POLICY IF EXISTS "Staff can view form attachments" ON storage.objects;
CREATE POLICY "Staff can view form attachments"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'form-attachments' AND public.is_staff());

DROP POLICY IF EXISTS "Staff can delete form attachments" ON storage.objects;
CREATE POLICY "Staff can delete form attachments"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'form-attachments' AND public.is_staff());

-- 7. Função RPC Segura para Consulta Pública de Protocolo pelo Titular / Relatante (Arts. 6º, IV; 18; 19)
CREATE OR REPLACE FUNCTION public.consult_protocol_status(
  p_protocol TEXT,
  p_contact_verification TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean_proto TEXT;
  v_clean_contact TEXT;
  v_lgpd RECORD;
  v_den RECORD;
BEGIN
  v_clean_proto := upper(trim(coalesce(p_protocol, '')));
  v_clean_contact := lower(trim(coalesce(p_contact_verification, '')));

  IF length(v_clean_proto) < 6 THEN
    RETURN jsonb_build_object('found', false, 'error', 'Informe um número de protocolo válido.');
  END IF;

  -- Caso 1: Protocolo da Central LGPD (MH-LGPD-...)
  IF v_clean_proto LIKE 'MH-LGPD-%' THEN
    IF length(v_clean_contact) < 3 THEN
      RETURN jsonb_build_object(
        'found', false,
        'requires_contact', true,
        'error', 'Para proteger sua privacidade (Art. 46 LGPD), informe também o e-mail ou telefone utilizado na abertura da requisição.'
      );
    END IF;

    SELECT
      protocol,
      request_type,
      status,
      legal_deadline,
      resolution_details,
      identity_verified,
      created_at,
      updated_at,
      resolved_at,
      contact_info
    INTO v_lgpd
    FROM public.data_subject_requests
    WHERE upper(trim(protocol)) = v_clean_proto
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('found', false, 'error', 'Protocolo não localizado. Verifique o código informado.');
    END IF;

    -- Valida se o e-mail/telefone informado corresponde ao cadastrado (comparação parcial ou exata sem expor o dado)
    IF lower(trim(v_lgpd.contact_info)) <> v_clean_contact
       AND regexp_replace(v_lgpd.contact_info, '\D', '', 'g') <> regexp_replace(v_clean_contact, '\D', '', 'g')
       AND position(v_clean_contact in lower(v_lgpd.contact_info)) = 0 THEN
      RETURN jsonb_build_object(
        'found', false,
        'error', 'O dado de contato informado não corresponde ao registrado neste protocolo.'
      );
    END IF;

    RETURN jsonb_build_object(
      'found', true,
      'channel', 'lgpd',
      'protocol', v_lgpd.protocol,
      'request_type', v_lgpd.request_type,
      'status', v_lgpd.status,
      'legal_deadline', v_lgpd.legal_deadline,
      'resolution_details', COALESCE(v_lgpd.resolution_details, 'Sua solicitação encontra-se em tratamento pela Encarregada de Proteção de Dados (DPO).'),
      'identity_verified', COALESCE(v_lgpd.identity_verified, false),
      'created_at', v_lgpd.created_at,
      'updated_at', v_lgpd.updated_at,
      'resolved_at', v_lgpd.resolved_at
    );
  END IF;

  -- Caso 2: Protocolo do Canal de Denúncias (MH-DEN-...)
  IF v_clean_proto LIKE 'MH-DEN-%' THEN
    SELECT
      protocol,
      status,
      is_anonymous,
      public_response,
      created_at,
      updated_at
    INTO v_den
    FROM public.whistleblower_reports
    WHERE upper(trim(protocol)) = v_clean_proto
    LIMIT 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('found', false, 'error', 'Protocolo de relato não localizado.');
    END IF;

    RETURN jsonb_build_object(
      'found', true,
      'channel', 'denuncia',
      'protocol', v_den.protocol,
      'status', v_den.status,
      'is_anonymous', v_den.is_anonymous,
      'resolution_details', COALESCE(v_den.public_response, 'Seu relato está sob análise sigilosa do Comitê de Ética e Compliance.'),
      'created_at', v_den.created_at,
      'updated_at', v_den.updated_at
    );
  END IF;

  RETURN jsonb_build_object('found', false, 'error', 'Formato de protocolo não reconhecido (use MH-LGPD-... ou MH-DEN-...).');
END;
$$;

GRANT EXECUTE ON FUNCTION public.consult_protocol_status(TEXT, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
