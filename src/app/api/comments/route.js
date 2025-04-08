import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 获取评论列表，支持按文章ID筛选
export async function GET(request) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 构建查询条件
    let query = {};
    if (postId) {
      // 如果提供了文章ID，则按文章ID筛选
      try {
        query.postId = postId;
      } catch (err) {
        return NextResponse.json(
          { error: '无效的文章ID格式' },
          { status: 400 }
        );
      }
    }
    
    // 查询评论并按时间倒序排序
    const comments = await db.collection('comments')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // 返回评论数据
    return NextResponse.json(comments);
    
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { error: '获取评论失败', message: error.message },
      { status: 500 }
    );
  }
}

// 新增评论
export async function POST(request) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证必填字段
    if (!body.postId || !body.content) {
      return NextResponse.json(
        { error: '文章ID和评论内容为必填项' },
        { status: 400 }
      );
    }
    
    // 准备评论数据
    const commentData = {
      postId: body.postId,
      content: body.content,
      author: body.author || { name: '匿名用户' },
      status: body.status || 'pending', // 默认状态为待审核
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 插入评论
    const result = await db.collection('comments').insertOne(commentData);
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '评论已成功发布',
      commentId: result.insertedId,
    });
    
  } catch (error) {
    console.error('发布评论失败:', error);
    return NextResponse.json(
      { error: '发布评论失败', message: error.message },
      { status: 500 }
    );
  }
} 