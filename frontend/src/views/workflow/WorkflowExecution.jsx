import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { workflowService } from '../../services';
import { Play, StopCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * @component WorkflowExecution
 * @description 工作流执行页面
 */
function WorkflowExecution() {
  // 状态定义
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [executionOptions, setExecutionOptions] = useState({
    debug: false,
    timeout: 60000
  });

  // 路由参数和导航
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 加载工作流详情
  useEffect(() => {
    console.log('WorkflowExecution: useEffect triggered due to location or id change. Resetting states.');
    setExecuting(false);
    setLoading(true);
    setError(null);
    setResult(null);
    setInput('');

    const loadWorkflow = async () => {
      try {
        const workflowData = await workflowService.getWorkflow(id);
        setWorkflow(workflowData);
      } catch (err) {
        setError('加载工作流发生通信错误：' + err.message);
        setWorkflow(null);
        console.error('加载工作流发生通信错误', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadWorkflow();
    } else {
      setError('未提供工作流 ID');
      setLoading(false);
      setWorkflow(null);
    }
  }, [id, location]);

  // 执行工作流
  const handleExecute = async () => {
    setExecuting(true);
    setResult(null);
    setError(null);

    try {
      // 解析输入内容
      let inputData = input;
      try {
        // 如果用户输入的是JSON格式，则解析为对象
        inputData = JSON.parse(input);
      } catch (e) {
        // 如果不是JSON，则作为纯文本处理
        inputData = { text: input };
      }

      // 执行工作流
      const result = await workflowService.executeWorkflow(
        workflow.id,
        inputData,
        executionOptions // 传递执行选项
      );
      
      setResult(result);
    } catch (err) {
      setError('执行失败：' + err.message);
      console.error('工作流执行失败', err);
    } finally {
      setExecuting(false);
    }
  };

  // 返回编辑页面
  const goToEditPage = () => {
    navigate(`/workflow/${id}`);
  };

  // 取消执行
  const handleCancel = () => {
    // 在实际应用中，可能需要调用取消执行的API
    setExecuting(false);
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
  if (error && !executing) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button 
          onClick={goToEditPage}
          variant="outline"
        >
          返回编辑页面
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <PageHeader title="执行工作流" onBack={goToEditPage}>
        <div className="flex flex-col">
          <h2 className="text-xl font-medium">{workflow?.name || '未命名工作流'}</h2>
          <p className="text-gray-500 text-sm">{workflow?.description || '暂无描述'}</p>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* 左侧输入面板 */}
        <Card>
          <CardHeader>
            <CardTitle>输入参数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="input-data">输入数据 (JSON 或纯文本)</Label>
              <Textarea
                id="input-data"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-mono"
                rows="10"
                placeholder='{"text": "你好"} 或直接输入纯文本'
                disabled={executing}
              />
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">执行选项</h3>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="debug-mode"
                  checked={executionOptions.debug}
                  onCheckedChange={(checked) => setExecutionOptions({
                    ...executionOptions,
                    debug: checked
                  })}
                  disabled={executing}
                />
                <Label htmlFor="debug-mode" className="text-sm font-medium">
                  调试模式
                </Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeout-ms">超时时间 (毫秒)</Label>
                <Input
                  id="timeout-ms"
                  type="number"
                  value={executionOptions.timeout}
                  onChange={(e) => setExecutionOptions({
                    ...executionOptions,
                    timeout: parseInt(e.target.value) || 60000
                  })}
                  min="1000"
                  step="1000"
                  disabled={executing}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {executing ? (
              <Button onClick={handleCancel} variant="destructive" className="w-full">
                <StopCircle className="w-5 h-5 mr-2" /> 取消执行
              </Button>
            ) : (
              <Button onClick={handleExecute} className="w-full">
                <Play className="w-5 h-5 mr-2" /> 执行工作流
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* 右侧结果面板 */}
        <Card>
          <CardHeader>
            <CardTitle>执行结果</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 错误提示 (执行期间的错误) */}
            {error && executing && ( // 只在执行中且有错误时显示此特定错误
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* 执行状态 */}
            {executing && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 flex items-center">
                <div className="animate-spin mr-2 w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                正在执行工作流...
              </div>
            )}
            
            {/* 结果显示 */}
            {result && !executing && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">输出数据</h3>
                <pre className="bg-gray-100 p-3 rounded border font-mono text-sm overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
            
            {!result && !executing && !error && (
              <p className="text-sm text-gray-500">暂无结果。请先执行工作流。</p>
            )}
          </CardContent>
          
          {workflow?.nodes && workflow.nodes.length > 0 && (
            <>
              <CardHeader className="pt-0"> {/* Adjusted padding for tighter spacing */}
                <CardTitle className="text-base">工作流节点 ({workflow.nodes.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {workflow.nodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="p-3 bg-gray-50 rounded border flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-xs">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{node.flow_config?.nodeName || node.type || '未命名节点'}</p>
                        <p className="text-xs text-gray-500">类型: {node.type}</p>
                      </div>
                    </div>
                    
                    {/* 执行中状态指示 (可以根据实际的节点执行状态来动态显示) */}
                    {executing && (
                      <div className="ml-auto">
                        {/* Placeholder for individual node status, e.g., a spinner or specific icon */}
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </>
          )}
          {workflow?.nodes && workflow.nodes.length === 0 && (
             <CardContent>
                <p className="text-sm text-gray-500">此工作流没有任何节点。</p>
             </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

export default WorkflowExecution; 