import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Pencil, ChevronUp, ChevronDown, Trash, AlertTriangle } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import NodeConfigPanel from './NodeConfigPanel';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';

/**
 * @component NodesList
 * @description 可用节点列表面板
 */
function NodesList({ nodeTypes, addNewNode }) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">可用节点</h3>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-2 pr-4">
          {nodeTypes.map(nodeType => (
            <div 
              key={nodeType}
              className="group flex items-center p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              onClick={() => addNewNode(nodeType)}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-blue-100 text-blue-600">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{nodeType}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * @component DeleteDialog
 * @description 删除节点确认对话框
 */
function DeleteDialog({ nodeName, onConfirm }) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>确认删除节点</DialogTitle>
        <DialogDescription>
          您确定要删除节点 "{nodeName}" 吗？此操作无法撤销。
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onConfirm(false)}>取消</Button>
        <Button variant="destructive" onClick={() => onConfirm(true)}>删除</Button>
      </DialogFooter>
    </DialogContent>
  );
}

/**
 * @component WorkflowNodes
 * @description 工作流节点列表组件，包含节点编辑功能
 */
export function WorkflowNodes({ 
  nodes = [], 
  selectedNodeId = null, 
  onNodeSelect, 
  onNodeMove, 
  onNodeDelete,
  onNodeConfigSave
}) {
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState(null);
  
  // 获取当前选中的节点
  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  // 处理删除确认
  const handleDeleteConfirm = (confirmed) => {
    if (confirmed && nodeToDelete) {
      onNodeDelete(nodeToDelete);
    }
    setDeleteDialogOpen(false);
    setNodeToDelete(null);
  };

  return (
    <>
      <ScrollArea className="h-full">
        <div className="space-y-2 p-4">
          {nodes.length > 0 ? (
            nodes.map((node, index) => {
              const isSelected = selectedNodeId === node.id;
              
              return (
                <div 
                  key={node.id}
                  className={`
                    p-3 rounded-lg border transition-all duration-200
                    ${isSelected 
                      ? 'border-black bg-gray-100 shadow-sm' 
                      : 'border-gray-200 bg-white hover:bg-gray-100 hover:border-gray-300 hover:shadow-sm'}
                  `}
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-lg flex items-center justify-center mr-3">
                        <span className="font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{node.flow_config?.nodeName || '未命名节点'}</p>
                        <p className="text-xs text-gray-500">{node.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {/* 编辑配置按钮，仅当节点被选中时显示 */}
                      {isSelected && (
                        <Sheet open={configPanelOpen} onOpenChange={setConfigPanelOpen}>
                          <SheetTrigger asChild>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-all"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </SheetTrigger>
                          <SheetContent side="right" className="w-[400px] sm:w-[540px] p-6 border-l shadow-lg">
                            <h3 className="text-lg font-semibold mb-4">编辑节点配置</h3>
                            {selectedNode && (
                              <NodeConfigPanel 
                                key={selectedNode.id}
                                node={selectedNode} 
                                onSave={(flowConfig, workConfig) => {
                                  onNodeConfigSave(selectedNode.id, flowConfig, workConfig);
                                  setConfigPanelOpen(false);
                                }}
                              />
                            )}
                          </SheetContent>
                        </Sheet>
                      )}
                      
                      {/* 上移按钮 */}
                      {index > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNodeMove(node.id, index - 1);
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-all"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* 下移按钮 */}
                      {index < nodes.length - 1 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onNodeMove(node.id, index + 1);
                          }}
                          className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded transition-all"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* 删除按钮 */}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setNodeToDelete(node.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border">
              <p className="text-gray-500">暂无节点，请点击"添加节点"</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DeleteDialog 
          nodeName={nodes.find(n => n.id === nodeToDelete)?.flow_config?.nodeName || '未命名节点'} 
          onConfirm={handleDeleteConfirm} 
        />
      </Dialog>
    </>
  );
}

export default NodesList; 