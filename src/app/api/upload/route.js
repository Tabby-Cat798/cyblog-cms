// src/app/api/upload/route.js
import { NextResponse } from "next/server";
import { unstable_parseMultipartFormData, unstable_createFileUploadHandler } from "next/server";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  // 定义上传目录，确保目录存在
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  // 创建上传处理器，配置保存目录，可选 filename 参数用于自定义文件名
  const uploadHandler = unstable_createFileUploadHandler({
    directory: uploadDir,
    // 可选：自定义文件名，比如：
    // filename: (filename) => `${Date.now()}-${filename}`,
  });

  // 解析 multipart/form-data 请求，返回一个 FormData 对象
  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  
  // 假设上传字段名为 "file"
  const file = formData.get("file");
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // file 对象包含 filename 属性，即保存后的文件名
  const fileUrl = `/uploads/${file.filename}`;
  return NextResponse.json({ url: fileUrl }, { status: 200 });
}
