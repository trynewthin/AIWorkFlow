import React, { useEffect, useState, useRef } from 'react';
import { Play, StopCircle, Copy } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Editor, loader } from '@monaco-editor/react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

// 配置Monaco编辑器，适配Electron环境
loader.config({
  monaco: monaco => {
    // 这里可以添加Monaco实例初始化后的配置
  },
  // 不使用URLs，改为内置CDN
  urls: {
    // 不指定URLs，让Monaco组件内部处理
  }
});

/**
 * @component ExpertMode
 * @description 工作流执行页面的专家模式组件，提供代码编辑器和详细输出
 */
const ExpertMode = ({
  input,
  setInput,
  executing,
  error,
  result,
  handleExecute,
  handleCancel,
  executionOptions = {
    recordConversation: false,
    recordNodeExecution: false,
    timeout: 60000
  },
  setExecutionOptions,
  workflow,
  conversationId
}) => {
  // 状态定义
  const [localInput, setLocalInput] = useState('');
  const [inputFormat, setInputFormat] = useState('text'); // 'text' or 'json'
  const [viewTab, setViewTab] = useState('input');
  const [jsonError, setJsonError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // 编辑器配置
  const editorOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    wordWrap: 'on',
    automaticLayout: true
  };
  
  // 当输入模式变化时，尝试格式化输入
  useEffect(() => {
    if (input) {
      if (inputFormat === 'json') {
        try {
          // 如果当前输入是纯文本，转换为JSON对象
          if (typeof input === 'string') {
            try {
              // 先尝试解析为JSON
              JSON.parse(input);
              setLocalInput(input); // 已经是有效的JSON
            } catch (e) {
              // 不是JSON，则包装为文本对象
              setLocalInput(JSON.stringify({ text: input }, null, 2));
            }
          } else {
            // 输入已经是对象，格式化为JSON字符串
            setLocalInput(JSON.stringify(input, null, 2));
          }
          setJsonError(null);
        } catch (e) {
          setJsonError('无法转换为JSON格式');
          setLocalInput(input.toString());
        }
      } else {
        // 文本模式
        if (typeof input === 'object') {
          setLocalInput(JSON.stringify(input));
        } else {
          setLocalInput(input.toString());
        }
      }
    } else {
      setLocalInput('');
    }
  }, [input, inputFormat]);
  
  // 输入格式变更处理
  const handleInputFormatChange = (format) => {
    setInputFormat(format);
  };
  
  // 执行按钮处理
  const handleExecuteClick = () => {
    let processedInput = localInput;
    
    if (inputFormat === 'json') {
      try {
        processedInput = JSON.parse(localInput);
        setJsonError(null);
      } catch (e) {
        setJsonError('JSON格式无效: ' + e.message);
        toast.error('JSON格式无效: ' + e.message);
        return;
      }
    }
    
    // 更新父组件的输入并执行
    setInput(processedInput);
    handleExecute();
    
    // 自动切换到结果标签
    setViewTab('output');
  };
  
  // 复制结果到剪贴板
  const copyToClipboard = () => {
    try {
      if (result) {
        let textToCopy = typeof result === 'object' ? JSON.stringify(result, null, 2) : result.toString();
        navigator.clipboard.writeText(textToCopy);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        toast.success('结果已复制到剪贴板');
      }
    } catch (err) {
      toast.error('复制失败: ' + err.message);
    }
  };
  
  // 显示执行信息
  const renderExecutionInfo = () => {
    // 确保executionOptions存在，使用默认空对象防止错误
    const options = executionOptions || {
      recordConversation: false,
      recordNodeExecution: false,
      timeout: 60000
    };
    
    return (
      <div className="space-y-2 p-3 border rounded-md bg-gray-50 mt-4 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold">工作流ID:</span> {workflow?.id || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">对话ID:</span> {conversationId || '未使用对话'}
          </div>
        </div>
        <Separator className="my-1" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-semibold">记录对话:</span> {options.recordConversation ? '是' : '否'}
          </div>
          <div>
            <span className="font-semibold">记录节点执行:</span> {options.recordNodeExecution ? '是' : '否'}
          </div>
        </div>
        <div>
          <span className="font-semibold">超时设置:</span> {options.timeout} 毫秒
        </div>
      </div>
    );
  };
  
  return (
    <Card className="flex flex-col h-[calc(100vh-190px)] mt-2">
      <CardHeader className="px-6 pb-2 border-b h-max-[10%]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">专家模式执行</CardTitle>
          <Tabs value={viewTab} onValueChange={setViewTab}>
            <TabsList>
              <TabsTrigger value="input">输入</TabsTrigger>
              <TabsTrigger value="output">输出</TabsTrigger>
              <TabsTrigger value="info">执行信息</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-auto">
        {/* 输入标签页内容 */}
        {viewTab === 'input' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <div className="border rounded-md overflow-hidden">
                <Button 
                  variant={inputFormat === 'text' ? 'secondary' : 'ghost'}
                  className="rounded-none px-3 py-1 h-8"
                  onClick={() => handleInputFormatChange('text')}
                >
                  文本
                </Button>
                <Button 
                  variant={inputFormat === 'json' ? 'secondary' : 'ghost'}
                  className="rounded-none px-3 py-1 h-8"
                  onClick={() => handleInputFormatChange('json')}
                >
                  JSON
                </Button>
              </div>
            </div>
            
            {jsonError && (
              <Alert variant="destructive">
                <AlertDescription>{jsonError}</AlertDescription>
              </Alert>
            )}
            
            <Textarea
              className="min-h-[100px] font-mono text-sm"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder={inputFormat === 'json' ? '{"text": "在此输入JSON"}' : '在此输入文本'}
            />
          </div>
        )}
        
        {/* 输出标签页内容 */}
        {viewTab === 'output' && (
          <div>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : !result ? (
              <div className="text-center py-8 text-gray-500">执行工作流后查看结果</div>
            ) : (
              <div className="relative">
                <Textarea
                  className="min-h-[400px] font-mono text-sm p-4"
                  value={typeof result === 'object' ? JSON.stringify(result, null, 2) : result.toString()}
                  readOnly
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-2 right-2 bg-gray-800 text-white opacity-80 hover:opacity-100"
                  onClick={copyToClipboard}
                >
                  {copySuccess ? '已复制!' : <Copy size={14} />}
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* 执行信息标签页内容 */}
        {viewTab === 'info' && renderExecutionInfo()}
      </CardContent>
      
      <CardFooter className="border-t px-4">
        <div className="flex w-full justify-between">
          <div>
            {executionOptions.recordConversation && (
              <div className="text-xs text-green-600">
                对话记录已启用 {conversationId ? `(ID: ${conversationId.substring(0, 8)}...)` : ''}
              </div>
            )}
          </div>
          
          <div>
            {executing ? (
              <Button variant="destructive" onClick={handleCancel}>
                <StopCircle className="h-5 w-5 mr-2" />
                中止执行
              </Button>
            ) : (
              <Button onClick={handleExecuteClick}>
                <Play className="h-5 w-5 mr-2" />
                执行工作流
              </Button>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ExpertMode; 