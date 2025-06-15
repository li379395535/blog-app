'use client';

import { Comment } from '@/global';
import { TagCloud } from './TagCloud';
import Link from 'next/link';
import useSWR from 'swr';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  // 获取最新评论
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    return res.json();
  };

  const { data: comments = [], error: commentsError, isLoading: commentsLoading } = useSWR<Comment[]>(
    '/api/comments?limit=5',
    fetcher,
    { refreshInterval: 30000 } // 每30秒刷新一次
  );

  return (
    <aside className={`space-y-8 ${className}`}>
      {/* 热门标签 */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 border-b pb-2">热门标签</h3>
        <TagCloud maxTags={15} />
      </div>

      {/* 最新评论 */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 border-b pb-2">最新评论</h3>

        {commentsLoading ? (
          <div className="py-4 text-center text-gray-500">加载中...</div>
        ) : commentsError ? (
          <div className="py-4 text-center text-red-500">加载失败</div>
        ) : comments.length === 0 ? (
          <div className="py-4 text-center text-gray-500">暂无评论</div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">{comment.author_name || '用户'}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">
                  {comment.content.length > 50
                    ? `${comment.content.substring(0, 50)}...`
                    : comment.content}
                </p>
                <Link
                  href={`/detail/${comment.article_id}#comment-${comment.id}`}
                  className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                >
                  查看全文
                </Link>
              </div>
            ))}

            <div className="text-right">
              <Link
                href="/comments"
                className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
              >
                查看所有评论
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 关于博客 */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 border-b pb-2">关于博客</h3>
        <p className="text-gray-700 mb-3">
          这是一个使用Next.js和Supabase构建的个人博客系统，支持文章管理、标签分类和评论功能。
        </p>
        <div className="flex space-x-2">
          <Link
            href="/about"
            className="text-sm text-blue-500 hover:text-blue-700 transition-colors"
          >
            了解更多
          </Link>
        </div>
      </div>
    </aside>
  );
}