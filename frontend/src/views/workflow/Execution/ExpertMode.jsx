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
import { Editor } from '@monaco-editor/react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

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
  executionOptions,
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
  
  // 渲染输出结果
  const renderResult = () => {
    if (error) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (!result) {
      return <div className="text-center py-8 text-gray-500">执行工作流后查看结果</div>;
    }
    
    const resultStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : result.toString();
    
    return (
      <div className="mt-2 relative">
        <Editor 
          height="400px"
          language="json"
          theme="vs-dark"
          value={resultStr}
          options={{
            ...editorOptions,
            readOnly: true
          }}
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
    );
  };
  
  // 显示执行信息
  const renderExecutionInfo = () => {
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
            <span className="font-semibold">记录对话:</span> {executionOptions.recordConversation ? '是' : '否'}
          </div>
          <div>
            <span className="font-semibold">记录节点执行:</span> {executionOptions.recordNodeExecution ? '是' : '否'}
          </div>
        </div>
        <div>
          <span className="font-semibold">超时设置:</span> {executionOptions.timeout} 毫秒
        </div>
      </div>
    );
  };
  
  return (
    <Card className="flex flex-col h-[calc(100vh-190px)] mt-4">
      <CardHeader className="px-6 py-4 border-b">
        <CardTitle className="text-lg">专家模式执行</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-auto">
        <Tabs value={viewTab} onValueChange={setViewTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="input">输入</TabsTrigger>
            <TabsTrigger value="output">输出</TabsTrigger>
            <TabsTrigger value="info">执行信息</TabsTrigger>
          </TabsList>
          
          <TabsContent value="input" className="space-y-4">
            <div className="flex justify-end mb-2">
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
            
            <Editor 
              height="350px"
              language={inputFormat === 'json' ? 'json' : 'plaintext'}
              theme="vs"
              value={localInput}
              onChange={setLocalInput}
              options={editorOptions}
            />
          </TabsContent>
          
          <TabsContent value="output">
            {renderResult()}
          </TabsContent>
          
          <TabsContent value="info">
            {renderExecutionInfo()}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t p-4">
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