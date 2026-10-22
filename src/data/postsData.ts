import { Category, CATEGORIES_DATA } from './categoriesData';

export interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  featured_image_url: string;
  pdf_url: string;
  published_at: string;
  author_name: string;
  extra_text?: string;
}

const catMap = Object.fromEntries(CATEGORIES_DATA.map((c) => [c.id, c]));

export const POSTS_DATA: Post[] = [
  {
    id: 2685,
    slug: 'cartilha-orientacoes-sobre-incidentes-de-seguranca',
    title: 'Cartilha Orientações sobre incidentes de segurança',
    excerpt: 'Cartilha com dicas de como agir em um incidente de segurança da informação.',
    category: catMap[1] || { id: 1, name: 'Cartilhas', slug: 'cartilhas' },
    featured_image_url: '/wp-content/uploads/2023/09/incidentes.png',
    pdf_url: '/wp-content/uploads/2023/09/cartilha-incidente-seguranca-1.pdf',
    published_at: '2023-09-08T18:27:14',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2684,
    slug: 'cartilha-lgpd-introducao-a-protecao-dos-dados-pessoais-e-a-lgpd',
    title: 'Cartilha LGPD – Introdução à Proteção dos Dados Pessoais e à LGPD',
    excerpt: 'Cartilha sobre os aspectos gerais da lei geral de proteção de dados pessoais (LGPD).',
    category: catMap[1] || { id: 1, name: 'Cartilhas', slug: 'cartilhas' },
    featured_image_url: '/wp-content/uploads/2023/09/lgpd.png',
    pdf_url: '/wp-content/uploads/2023/09/cartilha-introducao-a-protecao-de-dados-1.pdf',
    published_at: '2023-09-08T18:24:20',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2661,
    slug: 'cartilha-phishing-o-famoso-e-malicioso-clique-aqui',
    title: 'Cartilha PHISHING – O famoso e malicioso “clique aqui”',
    excerpt: 'O que é o phishing e como funciona. Orientações essenciais para não cair nesse tipo de golpe virtual.',
    category: catMap[1] || { id: 1, name: 'Cartilhas', slug: 'cartilhas' },
    featured_image_url: '/wp-content/uploads/2023/09/phishing-2.png',
    pdf_url: '/wp-content/uploads/2023/09/cartilha-phishing-1.pdf',
    published_at: '2023-09-08T18:03:52',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2415,
    slug: 'publicacoes-diario-catarinense',
    title: 'Publicações no jornal O Catarinense',
    excerpt: 'Todas as publicações e colunas de opinião do escritório Mascarello Haus no conceituado jornal O Catarinense.',
    category: catMap[45] || { id: 45, name: 'Publicações', slug: 'publicacoes' },
    featured_image_url: '/wp-content/uploads/2023/09/jornal-1.png',
    pdf_url: '/wp-content/uploads/2023/09/Editorial-Jornal-O-catarinenense.pdf',
    published_at: '2023-09-08T17:15:30',
    author_name: 'Mascârello Haus Advocacia',
    extra_text: 'O jornal O Catarinense é um dos veículos impressos mais tradicionais do Meio-Oeste catarinense, e aqui reunimos todas as publicações de autoria do escritório Mascârello Haus Advocacia.'
  },
  {
    id: 2041,
    slug: 'aprovado-ou-inscrito-em-concurso-publico-conheca-seus-direitos',
    title: 'Aprovado ou inscrito em concurso público? Conheça seus direitos!',
    excerpt: 'Conheça detalhadamente os seus direitos como candidato inscrito ou aprovado em certames e concursos públicos.',
    category: catMap[48] || { id: 48, name: 'eBooks', slug: 'ebooks' },
    featured_image_url: '/wp-content/uploads/2023/07/concurso.png',
    pdf_url: '/wp-content/uploads/2023/08/aprovados-ou-inscrito-em-concurso-publico-conheca-seus-direitos-1.pdf',
    published_at: '2020-05-19T14:40:00',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2039,
    slug: 'dicas-sobre-o-plano-de-aposentadoria',
    title: 'Dicas sobre o plano de aposentadoria',
    excerpt: 'Como sua carreira e aposentadoria estão adaptadas ao mundo moderno? Planejamento previdenciário estratégico para o seu futuro.',
    category: catMap[39] || { id: 39, name: 'Artigos', slug: 'artigos' },
    featured_image_url: '/wp-content/uploads/2023/07/aposentadoria.png',
    pdf_url: '/wp-content/uploads/2023/08/plano-de-aposentadoria-1.pdf',
    published_at: '2020-05-19T14:35:00',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2037,
    slug: 'ebook-regras-de-funcionamento-portarias-223-e-244',
    title: 'eBook Regras de Funcionamento Portarias 223 e 244',
    excerpt: 'Medidas adotadas pelo Governo Estadual de Santa Catarina para a retomada das atividades produtivas em diversos setores econômicos.',
    category: catMap[48] || { id: 48, name: 'eBooks', slug: 'ebooks' },
    featured_image_url: '/wp-content/uploads/2023/07/223.png',
    pdf_url: '/wp-content/uploads/2023/08/e-Book-Regras-de-Funcionamento-Portarias-223-e-244.pdf',
    published_at: '2020-05-19T14:30:00',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2031,
    slug: 'ebook-programa-emergencial-de-suporte-a-empregos-mp-944',
    title: 'eBook Programa Emergencial de Suporte a Empregos – MP 944',
    excerpt: 'Novas medidas disponibilizadas pelo Governo Federal para auxílio financeiro e suporte de crédito às empresas.',
    category: catMap[48] || { id: 48, name: 'eBooks', slug: 'ebooks' },
    featured_image_url: '/wp-content/uploads/2023/07/mp944.png',
    pdf_url: '/wp-content/uploads/2023/08/e-Book-Programa-Emergencial-de-Suporte-a-Empregos-MP-944.pdf',
    published_at: '2020-05-19T14:25:00',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2032,
    slug: 'ebook-medidas-trabalhistas-mp-927',
    title: 'eBook Medidas Trabalhistas – MP 927',
    excerpt: 'Orientações sobre as medidas trabalhistas adotadas pelo Governo Federal para contornar os reflexos econômicos nas relações de trabalho.',
    category: catMap[48] || { id: 48, name: 'eBooks', slug: 'ebooks' },
    featured_image_url: '/wp-content/uploads/2023/07/mp977.png',
    pdf_url: '/wp-content/uploads/2023/08/e-Book-Medidas-Trabalhistas-MP-927.pdf',
    published_at: '2020-05-19T14:20:00',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 2033,
    slug: 'ebook-auxilio-emergencial-mp-936',
    title: 'eBook Auxílio Emergencial – MP 936',
    excerpt: 'Medidas trabalhistas e regras adotadas pelo Governo Federal para a preservação de empregos e concessão do benefício emergencial.',
    category: catMap[48] || { id: 48, name: 'eBooks', slug: 'ebooks' },
    featured_image_url: '/wp-content/uploads/2023/07/auxilio.png',
    pdf_url: '/wp-content/uploads/2023/08/e-Book-Auxilio-Emergencial-MP-936-branco.pdf',
    published_at: '2020-05-19T14:15:00',
    author_name: 'Mascârello Haus Advocacia'
  },
  {
    id: 142,
    slug: 'advocacia-3-0',
    title: 'Advocacia 3.0',
    excerpt: 'Entenda como a prática jurídica evoluiu na era digital e como a advocacia 3.0 transforma a resolução estratégica de conflitos.',
    category: catMap[39] || { id: 39, name: 'Artigos', slug: 'artigos' },
    featured_image_url: '/wp-content/uploads/2023/07/advocacia3.0.png',
    pdf_url: '/wp-content/uploads/2023/07/advocacia-3-0.pdf',
    published_at: '2020-05-19T14:00:00',
    author_name: 'Mascârello Haus Advocacia'
  }
];
