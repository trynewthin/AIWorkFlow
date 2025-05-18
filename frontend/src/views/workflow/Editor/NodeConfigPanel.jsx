import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DialogueSelector from '@/components/ui/dialogue-selector';

/**
 * @component NodeConfigPanel
 * @description 节点配置面板组件
 */
function NodeConfigPanel({ node, onSave }) {
  const [flowConfig, setFlowConfig] = useState(node.flow_config || {});
  const [workConfig, setWorkConfig] = useState(node.work_config || {});
  const [workflowId, setWorkflowId] = useState(null);

  // 当节点变更时更新配置状态
  useEffect(() => {
    setFlowConfig(node.flow_config || {});
    setWorkConfig(node.work_config || {});
    
    // 从节点配置中提取工作流ID
    if (node && node.workflow_id) {
      setWorkflowId(node.workflow_id);
    } else if (node && node.workflowId) {
      setWorkflowId(node.workflowId);
    }
    
    console.log('节点类型:', node?.node_type || node?.type, '是否记忆节点:', isMemoryNode(node));
  }, [node]);

  // 检查是否为记忆节点
  const isMemoryNode = (node) => {
    // 检查多种可能的类型标识
    const nodeType = node?.node_type || node?.type || '';
    return nodeType.toLowerCase() === 'memory' || 
           nodeType === 'MemoryNode' || 
           nodeType === 'memory-node' ||
           nodeType === 'node.memory';
  };

  // 处理保存操作
  const handleSave = () => {
    onSave(flowConfig, workConfig);
  };

  // 渲染通用配置控件
  const renderConfigField = (configKey, configValue, isFlowConfig = true) => {
    // 记忆节点特殊处理
    if (isMemoryNode(node) && isFlowConfig) {
      // 对话ID选择器
      if (configKey === 'dialogueId') {
        return (
          <div className="mb-4" key={configKey}>
            <DialogueSelector
              workflowId={workflowId}
              value={configValue}
              onChange={(value) => {
                setFlowConfig({ ...flowConfig, [configKey]: value });
              }}
              historyRounds={flowConfig.historyRounds || 5}
              onHistoryRoundsChange={(rounds) => {
                setFlowConfig({ ...flowConfig, historyRounds: rounds });
              }}
              onError={(error) => console.error('对话选择器错误:', error)}
            />
          </div>
        );
      }
      // 历史轮次控制
      else if (configKey === 'historyRounds') {
        // 在DialogueSelector中已包含历史轮次控制，此处不再重复渲染
        return null;
      }
    }
    
    // 判断值类型，渲染不同的输入控件
    if (typeof configValue === 'string') {
      // 检查是否为系统提示词配置项
      const isSystemPrompt = configKey === 'systemPrompt';
      
      return (
        <div className="mb-4" key={configKey}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {configKey}
          </label>
          {isSystemPrompt ? (
            <textarea
              value={configValue}
              onChange={(e) => {
                if (isFlowConfig) {
                  setFlowConfig({ ...flowConfig, [configKey]: e.target.value });
                } else {
                  setWorkConfig({ ...workConfig, [configKey]: e.target.value });
                }
              }}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all font-mono text-sm"
              rows="8"
            ></textarea>
          ) : (
            <input
              type="text"
              value={configValue}
              onChange={(e) => {
                if (isFlowConfig) {
                  setFlowConfig({ ...flowConfig, [configKey]: e.target.value });
                } else {
                  setWorkConfig({ ...workConfig, [configKey]: e.target.value });
                }
              }}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
            />
          )}
        </div>
      );
    }
    else if (typeof configValue === 'number') {
      return (
        <div className="mb-4" key={configKey}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {configKey}
          </label>
          <input
            type="number"
            value={configValue}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (isFlowConfig) {
                setFlowConfig({ ...flowConfig, [configKey]: value });
              } else {
                setWorkConfig({ ...workConfig, [configKey]: value });
              }
            }}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
          />
        </div>
      );
    }
    else if (typeof configValue === 'boolean') {
      return (
        <div className="mb-4" key={configKey}>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={configValue}
              onChange={(e) => {
                if (isFlowConfig) {
                  setFlowConfig({ ...flowConfig, [configKey]: e.target.checked });
                } else {
                  setWorkConfig({ ...workConfig, [configKey]: e.target.checked });
                }
              }}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{configKey}</span>
          </label>
        </div>
      );
    }
    else if (Array.isArray(configValue)) {
      return (
        <div className="mb-4" key={configKey}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {configKey} (数组)
          </label>
          <textarea
            value={JSON.stringify(configValue, null, 2)}
            onChange={(e) => {
              try {
                const value = JSON.parse(e.target.value);
                if (isFlowConfig) {
                  setFlowConfig({ ...flowConfig, [configKey]: value });
                } else {
                  setWorkConfig({ ...workConfig, [configKey]: value });
                }
              } catch (err) {
                // 解析错误时不更新状态
              }
            }}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all font-mono text-sm"
            rows="4"
          ></textarea>
        </div>
      );
    }
    else if (typeof configValue === 'object' && configValue !== null) {
      return (
        <div className="mb-4" key={configKey}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {configKey} (对象)
          </label>
          <textarea
            value={JSON.stringify(configValue, null, 2)}
            onChange={(e) => {
              try {
                const value = JSON.parse(e.target.value);
                if (isFlowConfig) {
                  setFlowConfig({ ...flowConfig, [configKey]: value });
                } else {
                  setWorkConfig({ ...workConfig, [configKey]: value });
                }
              } catch (err) {
                // 解析错误时不更新状态
              }
            }}
            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all font-mono text-sm"
            rows="6"
          ></textarea>
        </div>
      );
    }
    return null;
  };

  // 如果是记忆节点但流程配置中没有dialogueId，添加它
  useEffect(() => {
    if (isMemoryNode(node) && !flowConfig.dialogueId) {
      setFlowConfig(prev => ({
        ...prev,
        dialogueId: 'default'
      }));
    }
  }, [flowConfig, node]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isMemoryNode(node) && !workflowId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 text-sm text-yellow-700 flex items-start">
          <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
          <span>未能获取工作流ID，对话选择器可能无法正常工作</span>
        </div>
      )}
      
      <Tabs defaultValue="flow" className="w-full flex-1 flex flex-col overflow-hidden">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="flow">流程配置</TabsTrigger>
          <TabsTrigger value="work">运行时配置</TabsTrigger>
        </TabsList>

        <TabsContent 
          value="flow" 
          className="flex-1 data-[state=active]:flex flex-col overflow-hidden"
        >
          <ScrollArea className="flex-1 h-[calc(100%-2rem)] overflow-auto pr-4">
            <div className="space-y-1 pb-4">
              {isMemoryNode(node) && !Object.keys(flowConfig).includes('dialogueId') && (
                <div className="mb-4">
                  <DialogueSelector
                    workflowId={workflowId}
                    value="default"
                    onChange={(value) => {
                      setFlowConfig({ ...flowConfig, dialogueId: value });
                    }}
                    historyRounds={flowConfig.historyRounds || 5}
                    onHistoryRoundsChange={(rounds) => {
                      setFlowConfig({ ...flowConfig, historyRounds: rounds });
                    }}
                    onError={(error) => console.error('对话选择器错误:', error)}
                  />
                </div>
              )}
              
              {Object.entries(flowConfig).map(([key, value]) => 
                renderConfigField(key, value, true)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent 
          value="work" 
          className="flex-1 data-[state=active]:flex flex-col overflow-hidden"
        >
          <ScrollArea className="flex-1 h-[calc(100%-2rem)] overflow-auto pr-4">
            <div className="space-y-1 pb-4">
              {Object.entries(workConfig).map(([key, value]) => 
                renderConfigField(key, value, false)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      <Button onClick={handleSave} size="lg" className="w-full mt-4">
        <Save className="w-4 h-4 mr-2" /> 保存节点配置
      </Button>
    </div>
  );
}

export default NodeConfigPanel; 