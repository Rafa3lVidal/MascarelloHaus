-- ==============================================================================
-- Compatibilidade retroativa para submissões do Questionário de Conformidade
-- Suporta bundles em cache que enviam colunas legadas:
-- respondent_name, respondent_email, answers, score
-- ==============================================================================

ALTER TABLE public.quiz_submissions
  ADD COLUMN IF NOT EXISTS respondent_name TEXT,
  ADD COLUMN IF NOT EXISTS respondent_email TEXT,
  ADD COLUMN IF NOT EXISTS answers JSONB,
  ADD COLUMN IF NOT EXISTS score NUMERIC(5,2);

CREATE OR REPLACE FUNCTION public.handle_quiz_submission_compatibility()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Preenche cnpj se não informado no nível raiz (extrai de answers->>'cnpj' se existir)
  IF NEW.cnpj IS NULL OR NEW.cnpj = '' THEN
    NEW.cnpj := COALESCE(NEW.answers->>'cnpj', '00.000.000/0000-00');
  END IF;

  -- Preenche contact_name se respondent_name foi enviado
  IF NEW.contact_name IS NULL OR NEW.contact_name = '' THEN
    NEW.contact_name := COALESCE(NEW.respondent_name, 'Responsável não informado');
  END IF;

  -- Preenche contact_email se respondent_email foi enviado
  IF NEW.contact_email IS NULL OR NEW.contact_email = '' THEN
    NEW.contact_email := COALESCE(NEW.respondent_email, 'contato@empresa.com.br');
  END IF;

  -- Preenche answers_json se answers foi enviado
  IF (NEW.answers_json IS NULL OR NEW.answers_json = '{}'::jsonb) AND NEW.answers IS NOT NULL THEN
    NEW.answers_json := NEW.answers;
  END IF;

  -- Garante que answers_json não é nulo
  IF NEW.answers_json IS NULL THEN
    NEW.answers_json := '{}'::jsonb;
  END IF;

  -- Preenche final_score se score foi enviado
  IF NEW.final_score IS NULL AND NEW.score IS NOT NULL THEN
    NEW.final_score := NEW.score;
  END IF;

  -- Garante protocolo único
  IF NEW.protocol IS NULL OR NEW.protocol = '' THEN
    NEW.protocol := 'MH-CONF-' || to_char(NOW(), 'YYYYMM') || '-' || upper(substring(md5(random()::text) from 1 for 6));
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quiz_submission_compatibility ON public.quiz_submissions;
CREATE TRIGGER trg_quiz_submission_compatibility
  BEFORE INSERT ON public.quiz_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_quiz_submission_compatibility();

NOTIFY pgrst, 'reload schema';
