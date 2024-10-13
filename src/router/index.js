import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/userStore';
import Home from '../views/Home.vue';
import Profile from '../views/Profile.vue';
import Wishlist from '../components/Wishlist.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

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
    meta: { requiresAuth: true } // Agrega meta para rutas protegidas
  },
  ],
})


router.beforeEach((to, from, next) => {
  const userStore = useUserStore(); // Access the userStore
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // This route requires auth, check if user is logged in
    if (!userStore.isAuthenticated) {
      next({
        name: 'login'
      })
    } else {
      next()
    }
  } else {
    next() // make sure to always call next()!
  }
})


export default router
