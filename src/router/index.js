import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Profile from '../views/Profile.vue';
import Wishlist from '../components/Wishlist.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import '@fortawesome/fontawesome-free/css/all.css';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: Wishlist,
      meta:{
        requiresAuth: true,
      }
    },
    {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { requiresAuth: true } 
  },
  ],
})


router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!localStorage.getItem('jwt')) {
      next({
        name: 'login'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})


export default router