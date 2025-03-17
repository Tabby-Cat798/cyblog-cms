'use client'
import React from 'react';
import { BellOutlined, UserOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Space, Tooltip } from 'antd';

const TopBar = () => {
  // 模拟用户数据
  const user = {
    name: '管理员',
    avatar: null, // 如果有头像URL可以放在这里
  };

  // 模拟通知数据
  const notifications = [
    { id: 1, title: '系统通知', content: '系统将于今晚22:00进行维护', time: '10分钟前' },
    { id: 2, title: '评论通知', content: '有人评论了你的文章', time: '1小时前' },
  ];

  // 用户菜单项
  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
    },
    {
      key: 'settings',
      label: '账户设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
    },
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
        <div className="text-sm text-gray-500">欢迎回来，{user.name}</div>
      </div>

      {/* 右侧 - 工具栏 */}
      <div className="flex items-center space-x-4">
        {/* 帮助按钮 */}
        <Tooltip title="帮助中心">
          <QuestionCircleOutlined className="text-xl cursor-pointer text-gray-600 hover:text-blue-500" />
        </Tooltip>

        {/* 通知按钮 */}
        <Dropdown
          menu={{ items: notificationItems }}
          placement="bottomRight"
          arrow
          trigger={['click']}
        >
          <Badge count={notifications.length} size="small">
            <BellOutlined className="text-xl cursor-pointer text-gray-600 hover:text-blue-500" />
          </Badge>
        </Dropdown>

        {/* 用户菜单 */}
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          arrow
          trigger={['click']}
        >
          <Space className="cursor-pointer">
            <Avatar icon={<UserOutlined />} src={user.avatar} />
            <span className="hidden md:inline">{user.name}</span>
          </Space>
        </Dropdown>
      </div>
    </div>
  );
};

export default TopBar; 