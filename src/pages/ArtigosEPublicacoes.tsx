import React, { useState, useEffect } from 'react';
import { fetchPublishedPosts } from '../lib/postsService';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { POSTS_DATA, Post } from '../data/postsData';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { BookOpen, Calendar, ArrowRight, Tag, Download } from 'lucide-react';

export const ArtigosEPublicacoes: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>(POSTS_DATA);

  useEffect(() => {
    fetchPublishedPosts().then((livePosts) => {
      if (livePosts && livePosts.length > 0) setPosts(livePosts);
    });
  }, []);
  const categories = CATEGORIES_DATA;

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category.slug === selectedCategory)
    : posts;

  const activeCategoryName = selectedCategory
    ? categories.find((c) => c.slug === selectedCategory)?.name
    : null;

  return (
    <div className="posts-archive-page">
      <SEO
        title="Artigos, cartilhas, ebooks e publicações | Mascârello Haus Advocacia"
        description="Confira os materiais sobre as mais diversas áreas do Direito elaborados pela equipe de advogados do escritório Mascârello Haus."
        canonical="https://mascarellohaus.adv.br/artigos-e-publicacoes/"
        breadcrumbs={[
          { name: 'Início', url: '/' },
          { name: 'Artigos e Publicações', url: '/artigos-e-publicacoes/' },
        ]}
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center" aria-hidden="true"></div>
          <h1 className="banner-title text-center">Artigos, cartilhas, ebooks e publicações</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '800px' }}>
            Confira os materiais sobre as mais diversas áreas do Direito elaborados pela equipe de advogados do escritório Mascârello Haus.
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container">
          {/* Filtros de Categoria */}
          <div className="category-filter-bar" role="group" aria-label="Filtrar publicações por categoria">
            <button
              type="button"
              className={`filter-btn tabular-nums ${selectedCategory === null ? 'active' : ''}`}
              aria-pressed={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
            >
              Todos ({posts.length})
            </button>
            {categories.map((cat) => {
              const count = posts.filter((p) => p.category.slug === cat.slug).length;
              const isSelected = selectedCategory === cat.slug;
              return (
                <button
                  type="button"
                  key={cat.id}
                  className={`filter-btn tabular-nums ${isSelected ? 'active' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="empty-posts-state" role="status">
              <h3>Nenhuma publicação em “{activeCategoryName || selectedCategory}”</h3>
              <p>
                Novos artigos e cartilhas sobre este tema serão adicionados em breve. Você pode consultar todas as publicações disponíveis no acervo.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedCategory(null)}
              >
                Mostrar todas as publicações
              </button>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="post-card">
                  {post.featured_image_url ? (
                    <Link to={`/${post.slug}/`} className="post-thumbnail-link" tabIndex={-1} aria-hidden="true">
                      <div className="post-thumbnail">
                        <img
                          src={post.featured_image_url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width={400}
                          height={200}
                        />
                      </div>
                    </Link>
                  ) : (
                    <div className="post-thumbnail-placeholder" aria-hidden="true">
                      <BookOpen size={40} />
                    </div>
                  )}

                  <div className="post-body">
                    {post.category && (
                      <span className="post-category-tag">
                        <Tag size={12} aria-hidden="true" /> {post.category.name}
                      </span>
                    )}
                    <h2 className="post-card-title">
                      <Link to={`/${post.slug}/`}>{post.title}</Link>
                    </h2>
                    <p className="post-card-excerpt">
                      {post.excerpt || 'Acesse a íntegra da publicação e faça o download gratuito do material em PDF.'}
                    </p>

                    <div className="post-footer">
                      <span className="post-date tabular-nums">
                        <Calendar size={13} aria-hidden="true" />{' '}
                        {new Date(post.published_at).toLocaleDateString('pt-BR')}
                      </span>
                      <Link
                        to={`/${post.slug}/`}
                        className="read-more-link"
                        aria-label={`Acessar material: ${post.title}`}
                      >
                        Acessar Material {post.pdf_url ? <Download size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .gold-divider {
          width: 80px;
          height: 6px;
          background-color: var(--color-accent);
          margin-bottom: 22px;
          border-radius: 2px;
        }
        .gold-divider.center {
          margin-inline: auto;
        }
        .text-center {
          text-align: center;
        }
        .category-filter-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 45px;
          justify-content: center;
        }
        .filter-btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: var(--color-text-main);
          padding: 8px 18px;
          border-radius: 50px;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s var(--ease-out),
                      color 0.2s var(--ease-out),
                      border-color 0.2s var(--ease-out),
                      transform 0.16s var(--ease-out);
        }
        @media (hover: hover) {
          .filter-btn:hover {
            border-color: var(--color-accent);
            color: var(--color-accent);
          }
        }
        .filter-btn.active {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
        }
        .empty-posts-state {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 48px 24px;
          text-align: center;
          max-width: 560px;
          margin: 0 auto;
        }
        .empty-posts-state h3 {
          font-size: 1.4rem;
          margin-bottom: 10px;
        }
        .empty-posts-state p {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          margin-bottom: 22px;
        }
        .posts-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }
        .post-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          transition: transform 0.24s var(--ease-out), box-shadow 0.24s var(--ease-out);
        }
        @media (hover: hover) {
          .post-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(13, 55, 50, 0.08);
          }
          .post-card:hover .post-thumbnail img {
            transform: scale(1.05);
          }
        }
        .post-thumbnail-link {
          display: block;
        }
        .post-thumbnail {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f8fafc;
        }
        .post-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s var(--ease-out);
        }
        .post-thumbnail-placeholder {
          width: 100%;
          height: 200px;
          background: var(--color-bg-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent);
        }
        .post-body {
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .post-category-tag {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          color: var(--color-accent);
          font-weight: 600;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 10px;
        }
        .post-card-title {
          font-family: var(--font-serif);
          font-size: 1.25rem;
          line-height: 1.4;
          margin-bottom: 12px;
          color: var(--color-primary);
        }
        .post-card-title a {
          color: var(--color-primary);
          text-decoration: none;
          transition: color 0.2s var(--ease-out);
        }
        @media (hover: hover) {
          .post-card-title a:hover {
            color: var(--color-accent);
          }
        }
        .post-card-excerpt {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          color: var(--color-text-main);
          line-height: 1.6;
          margin-bottom: 20px;
          flex-grow: 1;
        }
        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid #edf2f7;
          padding-top: 14px;
        }
        .post-date {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .read-more-link {
          font-family: var(--font-sans);
          font-size: 0.84rem;
          color: var(--color-accent);
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          transition: color 0.2s var(--ease-out);
        }
        @media (hover: hover) {
          .read-more-link:hover {
            color: var(--color-primary);
          }
        }
        @media (max-width: 992px) {
          .posts-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 650px) {
          .posts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
