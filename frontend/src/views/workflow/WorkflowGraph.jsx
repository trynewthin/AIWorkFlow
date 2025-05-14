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
import { getWorkflow, getNodeTypes, addNode, getDefaultFlowConfig, getDefaultWorkConfig } from '../../api/workflow';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/ui/PageHeader';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

function WorkflowGraph() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeTypes, setNodeTypes] = useState([]);
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

  // 加载可用节点类型
  useEffect(() => {
    async function loadNodeTypes() {
      try {
        const response = await getNodeTypes();
        if (response && response.success && response.data) {
          setNodeTypes(response.data);
        } else {
          throw new Error(response?.message || '获取节点类型失败');
        }
      } catch (err) {
        console.error('加载节点类型失败', err);
      }
    }
    loadNodeTypes();
  }, []);

  // 添加新节点
  const addNewNodeHandler = async (nodeType) => {
    try {
      const [defaultFlowConfig, defaultWorkConfig] = await Promise.all([
        getDefaultFlowConfig(nodeType),
        getDefaultWorkConfig(nodeType)
      ]);
      const result = await addNode(id, nodeType, defaultFlowConfig, defaultWorkConfig, nodes.length);
      if (result && result.nodeId) {
        const newNode = {
          id: result.nodeId,
          type: 'default',
          position: { x: 100 + nodes.length * 250, y: 100 },
          data: { label: nodeType }
        };
        setNodes((nds) => [...nds, newNode]);
        if (nodes.length > 0) {
          const prevId = nodes[nodes.length - 1].id;
          setEdges((eds) => [...eds, { id: `e_${prevId}_${result.nodeId}`, source: prevId, target: result.nodeId }]);
        }
      }
    } catch (err) {
      console.error('添加节点失败', err);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <MiniMap position="bottom-right" style={{ width: 160, height: 100 }} />
            <Controls />
            <Background />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
      <div className="relative z-10 container mx-auto p-4">
        <PageHeader title="工作流可视化" onBack={() => navigate('/workflow')}> 
        </PageHeader>

        {loading && <div className="text-center py-8">正在加载...</div>}
        {error && (
          <div className="text-center text-red-500 py-8">{error}</div>
        )}
        {/* 可用节点面板（滑动隐藏） */}
        {!loading && !error && (
          <div className="relative mt-4">
            {/* 滑入滑出面板 */}
            <div className={`transform transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Card className="w-40">
                <CardHeader className="flex justify-between items-center">
                  <CardTitle>可用节点</CardTitle>
                  <button onClick={() => setIsPanelOpen(false)} className="p-1">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {nodeTypes.map((type) => (
                      <div
                        key={type}
                        className="p-2 bg-white rounded border cursor-pointer hover:bg-blue-50 flex items-center"
                        onClick={() => addNewNodeHandler(type)}
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        <span>{type}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* 重开面板按钮 */}
            {!isPanelOpen && (
              <button onClick={() => setIsPanelOpen(true)} className="absolute left-0 top-0 p-2 bg-white border rounded-r">
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowGraph; 