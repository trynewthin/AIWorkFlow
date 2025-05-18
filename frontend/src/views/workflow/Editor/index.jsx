import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { workflowService, configService } from '../../../services';
import { ArrowLeft, Save, Play, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

// UI 组件导入
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

// 导入节点列表面板组件
import NodesList, { WorkflowNodes } from './NodesList';
// 导入编辑器顶部组件
import ButtonHeader from '@/components/header';

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
  const [isNodeListOpen, setIsNodeListOpen] = useState(false);

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
      
      // 添加节点后关闭节点列表面板
      setIsNodeListOpen(false);
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
    <div className="flex flex-col overflow-hidden">
      {/* 主要编辑区域 - 占满剩余空间 */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <ButtonHeader 
          title={workflow.name || "工作流编辑器"} 
          onBackClick={goToListPage}
        >
          <Sheet open={isNodeListOpen} onOpenChange={setIsNodeListOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="bg-black text-white hover:bg-gray-800 hover:text-white border-black hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4 mr-2" /> 添加节点
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[360px] p-6 border-l shadow-lg">
              <NodesList nodeTypes={nodeTypes} addNewNode={addNewNode} />
            </SheetContent>
          </Sheet>
          
          <Button 
            variant="outline" 
            className="bg-black text-white hover:bg-gray-800 hover:text-white border-black hover:shadow-md transition-all"
            onClick={goToExecutePage}
          >
            <Play className="w-4 h-4 mr-2" /> 执行
          </Button>
        </ButtonHeader>
        
        <Card className="max-h-[calc(100vh-140px)] min-h-[460px] flex flex-col overflow-hidden shadow-sm">
          <CardHeader className="flex-shrink-0 pb-2">
            <CardTitle>节点列表</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <WorkflowNodes 
              nodes={workflow.nodes || []}
              selectedNodeId={selectedNode ? selectedNode.id : null}
              onNodeSelect={handleNodeSelect}
              onNodeMove={moveNodePosition}
              onNodeDelete={removeNode}
              onNodeConfigSave={saveNodeConfig}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WorkflowEditor; 