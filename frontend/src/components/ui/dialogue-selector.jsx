import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import { workflowService } from '@/services';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Label } from './label';
import { Input } from './input';
import { format } from 'date-fns';

/**
 * @component DialogueSelector
 * @description 对话选择器组件，用于MemoryNode配置面板
 */
const DialogueSelector = ({ workflowId, value, onChange, onError, historyRounds = 5, onHistoryRoundsChange }) => {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [customValue, setCustomValue] = useState('');
  const [rounds, setRounds] = useState(historyRounds);

  // 加载对话列表
  const loadConversations = async () => {
    if (!workflowId) {
      onError?.('未提供工作流ID，无法加载对话');
      return;
    }

    setLoading(true);
    try {
      const result = await workflowService.getWorkflowConversations(workflowId);
      setConversations(result || []);
      
      // 如果当前值不在列表中，设置为自定义值
      if (value && result.findIndex(c => c.id === value) === -1) {
        setCustomValue(value);
      }
    } catch (error) {
      console.error('加载对话列表失败:', error);
      onError?.(error.message || '加载对话列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadConversations();
  }, [workflowId]);

  // 处理选择变更
  const handleSelectChange = (selectedValue) => {
    if (selectedValue === 'custom') {
      // 不触发onChange，等待用户输入自定义值
      return;
    }
    
    onChange(selectedValue);
  };

  // 处理自定义值变更
  const handleCustomChange = (e) => {
    setCustomValue(e.target.value);
  };

  // 应用自定义值
  const applyCustomValue = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
    }
  };

  // 处理历史轮次变更
  const handleRoundsChange = (e) => {
    const newRounds = parseInt(e.target.value);
    setRounds(newRounds);
    
    // 如果父组件提供了回调，则通知变更
    if (typeof onHistoryRoundsChange === 'function') {
      onHistoryRoundsChange(newRounds);
    }
  };

  // 格式化对话时间
  const formatConversationTime = (timestamp) => {
    try {
      return format(new Date(timestamp), 'yyyy-MM-dd HH:mm');
    } catch (error) {
      return '未知时间';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="dialogue-selector">对话选择</Label>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={loadConversations}
          className="h-8 px-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Select value={value || 'default'} onValueChange={handleSelectChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="选择对话或输入对话ID" />
        </SelectTrigger>
        <SelectContent>
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <SelectItem key={conversation.id} value={conversation.id}>
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span className="text-xs">
                    {formatConversationTime(conversation.created_at)}
                    {conversation.id === value ? ' (当前)' : ''}
                  </span>
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no_conversations" disabled>
              {loading ? '加载中...' : '无对话记录'}
            </SelectItem>
          )}
          <SelectItem value="custom">自定义对话ID</SelectItem>
        </SelectContent>
      </Select>

      {value === 'custom' && (
        <div className="flex items-center space-x-2">
          <Input
            id="custom-dialogue-id"
            placeholder="输入对话ID"
            value={customValue}
            onChange={handleCustomChange}
            className="flex-1"
          />
          <Button
            size="sm"
            disabled={!customValue.trim()}
            onClick={applyCustomValue}
          >
            应用
          </Button>
        </div>
      )}

      {/* 显示历史轮次选择器 */}
      <div className="mt-4">
        <Label htmlFor="history-rounds">历史轮次数量</Label>
        <div className="flex items-center space-x-2 mt-1">
          <Input
            id="history-rounds"
            type="number"
            min="1"
            max="20"
            value={rounds}
            onChange={handleRoundsChange}
            className="w-20"
          />
          <span className="text-sm text-gray-500">轮对话</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          控制加载多少轮历史对话消息（1轮=用户+AI各一条消息）
        </p>
      </div>
    </div>
  );
};

export default DialogueSelector; 