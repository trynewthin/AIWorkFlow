import React, { useEffect, useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
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

/**
 * @component WorkflowConfig
 * @description 工作流配置组件，使用侧边抽屉展示和修改配置，并保存到localStorage
 */
const WorkflowConfig = ({ 
  executionOptions, 
  setExecutionOptions,
  workflow
}) => {
  // 临时存储配置，确认后才应用
  const [tempOptions, setTempOptions] = useState({...executionOptions});
  const [isSaving, setIsSaving] = useState(false);
  
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
          setTempOptions(parsedOptions);
        }
      } catch (error) {
        console.error('加载工作流配置失败:', error);
      }
    }
  }, [workflow?.id, setExecutionOptions]);
  
  // 打开时初始化临时配置
  const handleOpenChange = (open) => {
    if (open) {
      setTempOptions({...executionOptions});
    }
  };
  
  // 保存配置
  const handleSave = () => {
    setIsSaving(true);
    
    // 更新父组件状态
    setExecutionOptions(tempOptions);
    
    // 保存到localStorage
    if (workflow?.id) {
      try {
        localStorage.setItem(`workflow_config_${workflow.id}`, JSON.stringify(tempOptions));
      } catch (error) {
        console.error('保存工作流配置失败:', error);
      }
    }
    
    // 显示保存成功效果
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };
  
  return (
    <Sheet onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="bg-white hover:bg-gray-100">
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>工作流配置</SheetTitle>
          <SheetDescription>
            配置工作流"{workflow?.name || '未命名工作流'}"的执行选项
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="mt-6 h-[calc(100vh-180px)] px-4">
          <div className="space-y-6 pl-2">
            <div className="space-y-2">
              <Label htmlFor="timeout-ms">超时时间 (毫秒)</Label>
              <Input
                id="timeout-ms"
                type="number"
                value={tempOptions.timeout}
                onChange={(e) => setTempOptions({
                  ...tempOptions,
                  timeout: parseInt(e.target.value) || 60000
                })}
                min="1000"
                step="1000"
              />
              <p className="text-xs text-gray-500">工作流执行的最长时间，超过将自动中断</p>
            </div>

            <Separator />
            
            <div className="space-y-4">
              <Label>执行选项</Label>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="debug-mode"
                  checked={tempOptions.debug}
                  onCheckedChange={(checked) => setTempOptions({
                    ...tempOptions,
                    debug: checked
                  })}
                />
                <Label htmlFor="debug-mode" className="text-sm font-medium">
                  调试模式
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">启用调试模式会记录更详细的执行过程</p>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="validate-start-end"
                  checked={tempOptions.validateStartEnd}
                  onCheckedChange={(checked) => setTempOptions({
                    ...tempOptions,
                    validateStartEnd: checked
                  })}
                />
                <Label htmlFor="validate-start-end" className="text-sm font-medium">
                  校验工作流首尾节点
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">要求首节点为开始节点，尾节点为结束节点</p>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="trace-execution"
                  checked={tempOptions.traceExecution ?? false}
                  onCheckedChange={(checked) => setTempOptions({
                    ...tempOptions,
                    traceExecution: checked
                  })}
                />
                <Label htmlFor="trace-execution" className="text-sm font-medium">
                  追踪执行步骤
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">记录每个节点的执行耗时和数据流转</p>
              
              <Separator />
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="fail-on-error"
                  checked={tempOptions.failOnError !== false}
                  onCheckedChange={(checked) => setTempOptions({
                    ...tempOptions,
                    failOnError: checked
                  })}
                />
                <Label htmlFor="fail-on-error" className="text-sm font-medium">
                  出错时中断执行
                </Label>
              </div>
              <p className="text-xs text-gray-500 ml-6">节点执行出错时停止工作流，否则尝试继续执行</p>
            </div>
          </div>
        </ScrollArea>
        
        <SheetFooter className="pt-4 mt-2 border-t">
          <Button 
            onClick={handleSave} 
            className="w-full" 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" /> 已保存
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> 保存配置
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default WorkflowConfig;