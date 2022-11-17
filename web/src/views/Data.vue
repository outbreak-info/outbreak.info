<template>
  <div class="data flex-column align-left">
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>
    <section class="case-data-table p-1">
      <EpiTable
        :routable="true"
        :colorScale="regionColorScale"
        colorVar="wb_region"
      />
      <DataSource />
    </section>
  </div>
</template>
<script>
import { mapState } from 'vuex';

import { getEpiTable } from '@/api/epi-traces.js';
import { lazyLoad } from '@/js/lazy-load';
import store from '@/store';

export default {
  name: 'Home',
  components: {
    DataSource: lazyLoad('DataSource'),
    EpiTable: lazyLoad('EpiTable'),
  },
  data() {
    return {
      stackedWidth: 500,
      stackedHeight: 250,
      data: null,
      dataSubscription: null,
      tableSubscription: null,
      nestedData: null,
      selectedVariable: 'confirmed',
      variableOptions: [
        {
          label: 'Cases',
          value: 'confirmed',
        },
        {
          label: 'Recoveries',
          value: 'recovered',
        },
        {
          label: 'Deaths',
          value: 'dead',
        },
      ],
      searchQuery: '',
    };
  },
  computed: {
    ...mapState('admin', ['loading']),
  },
  watch: {},
  mounted() {
    this.tableSubscription = getEpiTable(
      this.$apiurl,
      null,
      [0, 1, 2],
      '-confirmed',
      10,
      0,
    ).subscribe((_) => null);
  },
  destroyed() {
    this.tableSubscription.unsubscribe();
  },
  methods: {
    regionColorScale(location) {
      const scale = store.getters['colors/getRegionColorFromLocation'];
      return scale(location);
    },
  },
};
</script>

<style lang="scss" scoped></style>
