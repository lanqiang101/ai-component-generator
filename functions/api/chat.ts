/**
 * API: Generic Chat Interface
 * POST /api/chat
 * 
 * Request body:
 * {
 *   messages: [
 *     { role: 'user', content: string }
 *   ]
 * }
 * 
 * Response:
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
        JSON.stringify({ error: 'Missing required parameter: messages' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract user message content
    const userMessage = messages.find((m: any) => m.role === 'user');
    if (!userMessage || !userMessage.content) {
      return new Response(
        JSON.stringify({ error: 'Missing user message content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call AI to generate response
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
    console.error('Chat API failed:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Chat API call failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}