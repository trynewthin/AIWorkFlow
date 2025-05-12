import Dashboard from '../views/dashboard';
import HomePage from '../views/home/HomePage';
import Knowledge from '../views/knowledge/knowledge';
import KnowledgeDetail from '../views/knowledge/Detail';

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
      {
        index: true,
        element: <HomePage />,
        name: 'HomePage',
        meta: { title: '首页' },
      },
      {
        path: 'knowledge',
        element: <Knowledge />,
        name: 'Knowledge',
        meta: { title: '知识库' },
      },
      {
        path: 'knowledge/:kbId',
        element: <KnowledgeDetail />,
        name: 'KnowledgeDetail',
        meta: { title: '知识库详情' },
      },
    ]
  },
  // 在这里添加更多路由配置
];

export default routerMap; 