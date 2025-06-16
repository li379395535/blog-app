import { createClient } from '@/utils/supabase/server';
import { unstable_cache } from 'next/cache';

export async function getArticle(id: string) {

  // 使用Supabase获取文章详情
  const supabase = await createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('id', Number(id))
    .single();

  return article;
}

export const getCachedArticles = unstable_cache(async () => {
  const supabase = await createClient({ disableCookie: true });
  const { data: articles } = await supabase
    .from('articles')
    .select('*');
  return articles;
}, ['articles'], { tags: ['articles'] })