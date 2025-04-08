'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeOutlined, 
  EditOutlined, 
  FileTextOutlined, 
  TagsOutlined, 
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  DashboardOutlined,
  CommentOutlined
} from '@ant-design/icons';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const pathname = usePathname();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: '仪表盘', href: '/' },
    { key: 'posts', icon: <FileTextOutlined />, label: '文章管理', href: '/posts' },
    { key: 'editor', icon: <EditOutlined />, label: '写文章', href: '/editor' },
    { key: 'comments', icon: <CommentOutlined />, label: '评论管理', href: '/comments' },
    { key: 'users', icon: <UserOutlined />, label: '用户管理', href: '/users' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置', href: '/settings' },
  ];

  // 根据当前路径设置活动菜单项
  useEffect(() => {
    const path = pathname || '/';
    
    // 根据路径匹配菜单项
    if (path === '/') {
      setActiveItem('dashboard');
    } else {
      // 移除开头的斜杠，获取路径的第一部分
      const firstSegment = path.split('/')[1];
      // 如果匹配到菜单项，则设置为活动项
      const matchedItem = menuItems.find(item => item.key === firstSegment);
      if (matchedItem) {
        setActiveItem(matchedItem.key);
      }
    }
  }, [pathname, menuItems]);

  return (
    <div className={`h-screen bg-gray-800 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* 侧边栏头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!collapsed && (
          <div className="text-xl font-bold">CyBlog</div>
        )}
        <button 
          onClick={toggleCollapsed}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* 侧边栏菜单 */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul>
          {menuItems.map((item) => (
            <li key={item.key}>
              <Link href={item.href}>
                <div
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors
                    ${activeItem === item.key ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!collapsed && (
                    <span className="ml-3">{item.label}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 侧边栏底部 */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed && (
          <div className="text-sm text-gray-400">
            CyBlog CMS v0.1.0
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;