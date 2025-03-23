'use client';
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Avatar, Dropdown, Button, Spin, Badge } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, CrownOutlined } from '@ant-design/icons';

const LoginButton = () => {
  const { user, isAdmin, logout, loading } = useUser();

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="flex items-center">
          <UserOutlined className="mr-2" />
          个人资料
        </div>
      ),
      onClick: () => window.location.href = '/profile',
    },
    {
      key: 'settings',
      label: (
        <div className="flex items-center">
          <SettingOutlined className="mr-2" />
          系统设置
        </div>
      ),
      onClick: () => window.location.href = '/settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <div className="flex items-center text-red-500">
          <LogoutOutlined className="mr-2" />
          退出登录
        </div>
      ),
      onClick: () => logout(),
    },
  ];

  if (loading) {
    return <Spin size="small" />;
  }

  if (user) {
    return (
      <Dropdown
        menu={{ items: userMenuItems }}
        placement="bottomRight"
        arrow
        trigger={['click']}
      >
        <div className="flex items-center space-x-2 cursor-pointer">
          <Badge dot={isAdmin} color="gold" offset={[-5, 5]}>
            <Avatar src={user.image} icon={!user.image && <UserOutlined />} className="cursor-pointer">
              {!user.image && user.name ? user.name[0].toUpperCase() : null}
            </Avatar>
          </Badge>
          <span className="hidden md:inline-flex items-center">
            {user.name}
            {isAdmin && <CrownOutlined className="ml-1 text-yellow-500" />}
          </span>
        </div>
      </Dropdown>
    );
  }

  // 通常不会显示这个，因为中间件会重定向到登录页
  return null;
};

export default LoginButton; 