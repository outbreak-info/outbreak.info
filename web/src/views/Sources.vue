<template>
  <div>
    <!-- header -->
    <section
      class="d-flex flex-column justify-content-center align-items-center pt-3"
    >
      <a href="https://api.outbreak.info/" class="position-relative">
        <img src="@/assets/back-api.png" class="w-100" alt="outbreak-api" />
        <p
          class="pt-1 m-0 align-items-center position-absolute text-overlay d-none d-lg-inline"
        >
          Access all data in our API
        </p>
      </a>
    </section>

    <div class="row m-0">
      <div
        class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5"
      >
        <div class="container half-page">
          <div class="d-flex align-items-center justify-content-between mb-5">
            <h1>Data Sources</h1>
            <router-link class="btn btn-main" :to="{ name: 'Contributing' }">
              Contribute data
            </router-link>
          </div>

          <div class="text-left mt-5">
            <h3 id="geographic" class="pt-4 border-top">Genomic Data</h3>
            <SourceDescription
              v-if="sourceMetadata"
              :sources="genomicSources"
              :metadata="sourceMetadata.genomics"
            />
          </div>

          <div class="text-left">
            <h3 id="epidemiology" class="border-top pt-4">
              COVID-19 Cases &amp; Deaths Data
            </h3>
            <SourceDescription
              v-if="sourceMetadata"
              :sources="sources"
              :metadata="sourceMetadata.epi"
            />
          </div>

          <div class="text-left mt-5">
            <h3 id="geographic" class="pt-4 border-top">Geographic Data</h3>
            <SourceDescription :sources="geoSources" />
          </div>

          <div class="text-left mt-5">
            <div
              class="mb-3 pt-4 border-top d-flex justify-content-between align-items-center"
            >
              <h3 id="resources" class="">Resources</h3>
              <DownloadData
                downloadLabel="all resources"
                type="resources"
                query="__all__"
                :api="$resourceurl"
              />
            </div>

            <div
              v-for="(resource, idx) in resources"
              :key="idx"
              :class="[idx === 0 ? 'mb-5' : 'my-5']"
            >
              <div
                class="d-flex justify-content-between align-items-center my-2"
              >
                <h4 :id="resource.id">
                  {{ resource.category }}
                </h4>
                <DownloadData
                  :downloadLabel="`all ${resource.category}`"
                  type="resources"
                  :query="`@type:${resource.id}`"
                  :api="$resourceurl"
                />
              </div>

              <SourceDescription
                v-if="sourceMetadata"
                :sources="resource.sources"
                :metadata="sourceMetadata.resources"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted, inject } from 'vue';
import { storeToRefs } from 'pinia';

import { getIndivSourcesUpdated } from '@/api/metadata.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const SourceDescription = lazyLoad('SourceDescription');
const DownloadData = lazyLoad('DownloadData');

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');
// global variable - equivalent with this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');
// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const metadataSubscription = ref(null);
const sourceMetadata = ref(null);

const store = adminStore();

const { sources, geoSources, genomicSources, resources } = storeToRefs(store);

onMounted(() => {
  metadataSubscription.value = getIndivSourcesUpdated(
    genomicsUrl,
    resourceUrl,
    apiUrl,
  ).subscribe((results) => {
    sourceMetadata.value = results;
  });

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});

onUnmounted(() => {
  if (metadataSubscription.value) {
    metadataSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss" scoped>
.text-overlay {
  bottom: 10px;
  right: 10px;
  color: white;
  font-size: 1.25em;
}
</style>
