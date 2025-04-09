import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

// 更新用户头像
export async function POST(request) {
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 验证ObjectId格式
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: '无效的用户ID格式' },
        { status: 400 }
      );
    }
    
    // 解析请求数据
    const body = await request.json();
    const { avatarUrl } = body;
    
    if (!avatarUrl) {
      return NextResponse.json(
        { error: '头像URL不能为空' },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 更新用户头像，同时更新avatar和image字段以保持兼容性
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          avatar: avatarUrl,
          image: avatarUrl,
          updatedAt: new Date()
        } 
      }
    );
    
    // 如果用户不存在
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    // 获取更新后的用户信息
    const updatedUser = await db.collection('users').findOne({
      _id: new ObjectId(userId)
    });
    
    // 返回更新后的用户资料（不包括密码）
    const { password, ...userWithoutPassword } = updatedUser;
    
    // 构建用户资料响应
    const userProfile = {
      id: updatedUser._id.toString(),
      name: updatedUser.name || updatedUser.username || updatedUser.email.split('@')[0],
      email: updatedUser.email,
      image: updatedUser.avatar || updatedUser.image || null,
      role: updatedUser.role || updatedUser.permission || 'user'
    };
    
    return NextResponse.json({
      success: true,
      message: '头像更新成功',
      user: userProfile
    });
    
  } catch (error) {
    console.error('更新头像失败:', error);
    return NextResponse.json(
      { error: '更新头像失败', message: error.message },
      { status: 500 }
    );
  }
} 