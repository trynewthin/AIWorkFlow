/**
 * 文本向量节点测试文件
 */

import EmbNode from '../electron/workflow/nodes/embnode.js';

// 文本向量节点测试
describe('EmbNode 测试', () => {
  // 测试基本初始化
  test('应该正确初始化节点', () => {
    const embNode = new EmbNode();
    expect(embNode).toBeDefined();
    expect(embNode.getStatus()).toBe(EmbNode.StatusEnum.IDLE);
    expect(embNode.getEmbeddingModel()).toBe('text-embedding-v3');
    expect(embNode.getEmbeddingDimension()).toBe(1024);
  });

  // 测试自定义配置
  test('应该接受自定义配置', () => {
    const embNode = new EmbNode({
      nodeId: 'test-node-id',
      nodeName: 'test-node-name',
      status: EmbNode.StatusEnum.PENDING
    });
    expect(embNode.nodeInfo.nodeId).toBe('test-node-id');
    expect(embNode.nodeInfo.nodeName).toBe('test-node-name');
    expect(embNode.getStatus()).toBe(EmbNode.StatusEnum.PENDING);
  });

  // 测试设置和获取模型
  test('应该能够设置和获取嵌入模型', () => {
    const embNode = new EmbNode();
    embNode.setEmbeddingModel('text-embedding-v2');
    expect(embNode.getEmbeddingModel()).toBe('text-embedding-v2');
  });

  // 测试设置和获取维度
  test('应该能够设置和获取嵌入维度', () => {
    const embNode = new EmbNode();
    embNode.setEmbeddingDimension(512);
    expect(embNode.getEmbeddingDimension()).toBe(512);
  });

  // 测试文本向量转换功能 (这个测试需要真实的API调用，可能需要模拟)
  test('应该能够将文本转换为向量', async () => {
    const embNode = new EmbNode();
    
    // 这里使用jest.mock来模拟OpenAI API调用
    // 在实际测试环境中，你可能需要设置适当的API密钥和模拟响应
    
    // 示例输入文本
    const inputText = '风急天高猿啸哀，渚清沙白鸟飞回，无边落木萧萧下，不尽长江滚滚来';
    
    // 执行节点（注意：这需要真实API密钥或者适当的模拟）
    const result = await embNode.execute(inputText);
    
    // 验证结果是否为向量数组
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(embNode.getEmbeddingDimension());
  });
});

/**
 * 要运行测试，请使用以下命令：
 * 
 * 安装测试依赖:
 * npm install --save-dev jest @babel/preset-env
 * 
 * 配置babel (如果需要):
 * 创建 .babelrc 文件并添加:
 * {
 *   "presets": ["@babel/preset-env"]
 * }
 * 
 * 在package.json中添加测试脚本:
 * "scripts": {
 *   "test": "jest"
 * }
 * 
 * 然后运行:
 * npm run test -- test/embnode.test.js
 */ 