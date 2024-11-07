import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase/config';
import Home from '../views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/recover-password',
    name: 'RecoverPassword',
    component: () => import('../views/RecoverPassword.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/create-pet',
    name: 'CreatePet',
    component: () => import('../views/CreatePet.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/pet/:id',
    name: 'PetDetails',
    component: () => import('../views/PetDetails.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;