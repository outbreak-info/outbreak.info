<template>
  <div class="my-5 mx-4">
    <div
      id="resource-overview"
      class="d-flex justify-content-center align-items-top"
    >
      <div class="ml-3 text-left">
        <h2 class="">Finding research is hard</h2>
        <p>
          During the COVID-19 epidemic, researchers from around the world have
          not only been working around the clock to better understand the
          disease and the virus that causes it, but they are also sharing this
          knowledge at an unprecedented speed. This openness allows research to
          happen much more quickly.
        </p>
        <p>
          However, it can be challenging for researchers and the public to keep
          up-to-date on this large and constantly changing set of knowledge.
        </p>
        <p>
          We're developing a searchable index of datasets, publications, and
          clinical trials that tries to make sense of all this information. By
          standardizing the information that describes these resources,
          outbreak.info makes COVID-19 information more discoverable.
          <router-link :to="{ path: 'sources', hash: '#resources' }">
            Learn about our data sources
          </router-link>
        </p>
      </div>

      <div
        v-if="counts.total"
        id="resource-counts"
        class="d-flex ml-3 flex-column align-items-center"
      >
        <h3 class="text-left text-highlight">{{ counts.total }} resources</h3>
        <small
          v-if="counts.dateModified"
          class="text-muted badge bg-grey__lightest mb-4"
        >
          <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
          Updated
          {{ counts.dateModified }}
        </small>

        <CirclePacking class="circle-packing mr-5" :data="counts.sources" />
      </div>
    </div>

    <div class="d-flex">
      <div class="w-100 mx-5 d-flex flex-column justify-content-between">
        <!-- search bar -->
        <div class="col-md-12 col-lg-8">
          <div class="pb-4">
            <form autocomplete="off" class="m-auto" @submit.prevent="onEnter">
              <div class="input-group">
                <div class="input-group-prepend">
                  <span
                    id="sb"
                    class="input-group-text bg-grey text-muted border-0"
                  >
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </span>
                </div>
                <input
                  id="sBar"
                  v-model="searchInput"
                  class="form-control border"
                  placeholder="Search"
                  aria-label="search"
                  aria-describedby="sb"
                  type="text"
                />
              </div>
            </form>
            <div class="d-flex mt-1">
              <span class="mr-2">Try:</span>
              <span
                v-for="(demo, idx) in demos"
                :key="idx"
                class="mr-3 d-flex align-items-center"
              >
                <router-link
                  :to="{ name: demo.route, query: { q: demo.query } }"
                >
                  {{ demo.label }}
                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>
            </div>
          </div>

          <router-link
            :to="{ name: 'Resources' }"
            class="btn btn-main-outline router-link no-underline mt-2 mb-5"
          >
            View entire library
          </router-link>
        </div>
      </div>
    </div>

    <WhatsNew />
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

import { getSourceSummary } from '@/api/resources.js';
import RESOURCEEXAMPLES from '@/assets/examples/resources_examples.json';
import { lazyLoad } from '@/js/lazy-load';
import { useMetadataStore } from '@/stores/metadataStore'
import { useSeoMeta } from 'unhead';

const WhatsNew = lazyLoad('WhatsNew');
const CirclePacking = lazyLoad('CirclePacking');

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

// instead of this.$router
const router = useRouter();

const demos = ref([]);
const counts = ref([]);
const searchInput = ref(null);
const countSubscription = ref(null);

onMounted(() => {
  demos.value = RESOURCEEXAMPLES;

  countSubscription.value = getSourceSummary(resourceUrl, '__all__').subscribe(
    (results) => {
      // console.log(results)
      counts.value = results;
    },
  );

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.resourceSummaryMetadata;
  useSeoMeta(metadata);
});

const onEnter = () => {
  router.push({
    name: 'Resources',
    query: {
      q: searchInput.value,
    },
  });
};

onBeforeUnmount(() => {
  if (countSubscription.value) {
    countSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss" scoped>
.circle-packing {
  margin-top: -50px;
  margin-bottom: -50px;
}

.sources {
  background: white;
}

#source-counts div {
  line-height: 0.9em;
}

.source-name {
  width: 135px;
}

.opacity-40 {
  opacity: 0.4;
}
</style>
