import React, { useEffect, useState } from 'react';
import { Settings, Save, Check, Info } from 'lucide-react';
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from "sonner";
import { Switch } from '@/components/ui/switch';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

/**
 * @component WorkflowConfig
 * @description 工作流配置组件，使用侧边抽屉展示和修改配置，并保存到localStorage
 */
const WorkflowConfig = ({ 
  executionOptions, 
  setExecutionOptions,
  workflow
}) => {
  // 显示高级配置弹窗的状态
  const [open, setOpen] = useState(false);
  
  // 本地修改临时存储
  const [localOptions, setLocalOptions] = useState({ ...executionOptions });
  
  // 从localStorage加载配置
  useEffect(() => {
    if (workflow?.id) {
      try {
        const savedOptions = localStorage.getItem(`workflow_config_${workflow.id}`);
        if (savedOptions) {
          const parsedOptions = JSON.parse(savedOptions);
          // 更新父组件状态
          setExecutionOptions(parsedOptions);
          // 更新本地临时状态
          setLocalOptions(parsedOptions);
        }
      } catch (error) {
        console.error('加载工作流配置失败:', error);
      }
    }
  }, [workflow?.id, setExecutionOptions]);
  
  // 更新执行选项
  const updateOption = (key, value) => {
    setLocalOptions(prev => ({ ...prev, [key]: value }));
  };
  
  // 应用所有配置
  const applyConfig = () => {
    setExecutionOptions(localOptions);
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          执行配置
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-5">
        <div className="space-y-5">
          <div>
            <h3 className="font-medium text-sm mb-2 flex items-center">
              基本配置
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="validateStartEnd" className="cursor-pointer">校验首尾节点</Label>
                  <div className="relative group">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    <span className="absolute -top-2 left-full ml-2 w-48 rounded bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                      校验工作流必须以开始节点和结束节点作为首尾
                    </span>
                  </div>
                </div>
                <Switch
                  id="validateStartEnd"
                  checked={localOptions.validateStartEnd}
                  onCheckedChange={value => updateOption('validateStartEnd', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="timeout" className="cursor-pointer">超时时间 (毫秒)</Label>
                  <div className="relative group">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    <span className="absolute -top-2 left-full ml-2 w-48 rounded bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                      工作流执行的最大时间限制，超时将中断执行
                    </span>
                  </div>
                </div>
                <Input
                  id="timeout"
                  type="number"
                  min="1000"
                  max="300000"
                  step="1000"
                  value={localOptions.timeout}
                  onChange={e => updateOption('timeout', parseInt(e.target.value))}
                  className="w-28"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="debug" className="cursor-pointer">调试模式</Label>
                  <div className="relative group">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    <span className="absolute -top-2 left-full ml-2 w-48 rounded bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                      开启调试模式，将记录更详细的日志
                    </span>
                  </div>
                </div>
                <Switch
                  id="debug"
                  checked={localOptions.debug}
                  onCheckedChange={value => updateOption('debug', value)}
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div>
            <h3 className="font-medium text-sm mb-2 flex items-center">
              对话选项
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="recordConversation" className="cursor-pointer">记录对话</Label>
                  <div className="relative group">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    <span className="absolute -top-2 left-full ml-2 w-48 rounded bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                      将工作流输入输出保存为对话记录
                    </span>
                  </div>
                </div>
                <Switch
                  id="recordConversation"
                  checked={localOptions.recordConversation}
                  onCheckedChange={value => updateOption('recordConversation', value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="recordNodeExecution" className="cursor-pointer">记录节点执行</Label>
                  <div className="relative group">
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                    <span className="absolute -top-2 left-full ml-2 w-48 rounded bg-gray-800 px-2 py-1 text-xs text-gray-100 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                      记录每个节点的执行状态和结果
                    </span>
                  </div>
                </div>
                <Switch
                  id="recordNodeExecution"
                  checked={localOptions.recordNodeExecution}
                  onCheckedChange={value => updateOption('recordNodeExecution', value)}
                  disabled={!localOptions.recordConversation}
                />
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="pt-2 flex justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={applyConfig}>
              应用配置
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WorkflowConfig;