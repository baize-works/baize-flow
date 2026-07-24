/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/',
    redirect: '/data-source',
  },


  {
    icon: 'database',
    name: 'datasource',
    path: '/data-source',
    component: './data-source',
  },


  {
    path: '/sync/batch-link-up',
    component: './batch-link-up',
    name: 'data-sync.batch',
    icon: 'sun',

  },
  {
    path: '/sync/batch-link-up/:id/detail',
    component: './batch-link-up/detail',
    hideInMenu: true,
  },
  {
    path: '/sync/batch-link-up/:id/config/single',
    component: './batch-link-up/config/single',
    hideInMenu: true,
  },
  {
    path: '/sync/batch-link-up/:id/config/multi',
    component: './batch-link-up/config/multi',
    hideInMenu: true,
  },
  {
    path: '/sync/batch-link-up/:id/config/script',
    component: './batch-link-up/config/script',
    hideInMenu: true,
  },
  {
    icon: 'bulb',
    name: 'client',
    path: '/client',
    component: './client',
  },
  {
    icon: 'monitor',
    name: 'metrics',
    path: '/metrics',
    component: './metrics',
  },
  {
    icon: 'bell',
    name: 'alarm',
    path: '/alarm',
    component: './alarm',
  },
  {
    icon: 'read',
    name: 'knowledge-management',
    path: '/knowledge-management',
    component: './knowledge-management',
    hideInMenu: true,
  },
  {
    icon: 'read',
    name: 'open-api',
    path: '/open-api',
    component: './open-api',
    hideInMenu: true,
  },

  {
    icon: 'pieChart',
    name: '数据洞察',
    path: '/bi',
    component: './bi',
    hideInMenu: true,
  },


  {
    name: 'Login',
    path: '/login',
    component: './login',
    layout: false,
    hideInMenu: true,
  },

  {
    path: '*',
    layout: false,
    component: './404',
  },
];