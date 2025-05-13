import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkflow, updateWorkflow, addNode, updateNode, deleteNode, moveNode, getNodeTypes } from '../../api/workflow';
import { getDefaultFlowConfig, getDefaultWorkConfig, getNodeConfigByType } from '../../api/workflow';
import { ArrowLeft, Save, Play, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

// FlowGram导入
import { 
  FreeLayoutEditorProvider, 
  EditorRenderer, 
  WorkflowNodeRenderer, 
  useNodeRender, 
  ValidateTrigger,
  Field,
  useService,
  useClientContext
} from '@flowgram.ai/free-layout-editor';
import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { createFreeSnapPlugin } from '@flowgram.ai/free-snap-plugin';

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
  const [editingWorkflowInfo, setEditingWorkflowInfo] = useState({
    name: '',
    description: ''
  });
  const [isFlowgramMode, setIsFlowgramMode] = useState(false);
  const [flowgramData, setFlowgramData] = useState(null);

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
          getWorkflow(id),
          getNodeTypes()
        ]);
        
        let workflowData = null;
        if (workflowResponse && workflowResponse.success && workflowResponse.data) {
          workflowData = workflowResponse.data;
          setWorkflow(workflowData);
          setEditingWorkflowInfo({
            name: workflowData.name,
            description: workflowData.description
          });
        } else {
          const errorMessage = workflowResponse && workflowResponse.message ? workflowResponse.message : '获取工作流详情失败';
          throw new Error(errorMessage);
        }
        
        if (nodeTypesResponse && nodeTypesResponse.success && nodeTypesResponse.data) {
          setNodeTypes(nodeTypesResponse.data);
        } else {
          const errorMessage = nodeTypesResponse && nodeTypesResponse.message ? nodeTypesResponse.message : '获取节点类型失败';
          throw new Error(errorMessage);
        }
        
        // 只有在 workflowData 加载成功后才处理 FlowGram 数据转换
        if (workflowData && workflowData.nodes && workflowData.nodes.length > 0) {
          const flowgramNodes = workflowData.nodes.map((node, index) => ({
            id: node.id,
            type: node.type,
            data: {
              ...node.flowConfig,
              ...node.workConfig
            },
            meta: {
              position: { x: 100 + index * 250, y: 100 + (index % 2) * 150 }
            }
          }));
          
          // 生成连接线数据 (确保节点存在)
          const flowgramEdges = [];
          if (flowgramNodes.length > 1) {
            for (let i = 0; i < flowgramNodes.length - 1; i++) {
              flowgramEdges.push({
                id: `edge_${flowgramNodes[i].id}_${flowgramNodes[i+1].id}`,
                source: flowgramNodes[i].id,
                sourcePortId: `${flowgramNodes[i].id}_output`, // 确保 portId 唯一且有意义
                target: flowgramNodes[i+1].id,
                targetPortId: `${flowgramNodes[i+1].id}_input` // 确保 portId 唯一且有意义
              });
            }
          }
          
          setFlowgramData({
            nodes: flowgramNodes,
            edges: flowgramEdges
          });
        } else {
          setFlowgramData({ nodes: [], edges: [] }); // 设置空数据以避免后续渲染错误
        }
        
      } catch (err) {
        // 捕获 Promise.all 中的失败或者我们自己抛出的错误
        setError('加载数据失败：' + err.message);
        setWorkflow(null);
        setNodeTypes([]);
        setFlowgramData(null);
        console.error('加载数据失败', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflowAndNodeTypes();
  }, [id]);

  // 保存工作流基本信息
  const saveWorkflowInfo = async () => {
    try {
      await updateWorkflow(
        id,
        editingWorkflowInfo.name,
        editingWorkflowInfo.description
      );
      
      // 更新成功后刷新工作流数据
      const workflowData = await getWorkflow(id);
      setWorkflow(workflowData);
      
      alert('保存成功');
    } catch (err) {
      setError('保存失败：' + err.message);
      console.error('保存工作流信息失败', err);
    }
  };

  // 添加新节点
  const addNewNode = async (nodeType) => {
    try {
      // 获取节点默认配置
      const [defaultFlowConfig, defaultWorkConfig] = await Promise.all([
        getDefaultFlowConfig(nodeType),
        getDefaultWorkConfig(nodeType)
      ]);
      
      // 添加新节点
      await addNode(
        workflow.id, 
        nodeType, 
        defaultFlowConfig, 
        defaultWorkConfig,
        workflow.nodes ? workflow.nodes.length : 0
      );
      
      // 刷新工作流数据
      const updatedWorkflow = await getWorkflow(id);
      setWorkflow(updatedWorkflow);
      
      // 选择新添加的节点进行编辑
      if (updatedWorkflow.nodes && updatedWorkflow.nodes.length > 0) {
        setSelectedNode(updatedWorkflow.nodes[updatedWorkflow.nodes.length - 1]);
      }
    } catch (err) {
      setError('添加节点失败：' + err.message);
      console.error('添加节点失败', err);
    }
  };

  // 更新节点配置
  const saveNodeConfig = async (nodeId, flowConfig, workConfig) => {
    try {
      await updateNode(nodeId, flowConfig, workConfig);
      
      // 刷新工作流数据
      const updatedWorkflow = await getWorkflow(id);
      setWorkflow(updatedWorkflow);
      
      // 更新选中的节点
      if (selectedNode && selectedNode.id === nodeId) {
        const updatedNode = updatedWorkflow.nodes.find(node => node.id === nodeId);
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
      await deleteNode(nodeId);
      
      // 刷新工作流数据
      const updatedWorkflow = await getWorkflow(id);
      setWorkflow(updatedWorkflow);
      
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
      await moveNode(nodeId, newIndex);
      
      // 刷新工作流数据
      const updatedWorkflow = await getWorkflow(id);
      setWorkflow(updatedWorkflow);
    } catch (err) {
      setError('移动节点失败：' + err.message);
      console.error('移动节点失败', err);
    }
  };

  // 前往执行页面
  const goToExecutePage = () => {
    navigate(`/workflow/${id}/execute`);
  };

  // 返回列表页面
  const goToListPage = () => {
    navigate('/workflow');
  };

  // 配置FlowGram编辑器属性
  const flowgramEditorProps = useMemo(() => {
    if (!flowgramData) return null;
    
    return {
      // 启用背景网格
      background: true,
      // 非只读模式
      readonly: false,
      // 初始数据
      initialData: flowgramData,
      // 节点类型注册
      nodeRegistries: nodeTypes.map(nodeType => ({
        type: nodeType,
        meta: {
          defaultPorts: [{ type: 'input' }, { type: 'output' }],
          defaultExpanded: true,
        },
        formMeta: {
          validateTrigger: ValidateTrigger.onChange,
          render: () => (
            <>
              <Field name="nodeName">
                {({ field }) => (
                  <div className="text-center font-medium py-2">
                    {field.value || nodeType}
                  </div>
                )}
              </Field>
            </>
          )
        }
      })),
      // 获取默认节点注册
      getNodeDefaultRegistry(type) {
        return {
          type,
          meta: {
            defaultPorts: [{ type: 'input' }, { type: 'output' }],
            defaultExpanded: true,
          },
          formMeta: {
            render: () => (
              <>
                <Field name="nodeName">
                  {({ field }) => (
                    <div className="text-center font-medium py-2">
                      {field.value || type}
                    </div>
                  )}
                </Field>
              </>
            )
          }
        };
      },
      // 自定义渲染
      materials: {
        renderDefaultNode: (props) => {
          const { form } = useNodeRender();
          return (
            <WorkflowNodeRenderer 
              className="demo-free-node bg-white border-2 border-gray-300 rounded-md p-2 min-w-[120px] min-h-[60px]" 
              node={props.node}
            >
              {form?.render()}
            </WorkflowNodeRenderer>
          );
        }
      },
      // 内容变更回调
      onContentChange(ctx, event) {
        console.log('数据变更:', event, ctx.document.toJSON());
      },
      // 启用节点表单引擎
      nodeEngine: {
        enable: true,
      },
      // 启用历史记录
      history: {
        enable: true,
        enableChangeNode: true, // 监听节点数据变化
      },
      // 初始化回调
      onInit: (ctx) => {
        console.log('编辑器已初始化');
      },
      // 渲染完成回调
      onAllLayersRendered(ctx) {
        ctx.document.fitView(false); // 自动适配视图
        console.log('所有图层已渲染');
      },
      // 销毁回调
      onDispose() {
        console.log('编辑器已销毁');
      },
      // 插件配置
      plugins: () => [
        // 缩略图插件
        createMinimapPlugin({
          disableLayer: true,
          canvasStyle: {
            canvasWidth: 182,
            canvasHeight: 102,
            canvasBackground: 'rgba(245, 245, 245, 1)',
          },
        }),
        // 吸附对齐插件
        createFreeSnapPlugin({
          edgeColor: '#00B2B2',
          alignColor: '#00B2B2',
          edgeLineWidth: 1,
        }),
      ],
    };
  }, [flowgramData, nodeTypes]);

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsFlowgramMode(!isFlowgramMode);
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
        <Button variant="outline" onClick={toggleEditMode}>
          {isFlowgramMode ? '切换到列表模式' : '切换到可视化模式'}
        </Button>
        <Button onClick={saveWorkflowInfo}>
          <Save className="w-4 h-4 mr-2" /> 保存
        </Button>
        <Button variant="default" onClick={goToExecutePage}>
          <Play className="w-4 h-4 mr-2" /> 执行
        </Button>
      </PageHeader>

      {/* 工作流基本信息表单 */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>工作流信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">工作流名称</label>
              <Input
                value={editingWorkflowInfo.name}
                onChange={(e) => setEditingWorkflowInfo({ ...editingWorkflowInfo, name: e.target.value })}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">工作流描述</label>
              <Textarea
                rows={1}
                value={editingWorkflowInfo.description}
                onChange={(e) => setEditingWorkflowInfo({ ...editingWorkflowInfo, description: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isFlowgramMode && flowgramEditorProps ? (
        // 可视化编辑模式
        <div className="mt-4" style={{ height: '70vh' }}>
          <FreeLayoutEditorProvider {...flowgramEditorProps}>
            <div className="h-full border rounded-lg overflow-hidden">
              {/* 节点类型面板 */}
              <div className="absolute left-4 top-20 z-10 bg-white p-4 rounded-lg shadow-lg border">
                <h3 className="font-medium mb-2">可用节点</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {nodeTypes.map(nodeType => (
                    <div
                      key={nodeType}
                      className="p-2 bg-gray-50 rounded border cursor-pointer hover:bg-blue-50"
                      onClick={() => {
                        // 在画布中心创建节点
                        const ctx = document.querySelector('.flowgram-editor')?.__flowgramContext;
                        if (ctx) {
                          // 使用文档的方法添加节点
                          ctx.document.addNode({ 
                            id: `node_${Date.now()}`, 
                            type: nodeType,
                            data: { nodeName: nodeType }
                          });
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm">{nodeType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 主编辑区域 */}
              <EditorRenderer className="flowgram-editor" />
            </div>
          </FreeLayoutEditorProvider>
        </div>
      ) : (
        // 列表编辑模式
        <div className="flex flex-col lg:flex-row gap-4">
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
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{node.flowConfig?.nodeName || '未命名节点'}</p>
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
      )}
    </div>
  );
}

/**
 * @component NodeConfigPanel
 * @description 节点配置面板组件
 */
function NodeConfigPanel({ node, onSave }) {
  const [flowConfig, setFlowConfig] = useState(node.flowConfig || {});
  const [workConfig, setWorkConfig] = useState(node.workConfig || {});

  // 当节点变更时更新配置状态
  useEffect(() => {
    setFlowConfig(node.flowConfig || {});
    setWorkConfig(node.workConfig || {});
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