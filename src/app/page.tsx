'use client';

import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from './actions';
import { VirtualizedList } from '@/components/VirtualizedList';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const router = useRouter();
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCreatePost = () => {
    router.push('/posts/create');
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">
            {user ? user.email : 'Guest'}
          </span>
        </div>
        <div className="flex gap-4">
          {user && (
            <Button
              type="primary"
              onClick={handleCreatePost}
            >
              新建博客
            </Button>
          )}
          {user ? (
            <Button onClick={handleLogout}>登出</Button>
          ) : (
            <Button onClick={() => router.push('/login')}>登录</Button>
          )}
        </div>
      </header>

      <main className="bg-white rounded-lg shadow-sm p-4">
        <VirtualizedList />
      </main>
    </div>
  );
}
