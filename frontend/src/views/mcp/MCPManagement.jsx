import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Server,
  Package,
  Cpu,
  Database,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import * as mcpService from '../../services/mcpService';

/**
 * @description MCP管理页面组件
 * @returns {JSX.Element}
 */
function MCPManagement() {
  // 状态管理
  const [serviceStatus, setServiceStatus] = useState(null);
  const [modules, setModules] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [claudeConfig, setClaudeConfig] = useState(null);
  const [loading, setLoading] = useState({
    service: false,
    modules: false,
    health: false,
    metrics: false,
    claude: false
  });
  const [error, setError] = useState(null);

  // 设置加载状态
  const setLoadingState = useCallback((key, value) => {
    setLoading(prev => ({ ...prev, [key]: value }));
  }, []);

  // 获取服务状态
  const fetchServiceStatus = useCallback(async () => {
    setLoadingState('service', true);
    try {
      const status = await mcpService.getMCPServiceStatus();
      setServiceStatus(status);
      setError(null);
    } catch (error) {
      console.error('获取服务状态失败:', error);
      setError('获取服务状态失败: ' + error.message);
      toast.error('获取服务状态失败');
    } finally {
      setLoadingState('service', false);
    }
  }, [setLoadingState]);

  // 获取模块列表
  const fetchModules = useCallback(async () => {
    setLoadingState('modules', true);
    try {
      const moduleList = await mcpService.getAvailableModules();
      setModules(moduleList || []);
      setError(null);
    } catch (error) {
      console.error('获取模块列表失败:', error);
      setError('获取模块列表失败: ' + error.message);
      toast.error('获取模块列表失败');
    } finally {
      setLoadingState('modules', false);
    }
  }, [setLoadingState]);

  // 检查健康状态
  const fetchHealthStatus = useCallback(async () => {
    setLoadingState('health', true);
    try {
      const health = await mcpService.checkHealth();
      setHealthStatus(health);
      setError(null);
    } catch (error) {
      console.error('检查健康状态失败:', error);
      setError('检查健康状态失败: ' + error.message);
      setHealthStatus({ status: 'error', message: error.message });
    } finally {
      setLoadingState('health', false);
    }
  }, [setLoadingState]);

  // 获取服务指标
  const fetchMetrics = useCallback(async () => {
    setLoadingState('metrics', true);
    try {
      const metricsData = await mcpService.getServiceMetrics();
      setMetrics(metricsData);
      setError(null);
    } catch (error) {
      console.error('获取服务指标失败:', error);
      setError('获取服务指标失败: ' + error.message);
    } finally {
      setLoadingState('metrics', false);
    }
  }, [setLoadingState]);

  // 获取Claude配置
  const fetchClaudeConfig = useCallback(async () => {
    setLoadingState('claude', true);
    try {
      const config = await mcpService.getClaudeConfig();
      setClaudeConfig(config);
      setError(null);
    } catch (error) {
      console.error('获取Claude配置失败:', error);
      setError('获取Claude配置失败: ' + error.message);
    } finally {
      setLoadingState('claude', false);
    }
  }, [setLoadingState]);

  // 启动服务
  const handleStartService = async () => {
    setLoadingState('service', true);
    try {
      await mcpService.startMCPService();
      toast.success('MCP服务启动成功');
      await fetchServiceStatus();
    } catch (error) {
      console.error('启动服务失败:', error);
      toast.error('启动服务失败: ' + error.message);
    } finally {
      setLoadingState('service', false);
    }
  };

  // 停止服务
  const handleStopService = async () => {
    setLoadingState('service', true);
    try {
      await mcpService.stopMCPService();
      toast.success('MCP服务停止成功');
      await fetchServiceStatus();
    } catch (error) {
      console.error('停止服务失败:', error);
      toast.error('停止服务失败: ' + error.message);
    } finally {
      setLoadingState('service', false);
    }
  };

  // 重启服务
  const handleRestartService = async () => {
    setLoadingState('service', true);
    try {
      await mcpService.restartMCPService();
      toast.success('MCP服务重启成功');
      await fetchServiceStatus();
    } catch (error) {
      console.error('重启服务失败:', error);
      toast.error('重启服务失败: ' + error.message);
    } finally {
      setLoadingState('service', false);
    }
  };

  // 切换模块状态
  const handleToggleModule = async (moduleName, enabled) => {
    try {
      await mcpService.toggleModule(moduleName, enabled);
      toast.success(`模块 ${moduleName} ${enabled ? '启用' : '禁用'}成功`);
      await fetchModules();
    } catch (error) {
      console.error('切换模块状态失败:', error);
      toast.error('切换模块状态失败: ' + error.message);
    }
  };

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchServiceStatus(),
        fetchModules(),
        fetchHealthStatus(),
        fetchMetrics(),
        fetchClaudeConfig()
      ]);
    };

    initializeData();
  }, [fetchServiceStatus, fetchModules, fetchHealthStatus, fetchMetrics, fetchClaudeConfig]);

  // 刷新所有数据
  const refreshAllData = async () => {
    await Promise.all([
      fetchServiceStatus(),
      fetchModules(),
      fetchHealthStatus(),
      fetchMetrics()
    ]);
    toast.success('数据刷新成功');
  };

  // 获取状态图标
  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'stopped':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面头部 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            MCP 管理中心
          </h1>
          <p className="text-gray-600 mt-1">模型上下文协议（Model Context Protocol）服务管理</p>
        </div>
        <Button onClick={refreshAllData} variant="outline" className="flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>

             {/* 错误提示 */}
       {error && (
         <Alert variant="destructive">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>操作失败</AlertTitle>
           <AlertDescription>{error}</AlertDescription>
         </Alert>
       )}

      {/* 主要内容区域 */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="modules">模块管理</TabsTrigger>
          <TabsTrigger value="metrics">性能指标</TabsTrigger>
          <TabsTrigger value="config">配置信息</TabsTrigger>
        </TabsList>

        {/* 概览页面 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 服务状态控制 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="w-5 h-5 mr-2" />
                服务状态控制
              </CardTitle>
              <CardDescription>管理MCP服务的启动、停止和重启</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {loading.service ? (
                    <Spinner className="w-5 h-5" />
                  ) : (
                    getStatusIcon(serviceStatus?.status)
                  )}
                  <div>
                    <p className="font-medium">
                      服务状态: {serviceStatus?.status || '未知'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {serviceStatus?.message || '正在获取状态信息...'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleStartService} 
                    disabled={loading.service || serviceStatus?.status === 'running'}
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    启动
                  </Button>
                  <Button 
                    onClick={handleStopService} 
                    disabled={loading.service || serviceStatus?.status === 'stopped'}
                    variant="outline"
                    size="sm"
                  >
                    <Square className="w-4 h-4 mr-1" />
                    停止
                  </Button>
                  <Button 
                    onClick={handleRestartService} 
                    disabled={loading.service}
                    variant="outline"
                    size="sm"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    重启
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 健康状态 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                健康状态检查
              </CardTitle>
              <CardDescription>系统健康状态和连接检查</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                {loading.health ? (
                  <Spinner className="w-5 h-5" />
                ) : (
                  getStatusIcon(healthStatus?.status)
                )}
                <div>
                  <p className="font-medium">
                    健康状态: {healthStatus?.status || '检查中...'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {healthStatus?.message || '正在检查系统健康状态...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 模块管理页面 */}
        <TabsContent value="modules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2" />
                可用模块列表
              </CardTitle>
              <CardDescription>管理MCP服务中的各个功能模块</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.modules ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner className="w-6 h-6 mr-2" />
                  <span>正在加载模块...</span>
                </div>
              ) : modules.length > 0 ? (
                <div className="space-y-4">
                  {modules.map((module, index) => (
                    <div key={module.name || index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Package className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{module.name || '未命名模块'}</p>
                          <p className="text-sm text-gray-600">{module.description || '暂无描述'}</p>
                          {module.version && (
                            <p className="text-xs text-gray-500">版本: {module.version}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600">
                          {module.enabled ? '已启用' : '已禁用'}
                        </span>
                        <Switch
                          checked={module.enabled || false}
                          onCheckedChange={(checked) => handleToggleModule(module.name, checked)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>暂无可用模块</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 性能指标页面 */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                服务性能指标
              </CardTitle>
              <CardDescription>监控服务运行状态和性能数据</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.metrics ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner className="w-6 h-6 mr-2" />
                  <span>正在加载指标...</span>
                </div>
              ) : metrics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">CPU使用率</p>
                    <p className="text-2xl font-bold">{metrics.cpu || '0'}%</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">内存使用</p>
                    <p className="text-2xl font-bold">{metrics.memory || '0'} MB</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">活动连接</p>
                    <p className="text-2xl font-bold">{metrics.connections || '0'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">运行时间</p>
                    <p className="text-2xl font-bold">{metrics.uptime || '0'} h</p>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <Cpu className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>暂无性能指标数据</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 配置信息页面 */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Claude Desktop 配置
              </CardTitle>
              <CardDescription>查看和管理Claude Desktop集成配置</CardDescription>
            </CardHeader>
            <CardContent>
              {loading.claude ? (
                <div className="flex items-center justify-center p-8">
                  <Spinner className="w-6 h-6 mr-2" />
                  <span>正在加载配置...</span>
                </div>
              ) : claudeConfig ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">配置路径</p>
                      <p className="text-sm mt-1 break-all">{claudeConfig.configPath || '未设置'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600">配置状态</p>
                      <p className="text-sm mt-1">{claudeConfig.valid ? '有效' : '无效'}</p>
                    </div>
                  </div>
                  {claudeConfig.settings && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-2">配置详情</p>
                      <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-60">
                        {JSON.stringify(claudeConfig.settings, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8 text-gray-500">
                  <Database className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>暂无配置信息</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MCPManagement; 