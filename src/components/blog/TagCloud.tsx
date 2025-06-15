'use client';

import { Tag as TagType } from '@/global';
import { Tag } from 'antd';
import useSWR from 'swr';

interface TagCloudProps {
  maxTags?: number;
  showCount?: boolean;
  className?: string;
}

export function TagCloud({ maxTags = 20, className = '' }: TagCloudProps) {

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    return res.json();
  };

  const { data: tags = [], error, isLoading } = useSWR<TagType[]>('/api/tags', fetcher);

  if (isLoading) {
    return <div className="py-4">加载标签中...</div>;
  }

  if (error) {
    return <div className="py-4 text-red-500">加载标签失败</div>;
  }

  // 限制显示的标签数量
  const displayTags = tags.slice(0, maxTags);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayTags.map(tag => (
        <Tag
          key={tag.id}
          color={'blue'}
        >
          {tag.content}
        </Tag>
      ))}

      {tags.length === 0 && (
        <div className="text-gray-500">暂无标签</div>
      )}
    </div>
  );
}