import Dashboard from '../views/dashboard';

/**
 * @description 路由配置数组
 * 属性:
 *   path: string - 路由路径
 *   element: JSX.Element - 对应的组件
 *   name: string (可选) - 路由名称，方便调试和链接
 *   meta: object (可选) - 路由元信息，如标题、权限等
 *   index: boolean (可选) - 是否为索引路由
 */
const routerMap = [
  {
    path: '/',
    element: <Dashboard />,    
    name: 'Dashboard',
    meta: { title: '主页' },
    children: [
    ]
  },
  // 在这里添加更多路由配置
];

export default routerMap; 