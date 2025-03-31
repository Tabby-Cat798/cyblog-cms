'use client'
import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import Stats from '../components/Stats';
import '@ant-design/v5-patch-for-react-19';
import { FileTextOutlined, TagsOutlined, EyeOutlined, CommentOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import RecentArticles from '../components/RecentArticles';
import PopularArticles from '../components/PopularArticles';


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
                <Stats dashboardData={dashboardData} />

                {/* 最近文章 */}
                <RecentArticles articles={dashboardData?.recentArticles} formatDate={formatDate} />

                {/* 热门文章 */}
                <PopularArticles articles={dashboardData?.popularArticles} formatDate={formatDate} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}