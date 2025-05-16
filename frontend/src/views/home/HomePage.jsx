import React, { useState, useEffect } from 'react';
import { AlertCircle, Cpu, Database, Workflow, BookOpen, Settings, Zap, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { workflowService } from '../../services';
import { useNavigate } from 'react-router-dom';
import BlobPattern from '@/components/ui/BlobPattern';

/**
 * @description 科技感十足的首页组件，展示系统功能和最近的工作流
 * @returns {JSX.Element}
 */
function HomePage() {
  const [recentWorkflows, setRecentWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentWorkflows = async () => {
      setLoading(true);
      try {
        const data = await workflowService.listWorkflows();
        setRecentWorkflows(data ? data.slice(0, 3) : []);
      } catch (error) {
        console.error('获取最近工作流失败:', error);
        setRecentWorkflows([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentWorkflows();
  }, []);

  // 导航到指定路由
  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* 头部欢迎区 */}
      <div className="relative rounded-xl overflow-hidden shadow-lg">
        <div className="absolute inset-0 w-full h-full">
          <BlobPattern />
        </div>
        <div className="relative z-1 p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">欢迎使用 AI 工作流平台</h1>
          <p className="text-xl opacity-90">构建、管理和执行智能化工作流</p>
          
          <div className="flex gap-4 mt-6">
            <Button 
              onClick={() => navigateTo('/workflow')} 
              className="bg-black text-white hover:bg-gray-800 relative
                        ring-1 ring-gray-800/50 ring-offset-2 ring-offset-transparent
                        hover:ring-2 hover:ring-gray-700
                        transition-all duration-300 ease-in-out"
            >
              开始创建 <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button onClick={() => navigateTo('/docs')} variant="ghost" className="text-white hover:bg-transparent hover:text-gray-200 hover:bg-opacity-10">
              查看教程
            </Button>
          </div>
        </div>
      </div>

      {/* 功能卡片区 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-all hover:translate-y-[-5px]">
          <CardHeader>
            <Workflow className="h-8 w-8 text-blue-500 mb-2" />
            <CardTitle>工作流设计</CardTitle>
            <CardDescription>通过可视化界面设计复杂AI工作流</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">拖拽节点组合，配置参数，快速构建AI应用流程，无需编写代码。</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => navigateTo('/workflow')} className="w-full">
              浏览工作流 <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-all hover:translate-y-[-5px]">
          <CardHeader>
            <Database className="h-8 w-8 text-green-500 mb-2" />
            <CardTitle>知识库管理</CardTitle>
            <CardDescription>构建和管理专属知识库</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">导入文档、网页内容，自动向量化并存储，为AI提供高质量的检索数据源。</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => navigateTo('/knowledge')} className="w-full">
              管理知识库 <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-all hover:translate-y-[-5px]">
          <CardHeader>
            <BookOpen className="h-8 w-8 text-amber-500 mb-2" />
            <CardTitle>教程文档</CardTitle>
            <CardDescription>详细指南和最佳实践</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">了解如何配置节点、优化提示词、调整参数以获得最佳效果。</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => navigateTo('/docs')} className="w-full">
              查看文档 <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 最近工作流区域 */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">最近的工作流</h2>
          <Button variant="outline" onClick={() => navigateTo('/workflow')}>查看全部</Button>
        </div>

        {loading ? (
          <div className="text-center py-8">正在加载...</div>
        ) : recentWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentWorkflows.map(workflow => (
              <Card key={workflow.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigateTo(`/workflow/${workflow.id}`)}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 text-purple-500 mr-2" />
                    {workflow.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2">
                    {workflow.description || '暂无描述'}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50 p-6 text-center">
            <div className="flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">暂无工作流，点击下方按钮创建</p>
              <Button onClick={() => navigateTo('/workflow')} className="px-6">
                创建工作流
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* 底部技术栈区域 */}
      <div className="bg-gray-50 rounded-xl p-6 mt-8">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Cpu className="w-5 h-5 mr-2 text-gray-700" />
          技术支持
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="px-4 py-3 bg-white rounded-lg shadow-sm">
            <p className="text-blue-600 font-medium">React</p>
            <p className="text-xs text-gray-500">前端框架</p>
          </div>
          <div className="px-4 py-3 bg-white rounded-lg shadow-sm">
            <p className="text-green-600 font-medium">Electron</p>
            <p className="text-xs text-gray-500">桌面应用</p>
          </div>
          <div className="px-4 py-3 bg-white rounded-lg shadow-sm">
            <p className="text-red-600 font-medium">LangChain</p>
            <p className="text-xs text-gray-500">AI 链式调用</p>
          </div>
          <div className="px-4 py-3 bg-white rounded-lg shadow-sm">
            <p className="text-purple-600 font-medium">ReactFlow</p>
            <p className="text-xs text-gray-500">节点流引擎</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 