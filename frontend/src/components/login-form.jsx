import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"
import { login, loginByKey, register } from "@/services/userService"
import { toast } from "sonner"
import { BookOpen, Workflow, FileText, Brain, Bot, Cpu } from "lucide-react"

export function LoginForm({
  className,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [keyValue, setKeyValue] = useState("")
  const [registerUsername, setRegisterUsername] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!username || !password) {
      toast.error("输入错误", {
        description: "用户名和密码不能为空"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await login(username, password)
      if (result && result.success) {
        toast.success("登录成功", {
          description: `欢迎回来，${result.user.username}`
        })
        navigate("/")
      }
    } catch (error) {
      toast.error("登录失败", {
        description: error.message || "请检查用户名和密码"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyLogin = async (e) => {
    e.preventDefault()
    if (!keyValue) {
      toast.error("输入错误", {
        description: "密钥不能为空"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await loginByKey(keyValue)
      if (result && result.success) {
        toast.success("登录成功", {
          description: `欢迎回来，${result.user.username}`
        })
        navigate("/dashboard")
      }
    } catch (error) {
      toast.error("登录失败", {
        description: error.message || "密钥无效或已过期"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!registerUsername || !registerPassword) {
      toast.error("输入错误", {
        description: "用户名和密码不能为空"
      })
      return
    }

    if (registerPassword !== confirmPassword) {
      toast.error("密码错误", {
        description: "两次输入的密码不一致"
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await register(registerUsername, registerPassword)
      if (result && result.success) {
        toast.success("注册成功", {
          description: "请使用新账号登录"
        })
        // 切换到登录选项卡
        document.getElementById("login-tab").click()
        setUsername(registerUsername)
        setPassword("")
      }
    } catch (error) {
      toast.error("注册失败", {
        description: error.message || "注册过程中出现错误"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <Tabs defaultValue="login" className="p-6 md:p-8">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger id="login-tab" value="login">登录</TabsTrigger>
              <TabsTrigger value="register">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">欢迎回来</h1>
                  <p className="text-muted-foreground text-balance">
                    登录您的 AI Workflow 账号
                  </p>
                </div>
                
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="username">用户名</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="请输入用户名" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor="password">密码</Label>
                    </div>
                    <Input 
                      id="password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "登录中..." : "登录"}
                  </Button>
                </form>
                
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    或使用密钥登录
                  </span>
                </div>
                
                <form onSubmit={handleKeyLogin} className="flex flex-col gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="key">API 密钥</Label>
                    <Input 
                      id="key" 
                      type="text" 
                      placeholder="请输入密钥" 
                      value={keyValue}
                      onChange={(e) => setKeyValue(e.target.value)}
                      required 
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                    {isLoading ? "验证中..." : "使用密钥登录"}
                  </Button>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-2xl font-bold">创建账号</h1>
                  <p className="text-muted-foreground text-balance">
                    注册 AI Workflow 以开始使用
                  </p>
                </div>
                
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="register-username">用户名</Label>
                    <Input 
                      id="register-username" 
                      type="text" 
                      placeholder="请设置用户名" 
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="register-password">密码</Label>
                    <Input 
                      id="register-password" 
                      type="password"
                      placeholder="请设置密码"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirm-password">确认密码</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      placeholder="请再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required 
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "注册中..." : "注册"}
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="bg-muted relative hidden md:block overflow-hidden">
            <div className="absolute inset-0" style={{
              background: "linear-gradient(135deg, rgb(44, 52, 95) 0%, rgb(76, 61, 139) 50%, rgb(40, 87, 128) 100%)"
            }}></div>
            
            <div className="feature-cards-container">
              <div className="feature-card" style={{ '--delay': '0s', '--duration': '20s' }}>
                <div className="icon-container">
                  <Workflow size={24} />
                </div>
                <h3>智能工作流</h3>
                <p>构建高效的AI工作流程，自动化处理复杂任务</p>
              </div>
              
              <div className="feature-card" style={{ '--delay': '4s', '--duration': '18s' }}>
                <div className="icon-container">
                  <Brain size={24} />
                </div>
                <h3>AI模型集成</h3>
                <p>轻松连接多种AI模型，按需定制应用场景</p>
              </div>
              
              <div className="feature-card" style={{ '--delay': '2s', '--duration': '22s' }}>
                <div className="icon-container">
                  <FileText size={24} />
                </div>
                <h3>文档智能</h3>
                <p>智能处理文档内容，提取关键信息自动归类</p>
              </div>
              
              <div className="feature-card" style={{ '--delay': '6s', '--duration': '25s' }}>
                <div className="icon-container">
                  <Bot size={24} />
                </div>
                <h3>智能助手</h3>
                <p>AI助手帮您高效完成工作，提升生产力</p>
              </div>
              
              <div className="feature-card" style={{ '--delay': '8s', '--duration': '15s' }}>
                <div className="icon-container">
                  <Cpu size={24} />
                </div>
                <h3>强大扩展性</h3>
                <p>支持多种插件和自定义节点，功能无限扩展</p>
              </div>
              
              <div className="feature-card" style={{ '--delay': '5s', '--duration': '23s' }}>
                <div className="icon-container">
                  <BookOpen size={24} />
                </div>
                <h3>知识管理</h3>
                <p>构建个人或团队知识库，随时获取关键信息</p>
              </div>
            </div>
            
            <style jsx>{`
              .feature-cards-container {
                position: absolute;
                inset: 0;
                z-index: 10;
                padding: 2rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                perspective: 1000px;
              }
              
              .feature-card {
                position: absolute;
                width: 180px;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(5px);
                border-radius: 12px;
                padding: 1rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #fff;
                animation: float3d var(--duration) ease-in-out infinite;
                animation-delay: var(--delay);
                transform-style: preserve-3d;
              }
              
              .feature-card:nth-child(1) { top: 15%; left: 10%; }
              .feature-card:nth-child(2) { top: 60%; left: 20%; }
              .feature-card:nth-child(3) { top: 20%; left: 60%; }
              .feature-card:nth-child(4) { top: 65%; left: 50%; }
              .feature-card:nth-child(5) { top: 40%; left: 35%; }
              .feature-card:nth-child(6) { top: 45%; left: 70%; }
              
              .icon-container {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.15);
                margin-bottom: 0.75rem;
              }
              
              .feature-card h3 {
                font-size: 0.9rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
              }
              
              .feature-card p {
                font-size: 0.75rem;
                opacity: 0.9;
                line-height: 1.2;
              }
              
              @keyframes float3d {
                0% {
                  transform: translateZ(0) translateY(0) rotate3d(1, 1, 1, 0deg);
                }
                25% {
                  transform: translateZ(20px) translateY(-10px) rotate3d(1, 1, 1, 5deg);
                }
                50% {
                  transform: translateZ(10px) translateY(0) rotate3d(1, 1, 1, 0deg);
                }
                75% {
                  transform: translateZ(30px) translateY(10px) rotate3d(1, 1, 1, -5deg);
                }
                100% {
                  transform: translateZ(0) translateY(0) rotate3d(1, 1, 1, 0deg);
                }
              }
            `}</style>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
