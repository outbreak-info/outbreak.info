import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { adminStore } from '@/stores/adminStore';

const router = createRouter({
  history: createWebHistory(),
  routes,
  base: import.meta.env.BASE_URL,
  linkExactActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      };
    }
    // we can't pass disableScroll property in router param. so decided to use history state
    // reference: https://github.com/vuejs/router/blob/main/packages/router/CHANGELOG.md#414-2022-08-22
    if (!window.history.state.disableScroll) {
      return {
        left: 0,
        top: 0,
      };
    }
  },
});

// add loading icon between routes
router.beforeEach((to, from, next) => {
  const store = adminStore();
  store.setLoading(true);
  next();
});
router.afterEach((to, from) => {
  const store = adminStore();
  store.setLoading(false);
});

export default router;
