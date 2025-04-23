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
  FileImageOutlined,
  HistoryOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import MarkdownRenderer from './MarkdownRenderer';
import '../../styles/markdown-styles.css'; // 导入您的自定义Markdown样式

// 自定义OpenAI图标组件
const OpenAIIcon = () => (
  <span className="anticon">
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  </span>
);

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
  initialType = 'technology',
  editingArticleId = null
}) => {
  // 状态管理
  const [markdown, setMarkdown] = useState(initialValue);
  const [title, setTitle] = useState(initialTitle);
  const [summary, setSummary] = useState(initialSummary);
  const [tags, setTags] = useState(initialTags);
  const [status, setStatus] = useState(initialStatus);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [type, setType] = useState(initialType);
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
    const isNewArticle = urlParams.get('new') === 'true';
    
    if (isNewArticle) {
      clearArticleData();
      initialLoadDone.current = true;
      return;
    }
    
    // 获取localStorage中已保存的数据
    const savedMarkdown = localStorage.getItem("markdownContent");
    const savedTitle = localStorage.getItem("articleTitle");
    const savedSummary = localStorage.getItem("articleSummary");
    const savedTags = localStorage.getItem("articleTags");
    const savedCoverImage = localStorage.getItem("articleCoverImage");
    const savedArticleId = localStorage.getItem("editingArticleId");
    const savedStatus = localStorage.getItem("articleStatus");
    const savedType = localStorage.getItem("articleType");
    
    // 情况1: 正在编辑已有文章，且localStorage中也是同一篇文章的内容
    if (editingArticleId && savedArticleId === editingArticleId && savedMarkdown) {
      // 使用localStorage中保存的编辑状态，这样可以恢复上次未保存的编辑
      setMarkdown(savedMarkdown);
      setTitle(savedTitle || initialTitle);
      setSummary(savedSummary || initialSummary);
      setTags(savedTags || initialTags);
      setCoverImage(savedCoverImage || initialCoverImage);
      setStatus(savedStatus || initialStatus);
      setType(savedType || initialType);
      setEditingId(editingArticleId);
    }
    // 情况2: 正在编辑已有文章，但localStorage中是其他文章或为空
    else if (editingArticleId) {
      // 使用从API获取的数据初始化编辑器
      setMarkdown(initialValue);
      setTitle(initialTitle);
      setSummary(initialSummary);
      setTags(initialTags);
      setCoverImage(initialCoverImage);
      setStatus(initialStatus);
      setType(initialType);
      setEditingId(editingArticleId);
      
      // 更新localStorage，保存这篇文章的初始状态
      localStorage.setItem("markdownContent", initialValue || "");
      localStorage.setItem("articleTitle", initialTitle || "");
      localStorage.setItem("articleSummary", initialSummary || "");
      localStorage.setItem("articleTags", initialTags || "");
      localStorage.setItem("articleCoverImage", initialCoverImage || "");
      localStorage.setItem("articleStatus", initialStatus || "published");
      localStorage.setItem("articleType", initialType || "technology");
      localStorage.setItem("editingArticleId", editingArticleId);
    }
    // 情况3: 创建新文章，localStorage中有未保存的内容
    else if (!editingArticleId && savedMarkdown) {
      // 恢复未保存的草稿
      setMarkdown(savedMarkdown);
      setTitle(savedTitle || "");
      setSummary(savedSummary || "");
      setTags(savedTags || "");
      setCoverImage(savedCoverImage || "");
      setStatus(savedStatus || "published");
      setType(savedType || "technology");
      setEditingId(savedArticleId); // 如果localStorage有ID，恢复为编辑模式
    }
    // 情况4: 全新的文章创建，localStorage中也没有内容
    else {
      // 初始化空编辑器
      setMarkdown("");
      setTitle("");
      setSummary("");
      setTags("");
      setCoverImage("");
      setStatus("published");
      setType("technology");
      setEditingId(null);
    }
    
    initialLoadDone.current = true;
  }, [initialValue, initialTitle, initialSummary, initialTags, initialCoverImage, initialStatus, initialType, editingArticleId]);

  // 保存内容到本地存储
  useEffect(() => {
    if (!initialLoadDone.current) return;
    
    localStorage.setItem("markdownContent", markdown);
    localStorage.setItem("articleTitle", title);
    localStorage.setItem("articleSummary", summary);
    localStorage.setItem("articleTags", tags);
    localStorage.setItem("articleCoverImage", coverImage);
    localStorage.setItem("articleStatus", status);
    localStorage.setItem("articleType", type);
    if (editingId) {
      localStorage.setItem("editingArticleId", editingId);
    }
    
    // 内容变化时设置未保存状态
    setHasUnsavedChanges(true);
  }, [markdown, title, summary, tags, coverImage, status, type, editingId]);
  
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
        ? tags.split(/[,，]/).map(tag => tag.trim()).filter(tag => tag)
        : [];
        
      const articleData = {
        title,
        content: markdown,
        summary: summary || '',
        tags: tagsArray,
        status,
        coverImage: coverImage || '',
        type,
      };
      
      // 如果有编辑中的文章ID，则更新文章而非创建新文章
      if (editingId) {
        articleData.id = editingId;
      }
      
      // 调用父组件提供的保存方法
      if (onSave) {
        const result = await onSave(articleData);
        
        // 如果是新文章，保存返回的ID用于后续编辑
        if (!editingId && result && result.articleId) {
          setEditingId(result.articleId);
          localStorage.setItem("editingArticleId", result.articleId);
        }
        
        // 更新未保存状态
        setHasUnsavedChanges(false);
        
        message.success(`文章${editingId ? '更新' : '发布'}成功`);
      }
    } catch (error) {
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
    setType("technology"); // 重置为默认文章类型
    
    // 清空本地存储
    localStorage.removeItem("markdownContent");
    localStorage.removeItem("articleTitle");
    localStorage.removeItem("articleSummary");
    localStorage.removeItem("articleTags");
    localStorage.removeItem("articleCoverImage");
    localStorage.removeItem("editingArticleId");
    localStorage.removeItem("articleStatus");
    localStorage.removeItem("articleType"); // 清除文章类型
    
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
      message.loading('正在生成摘要和标签...', 0);
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: markdown,
          title: title.trim() || undefined // 如果标题存在则一并发送
        }),
      });

      // 关闭加载提示
      message.destroy();

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || '生成失败');
      }

      const result = data.result;
      
      // 需要正确解析返回结果，格式是"标签;摘要"或"标签；摘要"，即先标签后摘要
      if (result.includes(';') || result.includes('；')) {
        // 同时处理中文分号和英文分号
        let generatedTags, generatedSummary;
        
        if (result.includes('；')) {
          [generatedTags, generatedSummary] = result.split('；', 2).map(item => item.trim());
        } else {
          [generatedTags, generatedSummary] = result.split(';', 2).map(item => item.trim());
        }
        
        // 移除可能的"标签："前缀
        generatedTags = generatedTags.replace(/^(标签[:：]\s*)/i, '');
        
        // 移除可能的"摘要："前缀
        generatedSummary = generatedSummary.replace(/^(摘要[:：]\s*)/i, '');
        
        // 确保标签中不包含任何分号
        if (generatedTags.includes(';') || generatedTags.includes('；')) {
          generatedTags = generatedTags.replace(/;|；/g, ',');
        }
        
        // 标准化标签分隔符为英文逗号
        generatedTags = generatedTags.replace(/，/g, ',');
        
        // 避免标签结尾有逗号
        if (generatedTags.endsWith(',')) {
          generatedTags = generatedTags.slice(0, -1);
        }
        
        // 设置到表单
        setTags(generatedTags);
        setSummary(generatedSummary);
      } else {
        // 如果返回格式不包含分号，尝试其他方式解析
        // 假设返回的是JSON字符串或包含明确标记的文本
        if (result.includes('标签') && result.includes('摘要')) {
          // 尝试提取带标记的内容
          const tagsMatch = result.match(/标签[：:]\s*(.*?)(?=\s*摘要[：:]|$)/i);
          const summaryMatch = result.match(/摘要[：:]\s*(.*?)$/i);
          
          if (tagsMatch && tagsMatch[1]) setTags(tagsMatch[1].trim());
          if (summaryMatch && summaryMatch[1]) setSummary(summaryMatch[1].trim());
        } else {
          // 无法解析，可能需要单独处理
          message.warning('无法正确解析生成的内容');
        }
      }
      
      message.success("摘要和标签生成成功");
    } catch (error) {
      message.error(`生成失败: ${error.message}`);
      
      // 备用方案：如果API调用失败，使用原来的简单算法生成
      try {
        // 取文章前100个字符作为摘要
        if (!summary) {
          const plainText = markdown.replace(/[#*`_[\]()>]/g, '');
          const autoSummary = plainText.substring(0, 100).trim() + (plainText.length > 100 ? '...' : '');
          setSummary(autoSummary);
        }
        
        // 找出内容中的关键词作为标签
        if (!tags) {
          const contentWords = markdown.toLowerCase()
            .replace(/[#*`_[\]()>]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !['this', 'that', 'than', 'with', 'from', 'have', 'what'].includes(word));
          
          const wordFreq = {};
          contentWords.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          });
          
          const tagCandidates = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([word]) => word);
          
          if (tagCandidates.length > 0) {
            setTags(tagCandidates.join(','));
          }
        }
        
        message.info('已使用备用方法生成摘要和标签');
      } catch (backupError) {
        message.error('自动生成失败，请手动填写');
      }
    }
  };
  
  // 预览文章
  const handlePreview = () => {
    setPreviewVisible(true);
  };
  
  // 处理重置创建时间
  const handleResetCreatedTime = async () => {
    if (!editingId) {
      message.warning('请先保存文章，才能重置创建时间');
      return;
    }
    
    Modal.confirm({
      title: '确认重置创建时间',
      content: '确定要将此文章的创建时间重置为当前时间吗？此操作不可撤销。',
      okText: '确定重置',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await fetch(`/api/articles/${editingId}/reset-created-time`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.error || data.message || '重置创建时间失败');
          }
          
          message.success('文章创建时间已重置为当前时间');
        } catch (error) {
          message.error(`重置失败: ${error.message}`);
        }
      }
    });
  };
  
  // 处理类型变更
  const handleTypeChange = (value) => {
    setType(value);
    message.info(`文章类型已设置为: ${value}`);
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

      {/* 文章类型选择和封面图片URL输入 */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">文章类型</h3>
          <Select
            value={type}
            onChange={handleTypeChange}
            className="w-full"
            placeholder="请选择文章类型"
            suffixIcon={<AppstoreOutlined />}
          >
            <Option value="technology">软件技术</Option>
            <Option value="interview">面试经验</Option>
            <Option value="daily">日常生活</Option>
            <Option value="algorithm">LeetCode</Option>
          </Select>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">封面图片URL</h3>
          <Input
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="请输入封面图片的URL地址"
            className="w-full"
          />
        </div>
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
        {editingId && (
          <Button 
            onClick={handleResetCreatedTime}
            icon={<HistoryOutlined />}
          >
            重置创建时间
          </Button>
        )}
        <Button 
          onClick={generateSummaryAndTags}
          icon={<OpenAIIcon />} // 使用自定义的OpenAI图标
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