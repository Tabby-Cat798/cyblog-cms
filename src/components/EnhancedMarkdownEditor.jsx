import React, { useState, useEffect, useRef } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Button, Input, Switch, Select, Space, Upload, message, Tooltip, Modal } from 'antd';
import { 
  UploadOutlined, 
  SaveOutlined, 
  ClearOutlined, 
  CheckOutlined, 
  CloseOutlined,
  TagsOutlined,
  FileImageOutlined
} from '@ant-design/icons';
import MarkdownRenderer from './MarkdownRenderer';
import '../../styles/markdown-styles.css'; // 导入您的自定义Markdown样式

const { TextArea } = Input;
const { Option } = Select;

const EnhancedMarkdownEditor = ({ 
  initialValue = '', 
  onSave,
  initialTitle = '',
  initialSummary = '',
  initialTags = '',
  initialStatus = 'published',
  initialCoverImage = '',
  editingArticleId = null
}) => {
  // 状态管理
  const [markdown, setMarkdown] = useState(initialValue);
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [tags, setTags] = useState(initialTags);
  const [status, setStatus] = useState(initialStatus);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editingId, setEditingId] = useState(editingArticleId);
  
  // localStorage 加载和保存相关
  const initialLoadDone = useRef(false);
  
  // 变更检测
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
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
    
    // 如果提供了初始属性值，优先使用这些值
    if (initialValue || initialTitle || initialSummary || initialTags || initialCoverImage || editingArticleId) {
      // 使用传入的初始值
      setMarkdown(initialValue);
      setTitle(initialTitle);
      setSummary(initialSummary);
      setTags(initialTags);
      setCoverImage(initialCoverImage);
      setStatus(initialStatus);
      setEditingId(editingArticleId);
      
      // 同时也更新localStorage
      localStorage.setItem("markdownContent", initialValue);
      localStorage.setItem("articleTitle", initialTitle);
      localStorage.setItem("articleSummary", initialSummary);
      localStorage.setItem("articleTags", initialTags);
      localStorage.setItem("articleCoverImage", initialCoverImage);
      localStorage.setItem("articleStatus", initialStatus);
      if (editingArticleId) {
        localStorage.setItem("editingArticleId", editingArticleId);
      }
    } else {
      // 否则尝试从localStorage中恢复
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
      if (savedArticleId) setEditingId(savedArticleId);
      if (savedStatus) setStatus(savedStatus);
    }
    
    initialLoadDone.current = true;
  }, [initialValue, initialTitle, initialSummary, initialTags, initialCoverImage, initialStatus, editingArticleId]);

  // 保存内容到本地存储
  useEffect(() => {
    if (!initialLoadDone.current) return;
    
    localStorage.setItem("markdownContent", markdown);
    localStorage.setItem("articleTitle", title);
    localStorage.setItem("articleSummary", summary);
    localStorage.setItem("articleTags", tags);
    localStorage.setItem("articleCoverImage", coverImage);
    localStorage.setItem("articleStatus", status);
    if (editingId) {
      localStorage.setItem("editingArticleId", editingId);
    }
    
    // 内容变化时设置未保存状态
    setHasUnsavedChanges(true);
  }, [markdown, title, summary, tags, coverImage, status, editingId]);
  
  // 监听内容变化设置未保存状态
  useEffect(() => {
    if (markdown !== initialValue) {
      setHasUnsavedChanges(true);
    }
  }, [markdown, initialValue]);
  
  // 保存前检查
  const validateForm = () => {
    if (!title.trim()) {
      message.error('请输入文章标题');
      return false;
    }
    
    if (!markdown.trim()) {
      message.error('请输入文章内容');
      return false;
    }
    
    return true;
  };
  
  // 发布文章
  const publishArticle = async () => {
    if (!validateForm()) return;
    
    try {
      setPublishing(true);
      
      const tagsArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
        
      const articleData = {
        title,
        content: markdown,
        summary: summary || '',
        tags: tagsArray,
        status,
        coverImage: coverImage || '',
      };
      
      // 如果有编辑中的文章ID，则更新文章而非创建新文章
      if (editingId) {
        articleData.id = editingId;
      }
      
      // 调用父组件提供的保存方法
      if (onSave) {
        await onSave(articleData);
        setHasUnsavedChanges(false);
        message.success(`文章${editingId ? '更新' : '发布'}成功`);
        
        // 清空编辑状态
        clearArticleData();
      }
    } catch (error) {
      console.error("发布文章失败", error);
      message.error(`发布失败: ${error.message}`);
    } finally {
      setPublishing(false);
    }
  };
  
  // 清空文章数据
  const clearArticleData = () => {
    // 清空组件状态
    setMarkdown("");
    setTitle("");
    setSummary("");
    setTags("");
    setCoverImage("");
    setEditingId(null);
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
  
  // 确认清空编辑器
  const confirmClear = () => {
    if (markdown.trim() || title.trim() || summary.trim() || tags.trim() || coverImage.trim()) {
      Modal.confirm({
        title: '确认清空编辑器？',
        content: '此操作将清空当前编辑器中的所有内容，且不可恢复。',
        onOk: () => {
          clearArticleData();
        },
      });
    } else {
      message.info("编辑器已经是空的了");
    }
  };
  
  // 处理状态切换
  const handleStatusChange = (checked) => {
    setStatus(checked ? 'published' : 'draft');
    message.info(`文章状态已设置为: ${checked ? "发布" : "草稿"}`);
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

      // 在光标位置插入图片链接
      const imageMarkdown = `![${file.name}](${data.url})`;
      
      // 基于当前光标位置插入
      // 注意：此处使用MDEditor的API，而非直接修改状态
      const newValue = insertAtCursor(markdown, imageMarkdown);
      setMarkdown(newValue);

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
  
  // 在光标位置插入文本
  const insertAtCursor = (text, insertion) => {
    // 简单实现：追加到文本末尾
    // 注意：复杂的光标位置插入需要结合editorRef实现
    return text + '\n' + insertion;
  };
  
  // 处理自动生成摘要和标签
  const generateSummaryAndTags = async () => {
    if (!markdown.trim()) {
      message.warning('请先输入文章内容以生成摘要和标签');
      return;
    }
    
    try {
      // 创建一个简单的自动摘要
      if (!summary) {
        // 取文章前100个字符(不包含Markdown语法)作为摘要
        const plainText = markdown.replace(/[#*`_[\]()>]/g, '');
        const autoSummary = plainText.substring(0, 100).trim() + (plainText.length > 100 ? '...' : '');
        setSummary(autoSummary);
      }
      
      // 如果没有标签，尝试从文章内容提取
      if (!tags) {
        // 找出内容中的关键词
        const contentWords = markdown.toLowerCase()
          .replace(/[#*`_[\]()>]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3)
          .filter(word => !['this', 'that', 'than', 'with', 'from', 'have', 'what'].includes(word));
        
        // 计算词频
        const wordFreq = {};
        contentWords.forEach(word => {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        });
        
        // 获取频率最高的前3个词
        const tagCandidates = Object.entries(wordFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([word]) => word);
        
        if (tagCandidates.length > 0) {
          setTags(tagCandidates.join(','));
        }
      }
      
      message.success('已自动生成摘要和标签');
    } catch (error) {
      console.error('生成摘要和标签失败:', error);
      message.error('自动生成失败，请手动填写');
    }
  };
  
  // 预览文章
  const handlePreview = () => {
    setPreviewVisible(true);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {/* 文章标题输入和状态开关 */}
      <div className="flex items-end space-x-4">
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
      <div>
        <h3 className="text-lg font-semibold mb-2">封面图片URL</h3>
        <Input
          value={coverImage}
          onChange={(e) => setCoverImage(e.target.value)}
          placeholder="请输入封面图片的URL地址"
          className="w-full"
        />
      </div>
      
      {/* 编辑器工具栏 */}
      <div className="flex flex-wrap gap-2">
        <Upload
          showUploadList={false}
          beforeUpload={handleImageUpload}
          accept="image/*"
        >
          <Button 
            icon={<UploadOutlined />} 
            loading={uploading}
          >
            上传图片
          </Button>
        </Upload>
        
        <Button 
          icon={<FileImageOutlined />}
          onClick={handlePreview}
        >
          预览
        </Button>
        
        <Button 
          icon={<ClearOutlined />}
          onClick={confirmClear}
        >
          清空
        </Button>
        
        <div className="ml-auto">
          <Switch 
            checkedChildren="暗色" 
            unCheckedChildren="亮色"
            checked={darkMode}
            onChange={setDarkMode}
          />
        </div>
      </div>

      {/* Markdown编辑器 */}
      <div className="h-[500px] overflow-auto">
        <MDEditor
          value={markdown}
          onChange={setMarkdown}
          height={500}
          preview="edit"
          hideToolbar={false}
          enableScroll={true}
          visibleDragbar={true}
          textareaProps={{
            placeholder: '请输入 Markdown 格式的文章内容...',
          }}
          data-color-mode={darkMode ? 'dark' : 'light'}
        />
      </div>

      {/* 摘要和标签输入（在同一行） */}
      <div className="flex space-x-4">
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
            suffix={<TagsOutlined />}
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-4 mt-4">
        <Button 
          onClick={generateSummaryAndTags}
        >
          生成摘要和标签
        </Button>
        <Button 
          type="primary" 
          icon={<SaveOutlined />}
          onClick={publishArticle}
          loading={publishing}
        >
          {editingId ? "更新文章" : "发布文章"}
        </Button>
      </div>
      
      {/* 全屏预览模态框 */}
      <Modal
        title="文章预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div className="p-6 max-h-[70vh] overflow-auto bg-white dark:bg-gray-800 rounded-lg">
          <h1 className="text-2xl font-bold mb-4">{title || '无标题'}</h1>
          <div className="border-b border-gray-200 mb-4 pb-2">
            <span className="text-gray-500 text-sm">
              标签: {tags || '无'}
            </span>
          </div>
          <MarkdownRenderer content={markdown} />
        </div>
      </Modal>
    </div>
  );
};

export default EnhancedMarkdownEditor; 