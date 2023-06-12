<template>
  <div>
    <div class="row m-0">
      <div
        class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5"
        style="min-height: 70vh"
      >
        <div class="container half-page">
          <h1>Latest changes</h1>
          <div class="mb-4 border-top border-bottom py-2">
            <p class="mb-1">
              A summary of the major additions and data changes to
              outbreak.info. Individual changes are tracked on
              <a href="https://github.com/outbreak-info" target="_blank">
                GitHub
              </a>
              .
            </p>
            <div
              class="d-flex align-items-center justify-content-center flex-wrap"
            >
              Data is updated approximately daily. Last updated:
              <div class="d-flex ml-1">
                <div id="genomics-updated" class="mr-3">
                  <router-link :to="{ name: 'SituationReports' }" class="">
                    Variants
                  </router-link>
                  <small
                    v-if="lastUpdated && lastUpdated['genomics']"
                    class="text-muted badge bg-grey__lightest mt-1"
                  >
                    <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
                    {{ lastUpdated['genomics'] }} ago
                  </small>
                </div>

                <div id="resources-updated" class="mr-3">
                  <router-link :to="{ name: 'Resource Summary' }" class="">
                    Research Library
                  </router-link>
                  <small
                    v-if="lastUpdated && lastUpdated['resources']"
                    class="text-muted badge bg-grey__lightest mt-1"
                  >
                    <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
                    {{ lastUpdated['resources'] }} ago
                  </small>
                </div>

                <div id="epi-updated" class="mr-3">
                  <router-link :to="{ name: 'Epidemiology' }" class="">
                    Cases & Deaths
                  </router-link>
                  <small
                    v-if="lastUpdated && lastUpdated['epi']"
                    class="text-muted badge bg-grey__lightest mt-1"
                  >
                    <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
                    {{ lastUpdated['epi'] }} ago
                  </small>
                </div>
              </div>
            </div>
          </div>

          <div class="update-container">
            <div
              v-for="(update, idx) in updatesData"
              :key="idx"
              class="d-flex mb-4"
            >
              <span class="update-linker" />
              <span class="update-date pl-3">
                {{ formatDate(update.date) }}
              </span>
              <div class="d-flex flex-column text-left">
                <h5 class="m-0 mb-1">
                  <span class="update-type mr-2">{{ update.category }}</span>
                  {{ update.title }}
                </h5>
                <div>
                  <span class="text-muted" v-html="update.description" />
                  <router-link
                    v-if="update.route"
                    class="ml-2"
                    :to="update.route"
                  >
                    Example
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, inject, onUnmounted } from 'vue';
import { timeFormat } from 'd3-time-format';

import { getSourcesUpdated } from '@/api/metadata.js';
import { adminStore } from '@/stores/adminStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const store = adminStore();

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');
// global variable - equivalent with this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');
// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const updateSubscription = ref(null);
const lastUpdated = ref(null);
const updatesData = ref(null);

onMounted(() => {
  updateSubscription.value = getSourcesUpdated(
    genomicsUrl,
    resourceUrl,
    apiUrl,
  ).subscribe((results) => {
    lastUpdated.value = results;
  });
  updatesData.value = store.$state.updates;

  updatesData.value.sort((a, b) => b.date - a.date);

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});

onUnmounted(() => {
  if (updateSubscription.value) {
    updateSubscription.value.unsubscribe();
  }
});

const formatDate = (date) => {
  const dateFormatter = timeFormat('%d %B %Y');
  return dateFormatter(date);
};
</script>

<style lang="scss" scoped>
$circle-width: 8px;
.update-type {
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.5;
  color: $secondary-color;
}

.update-container {
  border-left: 1px solid $grey-40;
}

.update-date {
  opacity: 0.6;
  min-width: 200px;
  position: relative;
}

// .update-date:before {
//     background: $grey-40;
//     content: "";
//     left: 0;
//     height: 1px;
//     position: absolute;
//     top: 0.75em;
//     transform: translateY(-50%);
//     width: 32px;
//     z-index: 1;
// }

.update-linker {
  position: relative;
}

.update-linker:before {
  background: $grey-40;
  content: '';
  left: 0;
  height: 1px;
  position: absolute;
  top: 0.75em;
  transform: translateY(-50%);
  width: 20px;
  z-index: 1;
}

.update-linker:after {
  content: '';
  display: inline-block;
  width: $circle-width;
  height: $circle-width;
  -moz-border-radius: 7.5px;
  -webkit-border-radius: 7.5px;
  border-radius: 7.5px;
  background: $grey-40;
  position: absolute;
  top: 0.75em;
  transform: translate(22px, -50%);
}
</style>
