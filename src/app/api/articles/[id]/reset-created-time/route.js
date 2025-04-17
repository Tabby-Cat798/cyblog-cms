import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidateFrontend } from '@/lib/revalidate';

// 重置文章创建时间
export async function POST(request, props) {
  const params = await props.params;
  try {
    const client = await clientPromise;
    const db = client.db('blogs');
    const { id } = params;
    
    // 检查ID格式是否有效
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: '无效的文章ID格式' },
        { status: 400 }
      );
    }
    
    // 获取北京时间
    const now = new Date();
    const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
    
    // 更新文章创建时间
    const result = await db.collection('articles').updateOne(
      { _id: new ObjectId(id) },
      { $set: { createdAt: beijingTime } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '文章不存在' },
        { status: 404 }
      );
    }
    
    // 重新验证首页
    await revalidateFrontend({ 
      path: '/',
      postId: null 
    });
    
    // 重新验证文章列表页
    await revalidateFrontend({ 
      path: '/posts',
      postId: null 
    });
    
    // 重新验证文章详情页
    await revalidateFrontend({ 
      path: `/posts/${id}`,
      postId: id 
    });

    return NextResponse.json({ 
      message: '文章创建时间已重置',
      newCreatedAt: beijingTime
    });
  } catch (error) {
    console.error('重置文章创建时间失败:', error);
    return NextResponse.json(
      { error: '重置文章创建时间失败', message: error.message },
      { status: 500 }
    );
  }
} 