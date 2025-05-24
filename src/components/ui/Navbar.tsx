'use client'

import { useState } from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Search } = Input;

interface NavbarProps {
  onSearch?: (value: string) => void;
}

export function Navbar({ onSearch }: NavbarProps) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

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
        </div>
      </div>
    </nav>
  );
}