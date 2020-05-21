import Vue from 'vue'
import VueRouter from 'vue-router'
// import toolkit from '../utils/_toolkit'
const _env = process.env.NODE_ENV

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    meta: { keepAlive: true },
    component: () => import(/* webpackChunkName: "Home" */ '../views/Home/Home.vue')
  },
  {
    path: '/detail/:postId/',
    name: 'Detail',
    meta: { keepAlive: false },
    component: () => import(/* webpackChunkName: "Detail" */ '../views/Detail/Detail.vue')
  },
  {
    path: '/mine',
    name: 'Mine',
    meta: { keepAlive: false },
    component: () => import(/* webpackChunkName: "Mine" */ '../views/Mine/Mine.vue')
  },
  {
    path: '/create',
    name: 'Create',
    meta: { keepAlive: false },
    component: () => import(/* webpackChunkName: "Create" */ '../views/Create/Create.vue')
  },
  {
    path: '/pulic-code',
    name: 'PublicCode',
    meta: { keepAlive: true },
    component: () => import(/* webpackChunkName: "PublicCode" */ '../views/PublicCode/PublicCode.vue')
  }
]

const router = new VueRouter({
  mode: _env === 'production' ? 'history' : 'hash',
  base: _env === 'production' ? '/main/' : '/',
  routes
})

router.beforeEach((to, from, next) => {
  // const timestamp = localStorage.getItem('timestamp')
  // const nonceStr = localStorage.getItem('nonceStr')
  // const signature = localStorage.getItem('signature')
  // toolkit.wxConfig({ timestamp, nonceStr, signature })
  // if (toolkit.isWeChatUrl()) {
  //   window.location.href = toolkit.getProjectUrl()
  // }
  next()
})
export default router
