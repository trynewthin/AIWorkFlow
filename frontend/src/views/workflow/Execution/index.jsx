import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { workflowService } from '../../../services';
import ButtonHeader from '@/components/header/ButtonHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
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
    validateStartEnd: true,
    recordConversation: true, // 默认记录对话
    recordNodeExecution: false // 默认不记录节点执行过程
  });
  
  // 对话相关状态
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [loadingConversation, setLoadingConversation] = useState(false);

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
        
        // 加载工作流的对话历史
        loadWorkflowConversations(workflowData.id);
      } catch (err) {
        setError('加载工作流发生通信错误：' + err.message);
        toast.error('加载工作流发生通信错误：' + err.message);
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
      toast.error('未提供工作流 ID');
      setLoading(false);
      setWorkflow(null);
    }
  }, [id, location]);
  
  // 加载工作流的对话历史
  const loadWorkflowConversations = async (workflowId) => {
    try {
      // 获取工作流的所有对话轮次
      const conversationsList = await workflowService.getWorkflowConversations(workflowId);
      setConversations(conversationsList);
      
      // 获取当前关联的对话
      const currentConversationId = await workflowService.getWorkflowCurrentConversation(workflowId);
      
      if (currentConversationId) {
        setConversationId(currentConversationId);
        setActiveConversation(conversationsList.find(c => c.id === currentConversationId) || null);
        
        // 加载当前对话的消息
        await loadConversationMessages(currentConversationId);
      }
    } catch (error) {
      console.error('加载对话历史失败:', error);
      toast.error('加载对话历史失败: ' + error.message);
    }
  };
  
  // 加载对话消息
  const loadConversationMessages = async (convId) => {
    if (!convId) return;
    
    setLoadingConversation(true);
    try {
      const messages = await workflowService.getConversationMessages(convId);
      
      // 处理消息，格式化为SimpleMode组件需要的格式
      const formattedMessages = messages.map(msg => {
        // 处理消息内容，解析可能的JSON字符串
        let parsedContent = msg.content.content;
        if (msg.content.role === 'user') {
          try {
            // 检查是否是JSON字符串
            if (typeof parsedContent === 'string' && 
                (parsedContent.trim().startsWith('{') || parsedContent.trim().startsWith('['))) {
              const jsonContent = JSON.parse(parsedContent);
              // 优先使用text字段
              if (jsonContent.text !== undefined) {
                parsedContent = jsonContent.text;
              } else if (jsonContent.content !== undefined) {
                parsedContent = jsonContent.content;
              }
            }
          } catch (e) {
            // 解析失败，使用原始内容
            console.log('解析消息内容失败，使用原始内容', e);
          }
        }

        return {
          role: msg.content.role,
          content: parsedContent,
          time: new Date(msg.created_at),
          id: msg.id
        };
      });
      
      setConversationMessages(formattedMessages);
      
      // 如果对话为空，添加一条系统欢迎消息
      if (formattedMessages.length === 0 && workflow) {
        setConversationMessages([
          { 
            role: 'system', 
            content: `欢迎使用工作流"${workflow.name || '未命名工作流'}"，请输入内容开始执行。`,
            time: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('加载对话消息失败:', error);
      toast.error('加载对话消息失败: ' + error.message);
    } finally {
      setLoadingConversation(false);
    }
  };

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
  
  // 创建新对话
  const createNewConversation = async () => {
    if (!workflow) return;
    
    try {
      // 创建新对话轮次
      const newConversationId = await workflowService.createWorkflowConversation(workflow.id);
      setConversationId(newConversationId);
      
      // 刷新对话列表
      await loadWorkflowConversations(workflow.id);
      
      // 重置消息和输入
      setInput('');
      setResult(null);
      setError(null);
      
      toast.success('新对话创建成功');
    } catch (error) {
      console.error('创建新对话失败:', error);
      toast.error('创建新对话失败: ' + error.message);
    }
  };
  
  // 切换到指定的对话
  const switchConversation = async (convId) => {
    if (convId === conversationId) return;
    
    setConversationId(convId);
    setActiveConversation(conversations.find(c => c.id === convId) || null);
    
    // 加载选中对话的消息
    await loadConversationMessages(convId);
    
    // 重置输入和结果
    setInput('');
    setResult(null);
    setError(null);
  };

  // 执行工作流
  const handleExecute = async () => {
    setExecuting(true);
    setResult(null);
    setError(null);

    try {
      // 解析输入内容
      let inputData = input;
      // 在专家模式下才尝试解析JSON
      if (mode === 'expert') {
        try {
          // 如果用户输入的是JSON格式，则解析为对象
          inputData = JSON.parse(input);
        } catch (e) {
          // 如果不是JSON，则作为纯文本处理
          inputData = { text: input };
        }
      } else {
        // 简单模式下直接使用纯文本
        inputData = input;
      }

      console.log('执行工作流:', workflow.id, '输入:', inputData, '选项:', executionOptions);

      // 如果启用了对话记录，使用executeWorkflowWithConversation
      if (executionOptions.recordConversation) {
        // 确保有对话ID
        let usedConversationId = conversationId;
        if (!usedConversationId) {
          // 如果没有当前对话，创建新对话
          usedConversationId = await workflowService.createWorkflowConversation(workflow.id);
          setConversationId(usedConversationId);
        }
        
        // 添加用户消息到本地状态，以立即显示
        const userMessage = { role: 'user', content: input, time: new Date() };
        setConversationMessages(prev => [...prev, userMessage]);
        
        // 执行工作流并记录对话
        const { result: execResult, conversationId: resultConvId } = await workflowService.executeWorkflowWithConversation(
          workflow.id,
          inputData,
          {
            conversationId: usedConversationId,
            recordNodeExecution: executionOptions.recordNodeExecution
          }
        );
        
        setResult(execResult);
        
        // 如果返回了新的对话ID（可能是自动创建的），更新状态
        if (resultConvId && resultConvId !== usedConversationId) {
          setConversationId(resultConvId);
          // 刷新对话列表
          await loadWorkflowConversations(workflow.id);
        }
        
        // 刷新消息列表，以获取AI回复
        await loadConversationMessages(resultConvId || usedConversationId);
      } else {
        // 不记录对话，使用普通执行
        const execResult = await workflowService.executeWorkflow(
          workflow.id,
          inputData,
          executionOptions // 传递执行选项
        );
        
        setResult(execResult);
      }
    } catch (err) {
      setError('执行失败：' + err.message);
      toast.error('执行失败：' + err.message);
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

  // 刷新对话列表
  const handleConversationsChanged = async (updatedList = null, options = {}) => {
    if (updatedList) {
      // 如果提供了更新后的列表，直接使用
      setConversations(updatedList);
      
      // 如果需要重置当前对话（例如当前对话被删除且没有其他对话）
      if (options.resetCurrentConversation) {
        setConversationId(null);
        setActiveConversation(null);
        // 添加一条欢迎消息
        if (workflow) {
          setConversationMessages([
            { 
              role: 'system', 
              content: `欢迎使用工作流"${workflow.name || '未命名工作流'}"，请输入内容开始执行。`,
              time: new Date()
            }
          ]);
        }
      }
    } else {
      // 否则从服务器重新加载对话列表
      await loadWorkflowConversations(workflow.id);
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">正在加载工作流数据...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-full p-2">
      <ButtonHeader title="执行工作流" onBackClick={goToEditPage}>
        <div className="flex items-center space-x-2">
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-64 grid-cols-2">
              <TabsTrigger value="simple">对话模式</TabsTrigger>
              <TabsTrigger value="expert">专家模式</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <WorkflowConfig 
          executionOptions={executionOptions}
          setExecutionOptions={setExecutionOptions}
          workflow={workflow}
        />
        <Button variant="outline" onClick={createNewConversation}>
          新对话
        </Button>
      </ButtonHeader>

      {/* 内容区 - 根据模式显示不同的视图 */}
      {loading ? (
        <div className="p-4 text-center">加载中...</div>
      ) : mode === 'simple' ? (
        <SimpleMode
          input={input}
          setInput={setInput}
          executing={executing}
          error={error}
          result={result}
          handleExecute={handleExecute}
          handleCancel={handleCancel}
          workflow={workflow}
          messages={conversationMessages}
          setMessages={setConversationMessages}
          conversationId={conversationId}
          conversations={conversations}
          switchConversation={switchConversation}
          loadingConversation={loadingConversation}
          recordConversation={executionOptions.recordConversation}
          showMessageTime={false}
          onConversationsChanged={handleConversationsChanged}
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
          workflow={workflow}
          executionOptions={executionOptions}
          setExecutionOptions={setExecutionOptions}
          conversationId={conversationId}
        />
      )}
    </div>
  );
}

export default WorkflowExecution; 