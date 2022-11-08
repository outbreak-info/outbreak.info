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
// @ is an alias to /src
import DataSource from '@/components/DataSource.vue';
import EpiTable from '@/components/EpiTable.vue';

import { getEpiTable } from '@/api/epi-traces.js';

import { mapState } from 'vuex';

import store from '@/store';

// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

library.add(faSpinner);

export default {
  name: 'Home',
  components: {
    DataSource,
    EpiTable,
    FontAwesomeIcon,
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
  watch: {},
  computed: {
    ...mapState('admin', ['loading']),
  },
  methods: {
    regionColorScale: function(location) {
      const scale = store.getters['colors/getRegionColorFromLocation'];
      return scale(location);
    },
  },
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
};
</script>

<style lang="scss" scoped></style>
