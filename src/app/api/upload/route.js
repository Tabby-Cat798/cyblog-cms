import { NextResponse } from 'next/server';
import OSS from 'ali-oss';

// 创建OSS客户端
const client = new OSS({
  region: process.env.OSS_REGION, // 例如：'oss-cn-hangzhou'
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET
});

// OSS域名，用于构建永久URL
const OSS_DOMAIN = process.env.OSS_DOMAIN || `https://${process.env.OSS_BUCKET}.${process.env.OSS_REGION}.aliyuncs.com`;

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
      const result = await client.put(fileName, buffer, {
        headers: {
          // 设置文件的访问权限为公共读
          'x-oss-object-acl': 'public-read',
        }
      });

      console.log('OSS上传结果:', result);

      // 构建永久URL
      // 方式1: 使用OSS返回的URL（如果存在）
      let permanentUrl = result.url;
      
      // 方式2: 如果OSS没有返回URL或使用自定义域名，手动构建URL
      if (!permanentUrl) {
        permanentUrl = `${OSS_DOMAIN}/${fileName}`;
      }

      // 返回永久文件URL
      return NextResponse.json({
        success: true,
        url: permanentUrl,
        // 也可以返回签名URL作为备用
        signedUrl: client.signatureUrl(fileName, { expires: 60 * 60 * 24 * 365 }) // 设置为一年过期
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