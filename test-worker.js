/**
 * 测试 Cloudflare Worker 代理是否正常工作的脚本
 * 
 * 使用方法：
 * node test-worker.js
 */

// 你的正式 Worker URL
const API_URL = "https://ai-component-proxy.xuyongqiang916.workers.dev";

// 测试请求
async function testWorker() {
  console.log('🧪 开始测试 Cloudflare Worker...\n');
  console.log(`📡 Worker URL: ${API_URL}\n`);

  const prompt = "请生成一个简单的 React 按钮组件";

  try {
    console.log('📤 发送测试请求...');
    const startTime = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const elapsedTime = Date.now() - startTime;

    console.log(`\n📥 收到响应:`);
    console.log(`⏱️  耗时: ${elapsedTime}ms`);
    console.log(`📊 状态码: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ 请求失败: ${errorText}`);
      return;
    }

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      console.log(`✅ 成功！收到 ${data.choices[0].message.content.length} 字符的响应`);
      console.log(`\n📝 响应内容（前200字符）:`);
      console.log(data.choices[0].message.content.substring(0, 200) + '...');
    } else {
      console.error('❌ 响应格式错误:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    console.error('\n可能的原因：');
    
    if (error.name === 'AbortError') {
      console.error('⏱️  请求超时（30秒）');
      console.error('   建议：');
      console.error('   1. 检查网络连接');
      console.error('   2. 确认 Worker 域名是否正确解析');
      console.error('   3. 如果使用国内网络，可能需要配置代理');
    } else if (error.message.includes('fetch failed') || error.message.includes('connect')) {
      console.error('🌐 网络连接失败');
      console.error('   建议：');
      console.error('   1. 检查网络连接是否正常');
      console.error('   2. 尝试 ping ai-component-proxy.xuyongqiang916.workers.dev');
      console.error('   3. 如果使用国内网络，Cloudflare Workers 可能被限制');
      console.error('   4. 考虑使用代理或 VPN');
    } else {
      console.error('1. Worker URL 配置错误');
      console.error('2. API Key 未配置或无效');
      console.error('3. 网络连接问题');
      console.error('4. 火山方舟服务不可用');
    }
    
    console.error('\n🔍 调试步骤：');
    console.error('1. 在浏览器中访问 Worker URL 查看是否可访问');
    console.error('2. 检查 Cloudflare Dashboard 中的 Worker 状态');
    console.error('3. 查看 Worker Logs 中的错误信息');
  }
}

// 运行测试
testWorker();
