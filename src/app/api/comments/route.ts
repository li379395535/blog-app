import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

// 获取评论列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const articleId = searchParams.get('articleId');
  const commentId = searchParams.get('id');

  const supabase = await createClient();

  try {
    let query = supabase
      .from('comments')
      .select('*');

    // 如果提供了文章ID，则按文章ID筛选
    if (articleId) {
      query = query.eq('article_id', Number(articleId));
    }

    // 如果提供了评论ID，则按评论ID筛选
    if (commentId) {
      query = query.eq('id', Number(commentId));
    }

    // 按创建时间排序
    query = query.order('created_at', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 处理嵌套的author_name
    const formattedData = data.map(comment => ({
      ...comment,
      author_name: comment.authorName
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// 创建评论
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, articleId, parentId } = await request.json();

    if (!content || !articleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 插入评论
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content,
        article_id: articleId,
        author: session.user.id,
        authorName: session.user.email,
        parent_Id: parentId,
      })
      .select();

    if (error) {
      throw error;
    }

    // 重新验证评论缓存
    revalidateTag('comments');

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

// 删除评论
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const commentId = searchParams.get('id');

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取评论信息
    const { data: comment } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', Number(commentId))
      .single();

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // 删除评论
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', Number(commentId));

    if (error) {
      throw error;
    }

    // 重新验证评论缓存
    revalidateTag('comments');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}