'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from './actions';
import { VirtualizedList } from '@/components/VirtualizedList';
import { User } from '@supabase/supabase-js';
import { Sidebar } from '@/components/ui/Sidebar';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主内容区 */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">最新文章</h1>
                {user && (
                  <Link
                    href="/create"
                    className="text-sm text-blue-500 hover:text-blue-700"
                  >
                    新建博客
                  </Link>
                )}
              </div>
              <VirtualizedList />
            </div>
          </main>

          {/* 侧边栏 */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Sidebar
                authorName={user?.email}
                authorBio="热爱技术，热爱生活。分享技术见解和生活感悟。"
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
