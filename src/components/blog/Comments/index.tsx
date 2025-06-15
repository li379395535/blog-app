'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/global';
import { Button, Input, message, Modal, Divider, Popconfirm, Spin } from 'antd';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { User } from '@supabase/supabase-js';
import { fetcher } from '@/utils/fetcher';

const { TextArea } = Input;

interface CommentsProps {
  articleId: string;
}

export function Comments({ articleId }: CommentsProps) {
  const router = useRouter();
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToComment, setReplyToComment] = useState<Comment | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: comments = [], error, mutate, isLoading } = useSWR<Comment[]>(
    `/api/comments?articleId=${articleId}`,
    fetcher,// 每10秒刷新一次
  );


  // 获取当前用户
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();
  }, []);

  // 提交评论
  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      message.error('评论内容不能为空');
      return;
    }

    if (!user) {
      Modal.confirm({
        title: '请先登录',
        content: '您需要登录后才能发表评论',
        okText: '去登录',
        cancelText: '取消',
        onOk: () => router.push('/login')
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          articleId,
          parentId: replyTo
        }),
      });

      if (!response.ok) {
        throw new Error('提交评论失败');
      }

      // 清空输入框并刷新评论列表
      setNewComment('');
      setReplyTo(null);
      setReplyToComment(null);
      message.success('评论发表成功');
      mutate(); // 刷新评论列表
    } catch (error) {
      console.error('Error submitting comment:', error);
      message.error('评论发表失败');
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/comments?id=${commentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除评论失败');
      }

      message.success('评论已删除');
      mutate(); // 刷新评论列表
    } catch (error) {
      console.error('Error deleting comment:', error);
      message.error('删除评论失败');
    }
  };

  // 回复评论
  const handleReply = (comment: Comment) => {
    setReplyTo(comment.id);
    setReplyToComment(comment);
    // 滚动到评论框
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 取消回复
  const handleCancelReply = () => {
    setReplyTo(null);
    setReplyToComment(null);
  };

  // 检查用户是否可以删除评论
  const canDeleteComment = (comment: Comment) => {
    if (!user) return false;
    return user.role === 'admin' || user.id === comment.author_id;
  };

  // 构建评论树
  const buildCommentTree = (comments: Comment[], parentId?: string) => {
    let rootComments: (Comment & { children?: Comment[] })[] = comments.filter(comment => comment.parent_Id === null);
    if (parentId) {
      rootComments = comments.filter(comment => comment.parent_Id === parentId)
    }

    // 初始化每个评论的children数组
    rootComments.forEach(comment => {
      let children = comments.filter(c => c.parent_Id === comment.id);
      // 递归构建子评论树
      if (children.length > 0) {
        children = buildCommentTree(comments, comment.id);
        comment.children = children;
      }
    });

    return rootComments;
  };

  const commentTree = buildCommentTree(comments);

  // 渲染单个评论
  const renderComment = (comment: Comment & { children?: Comment[] }, level = 0) => {
    return (
      <div key={comment.id} className={`mb-4 ${level > 0 ? 'ml-8' : ''}`}>
        <div className="flex justify-between">
          <div className="font-medium">{comment.author_name || '用户'}</div>
          <div className="text-gray-500 text-sm">
            {new Date(comment.created_at).toLocaleString()}
          </div>
        </div>
        <div className="my-2">{comment.content}</div>
        {level < 2 && (
          <div className="flex space-x-4 text-sm text-gray-500">
            <Button type="link" size="small" onClick={() => handleReply(comment)}>
              回复
            </Button>

            {canDeleteComment(comment) && (
              <Popconfirm
                title="确定要删除这条评论吗？"
                onConfirm={() => handleDeleteComment(comment.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger size="small">
                  删除
                </Button>
              </Popconfirm>
            )}
          </div>
        )}
        {comment.children?.map((child) => renderComment(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="mt-8">
      <Divider>评论区</Divider>

      {/* 评论列表 */}
      <div className="mb-8">
        {error && <div className="text-red-500">加载评论失败</div>}

        {isLoading && <Spin><div className="text-gray-500">加载评论中...</div></Spin>}

        {commentTree.length === 0 ? (
          <div className="text-center text-gray-500 py-8">暂无评论，来发表第一条评论吧</div>
        ) : (
          commentTree.map(comment => renderComment(comment))
        )}
      </div>

      {/* 评论表单 */}
      <div id="comment-form" className="bg-gray-50 p-4 rounded-lg">
        {replyToComment && (
          <div className="mb-2 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              回复 <span className="font-medium">{replyToComment.author_name || '用户'}</span>:
              <span className="text-gray-500">{replyToComment.content.slice(0, 20)}{replyToComment.content.length > 20 ? '...' : ''}</span>
            </div>
            <Button type="link" size="small" onClick={handleCancelReply}>取消回复</Button>
          </div>
        )}

        <TextArea
          rows={4}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder={user ? "写下你的评论..." : "登录后发表评论"}
          disabled={!user}
        />

        <div className="mt-2 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {!user && "请先登录后再评论"}
          </div>
          <Button
            type="primary"
            onClick={handleSubmitComment}
            loading={submitting}
            disabled={!user}
          >
            {user ? "发表评论" : "去登录"}
          </Button>
        </div>
      </div>
    </div>
  );
}