import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { supabase } from '../lib/supabase';
import { BookOpen, Calendar, ArrowRight, Tag } from 'lucide-react';

export const ArtigosEPublicacoes: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [postsRes, catsRes] = await Promise.all([
          supabase
            .from('posts')
            .select('*, categories(name, slug)')
            .eq('status', 'published')
            .order('published_at', { ascending: false }),
          supabase.from('categories').select('*').order('name')
        ]);

        if (postsRes.data) setPosts(postsRes.data);
        if (catsRes.data) setCategories(catsRes.data);
      } catch (err) {
        console.error('Erro ao carregar publicações:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.categories?.slug === selectedCategory)
    : posts;

  return (
    <div className="posts-archive-page">
      <SEO
        title="Artigos e Publicações | Mascârello Haus Advocacia"
        description="Acesse nossos artigos jurídicos, cartilhas educativas sobre LGPD, compliance, segurança da informação e e-books orientativos gratuitos."
        canonical="https://mascarellohaus.adv.br/artigos-e-publicacoes/"
      />

      <div className="page-header-banner">
        <div className="container">
          <span className="banner-badge">Acervo Educativo</span>
          <h1 className="banner-title">Artigos e Publicações</h1>
          <p className="banner-desc">
            Conteúdo técnico especializado, cartilhas educativas e orientações jurídicas práticas.
          </p>
        </div>
      </div>

      <section className="section-padding">
        <div className="container">
          {/* Filtros de Categoria */}
          <div className="category-filters">
            <button
              className={`filter-btn ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Todos os Conteúdos ({posts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                className={`filter-btn ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p>Carregando artigos...</p>
            </div>
          ) : (
            <div className="posts-grid">
              {filteredPosts.map((post) => (
                <article key={post.slug} className="post-card">
                  <div className="post-card-body">
                    <div className="post-meta">
                      {post.categories && (
                        <span className="post-category-tag">
                          <Tag size={12} /> {post.categories.name}
                        </span>
                      )}
                      <span className="post-date">
                        <Calendar size={12} />{' '}
                        {new Date(post.published_at || post.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h3 className="post-title">
                      <Link to={`/${post.slug}/`}>{post.title}</Link>
                    </h3>

                    <p className="post-excerpt">
                      {post.excerpt
                        ? post.excerpt.replace(/<[^>]+>/g, '').slice(0, 150) + '...'
                        : 'Acesse o conteúdo completo deste artigo e faça o download dos materiais disponíveis.'}
                    </p>
                  </div>

                  <div className="post-card-footer">
                    <Link to={`/${post.slug}/`} className="read-more-link">
                      Ler Publicação <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .category-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 40px;
          justify-content: center;
        }
        .filter-btn {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          color: var(--color-primary);
          padding: 8px 18px;
          border-radius: 20px;
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .filter-btn:hover, .filter-btn.active {
          background: var(--color-accent);
          color: #ffffff;
          border-color: var(--color-accent);
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
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
        .post-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.08);
          border-color: var(--color-accent);
        }
        .post-card-body {
          padding: 28px;
        }
        .post-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 0.8rem;
          color: #718096;
          margin-bottom: 12px;
        }
        .post-category-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--color-accent);
          font-weight: 600;
          text-transform: uppercase;
        }
        .post-date {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .post-title {
          font-size: 1.3rem;
          margin-bottom: 12px;
          line-height: 1.35;
        }
        .post-title a:hover {
          color: var(--color-accent);
        }
        .post-excerpt {
          color: var(--color-text-muted);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .post-card-footer {
          padding: 18px 28px;
          border-top: 1px solid #edf2f7;
          background: #fcfdfe;
          border-radius: 0 0 8px 8px;
        }
        .read-more-link {
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-accent);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        @media (max-width: 992px) {
          .posts-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .posts-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
