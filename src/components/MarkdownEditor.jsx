"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input, Button, message, Upload } from "antd";
import { PictureOutlined, UploadOutlined } from '@ant-design/icons';
import MarkdownRenderer from "./MarkdownRenderer";
const { TextArea } = Input;

const MarkdownEditor = ({ className = "" }) => {
  const [markdown, setMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const textAreaRef = useRef(null);
  const initialLoadDone = useRef(false);

  // 从会话存储中加载内容 - 只在组件首次加载时执行
  useEffect(() => {
    if (initialLoadDone.current) return;
    
    const savedMarkdown = sessionStorage.getItem("markdownContent");
    const savedTitle = sessionStorage.getItem("articleTitle");
    const savedSummary = sessionStorage.getItem("articleSummary");
    const savedTags = sessionStorage.getItem("articleTags");
    const savedCoverImage = sessionStorage.getItem("articleCoverImage");
    const savedArticleId = sessionStorage.getItem("editingArticleId");

    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    }
    if (savedTitle) {
      setTitle(savedTitle);
    }
    if (savedSummary) {
      setSummary(savedSummary);
    }
    if (savedTags) {
      setTags(savedTags);
    }
    if (savedCoverImage) {
      setCoverImage(savedCoverImage);
    }
    if (savedArticleId) {
      setEditingArticleId(savedArticleId);
    }
    
    initialLoadDone.current = true;
  }, []);

  // 保存内容到会话存储
  useEffect(() => {
    if (!initialLoadDone.current) return;
    
    sessionStorage.setItem("markdownContent", markdown);
    sessionStorage.setItem("articleTitle", title);
    sessionStorage.setItem("articleSummary", summary);
    sessionStorage.setItem("articleTags", tags);
    sessionStorage.setItem("articleCoverImage", coverImage);
    if (editingArticleId) {
      sessionStorage.setItem("editingArticleId", editingArticleId);
    }
  }, [markdown, title, summary, tags, coverImage, editingArticleId]);

  // 生成摘要和标签
  const generateSummaryAndTags = async () => {
    if (!markdown) {
      message.warning("请先输入文章内容");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: markdown }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || '生成失败');
      }

      const result = data.result;
      const [generatedTags, generatedSummary] = result.split(';').map(item => item.trim());
      
      setTags(generatedTags);
      setSummary(generatedSummary);
      message.success("摘要和标签生成成功");
    } catch (error) {
      console.error("生成摘要和标签失败", error);
      message.error(`生成失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 发布文章
  const publishArticle = async () => {
    if (!title || !markdown) {
      message.warning("标题和内容不能为空");
      return;
    }

    setPublishing(true);
    try {
      // 准备文章数据
      const articleData = {
        title,
        content: markdown,
        summary,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        coverImage: coverImage.trim(),
      };

      let response;
      if (editingArticleId) {
        // 更新已有文章
        response = await fetch(`/api/articles/${editingArticleId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(articleData),
        });
      } else {
        // 创建新文章
        response = await fetch('/api/articles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...articleData,
            viewCount: 0,
            status: 'published',
            createdAt: new Date().toISOString(),
          }),
        });
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || '发布失败');
      }
      
      message.success(editingArticleId ? "文章更新成功" : "文章发布成功");
      
      // 清空表单和编辑状态
      setMarkdown("");
      setTitle("");
      setSummary("");
      setTags("");
      setCoverImage("");
      setEditingArticleId(null);
      sessionStorage.removeItem("editingArticleId");
    } catch (error) {
      console.error("发布文章失败", error);
      message.error(`发布失败: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };

  // 处理图片上传
  const handleImageUpload = async (file) => {
    try {
      setUploading(true);
      
      // 创建FormData对象
      const formData = new FormData();
      formData.append('file', file);

      // 发送上传请求
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || '上传失败');
      }

      // 在内容末尾插入图片链接
      const imageMarkdown = `\n![${file.name}](${data.url})`;
      setMarkdown(prevMarkdown => prevMarkdown + imageMarkdown);

      message.success('图片上传成功');
      return false; // 阻止默认上传行为
    } catch (error) {
      console.error('上传图片失败:', error);
      message.error(`上传失败: ${error.message}`);
      return false; // 阻止默认上传行为
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* 文章标题输入 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">文章标题</h3>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文章标题"
          className="w-full"
          size="large"
        />
      </div>

      {/* 封面图片URL输入 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">封面图片URL</h3>
        <Input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="请输入封面图片的URL地址"
          className="w-full"
        />
      </div>

      {/* 图片上传按钮 */}
      <div className="mb-2">
        <Upload
          showUploadList={false}
          beforeUpload={handleImageUpload}
          accept="image/*"
        >
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
            className="mb-2"
          >
            上传图片
          </Button>
        </Upload>
      </div>

      {/* Markdown编辑器和预览 */}
      <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
        {/* 编辑区 */}
        <div className="basis-1/2 min-w-0 overflow-auto">
          <h3 className="text-lg font-semibold mb-2">Markdown</h3>
          <TextArea
            ref={textAreaRef}
            rows={20}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="请输入 Markdown 格式的文章内容"
            className="w-full p-2 border border-gray-300 rounded font-mono"
          />
        </div>

        {/* 预览区 */}
        <div className="basis-1/2 min-w-0 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 flex-shrink-0">预览</h3>
          <div className="h-[460px] overflow-auto bg-white border border-gray-300 rounded p-4">
            <MarkdownRenderer content={markdown} />
          </div>
        </div>
      </div>

      {/* 摘要和标签输入（在同一行） */}
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">文章摘要</h3>
          <TextArea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="请输入文章摘要"
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">文章标签</h3>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="例如：技术,博客,Next.js,React"
            className="w-full"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-4 mt-4">
        <Button 
          type="default" 
          onClick={generateSummaryAndTags} 
          loading={loading}
        >
          生成摘要和标签
        </Button>
        <Button 
          type="primary" 
          onClick={publishArticle} 
          loading={publishing}
        >
          {editingArticleId ? "更新文章" : "发布文章"}
        </Button>
      </div>
    </div>
  );
};

export default MarkdownEditor;
