import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'
import RelatorioProduto from '../views/RelatorioProduto.vue'
import DiagnosticoView from '../views/DiagnosticoView.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/relatorio',
    name: 'relatorio',
    component: RelatorioProduto
  },
  {
    path: '/diagnostico',
    name: 'diagnostico',
    component: DiagnosticoView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
