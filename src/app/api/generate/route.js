import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { content } = await request.json();
    
    if (!content) {
      return NextResponse.json(
        { error: '内容不能为空' },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "你是一个帮助生成文章标签和摘要的助手。" },
          { role: "user", content: `根据以下文章内容生成3-5个标签以及一段不多于30字的摘要，摘要将直接呈献给用户。标签之间用中文逗号分隔，标签与摘要之间用分号分割：\n\n${content}` },
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