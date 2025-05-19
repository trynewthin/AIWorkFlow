import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";

/**
 * @description 知识库管理教程页面
 * @returns {JSX.Element} 知识库教程页面组件
 */
const KnowledgeGuide = () => {
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
        <h1 className="text-2xl font-bold">知识库管理教程</h1>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>什么是知识库</CardTitle>
          </CardHeader>
          <CardContent>
            <p>知识库是一个用于存储、组织和检索信息的系统，它允许您将大量的文档、数据和信息结构化地管理起来，以便在需要时快速找到相关信息。在我们的系统中，知识库是实现 RAG（检索增强生成）功能的基础。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>创建知识库</CardTitle>
          </CardHeader>
          <CardContent>
            <p>在知识库管理界面中，您可以通过点击"创建知识库"按钮来创建新的知识库。创建时需要指定知识库的名称、描述、以及使用的向量存储类型（如 HNSWLib、Chroma 等）和嵌入模型（如 OpenAI 嵌入等）。</p>
            <p className="mt-2">创建成功后，新的知识库将出现在列表中，您可以进一步对其进行管理和数据导入。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>文档上传与导入</CardTitle>
          </CardHeader>
          <CardContent>
            <p>进入知识库详情页后，您可以通过"上传文件"按钮上传文档到知识库中。系统支持多种文件格式，包括：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>文本文件 (.txt)</li>
              <li>Markdown 文件 (.md)</li>
              <li>PDF 文档 (.pdf)</li>
              <li>Word 文档 (.docx)</li>
              <li>网页内容 (通过 URL)</li>
            </ul>
            <p className="mt-2">上传后，系统会自动处理文档，包括文本提取、分块和向量化，最终存储到向量数据库中。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>知识库检索与查询</CardTitle>
          </CardHeader>
          <CardContent>
            <p>在知识库详情页的"测试查询"标签页中，您可以输入查询文本，测试知识库的检索效果。系统会返回与查询最相关的文档片段，并显示相似度分数。</p>
            <p className="mt-2">您还可以调整检索参数，如相似性搜索方法（余弦相似度、最大边际相关性）、返回文档数量等，以优化检索效果。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>在工作流中使用知识库</CardTitle>
          </CardHeader>
          <CardContent>
            <p>知识库最强大的功能是与工作流集成，实现 RAG（检索增强生成）应用。在工作流编辑器中，您可以添加 SearchNode 节点，配置其连接到特定知识库，然后将其输出连接到 ChatNode 等 LLM 节点。</p>
            <p className="mt-2">这样，当用户查询时，系统会先从知识库中检索相关文档，然后将这些文档作为上下文发送给 LLM，从而获得基于知识库的精准回答。</p>
            <p className="mt-2">典型的 RAG 工作流结构如下：</p>
            <pre className="bg-slate-100 p-2 rounded-md mt-2 text-sm overflow-x-auto">
              StartNode → SearchNode → ChatNode → EndNode
            </pre>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>知识库管理与维护</CardTitle>
          </CardHeader>
          <CardContent>
            <p>定期维护和更新知识库是保持其效果的关键。您可以在知识库详情页中：</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>删除过时的文档</li>
              <li>上传新的文档以更新知识</li>
              <li>重新配置分块策略或向量模型</li>
              <li>备份或导出知识库数据</li>
            </ul>
            <p className="mt-2">根据您的应用场景，可能需要定期添加新文档或更新现有文档，以确保知识库中的信息保持最新和准确。</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-between">
        <Button asChild variant="outline">
          <Link to="/docs/node">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="m15 18-6-6 6-6"></path>
            </svg>
            节点使用教程
          </Link>
        </Button>
        <Button asChild>
          <Link to="/docs/langchain">
            <span>LangChain开发教程</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
              <path d="m9 18 6-6-6-6"></path>
            </svg>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeGuide; 