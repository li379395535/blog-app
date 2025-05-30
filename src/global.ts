export type LooseObject<T = unknown> = Record<string, T>;

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  author_id: string;
}