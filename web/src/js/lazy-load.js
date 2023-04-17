import { defineAsyncComponent } from 'vue';

export const lazyLoad = (view) => {
  return defineAsyncComponent(() => import(`@/components/${view}.vue`));
};
