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
      }
    ]
  }
];

export default constantRouterMap;