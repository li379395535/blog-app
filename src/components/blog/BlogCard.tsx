'use client';

import Image from 'next/image';
import { Card, Tag } from 'antd';
import { useRouter } from 'next/navigation';

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  coverImage?: string;
  author: string;
  date: string;
  tags: string[];
  category: 'tech' | 'life' | 'review';
}

interface BlogCardProps {
  post: BlogPost;
}

const categoryColors = {
  tech: 'blue',
  life: 'green',
  review: 'purple',
};

export function BlogCard({ post }: BlogCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/detail/${post.id}`);
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
          <Tag color={categoryColors[post.category]} className="ml-2 flex-shrink-0">
            {post.category === 'tech' ? '技术' :
             post.category === 'life' ? '生活' : '书评'}
          </Tag>
        </div>

        <p className="text-gray-600 line-clamp-2">{post.summary}</p>

        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag} className="text-sm">{tag}</Tag>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
          <span>{post.author}</span>
          <span>{post.date}</span>
        </div>
      </div>
    </Card>
  );
}