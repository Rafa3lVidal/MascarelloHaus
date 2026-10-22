import React, { useState, useEffect } from 'react';
import { fetchPostBySlug } from '../lib/postsService';
import { useParams, useLocation, Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { POSTS_DATA, Post } from '../data/postsData';
import { Calendar, Tag, ArrowLeft, Download, ExternalLink, MessageCircle, FileText, Share2 } from 'lucide-react';

export const PostIndividual: React.FC = () => {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const location = useLocation();

  // Normalize slug
  const rawPath = paramSlug || location.pathname.replace(/^\/|\/$/g, '').split('/').pop() || '';
  const currentSlug = rawPath.toLowerCase();

  const [post, setPost] = useState<Post | undefined>(() => POSTS_DATA.find((p) => p.slug === currentSlug));

  useEffect(() => {
    fetchPostBySlug(currentSlug).then((livePost) => {
      if (livePost) setPost(livePost);
    });
  }, [currentSlug]);

  if (!post) {
    return (
      <div className="container" style={{ padding: '120px 20px', textAlign: 'center' }}>
        <h2>Publicação não encontrada</h2>
        <p style={{ marginTop: '12px', color: 'var(--color-text-muted)' }}>
          A publicação ou artigo solicitado não foi localizado em nossa base de dados.
        </p>
        <Link to="/artigos-e-publicacoes/" className="btn btn-primary" style={{ marginTop: '24px' }}>
          <ArrowLeft size={16} /> Ver Todas as Publicações
        </Link>
      </div>
    );
  }

  // Related posts from same category or other posts
  const relatedPosts = POSTS_DATA
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <div className="single-post-page">
      <SEO
        title={`${post.title} | Mascârello Haus Advocacia`}
        description={post.excerpt}
        canonical={`https://mascarellohaus.adv.br/${post.slug}/`}
      />

      {/* Header do Post */}
      <div className="page-header-banner">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="post-header-meta">
            {post.category && (
              <span className="banner-badge">
                <Tag size={12} /> {post.category.name}
              </span>
            )}
            <span style={{ color: '#cbd5e0', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={14} />{' '}
              {new Date(post.published_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <h1 className="banner-title" style={{ fontSize: '2.3rem', lineHeight: '1.25' }}>{post.title}</h1>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container" style={{ maxWidth: '900px' }}>
          <div className="post-top-bar">
            <Link to="/artigos-e-publicacoes/" className="back-link">
              <ArrowLeft size={16} /> Voltar para Artigos e Publicações
            </Link>

            <button onClick={handleShare} className="share-btn" title="Compartilhar">
              <Share2 size={16} /> Compartilhar
            </button>
          </div>

          <article className="post-content-container">
            {/* Imagem de Capa em Destaque */}
            {post.featured_image_url && (
              <div className="post-featured-media">
                <img src={post.featured_image_url} alt={post.title} />
              </div>
            )}

            {/* Descrição e Resumo do Material */}
            <div className="post-lead-text">
              <p>{post.excerpt}</p>
            </div>

            {/* Texto Adicional se Existir */}
            {post.extra_text && (
              <div className="post-extra-text">
                <p>{post.extra_text}</p>
              </div>
            )}

            {/* Seção de Download e Visualização de PDF */}
            {post.pdf_url && (
              <div className="material-access-box">
                <div className="material-info-header">
                  <div className="material-icon">
                    <FileText size={32} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', color: 'var(--color-primary)' }}>
                      Material Completo Disponível para Download
                    </h3>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.92rem' }}>
                      Acesse a íntegra em formato digital PDF preparado pela equipe de especialistas.
                    </p>
                  </div>
                </div>

                <div className="material-actions">
                  <a
                    href={post.pdf_url}
                    download
                    className="btn btn-primary btn-download"
                  >
                    <Download size={18} /> Baixar PDF Gratuito
                  </a>
                  <a
                    href={post.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <ExternalLink size={16} /> Visualizar no Navegador
                  </a>
                </div>

                {/* Pré-visualização do PDF incorporado */}
                <div className="pdf-embed-wrapper">
                  <iframe
                    src={`${post.pdf_url}#toolbar=1`}
                    title={post.title}
                    width="100%"
                    height="650px"
                    style={{ border: 'none', borderRadius: '6px' }}
                  />
                </div>
              </div>
            )}

            {/* Rodapé do Artigo */}
            <div className="post-footer-box">
              <h4 style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                Mascârello Haus Advocacia
              </h4>
              <p style={{ marginTop: '8px', lineHeight: '1.6', color: '#4a5568' }}>
                Assessoria consultiva e estratégica em Direito Civil, Empresarial, LGPD, Compliance, Direito Digital e Previdenciário. Dúvidas sobre o conteúdo desta publicação?
              </p>
              <div className="footer-cta-buttons" style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                <Link to="/contato/" className="btn btn-primary">
                  Fale com um Especialista
                </Link>
                <a
                  href={`https://wa.me/5549999281878?text=${encodeURIComponent(`Olá! Vi o material "${post.title}" no site e gostaria de conversar.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  <MessageCircle size={18} /> WhatsApp
                </a>
              </div>
            </div>
          </article>

          {/* Outras Publicações Relacionadas */}
          {relatedPosts.length > 0 && (
            <div className="related-section">
              <h3 style={{ fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '20px' }}>
                Outros materiais recomendados
              </h3>
              <div className="related-grid">
                {relatedPosts.map((rp) => (
                  <Link key={rp.id} to={`/${rp.slug}/`} className="related-card">
                    <span className="related-cat">{rp.category.name}</span>
                    <h5 className="related-title">{rp.title}</h5>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .post-header-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 14px;
        }
        .post-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--color-accent);
          font-weight: 600;
          font-size: 0.92rem;
          text-decoration: none;
        }
        .back-link:hover {
          color: var(--color-primary);
        }
        .share-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--color-text-main);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .share-btn:hover {
          background: #f1f5f9;
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
        .post-content-container {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .post-featured-media {
          width: 100%;
          max-height: 400px;
          overflow: hidden;
          border-radius: 6px;
          margin-bottom: 30px;
          text-align: center;
          background: #f8fafc;
        }
        .post-featured-media img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          margin: 0 auto;
        }
        .post-lead-text {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #2d3748;
          margin-bottom: 24px;
          font-weight: 400;
        }
        .post-extra-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #4a5568;
          margin-bottom: 30px;
          padding: 16px 20px;
          background: #f8fafc;
          border-left: 3px solid var(--color-accent);
          border-radius: 4px;
        }
        .material-access-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 30px;
          margin: 35px 0;
        }
        .material-info-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }
        .material-icon {
          width: 56px;
          height: 56px;
          border-radius: 10px;
          background: rgba(203, 171, 122, 0.15);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .material-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 25px;
        }
        .btn-download {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: var(--color-primary);
          color: #ffffff;
        }
        .pdf-embed-wrapper {
          border: 1px solid #cbd5e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .post-footer-box {
          margin-top: 40px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-left: 4px solid var(--color-accent);
          padding: 28px;
          border-radius: 6px;
        }
        .whatsapp-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #25d366;
          color: #ffffff;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .whatsapp-btn:hover {
          opacity: 0.9;
        }
        .related-section {
          margin-top: 50px;
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .related-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 20px;
          text-decoration: none;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
        }
        .related-card:hover {
          transform: translateY(-3px);
          border-color: var(--color-accent);
          box-shadow: 0 6px 15px rgba(0,0,0,0.05);
        }
        .related-cat {
          font-size: 0.75rem;
          color: var(--color-accent);
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .related-title {
          font-family: var(--font-serif);
          font-size: 1.05rem;
          color: var(--color-primary);
          margin: 0;
          line-height: 1.35;
        }
        @media (max-width: 768px) {
          .post-content-container {
            padding: 24px 18px;
          }
          .related-grid {
            grid-template-columns: 1fr;
          }
          .pdf-embed-wrapper iframe {
            height: 450px;
          }
        }
      `}</style>
    </div>
  );
};
