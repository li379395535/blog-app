import { createClient } from '@/utils/supabase/server';

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