/**
 * 知识库列表页
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listKnowledgeBases, createKnowledgeBase, deleteKnowledgeBase } from '@/api/knowledge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle } from '@/components/ui/sheet';

/**
 * 知识库列表组件
 * @returns {JSX.Element}
 */
export default function Knowledge() {
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  // 拉取知识库列表
  useEffect(() => {
    fetchBases();
  }, []);

  const fetchBases = async () => {
    try {
      const res = await listKnowledgeBases();
      setKnowledgeBases(res);
    } catch (e) {
      console.error('获取知识库列表失败:', e);
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
    if (!window.confirm('确认删除此知识库？')) return;
    try {
      await deleteKnowledgeBase(id);
      fetchBases();
    } catch (e) {
      console.error('删除知识库失败:', e);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>新建知识库</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>新建知识库</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 p-4">
              <Input placeholder="名称" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="描述" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
            <SheetFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>取消</Button>
              <Button onClick={handleCreate}>创建</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {knowledgeBases.map((kb) => (
          <div
            key={kb.id}
            className="relative border rounded-lg p-4 shadow hover:cursor-pointer"
            onClick={() => navigate(`/knowledge/${kb.id}`)}
          >
            <div className="text-lg font-bold truncate">{kb.name}</div>
            <div className="text-sm text-muted-foreground truncate">{kb.description}</div>
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={(e) => { e.stopPropagation(); handleDelete(kb.id); }}
            >删除</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
