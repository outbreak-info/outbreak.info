<template>
  <div class="">
    <!-- loading -->
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <!-- header -->
    <section
      class="d-flex justify-content-center align-items-center bg-main__darker text-light py-3"
    >
      <div class="row m-0 d-flex align-items-center w-100">
        <div class="col-sm-8 col-md-8">
          <h1>COVID-19 and SARS-CoV-2 datasets, analyses, and resources</h1>
          <router-link
            :to="{ path: '/sources', hash: '#resources' }"
            class="text-white"
          >
            Where do we get our data?
          </router-link>
          <span class="text-muted mx-3">&bull;</span>
          <router-link :to="{ name: 'Contributing' }" class="text-white">
            Contributing a source
          </router-link>
        </div>
        <!-- search input -->
        <div class="col-sm-4 col-md-4">
          <div class="py-3">
            <form autocomplete="off" class="m-auto">
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
                  @keydown.enter.prevent="debounceSearchText"
                />
              </div>
            </form>

            <div v-if="showSearchHelper" class="text-left text-muted ml-5">
              <small>
                <font-awesome-icon
                  class="mr-2"
                  :icon="['fas', 'info-circle']"
                />
                Wrap terms in quotes if you want to search for an exact phrase,
                like
                <router-link
                  class="inline-block"
                  :to="{
                    name: 'Resources',
                    query: { q: quotedSearch },
                  }"
                >
                  "{{ searchInput }}"
                </router-link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- mini-nav for resource types -->
    <section class="d-flex justify-content-end py-2 bg-sec" />

    <!-- RESULTS -->
    <section class="d-flex justify-content-end py-2">
      <div class="row m-0">
        <!-- FILTERS -->
        <div class="col-sm-4 col-md-3 col-xl-2">
          <div class="bg-white ml-1 mt-2 border-right">
            <div
              class="filter-bottom pb-4 px-2 mt-0 mb-3 d-flex flex-column align-items-center"
            >
              <!-- Toggle Header -->
              <div
                class="row m-0 pointer w-100"
                @click="dateFacet.expanded = !dateFacet.expanded"
              >
                <div class="col-sm-10 p-1">
                  <h6 class="p-0 m-0">Date</h6>
                </div>
                <div class="col-sm-2 text-center p-1">
                  <!-- toggle fa class up->down -->
                  <font-awesome-icon
                    v-if="!dateFacet.expanded"
                    class="text-muted"
                    :icon="['fas', 'chevron-up']"
                  />
                  <font-awesome-icon
                    v-else
                    class="text-muted"
                    :icon="['fas', 'chevron-down']"
                  />
                </div>
              </div>
              <DateHistogram
                v-if="dates && dates.length && !dateFacet.expanded"
                :data="dates"
              />
            </div>
            <div
              v-for="(facet, idx) in facetSummary"
              :key="idx"
              class="filter-bottom pb-4 px-2 mt-0 mb-3"
            >
              <!-- Toggle Header -->
              <div
                class="row m-0 pointer"
                @click="facet.expanded = !facet.expanded"
              >
                <div class="col-sm-10 p-1">
                  <h6 class="p-0 m-0">
                    {{ facet.variable }}
                  </h6>
                </div>
                <div
                  v-if="facet.filtered.length"
                  class="col-sm-2 text-center p-1"
                >
                  <!-- toggle fa class up->down -->
                  <font-awesome-icon
                    v-if="!facet.expanded"
                    class="text-muted"
                    :icon="['fas', 'chevron-up']"
                  />
                  <font-awesome-icon
                    v-else
                    class="text-muted"
                    :icon="['fas', 'chevron-down']"
                  />
                </div>
              </div>
              <!-- Toggle content -->
              <form v-if="facet.expanded">
                <!-- <Donut :data="facet.filtered" /> -->
                <div>
                  <!-- Filter search -->
                  <form
                    class="p-1"
                    @submit.prevent="selectFilterText(facet, idx)"
                    @input.prevent="debounceFilterText(facet, idx)"
                  >
                    <small>
                      <input
                        v-model="facetFilters[idx]"
                        type="text"
                        autocomplete="off"
                        class="border p-1 w-100 font-awesome"
                        :style="{ 'border-color': '#bababa !important' }"
                        :placeholder="`Search ${facet.variable}`"
                      />
                    </small>
                  </form>
                  <!-- Filters -->
                  <template v-if="facet.filtered.length">
                    <ul class="list-group list-unstyled rounded-0">
                      <div
                        v-for="(option, optIdx) in facet.filtered"
                        :key="optIdx"
                      >
                        <li
                          v-if="optIdx < facet.num2Display"
                          class="rounded-0 text-left list-group-item-action p-1 border-0 line-height-sm my-1 text-break"
                          :class="[option.count ? 'text-dark' : 'text-muted']"
                        >
                          <input
                            :id="facet.id + optIdx"
                            type="checkbox"
                            class="mr-1"
                            name="item"
                            :value="option.term"
                            :checked="option.checked"
                            @change="selectFilter(facet.id, option)"
                          />
                          <label :for="facet.id + optIdx" class="m-0 d-inline">
                            <small>
                              {{ option.term }}
                              <span v-if="option.count">
                                ({{ option.count.toLocaleString() }})
                              </span>
                            </small>
                          </label>
                        </li>
                      </div>
                    </ul>
                    <small
                      v-if="facet.num2Display < facet.total"
                      class="pointer link"
                      @click="facet.num2Display = facet.total"
                    >
                      show all
                    </small>
                  </template>
                  <div v-else class="">
                    <small>none</small>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div id="results" class="col-sm-8 col-md-9 col-xl-10">
          <!-- results header + sort options -->
          <div class="border-bottom py-2">
            <div
              id="selectors"
              class="row w-100 d-flex justify-content-between align-items-center"
            >
              <div class="d-flex flex-column">
                <div class="d-flex align-items-center">
                  <h4 v-if="q" class="m-0 mr-4">You searched for {{ q }}</h4>
                  <div class="m-0 text-highlight fa-lg">
                    {{ numResults.toLocaleString() }}
                    {{ numResults === 1 ? 'result' : 'results' }}
                  </div>
                </div>
              </div>

              <div class="d-flex">
                <DownloadData
                  downloadLabel="results"
                  type="resources"
                  :query="esQuery"
                  :api="$resourceurl"
                  class="mr-4"
                />

                <select
                  v-model="numPerPage"
                  class="select-dropdown mr-4"
                  @change="debounceChangePageNum"
                >
                  <option
                    v-for="option in pageOpts"
                    :key="option"
                    :value="option"
                  >
                    {{ option }} results
                  </option>
                </select>

                <select v-model="sortValue" @change="changeSort">
                  <option
                    v-for="(option, idx) in sortOpts"
                    :key="idx"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Selected filters -->
            <div
              v-if="
                (selectedFilters && selectedFilters.length) ||
                dateMin ||
                dateMax
              "
              id="selectedFilters"
              class="row d-flex flex-wrap px-1 mt-2"
            >
              <!-- checkbox filters -->
              <span
                v-for="(varType, tIdx) in selectedFilters"
                :key="tIdx"
                class="d-flex flex-wrap"
              >
                <span v-for="(variable, vIdx) in varType.vars" :key="vIdx">
                  <button
                    role="button"
                    class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1"
                    @click="removeFilter(variable, varType.id)"
                  >
                    <small>
                      <b>{{ variable }}</b>
                    </small>

                    <font-awesome-icon
                      class="ml-1"
                      :icon="['far', 'times-circle']"
                      :style="{ 'font-size': '0.85em', opacity: '0.6' }"
                    />
                  </button>
                </span>
              </span>
              <!-- Date filters -->
              <button
                v-if="dateMin"
                role="button"
                class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1"
                @click="removeDateFilter('min')"
              >
                <small>
                  <b>date &ge; {{ dateMin }}</b>
                </small>

                <font-awesome-icon
                  class="ml-1"
                  :icon="['far', 'times-circle']"
                  :style="{ 'font-size': '0.85em', opacity: '0.6' }"
                />
              </button>

              <button
                v-if="dateMax"
                role="button"
                class="btn chip btn-outline-secondary bg-white d-flex align-items-center py-1 px-2 line-height-1"
                @click="removeDateFilter('max')"
              >
                <small>
                  <b>date &le; {{ dateMax }}</b>
                </small>
                <font-awesome-icon
                  class="ml-1"
                  :icon="['far', 'times-circle']"
                  :style="{ 'font-size': '0.85em', opacity: '0.6' }"
                />
              </button>
              <!-- clear all -->
              <a href="" class="ml-2" @click="clearFilters()">
                <small>clear filters</small>
              </a>
            </div>

            <div
              v-if="dates && dates.length"
              class="d-flex flex-wrap align-items-start border-top py-2 mt-2"
            >
              <div class="d-flex flex-column pr-2 mr-2 mb-3">
                <small class="text-left">Date</small>
                <DateHistogram :data="dates" :filterable="false" />
              </div>

              <div
                v-for="(facet, idx) in facetSummary"
                :key="idx"
                :class="[
                  facet.total && pieVariables.includes(facet.variable)
                    ? 'd-flex flex-column mx-2 mb-3'
                    : 'hidden',
                ]"
              >
                <!-- Toggle content -->
                <small class="text-left">{{ facet.variable }}</small>
                <Donut :id="facet.variable" :data="facet.filtered" />
              </div>
            </div>
          </div>

          <!-- Results: loop -->
          <div id="results-container" class="my-3">
            <div
              v-for="(item, idx) in data"
              :key="idx"
              class="row w-100 d-flex flex-column text-left px-3 py-4 search-result"
            >
              <div class="d-flex w-100 resource-title">
                <div class="d-flex align-items-center">
                  <StripeAccent :className="item['@type']" />
                  <small :class="[item['@type'], 'resource-type', 'mr-3']">
                    {{ item['@type'] }}
                  </small>
                </div>

                <!-- name -->
                <router-link
                  :to="{ name: 'Resource Page', params: { id: item._id } }"
                >
                  <h5 class="m-0">
                    {{ item.name }}
                  </h5>
                </router-link>
              </div>

              <div class="row">
                <!-- LEFT -->

                <div
                  class="col-sm-12 col-md-6 col-lg-5 text-muted d-flex flex-column justify-content-between"
                >
                  <div class="">
                    <!-- authors -->
                    <div class="attribution text-body">
                      <small v-if="item.author && item.author.length">
                        {{
                          item.author[0].name
                            ? item.author[0].name
                            : item.author[0].givenName +
                              ' ' +
                              item.author[0].familyName
                        }}
                        <span v-if="item.author.length > 1">et al.</span>
                      </small>
                      <small v-else-if="item.creator">
                        {{
                          item.creator[0].name
                            ? item.creator[0].name
                            : item.creator[0].givenName +
                              ' ' +
                              item.creator[0].familyName
                        }}
                        <span v-if="item.creator.length > 1">et al.</span>
                      </small>
                    </div>
                    <!-- publication name -->
                    <div class="publication">
                      <small v-if="item.journalNameAbbrev">
                        {{ item.journalNameAbbrev }}
                      </small>
                      <small v-else-if="item.journalName">
                        {{ item.journalName }}
                      </small>
                    </div>
                    <!-- dates -->
                    <div class="dates">
                      <small
                        v-if="
                          item.dateModified ||
                          item.dateCreated ||
                          item.datePublished
                        "
                      >
                        <font-awesome-icon :icon="['far', 'clock']" />
                        <span v-if="item.dateModified">
                          updated {{ item.dateModified }}
                        </span>
                        <span v-if="item.dateModified && item.datePublished">
                          &bull;
                        </span>

                        <span v-if="item.datePublished">
                          published {{ item.datePublished }}
                        </span>
                        <span
                          v-if="
                            (item.dateModified && item.dateCreated) ||
                            (item.datePublished && item.dateCreated)
                          "
                        >
                          &bull;
                        </span>

                        <span v-if="item.dateCreated">
                          created {{ item.dateCreated }}
                        </span>
                      </small>
                    </div>
                    <!-- CLINCIAL-TRIAL-SPECIFIC  -->

                    <!-- clinical trial phase -->
                    <div
                      v-if="item.studyDesign && item.studyDesign.phaseNumber"
                    >
                      <TrialPhase :phases="item.studyDesign.phaseNumber" />
                    </div>

                    <!-- clinical trial status -->
                    <div v-if="item.studyStatus">
                      <TrialStatus
                        :status="item.studyStatus"
                        :locations="item.studyLocation"
                      />
                    </div>

                    <!-- relatedTo -->
                    <!-- <router-link to="search" v-if="item['@type'] == 'Dataset'">
                    <small>find analyses/publications that use this data</small>
                  </router-link>
                  <div v-if="item.isBasedOn && item.isBasedOn.length" class="px-1 bg-grey__lightest">
                    based on |
                    <router-link to="search" v-for="(resource, idx) in item.isBasedOn" :key="idx">
                      {{ resource["@type"] }}
                    </router-link>
                  </div>
                  <router-link to="search" v-if="item.relatedTo">
                    <small>related resources</small>
                  </router-link>
                  <div v-if="item.isBasedOn && item.isBasedOn.length" class="px-1 bg-grey__lightest">
                    based on |
                    <router-link to="search" v-for="(resource, idx) in item.isBasedOn" :key="idx">
                      {{ resource["@type"] }}
                    </router-link>
                  </div>
                  <router-link to="search" v-if="item.relatedTo">
                    <small>related resources</small>
                  </router-link> -->
                  </div>

                  <div
                    v-if="item.curatedBy"
                    class="text-right border-top pt-2 mt-2 ml-2 mr-5 line-height-1 d-flex align-items-center justify-content-between"
                  >
                    <!-- altmetrics badges -->
                    <div
                      v-if="item.doi"
                      class="d-flex flex-column align-items-center"
                    >
                      <div
                        class="altmetric-embed my-2"
                        data-badge-type="donut"
                        data-badge-popover="right"
                        :data-doi="item.doi"
                      />
                      <small class="d-flex">
                        <a
                          class="mr-1"
                          href="https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated"
                          target="_blank"
                        >
                          Altmetric
                        </a>

                        Rating
                      </small>
                    </div>

                    <div
                      v-else-if="item.curatedBy.name === 'ClinicalTrials.gov'"
                      class="d-flex flex-column align-items-center"
                    >
                      <div
                        class="altmetric-embed my-2"
                        data-badge-type="donut"
                        data-badge-popover="right"
                        :data-nct-id="item.identifier"
                      />
                      <small class="d-flex">
                        <a
                          class="mr-1"
                          href="https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated"
                          target="_blank"
                        >
                          Altmetric
                        </a>

                        Rating
                      </small>
                    </div>
                    <div v-else />

                    <div class="d-flex flex-column" :class="item['@type']">
                      <small>provided by {{ item.curatedBy.name }}</small>
                      <router-link
                        v-if="getLogo(item.curatedBy.name)"
                        :to="{
                          name: 'Resource Page',
                          params: { id: item._id },
                        }"
                      >
                        <img
                          :src="`/assets/resources/${getLogo(
                            item.curatedBy.name,
                          )}`"
                          :alt="item.curatedBy.name"
                          height="25"
                          class="ml-2"
                        />
                      </router-link>
                    </div>
                  </div>
                </div>

                <!-- RIGHT     -->
                <div class="col-sm-12 col-md-6 col-lg-7 text-muted">
                  <!-- CLINCIAL-TRIAL-SPECIFIC  -->
                  <div v-if="item.studyDesign || item.armGroup">
                    <TrialType
                      :design="item.studyDesign"
                      :arms="item.interventions"
                    />
                  </div>

                  <!-- clinical trial phase -->
                  <!-- <div v-if="item.studyDesign && item.studyDesign.phaseNumber">
                    <TrialPhase :phases="item.studyDesign.phaseNumber"/>
                    </div> -->

                  <template v-if="item.descriptionExpanded">
                    <span class="text-break" v-html="item.longDescription" />
                    <span>
                      <a
                        v-if="item.descriptionTooLong"
                        class="show-more"
                        href="#"
                        @click.prevent="expandDescription(item)"
                      >
                        (show less)
                      </a>
                    </span>
                  </template>
                  <template v-else-if="item.shortDescription">
                    <span class="text-break" v-html="item.shortDescription" />
                    <span v-if="item.descriptionTooLong">
                      ...

                      <a
                        class="show-more"
                        href="#"
                        @click.prevent="expandDescription(item)"
                      >
                        (show more)
                      </a>
                    </span>
                  </template>
                  <template v-else>No description provided</template>
                </div>

                <!-- Bottom -->
                <!-- <div class="col-sm-12 d-flex flex-wrap keyword-container mt-2">
                <small class="keyword px-2 py-1 mb-1 mr-1" v-for="(keyword, idx) in item.keywords" :key="idx" :data-tippy-info="`search ${keyword}`">
                  <router-link :to="{
                        name: 'Resources',
                        query: { q: `&quot;${keyword}&quot;` }
                      }" class="no-underline text-dark">
                    {{ keyword }}
                  </router-link>
                </small>
              </div> -->
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <br />
    <div
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
        {{ upperLim.toLocaleString() }} of {{ numResults.toLocaleString() }}
      </small>

      <button
        aria-label="next-button"
        class="pagination-btn pagination-left"
        :class="{ disabled: selectedPage === lastPage }"
        @click="changePage(1)"
      >
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  inject,
  ref,
  onUpdated,
  computed,
  watch,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';
import debounce from 'lodash/debounce';
import tippy from 'tippy.js';

import { getResources } from '@/api/resources.js';
import { lazyLoad } from '@/js/lazy-load';
import 'tippy.js/themes/light.css';
import { adminStore } from '@/stores/adminStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const StripeAccent = lazyLoad('StripeAccent');
const TrialPhase = lazyLoad('TrialPhase');
const TrialStatus = lazyLoad('TrialStatus');
const TrialType = lazyLoad('TrialType');
const DownloadData = lazyLoad('DownloadData');
const Donut = lazyLoad('Donut');
const DateHistogram = lazyLoad('DateHistogram');

const props = defineProps({
  q: String,
  sort: String,
  page: String,
  size: String,
  filter: String,
  dateMin: String,
  dateMax: String,
});

// global variable - equivalent with this.$resourceurl
const resourceUrl = inject('resourceUrl');

const store = adminStore();
const { loading } = storeToRefs(store);

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const resultsSubscription = ref(null);
const data = ref(null);
const dates = ref(null);
const dateFacet = ref({ expanded: false });
const numResults = ref(0);
const selectedPage = ref(null);
const searchInput = ref(null);
const filterString = ref(null);
const esQuery = ref(null);
const facetFilters = ref([]);
const selectedFilters = ref([]);
const sortValue = ref(null);
const numPerPage = ref(null);
const pageOpts = ref([5, 10, 50, 100]);
const pieVariables = ref([
  'Type',
  'Source',
  'Topic',
  'Funding',
  'Measurement Technique',
]);
const sortOpts = ref([
  {
    value: '',
    label: 'best match',
  },
  {
    value: '-date',
    label: 'date: newest to oldest',
  },
  {
    value: 'date',
    label: 'date: oldest to newest',
  },
  {
    value: 'name',
    label: 'A-Z',
  },
  {
    value: '-name',
    label: 'Z-A',
  },
]);

const resources = ref([]);

const newData = ref(null);
const facetSummary = ref(null);

const lowerLim = computed(() => {
  return selectedPage.value * numPerPage.value;
});

const upperLim = computed(() => {
  const upper = selectedPage.value * numPerPage.value + numPerPage.value;
  return upper > numResults.value ? numResults.value : upper;
});

const lastPage = computed(() => {
  return numResults.value
    ? Math.floor(numResults.value / numPerPage.value)
    : null;
});

const quotedSearch = computed(() => {
  return `"${searchInput.value}"`;
});

const showSearchHelper = computed(() => {
  return searchInput.value
    ? searchInput.value.includes(' ') && !searchInput.value.includes('"')
    : false;
});

onMounted(() => {
  resources.value = store.$state.resources;

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.resourceMetadata;
  useSeoMeta(metadata);
});

onBeforeUnmount(() => {
  if (resultsSubscription.value) {
    resultsSubscription.value.unsubscribe();
  }
});

onUpdated(() => {
  if (window._altmetric_embed_init) {
    // Call Altmetrics
    window._altmetric_embed_init();
  } else {
    // append Altmetrics script
    let altmetricsScript = document.createElement('script');
    altmetricsScript.setAttribute(
      'src',
      'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
    );
    document.body.appendChild(altmetricsScript);
  }
});

const getResults = () => {
  const searchTerm = searchInput.value;

  resultsSubscription.value = getResources(
    resourceUrl,
    searchTerm,
    filterString.value,
    sortValue.value,
    numPerPage.value,
    selectedPage.value * numPerPage.value,
    props.dateMin,
    props.dateMax,
  ).subscribe((results) => {
    data.value = results.results;
    dates.value = results.dates.filter((d) => d.count);
    newData.value = results.recent;
    facetSummary.value = results.facets;

    if (results.total) {
      selectedFilters.value = results.facets
        .map((d) => {
          return {
            id: d.id,
            vars: d.filtered.filter((d) => d.checked).map((d) => d.term),
          };
        })
        .filter((d) => d.vars.length);
    } else {
      selectedFilters.value = route.query.filter.split(';').map((d) => {
        let term = d.split(':');
        return {
          id: term[0],
          vars: term[1].split(','),
        };
      });
    }

    numResults.value = results.total;
    esQuery.value = results.query;

    tippy('.keyword', {
      content: 'Loading...',
      maxWidth: '200px',
      placement: 'bottom',
      animation: 'fade',
      theme: 'light',
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      },
    });
  });
};

const expandDescription = (item) => {
  item.descriptionExpanded = !item.descriptionExpanded;
};

const filters2String = () => {
  const filters = facetSummary.value
    .map((d) => {
      return {
        id: d.id,
        vars: d.filtered.filter((d) => d.checked),
      };
    })
    .filter((d) => d.vars.length);

  const filterArr = filters.map(
    (d) => `${d.id}:${d.vars.map((x) => x.term).join(',')}`,
  );

  return filterArr.join(';');
  // return (filters.map(d => `${d.id}:("${d.vars.map(x => x.term).join('" OR "')}")`));
};

const getLogo = (curator) => {
  const source = store.$state.resources
    .flatMap((d) => d.sources)
    .filter(
      (d) =>
        d.id === curator.toLowerCase() ||
        d.name.toLowerCase() === curator.toLowerCase(),
    );
  return source.length ? source[0].img : null;
};

const selectFilterText = (facet, idx) => {
  const selectedText = facetFilters.value[idx].toLowerCase();
  if (selectedText !== '') {
    facet.filtered = facet.counts.filter((d) =>
      d.term.toLowerCase().includes(selectedText),
    );
    facet.filtered.forEach((d) => (d.checked = true));
  } else {
    facet.filtered = cloneDeep(facet.counts);
    facet.filtered.forEach((d) => (d.checked = false));
  }

  filterString.value = filters2String();
  router.push({
    name: 'Resources',
    state: {
      disableScroll: true,
    },
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: '0',
      size: String(numPerPage.value),
      sort: sortValue.value,
      dateMin: props.dateMin,
      dateMax: props.dateMax,
    },
  });
};

const selectFilter = (facet, option) => {
  option.checked = !option.checked;

  filterString.value = filters2String();
  router.push({
    name: 'Resources',
    state: {
      disableScroll: true,
    },
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: '0',
      size: String(numPerPage.value),
      sort: sortValue.value,
      dateMin: props.dateMin,
      dateMax: props.dateMax,
    },
  });
};

const clearFilters = () => {
  filterString.value = null;
  router.push({
    name: 'Resources',
    state: {
      disableScroll: true,
    },
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: '0',
      size: String(numPerPage.value),
      sort: sortValue.value,
    },
  });
};

const removeFilter = (variable, id) => {
  const typeIdx = facetSummary.value.findIndex((d) => d.id === id);
  if (typeIdx >= 0) {
    const varIdx = facetSummary.value[typeIdx].filtered.findIndex(
      (d) => d.term === variable,
    );
    if (varIdx >= 0) {
      facetSummary.value[typeIdx].filtered[varIdx]['checked'] = false;
    }
  }
  filterString.value = filters2String();
  router.push({
    name: 'Resources',
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: '0',
      size: String(numPerPage.value),
      sort: sortValue.value,
      dateMin: props.dateMin,
      dateMax: props.dateMax,
    },
  });
};

const removeDateFilter = (type) => {
  if (type === 'min') {
    router.push({
      name: 'Resources',
      state: {
        disableScroll: true,
      },
      query: {
        q: searchInput.value,
        filter: filterString.value,
        page: '0',
        size: String(numPerPage.value),
        sort: sortValue.value,
        dateMin: null,
        dateMax: props.dateMax,
      },
    });
  } else {
    router.push({
      name: 'Resources',
      state: {
        disableScroll: true,
      },
      query: {
        q: searchInput.value,
        filter: filterString.value,
        page: '0',
        size: String(numPerPage.value),
        sort: sortValue.value,
        dateMin: props.dateMin,
        dateMax: null,
      },
    });
  }
};

const onEnter = () => {
  router.push({
    name: 'Resources',
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: '0',
      size: String(numPerPage.value),
      sort: sortValue.value,
    },
  });
};

const changeSort = () => {
  router.push({
    name: 'Resources',
    state: {
      disableScroll: true,
    },
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: '0',
      size: String(numPerPage.value),
      sort: sortValue.value,
      dateMin: props.dateMin,
      dateMax: props.dateMax,
    },
  });
};

const changePage = (step) => {
  selectedPage.value += step;

  router.push({
    name: 'Resources',
    state: {
      disableScroll: true,
    },
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: String(selectedPage.value),
      size: String(numPerPage.value),
      sort: sortValue.value,
      dateMin: props.dateMin,
      dateMax: props.dateMax,
    },
  });
};

const changePageNum = () => {
  selectedPage.value = 0;

  router.push({
    name: 'Resources',
    state: {
      disableScroll: true,
    },
    query: {
      q: searchInput.value,
      filter: filterString.value,
      page: String(selectedPage.value),
      size: String(numPerPage.value),
      sort: sortValue.value,
      dateMin: props.dateMin,
      dateMax: props.dateMax,
    },
  });
};

const debounceFilterText = debounce(selectFilterText, 500);
const debounceSearchText = debounce(onEnter, 500);
const debounceGetResult = debounce(getResults, 500);
const debounceChangePageNum = debounce(changePageNum, 500);

watch(searchInput, () => {
  debounceSearchText();
});

watch(
  () => route,
  (newVal, oldVal) => {
    searchInput.value = newVal.query.q ? newVal.query.q : props.q;
    filterString.value = newVal.query.filter ? newVal.query.filter : null;
    numPerPage.value = newVal.query.size ? Number(newVal.query.size) : 10;
    selectedPage.value = newVal.query.page ? Number(newVal.query.page) : 0;
    sortValue.value = newVal.query.sort ? newVal.query.sort : '';

    debounceGetResult();
  },
  { immediate: true, deep: true },
);

onUnmounted(() => {
  if (resultsSubscription.value) {
    resultsSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss" scoped>
.nav-item {
  padding-right: 1rem;
  padding-left: 1rem;
}

.search-result {
  border-bottom: 3px solid $grey-40;
  padding: 5px;
}

.filter-bottom {
  border-bottom: 10px solid #82bed1;
}

.search-result:nth-child(odd) {
  background-color: $grey-30;
}

.keyword {
  background: lighten($warning-color, 35%);
  border-radius: 5px;
}

.list-group-item.list-group-item-info {
  background-color: $secondary-color !important;
  border-color: $secondary-color !important;
  color: white !important;
}

@media (max-width: 576px) {
  .resource-title {
    align-items: start;
    flex-direction: column;
  }
}
</style>
