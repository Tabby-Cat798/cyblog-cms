import { useState, useEffect } from 'react';
import { FileTextOutlined, TagsOutlined, EyeOutlined, CommentOutlined } from '@ant-design/icons';

export default function Stats({ dashboardData }) {
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