import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// 获取系统设置
export async function GET() {
  try {
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 获取系统设置，如果不存在则创建默认设置
    let settings = await db.collection('settings').findOne({});
    
    // 如果没有设置记录，则创建默认设置
    if (!settings) {
      const defaultSettings = {
        articles: {
          defaultShowViewCount: true,
          defaultShowCommentCount: true,
          defaultAllowComments: true
        }
      };
      
      await db.collection('settings').insertOne(defaultSettings);
      settings = defaultSettings;
    }
    
    // 返回系统设置
    return NextResponse.json(settings);
    
  } catch (error) {
    console.error('获取系统设置失败:', error);
    return NextResponse.json(
      { error: '获取系统设置失败', message: error.message },
      { status: 500 }
    );
  }
}

// 更新系统设置
export async function POST(request) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证文章设置字段
    if (!body.articles) {
      return NextResponse.json(
        { error: '缺少文章设置字段' },
        { status: 400 }
      );
    }
    
    // 确保articles字段中包含所需的设置项
    const { articles } = body;
    const requiredSettings = ['defaultShowViewCount', 'defaultShowCommentCount', 'defaultAllowComments'];
    
    for (const setting of requiredSettings) {
      if (typeof articles[setting] !== 'boolean') {
        return NextResponse.json(
          { error: `文章设置中缺少${setting}字段或类型不正确` },
          { status: 400 }
        );
      }
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 准备更新的数据
    const updateData = {
      articles: {
        defaultShowViewCount: articles.defaultShowViewCount,
        defaultShowCommentCount: articles.defaultShowCommentCount,
        defaultAllowComments: articles.defaultAllowComments
      }
    };
    
    // 更新系统设置，如果不存在则创建
    const result = await db.collection('settings').updateOne(
      {}, // 空查询条件，更新第一条记录
      { $set: updateData },
      { upsert: true } // 如果不存在则创建
    );
    
    // 返回成功响应
    return NextResponse.json({
      success: true,
      message: '系统设置已更新',
      ...updateData
    });
    
  } catch (error) {
    console.error('更新系统设置失败:', error);
    return NextResponse.json(
      { error: '更新系统设置失败', message: error.message },
      { status: 500 }
    );
  }
} 