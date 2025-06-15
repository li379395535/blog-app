export type LooseObject<T = unknown> = Record<string, T>;

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  author_id: string;
  tags?: string[] | null;
}

export interface Tag {
  id: string;
  content: string;
  count?: number;
}

export interface Comment {
  id: string;
  content: string;
  article_id: string;
  author_id: string;
  parent_Id?: string;
  created_at: string;
  author_name?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar_url?: string;
}

export const BaseUrl = process.env.NODE_ENV === 'production'
  ? process.env.PROD_API_BASE
  : process.env.DEV_API_BASE;
