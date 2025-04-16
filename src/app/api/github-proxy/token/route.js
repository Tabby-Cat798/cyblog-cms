import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request) {
  try {
    const body = await request.json();
    const { client_id, client_secret, code, redirect_uri } = body;
    
    // 验证必要参数
    if (!client_id || !client_secret || !code) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 向GitHub请求访问令牌
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id,
        client_secret,
        code,
        redirect_uri
      },
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    // 返回GitHub的响应结果
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('获取GitHub令牌失败:', error);
    return NextResponse.json(
      { error: '获取GitHub令牌失败', message: error.message },
      { status: error.response?.status || 500 }
    );
  }
}