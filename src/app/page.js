'use client'
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import { FileTextOutlined, TagsOutlined, EyeOutlined, CommentOutlined } from '@ant-design/icons';

export default function Home() {
  // 模拟统计数据
  const stats = [
    { title: '文章总数', value: '24', icon: <FileTextOutlined />, color: 'bg-blue-500' },
    { title: '标签总数', value: '18', icon: <TagsOutlined />, color: 'bg-green-500' },
    { title: '总浏览量', value: '3,642', icon: <EyeOutlined />, color: 'bg-purple-500' },
    { title: '总评论数', value: '128', icon: <CommentOutlined />, color: 'bg-orange-500' },
  ];

  // 模拟最近文章数据
  const recentPosts = [
    { id: 1, title: '如何使用Next.js构建现代化博客', date: '2023-03-15', views: 245, comments: 12 },
    { id: 2, title: 'Markdown写作技巧与最佳实践', date: '2023-03-10', views: 189, comments: 8 },
    { id: 3, title: 'React 19新特性详解', date: '2023-03-05', views: 321, comments: 15 },
    { id: 4, title: '使用Tailwind CSS构建响应式UI', date: '2023-03-01', views: 178, comments: 6 },
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
            {/* 统计卡片 */}
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

            {/* 最近文章 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">最近文章</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentPosts.map((post) => (
                  <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                        {post.title}
                      </h3>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                    <div className="flex mt-2 text-sm text-gray-500">
                      <span className="flex items-center mr-4">
                        <EyeOutlined className="mr-1" /> {post.views} 浏览
                      </span>
                      <span className="flex items-center">
                        <CommentOutlined className="mr-1" /> {post.comments} 评论
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 bg-gray-50 text-right">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  查看全部文章 →
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
