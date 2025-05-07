// TTNode 测试文件
import TTNode from '../electron/workflow/nodes/ttnode.js';

// 创建一个 TTNode 实例
const node = new TTNode({
  nodeId: 'test-ttnode',
  nodeName: '测试文字-文字节点'
});

node.setChatModel('deepseek-r1');

// 测试输入文字
const inputText = '你好，你是哪个模型。';

// 执行节点逻辑
async function runTest() {
  console.log('第一次对话 - 输入文字:', inputText);
  try {
    const result = await node.execute(inputText);
    console.log('第一次对话 - 节点输出结果:', result);
  } catch (error) {
    console.error('第一次对话 - 执行节点时出错:', error);
  }
}

// 测试输入文字
const inputText2 = '我们刚刚聊了什么？';

// 执行节点逻辑
async function runTest2() {
  console.log('第二次对话 - 输入文字:', inputText2);
  try {
    const result = await node.execute(inputText2);
    console.log('第二次对话 - 节点输出结果:', result);
  } catch (error) {
    console.error('第二次对话 - 执行节点时出错:', error);
  }
}

// 运行测试
async function runAllTests() {
  await runTest();
  console.log('\n');
  await runTest2();
}

runAllTests(); 