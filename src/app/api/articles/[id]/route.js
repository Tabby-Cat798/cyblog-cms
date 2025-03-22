import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 获取单篇文章
export async function GET(request, { params }) {
  try {
    const id = params.id;
    
    // 验证ObjectId格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的文章ID格式' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 查找文章
    const article = await db.collection('articles').findOne({
      _id: new ObjectId(id)
    });
    
    // 如果文章不存在
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 更新阅读量（如果需要的话）
    await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      { $inc: { viewCount: 1 } }
    );
    
    // 更新阅读量后的文章对象
    article.viewCount = (article.viewCount || 0) + 1;
    
    // 返回文章
    return NextResponse.json(article);
    
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json(
      { error: '获取文章详情失败', message: error.message },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    
    // 验证ObjectId格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的文章ID格式' },
        { status: 400 }
      );
    }
    
    // 解析请求体
    const body = await request.json();
    
    // 验证必填字段
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }
    
    // 获取北京时间
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    
    // 准备更新数据
    const updateData = {
      title: body.title,
      summary: body.summary || '',
      tags: body.tags || [],
      content: body.content,
      status: body.status || 'published',
      updatedAt: beijingTime
    };
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 查找并更新文章
    const result = await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    // 如果文章不存在
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '文章更新成功'
    });
    
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json(
      { error: '更新文章失败', message: error.message },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
    // 验证ObjectId格式
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的文章ID格式' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 删除文章
    const result = await db.collection('articles').deleteOne({
      _id: new ObjectId(id)
    });
    
    // 如果文章不存在
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '文章删除成功'
    });
    
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败', message: error.message },
      { status: 500 }
    );
  }
}