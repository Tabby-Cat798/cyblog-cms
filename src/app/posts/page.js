'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import '@ant-design/v5-patch-for-react-19';
import { Table, Button, Input, Space, Tag, Spin, Modal, message } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined, CommentOutlined } from '@ant-design/icons';

export default function PostsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [articles, setArticles] = useState([]);
  const [commentCounts, setCommentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取文章列表和评论数
  useEffect(() => {
    fetchArticlesAndComments();
  }, []);

  const fetchArticlesAndComments = async () => {
    try {
      setLoading(true);
      // 并行请求文章列表和评论数
      const [articlesResponse, commentsResponse] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/comments/count')
      ]);

      if (!articlesResponse.ok) {
        throw new Error('获取文章列表失败');
      }

      const articlesData = await articlesResponse.json();
      
      // 处理文章数据 - 适配新的 API 返回格式
      let articlesArray = [];
      if (Array.isArray(articlesData)) {
        // 旧格式：直接是数组
        articlesArray = articlesData;
      } else if (articlesData && articlesData.articles && Array.isArray(articlesData.articles)) {
        // 新格式：{ articles: [...], total: ... }
        articlesArray = articlesData.articles;
      } else {
        console.error('无法识别的文章数据格式:', articlesData);
        articlesArray = []; // 确保默认是空数组
      }
      
      // 如果评论数API请求成功，处理评论数据
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json();
        const commentsMap = {};
        
        // 将评论数据转换为映射表
        commentsData.forEach(item => {
          commentsMap[item.articleId] = item.count;
        });
        
        setCommentCounts(commentsMap);
      }
      
      setArticles(articlesArray);
    } catch (err) {
      console.error('获取数据错误:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除文章
  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这篇文章吗？此操作不可撤销。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/articles/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('删除文章失败');
          }
          
          message.success('文章已成功删除');
          fetchArticlesAndComments(); // 重新获取文章列表和评论数
        } catch (err) {
          console.error('删除文章错误:', err);
          message.error('删除文章失败: ' + err.message);
        }
      },
    });
  };

  // 编辑文章
  const handleEdit = (id) => {
    router.push(`/editor?id=${id}`);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

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
          {tags && tags.map(tag => (
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
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: '浏览量',
      dataIndex: 'viewCount',
      key: 'viewCount',
      sorter: (a, b) => a.viewCount - b.viewCount,
    },
    {
      title: '评论数',
      key: 'commentCount',
      render: (_, record) => (
        <span className="flex items-center">
          <CommentOutlined className="mr-1" /> {commentCounts[record._id] || 0}
        </span>
      ),
      sorter: (a, b) => (commentCounts[a._id] || 0) - (commentCounts[b._id] || 0),
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
            onClick={() => handleEdit(record._id)}
          >
            编辑
          </Button>
          <Button 
            type="text" 
            icon={<DeleteOutlined />} 
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDelete(record._id)}
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
                    href="/editor?new=true"
                  >
                    新建文章
                  </Button>
                </div>
              </div>
              
              {/* 文章表格 */}
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Spin size="large" tip="加载中..." />
                </div>
              ) : error ? (
                <div className="text-center text-red-500 p-8">
                  加载失败: {error}
                </div>
              ) : (
                <Table 
                  columns={columns} 
                  dataSource={articles} 
                  rowKey="_id"
                  pagination={{ 
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 篇文章`
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}