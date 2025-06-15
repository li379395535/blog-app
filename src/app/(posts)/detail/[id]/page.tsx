import ReactMarkdown from 'react-markdown';
import { Comments } from '@/components/blog/Comments';
import Link from 'next/link';
import { Tag as AntdTag } from 'antd';
import { getCurrentUser } from '@/app/actions';
import { canManageArticle } from '@/utils/auth';
import { Suspense } from 'react';
import { getArticle } from './actions';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 60
export const experimental_ppr = true
export async function generateStaticParams() {
  // 不再使用fetch API调用自己的接口
  // 而是直接使用Supabase客户端获取数据
  const supabase = await createClient({ disableCookie: true });
  const { data: posts } = await supabase
    .from('articles')
    .select('*');

  return (posts || []).map((post) => ({
    id: String(post.id),
  }));
}

export default async function ArticleDetail({
  params,
}: {
    params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const article = await getArticle(id);

  // 获取文章标签
  const { tags } = article ?? {};

  // 获取当前用户
  const user = await getCurrentUser();

  // 检查用户是否可以管理文章
  const canManage = user ? await canManageArticle(user.id, { id: parseInt(id), author_id: article?.author_id }) : false;

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">文章不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="prose lg:prose-xl">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

        <div className="flex justify-between items-center text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <span>作者: {article.author_name || '未知'}</span>
            <span>•</span>
            <time>{new Date(article.created_at).toLocaleDateString()}</time>
          </div>

          {canManage && (
            <div className="flex space-x-2">
              <Link
                href={`/edit/${id}`}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                编辑
              </Link>
            </div>
          )}
        </div>

        {/* 文章标签 */}

        <div className="mb-6 flex flex-wrap gap-2">
          {(tags as string[]).map(tag => (
            <Link href={`/tag/${tag}`} key={tag}>
              <AntdTag color="blue">{tag}</AntdTag>
            </Link>
          ))}
        </div>

        <div className="markdown-content">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* 评论区 */}
        <Suspense fallback={<div>加载评论中...</div>}>
          <Comments articleId={id} />
        </Suspense>
      </article>
    </div>
  );
}