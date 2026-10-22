import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { POSTS_DATA, Post } from '../data/postsData';
import { CATEGORIES_DATA } from '../data/categoriesData';
import { BookOpen, Calendar, ArrowRight, Tag, Download } from 'lucide-react';

export const ArtigosEPublicacoes: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const posts: Post[] = POSTS_DATA;
  const categories = CATEGORIES_DATA;

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category.slug === selectedCategory)
    : posts;

  return (
    <div className="posts-archive-page">
      <SEO
        title="Artigos, cartilhas, ebooks e publicações | Mascârello Haus Advocacia"
        description="Confira os materiais sobre as mais diversas áreas do Direito elaborados pela equipe de advogados do escritório Mascârello Haus."
        canonical="https://mascarellohaus.adv.br/artigos-e-publicacoes/"
      />

      <div className="page-header-banner">
        <div className="container">
          <div className="gold-divider center"></div>
          <h1 className="banner-title text-center">Artigos, cartilhas, ebooks e publicações</h1>
          <p className="banner-desc text-center" style={{ margin: '0 auto', maxWidth: '800px' }}>
            Confira os materiais sobre as mais diversas áreas do Direito elaborados pela equipe de advogados do escritório Mascârello Haus.
          </p>
        </div>
      </div>

      <section className="section-padding bg-light">
        <div className="container">
          {/* Filtros de Categoria */}
          <div className="category-filter-bar">
            <button
              className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todos ({posts.length})
            </button>
            {categories.map((cat) => {
              const count = posts.filter((p) => p.category.slug === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  className={`filter-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.slug)}
                >
                  {cat.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p>Nenhuma publicação encontrada nesta categoria.</p>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.id} className="post-card">
                  {post.featured_image_url ? (
                    <Link to={`/${post.slug}/`} className="post-thumbnail-link">
                      <div className="post-thumbnail">
                        <img src={post.featured_image_url} alt={post.title} loading="lazy" />
                      </div>
                    </Link>
                  ) : (
                    <div className="post-thumbnail-placeholder">
                      <BookOpen size={40} />
                    </div>
                  )}

                  <div className="post-body">
                    {post.category && (
                      <span className="post-category-tag">
                        <Tag size={12} /> {post.category.name}
                      </span>
                    )}
                    <h2 className="post-card-title">
                      <Link to={`/${post.slug}/`}>{post.title}</Link>
                    </h2>
                    <p className="post-card-excerpt">
                      {post.excerpt || 'Clique no link para acessar a íntegra da publicação e o download do material.'}
                    </p>

                    <div className="post-footer">
                      <span className="post-date">
                        <Calendar size={13} />{' '}
                        {new Date(post.published_at).toLocaleDateString('pt-BR')}
                      </span>
                      <Link to={`/${post.slug}/`} className="read-more-link">
                        Acessar Material {post.pdf_url ? <Download size={14} /> : <ArrowRight size={14} />}
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
          margin-left: auto;
          margin-right: auto;
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
          transition: all 0.2s ease;
        }
        .filter-btn:hover {
          border-color: var(--color-accent);
          color: var(--color-accent);
        }
        .filter-btn.active {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
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
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(13, 55, 50, 0.08);
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
          transition: transform 0.3s ease;
        }
        .post-card:hover .post-thumbnail img {
          transform: scale(1.05);
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
          transition: color 0.2s ease;
        }
        .post-card-title a:hover {
          color: var(--color-accent);
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
        }
        .read-more-link:hover {
          color: var(--color-primary);
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
