'use client';

import { useState, useEffect, useRef } from 'react';
import { List, Button } from 'antd';
import VirtualList from 'rc-virtual-list';
import { BlogCard, BlogPost } from './blog/BlogCard';
import { useSize } from 'ahooks';
import { nanoid } from 'nanoid';

const ContainerHeight = 400;

export function VirtualizedList() {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const ref = useRef(null);

  const size = useSize(document.querySelector('body'));

  const appendData = async () => {
    setLoading(true);
    try {
      // 这里模拟从API获取数据
      // TODO: 替换为实际的API调用
      const newData = Array.from({ length: 10 }, (_, index) => ({
        id: nanoid(),
        title: `博客标题 ${page}-${index}`,
        summary: '这是一篇精彩的博客文章，包含了丰富的内容和见解...',
        coverImage: index % 2 === 0 ? 'https://picsum.photos/800/400' : undefined,
        author: `作者 ${index}`,
        date: new Date().toLocaleDateString(),
        tags: ['React', 'Next.js', '前端开发'],
        category: ['tech', 'life', 'review'][index % 3] as 'tech' | 'life' | 'review'
      }));
      
      setData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
      
      // 模拟数据加载完毕
      if (page >= 10) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    appendData();
  }, []);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === ContainerHeight) {
      appendData();
    }
  };

  return (
    <div ref={ref}>
      <VirtualList
        data={data}
        height={size?.height ?? 0}
        itemHeight={47}
        itemKey="id"
        onScroll={onScroll}
      >
        {(item: BlogPost) => (
          <List.Item key={item.id} className="p-4">
            <BlogCard post={item} />
          </List.Item>
        )}
      </VirtualList>
      {hasMore && (
        <div className="flex justify-center py-4 hidden">
          <Button loading={loading} onClick={appendData}>
            加载更多
          </Button>
        </div>
      )}
    </div>
  );
}