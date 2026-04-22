/**
 * API: 通用 Chat 接口
 * POST /api/chat
 * 
 * 请求体:
 * {
 *   messages: [
 *     { role: 'user', content: string }
 *   ]
 * }
 * 
 * 响应:
 * {
 *   choices: [
 *     { message: { content: string } }
 *   ]
 * }
 */

import { callAI } from '../utils/ai';

export async function onRequest(context: any) {
  const { request, env } = context;
  
  try {
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: '缺少必要参数: messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 提取用户消息内容
    const userMessage = messages.find((m: any) => m.role === 'user');
    if (!userMessage || !userMessage.content) {
      return new Response(
        JSON.stringify({ error: '缺少用户消息内容' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 调用 AI 生成回复
    const content = await callAI(userMessage.content, env);

    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: content,
            },
          },
        ],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Chat API 失败:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Chat API 调用失败',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
