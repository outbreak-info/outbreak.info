<template>
  <div>
    <div class="bg-main__darker status-banner border-top py-4">
      <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
      <h1 class="m-0 status-header font-weight-bold">Current Status</h1>
    </div>

    <!-- LOADING -->
    <div v-if="reportloading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <div class="my-2 mx-4 px-4">
      <img src="@/assets/sequencing.svg" alt="map" class="bg-image" />
      <div class="d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex w-75 justify-content-around align-items-center">
          <div
            class="text-left d-flex align-items-center my-3 border-top border-bottom py-2 px-2 fa-lg"
          >
            Enabled by data from
            <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
              <img
                src="@/assets/resources/gisaid.png"
                class="gisaid ml-2"
                alt="GISAID Initiative"
              />
            </a>
          </div>
        </div>

        <div class="w-75 mt-2 text-left">
          The
          <a href="https://cvisb.org/" rel="noreferrer" target="_blank">
            CViSB Team
          </a>
          at Scripps Research is tracking the prevalence of SARS-CoV-2 (hCoV-19)
          variants with lineage and mutation reports, updated daily. Below are
          details on the current version of data.
        </div>

        <!-- date updated -->
        <div class="px-3 py-2 border-top border-bottom my-2 bg-white">
          <div class="fa-lg my-2 text-main">
            Current version:
            <b>{{ dateUpdated }}</b>
          </div>
          <div
            class="d-flex align-items-center justify-content-center my-2 mt-3"
          >
            <div id="date-updated">
              <div
                v-if="lastUpdated"
                class="text-muted badge bg-grey__lightest mt-1 mr-3"
              >
                <font-awesome-icon
                  class="mr-1 fa-1x"
                  :icon="['far', 'clock']"
                />
                <span class="fa-1x">Updated {{ lastUpdated }} ago</span>
              </div>
            </div>
            <div
              v-if="total"
              id="sequence-count"
              class="ml-2 fa-lg text-highlight"
            >
              {{ total }} total sequences
            </div>
          </div>
          <div
            v-if="loc && locTotal"
            id="sequence-count"
            class="mt-3 mb-2 fa-lg text-highlight__brighter"
          >
            <div />
            {{ locTotal }} {{ locationTitle }}
            <font-awesome-icon
              class="ml-2 fa-xs pointer"
              :icon="['fas', 'sync']"
              data-toggle="collapse"
              data-target="#changeLocation"
              aria-expanded="false"
              aria-controls="change location"
            />
            <!-- SELECT LOCATION -->
            <div
              id="changeLocation"
              class="input-group max-width-50 mt-3 collapse"
            >
              <div class="input-group-prepend">
                <span
                  id="sb"
                  class="input-group-text bg-grey text-muted border-0"
                >
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <TypeaheadSelect
                class="form-control"
                :isStandalone="false"
                :queryFunction="queryLocation"
                :apiUrl="$genomicsurl"
                labelVariable="label"
                placeholder="Change location"
                totalLabel="total sequences"
                :removeOnSelect="true"
                @selected="updateLocation"
              />
            </div>
          </div>
        </div>

        <!-- MINI-NAV -->
        <div
          class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center"
        >
          <!-- <a href="#geographic">
          <button class="btn btn-grey mx-3 py-2">
            <small>Geographic distribution</small>
          </button>
        </a> -->

          <a href="#longitudinal">
            <button class="btn btn-grey mx-3 py-2">
              <small>Sequencing over time</small>
            </button>
          </a>

          <a href="#delays">
            <button class="btn btn-grey mx-3 py-2">
              <small>Data delays</small>
            </button>
          </a>

          <!-- <a href="#search">
          <button class="btn btn-grey mx-3 py-2">
            <small>Find a sequence</small>
          </button>
        </a> -->
        </div>

        <!-- <section id="geographic" class="border-bottom py-4">
        <h4>Submitted sequences by country</h4>
        <div class="bg-main text-light p-5">
          MAP MAP MAP
        </div>
      </section> -->

        <section id="longitudinal" class="border-bottom py-4">
          <div class="d-flex justify-content-between align-items-center w-100">
            <h4>Samples sequenced {{ locationTitle }}</h4>
            <!-- SELECT LOCATION -->
            <div class="input-group max-width-50 ml-4">
              <div class="input-group-prepend">
                <span
                  id="sb"
                  class="input-group-text bg-grey text-muted border-0"
                >
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <TypeaheadSelect
                class="form-control"
                :isStandalone="false"
                :queryFunction="queryLocation"
                :apiUrl="$genomicsurl"
                labelVariable="label"
                placeholder="Change location"
                totalLabel="total sequences"
                :removeOnSelect="true"
                @selected="updateLocation"
              />
            </div>
          </div>
          <SequencingHistogram
            v-if="seqCounts"
            :data="seqCounts"
            :width="widthHist"
            :height="250"
            :downward="false"
            :includeXAxis="true"
            :margin="marginHist"
            :mutationName="null"
            className="sequencing-histogram"
            title="By collection date"
            :onlyTotals="true"
            notDetectedColor="#bab0ab"
          />
        </section>

        <section id="delays" class="border-bottom py-4 w-100">
          <div
            class="d-flex justify-content-between align-items-center w-100 mb-3"
          >
            <h4>
              Gap between sample collection date and data submission
              {{ locationTitle }}
            </h4>
            <!-- SELECT LOCATION -->
            <div class="input-group max-width-50 ml-4">
              <div class="input-group-prepend">
                <span
                  id="sb"
                  class="input-group-text bg-grey text-muted border-0"
                >
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <TypeaheadSelect
                class="form-control"
                :isStandalone="false"
                :queryFunction="queryLocation"
                :apiUrl="$genomicsurl"
                labelVariable="label"
                placeholder="Change location"
                totalLabel="total sequences"
                :removeOnSelect="true"
                @selected="updateLocation"
              />
            </div>
          </div>

          <div class="d-flex flex-wrap justify-content-between">
            <GapOverTime :data="weeklyMedianGap" :location="locationTitle" />
            <Histogram
              :data="seqGaps"
              :median="seqGapMedian"
              :title="`Difference between sample collection and sequence submission in days ${locationTitle}`"
            />
          </div>
        </section>

        <!-- <section id="search" class="d-flex flex-column align-items-center border-bottom py-4 w-100">
        <h4>Find if a GISAID ID is included</h4>
        <div class="input-group max-width-50 my-3">
          <div class="input-group-prepend">
            <span class="input-group-text bg-grey text-muted border-0" id="sb">
              <font-awesome-icon :icon="['fas', 'search']" />
            </span>
          </div>

          <input class="form-control" type="text" v-model="selectedSequence" placeholder="Enter GISAID ID, like EPI_ISL_1186010" />
        </div>
        <div v-if="selectedSequence && (sequenceFound === false || sequenceFound === true)">
          <div class="fa-lg my-3">
            <b>{{selectedSequence}}</b> is <b :class="[sequenceFound ? 'seq-found': 'seq-not-found']">{{sequenceFound ? "included" : "not included"}}</b> in our latest data build.
          </div>
          <div v-if="!sequenceFound" class="my-4 text-left">
            A sequence might not be found in our data for three reasons:
            <ul>
              <li>
                <b>Upload delays</b>: It takes up to 24 hours from sequence deposition in GISAID to be processed and added to our dataset.
              </li>
              <li>
                <b>Sequence quality filters</b>: We remove some sequences with our quality filters. <router-link :to="{name: 'SituationReportMethodology'}">Learn more</router-link>
              </li>
              <li>
                <b>Bad GISIAD ID</b>: Make sure you provide a valid GISAID Accession ID, like "EPI_ISL_1186010"
              </li>
            </ul>

          </div>
        </div>
      </section> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { inject, ref, watch, onMounted, computed, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import debounce from 'lodash/debounce';

import {
  getStatusBasics,
  getSequenceCount,
  getSeqGaps,
  getSeqMap,
  getStatusLocation,
  findLocation,
  checkGisaidID,
} from '@/api/genomics.js';
import { lazyLoad } from '@/js/lazy-load';
import { genomicsStore } from '@/stores/genomicsStore';
import { useRouter } from 'vue-router';

const TypeaheadSelect = lazyLoad('TypeaheadSelect');
const SequencingHistogram = lazyLoad('SequencingHistogram');
const Histogram = lazyLoad('Histogram');
const GapOverTime = lazyLoad('GapOverTime');

const props = defineProps({
  loc: String,
  var: String,
});

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');
// global variable - equivalent with this.$genomicsurl
const genomicsUrl = inject('genomicsUrl');

// instead of this.$router
const router = useRouter();

const store = genomicsStore();
const { locationLoading1, locationLoading2, locationLoading3 } =
  storeToRefs(store);

const queryLocation = ref(null);
const totalSubscription = ref(null);
const longitudinalSubscription = ref(null);
const gapSubscription = ref(null);
const mapSubscription = ref(null);
const idSubscription = ref(null);
const dateUpdated = ref(null);
const lastUpdated = ref(null);
const total = ref(null);
const locTotal = ref(null);
const seqCounts = ref(null);
const seqGaps = ref(null);
const seqMap = ref(null);
const seqGapMedian = ref(null);
const weeklyMedianGap = ref(null);
const selectedLocation = ref(null);
const selectedSequence = ref(null);
const sequenceFound = ref(null);
const widthHist = ref(800);
const marginHist = ref({
  top: 10,
  bottom: 30,
  left: 75,
  right: 75,
});

const reportloading = computed(() => {
  return locationLoading1 || locationLoading2 || locationLoading3;
});

const locationTitle = computed(() => {
  if (selectedLocation.value) {
    return `in ${selectedLocation.value.label}`;
  } else {
    return 'Worldwide';
  }
});

const updateLocation = (newLocation) => {
  if (newLocation) {
    router.push({
      name: 'SituationReportStatus',
      state: {
        disableScroll: true,
      },
      query: {
        loc: newLocation.id,
        var: props.var,
      },
    });
  }
};

const lookupSequence = () => {
  if (selectedSequence.value) {
    checkID();
  } else {
    sequenceFound.value = null;
  }
};

const updateLocationMd = () => {
  longitudinalSubscription.value = getStatusLocation(
    genomicsUrl,
    props.loc,
  ).subscribe((results) => {
    locTotal.value = results.total;
    selectedLocation.value = results.location;
  });
};

const updateSeqCounts = () => {
  longitudinalSubscription.value = getSequenceCount(
    genomicsUrl,
    props.loc,
    false,
  ).subscribe((results) => {
    seqCounts.value = results;
  });
};

const updateGap = () => {
  gapSubscription.value = getSeqGaps(genomicsUrl, props.loc).subscribe(
    (results) => {
      seqGaps.value = results.gapHist;
      seqGapMedian.value = results.median;
      weeklyMedianGap.value = results.weeklyMedian;
    },
  );
};

const updateMap = () => {
  mapSubscription.value = getSeqMap(genomicsUrl, apiUrl, props.loc).subscribe(
    (results) => {
      seqMap.value = results;
    },
  );
};

const checkID = () => {
  idSubscription.value = checkGisaidID(
    genomicsUrl,
    selectedSequence.value,
  ).subscribe((found) => {
    sequenceFound.value = found;
  });
};

const debounceSeqSearch = debounce(lookupSequence, 250);

watch(selectedSequence, () => {
  debounceSeqSearch();
});

watch(
  () => props.loc,
  () => {
    updateLocationMd();
    updateSeqCounts();
    updateGap();
    updateMap();
  },
);

onMounted(() => {
  queryLocation.value = findLocation;
  totalSubscription.value = getStatusBasics(genomicsUrl, props.loc).subscribe(
    (results) => {
      lastUpdated.value = results.lastUpdated;
      dateUpdated.value = results.dateUpdated;
      total.value = results.total;
    },
  );

  updateLocationMd();
  updateSeqCounts();
  updateGap();
  updateMap();
});

onBeforeUnmount(() => {
  if (totalSubscription.value) {
    totalSubscription.value.unsubscribe();
  }
  if (longitudinalSubscription.value) {
    longitudinalSubscription.value.unsubscribe();
  }
  if (idSubscription.value) {
    idSubscription.value.unsubscribe();
  }
  if (mapSubscription.value) {
    mapSubscription.value.unsubscribe();
  }
});
</script>

<style lang="scss" scoped>
.logo {
  width: 150px;
}

.bg-image {
  width: 40%;
  position: absolute;
  left: 0;
  opacity: 0.55;
  z-index: -1;
}

.max-width-50 {
  width: 325px !important;
}

.seq-found {
  color: $secondary-color;
}

.seq-not-found {
  color: $warning-color;
}
</style>
