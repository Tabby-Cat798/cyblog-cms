'use client'
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { FileTextOutlined, TagsOutlined, EyeOutlined, CommentOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

export default function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('获取仪表盘数据失败');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('获取仪表盘数据错误:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // 渲染统计卡片
  const renderStats = () => {
    const stats = [
      { 
        title: '文章总数', 
        value: dashboardData?.stats?.totalArticles || 0, 
        icon: <FileTextOutlined />, 
        color: 'bg-blue-500' 
      },
      { 
        title: '已发布文章', 
        value: dashboardData?.stats?.publishedArticles || 0, 
        icon: <FileTextOutlined />, 
        color: 'bg-green-500' 
      },
      { 
        title: '总浏览量', 
        value: dashboardData?.stats?.totalViews || 0, 
        icon: <EyeOutlined />, 
        color: 'bg-purple-500' 
      },
      { 
        title: '草稿数', 
        value: dashboardData?.stats?.draftArticles || 0, 
        icon: <FileTextOutlined />, 
        color: 'bg-orange-500' 
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${stat.color} text-white mr-4`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
          {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large">
                  <div className="p-8 text-center">加载中...</div>
                </Spin>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-4">
                加载失败: {error}
              </div>
            ) : (
              <>
                {/* 统计卡片 */}
                {renderStats()}

                {/* 最近文章 */}
                <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">最近文章</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {dashboardData?.recentArticles?.length > 0 ? (
                      dashboardData.recentArticles.map((post) => (
                        <div key={post._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                              {post.title}
                            </h3>
                            <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex mt-2 text-sm text-gray-500">
                            <span className="flex items-center mr-4">
                              <EyeOutlined className="mr-1" /> {post.viewCount || 0} 浏览
                            </span>
                            <span className="flex items-center">
                              {post.tags?.length || 0} 标签
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-center text-gray-500">
                        暂无文章
                      </div>
                    )}
                  </div>
                </div>

                {/* 热门文章 */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">热门文章</h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {dashboardData?.popularArticles?.length > 0 ? (
                      dashboardData.popularArticles.map((post) => (
                        <div key={post._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                              {post.title}
                            </h3>
                            <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex mt-2 text-sm text-gray-500">
                            <span className="flex items-center mr-4">
                              <EyeOutlined className="mr-1" /> {post.viewCount || 0} 浏览
                            </span>
                            <span className="flex items-center">
                              {post.tags?.length || 0} 标签
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-center text-gray-500">
                        暂无文章
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}