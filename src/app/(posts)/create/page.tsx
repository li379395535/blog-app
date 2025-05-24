'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button, Input, message, Progress } from 'antd';
import dynamic from 'next/dynamic';
import { generateSlug, checkSlugAvailability, saveDraft, loadDraft, clearDraft } from '@/utils/article';
import { debounce } from 'lodash';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

const MAX_TITLE_LENGTH = 50;

export default function CreateArticle() {
  const router = useRouter();
  const [article, setArticle] = useState({
    title: '',
    content: '',
    slug: '',
  });
  const [saving, setSaving] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  useEffect(() => {
    const draft = loadDraft();
    if (draft && !isDraftLoaded) {
      setArticle(draft);
      setIsDraftLoaded(true);
      message.info('已恢复上次编辑的草稿');
    }
  }, [isDraftLoaded]);

  const checkSlug = useCallback(
    debounce(async (slug: string) => {
      if (slug) {
        const available = await checkSlugAvailability(slug);
        setSlugAvailable(available);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (!isSlugEdited && article.title) {
      const newSlug = generateSlug(article.title);
      setArticle(prev => ({ ...prev, slug: newSlug }));
      checkSlug(newSlug);
    }
  }, [article.title, isSlugEdited, checkSlug]);

  useEffect(() => {
    if (article.title || article.content) {
      saveDraft(article);
    }
  }, [article]);

  const handleSave = async () => {
    if (!article.title || !article.content) {
      message.error('请填写标题和内容');
      return;
    }

    if (!slugAvailable) {
      message.error('当前URL别名已被占用，请修改');
      return;
    }

    setSaving(true);
    const supabase = createClient();

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('articles')
        .insert([
          {
            title: article.title,
            content: article.content,
            slug: article.slug || null,
            author_id: userData.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      clearDraft();
      message.success('创建成功');
      router.push(`/detail/${data.id}`);
    } catch (error) {
      console.error('Error creating article:', error);
      message.error('创建失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Input
            size="large"
            placeholder="请输入文章标题（最多50字）"
            value={article.title}
            onChange={(e) => {
              const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
              setArticle({ ...article, title: newTitle });
            }}
            className={`text-lg font-medium ${article.title.length >= MAX_TITLE_LENGTH ? 'border-red-500' : ''}`}
            style={{
              background: 'linear-gradient(to right, #f0f2f5, #ffffff)',
              borderWidth: '2px'
            }}
          />
          <div className="absolute right-2 top-2">
            <Progress
              type="circle"
              percent={Math.round((article.title.length / MAX_TITLE_LENGTH) * 100)}
              size={20}
              strokeWidth={10}
              format={() => `${article.title.length}/${MAX_TITLE_LENGTH}`}
            />
          </div>
        </div>
        <div>
          <Input
            placeholder="URL 别名（可选，建议使用英文）"
            value={article.slug}
            onChange={(e) => {
              setArticle({ ...article, slug: e.target.value });
              setIsSlugEdited(true);
              checkSlug(e.target.value);
            }}
            status={!slugAvailable ? 'error' : ''}
          />
          {!slugAvailable && (
            <div className="text-red-500 text-sm mt-1">当前URL别名已被占用</div>
          )}
        </div>
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
          type="primary"
          onClick={handleSave}
          loading={saving}
        >
          发布
        </Button>
      </div>
    </div>
  );
}