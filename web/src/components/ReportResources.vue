<template>
  <div class="border-top border-bottom pt-3 pb-2">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4>{{ mutationName }} Publications &amp; Resources</h4>
      <div class="ml-3 text-highlight font-size-2">
        {{ totalFormatted }} results
      </div>

      <select
        v-model="numPerPage"
        @change="changePageNum()"
        class="select-dropdown ml-5"
        v-if="total"
      >
        <option v-for="option in pageOpts" :value="option" :key="option">
          {{ option }} results
        </option>
      </select>
    </div>

    <!-- RESULTS -->
    <div id="resources">
      <div
        v-for="(item, rIdx) in resources"
        :key="rIdx"
        class="line-height-1 mb-3 d-flex"
      >
        <span
          class="resource-type mr-2"
          :class="item['@type'].replace(/\s/g, '')"
          v-if="item['@type']"
        >
          {{ item['@type'] }}
        </span>
        <div>
          <router-link
            :to="{ name: 'Resource Page', params: { id: item._id } }"
            class=""
          >
            <span v-html="item.name"></span>
          </router-link>
          <b class="ml-1" id="author" v-if="item.author && item.author.length">
            {{
              item.author[0].name
                ? item.author[0].name
                : `${item.author[0].givenName} ${item.author[0].familyName}`
            }}
            <span v-if="item.author.length > 1">et al.</span>
          </b>
          <em class="ml-1 text-underline" v-if="item.journalName">
            {{ item.journalName }}
          </em>
          <span class="ml-1">{{ item.dateFormatted }}</span>
        </div>
      </div>
    </div>
    <!-- PAGINATION -->
    <div
      class="pagination mt-2 d-flex align-items-center justify-content-between w-50 m-auto"
      v-if="total"
    >
      <button
        aria-label="previous-button"
        class="pagination-btn pagination-left"
        :class="{ disabled: selectedPage === 0 }"
        @click="changePage(-1)"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
      <small>
        viewing results {{ (lowerLim + 1).toLocaleString() }} &minus;
        {{ upperLim.toLocaleString() }} of {{ totalFormatted }}
      </small>
      <button
        aria-label="next-button"
        class="pagination-btn pagination-left"
        :class="{ disabled: selectedPage === lastPage }"
        @click="changePage(1)"
      >
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </button>
      <router-link :to="{ name: 'Resources', query: { q: queryString } }">
        <button class="btn btn-main-outline p-1 px-2">
          <small>view all</small>
        </button>
      </router-link>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import { getLineageResources } from '@/api/genomics.js';

// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowLeft,
  faArrowRight,
  faSpinner,
  faSearch,
  faInfoCircle,
  faChevronUp,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

library.add(
  faArrowLeft,
  faArrowRight,
  faSpinner,
  faSearch,
  faInfoCircle,
  faChevronUp,
  faChevronDown,
);

export default Vue.extend({
  name: 'ReportResources',
  props: {
    mutationName: String,
    searchTerms: Array,
  },
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      total: null,
      totalFormatted: null,
      selectedPage: 0,
      numPerPage: 10,
      resources: null,
      resultSubscription: null,
      pageOpts: [10, 50, 100],
    };
  },
  watch: {
    queryString: {
      immediate: true,
      handler(newVal, oldVal) {
        this.updateResults();
      },
    },
  },

  computed: {
    lowerLim() {
      return this.selectedPage * this.numPerPage;
    },
    upperLim() {
      const upper = this.selectedPage * this.numPerPage + this.numPerPage;
      return upper > this.total ? this.total : upper;
    },
    lastPage() {
      return this.total ? Math.floor(this.total / this.numPerPage) : null;
    },
    queryString() {
      return `"${this.searchTerms.join('" OR "')}"`;
    },
  },
  methods: {
    changePage(step) {
      this.selectedPage += step;
      this.updateResults();
    },
    changePageNum() {
      this.selectedPage = 0;
      this.updateResults();
    },
    updateResults() {
      if (this.searchTerms.length) {
        this.resultSubscription = getLineageResources(
          this.$resourceurl,
          this.queryString,
          this.numPerPage,
          this.selectedPage * this.numPerPage,
        ).subscribe((results) => {
          this.total = results.total;
          this.totalFormatted = results.totalFormatted;
          this.resources = results.resources;
        });
      }
    },
  },
  beforeDestroy() {
    if (this.resultSubscription) {
      this.resultSubscription.unsubscribe();
    }
  },
});
</script>
<style lang="scss"></style>
