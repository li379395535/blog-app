'use server';

import { createClient } from '@/utils/supabase/server';
import { UserProfile } from '@/global';

/**
 * 检查用户是否有权限编辑/删除指定的文章
 * @param userOrAuthorId 用户对象或文章作者ID
 * @param article 文章对象（可选）
 */
export async function canManageArticle(
  userOrAuthorId: string | null,
  article?: { id: number, author_id?: string | null }
): Promise<boolean> {
  // 处理不同的调用方式
  if (typeof userOrAuthorId === 'string' && !article) {
    // 旧的调用方式：canManageArticle(articleAuthorId)
    const articleAuthorId = userOrAuthorId;
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return false;
    }

    // 如果用户是文章作者，允许编辑
    return session.user.id === articleAuthorId
  } else {
    // 新的调用方式：canManageArticle(user, article)
    const user = userOrAuthorId as UserProfile | null;

    if (!user || !article) return false;

    // 检查是否为文章作者
    if (article.author_id && user.id === article.author_id) {
      return true;
    }

    // 如果没有作者ID，从数据库查询
    if (!article.author_id) {
      const supabase = await createClient();
      const { data } = await supabase
        .from('articles')
        .select('author_id')
        .eq('id', article.id)
        .single();

      return data?.author_id === user.id;
    }

    return false;
  }
}