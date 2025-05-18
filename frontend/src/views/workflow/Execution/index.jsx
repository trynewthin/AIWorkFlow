import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { workflowService } from '../../../services';
import ButtonHeader from '@/components/header/ButtonHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SimpleMode from './SimpleMode';
import ExpertMode from './ExpertMode';
import WorkflowConfig from './WorkflowConfig';

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
  const [mode, setMode] = useState('simple'); // 'simple' 或 'expert'
  const [executionOptions, setExecutionOptions] = useState({
    debug: false,
    timeout: 60000,
    validateStartEnd: true
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
        
        // 尝试从localStorage加载之前保存的模式设置
        try {
          const savedMode = localStorage.getItem(`workflow_mode_${id}`);
          if (savedMode && (savedMode === 'simple' || savedMode === 'expert')) {
            setMode(savedMode);
          }
        } catch (error) {
          console.error('加载模式设置失败:', error);
        }
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

  // 保存模式设置到localStorage
  useEffect(() => {
    if (id) {
      try {
        localStorage.setItem(`workflow_mode_${id}`, mode);
      } catch (error) {
        console.error('保存模式设置失败:', error);
      }
    }
  }, [id, mode]);

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

      console.log('执行工作流:', workflow.id, '输入:', inputData, '选项:', executionOptions);

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
    <div className="container mx-auto h-full p-2">
      <ButtonHeader title="执行工作流" onBackClick={goToEditPage}>
        <div className="flex items-center space-x-2">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="simple">普通模式</TabsTrigger>
              <TabsTrigger value="expert">专家模式</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <WorkflowConfig 
            executionOptions={executionOptions}
            setExecutionOptions={setExecutionOptions}
            workflow={workflow}
          />
      </ButtonHeader>

      {mode === 'simple' ? (
        <SimpleMode 
          input={input}
          setInput={setInput}
          executing={executing}
          error={error}
          result={result}
          handleExecute={handleExecute}
          handleCancel={handleCancel}
          workflow={workflow}
        />
      ) : (
        <ExpertMode 
          input={input}
          setInput={setInput}
          executing={executing}
          error={error}
          result={result}
          handleExecute={handleExecute}
          handleCancel={handleCancel}
          executionOptions={executionOptions}
          setExecutionOptions={setExecutionOptions}
          workflow={workflow}
        />
      )}
    </div>
  );
}

export default WorkflowExecution; 