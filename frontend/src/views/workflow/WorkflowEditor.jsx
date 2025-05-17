import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowService, configService } from '../../services';
import { ArrowLeft, Save, Play, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

// UI 组件导入
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import PageHeader from '@/components/ui/PageHeader';

/**
 * @component WorkflowEditor
 * @description 工作流编辑器页面
 */
function WorkflowEditor() {
  // 状态定义
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodeTypes, setNodeTypes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  // 路由参数和导航
  const { id } = useParams();
  const navigate = useNavigate();

  // 加载工作流详情和节点类型列表
  useEffect(() => {
    const loadWorkflowAndNodeTypes = async () => {
      setLoading(true);
      setError(null); // 重置错误状态
      try {
        // 并行加载工作流和节点类型
        const [workflowResponse, nodeTypesResponse] = await Promise.all([
          workflowService.getWorkflow(id),
          workflowService.getNodeTypes()
        ]);
        
        setWorkflow(workflowResponse);
        setNodeTypes(nodeTypesResponse);
      } catch (err) {
        setError('加载数据失败：' + err.message);
        setWorkflow(null);
        setNodeTypes([]);
        console.error('加载数据失败', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflowAndNodeTypes();
  }, [id]);

  // 添加新节点
  const addNewNode = async (nodeType) => {
    try {
      await workflowService.addNode({
        workflowId: workflow.id, 
        nodeType, 
        index: workflow.nodes ? workflow.nodes.length : 0
      });
      
      // 刷新工作流数据
      const refreshedWorkflow = await workflowService.getWorkflow(id);
      setWorkflow(refreshedWorkflow);
      
      // 选择新添加的节点进行编辑
      if (refreshedWorkflow.nodes && refreshedWorkflow.nodes.length > 0) {
        setSelectedNode(refreshedWorkflow.nodes[refreshedWorkflow.nodes.length - 1]);
      }
    } catch (err) {
      setError('添加节点失败：' + err.message);
      console.error('添加节点失败', err);
    }
  };

  // 更新节点配置
  const saveNodeConfig = async (nodeId, flowConfig, workConfig) => {
    try {
      await workflowService.updateNode(nodeId, { flowConfig, workConfig });
      
      // 刷新工作流数据
      const refreshedWorkflow = await workflowService.getWorkflow(id);
      setWorkflow(refreshedWorkflow);
      
      // 更新选中的节点
      if (selectedNode && selectedNode.id === nodeId) {
        const updatedNode = refreshedWorkflow.nodes.find(node => node.id === nodeId);
        if (updatedNode) {
          setSelectedNode(updatedNode);
        }
      }
      alert('节点配置已保存');
    } catch (err) {
      setError('更新节点失败：' + err.message);
      console.error('更新节点失败', err);
    }
  };

  // 删除节点
  const removeNode = async (nodeId) => {
    if (!window.confirm('确定要删除此节点吗？')) return;
    
    try {
      await workflowService.deleteNode(nodeId);
      
      // 刷新工作流数据
      const refreshedWorkflow = await workflowService.getWorkflow(id);
      setWorkflow(refreshedWorkflow);
      
      // 如果删除的是当前选中的节点，则清除选择
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
      }
    } catch (err) {
      setError('删除节点失败：' + err.message);
      console.error('删除节点失败', err);
    }
  };

  // 移动节点位置
  const moveNodePosition = async (nodeId, newIndex) => {
    try {
      await workflowService.moveNode(nodeId, newIndex);
      
      // 刷新工作流数据
      const refreshedWorkflow = await workflowService.getWorkflow(id);
      setWorkflow(refreshedWorkflow);
    } catch (err) {
      setError('移动节点失败：' + err.message);
      console.error('移动节点失败', err);
    }
  };

  // 前往执行页面
  const goToExecutePage = () => {
    navigate(`/workflow/${id}/execute`);
  };

  // 当选择一个节点时的处理函数
  const handleNodeSelect = (node) => {
    console.log("Selected Node Details:", JSON.stringify(node, null, 2));
    setSelectedNode(node);
  };

  // 返回列表页面
  const goToListPage = () => {
    navigate('/workflow');
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">正在加载工作流数据...</div>
      </div>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={goToListPage}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 顶部工具栏 */}
      <PageHeader title="编辑工作流" onBack={goToListPage}>
        <Button variant="default" onClick={goToExecutePage}>
          <Play className="w-4 h-4 mr-2" /> 执行
        </Button>
      </PageHeader>

      {/* 主要编辑区域 */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* 左侧节点类型面板 */}
        <Card className="lg:w-1/5">
          <CardHeader>
            <CardTitle>可用节点</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nodeTypes.map(nodeType => (
                <div 
                  key={nodeType}
                  className="p-2 bg-white rounded border cursor-pointer hover:bg-blue-50"
                  onClick={() => addNewNode(nodeType)}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{nodeType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 中央工作流节点面板 */}
        <Card className="lg:w-2/5 min-h-[400px]">
          <CardHeader>
            <CardTitle>节点列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workflow.nodes && workflow.nodes.length > 0 ? (
                workflow.nodes.map((node, index) => (
                  <div 
                    key={node.id}
                    className={`p-3 rounded border ${selectedNode && selectedNode.id === node.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
                    onClick={() => handleNodeSelect(node)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{node.flow_config?.nodeName || '未命名节点'}</p>
                          <p className="text-xs text-gray-500">{node.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {index > 0 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              moveNodePosition(node.id, index - 1);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                        )}
                        {index < workflow.nodes.length - 1 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              moveNodePosition(node.id, index + 1);
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNode(node.id);
                          }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-white rounded-lg border">
                  <p className="text-gray-500">暂无节点，请从左侧添加</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 右侧配置面板 */}
        <Card className="lg:w-2/5">
          <CardHeader>
            <CardTitle>节点配置</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <NodeConfigPanel 
                key={selectedNode.id}
                node={selectedNode} 
                onSave={(flowConfig, workConfig) => saveNodeConfig(selectedNode.id, flowConfig, workConfig)}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">请选择一个节点进行配置</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
        <div className="mb-3" key={configKey}>
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
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      );
    }
    else if (typeof configValue === 'number') {
      return (
        <div className="mb-3" key={configKey}>
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
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      );
    }
    else if (typeof configValue === 'boolean') {
      return (
        <div className="mb-3" key={configKey}>
          <label className="flex items-center">
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
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">{configKey}</span>
          </label>
        </div>
      );
    }
    else if (Array.isArray(configValue)) {
      // 简单处理数组显示，实际可能需要更复杂的UI
      return (
        <div className="mb-3" key={configKey}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {configKey} (数组)
          </label>
          <textarea
            value={JSON.stringify(configValue)}
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
            className="w-full px-3 py-2 border rounded"
            rows="3"
          ></textarea>
        </div>
      );
    }
    else if (typeof configValue === 'object' && configValue !== null) {
      // 简单处理对象显示，实际可能需要更复杂的UI
      return (
        <div className="mb-3" key={configKey}>
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
            className="w-full px-3 py-2 border rounded"
            rows="5"
          ></textarea>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="bg-white p-4 rounded border mb-4">
        <h3 className="font-medium mb-3">流程配置</h3>
        {Object.entries(flowConfig).map(([key, value]) => 
          renderConfigField(key, value, true)
        )}
      </div>
      
      <div className="bg-white p-4 rounded border mb-4">
        <h3 className="font-medium mb-3">运行时配置</h3>
        {Object.entries(workConfig).map(([key, value]) => 
          renderConfigField(key, value, false)
        )}
      </div>
      
      <Button onClick={handleSave} className="w-full">
        <Save className="w-4 h-4 mr-2" /> 保存节点配置
      </Button>
    </div>
  );
}

export default WorkflowEditor; 