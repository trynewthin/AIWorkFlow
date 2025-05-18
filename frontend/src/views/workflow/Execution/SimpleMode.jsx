import React, { useState, useEffect, useRef } from 'react';
import { Play, StopCircle, Send } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * @component SimpleMode
 * @description 工作流执行页面的简单模式组件，采用聊天界面
 */
const SimpleMode = ({ 
  input, 
  setInput, 
  executing, 
  error, 
  result, 
  handleExecute, 
  handleCancel,
  workflow
}) => {
  // 聊天历史记录
  const [messages, setMessages] = useState([]);
  // 用于滚动到底部的引用
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // 初始化欢迎消息
  useEffect(() => {
    if (workflow && messages.length === 0) {
      setMessages([
        { 
          role: 'system', 
          content: `欢迎使用工作流"${workflow.name || '未命名工作流'}"，请输入内容开始执行。` 
        }
      ]);
    }
  }, [workflow, messages.length]);
  
  // 提交用户输入
  const handleSubmit = () => {
    if (!input.trim() || executing) return;
    
    // 添加用户消息到历史
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    
    // 执行工作流
    handleExecute();
  };
  
  // 监听输入框回车事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // 提取结果中的数据内容
  const extractDataContent = (result) => {
    if (!result) return '';
    
    try {
      // 如果结果已经是对象
      if (typeof result === 'object') {
        // 提取 items 数组中的 data 字段
        if (result.items && Array.isArray(result.items)) {
          return result.items.map(item => item.data).join('\n');
        }
      }
      
      // 如果结果是字符串，尝试解析为 JSON
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          if (parsed.items && Array.isArray(parsed.items)) {
            return parsed.items.map(item => item.data).join('\n');
          }
        } catch (e) {
          // 如果解析失败，返回原始字符串
          return result;
        }
      }
      
      // 默认返回 JSON 字符串化的结果
      return typeof result === 'object' ? JSON.stringify(result, null, 2) : result.toString();
    } catch (error) {
      console.error('提取结果数据失败:', error);
      return String(result);
    }
  };
  
  // 当执行状态变化或结果更新时，更新消息列表
  useEffect(() => {
    // 执行开始时，添加一条正在执行的消息
    if (executing && messages.length > 0 && messages[messages.length - 1]?.role !== 'loading') {
      setMessages(prev => [...prev, { role: 'loading', content: '正在处理...' }]);
    }
    
    // 执行结束且有结果时，添加结果消息
    if (!executing && result && messages.length > 0 && messages[messages.length - 1]?.role !== 'assistant') {
      // 移除loading消息
      const newMessages = messages.filter(m => m.role !== 'loading');
      setMessages([
        ...newMessages, 
        { 
          role: 'assistant', 
          content: extractDataContent(result)
        }
      ]);
    }
    
    // 执行出错时
    if (!executing && error && messages.length > 0 && messages[messages.length - 1]?.role !== 'error') {
      // 移除loading消息
      const newMessages = messages.filter(m => m.role !== 'loading');
      setMessages([
        ...newMessages, 
        { role: 'error', content: error }
      ]);
    }
  }, [executing, result, error, messages]);
  
  // 消息更新后滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  return (
    <Card className="flex flex-col h-[calc(100vh-190px)] mt-4">
      {/* 聊天历史区域 */}
      <ScrollArea 
        ref={scrollRef} 
        className="flex-1 py-1 px-4 max-h-[80%] min-h-[76%] overflow-y-auto"
      >
        <div className="space-y-4">
          {messages.map((message, index) => {
            if (message.role === 'system') {
              return (
                <div key={index} className="bg-gray-100 rounded-lg p-3 mx-12 text-center text-sm text-gray-500">
                  {message.content}
                </div>
              );
            }
            
            if (message.role === 'user') {
              return (
                <div key={index} className="flex justify-end">
                  <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[80%]">
                    {message.content}
                  </div>
                </div>
              );
            }
            
            if (message.role === 'assistant') {
              return (
                <div key={index} className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg p-3 max-w-[80%]">
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {message.content}
                    </pre>
                  </div>
                </div>
              );
            }
            
            if (message.role === 'error') {
              return (
                <div key={index} className="flex justify-start">
                  <Alert variant="destructive" className="max-w-[80%]">
                    <AlertDescription>{message.content}</AlertDescription>
                  </Alert>
                </div>
              );
            }
            
            if (message.role === 'loading') {
              return (
                <div key={index} className="flex justify-start">
                  <div className="bg-gray-200 rounded-lg p-3 flex items-center max-w-[80%]">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                    </div>
                    <span className="ml-2">{message.content}</span>
                  </div>
                </div>
              );
            }
            
            return null;
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* 输入区域 */}
      <CardFooter className="border-t p-4 pb-1 max-h-[18%]">
        <div className="flex w-full space-x-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="请输入内容..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={executing}
          />
          
          {executing ? (
            <Button variant="destructive" onClick={handleCancel} className="shrink-0">
              <StopCircle className="h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="shrink-0">
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default SimpleMode; 