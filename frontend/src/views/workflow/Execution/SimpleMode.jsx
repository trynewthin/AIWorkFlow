import React, { useState, useEffect, useRef } from 'react';
import { Play, StopCircle, Send, MessageSquare, Plus, RefreshCw, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { 
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { deleteConversation } from '@/services/workflowService';

// 添加CSS动画样式
const bouncingDotsStyle = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    25% { transform: translateY(-5px); }
    50% { transform: translateY(0); }
    75% { transform: translateY(5px); }
  }
  .dot-1 { animation: bounce 1s infinite 0s; }
  .dot-2 { animation: bounce 1s infinite 0.2s; }
  .dot-3 { animation: bounce 1s infinite 0.4s; }
`;

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
  workflow,
  messages = [],
  setMessages,
  conversationId,
  conversations = [],
  switchConversation,
  loadingConversation,
  recordConversation,
  showMessageTime = true, // 是否显示消息时间，默认显示
  onConversationsChanged, // 对话列表变化后的回调函数
}) => {
  // 用于滚动到底部的引用
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  
  // 侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // 删除对话相关状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [deletingConversation, setDeletingConversation] = useState(false);
  
  // 提交用户输入
  const handleSubmit = () => {
    if (!input.trim() || executing) return;
    
    // 执行工作流 (主组件会处理消息记录)
    handleExecute();
  };
  
  // 监听输入框回车事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // 消息更新后滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // 格式化对话时间
  const formatConversationTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };
  
  // 截取对话预览内容
  const getConversationPreview = (conversation) => {
    const messages = conversations.find(c => c.id === conversation.id)?.messages || [];
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      return lastMessage.content.substring(0, 30) + (lastMessage.content.length > 30 ? '...' : '');
    }
    return '无消息';
  };
  
  // 格式化时间，使用中国时区
  const formatTimeWithTimezone = (dateString) => {
    try {
      // 创建日期对象
      const date = new Date(dateString);
      
      // 获取中国时区(UTC+8)的时间
      const options = { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Shanghai'
      };
      
      return new Intl.DateTimeFormat('zh-CN', options).format(date);
    } catch (error) {
      // 使用简单的格式化作为备用方案
      try {
        const date = new Date(dateString);
        // 手动添加8小时到UTC时间（中国时区UTC+8）
        const utcPlusEight = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return format(utcPlusEight, 'HH:mm:ss');
      } catch (fallbackError) {
        return dateString;
      }
    }
  };
  
  // 打开删除对话确认框
  const handleDeleteConversation = (e, conversation) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发对话切换
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };
  
  // 确认删除对话
  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;
    
    try {
      setDeletingConversation(true);
      
      // 调用删除API
      await deleteConversation(conversationToDelete.id);
      
      // 更新状态，从列表中移除已删除的对话
      const updatedConversations = conversations.filter(c => c.id !== conversationToDelete.id);
      
      // 如果删除的是当前对话
      if (conversationId === conversationToDelete.id) {
        if (updatedConversations.length > 0) {
          // 如果还有其他对话，切换到第一个对话
          switchConversation(updatedConversations[0].id);
        } else {
          // 如果没有其他对话，清空当前消息
          setMessages([
            { 
              role: 'system', 
              content: `欢迎使用工作流"${workflow?.name || '未命名工作流'}"，请输入内容开始执行。`,
              time: new Date()
            }
          ]);
          // 注意：不能直接设置conversationId为null，因为它是由父组件管理的
          // 而是通过onConversationsChanged回调通知父组件，并传递一个标记
          if (typeof onConversationsChanged === 'function') {
            onConversationsChanged(updatedConversations, { resetCurrentConversation: true });
          }
        }
      } else {
        // 通知父组件会话列表已更改
        if (typeof onConversationsChanged === 'function') {
          onConversationsChanged(updatedConversations);
        }
      }
      
      // 关闭删除对话框
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
      
      // 显示成功提示
      toast.success('对话已成功删除');
    } catch (error) {
      console.error('删除对话失败:', error);
      toast.error('删除对话失败: ' + error.message);
    } finally {
      setDeletingConversation(false);
    }
  };
  
  return (
    <div className="flex h-[calc(100vh-190px)] mt-4">
      {/* 对话历史侧边栏 */}
      {sidebarOpen && (
        <Card className="w-52 mr-2 flex-shrink-0 flex flex-col h-full overflow-hidden">
          <CardHeader className="px-3 py-1 min-h-0 max-h-[4%]">
            <CardTitle className="text-sm flex justify-between items-center">
              <span>对话历史</span>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSidebarOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </Button>
            </CardTitle>
          </CardHeader>
          <Separator />
          <ScrollArea className="flex-1 h-full">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">没有历史对话</div>
            ) : (
              <div className="p-2 space-y-2">
                {conversations.map(conversation => (
                  <div 
                    key={conversation.id}
                    className={cn(
                      "p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors",
                      conversation.id === conversationId ? "bg-gray-100" : ""
                    )}
                    onClick={() => switchConversation(conversation.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1 min-w-0">
                        <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {format(new Date(conversation.created_at), 'MM-dd HH:mm')}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100 flex-shrink-0"
                        onClick={(e) => handleDeleteConversation(e, conversation)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {conversation.id === conversationId ? '当前对话' : getConversationPreview(conversation)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
      
      {/* 聊天主界面 */}
      <Card className="flex flex-col flex-1">
        <div className="px-3 py-1 pb-2 border-b flex justify-between items-center min-h-0">
          <div className="flex items-center space-x-1">
            <Button 
              variant={sidebarOpen ? "secondary" : "outline"} 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              <span>历史</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 flex items-center justify-center"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {conversationId && (
              <div className="text-xs text-gray-500">
                ID: {conversationId.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
        
        {/* 聊天历史区域 */}
        <ScrollArea 
          ref={scrollRef} 
          className="flex-1 py-0 px-4 overflow-y-auto"
        >
          {loadingConversation ? (
            <div className="flex justify-center my-4">
              <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
              <span className="ml-2">加载对话历史...</span>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message, index) => {
                if (message.role === 'system') {
                  return (
                    <div key={index} className="bg-gray-100 rounded-lg p-3 mx-12 text-center text-sm text-gray-500">
                      {message.content}
                    </div>
                  );
                }
                
                if (message.role === 'user') {
                  // 处理消息内容，检测是否为JSON格式
                  let displayContent = message.content;
                  try {
                    // 尝试解析JSON字符串
                    if (typeof message.content === 'string' && message.content.trim().startsWith('{')) {
                      const parsed = JSON.parse(message.content);
                      // 优先显示text字段内容
                      if (parsed.text !== undefined) {
                        displayContent = parsed.text;
                      } else if (parsed.content !== undefined) {
                        displayContent = parsed.content;
                      }
                    }
                  } catch (e) {
                    // 解析失败，使用原始内容
                    displayContent = message.content;
                  }
                  
                  return (
                    <div key={index} className="flex justify-end">
                      <div className="flex flex-col items-end">
                        <div className="bg-black text-white rounded-lg p-3 max-w-[80%] border border-gray-600">
                          {displayContent}
                        </div>
                        <div className="flex items-center mt-1 mr-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1 opacity-80" />
                          <span>{formatTimeWithTimezone(message.time)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                if (message.role === 'assistant') {
                  return (
                    <div key={index} className="flex justify-start">
                      <div className="flex flex-col items-start">
                        <div className="bg-white text-black rounded-lg p-3 max-w-[80%] border border-black">
                          <pre className="whitespace-pre-wrap font-sans text-sm">
                            {message.content}
                          </pre>
                        </div>
                        <div className="flex items-center mt-1 ml-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1 opacity-80" />
                          <span>{formatTimeWithTimezone(message.time)}</span>
                        </div>
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
              
              {/* 当前正在执行 */}
              {executing && (
                <div className="flex justify-center w-full my-4">
                  <div className="flex items-center">
                    <style>{bouncingDotsStyle}</style>
                    <div className="flex space-x-1 mr-3">
                      <div className="h-3 w-3 bg-black rounded-full dot-1"></div>
                      <div className="h-3 w-3 bg-black rounded-full dot-2"></div>
                      <div className="h-3 w-3 bg-black rounded-full dot-3"></div>
                    </div>
                    <span className="text-sm font-medium text-gray-700">工作流正在执行...</span>
                  </div>
                </div>
              )}
              
              {/* 错误提示 */}
              {error && !messages.find(m => m.role === 'error' && m.content === error) && (
                <div className="flex justify-start">
                  <Alert variant="destructive" className="max-w-[80%]">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {/* 输入区域 */}
        <CardFooter className="border-t p-4 pb-2 max-h-[18%]">
          <div className="flex w-full space-x-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={recordConversation ? "输入内容并记录对话..." : "输入内容..."}
              className="flex-1 min-h-[60px] resize-none"
              disabled={executing || loadingConversation}
            />
            
            {executing ? (
              <Button variant="destructive" onClick={handleCancel} className="shrink-0">
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                className="shrink-0"
                disabled={loadingConversation}
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
          
          {/* 对话状态提示 */}
          {!recordConversation && (
            <div className="text-xs text-amber-500 mt-1">
              注意: 对话记录功能已关闭，对话内容不会被保存
            </div>
          )}
        </CardFooter>
      </Card>
      
      {/* 删除对话确认框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除对话</DialogTitle>
            <DialogDescription>
              您确定要删除此对话吗？此操作无法撤销，对话中的所有消息将永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deletingConversation}>
              取消
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteConversation}
              disabled={deletingConversation}
              className={deletingConversation ? "opacity-50 cursor-not-allowed" : ""}
            >
              {deletingConversation ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SimpleMode; 