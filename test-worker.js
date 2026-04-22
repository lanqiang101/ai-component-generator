/**
 * 测试 Pages Functions AI 代理是否正常工作的脚本
 * 
 * 使用方法：
 * node test-worker.js
 * 
 * 注意：此脚本用于测试本地 Express 后端到 Pages Functions 的连通性
 */

// 根据环境选择 Pages Functions URL
const ENV = typeof process !== 'undefined' ? (process.env.NODE_ENV || 'development') : 'development';
const PAGES_URLS = {
  development: 'https://daily-0-0-1.ai-component-generator.pages.dev',
  production: 'https://ai-component-generator.pages.dev'
};

const BASE_URL = PAGES_URLS[ENV] || PAGES_URLS.development;
const API_URL = `${BASE_URL}/api/chat`;

console.log(`🌍 当前环境: ${ENV}`);
console.log(`📡 Pages Functions URL: ${API_URL}\n`);

// 测试请求
async function testPagesFunctions() {
  console.log('🧪 开始测试 Pages Functions AI 代理...\n');

  const prompt = "请生成一个简单的 React 按钮组件";

  try {
    console.log('📤 发送测试请求...');
    const startTime = Date.now();

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt }
        ]
      }),
    });

    const elapsed = Date.now() - startTime;
    console.log(`⏱️  响应时间: ${elapsed}ms\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ 请求失败 (${response.status}):`);
      console.error(errorText);
      return false;
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log('✅ 测试成功!');
      console.log(`📝 返回内容长度: ${content.length} 字符`);
      console.log(`\n📄 内容预览:\n${content.substring(0, 200)}...\n`);
      return true;
    } else {
      console.error('❌ 响应格式错误:');
      console.error(JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    console.error('\n💡 排查建议:');
    console.error('   1. 检查网络连接');
    console.error(`   2. 尝试访问 ${BASE_URL} 确认 Pages Functions 是否可访问`);
    console.error('   3. 检查 Pages Functions 是否正确部署');
    return false;
  }
}

// 运行测试
testPagesFunctions().then(success => {
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(success ? 0 : 1);
  }
});
