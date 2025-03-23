'use client'
import React from 'react';
import { BellOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Badge, Dropdown, Tooltip } from 'antd';
import LoginButton from './LoginButton';
import { useUser } from '@/contexts/UserContext';

const TopBar = () => {
  const { user } = useUser();
  
  // 模拟通知数据
  const notifications = [
    { id: 1, title: '系统通知', content: '系统将于今晚22:00进行维护', time: '10分钟前' },
    { id: 2, title: '评论通知', content: '有人评论了你的文章', time: '1小时前' },
  ];

  // 通知菜单项
  const notificationItems = notifications.map(notification => ({
    key: notification.id,
    label: (
      <div>
        <div className="font-medium">{notification.title}</div>
        <div className="text-sm text-gray-500">{notification.content}</div>
        <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
      </div>
    ),
  }));

  return (
    <div className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      {/* 左侧 - 当前页面信息 */}
      <div>
        <h1 className="text-xl font-medium">仪表盘</h1>
        <div className="text-sm text-gray-500">
          {user ? `欢迎回来，${user.name}` : '欢迎访问'}
        </div>
      </div>

      {/* 右侧 - 工具栏 */}
      <div className="flex items-center space-x-4">


        {/* 登录按钮 */}
        <LoginButton />
      </div>
    </div>
  );
};

export default TopBar; 