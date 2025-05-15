/**
 * 知识库详情页
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  listKnowledgeBases, 
  listDocuments, 
  deleteDocument, 
  getDocumentChunks, 
  uploadAndIngestFile 
} from '@/services/knowledgeService';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
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
import { MoreVertical } from 'lucide-react';

/**
 * 知识库详情组件
 * @returns {JSX.Element}
 */
export default function KnowledgeDetail() {
  const { kbId } = useParams();
  const [kbName, setKbName] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDocDetailOpen, setIsDocDetailOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [docChunks, setDocChunks] = useState([]);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchKbName();
    fetchDocuments();
  }, [kbId]);

  // 监听添加文档事件
  useEffect(() => {
    const openHandler = () => setIsAddOpen(true);
    window.addEventListener('openAddDocument', openHandler);
    return () => window.removeEventListener('openAddDocument', openHandler);
  }, []);

  const fetchKbName = async () => {
    try {
      const bases = await listKnowledgeBases();
      const base = bases.find(b => String(b.id) === kbId);
      setKbName(base ? base.name : '');
    } catch (e) {
      console.error('获取知识库名称失败:', e);
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await listDocuments(kbId);
      const docsWithSnippets = await Promise.all(
        docs.map(async (d) => {
          let snippet = '';
          try {
            const chunks = await getDocumentChunks(d.id);
            snippet = chunks.length > 0 ? chunks[0].chunk_text : '';
          } catch (e) {
            console.error('获取文档分块失败:', e);
          }
          return { ...d, snippet };
        })
      );
      setDocuments(docsWithSnippets);
    } catch (e) {
      console.error('获取文档列表失败:', e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(id);
      fetchDocuments();
    } catch (e) {
      console.error('删除文档失败:', e);
    }
  };

  const openDocument = async (doc) => {
    setCurrentDoc(doc);
    try {
      const chunks = await getDocumentChunks(doc.id);
      setDocChunks(chunks);
      setIsDocDetailOpen(true);
    } catch (e) {
      console.error('获取文档分块失败:', e);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!fileToUpload) return;
    
    setIsUploading(true);
    try {
      // 使用新的服务方法上传并入库文件
      await uploadAndIngestFile(fileToUpload, kbId);
      
      // 入库成功，重置状态和刷新文档列表
      setIsAddOpen(false);
      setFileToUpload(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchDocuments();
    } catch (e) {
      console.error('文档入库失败:', e);
      alert('文档处理失败: ' + (e.message || '未知错误'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">知识库：{kbName}</h3>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>添加文档</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 p-4">
              <div className="space-y-2">
                <label htmlFor="file-upload" className="block text-sm font-medium">
                  选择文件
                </label>
                <Input 
                  id="file-upload" 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  disabled={isUploading} 
                />
              </div>
              {fileToUpload && (
                <div className="text-sm">
                  已选择: {fileToUpload.name}
                </div>
              )}
              {isUploading && (
                <div className="text-sm text-yellow-600">
                  文件上传中，请稍候...这可能需要一些时间
                </div>
              )}
            </div>
            <SheetFooter className="flex-row items-center justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsAddOpen(false);
                setFileToUpload(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }} disabled={isUploading}>
                取消
              </Button>
              <Button onClick={handleFileUpload} disabled={!fileToUpload || isUploading}>
                {isUploading ? '处理中...' : '上传'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      
      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除文档</DialogTitle>
          </DialogHeader>
          <DialogDescription>您确定要删除此文档吗？此操作不可恢复。</DialogDescription>
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={() => { handleDelete(deleteTarget); setIsDeleteDialogOpen(false); }}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 文档详情对话框 */}
      <Sheet open={isDocDetailOpen} onOpenChange={setIsDocDetailOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col" hideCloseButton>
          <div className="border-b pb-2">
            <SheetHeader>
              <SheetTitle>{currentDoc?.title}</SheetTitle>
            </SheetHeader>
          </div>
          <div className="pt-2 px-4 overflow-y-auto flex-grow">
            <ul className="list-disc list-inside space-y-3">
              {docChunks.map((chunk) => (
                <li key={chunk.chunk_id} className="text-sm bg-muted p-3 rounded-md shadow-sm">
                  {chunk.chunk_text}
                </li>
              ))}
            </ul>
          </div>
          <SheetFooter className="flex justify-center p-2 border-t mt-auto">
            <Button onClick={() => setIsDocDetailOpen(false)}>关闭</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      
      <div className="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* 文档卡片 */}
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className="w-full cursor-pointer relative hover:shadow-md transition-shadow"
            onClick={() => openDocument(doc)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg truncate capitalize">{doc.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="text-sm text-muted-foreground"
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '3rem'
                }}
              >
                {doc.snippet}
              </div>
            </CardContent>
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
                  e.stopPropagation(); // 阻止事件冒泡到卡片
                  setDeleteTarget(doc.id); 
                  setIsDeleteDialogOpen(true); 
                }}>
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        ))}
      </div>
    </div>
  );
} 