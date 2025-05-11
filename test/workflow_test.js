/**
 * @file workflow_test.js
 * @description 工作流功能测试
 */

const { getWorkflowDb } = require('../electron/database');
const WorkflowManager = require('../electron/model/workflow/WorkflowManager');
const { getWorkflowExecutor } = require('../electron/model/workflow/WorkflowExecutor');
const { getNodeFactory } = require('../electron/model/workflow/NodeFactory');
const Pipeline = require('../electron/model/pipeline/Pipeline');
const { PipelineType, DataType } = require('../electron/config/pipeline');

/**
 * 执行测试
 */
async function runTests() {
  console.log('开始工作流测试...');
  
  // 初始化测试环境
  const workflowDb = getWorkflowDb();
  const workflowManager = new WorkflowManager();
  const nodeFactory = getNodeFactory();
  const workflowExecutor = getWorkflowExecutor();
  
  try {
    // 测试 1: 创建工作流
    console.log('\n测试 1: 创建工作流');
    const workflow = await workflowManager.createWorkflow(
      '测试工作流',
      '这是一个测试工作流',
      { maxSteps: 10, timeout: 5000 }
    );
    console.log('创建工作流成功:', workflow.id);
    
    // 测试 2: 添加节点
    console.log('\n测试 2: 添加节点');
    
    const startNodeId = await workflowManager.addNode(
      workflow.id,
      'StartNode',
      { nodeName: '开始节点' },
      { }
    );
    console.log('添加开始节点成功:', startNodeId);
    
    const chatNodeId = await workflowManager.addNode(
      workflow.id,
      'ChatNode',
      { nodeName: '聊天节点' },
      { 
        model: 'qwen-plus',
        systemPrompt: '你是一个友好的助手'
      }
    );
    console.log('添加聊天节点成功:', chatNodeId);
    
    const endNodeId = await workflowManager.addNode(
      workflow.id,
      'EndNode',
      { nodeName: '结束节点' },
      { }
    );
    console.log('添加结束节点成功:', endNodeId);
    
    // 测试 3: 获取工作流
    console.log('\n测试 3: 获取工作流');
    const retrievedWorkflow = await workflowManager.getWorkflow(workflow.id);
    console.log(`获取到工作流: ${retrievedWorkflow.name}, 节点数量: ${retrievedWorkflow.nodes.length}`);
    
    // 测试 4: 移动节点
    console.log('\n测试 4: 移动节点');
    await workflowManager.moveNode(chatNodeId, 0);
    const afterMoveWorkflow = await workflowManager.getWorkflow(workflow.id);
    const sortedNodes = afterMoveWorkflow.getSortedNodes();
    console.log('移动后的节点顺序:');
    sortedNodes.forEach(node => {
      console.log(`- ${node.type} (${node.id}): 位置 ${node.order_index}`);
    });
    
    // 测试 5: 获取节点类型列表
    console.log('\n测试 5: 获取节点类型列表');
    const nodeTypes = nodeFactory.getRegisteredTypes();
    console.log('可用节点类型:', nodeTypes);
    
    /*
    // 注释掉执行测试，因为节点执行依赖实际环境
    
    // 测试 6: 执行工作流
    console.log('\n测试 6: 执行工作流');
    const input = '你好，这是测试输入';
    const result = await workflowExecutor.execute(workflow.id, input);
    console.log('工作流执行结果类型:', result.getPipelineType());
    console.log('工作流执行结果数据:', result.getAll());
    */
    
    // 测试 7: 删除节点
    console.log('\n测试 7: 删除节点');
    await workflowManager.deleteNode(chatNodeId);
    const afterDeleteWorkflow = await workflowManager.getWorkflow(workflow.id);
    console.log(`删除节点后，工作流节点数量: ${afterDeleteWorkflow.nodes.length}`);
    
    // 测试 8: 删除工作流
    console.log('\n测试 8: 删除工作流');
    await workflowManager.deleteWorkflow(workflow.id);
    const deletedWorkflow = await workflowManager.getWorkflow(workflow.id);
    console.log('工作流已删除:', deletedWorkflow === null);
    
    console.log('\n所有测试完成!');
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

// 执行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
}); 