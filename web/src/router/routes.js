export default [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/Privacy.vue'),
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: () => import('../views/Faq.vue'),
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Terms.vue'),
  },
  {
    path: '/license',
    name: 'License',
    component: () => import('../views/License.vue'),
  },
  {
    path: '/videos',
    name: 'Videos',
    component: () => import('../views/Videos.vue'),
  },
  {
    path: '/citation',
    name: 'Citation',
    component: () => import('../views/Citation.vue'),
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/About.vue'),
  },
  {
    path: '/regions',
    name: 'Regions',
    component: () => import('../views/Regions.vue'),
  },
  {
    path: '/schema',
    name: 'Schema',
    component: () => import('../views/Schema.vue'),
  },
  {
    path: '/maps',
    name: 'Maps',
    props: (route) => ({
      admin_level: route.query.admin_level,
      location: route.query.location,
      variable: route.query.variable,
      sort: route.query.sort,
      date: route.query.date,
      min: route.query.min,
      max: route.query.max,
      animate: route.animate,
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.

    component: () => import('../views/Maps.vue'),
  },
  {
    path: '/compare',
    name: 'Compare',
    props: (route) => ({
      admin_levels: route.query.admin_levels,
      location: route.query.location,
      variable: route.query.variable,
      similarity: route.query.similarity,
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Compare.vue'),
  },
  {
    path: '/latest',
    name: 'Latest',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Latest.vue'),
  },
  {
    path: '/data',
    name: 'Data',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.

    component: () => import('../views/Data.vue'),
  },
  {
    path: '/press',
    name: 'Press',
    component: () => import('../views/Press.vue'),
  },
  {
    path: '/sources',
    name: 'Sources',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Sources.vue'),
  },
  {
    path: '/contributing-data',
    name: 'Contributing',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Contributing.vue'),
  },
  {
    path: '/niaid',
    name: 'NIAID',
    component: () => import('../views/NIAID.vue'),
  },
  {
    path: '/topics/definitions',
    name: 'Topic Definitions',
    component: () => import('../views/TopicDefinitions.vue'),
  },
  {
    path: '/resources',
    name: 'Resource Summary',
    component: () => import('../views/ResourceSummary.vue'),
  },
  {
    path: '/resources/search',
    name: 'Resources',
    props: (route) => ({
      q: route.query.q,
      page: route.query.page,
      size: route.query.size,
      filter: route.query.filter,
      sort: route.query.sort,
      dateMin: route.query.dateMin,
      dateMax: route.query.dateMax,
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/Resources.vue'),
  },
  {
    path: '/resources/:id',
    name: 'Resource Page',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/ResourcePage.vue'),
  },

  {
    path: '/summary',
    name: 'Summary',
    props: (route) => ({
      location: route.query.location,
    }),
    state: {
      hideNavigation: true,
    },
    component: () => import('../views/Summary.vue'),
  },
  // embeddable iframe, stripped down combined location/variant reports
  {
    path: '/genomics/embed',
    name: 'GenomicsEmbed',
    props: (route) => ({
      type: route.query.type,
      loc: route.query.loc,
      pango: route.query.pango,
      muts: route.query.muts,
      alias: route.query.alias,
      variant: route.query.variant,
      xmin: route.query.xmin,
      xmax: route.query.xmax,
      selected: route.query.selected,
    }),
    state: {
      hideNavigation: true,
      includeGISAIDLogo: true,
    },
    component: () => import('../views/GenomicsEmbed.vue'),
  },
  {
    path: '/epidemiology',
    name: 'Epidemiology',
    props: (route) => ({
      location: route.query.location,
      variable: route.query.variable,
      log: route.query.log,
      xmin: route.query.xmin,
      xmax: route.query.xmax,
      fixedY: route.query.fixedY,
      percapita: route.query.percapita,
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.

    component: () => import('../views/Epi.vue'),
  },
  {
    path: '/situation-reports',
    name: 'SituationReports',
    props: (route) => ({
      voc: route.query.voc,
      voi: route.query.voi,
      moc: route.query.moc,
      moi: route.query.moi,
      name: route.query.name,
    }),
    component: () => import('../views/SituationReports.vue'),
    // // Route to with query params https://stackoverflow.com/questions/50247097/child-route-component-not-rendering-in-vue-js
    beforeEnter(to, from, next) {
      if (to.params && to.params.alias) {
        // redirect to route below
        next({
          name: 'MutationReport',
          params: to.params,
          query: to.query,
        });
      } else if (to.query && (to.query.pango || to.query.muts)) {
        // redirect to route below
        next({
          name: 'MutationReport',
          query: to.query,
        });
      } else next();
    },
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
    path: '/situation-reports/methods',
    name: 'SituationReportMethodology',
    component: () => import('../views/SituationReportMethodology.vue'),
  },
  {
    path: '/situation-reports/status',
    name: 'SituationReportStatus',
    props: (route) => ({
      loc: route.query.loc,
      var: route.query.var,
    }),
    component: () => import('../views/SituationReportStatus.vue'),
  },
  {
    path: '/compare-lineages',
    name: 'SituationReportComparison',
    props: (route) => ({
      location: route.query.location,
      pango: route.query.pango,
      gene: route.query.gene,
      dark: route.query.dark,
      threshold: route.query.threshold,
      nthresh: route.query.nthresh,
    }),
    component: () => import('../views/SituationReportComparison.vue'),
  },
  {
    path: '/growth-rates',
    name: 'GrowthRatesPage',
    props: (route) => ({
      lin: route.query.lin,
      loc: route.query.loc,
    }),
    component: () => import('../views/GrowthRatesPage.vue'),
  },
  {
    path: '/situation-reports/caveats',
    name: 'SituationReportCaveats',
    component: () => import('../views/SituationReportsCaveats.vue'),
  },
  // redirect old reports
  {
    path: '/situation-reports/B-1-1-7',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        pango: 'B.1.1.7',
      },
    }),
  },
  {
    path: '/situation-reports/B.1.1.7',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        pango: 'B.1.1.7',
      },
    }),
  },
  {
    path: '/situation-reports/B-1-429',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        pango: 'B.1.429',
      },
    }),
  },
  {
    path: '/situation-reports/S-W152C',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        muts: 'S:W152C',
      },
    }),
  },
  {
    path: '/situation-reports/S-N501Y',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        muts: 'S:N501Y',
      },
    }),
  },
  {
    path: '/situation-reports/S-S13I',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        muts: 'S:S13I',
      },
    }),
  },
  {
    path: '/situation-reports/ORF1b-D1183Y',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        muts: 'ORF1b:D1183Y',
      },
    }),
  },
  {
    path: '/situation-reports/S-L452R',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        muts: 'S:L452R',
      },
    }),
  },
  {
    path: '/situation-reports/S-P681H',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        muts: 'S:P681H',
      },
    }),
  },
  {
    path: '/situation-reports/S-E484K',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        muts: 'S:E484K',
      },
    }),
  },
  {
    path: '/situation-reports/CA%20VUI1',
    redirect: (to) => ({
      name: 'MutationReport',
      query: {
        pango: 'B.1.429',
      },
    }),
  },
  {
    path: '/situation-reports/:alias?',
    name: 'MutationReport',
    props: (route) => ({
      alias: route.params.alias,
      overlay: route.query.overlay,
      xmin: route.query.xmin,
      xmax: route.query.xmax,
      loc: route.query.loc,
      muts: route.query.muts,
      pango: route.query.pango,
      selected: route.query.selected,
    }),
    component: () => import('../views/SituationReport.vue'),
    beforeEnter(to, from, next) {
      if (!to.params.alias && !to.query.pango && !to.query.muts) {
        next({ name: 'SituationReports' });
      } else next();
    },
  },
  {
    path: '/situation-reports-demo',
    redirect: '/situation-reports',
  },
  {
    path: '/blog',
    beforeEnter(to, from, next) {
      // redirect to blog.outbreak.info to account for nginx config change.
      if (Object.keys(to.query).length) {
        window.location.replace(
          `https://blog.outbreak.info${to.fullPath.replace('/blog', '')}`,
        );
      } else {
        window.location.replace('https://blog.outbreak.info');
      }
    },
  },
  {
    path: '/blog/:id',
    beforeEnter(to, from, next) {
      console.log(to);
      // redirect to blog.outbreak.info to account for nginx config change.
      window.location.replace(`https://blog.outbreak.info/${to.params.id}`);
    },
  },
  {
    path: '/author/:name',
    beforeEnter(to, from, next) {
      console.log(to);
      // redirect to blog.outbreak.info to account for nginx config change.
      window.location.replace(
        `https://blog.outbreak.info/author/${to.params.name}`,
      );
    },
  },
  {
    path: '/situation-report-demo',
    redirect: '/situation-reports',
  },
  {
    path: '/location-reports',
    name: 'LocationReports',
    component: () => import('../views/LocationReports.vue'),
    // Route to with query params https://stackoverflow.com/questions/50247097/child-route-component-not-rendering-in-vue-js
    beforeEnter(to, from, next) {
      if (to.query && to.query.loc) {
        // redirect to route below
        next({
          name: 'LocationReport',
          query: to.query,
        });
      } else next();
    },
  },
  {
    path: '/location-reports',
    name: 'LocationReport',
    props: (route) => ({
      alias: route.query.alias,
      loc: route.query.loc,
      muts: route.query.muts,
      pango: route.query.pango,
      variant: route.query.variant,
      selected: route.query.selected,
      dark: route.query.dark,
      xmax: route.query.xmax,
      xmin: route.query.xmin,
    }),
    component: () => import('../views/LocationReport.vue'),
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('../views/PageNotFound.vue'),
  },
];
