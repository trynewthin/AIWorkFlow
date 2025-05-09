/**
 * 基础路由
 * @type { *[] }
 */

const constantRouterMap = [
  {
    path: '/',
    component: () => import('@/views/dashboard.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/home/Index.vue')
      },
      {
        path: 'Test',
        name: 'Test',
        component: () => import('@/views/test/Index.vue')
      },
      {
        path: 'Knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/Index.vue'),
        children: [
          {
            path: '',
            name: 'KnowledgeList',
            component: () => import('@/views/knowledge/List.vue')
          },
          {
            path: ':kbId',
            name: 'KnowledgeDetail',
            component: () => import('@/views/knowledge/Detail.vue'),
            props: true
          }
        ]
      }
    ]
  }
];

export default constantRouterMap;