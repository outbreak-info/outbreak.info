export const lazyLoad = (view) =>{
    return () => import(/* webpackPrefetch: true */ `@/components/${view}.vue`)
}