'use client';

import { useState, useEffect } from 'react';
import { List, Button } from 'antd';
import VirtualList from 'rc-virtual-list';

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  tags: string[];
}

const ContainerHeight = 400;

export function VirtualizedList() {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const appendData = async () => {
    setLoading(true);
    try {
      // 这里模拟从API获取数据
      // TODO: 替换为实际的API调用
      const newData = Array.from({ length: 10 }, (_, index) => ({
        id: `${page}-${index}`,
        title: `博客标题 ${page}-${index}`,
        author: `作者 ${index}`,
        date: new Date().toLocaleDateString(),
        tags: ['标签1', '标签2']
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
    <List>
      <VirtualList
        data={data}
        height={ContainerHeight}
        itemHeight={47}
        itemKey="id"
        onScroll={onScroll}
      >
        {(item: BlogPost) => (
          <List.Item key={item.id} className="hover:bg-gray-50 cursor-pointer p-4">
            <div className="flex flex-col w-full">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                <span className="text-sm text-gray-500">{item.date}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">{item.author}</span>
              </div>
            </div>
          </List.Item>
        )}
      </VirtualList>
      {hasMore && (
        <div className="flex justify-center py-4">
          <Button loading={loading} onClick={appendData}>
            加载更多
          </Button>
        </div>
      )}
    </List>
  );
}