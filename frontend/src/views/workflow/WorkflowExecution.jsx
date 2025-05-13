import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkflow, executeWorkflow } from '../../api/workflow';
import { ArrowLeft, Play, StopCircle } from 'lucide-react';

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

  // 加载工作流详情
  useEffect(() => {
    const loadWorkflow = async () => {
      setLoading(true);
      setError(null); // 重置错误
      try {
        const response = await getWorkflow(id);
        if (response && response.success && response.data) {
          setWorkflow(response.data);
        } else {
          const errorMessage = response && response.message ? response.message : '获取工作流失败';
          setError('加载工作流失败：' + errorMessage);
          setWorkflow(null);
          console.error('加载工作流失败', response);
        }
      } catch (err) {
        setError('加载工作流发生通信错误：' + err.message);
        setWorkflow(null);
        console.error('加载工作流发生通信错误', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflow();
  }, [id]);

  // 执行工作流
  const handleExecute = async () => {
    setExecuting(true);
    setResult(null);
    setError(null);

    try {
      // 解析输入内容
      let inputData;
      try {
        // 尝试解析为JSON
        inputData = input.trim() ? JSON.parse(input) : {};
      } catch (err) {
        // 如果不是有效JSON，则作为字符串处理
        inputData = { text: input };
      }

      // 执行工作流
      const result = await executeWorkflow(
        workflow.id,
        inputData,
        executionOptions
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={goToEditPage}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        >
          返回编辑页面
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 顶部工具栏 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button 
            onClick={goToEditPage}
            className="mr-4 p-2 rounded-full hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">执行工作流</h1>
        </div>
        <div>
          <h2 className="text-xl font-medium">{workflow.name}</h2>
          <p className="text-gray-500 text-sm">{workflow.description}</p>
        </div>
      </div>

      {/* 主体内容 - 两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧输入面板 */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h2 className="font-medium text-lg mb-4">输入参数</h2>
          
          <div className="mb-4">
            <div className="bg-white p-4 rounded border">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入数据 (JSON 或纯文本)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full px-3 py-2 border rounded font-mono"
                rows="10"
                placeholder='{"text": "你好"} 或直接输入纯文本'
                disabled={executing}
              ></textarea>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-medium mb-3">执行选项</h3>
              
              <div className="mb-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={executionOptions.debug}
                    onChange={(e) => setExecutionOptions({
                      ...executionOptions,
                      debug: e.target.checked
                    })}
                    className="mr-2"
                    disabled={executing}
                  />
                  <span className="text-sm font-medium text-gray-700">调试模式</span>
                </label>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  超时时间 (毫秒)
                </label>
                <input
                  type="number"
                  value={executionOptions.timeout}
                  onChange={(e) => setExecutionOptions({
                    ...executionOptions,
                    timeout: parseInt(e.target.value) || 60000
                  })}
                  className="w-full px-3 py-2 border rounded"
                  min="1000"
                  step="1000"
                  disabled={executing}
                />
              </div>
            </div>
          </div>
          
          <div>
            {executing ? (
              <button
                onClick={handleCancel}
                className="w-full flex justify-center items-center bg-red-600 text-white px-3 py-3 rounded hover:bg-red-700"
              >
                <StopCircle className="w-5 h-5 mr-2" /> 取消执行
              </button>
            ) : (
              <button
                onClick={handleExecute}
                className="w-full flex justify-center items-center bg-green-600 text-white px-3 py-3 rounded hover:bg-green-700"
              >
                <Play className="w-5 h-5 mr-2" /> 执行工作流
              </button>
            )}
          </div>
        </div>

        {/* 右侧结果面板 */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h2 className="font-medium text-lg mb-4">执行结果</h2>
          
          {/* 错误提示 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
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
            <div className="bg-white p-4 rounded border">
              <h3 className="font-medium mb-3">输出数据</h3>
              <pre className="bg-gray-50 p-3 rounded border font-mono text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {/* 工作流节点列表 */}
          <div className="mt-6">
            <h3 className="font-medium mb-3">工作流节点</h3>
            <div className="space-y-2">
              {workflow.nodes && workflow.nodes.length > 0 ? (
                workflow.nodes.map((node, index) => (
                  <div
                    key={node.id}
                    className="p-3 bg-white rounded border"
                  >
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{node.flowConfig?.nodeName || '未命名节点'}</p>
                        <p className="text-xs text-gray-500">{node.type}</p>
                      </div>
                      
                      {/* 执行中状态指示 */}
                      {executing && (
                        <div className="ml-auto">
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 bg-white rounded border">
                  <p className="text-gray-500">此工作流没有任何节点</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowExecution; 