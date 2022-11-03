<template>
  <div class="my-5 mx-4">
    <div
      class="d-flex justify-content-center align-items-top"
      id="resource-overview"
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
        id="resource-counts"
        class="d-flex ml-3 flex-column align-items-center"
        v-if="counts.total"
      >
        <h3 class="text-left text-highlight">{{ counts.total }} resources</h3>
        <small
          class="text-muted badge bg-grey__lightest mb-4"
          v-if="counts.dateModified"
        >
          <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
          Updated {{ counts.dateModified }}
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
                    class="input-group-text bg-grey text-muted border-0"
                    id="sb"
                  >
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </span>
                </div>
                <input
                  id="sBar"
                  class="form-control border"
                  placeholder="Search"
                  aria-label="search"
                  aria-describedby="sb"
                  type="text"
                  v-model="searchInput"
                />
              </div>
            </form>
            <div class="d-flex mt-1">
              <span class="mr-2">Try:</span>
              <span
                class="mr-3 d-flex align-items-center"
                v-for="(demo, idx) in demos"
                :key="idx"
              >
                <router-link
                  :to="{ name: 'Resources', query: { q: demo.query } }"
                >
                  {{ demo.label }}
                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </span>
              <router-link :to="{ name: 'NIAID' }">
                NIAID-related
                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
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

<script>
import { getSourceSummary } from '@/api/resources.js';

import WhatsNew from '@/components/WhatsNew.vue';
import CirclePacking from '@/components/CirclePacking.vue';

// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faAngleDoubleRight,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

library.add(faClock, faAngleDoubleRight, faSearch);

export default {
  name: 'ResourceSummary',
  components: {
    WhatsNew,
    CirclePacking,
    FontAwesomeIcon,
  },
  data() {
    return {
      demos: [
        {
          label: 'remdesivir',
          query: 'remdesivir',
        },
        {
          label: 'antibodies',
          query: 'antibodies',
        },
        {
          label: 'x-ray diffraction',
          query: '"x-ray diffraction"',
        },
      ],
      counts: [],
      searchInput: null,
    };
  },
  methods: {
    onEnter() {
      this.$router.push({
        name: 'Resources',
        query: {
          q: this.searchInput,
        },
      });
    },
  },
  mounted() {
    this.countSubscription = getSourceSummary(
      this.$resourceurl,
      '__all__',
    ).subscribe((results) => {
      // console.log(results)
      this.counts = results;
    });
  },
  beforeDestroy() {
    this.countSubscription.unsubscribe();
  },
};
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
