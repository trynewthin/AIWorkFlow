// TODO: 从项目现状出发，评估引入 LangChainJS 的价值

1. 节点能力与复用  
   - 当前项目手写了 EmbNode（文本分块＋OpenAI Embeddings）与 TTNode（聊天模型接入）  
   - LangChainJS 提供统一的 Embeddings、TextSplitter、VectorStore、Retriever 封装，可直接复用，无需重复造轮子  
   - 新增节点只需在后端包装 LangChainJS API，保留旧节点，互不冲突  

2. 工作流编排与链式调用  
   - 项目现有工作流需要手动管理节点执行顺序、状态与数据传递  
   - LangChainJS 的 Chain/Sequential/Parallel 等抽象，可直接声明式串联 PromptTemplate、Retriever、LLM、OutputParser  
   - 支持分支、循环、多模型混合调用，极大降低调度复杂度  

3. 文档加载与分块策略  
   - 现有 chunkText 简单按长度切分，缺乏语言敏感性  
   - LangChainJS 内置 RecursiveCharacterTextSplitter、MarkdownLoader、CSVLoader、DirectoryLoader 等多种高质量加载与分块策略  

4. 向量存储与检索能力  
   - 当前把 embedding 存 SQLite 并手写相似度检索逻辑（或调用数据库）  
   - LangChainJS 提供 MemoryVectorStore、Weaviate、Qdrant、SelfQueryRetriever 等多种向量存储与检索器，内置相似度搜索、带分数搜索、元数据过滤等功能  

5. 结构化输出与工具调用  
   - 手动解析 LLM 返回文本，易出错且难以维护  
   - LangChainJS 支持 Zod 等 Schema 绑定，自动将模型输出解析为 JSON 对象  
   - 可定义 Tool 并绑给模型，支持 LLM 驱动执行自定义函数、外部 API  

6. 社区生态与扩展性  
   - LangChainJS 拥有丰富的集成文档、示例和社区插件，便于接入更多 LLM 提供商、存储后端  
   - 未来可接入 Agent、Memory、Callbacks、CallbackManager 等高级功能  

7. 兼容性与增量开发  
   - LangChainJS 支持 CommonJS，能与现有 Node.js 代码共存  
   - 可新增 `LangChainNode`，包装核心链路，作为增量功能，不影响原有 EmbNode/TTNode  
   - 安装依赖后无需大幅改造现有数据库与控制层，渐进接入  

总结：引入 LangChainJS，后端可以借助其完善的组件化抽象，快速构建多样化的 LLM 工作流，提升开发效率与可维护性，又能保持与原有代码的低耦合增量开发策略。
