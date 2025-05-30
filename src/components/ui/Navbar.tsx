'use client'

import { useState, useEffect } from 'react';
import { Input, Button, Dropdown } from 'antd';
import { SearchOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { logout } from '@/app/actions';

const { Search } = Input;

interface NavbarProps {
  onSearch?: (value: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // 获取初始用户状态
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const categories = [
    { key: 'tech', label: '技术' },
    { key: 'life', label: '生活' },
    { key: 'review', label: '书评' },
  ];

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-2xl font-bold text-gray-900">Blog</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {categories.map((category) => (
                <Link
                  key={category.key}
                  href={`/category/${category.key}`}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {category.label}
                </Link>
              ))}
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                关于我
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                联系
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs ml-4">
            <Search
              placeholder="搜索文章..."
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* User Section */}
          <div className="ml-4 relative">
            {user ? (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: '登出',
                      onClick: async () => {
                        await logout();
                        router.push('/');
                      }
                    }
                  ]
                }}
                placement="bottomRight"
                trigger={['hover']}
              >
                <span className="text-gray-600 hover:text-gray-900 text-sm cursor-pointer">
                  {user.email}
                </span>
              </Dropdown>
            ) : (
              <Button
                type="link"
                icon={<UserOutlined />}
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-900"
              >
                登录/注册
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}