import { NextResponse } from 'next/server';
import OSS from 'ali-oss';

// 创建OSS客户端
const client = new OSS({
  region: process.env.OSS_REGION, // 例如：'oss-cn-hangzhou'
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET
});

export async function POST(request) {
  try {
    // 验证环境变量
    if (!process.env.OSS_ACCESS_KEY_ID || !process.env.OSS_ACCESS_KEY_SECRET) {
      throw new Error('OSS配置信息不完整，请检查环境变量');
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { error: '没有找到文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只支持上传图片文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（例如限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超过5MB' },
        { status: 400 }
      );
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `images/${timestamp}-${randomString}-${file.name}`;

    // 将文件转换为Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      // 上传到OSS
      const result = await client.put(fileName, buffer);

      // 使用OSS SDK的signatureUrl方法获取可访问的URL
      const url = client.signatureUrl(fileName);

      // 返回文件URL
      return NextResponse.json({
        success: true,
        url: url
      });
    } catch (ossError) {
      console.error('OSS上传错误:', ossError);
      return NextResponse.json(
        { 
          error: 'OSS上传失败', 
          message: ossError.message,
          code: ossError.code,
          requestId: ossError.requestId
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json(
      { 
        error: '上传文件失败', 
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 