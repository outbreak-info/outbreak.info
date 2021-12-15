import Vue from "vue";
import VueRouter from "vue-router";

import store from "@/store";

Vue.use(VueRouter);

const routes = [
  {
    path: "/about",
    name: "About",
    component: () =>
      import( /* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
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
    path: "/schema",
    name: "Schema",
    component: () =>
      import( /* webpackChunkName: "schema" */ "../views/Schema.vue")
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
    path: "/situation-reports",
    name: "SituationReports",
    props: route => ({
      voc: route.query.voc,
      voi: route.query.voi,
      moc: route.query.moc,
      moi: route.query.moi,
      name: route.query.name
    }),
    component: () =>
      import(
        /* webpackChunkName: "situation-reports" */
        "../views/SituationReports.vue"
      ),
    // Route to with query params https://stackoverflow.com/questions/50247097/child-route-component-not-rendering-in-vue-js
    beforeEnter(to, from, next) {
      if(to.params && to.params.alias) {
        // redirect to route below
        next({
          name: 'MutationReport',
          params: to.params,
          query: to.query
        })
      }
      else if (to.query && ((to.query.pango) || (to.query.muts))) {
        // redirect to route below
        next({
          name: 'MutationReport',
          query: to.query
        })
      } else
        next()
    }
  },
  // {
  //   path: "/situation-reports",
  //   name: "MutationReport",
  //   props: route => ({
  //     loc: route.query.loc,
  //     muts: route.query.muts,
  //     pango: route.query.pango,
  //     selected: route.query.selected
  //   }),
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "situation-report" */
  //       "../views/SituationReport.vue"
  //     )
  // },
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
    path: "/situation-reports/status",
    name: "SituationReportStatus",
    props: route => ({
      loc: route.query.loc,
      var: route.query.var
    }),
    component: () =>
      import(
        /* webpackChunkName: "situation-reports-status" */
        "../views/SituationReportStatus.vue"
      )
  },
  {
    path: "/compare-lineages",
    name: "SituationReportComparison",
    props: route => ({
      location: route.query.location,
      pango: route.query.pango,
      gene: route.query.gene,
      dark: route.query.dark,
      threshold: route.query.threshold
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
  // redirect old reports
  {
    path: "/situation-reports/B-1-1-7",
    redirect: to => ({
      name: "MutationReport",
      query: {
        pango: "B.1.1.7"
      }
    })
  },
  {
    path: "/situation-reports/B.1.1.7",
    redirect: to => ({
      name: "MutationReport",
      query: {
        pango: "B.1.1.7"
      }
    })
  },
  {
    path: "/situation-reports/B-1-429",
    redirect: to => ({
      name: "MutationReport",
      query: {
        pango: "B.1.429"
      }
    })
  },
  {
    path: "/situation-reports/S-W152C",
    redirect: to => ({
      name: "MutationReport",
      query: {
        muts: "S:W152C"
      }
    })
  },
  {
    path: "/situation-reports/S-N501Y",
    redirect: to => ({
      name: "MutationReport",
      query: {
        muts: "S:N501Y"
      }
    })
  },
  {
    path: "/situation-reports/S-S13I",
    redirect: to => ({
      name: "MutationReport",
      query: {
        muts: "S:S13I"
      }
    })
  },
  {
    path: "/situation-reports/ORF1b-D1183Y",
    redirect: to => ({
      name: "MutationReport",
      query: {
        muts: "ORF1b:D1183Y"
      }
    })
  },
  {
    path: "/situation-reports/S-L452R",
    redirect: to => ({
      name: "MutationReport",
      query: {
        muts: "S:L452R"
      }
    })
  },
  {
    path: "/situation-reports/S-P681H",
    redirect: to => ({
      name: "MutationReport",
      query: {
        muts: "S:P681H"
      }
    })
  },
  {
    path: "/situation-reports/S-E484K",
    redirect: to => ({
      name: "MutationReport",
      query: {
        muts: "S:E484K"
      }
    })
  },
  {
    path: "/situation-reports/CA%20VUI1",
    redirect: to => ({
      name: "MutationReport",
      query: {
        pango: "B.1.429"
      }
    })
  },
  
  {
    path: "/situation-reports/:alias?",
    name: "MutationReport",
    props: route => ({
      alias: route.params.alias,
      overlay: route.query.overlay,
      xmin: route.query.xmin,
      xmax: route.query.xmax,
      loc: route.query.loc, 
      muts: route.query.muts,
      pango: route.query.pango,
      selected: route.query.selected
    }),
    component: () =>
      import(
        /* webpackChunkName: "combined-lineage-report" */
        "../views/SituationReport.vue"
      )
  },
  {
    path: "/situation-reports-demo",
    redirect: "/situation-reports"
  },
  {
    path: "/situation-report-demo",
    redirect: "/situation-reports"
  },
  {
    path: "/location-reports",
    name: "LocationReports",
    component: () =>
      import(
        /* webpackChunkName: "location-reports" */
        "../views/LocationReports.vue"
      ),
    // Route to with query params https://stackoverflow.com/questions/50247097/child-route-component-not-rendering-in-vue-js
    beforeEnter(to, from, next) {
      if (to.query && to.query.loc) {
        // redirect to route below
        next({
          name: 'LocationReport',
          query: to.query
        })
      } else
        next()
    }
  },
  {
    path: "/location-reports",
    name: "LocationReport",
    props: route => ({
      alias: route.query.alias,
      loc: route.query.loc,
      muts: route.query.muts,
      pango: route.query.pango,
      variant: route.query.variant,
      selected: route.query.selected,
      dark: route.query.dark,
      xmax: route.query.xmax,
      xmin: route.query.xmin
    }),
    component: () =>
      import(
        /* webpackChunkName: "location-report" */
        "../views/LocationReport.vue"
      )
  },
  {
    path: "/watch-list",
    name: "WatchList",
    props: route => ({
      country: route.query.country,
      division: route.query.division
    }),
    component: () =>
      import(
        /* webpackChunkName: "watch-list" */
        "../views/WatchList.vue"
      )
  },
  {
    path: '/:catchAll(.*)',
    name: "NotFound",
    component: () =>
      import(
        /* webpackChunkName: "404" */
        "../views/PageNotFound.vue"
      )
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

router.onError((error) => {
  const pattern = /Loading chunk (\d) failed/g;
  const isChunkLoadFailed = error.message.match(pattern);
  const targetPath = router.history.pending.fullPath;

  if (isChunkLoadFailed) {
    console.log("Router detected error!");
    console.error(error);
    // history.replaceState("", "", targetPath);
  } else {
    throw error;
  }
});

export default router;
