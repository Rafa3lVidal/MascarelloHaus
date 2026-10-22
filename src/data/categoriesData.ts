export interface Category {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export const CATEGORIES_DATA: Category[] = [
  { id: 39, name: 'Artigos', slug: 'artigos', count: 2 },
  { id: 1, name: 'Cartilhas', slug: 'cartilhas', count: 3 },
  { id: 48, name: 'eBooks', slug: 'ebooks', count: 5 },
  { id: 45, name: 'Publicações', slug: 'publicacoes', count: 1 }
];
