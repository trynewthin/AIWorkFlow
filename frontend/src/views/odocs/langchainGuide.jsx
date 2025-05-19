import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

/**
 * @description LangChain开发教程页面
 * @returns {JSX.Element} LangChain开发教程页面组件
 */
const LangChainGuide = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/docs" className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            返回
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">LangChain 开发教程</h1>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>什么是 LangChain</CardTitle>
          </CardHeader>
          <CardContent>
            <p>LangChain 是一个强大的框架，用于开发基于大型语言模型（LLM）的应用程序。它提供了一系列工具和抽象，使开发者能够轻松构建复杂的 LLM 应用，如聊天机器人、RAG（检索增强生成）系统、代理等。</p>
            <p className="mt-2">在我们的系统中，许多节点（如 ChatNode、SearchNode 等）都是基于 LangChain JS 实现的，了解 LangChain 的核心概念对于理解和扩展系统功能至关重要。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>LangChain 核心概念</CardTitle>
          </CardHeader>
          <CardContent>
            <p>LangChain 的核心概念包括：</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>模型（Models）</strong>：封装各种 LLM，如 OpenAI、Microsoft、Anthropic 等提供的模型。</li>
              <li><strong>提示词（Prompts）</strong>：构建和管理发送给 LLM 的提示词，支持模板和变量替换。</li>
              <li><strong>链（Chains）</strong>：将多个组件连接起来，形成处理流程。</li>
              <li><strong>内存（Memory）</strong>：管理对话历史，实现有状态的交互。</li>
              <li><strong>检索器（Retrievers）</strong>：从外部数据源检索相关信息。</li>
              <li><strong>代理（Agents）</strong>：能够使用工具并根据需要采取行动的自主实体。</li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>在系统中使用 LangChain</CardTitle>
          </CardHeader>
          <CardContent>
            <p>我们的系统已经集成了 LangChain JS，使您能够在节点实现中直接使用其功能。以下是在系统中使用 LangChain 的主要场景：</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li><strong>开发自定义节点</strong>：基于 BaseNode 类扩展，并利用 LangChain 组件实现特定功能。</li>
              <li><strong>配置已有节点</strong>：通过工作流编辑器配置已实现的基于 LangChain 的节点（如 ChatNode、SearchNode 等）。</li>
              <li><strong>脚本中使用</strong>：在自定义脚本或调试中直接使用 LangChain API。</li>
            </ol>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>示例：创建自定义 ChatNode</CardTitle>
          </CardHeader>
          <CardContent>
            <p>以下是使用 LangChain JS 创建一个简单的聊天节点的示例代码：</p>
            <pre className="bg-slate-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
{`/**
 * @file electron/node/models/CustomChatNode.js
 * @description 自定义聊天节点（基于 LangChain JS）
 */
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const { ChatOpenAI } = require('@langchain/openai');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const BaseNode = require('./BaseNode');
const Pipeline = require('../../pipeline/Pipeline');

/**
 * @class CustomChatNode
 * @description 自定义聊天节点，支持流式输出
 */
class CustomChatNode extends BaseNode {
  constructor() {
    super();
  }

  async onInit() {
    // 初始化LLM实例，从工作配置中获取参数
    const { model = 'gpt-3.5-turbo', temperature = 0.7 } = this.getWorkConfig();
    this.llm = new ChatOpenAI({
      modelName: model,
      temperature: temperature,
      streaming: true  // 启用流式输出
    });

    // 注册管道类型处理器
    this.registerHandler(PipelineType.TEXT, this._handleTextInput.bind(this));
  }

  async _handleTextInput(pipeline) {
    try {
      const { systemPrompt = '你是一个有用的AI助手' } = this.getWorkConfig();
      const textData = pipeline.getByType(DataType.TEXT);
      
      if (!textData) {
        throw new Error('输入管道中未找到文本数据');
      }
      
      // 创建输出管道
      const outputPipeline = new Pipeline(PipelineType.TEXT);
      
      // 构建消息
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(String(textData))
      ];
      
      // 调用LLM生成回复
      const response = await this.llm.invoke(messages);
      
      // 将回复添加到输出管道
      outputPipeline.add(DataType.TEXT, response.content);
      
      return outputPipeline;
    } catch (error) {
      throw new Error(\`CustomChatNode 处理失败: \${error.message}\`);
    }
  }
}

module.exports = CustomChatNode;`}
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>示例：实现 RAG 应用</CardTitle>
          </CardHeader>
          <CardContent>
            <p>以下是使用 LangChain JS 实现一个检索增强生成（RAG）应用的示例代码：</p>
            <pre className="bg-slate-100 p-3 rounded-md mt-2 text-sm overflow-x-auto">
{`/**
 * @file electron/node/models/CustomRAGNode.js
 * @description 自定义RAG节点，整合检索和生成
 */
const { DataType, PipelineType } = require('../../coreconfigs/models/pipelineTypes');
const { ChatOpenAI } = require('@langchain/openai');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { Document } = require('@langchain/core/documents');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const BaseNode = require('./BaseNode');
const Pipeline = require('../../pipeline/Pipeline');

/**
 * @class CustomRAGNode
 * @description 自定义RAG节点，集成文档检索和LLM生成
 */
class CustomRAGNode extends BaseNode {
  constructor() {
    super();
    this.documents = [];
    this.vectorStore = null;
  }

  async onInit() {
    // 初始化配置
    const { model = 'gpt-3.5-turbo', temperature = 0.7 } = this.getWorkConfig();
    
    // 初始化LLM
    this.llm = new ChatOpenAI({
      modelName: model,
      temperature: temperature,
    });
    
    // 初始化嵌入模型
    this.embeddings = new OpenAIEmbeddings();
    
    // 注册处理器
    this.registerHandler(PipelineType.TEXT, this._handleQuery.bind(this));
    this.registerHandler(PipelineType.DOCUMENT, this._handleDocuments.bind(this));
  }

  // 处理添加文档的管道
  async _handleDocuments(pipeline) {
    try {
      // 从管道获取文档
      const docs = pipeline.getByType(DataType.DOCUMENT);
      if (!docs || !Array.isArray(docs)) {
        throw new Error('输入管道中未找到有效的文档数据');
      }
      
      // 转换为Document对象
      const documents = docs.map(doc => {
        if (typeof doc === 'string') {
          return new Document({ pageContent: doc });
        } else if (doc.text) {
          return new Document({ pageContent: doc.text, metadata: doc.metadata || {} });
        }
        return doc;
      });
      
      // 文本分割
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200
      });
      const splitDocs = await splitter.splitDocuments(documents);
      
      // 更新文档集合
      this.documents = [...this.documents, ...splitDocs];
      
      // 创建或更新向量存储
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        this.documents,
        this.embeddings
      );
      
      // 返回成功信息
      const outputPipeline = new Pipeline(PipelineType.TEXT);
      outputPipeline.add(DataType.TEXT, \`成功添加 \${splitDocs.length} 个文档片段到向量库\`);
      return outputPipeline;
    } catch (error) {
      throw new Error(\`处理文档失败: \${error.message}\`);
    }
  }

  // 处理查询的管道
  async _handleQuery(pipeline) {
    try {
      const { systemPrompt = '你是一个有用的AI助手', k = 3 } = this.getWorkConfig();
      const query = pipeline.getByType(DataType.TEXT);
      
      if (!query) {
        throw new Error('输入管道中未找到查询文本');
      }
      
      // 检查向量存储是否初始化
      if (!this.vectorStore) {
        throw new Error('向量存储尚未初始化，请先添加文档');
      }
      
      // 创建检索器
      const retriever = this.vectorStore.asRetriever({ k });
      
      // 执行检索
      const relevantDocs = await retriever.getRelevantDocuments(query);
      
      // 格式化上下文
      let context = '';
      if (relevantDocs.length > 0) {
        context = '以下是与查询相关的信息：\\n\\n';
        relevantDocs.forEach((doc, i) => {
          context += \`文档 \${i+1}:\\n\${doc.pageContent}\\n\\n\`;
        });
      }
      
      // 构建增强提示词
      const enhancedPrompt = systemPrompt + '\\n\\n' + context + 
        '\\n请基于上述信息回答用户的问题。如果信息不足，请说明无法回答。';
      
      // 生成回复
      const response = await this.llm.invoke([
        new SystemMessage(enhancedPrompt),
        new HumanMessage(query)
      ]);
      
      // 返回结果
      const outputPipeline = new Pipeline(PipelineType.TEXT);
      outputPipeline.add(DataType.TEXT, response.content);
      return outputPipeline;
    } catch (error) {
      throw new Error(\`处理查询失败: \${error.message}\`);
    }
  }
}

module.exports = CustomRAGNode;`}
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>LangChain 版本与兼容性</CardTitle>
          </CardHeader>
          <CardContent>
            <p>我们的系统使用的是 LangChain JS 的最新 0.3.x 版本，该版本与旧版本（0.0.x 和 0.1.x）有显著差异。主要变化包括：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>模块化重组：核心组件从 <code>@langchain/core</code> 导入</li>
              <li>模型特定组件从各自包导入（如 <code>@langchain/openai</code>）</li>
              <li>社区组件从 <code>@langchain/community</code> 导入</li>
              <li>使用 <code>RunnableSequence</code> 替代传统 Chain 类</li>
              <li>更强大的流式处理和消息格式</li>
            </ul>
            <p className="mt-2">在开发自定义节点时，请确保按照新版本的导入和 API 规范编写代码。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>最佳实践</CardTitle>
          </CardHeader>
          <CardContent>
            <p>在使用 LangChain 开发时，请遵循以下最佳实践：</p>
            <ol className="list-decimal pl-5 mt-2 space-y-2">
              <li><strong>使用异步/await</strong>：LangChain 的操作几乎都是异步的，确保正确使用 async/await。</li>
              <li><strong>错误处理</strong>：包装 API 调用在 try/catch 块中，并提供有意义的错误信息。</li>
              <li><strong>内存管理</strong>：对于长对话，使用适当的记忆组件管理上下文。</li>
              <li><strong>模型选择</strong>：根据任务复杂性和成本考虑选择适当的模型。</li>
              <li><strong>提示工程</strong>：精心设计系统提示词，以获得最佳结果。</li>
              <li><strong>向量存储选择</strong>：对于小型应用可使用内存存储，大型应用考虑 Chroma、Pinecone 等。</li>
            </ol>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button asChild variant="outline">
          <Link to="/docs/knowledge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            知识库管理教程
          </Link>
        </Button>
        <Button disabled variant="outline">下一节</Button>
      </div>
    </div>
  );
};

export default LangChainGuide; 