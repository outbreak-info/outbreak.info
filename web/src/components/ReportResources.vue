<template>
  <div class="border-top border-bottom pt-3 pb-2">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4>{{ mutationName }} Publications &amp; Resources</h4>
      <div class="ml-3 text-highlight font-size-2">
        {{ totalFormatted }} results
      </div>

      <select
        v-if="total"
        v-model="numPerPage"
        class="select-dropdown ml-5"
        @change="changePageNum()"
      >
        <option v-for="option in pageOpts" :key="option" :value="option">
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
          v-if="item['@type']"
          class="resource-type mr-2"
          :class="item['@type'].replace(/\s/g, '')"
        >
          {{ item['@type'] }}
        </span>
        <div>
          <router-link
            :to="{ name: 'Resource Page', params: { id: item._id } }"
            class=""
          >
            <span v-html="item.name" />
          </router-link>
          <b v-if="item.author && item.author.length" id="author" class="ml-1">
            {{
              item.author[0].name
                ? item.author[0].name
                : `${item.author[0].givenName} ${item.author[0].familyName}`
            }}
            <span v-if="item.author.length > 1">et al.</span>
          </b>
          <em v-if="item.journalName" class="ml-1 text-underline">
            {{ item.journalName }}
          </em>
          <span class="ml-1">{{ item.dateFormatted }}</span>
        </div>
      </div>
    </div>
    <!-- PAGINATION -->
    <div
      v-if="total"
      class="pagination mt-2 d-flex align-items-center justify-content-between w-50 m-auto"
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

<script setup>
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';
import { getLineageResources } from '@/api/genomics.js';

const props = defineProps({
  mutationName: String,
  searchTerms: Array,
});

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const total = ref(null);
const totalFormatted = ref(null);
const selectedPage = ref(null);
const numPerPage = ref(10);
const resources = ref(null);
const resultSubscription = ref(null);
const pageOpts = ref([10, 50, 100]);

// computed variables
const lowerLim = computed(() => {
  return selectedPage.value * numPerPage.value;
});

const upperLim = computed(() => {
  const upper = selectedPage.value * numPerPage.value + numPerPage.value;
  return upper > total.value ? total.value : upper;
});

const lastPage = computed(() => {
  return total.value ? Math.floor(total.value / numPerPage.value) : null;
});

const queryString = computed(() => {
  return `"${props.searchTerms.join('" OR "')}"`;
});

const updateResults = () => {
  if (props.searchTerms.length) {
    resultSubscription.value = getLineageResources(
      resourceUrl,
      queryString.value,
      numPerPage.value,
      selectedPage.value * numPerPage.value,
    ).subscribe((results) => {
      total.value = results.total;
      totalFormatted.value = results.totalFormatted;
      resources.value = results.resources;
    });
  }
};

const changePage = (step) => {
  selectedPage.value += step;
  updateResults();
};

const changePageNum = () => {
  selectedPage.value = 0;
  updateResults();
};

watch(
  () => queryString.value,
  () => {
    updateResults();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (resultSubscription.value) {
    resultSubscription.value.unsubscribe();
  }
});
</script>
<style lang="scss"></style>
