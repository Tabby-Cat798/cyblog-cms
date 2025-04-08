'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import MarkdownEditor from "../../components/MarkdownEditor";
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Spin, message } from 'antd';

// 将使用useSearchParams的逻辑分离到一个新组件
function EditorContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState(null);
  const [pageTitle, setPageTitle] = useState('创建新文章');

  // 如果有文章ID，加载文章内容
  useEffect(() => {
    async function fetchArticle() {
      if (!articleId) return;
      
      setLoading(true);
      try {
        console.log(`获取文章数据，ID: ${articleId}`);
        const response = await fetch(`/api/articles/${articleId}`);
        
        if (!response.ok) {
          throw new Error('获取文章失败');
        }
        
        const data = await response.json();
        console.log('文章数据获取成功:', data);
        
        // 设置文章数据到 localStorage
        localStorage.setItem("markdownContent", data.content || '');
        localStorage.setItem("articleTitle", data.title || '');
        localStorage.setItem("articleSummary", data.summary || '');
        localStorage.setItem("articleTags", data.tags ? data.tags.join(',') : '');
        localStorage.setItem("articleCoverImage", data.coverImage || '');
        localStorage.setItem("editingArticleId", articleId);
        localStorage.setItem("articleStatus", data.status || 'published');
        
        // 更新页面标题
        setPageTitle(`编辑: ${data.title}`);
        setArticle(data);
      } catch (error) {
        console.error('获取文章数据失败:', error);
        message.error(`加载文章失败: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticle();
  }, [articleId]);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{pageTitle}</h1>
      
      {/* 如果是编辑模式并且正在加载，显示加载状态 */}
      {articleId && loading ? (
        <div className="flex items-center justify-center h-64">
          <Spin size="large" tip="加载文章中..." />
        </div>
      ) : (
        <MarkdownEditor />
      )}
    </>
  );
}

// 主页面组件，添加Suspense边界
export default function EditorPage() {
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
            <Suspense fallback={<div className="flex items-center justify-center h-64"><Spin size="large" tip="加载中..." /></div>}>
              <EditorContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
} 