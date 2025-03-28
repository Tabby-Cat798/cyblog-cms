import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// 获取单篇文章
export async function GET(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db('cyblog');
    const { id } = params;
    
    const article = await db.collection('articles').findOne({
      _id: new ObjectId(id)
    });
    
    if (!article) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('获取文章失败:', error);
    return NextResponse.json(
      { error: '获取文章失败' },
      { status: 500 }
    );
  }
}

// 更新文章
export async function PUT(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db('cyblog');
    const { id } = params;
    const body = await request.json();
    
    // 验证必填字段
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: '标题和内容不能为空' },
        { status: 400 }
      );
    }
    
    // 更新文章
    const result = await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          title: body.title,
          content: body.content,
          summary: body.summary || '',
          tags: body.tags || [],
          updatedAt: new Date().toISOString(),
        },
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: '文章更新成功' });
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json(
      { error: '更新文章失败' },
      { status: 500 }
    );
  }
}

// 删除文章
export async function DELETE(request, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db('cyblog');
    const { id } = params;
    
    const result = await db.collection('articles').deleteOne({
      _id: new ObjectId(id)
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: '文章删除成功' });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json(
      { error: '删除文章失败' },
      { status: 500 }
    );
  }
}