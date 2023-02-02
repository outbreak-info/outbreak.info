import { createRouter, createWebHistory } from 'vue-router';
import routes from './routes';
import { adminStore } from '@/stores/adminStore';

const router = createRouter({
  history: createWebHistory(),
  routes,
  linkExactActiveClass: 'active',
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash,
      };
    }
    if (!to.params.disableScroll) {
      return {
        x: 0,
        y: 0,
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

router.onError((error) => {
  const pattern = /Loading chunk (\d) failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;

  if (isChunkLoadFailed) {
    console.log('Router detected error!');
    console.error(error);
    // history.replaceState("", "", targetPath);
  } else {
    throw error;
  }
});

export default router;
