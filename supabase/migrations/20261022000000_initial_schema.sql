-- ==============================================================================
-- MIGRAÇÃO INICIAL — Mascârello Haus Advocacia
-- Schema completo, RLS 100%, Triggers e Trilha de Auditoria
-- Data: 2026-10-22
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TIPOS CUSTOMIZADOS (ENUMS)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'editor', 'dpo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE post_status AS ENUM ('draft', 'published', 'scheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lgpd_request_status AS ENUM ('recebido', 'em_analise', 'aguardando_titular', 'concluido', 'rejeitado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABELA PROFILES (VINCULADA AO AUTH.USERS)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'editor',
    mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABELA MEDIA (STORAGE METADATA)
CREATE TABLE IF NOT EXISTS public.media (
    id BIGSERIAL PRIMARY KEY,
    wp_id BIGINT UNIQUE,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    media_type TEXT NOT NULL,
    alt_text TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    width INTEGER,
    height INTEGER,
    file_size BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABELA CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    wp_id BIGINT UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABELA TAGS
CREATE TABLE IF NOT EXISTS public.tags (
    id BIGSERIAL PRIMARY KEY,
    wp_id BIGINT UNIQUE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABELA POSTS
CREATE TABLE IF NOT EXISTS public.posts (
    id BIGSERIAL PRIMARY KEY,
    wp_id BIGINT UNIQUE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content_html TEXT NOT NULL,
    excerpt TEXT DEFAULT '',
    status post_status NOT NULL DEFAULT 'published',
    featured_media_id BIGINT REFERENCES public.media(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    seo_title TEXT,
    seo_description TEXT,
    published_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABELA POST_TAGS
CREATE TABLE IF NOT EXISTS public.post_tags (
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    tag_id BIGINT REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

-- 9. TABELA PAGES
CREATE TABLE IF NOT EXISTS public.pages (
    id BIGSERIAL PRIMARY KEY,
    wp_id BIGINT UNIQUE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sections_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    content_html TEXT DEFAULT '',
    is_published BOOLEAN NOT NULL DEFAULT true,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABELA PRACTICE_AREAS (ÁREAS DE ATUAÇÃO)
CREATE TABLE IF NOT EXISTS public.practice_areas (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    full_content_html TEXT NOT NULL,
    icon_svg TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TABELA TEAM_MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    oab_number TEXT,
    role_title TEXT NOT NULL,
    bio_html TEXT NOT NULL,
    photo_media_id BIGINT REFERENCES public.media(id) ON DELETE SET NULL,
    email TEXT,
    linkedin_url TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. TABELA TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
    id BIGSERIAL PRIMARY KEY,
    client_name TEXT NOT NULL,
    client_role_company TEXT,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. TABELAS DE DOCUMENTOS LEGAIS (POLÍTICAS E TERMOS VERSIONADOS)
CREATE TABLE IF NOT EXISTS public.legal_documents (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- 'politica-de-privacidade', 'politica-de-cookies', 'termos-de-uso', 'codigo-de-conduta'
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.legal_document_versions (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
    version_label TEXT NOT NULL, -- ex: '1.0', '1.1'
    content_html TEXT NOT NULL,
    effective_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. TABELAS DE QUIZ DE CONFORMIDADE LGPD
CREATE TABLE IF NOT EXISTS public.quizzes (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    question_text TEXT NOT NULL,
    hint_text TEXT,
    allows_evidence_upload BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quiz_options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    weight_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    is_compliant BOOLEAN NOT NULL DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id BIGINT NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    final_score NUMERIC(5,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. TABELA CONTACT_MESSAGES (FALE CONOSCO)
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT,
    privacy_consent BOOLEAN NOT NULL DEFAULT true,
    page_source TEXT DEFAULT 'contato',
    status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'lido', 'respondido'
    ip_hash TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. TABELA DATA_SUBJECT_REQUESTS (REQUISIÇÕES LGPD ART. 18)
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    protocol TEXT NOT NULL UNIQUE,
    requester_name TEXT NOT NULL,
    contact_channel TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    is_third_party BOOLEAN NOT NULL DEFAULT false,
    data_subject_name TEXT,
    request_type TEXT NOT NULL,
    description TEXT NOT NULL,
    has_prior_contact BOOLEAN NOT NULL DEFAULT false,
    prior_contact_details TEXT,
    attachment_storage_path TEXT,
    status lgpd_request_status NOT NULL DEFAULT 'recebido',
    legal_deadline DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '15 days'),
    internal_notes TEXT,
    resolution_details TEXT,
    resolved_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. TABELA CONSENT_RECORDS (PROVA DE CONSENTIMENTO LGPD)
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consent_type TEXT NOT NULL, -- 'cookies_essenciais', 'cookies_analytics', 'formulario_contato'
    granted BOOLEAN NOT NULL,
    user_identifier TEXT, -- hash anônimo do dispositivo/sessão
    policy_version TEXT NOT NULL,
    user_agent TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. TABELA SITE_SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 19. TABELA REDIRECTS (301)
CREATE TABLE IF NOT EXISTS public.redirects (
    id BIGSERIAL PRIMARY KEY,
    source_path TEXT NOT NULL UNIQUE,
    target_path TEXT NOT NULL,
    status_code INTEGER NOT NULL DEFAULT 301,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 20. TABELA AUDIT_LOG (TRILHA IMUTÁVEL DE AUDITORIA)
CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT,
    action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'LOGIN'
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) — 100% DAS TABELAS
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: CONTEÚDO PÚBLICO (SELECT ANÔNIMO)
CREATE POLICY "Public Read Pages" ON public.pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public Read Posts" ON public.posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Public Read Post Tags" ON public.post_tags FOR SELECT USING (true);
CREATE POLICY "Public Read Media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Public Read Practice Areas" ON public.practice_areas FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Team" ON public.team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Testimonials" ON public.testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Legal Documents" ON public.legal_documents FOR SELECT USING (true);
CREATE POLICY "Public Read Current Legal Document Versions" ON public.legal_document_versions FOR SELECT USING (is_current = true);
CREATE POLICY "Public Read Quizzes" ON public.quizzes FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Quiz Questions" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "Public Read Quiz Options" ON public.quiz_options FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public Read Redirects" ON public.redirects FOR SELECT USING (is_active = true);

-- POLÍTICAS: PROFILES
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins full profiles access" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- POLÍTICAS: PAINEL ADMINISTRATIVO (ADMIN, EDITOR, DPO)
CREATE POLICY "Staff Full Access Pages" ON public.pages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Staff Full Access Posts" ON public.posts FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Staff Full Access Media" ON public.media FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Staff Full Access Practice Areas" ON public.practice_areas FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Staff Full Access Team" ON public.team_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "Staff Full Access Legal Documents" ON public.legal_documents FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dpo'))
);

CREATE POLICY "Staff Full Access Legal Versions" ON public.legal_document_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dpo'))
);

CREATE POLICY "Staff Full Access Contact Messages" ON public.contact_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

CREATE POLICY "DPO and Admin Access LGPD Requests" ON public.data_subject_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dpo'))
);

CREATE POLICY "Staff Access Quiz Submissions" ON public.quiz_submissions FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'dpo'))
);

CREATE POLICY "Admin Read Audit Log" ON public.audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- TRIGGER PARA REGISTRO AUTOMÁTICO EM PROFILES QUANDO NOVO USUÁRIO É CRIADO NO AUTH
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE((new.raw_user_meta_data->>'role')::user_role, 'editor')
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
