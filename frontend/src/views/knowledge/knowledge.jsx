/**
 * 知识库列表页
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listKnowledgeBases, createKnowledgeBase, deleteKnowledgeBase } from '@/services/knowledgeService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, PlusCircle } from 'lucide-react';

/**
 * @description 知识库列表组件
 * @returns {JSX.Element}
 */
export default function Knowledge() {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 拉取知识库列表
  useEffect(() => {
    fetchBases();
  }, []);

  // 监听页面全局事件以打开新建知识库弹窗
  useEffect(() => {
    const openHandler = () => setIsCreateOpen(true);
    window.addEventListener('openCreateKB', openHandler);
    return () => window.removeEventListener('openCreateKB', openHandler);
  }, []);

  const fetchBases = async () => {
    setLoading(true);
    try {
      const res = await listKnowledgeBases();
      setKnowledgeBases(res);
    } catch (e) {
      console.error('获取知识库列表失败:', e);
    } finally {
      setLoading(false);
    }
  };

  // 创建知识库
  const handleCreate = async () => {
    try {
      await createKnowledgeBase({ name: newName, description: newDesc });
      setIsCreateOpen(false);
      setNewName('');
      setNewDesc('');
      fetchBases();
    } catch (e) {
      console.error('创建知识库失败:', e);
    }
  };

  // 删除知识库
  const handleDelete = async (id) => {
    try {
      await deleteKnowledgeBase(id);
      fetchBases();
    } catch (e) {
      console.error('删除知识库失败:', e);
    }
  };

  return (
    <div className="p-4">
      {/* 新建知识库弹窗，触发源为全局事件 openCreateKB */}
      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>新建知识库</SheetTitle>
          </SheetHeader>
          <div className="grid gap-4 p-4">
            <Input placeholder="名称" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <Input placeholder="描述" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
          </div>
          <SheetFooter className="flex-row items-center justify-center space-x-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
            <Button onClick={handleCreate}>创建</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除知识库</DialogTitle>
          </DialogHeader>
          <DialogDescription>您确定要删除此知识库吗？此操作不可恢复。</DialogDescription>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={() => { handleDelete(deleteTarget); setIsDeleteDialogOpen(false); }}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 增加页面顶部按钮区域 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">知识库列表</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" /> 创建知识库
        </Button>
      </div>
      
      {/* 加载状态 */}
      {loading && <div className="text-center py-4">正在加载...</div>}
      
      {/* 空状态提示 */}
      {!loading && knowledgeBases.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">暂无知识库，点击右上角添加新知识库</p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {knowledgeBases.map((kb) => (
            <div
              key={kb.id}
              className="relative border rounded-lg p-4 shadow hover:cursor-pointer"
              onClick={(e) => {
                // 如果正在处理删除操作，则不要导航
                if (e.defaultPrevented) return;
                navigate(`/knowledge/${kb.id}`);
              }}
            >
              <div className="text-lg font-bold truncate">{kb.name}</div>
              <div className="text-sm text-muted-foreground truncate">{kb.description}</div>
              {/* 卡片操作菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="size-5 text-gray-600" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={4} className="w-32">
                  <DropdownMenuItem onClick={(e) => { 
                    e.preventDefault(); 
                    setDeleteTarget(kb.id); 
                    setIsDeleteDialogOpen(true); 
                  }}>
                    删除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
