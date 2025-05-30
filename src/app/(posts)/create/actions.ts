'use server';

import { Article } from '@/global';
import { createClient } from '@/utils/supabase/server';
import { User } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';

export type ArticleForm = Pick<Article, 'title' | 'content' | 'slug'>;
export async function save(article: ArticleForm, user: User) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('articles')
    .insert([
      {
        title: article.title,
        content: article.content,
        slug: article.slug || null,
        author_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  revalidateTag('articles');
  return data;
}