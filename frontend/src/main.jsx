import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import routerMap from './router/routerMap.jsx'

/**
 * @description 创建路由配置，将 App 作为根布局，routerMap 中的路由作为其子路由
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    // errorElement: <ErrorPage />, // 可选：错误边界页面
    children: routerMap, // 将 routerMap 中的路由作为 App 的子路由
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
