<template>
  <div class="row m-0 w-100 text-left">
    <div
      class="col-sm-12 text-highlight d-flex justify-content-between align-items-center mb-2"
    >
      <h5 class="text-uppercase">What's new</h5>
    </div>

    <div
      v-if="newPubs"
      class="col-sm-6 col-md-3 col-sm-6 pr-4 d-flex flex-column"
    >
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:Publication' },
        }"
        class="no-underline Publication"
      >
        <h6>Publications</h6>
      </router-link>
      <NewList :data="newPubs" />
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:Publication' },
        }"
        class="btn btn-main-outline router-link no-underline m-3 align-self-center"
      >
        View all publications
      </router-link>
    </div>

    <div
      v-if="newTrials"
      class="col-sm-6 col-md-3 col-sm-6 pr-4 d-flex flex-column"
    >
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:ClinicalTrial' },
        }"
        class="no-underline ClinicalTrial"
      >
        <h6>Clinical Trials</h6>
      </router-link>
      <NewList :data="newTrials" />
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:ClinicalTrial' },
        }"
        class="btn btn-main-outline router-link no-underline m-3 align-self-center"
      >
        View all clinical trials
      </router-link>
    </div>

    <div class="col-sm-6 col-md-3 pr-4 d-flex flex-column" v-if="newDatasets">
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:Dataset' },
        }"
        class="no-underline Dataset"
      >
        <h6>Datasets</h6>
      </router-link>
      <NewList :data="newDatasets" />
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:Dataset' },
        }"
        class="btn btn-main-outline router-link no-underline m-3 align-self-center"
      >
        View all datasets
      </router-link>
    </div>

    <div class="col-sm-6 col-md-3 pr-4 d-flex flex-column" v-if="newProtocols">
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:Protocol' },
        }"
        class="no-underline Protocol"
      >
        <h6>Protocols</h6>
      </router-link>
      <NewList :data="newProtocols" />
      <router-link
        :to="{
          name: 'Resources',
          query: { q: query, sort: '-date', filter: '@type:Protocol' },
        }"
        class="btn btn-main-outline router-link no-underline m-3 align-self-center"
      >
        View all protocols
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { getMostRecentGroup } from '@/api/resources.js';
import { lazyLoad } from '@/js/lazy-load';

const NewList = lazyLoad('NewList');

const props = defineProps({
  query: String,
  numResults: {
    type: Number,
    default: 5,
  },
});

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const newPubs = ref([]);
const newDatasets = ref([]);
const newTrials = ref([]);
const newProtocols = ref([]);
const recentSubscription = ref(null);

onMounted(() => {
  recentSubscription.value = getMostRecentGroup(
    resourceUrl,
    props.query,
    '-date',
    props.numResults,
  ).subscribe((results) => {
    newPubs.value = results['Publication'];
    newDatasets.value = results['Dataset'];
    newTrials.value = results['ClinicalTrial'];
    newProtocols.value = results['Protocol'];
  });
});

onBeforeUnmount(() => {
  if (recentSubscription.value) {
    recentSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss" scoped></style>
