'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button, Input, message, Modal } from 'antd';
import dynamic from 'next/dynamic';
import { canManageArticle } from '@/utils/auth';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

interface Article {
  id: number;
  title: string;
  content: string;
  slug: string;
  author_id: string;
  tags?: string[];
}

export default function EditArticle() {
  const { id } = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      const supabase = createClient();
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          router.push('/login');
          return;
        }

        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', Number(id))
          .single();

        if (error) throw error;

        // 检查用户是否有权限编辑此文章
        const hasPermission = await canManageArticle(data.author_id);
        if (!hasPermission) {
          message.error('您没有权限编辑此文章');
          router.push('/');
          return;
        }

        setArticle(data);
      } catch (error) {
        console.error('Error fetching article:', error);
        message.error('获取文章失败');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, router]);

  const handleDelete = async () => {
    const supabase = createClient();
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/login');
        return;
      }

      // 再次检查权限
      if (!article) return;
      const hasPermission = await canManageArticle(article.author_id);
      if (!hasPermission) {
        message.error('您没有权限删除此文章');
        return;
      }

      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      message.success('删除成功');
      router.push('/');
    } catch (error) {
      console.error('Error deleting article:', error);
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    if (!article) return;

    setSaving(true);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          title: article.title,
          content: article.content,
          slug: article.slug,
        })
        .eq('id', id);

      if (error) throw error;
      message.success('保存成功');
      router.push(`/posts/detail/${id}`);
    } catch (error) {
      console.error('Error saving article:', error);
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        加载中...
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">文章不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <Input
          size="large"
          placeholder="文章标题"
          value={article.title}
          onChange={(e) => setArticle({ ...article, title: e.target.value })}
        />
        <Input
          placeholder="URL 别名"
          value={article.slug}
          onChange={(e) => setArticle({ ...article, slug: e.target.value })}
        />
      </div>

      <div data-color-mode="light">
        <MDEditor
          value={article.content}
          onChange={(value) => setArticle({ ...article, content: value || '' })}
          height={500}
          preview="live"
        />
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Button onClick={() => router.back()}>取消</Button>
        <Button
          danger
          onClick={() => {
            Modal.confirm({
              title: '确认删除',
              content: '确定要删除这篇文章吗？此操作不可恢复',
              okText: '确认',
              cancelText: '取消',
              onOk: handleDelete,
            });
          }}
        >
          删除
        </Button>
        <Button
          type="primary"
          onClick={handleSave}
          loading={saving}
        >
          保存
        </Button>
      </div>
    </div>
  );
}