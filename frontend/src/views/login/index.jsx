import React, { useEffect } from "react";
import { LoginForm } from "@/components/login-form";
import { isLoggedIn } from "@/services/userService";
import { useNavigate } from "react-router-dom";
import BlobPattern from "@/components/ui/BlobPattern";
import { 
  BookOpen, 
  Workflow, 
  FileText, 
  Brain, 
  Bot, 
  Cpu, 
  Sparkles, 
  Code 
} from "lucide-react";

/**
 * 登录/注册页面组件
 * @returns {JSX.Element} 登录/注册页面
 */
export default function LoginPage() {
  const navigate = useNavigate();

  // 检查是否已登录，如果已登录则重定向到首页或仪表盘
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const loggedIn = await isLoggedIn();
        if (loggedIn) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("检查登录状态失败:", error);
      }
    };

    checkLoginStatus();
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 z-0">
        <BlobPattern />
        <div className="absolute inset-0 z-10">
          <div className="floating-icons">
            <BookOpen className="icon" size={36} style={{ '--delay': '0s', '--duration': '25s' }} />
            <Workflow className="icon" size={48} style={{ '--delay': '2s', '--duration': '28s' }} />
            <FileText className="icon" size={42} style={{ '--delay': '4s', '--duration': '26s' }} />
            <Brain className="icon" size={45} style={{ '--delay': '1s', '--duration': '30s' }} />
            <Bot className="icon" size={40} style={{ '--delay': '3s', '--duration': '27s' }} />
            <Cpu className="icon" size={38} style={{ '--delay': '5s', '--duration': '24s' }} />
            <Sparkles className="icon" size={32} style={{ '--delay': '6s', '--duration': '29s' }} />
            <Code className="icon" size={44} style={{ '--delay': '7s', '--duration': '32s' }} />
          </div>
        </div>
      </div>
      
      {/* 登录表单容器 */}
      <div className="w-full max-w-4xl z-20 bg-background/80 backdrop-blur-xl rounded-xl shadow-[0_0_25px_rgba(60,60,100,0.3)] border border-white/20">
        <LoginForm />
      </div>
      
      <style jsx>{`
        .floating-icons {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .icon {
          position: absolute;
          color: rgba(255, 255, 255, 0.7);
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.4));
          opacity: 0.8;
          animation: float var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
          z-index: 2;
        }
        
        .icon:nth-child(1) { top: 15%; left: 20%; }
        .icon:nth-child(2) { top: 60%; left: 65%; }
        .icon:nth-child(3) { top: 25%; left: 85%; }
        .icon:nth-child(4) { top: 75%; left: 15%; }
        .icon:nth-child(5) { top: 45%; left: 30%; }
        .icon:nth-child(6) { top: 85%; left: 45%; }
        .icon:nth-child(7) { top: 10%; left: 55%; }
        .icon:nth-child(8) { top: 50%; left: 10%; }
        
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0);
          }
          25% {
            transform: translateY(-30px) translateX(20px) rotate(5deg);
          }
          50% {
            transform: translateY(0) translateX(40px) rotate(0);
          }
          75% {
            transform: translateY(30px) translateX(20px) rotate(-5deg);
          }
          100% {
            transform: translateY(0) translateX(0) rotate(0);
          }
        }
      `}</style>
    </div>
  );
} 