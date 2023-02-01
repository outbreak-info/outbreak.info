export const lazyLoad = (view) => {
  return () => import(`@/components/${view}.vue`);
};
