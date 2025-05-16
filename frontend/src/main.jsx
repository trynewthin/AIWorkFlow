import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import routerMap from './router/routerMap.jsx'
import ErrorPage from './views/error/ErrorPage.jsx'
import { AuthGuard } from './components/auth-guard.jsx'

/**
 * 处理路由配置，按照身份验证要求组织路由
 */
const processedRoutes = [];

// 区分需要验证和不需要验证的路由
const authRoutes = [];
const publicRoutes = [];

routerMap.forEach(route => {
  if (route.meta?.requiresAuth === false) {
    publicRoutes.push(route);
  } else {
    authRoutes.push(route);
  }
});

// 构建最终路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // 公共路由直接添加
      ...publicRoutes,
      
      // 受保护的路由需要通过 AuthGuard 包装
      {
        element: <AuthGuard requireAuth={true} />,
        children: authRoutes
      }
    ]
  }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
