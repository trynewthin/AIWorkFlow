/**
 * @component WorkflowGraph
 * @description ReactFlow 可视化工作流页面
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getWorkflow } from '../../api/workflow';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { ArrowLeft } from 'lucide-react';

function WorkflowGraph() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWorkflow() {
      setLoading(true);
      setError(null);
      try {
        const response = await getWorkflow(id);
        if (response && response.success && response.data) {
          const wf = response.data;
          // 构建节点
          const initialNodes = (wf.nodes || []).map((node, index) => ({
            id: node.id,
            type: 'default',
            position: { x: 100 + index * 250, y: 100 + (index % 2) * 150 },
            data: { label: node.flow_config?.nodeName || node.id }
          }));
          // 构建连线（顺序相连）
          const initialEdges = [];
          for (let i = 0; i < (wf.nodes || []).length - 1; i++) {
            const src = wf.nodes[i].id;
            const tgt = wf.nodes[i + 1].id;
            initialEdges.push({ id: `e_${src}_${tgt}`, source: src, target: tgt });
          }

          setNodes(initialNodes);
          setEdges(initialEdges);
        } else {
          throw new Error(response?.message || '获取工作流失败');
        }
      } catch (err) {
        setError('加载失败：' + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadWorkflow();
  }, [id, setNodes, setEdges]);

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="工作流可视化" onBack={() => navigate('/workflow')}> 
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> 返回
        </Button>
      </PageHeader>

      {loading && <div className="text-center py-8">正在加载...</div>}
      {error && (
        <div className="text-center text-red-500 py-8">{error}</div>
      )}

      {!loading && !error && (
        <div className="mt-4 h-[70vh] border rounded-lg">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <MiniMap />
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      )}
    </div>
  );
}

export default WorkflowGraph; 