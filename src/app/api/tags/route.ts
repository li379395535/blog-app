import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// 获取所有标签或特定标签
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const slug = searchParams.get('slug');

  const supabase = await createClient();

  try {
    if (slug) {
      // 获取特定标签
      const { data: tag, error: tagError } = await supabase
        .from('article_tags')
        .select('*')
        .eq('slug', slug)
        .single();

      if (tagError) {
        throw tagError;
      }

      // 获取带有此标签的文章
      const { data: articles, error: articlesError } = await supabase
        .from('article_tags')
        .select(`
          article:articles!inner(
            id, 
            title, 
            alias, 
            content, 
            created_at, 
            author_id,
            author:profiles!inner(name)
          )
        `)
        .eq('tag_id', tag.id)
        .order('article.created_at', { ascending: false });

      if (articlesError) {
        throw articlesError;
      }

      return NextResponse.json({
        tag,
        articles
      });
    } else {
      // 获取所有标签及其使用频率
      const { data, error } = await supabase
        .from('article_tags')
        .select('*')
        .order('content');

      if (error) {
        throw error;
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

// 创建新标签
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  try {
    // 获取当前用户
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tag } = await request.json();

    if (!tag) {
      return NextResponse.json({ error: 'Name and tag are required' }, { status: 400 });
    }

    // 检查Tag是否已存在
    const { data: existingTag } = await supabase
      .from('article_tags')
      .select('id')
      .eq('content', tag)
      .maybeSingle();

    if (existingTag) {
      return NextResponse.json({ error: 'Tag with this slug already exists' }, { status: 409 });
    }

    // 创建新标签
    const { data, error } = await supabase
      .from('article_tags')
      .insert({ content: tag })
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}