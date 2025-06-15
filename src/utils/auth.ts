'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { UserRole, UserProfile } from '@/global';

/**
 * 检查用户是否为管理员
 * @param user 可选的用户对象，如果不提供则检查当前会话用户
 */
export async function isAdmin(user?: UserProfile | null): Promise<boolean> {
  // 如果提供了用户对象
  if (user) {
    // 如果用户对象中已包含角色信息，直接判断
    if (user.role) {
      return user.role === UserRole.ADMIN;
    }

    // 否则从数据库查询用户角色
    const supabase = await createClient();
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return data?.role === UserRole.ADMIN;
  }

  // 如果没有提供用户对象，检查当前会话用户
  const supabase = createClient(cookies());
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return false;
  }

  // 从用户元数据或专门的用户角色表中获取角色信息
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  return data?.role === UserRole.ADMIN;
}

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
    if (session.user.id === articleAuthorId) {
      return true;
    }

    // 如果用户是管理员，也允许编辑
    return await isAdmin();
  } else {
    // 新的调用方式：canManageArticle(user, article)
    const user = userOrAuthorId as UserProfile | null;

    if (!user || !article) return false;

    // 检查是否为管理员
    const admin = await isAdmin(user);
    if (admin) return true;

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