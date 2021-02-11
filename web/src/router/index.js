import Vue from "vue";
import VueRouter from "vue-router";

import store from "@/store";

Vue.use(VueRouter);

const routes = [{
    path: "/",
    name: "Home",
    component: () =>
      import( /* webpackChunkName: "home" */ "../views/Home.vue")
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: () =>
      import( /* webpackChunkName: "privacy" */ "../views/Privacy.vue")
  },
  {
    path: "/terms",
    name: "Terms",
    component: () =>
      import( /* webpackChunkName: "terms" */ "../views/Terms.vue")
  },
  {
    path: "/license",
    name: "License",
    component: () =>
      import( /* webpackChunkName: "license" */ "../views/License.vue")
  },
  {
    path: "/videos",
    name: "Videos",
    component: () =>
      import( /* webpackChunkName: "videos" */ "../views/Videos.vue")
  },
  {
    path: "/citation",
    name: "Citation",
    component: () =>
      import( /* webpackChunkName: "citation" */ "../views/Citation.vue")
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/regions",
    name: "Regions",
    component: () =>
      import( /* webpackChunkName: "regions" */ "../views/Regions.vue")
  },
  {
    path: "/schema",
    name: "Schema",
    component: () =>
      import( /* webpackChunkName: "schema" */ "../views/Schema.vue")
  },
  {
    path: "/maps",
    name: "Maps",
    props: route => ({
      admin_level: route.query.admin_level,
      location: route.query.location,
      variable: route.query.variable,
      sort: route.query.sort,
      date: route.query.date,
      min: route.query.min,
      max: route.query.max,
      animate: route.animate
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "compare" */ "../views/Maps.vue")
  },
  {
    path: "/compare",
    name: "Compare",
    props: route => ({
      admin_levels: route.query.admin_levels,
      location: route.query.location,
      variable: route.query.variable,
      similarity: route.query.similarity
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "compare" */ "../views/Compare.vue")
  },
  {
    path: "/latest",
    name: "Latest",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "latest" */ "../views/Latest.vue")
  },
  {
    path: "/data",
    name: "Data",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import( /* webpackChunkName: "data" */ "../views/Data.vue")
  },
  {
    path: "/sources",
    name: "Sources",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "sources" */ "../views/Sources.vue")
  },
  {
    path: "/contributing-data",
    name: "Contributing",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "contributing" */ "../views/Contributing.vue")
  },
  {
    path: "/topics",
    name: "Topics",
    component: () =>
      import( /* webpackChunkName: "topics" */ "../views/Topics.vue")
  },
  {
    path: "/niaid",
    name: "NIAID",
    component: () =>
      import( /* webpackChunkName: "topics" */ "../views/NIAID.vue")
  },
  {
    path: "/topics/definitions",
    name: "Topic Definitions",
    component: () =>
      import( /* webpackChunkName: "topic-definitions" */ "../views/TopicDefinitions.vue")
  },
  {
    path: "/resources",
    name: "Resource Summary",
    component: () =>
      import( /* webpackChunkName: "resource-summary" */ "../views/ResourceSummary.vue")
  },
  {
    path: "/resources/search",
    name: "Resources",
    props: route => ({
      q: route.query.q,
      page: route.query.page,
      size: route.query.size,
      filter: route.query.filter,
      sort: route.query.sort,
      dateMin: route.query.dateMin,
      dateMax: route.query.dateMax
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "resources" */ "../views/Resources.vue")
  },
  {
    path: "/resources/:id",
    name: "Resource Page",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "resources-types" */
        "../views/ResourcePage.vue"
      )
  },

  {
    path: "/summary",
    name: "Summary",
    props: route => ({
      location: route.query.location
    }),
    meta: {
      hideNavigation: true
    },
    component: () =>
      import( /* webpackChunkName: "summary" */ "../views/Summary.vue")
  },
  {
    path: "/epidemiology",
    name: "Epidemiology",
    props: route => ({
      location: route.query.location,
      xVariable: route.query.xVariable,
      variable: route.query.variable,
      log: route.query.log,
      fixedY: route.query.fixedY,
      percapita: route.query.percapita
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import( /* webpackChunkName: "epi" */ "../views/Epi.vue")
  },
  {
    path: "/doubling-rates",
    name: "Doubling Rates",
    props: route => ({
      location: route.query.location,
      variable: route.query.variable
    }),
    component: () =>
      import(
        /* webpackChunkName: "doubling-rates" */
        "../views/DoublingRates.vue"
      )
  },
  // {
  //   path: "/sarscov2-mutations",
  //   name: "Mutations",
  //   props: route => ({
  //     location: route.query.location,
  //     variable: route.query.variable
  //   }),
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "mutations" */
  //       "../views/Mutations.vue"
  //     )
  // },
  {
    path: "/situation-reports",
    name: "SituationReports",
    component: () =>
      import(
        /* webpackChunkName: "situation-reports" */
        "../views/SituationReportsDemo.vue"
      ),
      // Route to with query params https://stackoverflow.com/questions/50247097/child-route-component-not-rendering-in-vue-js
    beforeEnter(to, from, next) {
      if (to.query && (to.query.pango)) {
        // redirect to route below
        next({
          name: 'MutationReport',
          query: to.query
        })
      } else
        next()
    }
  },
  {
    path: "/situation-reports",
    name: "MutationReport",
    props: route => ({
      country: route.query.country,
      division: route.query.division,
      muts: route.query.muts,
      pango: route.query.pango,
      selected: route.query.selected,
      selectedType: route.query.selectedType
    }),
    component: () =>
      import(
        /* webpackChunkName: "situation-report" */
        "../views/SituationReport.vue"
      )
  },
  {
    path: "/situation-reports/methods",
    name: "SituationReportMethodology",
    component: () =>
      import(
        /* webpackChunkName: "situation-reports-methods" */
        "../views/SituationReportMethodology.vue"
      )
  },
  {
    path: "/situation-reports/comparison",
    name: "SituationReportComparison",
    props: route => ({
      location: route.query.location,
      mutation1: route.query.mutation1,
      mutation2: route.query.mutation2,
    }),
    component: () =>
      import(
        /* webpackChunkName: "situation-reports-comparison" */
        "../views/SituationReportComparison.vue"
      )
  },
  {
    path: "/situation-reports/caveats",
    name: "SituationReportCaveats",
    component: () =>
      import(
        /* webpackChunkName: "situation-reports-caveats" */
        "../views/SituationReportsCaveats.vue"
      )
  },
  {
    path: "/situation-reports/:mutation",
    name: "SituationReport",
    component: () =>
      import(
        /* webpackChunkName: "situation-report" */
        "../views/SitReport.vue"
      )
  },
  {
    path: "/situation-reports-demo",
    redirect: "/situation-reports"
  },
  {
    path: "/situation-report-demo",
    redirect: "/situation-reports"
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  linkExactActiveClass: "active",
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      };
    }
    if (!to.params.disableScroll) {
      return {
        x: 0,
        y: 0
      };
    }
  }
});

// add loading icon between routes
router.beforeEach((to, from, next) => {
  store.commit("admin/setLoading", true);
  next();
})
router.afterEach((to, from) => {
  store.commit("admin/setLoading", false);
})

export default router;
