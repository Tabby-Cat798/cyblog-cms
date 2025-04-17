'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { Spin, message, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import EnhancedMarkdownEditor from '../../components/EnhancedMarkdownEditor';

// 包装组件，处理参数和加载文章
function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');
  const [loading, setLoading] = useState(false);
  const [article, setArticle] = useState({});
  const [editingArticleId, setEditingArticleId] = useState(null);

  // 如果有文章ID，加载文章内容
  useEffect(() => {
    if (articleId) {
      setEditingArticleId(articleId);
      fetchArticle(articleId);
    }
  }, [articleId]);

  // 获取文章数据
  const fetchArticle = async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/articles/${id}`);
      
      if (!response.ok) {
        throw new Error('获取文章失败');
      }
      
      const data = await response.json();
      setArticle(data);
    } catch (error) {
      message.error(`加载文章失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 保存文章
  const handleSaveArticle = async (articleData) => {
    try {
      let url = '/api/articles';
      let method = 'POST';
      
      // 如果有ID，则使用PUT方法更新文章
      if (editingArticleId) {
        url = `/api/articles/${editingArticleId}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存失败');
      }
      
      const result = await response.json();
      
      // 如果是新文章，跳转到编辑页面
      if (!editingArticleId && result.articleId) {
        router.push(`/editor?id=${result.articleId}`);
      }
      
      return result;
    } catch (error) {
      message.error(`保存失败: ${error.message}`);
      throw error;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* 顶部信息栏 */}
      <TopBar />
      
      {/* 主要内容 */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {editingArticleId ? "编辑文章" : "创建新文章"}
            </h1>
            <Button 
              onClick={() => router.push('/posts')}
              icon={<ArrowLeftOutlined />}
            >
              返回文章列表
            </Button>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" tip="加载中..." />
            </div>
          ) : (
            <EnhancedMarkdownEditor 
              initialValue={article?.content || ''}
              initialTitle={article?.title || ''}
              initialSummary={article?.summary || ''}
              initialTags={article?.tags ? article.tags.join(',') : ''}
              initialStatus={article?.status || 'published'}
              initialCoverImage={article?.coverImage || ''}
              initialType={article?.type || 'technology'}
              editingArticleId={editingArticleId}
              onSave={handleSaveArticle}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// 主页面组件
export default function EditorPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 使用Suspense包裹使用useSearchParams的组件 */}
      <Suspense fallback={
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow">
              <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="初始化编辑器..." />
              </div>
            </div>
          </main>
        </div>
      }>
        <EditorContent />
      </Suspense>
    </div>
  );
} 