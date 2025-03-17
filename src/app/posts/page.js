'use client'
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Table, Button, Input, Space, Tag } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

export default function PostsPage() {
  const [searchText, setSearchText] = useState('');

  // 模拟文章数据
  const posts = [
    { 
      id: 1, 
      title: '如何使用Next.js构建现代化博客', 
      tags: ['Next.js', '博客', '教程'], 
      status: 'published', 
      date: '2023-03-15', 
      views: 245 
    },
    { 
      id: 2, 
      title: 'Markdown写作技巧与最佳实践', 
      tags: ['Markdown', '写作'], 
      status: 'published', 
      date: '2023-03-10', 
      views: 189 
    },
    { 
      id: 3, 
      title: 'React 19新特性详解', 
      tags: ['React', '前端'], 
      status: 'draft', 
      date: '2023-03-05', 
      views: 0 
    },
    { 
      id: 4, 
      title: '使用Tailwind CSS构建响应式UI', 
      tags: ['CSS', 'Tailwind', 'UI'], 
      status: 'published', 
      date: '2023-03-01', 
      views: 178 
    },
  ];

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a className="text-blue-600 hover:text-blue-800">{text}</a>,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => record.title.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags) => (
        <>
          {tags.map(tag => (
            <Tag key={tag} className="mr-1 mb-1">
              {tag}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '发布日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: '浏览量',
      dataIndex: 'views',
      key: 'views',
      sorter: (a, b) => a.views - b.views,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            className="text-blue-600 hover:text-blue-800"
          >
            编辑
          </Button>
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            className="text-red-600 hover:text-red-800"
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部信息栏 */}
        <TopBar />
        
        {/* 主要内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* 标题和操作栏 */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h1 className="text-xl font-semibold">文章管理</h1>
                <div className="flex space-x-4">
                  <Input
                    placeholder="搜索文章"
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    className="w-64"
                  />
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    href="/editor"
                  >
                    新建文章
                  </Button>
                </div>
              </div>
              
              {/* 文章表格 */}
              <Table 
                columns={columns} 
                dataSource={posts} 
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showTotal: (total) => `共 ${total} 篇文章`
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 