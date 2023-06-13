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
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const DataSource = lazyLoad('DataSource');
const EpiTable = lazyLoad('EpiTable');

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

const data = ref(null);
const dataSubscription = ref(null);
const tableSubscription = ref(null);

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

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});

onUnmounted(() => {
  tableSubscription.value.unsubscribe();
});

const regionColorScale = (location) => {
  return storeColor.getRegionColorFromLocation(location);
};
</script>

<style lang="scss" scoped></style>
