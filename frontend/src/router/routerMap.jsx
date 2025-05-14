import Dashboard from '../views/dashboard';
import HomePage from '../views/home/HomePage';
import Knowledge from '../views/knowledge/knowledge';
import KnowledgeDetail from '../views/knowledge/Detail';
import DocsPage from '../views/odocs';
import NodeGuide from '../views/odocs/nodeGuide';
import WorkflowList from '../views/workflow/WorkflowList';
import WorkflowEditor from '../views/workflow/WorkflowEditor';
import WorkflowExecution from '../views/workflow/WorkflowExecution';

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
      {
        path: 'docs',
        element: <DocsPage />,
        name: 'DocsPage',
        meta: { title: '教程文档' },
      },
      {
        path: 'docs/node',
        element: <NodeGuide />,
        name: 'NodeGuide',
        meta: { title: '节点使用教程' },
      },
      {
        path: 'workflow',
        element: <WorkflowList />,
        name: 'WorkflowList',
        meta: { title: '工作流列表' },
      },
      {
        path: 'workflow/:id',
        element: <WorkflowEditor />,
        name: 'WorkflowEditor',
        meta: { title: '编辑工作流' },
      },
      {
        path: 'workflow/:id/execute',
        element: <WorkflowExecution />,
        name: 'WorkflowExecution',
        meta: { title: '执行工作流' },
      }
    ]
  },
  // 在这里添加更多路由配置

];

export default routerMap; 