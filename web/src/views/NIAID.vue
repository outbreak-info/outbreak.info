<template>
  <div class="my-5 mx-4">
    <!-- loading -->
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <h1>NIAID-related resources</h1>
    <p class="text-muted mb-0">
      Find NIAID-related resources, including sources with authors or funding
      from the National Institute of Allergy and Infectious Diseases
    </p>
    <p class="text-muted font-italic m-0">
      <small>
        Note: only resources which explicitly specify the affiliation of authors
        or funding sources will be listed.
      </small>
    </p>
    <router-link
      :to="{ name: 'Resources', query: { q: queryString } }"
      class="btn btn-main-outline router-link no-underline mt-5 mb-3 align-self-center"
    >
      View all results
    </router-link>

    <div class="d-flex justify-content-between align-items-center flex-wrap">
      <div class="d-flex flex-column align-items-center">
        <h3 v-if="counts" class="text-highlight m-0">
          {{ counts.total }} resources
        </h3>
        <small
          v-if="counts && counts.dateModified"
          class="text-muted badge bg-grey__lightest"
        >
          <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
          Updated
          {{ counts.dateModified }}
        </small>

        <CirclePacking
          v-if="counts"
          class="circle-packing"
          :data="counts.sources"
          :query="queryString"
        />
      </div>
      <HorizontalBargraph v-if="authors" :data="authors" title="Top authors" />
      <HorizontalBargraph
        v-if="affiliations"
        :data="affiliations"
        title="Author affiliations"
      />
      <div class="d-flex flex-column">
        <ResourceTimeline v-if="dates" :data="dates" />
      </div>
    </div>
    <WhatsNew :query="queryString" />
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { nest } from 'd3-collection';

import { getQuerySummaries, getSourceSummary } from '@/api/resources.js';
import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';
import { adminStore } from '@/stores/adminStore';

const WhatsNew = lazyLoad('WhatsNew');
const CirclePacking = lazyLoad('CirclePacking');
const HorizontalBargraph = lazyLoad('HorizontalBargraph');
const ResourceTimeline = lazyLoad('ResourceTimeline');

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const resultSubscription = ref(null);
const countSubscription = ref(null);
const counts = ref(null);
const results = ref(null);
const dates = ref(null);
const authors = ref(null);
const affiliations = ref(null);
const query = ref([
  {
    terms: ['NIAID', 'National Institute of Allergy and Infectious Diseases'],
    // 'sponsor.name:"national institute of allergy and infectious diseases (niaid)"']
    // funding: "Division of Intramural Research, National Institute of Allergy and Infectious Diseases (Division of Intramural Research of the NIAID)", "National Institute of Allergy and Infectious Disease of the National Institutes of Health", "U.S. Department of Health &amp; Human Services | NIH | National Institute of Allergy and Infectious Diseases (NIAID)"
    // "funding.funder.name:NIAID NIH HHS,National Institutes of Health/National Institute Of Allergy and Infectious Diseases (NIH/NIAID)"]
  },
]);

const store = adminStore();
const { loading } = storeToRefs(store);

const queryString = computed(() => {
  return query.value.map((d) => `"${d.terms.join('" "')}"`)[0];
});

onMounted(() => {
  resultSubscription.value = getQuerySummaries(
    query.value,
    resourceUrl,
  ).subscribe((resultsRes) => {
    results.value = resultsRes;
    dates.value = resultsRes[0].facets.date.terms;

    authors.value = nest()
      .key((d) => (d ? d : 'unknown'))
      .rollup((values) => values.length)
      .entries(
        resultsRes[0]['hits']
          .flatMap((d) => d.author)
          .flatMap((d) =>
            d.name
              ? d.name
              : d.givenName
              ? `${d.givenName} ${d.familyName}`
              : 'unknown',
          ),
      )
      .sort((a, b) => b.value - a.value);

    affiliations.value = nest()
      .key((d) => (d ? d : 'unknown'))
      .rollup((values) => values.length)
      .entries(
        resultsRes[0]['hits']
          .flatMap((d) => d.author)
          .flatMap((d) => (d.affiliation ? d.affiliation : 'unknown'))
          .flatMap((d) => d.name),
      )
      .sort((a, b) => b.value - a.value);
  });

  countSubscription.value = getSourceSummary(
    resourceUrl,
    queryString.value,
  ).subscribe((resultsRes) => {
    counts.value = resultsRes;
  });
});

onBeforeUnmount(() => {
  if (resultSubscription.value) {
    resultSubscription.value.unsubscribe();
  }
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
</style>
