'use server';

import { Article } from '@/global';
import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';

export type ArticleForm = Pick<Article, 'title' | 'content' | 'slug' | 'tags'> & { tags?: string[] };
export async function save(article: ArticleForm, user: User) {
  const supabase = await createClient();

  // 开始事务
  const { data, error } = await supabase
    .from('articles')
    .insert([
      {
        title: article.title,
        content: article.content,
        slug: article.slug,
        author_id: user.id,
        author_name: user.email,
        tags: article.tags,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  revalidateTag('articles');
  return data;
}

export async function getTags() {
  const supabase = await createClient();

  // 开始事务
  const { data, error } = await supabase
    .from('article_tags')
    .select('*');

  if (error) throw error;
  return data;
}