<template>
  <div class="home flex-column align-left">
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <!-- EPI CURVE SUMMARIES -->
    <section id="regional-epi-curves" class="mt-5">
      <div class="row d-flex justify-content-center">
        <GlanceSummary
          v-for="(location, idx) in glanceSummaries"
          :key="idx"
          class="d-flex mx-2 mb-3"
          :data="location"
          :idx="location.location_id"
          :deletable="false"
        />
      </div>

      <DataSource />
    </section>

    <Logos />
  </div>
</template>

<script setup>
import { ref, inject, watch, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';

import { getGlanceSummary } from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

const GlanceSummary = lazyLoad('GlanceSummary');
const Logos = lazyLoad('Logos');
const DataSource = lazyLoad('DataSource');

const props = defineProps({
  location: String,
});

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');
// global variable - equivalent with this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');

const glanceSummaries = ref([]);
const glanceLocations = ref(null);
const dataSubscription = ref(null);

const store = adminStore();
const { loading } = storeToRefs(store);

const sortSummaries = (data) => {
  if (glanceLocations.value && glanceLocations.value.length > 0) {
    data.sort(
      (a, b) =>
        glanceLocations.value.indexOf(a.location_id) -
        glanceLocations.value.indexOf(b.location_id),
    );
  }
  return data;
};

const getData = () => {
  dataSubscription.value = getGlanceSummary(
    apiUrl,
    genomicsUrl,
    glanceLocations.value,
  ).subscribe((d) => {
    glanceSummaries.value = sortSummaries(d);
  });
};

watch(
  () => props.location,
  (newValue, oldValue) => {
    glanceLocations.value = newValue ? newValue.split(';') : [];
    getData();
  },
  { immediate: true },
);

onMounted(() => {
  getData();
});

onUnmounted(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss" scoped></style>
