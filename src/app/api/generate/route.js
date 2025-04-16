import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { content, title } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    // 构建提示词，如果有标题，则包含标题信息
    const promptContent = title 
      ? `标题：${title}\n\n内容：${content}`
      : content;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "你是一个帮助生成文章标签和摘要的助手。" },
          { role: "user", content: `根据以下博客文章${title ? '的标题和内容' : ''}生成3-5个标签以及一段简洁、有趣的摘要，适合展示在博客首页。摘要应首先提及标题中的重点，比如公司名，或者所讲的某个技术，具有俏皮、亲切的风格，能够吸引读者点击阅读全文，但注意不要表达主观情绪，不要包含你我的称谓。请在30字内传达文章的核心内容，同时保持轻松幽默的语气。\n\n请按照以下格式返回结果（不要包含"标签："和"摘要："这样的前缀）：\n标签1，标签2，标签3；摘要内容\n\n${promptContent}` },
        ],
        max_tokens: 100,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || '生成失败');
    }

    return NextResponse.json({
      success: true,
      result: data.choices[0].message.content.trim()
    });
    
  } catch (error) {
    console.error('生成摘要和标签失败:', error);
    return NextResponse.json(
      { error: '生成失败', message: error.message },
      { status: 500 }
    );
  }
} 