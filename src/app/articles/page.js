"use client";
import React, { useState, useEffect } from "react";
import { Table, Button, message, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 加载文章列表
  const fetchArticles = async () => {
    console.log("开始获取文章列表...");
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();
      console.log("从API获取到的文章数据:", data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || "获取文章列表失败");
      }
      setArticles(data);
      console.log("文章数据已存入 state:", data);
    } catch (error) {
      console.error("获取文章列表失败", error);
      message.error(`获取文章列表失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("组件加载，开始初始化...");
    fetchArticles();
  }, []);

  // 删除文章
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "删除失败");
      }

      message.success("文章删除成功");
      fetchArticles(); // 重新加载文章列表
    } catch (error) {
      console.error("删除文章失败", error);
      message.error(`删除失败: ${error.message}`);
    }
  };

  // 编辑文章
  const handleEdit = (article) => {
    console.log("开始编辑文章，接收到的文章数据:", article);
    try {
      // 检查必要的字段是否存在
      if (!article._id || !article.title || !article.content) {
        console.error("文章数据不完整:", {
          hasId: !!article._id,
          hasTitle: !!article.title,
          hasContent: !!article.content
        });
        throw new Error("文章数据不完整");
      }

      console.log("准备存入 sessionStorage 的数据:", {
        content: article.content?.substring(0, 50) + "...",
        title: article.title,
        summary: article.summary,
        tags: article.tags,
        id: article._id
      });

      // 将文章数据存入 sessionStorage
      sessionStorage.setItem("markdownContent", article.content || "");
      sessionStorage.setItem("articleTitle", article.title || "");
      sessionStorage.setItem("articleSummary", article.summary || "");
      sessionStorage.setItem("articleTags", (article.tags || []).join(","));
      sessionStorage.setItem("editingArticleId", article._id);

      // 验证数据是否成功存入
      const savedContent = sessionStorage.getItem("markdownContent");
      const savedTitle = sessionStorage.getItem("articleTitle");
      const savedId = sessionStorage.getItem("editingArticleId");

      console.log("验证 sessionStorage 中的数据:", {
        hasContent: !!savedContent,
        contentLength: savedContent?.length,
        hasTitle: !!savedTitle,
        title: savedTitle,
        hasId: !!savedId,
        id: savedId
      });

      if (!savedContent || !savedTitle || !savedId) {
        throw new Error("数据保存失败");
      }

      console.log("数据验证通过，准备跳转到编辑页面");
      
      // 跳转到写文章页面
      router.push("/write");
    } catch (error) {
      console.error("保存文章数据失败:", error);
      message.error(`保存文章数据失败: ${error.message}`);
    }
  };

  const columns = [
    {
      title: "标题",
      dataIndex: "title",
      key: "title",
      render: (text, record) => {
        console.log("渲染标题列，当前行数据:", record);
        return (
          <a href={`/articles/${record._id}`} className="text-blue-600 hover:text-blue-800">
            {text}
          </a>
        );
      },
    },
    {
      title: "发布时间",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: "浏览量",
      dataIndex: "viewCount",
      key: "viewCount",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => {
        console.log("渲染操作列，当前行数据:", record);
        return (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                console.log("编辑按钮被点击");
                handleEdit(record);
              }}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定要删除这篇文章吗？"
              onConfirm={() => handleDelete(record._id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="text" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Button type="primary" onClick={() => router.push("/write")}>
          写文章
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={articles}
        rowKey="_id"
        loading={loading}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        scroll={{ x: true }}
      />
    </div>
  );
};

export default ArticlesPage; 