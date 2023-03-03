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
<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { getEpiTable } from '@/api/epi-traces.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { colorsStore } from '@/stores/colorsStore';

const DataSource = lazyLoad('DataSource');
const EpiTable = lazyLoad('EpiTable');

const apiUrl = inject('apiUrl');

const stackedWidth = ref(500);
const stackedHeight = ref(250);
const data = ref(null);
const dataSubscription = ref(null);
const tableSubscription = ref(null);
const nestedData = ref(null);
const selectedVariable = ref('confirmed');
const variableOptions = ref([
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
]);
const searchQuery = ref('');

const storeAdmin = adminStore();
const storeColor = colorsStore();

const { loading } = storeToRefs(storeAdmin);

onMounted(() => {
  tableSubscription.value = getEpiTable(
    apiUrl,
    null,
    [0, 1, 2],
    '-confirmed',
    10,
    0,
  ).subscribe((_) => null);
});

onUnmounted(() => {
  tableSubscription.value.unsubscribe();
});

const regionColorScale = (location) => {
  return storeColor.getRegionColorFromLocation(location);
};
</script>

<style lang="scss" scoped></style>
