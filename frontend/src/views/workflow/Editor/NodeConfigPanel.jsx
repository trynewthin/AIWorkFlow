import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * @component NodeConfigPanel
 * @description 节点配置面板组件
 */
function NodeConfigPanel({ node, onSave }) {
  const [flowConfig, setFlowConfig] = useState(node.flow_config || {});
  const [workConfig, setWorkConfig] = useState(node.work_config || {});

  // 当节点变更时更新配置状态
  useEffect(() => {
    setFlowConfig(node.flow_config || {});
    setWorkConfig(node.work_config || {});
  }, [node]);

  // 处理保存操作
  const handleSave = () => {
    onSave(flowConfig, workConfig);
  };

  // 渲染通用配置控件
  const renderConfigField = (configKey, configValue, isFlowConfig = true) => {
    // 判断值类型，渲染不同的输入控件
    if (typeof configValue === 'string') {
      return (
        <div className="mb-4" key={configKey}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {configKey}
          </label>
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

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="flow" className="w-full flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="flow">流程配置</TabsTrigger>
          <TabsTrigger value="work">运行时配置</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flow" className="flex-1 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-1">
              {Object.entries(flowConfig).map(([key, value]) => 
                renderConfigField(key, value, true)
              )}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="work" className="flex-1 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-1">
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