'use client';

import { useState, useEffect, useRef } from 'react';
import { Spin } from 'antd';
import { BlogCard, BlogPost } from '../blog/BlogCard';
import { createClient } from '@/utils/supabase/client';
import { throttle, uniqBy } from 'lodash';

const PAGE_SIZE = 10; // 每页显示的数量

export default function VirtualizedList() {
  const [data, setData] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const ref = useRef<HTMLDivElement>(null);

  // const size = useSize();

  const appendData = throttle(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // 获取文章数据
      const { data: newData, error } = await supabase
        .from('articles')
        .select('*')
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (newData) {

        setData(prev => {
          return uniqBy(prev.concat(newData), 'id');
        });
        setPage(prev => prev + 1);

        // 如果返回的数据少于10条，说明没有更多数据了
        if (newData.length < 10) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, 1000);

  useEffect(() => {
    appendData();
  }, []);


  useEffect(() => {
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight) {
        appendData();
      }
    };
    document.addEventListener('scroll', onScroll);
    return () => {
      document.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={ref} className='flex flex-col gap-3'>
      {
        data.map(item => (
          <BlogCard post={item} key={item.id} />
        ))
      }

      {loading && <div className='flex justify-center'><Spin spinning={loading} /></div>}
      {!loading && !hasMore && <div className='flex justify-center'>没有更多数据了</div>}
    </div>
  );
}