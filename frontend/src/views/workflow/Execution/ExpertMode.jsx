import React from 'react';
import { Play, StopCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * @component ExpertMode
 * @description 工作流执行页面的专家模式组件
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
  workflow
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
      {/* 左侧输入面板 */}
      <Card>
        <CardHeader>
          <CardTitle>输入参数</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="input-data">输入数据 (JSON 或纯文本)</Label>
            <Textarea
              id="input-data"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="font-mono"
              rows="10"
              placeholder='{"text": "你好"} 或直接输入纯文本'
              disabled={executing}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">执行选项</h3>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="debug-mode"
                checked={executionOptions.debug}
                onCheckedChange={(checked) => setExecutionOptions({
                  ...executionOptions,
                  debug: checked
                })}
                disabled={executing}
              />
              <Label htmlFor="debug-mode" className="text-sm font-medium">
                调试模式
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="validate-start-end"
                checked={executionOptions.validateStartEnd}
                onCheckedChange={(checked) => setExecutionOptions({
                  ...executionOptions,
                  validateStartEnd: checked
                })}
                disabled={executing}
              />
              <Label htmlFor="validate-start-end" className="text-sm font-medium">
                校验工作流首尾节点
              </Label>
              <div className="text-xs text-gray-500 ml-2">
                (要求首节点为开始节点，尾节点为结束节点)
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeout-ms">超时时间 (毫秒)</Label>
              <Input
                id="timeout-ms"
                type="number"
                value={executionOptions.timeout}
                onChange={(e) => setExecutionOptions({
                  ...executionOptions,
                  timeout: parseInt(e.target.value) || 60000
                })}
                min="1000"
                step="1000"
                disabled={executing}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {executing ? (
            <Button onClick={handleCancel} variant="destructive" className="w-full">
              <StopCircle className="w-5 h-5 mr-2" /> 取消执行
            </Button>
          ) : (
            <Button onClick={handleExecute} className="w-full">
              <Play className="w-5 h-5 mr-2" /> 执行工作流
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* 右侧结果面板 */}
      <Card>
        <CardHeader>
          <CardTitle>执行结果</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 错误提示 (执行期间的错误) */}
          {error && executing && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {/* 非执行期间的错误也显示 */}
          {error && !executing && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
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
            <div className="space-y-2">
              <h3 className="text-sm font-medium">输出数据</h3>
              <pre className="bg-gray-100 p-3 rounded border font-mono text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {!result && !executing && !error && (
            <p className="text-sm text-gray-500">暂无结果。请先执行工作流。</p>
          )}
        </CardContent>
        
        {workflow?.nodes && workflow.nodes.length > 0 && (
          <>
            <CardHeader className="pt-0"> {/* Adjusted padding for tighter spacing */}
              <CardTitle className="text-base">工作流节点 ({workflow.nodes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {workflow.nodes.map((node, index) => (
                <div
                  key={node.id}
                  className="p-3 bg-gray-50 rounded border flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 text-xs">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{node.flow_config?.nodeName || node.type || '未命名节点'}</p>
                      <p className="text-xs text-gray-500">类型: {node.type}</p>
                    </div>
                  </div>
                  
                  {/* 执行中状态指示 (可以根据实际的节点执行状态来动态显示) */}
                  {executing && (
                    <div className="ml-auto">
                      {/* Placeholder for individual node status, e.g., a spinner or specific icon */}
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </>
        )}
        {workflow?.nodes && workflow.nodes.length === 0 && (
          <CardContent>
            <p className="text-sm text-gray-500">此工作流没有任何节点。</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ExpertMode; 