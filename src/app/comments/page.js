'use client'
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import '@ant-design/v5-patch-for-react-19';
import { Select, Table, Button, Input, Space, Tag, Spin, Modal, message, Empty, Popconfirm, Tooltip } from 'antd';
import { SearchOutlined, DeleteOutlined, CommentOutlined } from '@ant-design/icons';

export default function CommentsPage() {
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState({});
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [articleLoading, setArticleLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取文章列表
  useEffect(() => {
    fetchArticles();
    fetchUsers();
  }, []);

  // 当选择的文章改变时，获取对应的评论
  useEffect(() => {
    if (selectedArticle) {
      fetchComments(selectedArticle);
    } else {
      setComments([]);
    }
  }, [selectedArticle]);

  // 获取文章列表
  const fetchArticles = async () => {
    try {
      setArticleLoading(true);
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error('获取文章列表失败');
      }
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      console.error('获取文章错误:', err);
      setError(err.message);
      message.error('获取文章列表失败: ' + err.message);
    } finally {
      setArticleLoading(false);
    }
  };

  // 获取所有用户
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('获取用户列表失败');
      }
      const data = await response.json();
      
      // 转换为以userId为键的对象
      const usersMap = {};
      data.forEach(user => {
        usersMap[user._id] = user;
      });
      
      setUsers(usersMap);
    } catch (err) {
      console.error('获取用户错误:', err);
      message.error('获取用户信息失败: ' + err.message);
    }
  };

  // 获取选定文章的评论
  const fetchComments = async (articleId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?postId=${articleId}`);
      if (!response.ok) {
        throw new Error('获取评论失败');
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error('获取评论错误:', err);
      setError(err.message);
      message.error('获取评论失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = (commentId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评论吗？此操作将同时删除所有子评论且不可撤销。',
      okText: '确认',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            throw new Error('删除评论失败');
          }
          
          const result = await response.json();
          
          message.success(`评论已成功删除，共删除 ${result.deletedCount || 1} 条评论`);
          
          // 更新本地评论列表，移除已删除的评论及其子评论
          if (selectedArticle) {
            fetchComments(selectedArticle); // 重新获取评论列表
          }
        } catch (err) {
          console.error('删除评论错误:', err);
          message.error('删除评论失败: ' + err.message);
        }
      },
    });
  };

  // 查找父评论内容
  const findParentComment = (parentId) => {
    return comments.find(comment => comment._id === parentId);
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 截取评论内容前20个字符
  const truncateContent = (content, maxLength = 20) => {
    if (!content) return '';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  // 评论表格列定义
  const columns = [
    {
      title: '评论者',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId) => {
        const user = users[userId];
        return <span className="font-medium">{user ? user.username || user.name : '未知用户'}</span>;
      },
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <div className="max-w-xl line-clamp-2">{text}</div>
      ),
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => record.content.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: '父评论',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId) => {
        if (!parentId) return <span className="text-gray-400">-</span>;
        
        const parentComment = findParentComment(parentId);
        if (!parentComment) return <span className="text-gray-400">已删除的评论</span>;
        
        return (
          <Tooltip title={parentComment.content}>
            <span className="text-blue-600">
              {truncateContent(parentComment.content)}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title="确认删除"
            description="确定要删除这条评论吗？此操作将同时删除所有子评论且不可撤销。"
            onConfirm={() => handleDeleteComment(record._id)}
            okText="确认"
            okType="danger"
            cancelText="取消"
          >
            <Button 
              type="text" 
              icon={<DeleteOutlined />} 
              className="text-red-600 hover:text-red-800"
            >
              删除
            </Button>
          </Popconfirm>
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
              <div className="px-6 py-4 border-b border-gray-200">
                <h1 className="text-xl font-semibold mb-4">评论管理</h1>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div className="w-full sm:w-auto">
                    <Select
                      loading={articleLoading}
                      showSearch
                      style={{ width: '100%', minWidth: '300px' }}
                      placeholder="选择文章"
                      optionFilterProp="children"
                      onChange={setSelectedArticle}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={articles.map(article => ({
                        value: article._id,
                        label: article.title
                      }))}
                    />
                  </div>
                  
                  {selectedArticle && (
                    <Input
                      placeholder="搜索评论内容"
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      className="w-full sm:w-64"
                    />
                  )}
                </div>
              </div>
              
              {/* 评论表格 */}
              <div className="p-4">
                {!selectedArticle ? (
                  <Empty
                    description="请先选择一篇文章查看评论"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-16"
                  />
                ) : loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Spin size="large" tip="加载中..." />
                  </div>
                ) : error ? (
                  <div className="text-center text-red-500 p-8">
                    加载失败: {error}
                  </div>
                ) : comments.length === 0 ? (
                  <Empty 
                    description="暂无评论" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-16"
                  />
                ) : (
                  <Table 
                    columns={columns} 
                    dataSource={comments} 
                    rowKey="_id"
                    pagination={{ 
                      pageSize: 10,
                      showTotal: (total) => `共 ${total} 条评论`
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 