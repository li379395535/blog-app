'use client';

import Image from 'next/image';
import { Card, Tag } from 'antd';
import { useRouter } from 'next/navigation';
import { Article } from '@/global';

export interface BlogPost extends Partial<Omit<Article, 'author_id'>> {
  title: string;
  content: string;
  created_at: string;

  author_id: string | null;
  author?: { name: string } | string;
  author_name: string | null;
  alias?: string;
  summary?: string;
  coverImage?: string;
}

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/detail/${post.id}`);
  };

  // 生成文章摘要
  const getSummary = () => {
    if (post.summary) return post.summary;
    
    // 从内容中提取摘要，去除Markdown标记
    const plainText = post.content
      .replace(/\*\*|\*|\[|\]|\(|\)|\#|\`/g, '')
      .replace(/\n/g, ' ')
      .trim();
    
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  };
  
  // 获取作者名称
  const getAuthorName = () => {
    if (post.author_name) return post.author_name;
    if (typeof post.author === 'string') return post.author;
    if (post.author?.name) return post.author.name;
    return '未知作者';
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <Card
      hoverable
      className="w-full transition-all duration-300 hover:shadow-lg"
      onClick={handleClick}
      cover={
        post.coverImage && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )
      }
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {post.title}
          </h2>
        </div>

        <p className="text-gray-600 line-clamp-2">{getSummary()}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            {post.tags.map((tag) => (
              <Tag className="text-sm cursor-pointer" color="blue" key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
          <span>{getAuthorName()}</span>
          <span>{formatDate(post.created_at)}</span>
        </div>
      </div>
    </Card>
  );
}