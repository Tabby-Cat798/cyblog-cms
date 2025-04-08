import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 聚合查询，计算每篇文章的评论数
    const commentCounts = await db.collection('comments')
      .aggregate([
        {
          $group: {
            _id: '$postId',
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            articleId: '$_id',
            count: 1
          }
        }
      ])
      .toArray();
    
    // 返回评论数据
    return NextResponse.json(commentCounts);
    
  } catch (error) {
    console.error('获取评论计数失败:', error);
    return NextResponse.json(
      { error: '获取评论计数失败', message: error.message },
      { status: 500 }
    );
  }
} 