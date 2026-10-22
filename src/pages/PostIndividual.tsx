import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { Calendar, Tag, ArrowLeft, Share2 } from 'lucide-react';

export const PostIndividual: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*, categories(name, slug)')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (err) {
        console.error('Erro ao carregar post:', err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <p>Carregando publicação...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Artigo não encontrado</h2>
        <Link to="/artigos-e-publicacoes/" className="btn btn-primary" style={{ marginTop: '20px' }}>
          <ArrowLeft size={16} /> Ver Todas as Publicações
        </Link>
      </div>
    );
  }

  return (
    <div className="single-post-page">
      <SEO
        title={`${post.title} | Mascârello Haus Advocacia`}
        description={post.seo_description || post.excerpt?.replace(/<[^>]+>/g, '').slice(0, 160)}
        canonical={`https://mascarellohaus.adv.br/${slug}/`}
      />

      {/* Header do Post */}
      <div className="page-header-banner">
        <div className="container" style={{ maxWidth: '850px' }}>
          <div className="post-header-meta">
            {post.categories && (
              <span className="banner-badge">
                <Tag size={12} /> {post.categories.name}
              </span>
            )}
            <span style={{ color: '#cbd5e0', fontSize: '0.85rem' }}>
              <Calendar size={12} />{' '}
              {new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <h1 className="banner-title" style={{ fontSize: '2.4rem' }}>{post.title}</h1>
        </div>
      </div>

      <section className="section-padding">
        <div className="container" style={{ maxWidth: '850px' }}>
          <Link to="/artigos-e-publicacoes/" className="back-link">
            <ArrowLeft size={16} /> Voltar para Artigos e Publicações
          </Link>

          {/* Conteúdo HTML Original da Publicação */}
          <article
            className="single-post-content"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          {/* Rodapé do Artigo */}
          <div className="post-footer-box">
            <h4>Mascârello Haus Advocacia</h4>
            <p>
              Assessoria consultiva e estratégica em Direito Civil, Empresarial, LGPD, Compliance e Previdenciário. Dúvidas sobre este tema?
            </p>
            <div style={{ marginTop: '15px' }}>
              <Link to="/contato/" className="btn btn-primary">
                Fale com um Especialista
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .post-header-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 12px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--color-accent);
          font-weight: 600;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          margin-bottom: 30px;
        }
        .single-post-content {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #2d3748;
        }
        .single-post-content p {
          margin-bottom: 22px;
        }
        .single-post-content h2, .single-post-content h3 {
          margin-top: 40px;
          margin-bottom: 18px;
        }
        .single-post-content img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 25px 0;
        }
        .post-footer-box {
          margin-top: 60px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--color-accent);
          padding: 30px;
          border-radius: 6px;
        }
        .post-footer-box h4 {
          margin-bottom: 8px;
        }
        .post-footer-box p {
          color: var(--color-text-muted);
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};
