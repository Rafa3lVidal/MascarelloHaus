-- Migration: Production Security Hardening (Anti-XSS, Anti-Malware Upload Policy, Bot & Rate Limit Firewall)
-- Date: 2026-10-28

-- 1. Upgrade Server-side Security Trigger Function with Payload & Attachment Inspection
CREATE OR REPLACE FUNCTION public.enforce_form_security_and_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
  row_payload TEXT;
BEGIN
  -- 1.1 Reject if honeypot trap was triggered
  IF NEW.security_meta IS NOT NULL AND COALESCE(NEW.security_meta->>'honeypot', '') <> '' THEN
    RAISE EXCEPTION 'Submissão bloqueada pelo filtro de segurança anti-spam (Honeypot).';
  END IF;

  -- 1.2 Reject if headless/automated bot flag was detected in security_meta
  IF NEW.security_meta IS NOT NULL AND COALESCE(NEW.security_meta->>'bot_detected', 'false') = 'true' THEN
    RAISE EXCEPTION 'Submissão automatizada por bot não autorizada.';
  END IF;

  -- 1.3 Inspect serialized row payload for XSS / Script Injection / Malware URI schemes
  row_payload := lower(row_to_json(NEW)::text);
  IF row_payload ~ '(<script|javascript:|vbscript:|data:text/html|onerror\s*=|onload\s*=|<\?php)' THEN
    RAISE EXCEPTION 'Conteúdo bloqueado pelo firewall de segurança contra injeção de código.';
  END IF;

  -- 1.4 Enforce rate limit per ip_hash (max 8 submissions per 10 minutes per table)
  IF NEW.ip_hash IS NOT NULL AND length(NEW.ip_hash) > 8 THEN
    EXECUTE format(
      'SELECT count(*) FROM public.%I WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL ''10 minutes''',
      TG_TABLE_NAME
    ) INTO recent_count USING NEW.ip_hash;

    IF recent_count >= 8 THEN
      RAISE EXCEPTION 'Limite de envios excedido. Por favor, aguarde alguns minutos antes de tentar novamente.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Restrictive Storage Policy on `storage.objects` blocking dangerous extensions & path traversal
CREATE POLICY "Block dangerous file extensions on form-attachments"
  ON storage.objects
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id <> 'form-attachments'
    OR (
      name !~* '\.(exe|msi|bat|cmd|com|scr|pif|vbs|vbe|js|jse|wsf|wsh|ps1|psm1|sh|bash|php|phtml|asp|aspx|jsp|py|pl|rb|jar|dll|so|dylib|hta|svg|html|htm|xhtml|swf|reg|lnk|iso|img|docm|xlsm|pptm)$'
      AND position('..' in name) = 0
    )
  );
