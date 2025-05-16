/**
 * @file auth-guard.jsx
 * @description 路由身份验证守卫组件，控制受保护路由的访问
 */
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { isLoggedIn } from '@/services/userService';
import { Spinner } from '@/components/ui/spinner';

/**
 * 身份验证守卫组件
 * @param {Object} props 组件属性
 * @returns {JSX.Element} 路由组件
 */
export const AuthGuard = ({ requireAuth = true }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const loggedIn = await isLoggedIn();
        setIsAuthenticated(loggedIn);

        if (requireAuth && !loggedIn) {
          // 需要登录但用户未登录，重定向到登录页
          navigate('/login', { 
            replace: true,
            state: { from: location.pathname }
          });
        } else if (!requireAuth && loggedIn) {
          // 不需要登录但用户已登录（如登录页），重定向到主页
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('验证登录状态失败:', error);
        if (requireAuth) {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [requireAuth, navigate, location.pathname]);

  // 验证过程中显示加载状态
  if (isVerifying) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Spinner className="size-8" />
        <span className="ml-2">正在验证登录状态...</span>
      </div>
    );
  }

  // 通过验证，渲染子路由
  return <Outlet />;
}; 