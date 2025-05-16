import React, { useState, useEffect } from 'react';
import { 
  User, 
  Key, 
  Save, 
  Plus, 
  Trash2,
  RefreshCw,
  Copy,
  AlertCircle
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageHeader from "@/components/ui/PageHeader";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

import { userService } from '@/services';

/**
 * @description 用户个人资料页面组件
 * @returns {JSX.Element}
 */
function UserPage() {
  // 用户数据状态
  const [userData, setUserData] = useState({
    id: 0,
    username: '',
    created_at: ''
  });
  
  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // API密钥列表
  const [apiKeys, setApiKeys] = useState([]);
  
  // 状态标志
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  
  /**
   * 处理API错误，生成友好的错误消息
   * @param {Error|string} error - 错误对象或消息
   * @param {string} defaultMsg - 默认错误信息
   * @returns {string} 格式化的错误消息
   */
  const formatErrorMessage = (error, defaultMsg = '操作失败') => {
    if (!error) return defaultMsg;
    
    if (typeof error === 'string') return error;
    
    if (error.message) return error.message;
    
    return defaultMsg;
  };
  
  // 获取当前用户信息
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const res = await userService.getCurrentUser();
      console.log('获取用户信息响应:', res); // 添加调试信息
      
      if (res.success && res.user) {
        setUserData(res.user);
        setEditForm({
          ...editForm,
          username: res.user.username
        });
      } else {
        console.error('获取用户信息失败, API返回:', res); // 添加详细错误信息
        toast.error('获取用户信息失败: ' + formatErrorMessage(res.message, '未知错误'));
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      toast.error('获取用户信息失败: ' + formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };
  
  // 获取用户API密钥
  const fetchUserKeys = async () => {
    try {
      const res = await userService.getCurrentUserKeys();
      if (res.success && res.keys) {
        setApiKeys(res.keys);
      } else if (res.success && Array.isArray(res.data)) {
        setApiKeys(res.data);
      } else {
        console.warn('获取API密钥失败:', res.message);
        toast.error('获取API密钥失败: ' + formatErrorMessage(res.message, '未知错误'));
      }
    } catch (error) {
      console.error('获取API密钥失败:', error);
      toast.error('获取API密钥失败: ' + formatErrorMessage(error));
    }
  };
  
  // 刷新所有数据
  const refreshAllData = () => {
    fetchUserData();
    fetchUserKeys();
  };
  
  // 初始化加载数据
  useEffect(() => {
    refreshAllData();
  }, []);
  
  // 处理表单输入变化
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value
    });
  };
  
  // 更新用户资料
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    // 检查密码一致性
    if (editForm.newPassword && editForm.newPassword !== editForm.confirmPassword) {
      toast.error('新密码与确认密码不匹配');
      return;
    }
    
    try {
      setIsSaving(true);
      
      const updateData = {
        username: editForm.username
      };
      
      if (editForm.newPassword) {
        updateData.password = editForm.newPassword;
      }
      
      const res = await userService.updateUser(userData.id, updateData);
      
      if (res.success) {
        toast.success('用户资料更新成功');
        
        // 立即刷新数据
        await fetchUserData();
        
        // 清空密码字段
        setEditForm(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        toast.error('更新失败: ' + formatErrorMessage(res.message, '未知错误'));
      }
    } catch (error) {
      console.error('更新用户资料失败:', error);
      toast.error('更新失败: ' + formatErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };
  
  // 生成新的API密钥
  const handleGenerateKey = async () => {
    try {
      setIsGeneratingKey(true);
      const res = await userService.generateKeyForCurrentUser();
      
      if (res.success) {
        toast.success('新密钥生成成功');
        
        // 强制延迟200ms确保后端数据更新完成
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 立即刷新密钥列表
        const keysResult = await userService.getCurrentUserKeys();
        if (keysResult.success) {
          // 直接使用返回的数据更新状态
          if (keysResult.keys) {
            setApiKeys(keysResult.keys);
          } else if (keysResult.data && Array.isArray(keysResult.data)) {
            setApiKeys(keysResult.data);
          }
        } else {
          console.warn('刷新密钥列表失败:', keysResult.message);
        }
      } else {
        toast.error('生成密钥失败: ' + formatErrorMessage(res.message, '未知错误'));
      }
    } catch (error) {
      console.error('生成密钥失败:', error);
      toast.error('生成密钥失败: ' + formatErrorMessage(error));
    } finally {
      setIsGeneratingKey(false);
    }
  };
  
  // 更新API密钥
  const handleUpdateKey = async (keyId) => {
    try {
      const res = await userService.updateKey(keyId);
      
      if (res.success) {
        toast.success('密钥更新成功');
        
        // 强制延迟200ms确保后端数据更新完成
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 立即刷新密钥列表
        const keysResult = await userService.getCurrentUserKeys();
        if (keysResult.success) {
          // 直接使用返回的数据更新状态
          if (keysResult.keys) {
            setApiKeys(keysResult.keys);
          } else if (keysResult.data && Array.isArray(keysResult.data)) {
            setApiKeys(keysResult.data);
          }
        } else {
          console.warn('刷新密钥列表失败:', keysResult.message);
        }
      } else {
        toast.error('更新密钥失败: ' + formatErrorMessage(res.message, '未知错误'));
      }
    } catch (error) {
      console.error('更新密钥失败:', error);
      toast.error('更新密钥失败: ' + formatErrorMessage(error));
    }
  };
  
  // 删除API密钥
  const handleDeleteKey = async (keyId) => {
    try {
      const res = await userService.deleteKey(keyId);
      
      if (res.success) {
        toast.success('密钥删除成功');
        // 立即更新本地状态
        setApiKeys(prevKeys => prevKeys.filter(key => key.id !== keyId));
      } else {
        toast.error('删除密钥失败: ' + formatErrorMessage(res.message, '未知错误'));
      }
    } catch (error) {
      console.error('删除密钥失败:', error);
      toast.error('删除密钥失败: ' + formatErrorMessage(error));
    }
  };
  
  // 复制API密钥到剪贴板
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('已复制到剪贴板');
      })
      .catch((err) => {
        console.error('复制失败:', err);
        toast.error('复制失败');
      });
  };
  
  return (
    <div className="container mx-auto py-6">
      <PageHeader
        title="用户中心"
        description="管理您的个人资料和API密钥"
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">加载中...</span>
        </div>
      ) : userData.id === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-red-400" />
          <h3 className="text-xl font-bold mb-2">获取用户信息失败</h3>
          <p className="text-gray-500 mb-6">无法加载用户数据，请检查您是否已登录，或者服务器连接是否正常</p>
          <Button 
            onClick={() => {
              refreshAllData();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            重新加载
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="profile">个人资料</TabsTrigger>
            <TabsTrigger value="api-keys">API密钥</TabsTrigger>
          </TabsList>
          
          {/* 个人资料标签页 */}
          <TabsContent value="profile">
            <div className="grid gap-8 md:grid-cols-2">
              {/* 用户信息卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle>用户信息</CardTitle>
                  <CardDescription>查看您的账户信息</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">{userData.username ? userData.username.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 text-center">
                    <h3 className="text-2xl font-bold">{userData.username || '未获取到用户名'}</h3>
                    <p className="text-sm text-gray-500">用户ID: {userData.id || '未知'}</p>
                    <p className="text-sm text-gray-500">创建时间: {userData.created_at ? new Date(userData.created_at).toLocaleString() : '未知'}</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* 编辑资料表单 */}
              <Card>
                <CardHeader>
                  <CardTitle>编辑资料</CardTitle>
                  <CardDescription>更新您的用户名和密码</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">用户名</Label>
                      <Input
                        id="username"
                        name="username"
                        placeholder="输入新的用户名"
                        value={editForm.username}
                        onChange={handleInputChange}
                        disabled={!userData.id} // 如果没有获取到用户ID，禁用输入框
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">新密码</Label>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="输入新密码"
                        value={editForm.newPassword}
                        onChange={handleInputChange}
                        disabled={!userData.id} // 如果没有获取到用户ID，禁用输入框
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">确认密码</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="再次输入新密码"
                        value={editForm.confirmPassword}
                        onChange={handleInputChange}
                        disabled={!userData.id} // 如果没有获取到用户ID，禁用输入框
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSaving || !userData.id}>
                      {isSaving ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          保存中...
                        </>
                      ) : !userData.id ? (
                        <>
                          <AlertCircle className="mr-2 h-4 w-4" />
                          无法获取用户信息
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          保存更改
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* API密钥标签页 */}
          <TabsContent value="api-keys">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>API密钥管理</CardTitle>
                  <CardDescription>管理您的应用程序访问密钥</CardDescription>
                </div>
                <Button onClick={handleGenerateKey} disabled={isGeneratingKey || !userData.id}>
                  {isGeneratingKey ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      生成中...
                    </>
                  ) : !userData.id ? (
                    <>
                      <AlertCircle className="mr-2 h-4 w-4" />
                      无法获取用户信息
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      生成新密钥
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {userData.id === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>无法获取用户信息</p>
                    <p className="text-sm mt-2">请检查您是否已登录，或刷新页面重试</p>
                  </div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>您还没有任何API密钥</p>
                    <p className="text-sm mt-2">点击"生成新密钥"按钮创建第一个密钥</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {apiKeys.map((key) => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Key className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-mono text-sm">{key.key_value.substring(0, 10)}...{key.key_value.substring(key.key_value.length - 10)}</p>
                            <p className="text-xs text-gray-500">创建于 {new Date(key.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(key.key_value)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="icon" onClick={() => handleUpdateKey(key.id)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon" className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>确认删除</DialogTitle>
                                <DialogDescription>
                                  您确定要删除此API密钥吗？此操作无法撤销，使用此密钥的应用程序将无法再访问API。
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => document.querySelector('dialog:open')?.close()}>
                                  取消
                                </Button>
                                <Button variant="destructive" onClick={() => {
                                  handleDeleteKey(key.id);
                                  document.querySelector('dialog:open')?.close();
                                }}>
                                  确认删除
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default UserPage; 