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
        path: 'Test/Upload',
        name: 'UploadTest',
        component: () => import('@/views/test/UploadTest.vue')
      },
      {
        path: 'Knowledge',
        name: 'Knowledge',
        component: () => import('@/views/knowledge/Index.vue'),
        children: [
          {
            path: '',
            name: 'KnowledgeList',
            component: () => import('@/views/knowledge/Index.vue')
          },
          {
            path: ':kbId',
            name: 'KnowledgeDetail',
            component: () => import('@/views/knowledge/Detail.vue'),
            props: true
          }
        ]
      },
      {
        path: 'Workflow',
        name: 'Workflow',
        component: () => import('@/views/workflow/Index.vue'),
        children: [
          { 
            path: '', 
            name: 'WorkflowList', 
            component: () => import('@/views/workflow/List.vue') 
          },
          { 
            path: 'create', 
            name: 'WorkflowCreate', 
            component: () => import('@/views/workflow/Create.vue') 
          },
          { 
            path: ':id', 
            name: 'WorkflowDetail', 
            component: () => import('@/views/workflow/Detail.vue'), 
            props: true 
          },
          { 
            path: ':id/edit', 
            name: 'WorkflowEdit', 
            component: () => import('@/views/workflow/Edit.vue'), 
            props: true 
          }
        ]
      }
    ]
  }
];

export default constantRouterMap;