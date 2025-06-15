import { Suspense } from 'react';
import VirtualizedList from '@/components/ui/VirtualizedList';
import { Sidebar } from '@/components/blog/Sidebar';
import Link from 'next/link';
import { Skeleton } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getCurrentUser } from './actions';

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 主内容区 */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">最新文章</h1>
                <Link
                  href={user ? "/create" : "/login"}
                  className="text text-gray-500 hover:text-gray-700 hover:cursor"
                  >
                  <PlusOutlined />
                </Link>
              </div>
              <Suspense fallback={<Skeleton active />}>
                <VirtualizedList />
              </Suspense>
            </div>
          </main>

          {/* 侧边栏 */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Sidebar className="space-y-6" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
