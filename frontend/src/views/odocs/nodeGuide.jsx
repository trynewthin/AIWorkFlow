import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Separator } from "../../components/ui/separator";
import { getNodeTypes as getConfigNodeTypes, getNodeConfigByType, getDefaultFlowConfig, getDefaultWorkConfig } from "../../api/config";
// 导入工作流模块中的获取节点类型方法作为备选
import { getNodeTypes as getWorkflowNodeTypes } from "../../api/workflow";

// 模拟节点数据
const mockNodeData = {
  StartNode: {
    config: {
      id: 'start',
      name: 'start-node',
      type: 'input',
      tag: 'start',
      description: '工作流的起始节点，提供初始数据',
      version: '1.0.0',
      supportedInputPipelines: ['PROMPT'],
      supportedOutputPipelines: ['PROMPT', 'TEXT']
    },
    flow: {
      nodeName: 'Start Node',
      status: 'IDLE'
    },
    work: {
      initialPrompt: '请输入您的问题',
      outputFormat: 'text'
    }
  },
  ChatNode: {
    config: {
      id: 'chat',
      name: 'chat-completion',
      type: 'model',
      tag: 'chat',
      description: '使用大语言模型进行对话生成',
      version: '1.0.0',
      supportedInputPipelines: ['CHAT', 'PROMPT'],
      supportedOutputPipelines: ['CHAT', 'PROMPT', 'TEXT']
    },
    flow: {
      nodeName: 'Chat Completion',
      status: 'IDLE'
    },
    work: {
      model: 'gpt-3.5-turbo',
      systemPrompt: '你是一个有用的AI助手',
      temperature: 0.7,
      maxTokens: 1000
    }
  },
  PromptNode: {
    config: {
      id: 'prompt',
      name: 'prompt-template',
      type: 'transform',
      tag: 'prompt',
      description: '处理并转换提示模板',
      version: '1.0.0',
      supportedInputPipelines: ['TEXT', 'JSON'],
      supportedOutputPipelines: ['PROMPT']
    },
    flow: {
      nodeName: 'Prompt Template',
      status: 'IDLE'
    },
    work: {
      template: '请根据以下内容回答问题：\n\n上下文: {{context}}\n\n问题: {{question}}',
      variables: ['context', 'question']
    }
  },
  OutputNode: {
    config: {
      id: 'output',
      name: 'output-node',
      type: 'output',
      tag: 'output',
      description: '处理并输出最终结果',
      version: '1.0.0',
      supportedInputPipelines: ['TEXT', 'CHAT', 'JSON'],
      supportedOutputPipelines: []
    },
    flow: {
      nodeName: 'Output Node',
      status: 'IDLE'
    },
    work: {
      outputFormat: 'markdown',
      saveToHistory: true
    }
  }
};

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
      try {
        // 首先尝试使用配置服务获取节点类型
        let types;
        try {
          const response = await getConfigNodeTypes();
          
          // 正确提取data字段中的节点类型数组
          if (response && response.data && Array.isArray(response.data)) {
            types = response.data;
          } else {
            throw new Error("返回数据格式不符合预期");
          }
        } catch (configError) {
          // 如果配置服务失败，尝试使用工作流服务
          try {
            const response = await getWorkflowNodeTypes();
            
            // 工作流API可能有不同的返回格式，需要相应处理
            if (response && response.data && Array.isArray(response.data)) {
              types = response.data;
            } else if (Array.isArray(response)) {
              types = response;
            } else {
              throw new Error("返回数据格式不符合预期");
            }
          } catch (workflowError) {
            throw workflowError;
          }
        }

        // 如果后端返回的节点类型为空，使用模拟数据
        if (!types || types.length === 0) {
          types = Object.keys(mockNodeData);
        }

        setNodeTypes(types);
        if (types && types.length > 0) {
          setSelectedNode(types[0]);
        }
      } catch (err) {
        console.error('获取节点类型失败:', err);
        setError(`获取节点类型列表失败: ${err.message}`);
        // 使用模拟数据
        const mockTypes = Object.keys(mockNodeData);
        setNodeTypes(mockTypes);
        setSelectedNode(mockTypes[0]);
      }
    };

    fetchNodeTypes();
  }, []);

  // 获取选中节点的配置
  useEffect(() => {
    if (!selectedNode) return;

    const fetchNodeConfigs = async () => {
      setLoading(true);
      setError(null);
      try {
        let config, flow, work;
        
        try {
          // 获取三种配置
          const [configResponse, flowResponse, workResponse] = await Promise.all([
            getNodeConfigByType(selectedNode),
            getDefaultFlowConfig(selectedNode),
            getDefaultWorkConfig(selectedNode)
          ]);
          
          // 处理返回结果，针对可能的不同格式做判断
          config = configResponse && configResponse.data ? configResponse.data : configResponse;
          flow = flowResponse && flowResponse.data ? flowResponse.data : flowResponse;
          work = workResponse && workResponse.data ? workResponse.data : workResponse;
        } catch (err) {
          // 如果获取配置失败，使用模拟数据
          
          // 优先使用预定义的模拟数据
          if (mockNodeData[selectedNode]) {
            config = mockNodeData[selectedNode].config;
            flow = mockNodeData[selectedNode].flow;
            work = mockNodeData[selectedNode].work;
          } else {
            // 如果没有预定义的模拟数据，生成通用模拟数据
            config = {
              id: selectedNode.toLowerCase(),
              name: selectedNode,
              type: 'model',
              tag: selectedNode.toLowerCase(),
              description: `${selectedNode} 的基本描述`,
              version: '1.0.0',
              supportedInputPipelines: ['CHAT', 'PROMPT'],
              supportedOutputPipelines: ['CHAT', 'PROMPT']
            };
            
            flow = {
              nodeName: `${selectedNode} Node`,
              status: 'IDLE'
            };
            
            work = {
              model: selectedNode === 'ChatNode' ? 'gpt-3.5-turbo' : 'default',
              systemPrompt: '你是一个助手',
              temperature: 0.7
            };
          }
        }
        
        setNodeConfig(config);
        setFlowConfig(flow);
        setWorkConfig(work);
      } catch (err) {
        console.error('获取节点配置失败:', err);
        setError(`获取节点配置信息失败: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNodeConfigs();
  }, [selectedNode]);

  // 格式化展示JSON对象
  const formatConfigDisplay = (config) => {
    if (!config) return null;
    
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
                
                {loading ? (
                  <p className="text-slate-500">加载配置信息中...</p>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-md mb-2">基本配置</h4>
                      <div className="bg-slate-50 p-3 rounded-md text-sm overflow-x-auto">
                        {formatConfigDisplay(nodeConfig)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-md mb-2">流程级配置</h4>
                      <div className="bg-slate-50 p-3 rounded-md text-sm overflow-x-auto">
                        {formatConfigDisplay(flowConfig)}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-md mb-2">运行时配置</h4>
                      <div className="bg-slate-50 p-3 rounded-md text-sm overflow-x-auto">
                        {formatConfigDisplay(workConfig)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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