import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { cookies } from 'next/headers';

// 获取当前登录用户的详细信息
export async function GET(request) {
  console.log("---------- 用户资料API被调用 ----------");
  
  try {
    // 获取当前会话
    const session = await getServerSession(authOptions);
    console.log("NextAuth会话:", session ? "存在" : "不存在");
    
    if (session && session.user) {
      console.log("会话用户信息:", {
        id: session.user.id || "未设置",
        email: session.user.email,
        provider: session.user.provider
      });
    }
    
    let userId = null;
    
    // 方法1: 从NextAuth会话获取用户ID
    if (session && session.user && session.user.id) {
      userId = session.user.id;
      console.log("从NextAuth会话获取用户ID:", userId);
    } 
    // 方法2: 从cookies获取用户ID (用于自定义认证)
    else {
      const cookieStore = cookies();
      const cookieUserId = cookieStore.get('user_id')?.value;
      
      if (cookieUserId) {
        userId = cookieUserId;
        console.log("从cookies获取用户ID:", userId);
      }
    }
    
    // 如果无法获取用户ID
    if (!userId) {
      console.log("无法获取用户ID，认证失败");
      return NextResponse.json(
        { error: '未登录或会话已过期' },
        { status: 401 }
      );
    }
    
    // 验证ObjectId格式
    let objectId;
    try {
      if (!ObjectId.isValid(userId)) {
        console.error("无效的用户ID格式:", userId);
        return NextResponse.json(
          { error: '无效的用户ID格式', userId },
          { status: 400 }
        );
      }
      objectId = new ObjectId(userId);
    } catch (error) {
      console.error("转换ObjectId失败:", error, "userId:", userId);
      return NextResponse.json(
        { error: '无效的用户ID格式', message: error.message, userId },
        { status: 400 }
      );
    }
    
    // 连接到MongoDB
    const client = await clientPromise;
    const db = client.db('blogs');
    
    // 尝试通过ID查找用户
    const userById = await db.collection('users').findOne({
      _id: objectId
    });
    
    // 如果通过ID找不到用户，尝试通过邮箱查找
    let user = userById;
    if (!user && session?.user?.email) {
      console.log("通过ID未找到用户，尝试通过邮箱查找:", session.user.email);
      user = await db.collection('users').findOne({
        email: session.user.email
      });
      
      if (user) {
        console.log("通过邮箱找到用户，ID:", user._id.toString());
      }
    }
    
    // 如果用户不存在
    if (!user) {
      console.log("用户不存在，ID:", userId);
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    
    console.log("用户资料获取成功:", user.email);
    
    // 返回用户信息（不包括密码）
    const { password, ...userWithoutPassword } = user;
    
    // 确保返回用户字段包含必要信息
    const userProfile = {
      id: user._id.toString(),
      name: user.name || user.username || user.email.split('@')[0],
      email: user.email,
      image: user.avatar || null,
      role: user.role || user.permission || 'user'
    };
    
    console.log("返回用户资料:", {
      id: userProfile.id,
      name: userProfile.name,
      email: userProfile.email,
      hasAvatar: !!user.avatar,
      role: userProfile.role
    });
    
    return NextResponse.json(userProfile);
    
  } catch (error) {
    console.error('获取用户资料失败:', error);
    return NextResponse.json(
      { error: '获取用户资料失败', message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
} 