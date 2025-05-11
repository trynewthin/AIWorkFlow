/**
 * @file electron/configs/nodes/defaultWorkConfigs.js
 * @description 各节点类型的默认运行时（工作）配置
 * 包含：模型名称、temperature、系统提示词等，具体字段因节点类型而异
 */
module.exports = {
  TextNode: {
    model: 'gpt-4o-mini', // 示例默认模型
    temperature: 0.7,
    systemPrompt: '你是一个有用的助手。'
  },
  ImageNode: {
    model: 'clip-vit-large-patch14', // 示例默认模型
    output_mode: 'text_description' // 示例：图片处理模式
  },
  ChatNode: {
    model: 'qwen-plus', 
    systemPrompt: '你是一个友好的助手，请根据用户输入提供帮助。', 
    temperature: 0.7 
  },
  // 在此添加更多其他节点类型的默认运行时配置
  // ExampleNode: {
  //   some_param: 'default_value'
  // }
}; 