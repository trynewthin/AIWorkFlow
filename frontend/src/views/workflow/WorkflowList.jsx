import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 从新的服务中导入相关函数
import { workflowService } from '../../services';
import { PlusCircle, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
// 从 @/components/ui/sheet 导入所需组件
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input'; // 导入 Input 组件
import { Button } from '@/components/ui/button'; // 导入 Button 组件，如果需要自定义样式或行为
import { Textarea } from '@/components/ui/textarea'; // 导入 Textarea 组件
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/ui/PageHeader';

/**
 * @component WorkflowList
 * @description 工作流列表页面
 */
function WorkflowList() {
  // 状态定义
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false); // 此状态将用于控制 Sheet 的 open 属性
  const [newWorkflow, setNewWorkflow] = useState({ name: '', description: '' });
  
  // 新增状态用于详情/编辑Sheet
  const [showInfoSheet, setShowInfoSheet] = useState(false);
  const [currentWorkflowInSheet, setCurrentWorkflowInSheet] = useState({ id: null, name: '', description: '' });
  
  const navigate = useNavigate();

  // 加载工作流列表
  const loadWorkflows = async () => {
    setLoading(true);
    setError(null); // 重置错误状态
    try {
      const workflowData = await workflowService.listWorkflows(); // 使用 workflowService
      setWorkflows(workflowData || []); // 确保是数组
    } catch (err) {
      setError('加载工作流列表发生通信错误：' + err.message);
      setWorkflows([]);
      console.error('加载工作流列表发生通信错误', err);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载列表
  useEffect(() => {
    loadWorkflows();
  }, []);

  // 删除工作流
  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除此工作流吗？')) return;
    
    try {
      await workflowService.deleteWorkflow(id); // 使用 workflowService
      // 重新加载列表
      loadWorkflows();
    } catch (err) {
      setError('删除工作流失败：' + err.message);
      console.error('删除工作流失败', err);
    }
  };

  // 创建新工作流
  const handleCreateWorkflow = async () => {
    if (!newWorkflow.name.trim()) {
      setError('工作流名称不能为空'); 
      return;
    }

    try {
      await workflowService.createWorkflow({ // 使用 workflowService
        name: newWorkflow.name, 
        description: newWorkflow.description 
      });
      setShowCreateModal(false); // 关闭 Sheet
      setNewWorkflow({ name: '', description: '' }); // 清空表单
      loadWorkflows(); // 重新加载列表
    } catch (err) {
      setError('创建工作流失败：' + err.message);
      console.error('创建工作流失败', err);
    }
  };

  // 新增：处理在Sheet中编辑工作流信息的表单变化
  const handleCurrentWorkflowChange = (field, value) => {
    setCurrentWorkflowInSheet(prev => ({ ...prev, [field]: value }));
  };

  // 新增：保存工作流信息变更
  const handleUpdateWorkflowInfo = async () => {
    if (!currentWorkflowInSheet.name.trim()) {
      setError('工作流名称不能为空'); 
      return;
    }
    if (!currentWorkflowInSheet.id) {
      setError('无法更新工作流：ID缺失');
      return;
    }

    try {
      await workflowService.updateWorkflow(currentWorkflowInSheet.id, { // 使用 workflowService
        name: currentWorkflowInSheet.name, 
        description: currentWorkflowInSheet.description 
      });
      setShowInfoSheet(false); // 关闭Sheet
      loadWorkflows(); // 重新加载列表
      setError(null); // 清除之前的错误
    } catch (err) {
      setError('更新工作流信息失败：' + err.message);
      console.error('更新工作流信息失败', err);
    }
  };
  
  // 新增：打开详情/编辑Sheet的函数
  const handleShowInfo = (workflow) => {
    setCurrentWorkflowInSheet({ id: workflow.id, name: workflow.name, description: workflow.description || '' });
    setShowInfoSheet(true);
  };

  // 导航到工作流详情页
  const goToWorkflowDetail = (id) => {
    navigate(`/workflow/${id}`);
  };

  // 导航到工作流编辑页
  const goToWorkflowEdit = (id) => {
    navigate(`/workflow/${id}`);
  };

  // 导航到工作流执行页
  const goToWorkflowExecute = (id) => {
    navigate(`/workflow/${id}/execute`);
  };

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="工作流列表">
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> 创建工作流
        </Button>
      </PageHeader>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 加载状态 */}
      {loading && <div className="text-center py-4">正在加载...</div>}

      {/* 工作流列表 */}
      {!loading && workflows.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">暂无工作流，点击右上角添加新工作流</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader>
                <CardTitle>{workflow.name}</CardTitle>
                <CardAction>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded hover:bg-gray-100" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" sideOffset={4} className="w-32">
                      <DropdownMenuItem onClick={(e) => { e.preventDefault(); handleShowInfo(workflow); }}>详情</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.preventDefault(); goToWorkflowEdit(workflow.id); }}>编辑</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.preventDefault(); goToWorkflowExecute(workflow.id); }}>执行</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={(e) => { e.preventDefault(); handleDelete(workflow.id); }}>删除</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardAction>
              </CardHeader>
              <CardContent className="p-4">
                <CardDescription className="text-gray-600 text-sm mb-4 line-clamp-2">{workflow.description || '暂无描述'}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 创建工作流 Sheet */}
      <Sheet open={showCreateModal} onOpenChange={setShowCreateModal}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>创建新工作流</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4 px-2"> {/* 调整内边距 */}
            <div className="grid grid-cols-1 items-center gap-2"> {/* 调整布局和间距 */}
              <label htmlFor="workflow-name" className="text-sm font-medium"> {/* 使用 label 关联 input */}
                工作流名称 <span className="text-red-500">*</span>
              </label>
              <Input
                id="workflow-name" // 添加 id 以便 label 关联
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                placeholder="输入工作流名称"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-2">
              <label htmlFor="workflow-description" className="text-sm font-medium">
                工作流描述
              </label>
              <Textarea
                id="workflow-description"
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                placeholder="输入工作流描述（可选）"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <SheetFooter className="flex-row items-center justify-center space-x-2 p-2"> {/* 调整内边距和子元素布局 */}
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>取消</Button>
            <Button onClick={handleCreateWorkflow}>创建</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 新增：用于显示和编辑工作流信息的Sheet */}
      <Sheet open={showInfoSheet} onOpenChange={setShowInfoSheet}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>工作流详情</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 py-4 px-2">
            <div className="grid grid-cols-1 items-center gap-2">
              <label htmlFor="info-workflow-name" className="text-sm font-medium">
                工作流名称 <span className="text-red-500">*</span>
              </label>
              <Input
                id="info-workflow-name"
                value={currentWorkflowInSheet.name}
                onChange={(e) => handleCurrentWorkflowChange('name', e.target.value)}
                placeholder="输入工作流名称"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-1 items-center gap-2">
              <label htmlFor="info-workflow-description" className="text-sm font-medium">
                工作流描述
              </label>
              <Textarea
                id="info-workflow-description"
                value={currentWorkflowInSheet.description}
                onChange={(e) => handleCurrentWorkflowChange('description', e.target.value)}
                placeholder="输入工作流描述（可选）"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <SheetFooter className="flex-row items-center justify-center space-x-2 p-2">
            <Button variant="outline" onClick={() => setShowInfoSheet(false)}>取消</Button>
            <Button onClick={handleUpdateWorkflowInfo}>保存更改</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default WorkflowList; 