// EmbNode 测试文件
import EmbNode from '../electron/workflow/nodes/embnode.js';

// 创建一个 EmbNode 实例
const node = new EmbNode({
  nodeId: 'test-embnode',
  nodeName: '测试文本向量节点'
});

// 测试输入文本
const inputText = '风急天高猿啸哀，渚清沙白鸟飞回，无边落木萧萧下，不尽长江滚滚来';

// 执行节点逻辑
async function runTest() {
  console.log('文本向量测试 - 输入文本:', inputText);
  try {
    const result = await node.execute(inputText);
    console.log('文本向量测试 - 向量维度:', result.length);
    console.log('文本向量测试 - 向量前10个值:', result.slice(0, 10));
    console.log('文本向量测试 - 节点状态:', node.getStatus());
  } catch (error) {
    console.error('文本向量测试 - 执行节点时出错:', error);
  }
}

// 测试不同维度
async function runDimensionTest() {
  console.log('\n测试不同向量维度:');
  
  // 测试512维度
  node.setEmbeddingDimension(512);
  console.log('设置向量维度为:', node.getEmbeddingDimension());
  
  try {
    const result = await node.execute(inputText);
    console.log('512维向量测试 - 向量维度:', result.length);
    console.log('512维向量测试 - 向量前5个值:', result.slice(0, 5));
  } catch (error) {
    console.error('512维向量测试 - 执行节点时出错:', error);
  }
}

// 运行测试
async function runAllTests() {
  await runTest();
  await runDimensionTest();
}

console.log('开始测试文本向量节点...');
runAllTests().then(() => {
  console.log('测试完成!');
}).catch(err => {
  console.error('测试过程中发生错误:', err);
}); 