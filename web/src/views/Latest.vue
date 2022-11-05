<template>
  <div>
    <div class="row m-0">
      <div
        class="col-sm-12 bg-light d-flex justify-content-center align-items-center my-5"
        style="min-height: 70vh;"
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
                    class="text-muted badge bg-grey__lightest mt-1"
                    v-if="lastUpdated && lastUpdated['genomics']"
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
                    class="text-muted badge bg-grey__lightest mt-1"
                    v-if="lastUpdated && lastUpdated['resources']"
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
                    class="text-muted badge bg-grey__lightest mt-1"
                    v-if="lastUpdated && lastUpdated['epi']"
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
              class="d-flex mb-4"
              v-for="(update, idx) in updates"
              :key="idx"
            >
              <span class="update-linker"></span>
              <span class="update-date pl-3">
                {{ formatDate(update.date) }}
              </span>
              <div class="d-flex flex-column text-left">
                <h5 class="m-0 mb-1">
                  <span class="update-type mr-2">{{ update.category }}</span>
                  {{ update.title }}
                </h5>
                <div>
                  <span v-html="update.description" class="text-muted"></span>
                  <router-link
                    class="ml-2"
                    :to="update.route"
                    v-if="update.route"
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

<script>
import Vue from 'vue';

import { mapState } from 'vuex';

import { timeFormat } from 'd3';

// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faClock } from '@fortawesome/free-regular-svg-icons';

library.add(faClock);

import { getSourcesUpdated } from '@/api/metadata.js';

export default Vue.extend({
  name: 'Latest',
  computed: {
    ...mapState('admin', ['updates']),
  },
  components: {
    FontAwesomeIcon,
  },
  methods: {
    formatDate: function(date) {
      const dateFormatter = timeFormat('%d %B %Y');
      return dateFormatter(date);
    },
  },
  data() {
    return {
      updateSubscription: null,
      lastUpdated: null,
    };
  },
  mounted() {
    this.updateSubscription = getSourcesUpdated(
      this.$genomicsurl,
      this.$resourceurl,
      this.$apiurl,
    ).subscribe((results) => {
      this.lastUpdated = results;
    });

    this.updates.sort((a, b) => b.date - a.date);
  },
  destroyed() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  },
});
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
