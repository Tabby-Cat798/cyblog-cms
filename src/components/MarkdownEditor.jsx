"use client";
import React, { useState, useEffect, useRef } from "react";
import { Input, Button, message, Upload, Switch, Space, Tooltip } from "antd";
import { PictureOutlined, UploadOutlined, ClearOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
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
  const [status, setStatus] = useState("published"); // 默认为published状态
  const textAreaRef = useRef(null);
  const initialLoadDone = useRef(false);

  // 从本地存储中加载内容 - 只在组件首次加载时执行
  useEffect(() => {
    if (initialLoadDone.current) return;
    
    // 检查URL是否包含"new=true"参数，如果是，则清空存储
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new') === 'true') {
      clearArticleData();
      initialLoadDone.current = true;
      return;
    }
    
    const savedMarkdown = localStorage.getItem("markdownContent");
    const savedTitle = localStorage.getItem("articleTitle");
    const savedSummary = localStorage.getItem("articleSummary");
    const savedTags = localStorage.getItem("articleTags");
    const savedCoverImage = localStorage.getItem("articleCoverImage");
    const savedArticleId = localStorage.getItem("editingArticleId");
    const savedStatus = localStorage.getItem("articleStatus");

    if (savedMarkdown) setMarkdown(savedMarkdown);
    if (savedTitle) setTitle(savedTitle);
    if (savedSummary) setSummary(savedSummary);
    if (savedTags) setTags(savedTags);
    if (savedCoverImage) setCoverImage(savedCoverImage);
    if (savedArticleId) setEditingArticleId(savedArticleId);
    if (savedStatus) setStatus(savedStatus);
    
    initialLoadDone.current = true;
  }, []);

  // 保存内容到本地存储
  useEffect(() => {
    if (!initialLoadDone.current) return;
    
    localStorage.setItem("markdownContent", markdown);
    localStorage.setItem("articleTitle", title);
    localStorage.setItem("articleSummary", summary);
    localStorage.setItem("articleTags", tags);
    localStorage.setItem("articleCoverImage", coverImage);
    localStorage.setItem("articleStatus", status);
    if (editingArticleId) {
      localStorage.setItem("editingArticleId", editingArticleId);
    }
  }, [markdown, title, summary, tags, coverImage, editingArticleId, status]);

  // 清空文章数据
  const clearArticleData = () => {
    // 清空组件状态
    setMarkdown("");
    setTitle("");
    setSummary("");
    setTags("");
    setCoverImage("");
    setEditingArticleId(null);
    setStatus("published"); // 重置为默认发布状态
    
    // 清空本地存储
    localStorage.removeItem("markdownContent");
    localStorage.removeItem("articleTitle");
    localStorage.removeItem("articleSummary");
    localStorage.removeItem("articleTags");
    localStorage.removeItem("articleCoverImage");
    localStorage.removeItem("editingArticleId");
    localStorage.removeItem("articleStatus");
    
    message.success("已清空编辑器，可以开始写新文章了");
  };

  // 确认清空文章
  const confirmClear = () => {
    if (markdown || title || summary || tags || coverImage) {
      if (window.confirm("确定要清空当前编辑的内容吗？此操作不可恢复。")) {
        clearArticleData();
      }
    } else {
      message.info("编辑器已经是空的了");
    }
  };

  // 处理状态变更
  const handleStatusChange = (checked) => {
    setStatus(checked ? "published" : "draft");
    message.info(`文章状态已设置为: ${checked ? "发布" : "草稿"}`);
  };

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
        status: status // 添加文章状态
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
            createdAt: new Date().toISOString(),
          }),
        });
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || '发布失败');
      }
      
      message.success(editingArticleId ? "文章更新成功" : "文章发布成功");
      
      // 清空编辑状态
      clearArticleData();
      
      // 操作成功后跳转到文章管理页面
      window.location.href = '/posts';
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
      {/* 文章标题输入和状态开关 */}
      <div className="flex items-end mb-4 space-x-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">文章标题</h3>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入文章标题"
            className="w-full"
            size="large"
          />
        </div>
        <div className="flex items-center mb-2">
          <Tooltip title={status === "published" ? "发布" : "草稿"}>
            <Space>
              <span className="text-gray-600 mr-2">状态:</span>
              <Switch
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                checked={status === "published"}
                onChange={handleStatusChange}
              />
              <span className={status === "published" ? "text-green-600" : "text-orange-500"}>
                {status === "published" ? "发布" : "草稿"}
              </span>
            </Space>
          </Tooltip>
        </div>
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

      {/* 操作按钮 - 添加清空按钮 */}
      <div className="flex justify-end space-x-4 mt-4">
        <Button 
          type="default" 
          icon={<ClearOutlined />}
          onClick={confirmClear}
        >
          清空编辑器
        </Button>
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
