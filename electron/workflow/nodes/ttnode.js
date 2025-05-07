/**
 * 文字-文字节点
 * */

// 导入 OpenAI 库
import OpenAI from "openai";

// 文字-文字节点类
class TTNode {
  constructor(externalConfig = {}) {
    // 节点公共配置
    this.nodeInfo = {
      nodeId: externalConfig.nodeId || '',
      nodeName: externalConfig.nodeName || 'new node',
      nextNodeId: externalConfig.nextNodeId || null,
      status: externalConfig.status || TTNode.StatusEnum.IDLE
    };

    this.chatConfig = {
      model: TTNode.aiConfig.defaultModel,
      systemPrompt: TTNode.aiConfig.defaultSystemPrompt,
    };

    this.chatdata = {
      chatlist: [],
      total_tokens: 0,
    };
  }

  // 节点执行逻辑
  async execute(input = '') {
    // 更新节点状态为运行中
    this.setStatus(TTNode.StatusEnum.RUNNING);
    
    const openai = new OpenAI(
      {
        apiKey: TTNode.aiConfig.apiKey,
        baseURL: TTNode.aiConfig.apiUrl
      }
    );

    // 新建一个消息数组
    const messages = [];

    // 根据对话记录，判断当前是否是第一次对话
    if (this.isFirstChat()) {
      // 如果是第一次对话，就装载系统消息
      messages.push({ role: "system", content: this.chatConfig.systemPrompt });
      this.saveChatData({ role: "system", content: this.chatConfig.systemPrompt }, 0);
    } else {
      // 如果不是第一次对话，装载之前的所有对话记录
      messages.push(...this.chatdata.chatlist);
    }

    // 装载用户消息
    messages.push({ role: "user", content: input });

    try {
      const completion = await openai.chat.completions.create({
        model: this.chatConfig.model,  
        messages: messages,
      });
      // 更新节点状态为已完成
      this.setStatus(TTNode.StatusEnum.COMPLETED);
      // 保存本次对话的新消息
      this.saveChatData({ role: "user", content: input }, completion.usage.total_tokens);
      this.saveChatData({ role: "assistant", content: completion.choices[0].message.content }, 0);
      return completion.choices[0].message.content;
    } catch (error) {
      // 如果发生错误，更新节点状态为失败
      this.setStatus(TTNode.StatusEnum.FAILED);
      throw error;
    }
  }

  // 设置节点状态
  setStatus(status) {
    this.nodeInfo.status = status;
  }

  // 获取节点状态
  getStatus() {
    return this.nodeInfo.status;
  }

  // 获取节点接受的输入格式
  getInputType() {
    return TTNode.nodeConfig.input;
  }

  // 获取节点输出的格式
  getOutputType() {
    return TTNode.nodeConfig.output;
  }

  // 设置chat模型
  setChatModel(model) {
    this.chatConfig.model = model;
  }

  // 设置chat系统提示
  setChatSystemPrompt(systemPrompt) {
    this.chatConfig.systemPrompt = systemPrompt;
  }

  // 获取chat模型 
  getChatModel() {
    return this.chatConfig.model;
  }

  // 获取chat系统提示
  getChatSystemPrompt() {
    return this.chatConfig.systemPrompt;
  }

  // 保存本次对话
  saveChatData(chatMessage, total_tokens) {
    this.chatdata.chatlist.push(chatMessage);
    this.chatdata.total_tokens += total_tokens;
  }

  // 获取本次对话记录
  getChatData() {
    return this.chatdata;
  }

  // 判断是否是第一次对话
  isFirstChat() {
    return this.chatdata.chatlist.length === 0;
  }

  // 获取本轮对话花费
  getChatCost() {
    return this.chatdata.total_tokens;
  }
}

// 节点自有配置
TTNode.nodeConfig = {
  type: 'normal',
  tag: 'ai',
  name: 'text-to-text',
  description: '纯文本输入的ai工作流节点，适配那些不具有多模态输入的ai模型',
  input: 'text',
  output: 'text',
  version: '1.0.0'
};

// 节点ai配置
TTNode.aiConfig = { 
  defaultModel: 'qwen-plus',
  defaultSystemPrompt: '你是一个专业的AI助手，请根据用户的问题给出最准确的回答。',
  modelDict: {
    'qwen-plus': 'qwen-plus',
    'deepseek-r1': 'deepseek-r1',
    'deepseek-v3': 'deepseek-v3',
  },//可选模型字典
  apiKey: 'sk-b1ed8552feff467ba5b453af61200db8',
  apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
};

// 节点状态枚举，作为 TTNode 的成员类
TTNode.StatusEnum = {
  IDLE: 'idle', // 空闲
  RUNNING: 'running', // 运行中
  COMPLETED: 'completed', // 已完成
  FAILED: 'failed', // 失败
  PENDING: 'pending' // 待执行
};

// 导出节点类
export default TTNode; 