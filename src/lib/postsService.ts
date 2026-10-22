import { supabase } from './supabase';
import { POSTS_DATA, Post } from '../data/postsData';
import { CATEGORIES_DATA, Category } from '../data/categoriesData';

const catMap = Object.fromEntries(CATEGORIES_DATA.map((c) => [c.id, c]));

export async function fetchPublishedPosts(): Promise<Post[]> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return POSTS_DATA;
    }

    return data.map((row: any) => {
      const fallbackCat: Category = catMap[row.category_id] || {
        id: row.category_id || 1,
        name: 'Geral',
        slug: 'geral'
      };

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt || '',
        category: fallbackCat,
        featured_image_url: row.featured_image_url || '/wp-content/uploads/2023/09/incidentes.png',
        pdf_url: row.pdf_url || '',
        published_at: row.published_at || row.created_at,
        author_name: 'Mascârello Haus Advocacia',
        extra_text: row.extra_text || (row.content_html ? row.content_html.replace(/<[^>]+>/g, ' ').slice(0, 300) : '')
      };
    });
  } catch (err) {
    console.warn('Erro ao carregar posts do Supabase, utilizando fallback estático:', err);
    return POSTS_DATA;
  }
}

export async function fetchPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      return POSTS_DATA.find((p) => p.slug === slug);
    }

    const fallbackCat: Category = catMap[data.category_id] || {
      id: data.category_id || 1,
      name: 'Geral',
      slug: 'geral'
    };

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt || '',
      category: fallbackCat,
      featured_image_url: data.featured_image_url || '/wp-content/uploads/2023/09/incidentes.png',
      pdf_url: data.pdf_url || '',
      published_at: data.published_at || data.created_at,
      author_name: 'Mascârello Haus Advocacia',
      extra_text: data.extra_text || (data.content_html ? data.content_html.replace(/<[^>]+>/g, ' ').slice(0, 500) : '')
    };
  } catch (err) {
    console.warn('Erro ao carregar post por slug do Supabase:', err);
    return POSTS_DATA.find((p) => p.slug === slug);
  }
}
