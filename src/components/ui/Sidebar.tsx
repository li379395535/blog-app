'use client';

import { Avatar, Tag, List } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
}

interface SidebarProps {
  authorName?: string;
  authorAvatar?: string;
  authorBio?: string;
  popularTags?: { name: string; count: number }[];
  recentComments?: Comment[];
}

export function Sidebar({
  authorName = '博主',
  authorAvatar,
  authorBio = '热爱技术，热爱生活。分享技术见解和生活感悟。',
  popularTags = [
    { name: 'React', count: 12 },
    { name: 'Next.js', count: 8 },
    { name: '前端开发', count: 15 },
    { name: '生活随笔', count: 6 },
  ],
  recentComments = [
    { id: '1', author: '访客1', content: '写得很好，学习了！', date: '2024-01-20' },
    { id: '2', author: '访客2', content: '期待更多内容分享', date: '2024-01-19' },
    { id: '3', author: '访客3', content: '这篇文章对我帮助很大', date: '2024-01-18' },
  ],
}: SidebarProps) {
  return (
    <aside className="space-y-8">
      {/* 作者简介卡片 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            src={authorAvatar}
            className="border-2 border-gray-200"
          />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{authorName}</h3>
            <p className="text-sm text-gray-500 mt-1">{authorBio}</p>
          </div>
        </div>
      </div>

      {/* 热门标签云 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">热门标签</h3>
        <div className="flex flex-wrap gap-2">
          {popularTags.map((tag) => (
            <Tag
              key={tag.name}
              className="cursor-pointer hover:bg-blue-50"
              color="blue"
            >
              {tag.name} ({tag.count})
            </Tag>
          ))}
        </div>
      </div>

      {/* 最新评论模块 */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">最新评论</h3>
        <List
          itemLayout="horizontal"
          dataSource={recentComments}
          renderItem={(comment) => (
            <List.Item className="border-b last:border-0">
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} />}
                title={<span className="text-sm font-medium">{comment.author}</span>}
                description={
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">{comment.content}</p>
                    <span className="text-xs text-gray-400">{comment.date}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    </aside>
  );
}