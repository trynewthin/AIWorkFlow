import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { configService } from "../../services";

/**
 * @description 节点教程页面
 * @returns {JSX.Element} 节点教程页面组件
 */
const NodeGuide = () => {
  const [nodeTypes, setNodeTypes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeConfig, setNodeConfig] = useState(null);
  const [flowConfig, setFlowConfig] = useState(null);
  const [workConfig, setWorkConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取所有节点类型
  useEffect(() => {
    const fetchNodeTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const types = await configService.getConfigNodeTypes();
        if (Array.isArray(types)) {
          setNodeTypes(types);
          if (types.length > 0) {
            setSelectedNode(types[0]);
          } else {
            setSelectedNode(null);
          }
        } else {
          throw new Error('获取到的节点类型数据格式不正确');
        }
      } catch (err) {
        console.error('获取节点类型失败:', err);
        setError('获取节点类型失败: ' + err.message);
        setNodeTypes([]);
        setSelectedNode(null);
      } finally {
        setLoading(false);
      }
    };
    fetchNodeTypes();
  }, []);

  // 获取选中节点的配置
  useEffect(() => {
    if (!selectedNode) {
      setNodeConfig(null);
      setFlowConfig(null);
      setWorkConfig(null);
      setLoading(false); 
      return;
    }

    const fetchNodeConfigs = async () => {
      setLoading(true);
      setError(null);
      try {
        const [nodeConfigData, flowConfigData, workConfigData] = await Promise.all([
          configService.getNodeConfigByType(selectedNode),
          configService.getDefaultFlowConfig(selectedNode),
          configService.getDefaultWorkConfig(selectedNode)
        ]);

        setNodeConfig(nodeConfigData);
        setFlowConfig(flowConfigData);
        setWorkConfig(workConfigData);

      } catch (err) {
        console.error('获取节点配置失败:', err);
        setError(`获取 ${selectedNode} 配置失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchNodeConfigs();
  }, [selectedNode]);

  // 格式化展示JSON对象
  const formatConfigDisplay = (config) => {
    if (config === null || config === undefined) {
      return <p className="text-slate-500 text-xs">此配置信息不可用。</p>;
    }
    if (typeof config === 'object' && Object.keys(config).length === 0) {
      return <p className="text-slate-500 text-xs">此配置为空。</p>;
    }
    
    return Object.entries(config).map(([key, value]) => (
      <div key={key} className="mb-2">
        <span className="font-semibold">{key}: </span>
        <span className="text-slate-600">
          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
        </span>
      </div>
    ));
  };

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
        <h1 className="text-2xl font-bold">节点使用教程</h1>
      </div>
      
      <Separator className="my-4" />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>什么是节点</CardTitle>
          </CardHeader>
          <CardContent>
            <p>节点是系统中的基本处理单元，每个节点都有特定的功能，可以接收输入数据，进行处理，然后输出结果。在我们的系统中，节点是构建工作流的基础组件。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>创建节点</CardTitle>
          </CardHeader>
          <CardContent>
            <p>在工作台中，您可以通过点击左侧工具栏中的"添加节点"按钮来创建新节点。系统提供了多种类型的节点供您选择，包括数据输入节点、处理节点、输出节点等。</p>
            <p className="mt-2">每种类型的节点都有其特定的功能和配置选项。选择适合您需求的节点类型后，它将被添加到工作区中。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>连接节点</CardTitle>
          </CardHeader>
          <CardContent>
            <p>节点之间可以通过连线相连，形成数据流。点击一个节点的输出端口，然后拖动到另一个节点的输入端口即可创建连接。连接的方向表示数据流动的方向，从上游节点到下游节点。</p>
            <p className="mt-2">连接成功后，数据将能够从一个节点流向另一个节点，实现自动化处理流程。</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>配置节点参数</CardTitle>
          </CardHeader>
          <CardContent>
            <p>每个节点都有自己的参数设置。选中节点后，右侧面板会显示该节点的参数配置选项，您可以根据需要调整这些参数。</p>
            <p className="mt-2">常见的参数包括输入/输出格式、处理方式、阈值设置等。正确配置参数对于节点功能的发挥至关重要。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>可用节点类型</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            
            <div className="mb-4">
              <p className="mb-2">系统支持以下节点类型，选择一个节点查看其配置详情：</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {nodeTypes.length > 0 ? nodeTypes.map((type) => (
                  <Button 
                    key={type} 
                    variant={selectedNode === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedNode(type)}
                  >
                    {type}
                  </Button>
                )) : (
                  <p className="text-slate-500">加载节点类型中...</p>
                )}
              </div>
            </div>

            {selectedNode && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">"{selectedNode}" 节点配置</h3>
                
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className={`space-y-4 transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                  <div>
                    <h4 className="font-medium text-md mb-2">基本配置</h4>
                    <div className="bg-slate-50 p-3 rounded-md text-sm overflow-x-auto min-h-[70px]">
                      {loading && !nodeConfig ? <p className="text-xs text-slate-400">加载中...</p> : formatConfigDisplay(nodeConfig)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-md mb-2">流程级配置</h4>
                    <div className="bg-slate-50 p-3 rounded-md text-sm overflow-x-auto min-h-[70px]">
                      {loading && !flowConfig ? <p className="text-xs text-slate-400">加载中...</p> : formatConfigDisplay(flowConfig)}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-md mb-2">运行时配置</h4>
                    <div className="bg-slate-50 p-3 rounded-md text-sm overflow-x-auto min-h-[70px]">
                      {loading && !workConfig ? <p className="text-xs text-slate-400">加载中...</p> : formatConfigDisplay(workConfig)}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!selectedNode && !loading && (
              <p className="text-slate-500 mt-6">请选择一个节点类型以查看其配置详情。</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 flex justify-end">
        <Button disabled variant="outline" className="mr-2">上一节</Button>
        <Button disabled variant="outline">下一节</Button>
      </div>
    </div>
  );
};

export default NodeGuide; 