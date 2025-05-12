/**
 * 知识库详情页
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { listKnowledgeBases, listDocuments, deleteDocument, getDocumentChunks } from '@/api/knowledge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';

/**
 * 知识库详情组件
 * @returns {JSX.Element}
 */
export default function KnowledgeDetail() {
  const { kbId } = useParams();
  const [kbName, setKbName] = useState('');
  const [documents, setDocuments] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentDoc, setCurrentDoc] = useState(null);

  useEffect(() => {
    fetchKbName();
    fetchDocuments();
  }, [kbId]);

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
    if (!window.confirm('确认删除此文档？')) return;
    try {
      await deleteDocument(id);
      fetchDocuments();
    } catch (e) {
      console.error('删除文档失败:', e);
    }
  };

  const openDocument = (doc) => {
    setCurrentDoc(doc);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">知识库：{kbName}</h1>
        <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
          <SheetTrigger asChild>
            <Button>添加文档</Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>添加文档（TODO 实现）</SheetTitle>
            </SheetHeader>
            {/* 在此处添加文档上传或输入表单 */}
            <SheetFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>取消</Button>
              <Button onClick={() => setIsAddOpen(false)}>确认</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      <div className="mt-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="relative w-60 h-72 bg-gradient-to-l from-amber-200 to-amber-100 text-slate-600 border border-slate-300 p-4 grid grid-rows-[auto,1fr,auto] gap-4 rounded-lg shadow-md"
          >
            <div className="text-lg font-bold truncate capitalize">{doc.title}</div>
            <div
              className="text-sm"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {doc.snippet}
            </div>
            <div className="absolute top-2 right-2 flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => openDocument(doc)}>查看</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>删除</Button>
            </div>
          </div>
        ))}
      </div>
      {/* 文档详情模态 TODO，可使用 Sheet 或其他 UI 组件 */}
    </div>
  );
} 