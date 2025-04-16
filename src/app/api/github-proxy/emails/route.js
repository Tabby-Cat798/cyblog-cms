import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
  try {
    // 从请求头中获取GitHub令牌
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('token ')) {
      return NextResponse.json({ error: '缺少授权令牌' }, { status: 401 });
    }
    
    const token = authHeader.replace('token ', '');
    
    // 使用令牌向GitHub API请求用户邮箱列表
    const response = await axios.get('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/json',
        'User-Agent': 'GitHub-Proxy-Service'
      }
    });
    
    // 返回GitHub的邮箱列表
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('获取GitHub用户邮箱失败:', error);
    return NextResponse.json(
      { error: '获取GitHub用户邮箱失败', message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}