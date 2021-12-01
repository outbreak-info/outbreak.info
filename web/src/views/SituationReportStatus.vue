<template>
<div>
  <div class="bg-main__darker status-banner border-top py-4">
    <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
    <h1 class="m-0 status-header font-weight-bold">Current Status</h1>
  </div>

  <!-- LOADING -->
  <div v-if="reportloading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>

  <div class="my-2 mx-4 px-4">
    <img src="@/assets/sequencing.svg" alt="map" class="bg-image" />
    <div class="d-flex flex-column justify-content-center align-items-center">
      <div class="d-flex w-75 justify-content-around align-items-center">
        <div class="text-left d-flex align-items-center my-3 border-top border-bottom py-2 px-2 fa-lg">
          Enabled by data from
          <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/resources/gisaid.png" class="gisaid ml-2" alt="GISAID Initiative" />
          </a>
        </div>
      </div>

      <div class="w-75 mt-2 text-left">The <a href="https://cvisb.org/" rel="noreferrer" target="_blank">CViSB Team</a> at Scripps Research is tracking the prevalence of SARS-CoV-2 (hCoV-19) variants with lineage and mutation reports, updated
        daily. Below are details on the current version of data.
      </div>

      <!-- date updated -->
      <div class="px-3 py-2 border-top border-bottom my-2 bg-white">
        <div class="fa-lg my-2 text-main">
          Current version: <b>{{dateUpdated}}</b>
        </div>
        <div class="d-flex align-items-center justify-content-center my-2 mt-3">
          <div id="date-updated">
            <div class="text-muted badge bg-grey__lightest mt-1 mr-3" v-if="lastUpdated">
              <font-awesome-icon class="mr-1 fa-1x" :icon="['far', 'clock']" />
              <span class="fa-1x">Updated {{ lastUpdated }} ago</span>
            </div>
          </div>
          <div id="sequence-count" class="ml-2 fa-lg text-highlight" v-if="total">
            {{total}} total sequences
          </div>
        </div>
        <div id="sequence-count" class="mt-3 mb-2 fa-lg text-highlight__brighter" v-if="loc && locTotal">
          <div>
          </div>{{locTotal}} {{locationTitle}}
          <font-awesome-icon class="ml-2 fa-xs pointer" :icon="['fas', 'sync']" data-toggle="collapse" data-target="#changeLocation" aria-expanded="false" aria-controls="change location" />
          <!-- SELECT LOCATION -->
          <div class="input-group max-width-50 mt-3 collapse" id="changeLocation">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb">
                <font-awesome-icon :icon="['fas', 'search']" />
              </span>
            </div>
            <TypeaheadSelect class="form-control" :isStandalone="false" :queryFunction="queryLocation" @selected="updateLocation" :apiUrl="this.$genomicsurl" labelVariable="label" placeholder="Change location" totalLabel="total sequences"
              :removeOnSelect="true" />
          </div>
        </div>
      </div>

      <!-- MINI-NAV -->
      <div class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center">
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
          <h4>Samples sequenced {{locationTitle}}</h4>
          <!-- SELECT LOCATION -->
          <div class="input-group max-width-50 ml-4">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb">
                <font-awesome-icon :icon="['fas', 'search']" />
              </span>
            </div>
            <TypeaheadSelect class="form-control" :isStandalone="false" :queryFunction="queryLocation" @selected="updateLocation" :apiUrl="this.$genomicsurl" labelVariable="label" placeholder="Change location" totalLabel="total sequences"
              :removeOnSelect="true" />
          </div>
        </div>
        <SequencingHistogram :data="seqCounts" :width="widthHist" :height="250" :downward="false" :includeXAxis="true" :margin="marginHist" :mutationName="null" className="sequencing-histogram" title="By collection date" :onlyTotals="true"
          notDetectedColor="#bab0ab" v-if="seqCounts" />
      </section>

      <section id="delays" class="border-bottom py-4 w-100">
        <div class="d-flex justify-content-between align-items-center w-100 mb-3">
          <h4>Gap between sample collection date and data submission {{ locationTitle }}</h4>
          <!-- SELECT LOCATION -->
          <div class="input-group max-width-50 ml-4">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb">
                <font-awesome-icon :icon="['fas', 'search']" />
              </span>
            </div>
            <TypeaheadSelect class="form-control" :isStandalone="false" :queryFunction="queryLocation" @selected="updateLocation" :apiUrl="this.$genomicsurl" labelVariable="label" placeholder="Change location" totalLabel="total sequences"
              :removeOnSelect="true" />
          </div>
        </div>

        <div class="d-flex flex-wrap justify-content-between">
          <GapOverTime :data="weeklyMedianGap" :location="locationTitle" />
          <Histogram :data="seqGaps" :median="seqGapMedian" :title="`Difference between sample collection and sequence submission in days ${locationTitle}`" />
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

<script>
import Vue from "vue";
import {
  mapState
} from "vuex";

import debounce from "lodash/debounce";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons";
import {
  faSpinner,
  faSearch,
  faSync
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faSearch, faSync);

import {
  getStatusBasics,
  getSequenceCount,
  getSeqGaps,
  getSeqMap,
  getStatusLocation,
  findLocation,
  checkGisaidID
} from "@/api/genomics.js";

export default Vue.extend({
  name: "SituationReportStatus",
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    SequencingHistogram: () => import( /* webpackPrefetch: true */ "@/components/SequencingHistogram.vue"),
    Histogram: () => import( /* webpackPrefetch: true */ "@/components/Histogram.vue"),
    GapOverTime: () => import( /* webpackPrefetch: true */ "@/components/GapOverTime.vue"),
    FontAwesomeIcon
  },
  props: {
    loc: String,
    var: String
  },
  computed: {
    ...mapState("genomics", ["locationLoading1", "locationLoading2", "locationLoading3"]),
    reportloading() {
      return (this.locationLoading1 || this.locationLoading2 || this.locationLoading3)
    },
    locationTitle() {
      if (this.selectedLocation) {
        return `in ${this.selectedLocation.label}`
      } else {
        return ("Worldwide")
      }
    }
  },
  watch: {
    selectedSequence() {
      this.debounceSeqSearch();
    },
    loc() {
      this.updateLocationMd();
      this.updateSeqCounts();
      this.updateGap();
      this.updateMap();
    }
  },
  data() {
    return {
      // methods
      queryLocation: null,
      // subscriptions
      totalSubscription: null,
      locationSubscription: null,
      longitudinalSubscription: null,
      gapSubscription: null,
      mapSubscription: null,
      idSubscription: null,
      // data
      dateUpdated: null,
      lastUpdated: null,
      total: null,
      locTotal: null,
      seqCounts: null,
      seqGaps: null,
      seqMap: null,
      seqGapMedian: null,
      weeklyMedianGap: null,
      // selections
      selectedLocation: null,
      selectedSequence: null,
      sequenceFound: null,
      // layout variables
      widthHist: 800,
      marginHist: {
        top: 10,
        bottom: 30,
        left: 75,
        right: 75
      }
    };
  },
  methods: {
    updateLocation(newLocation) {
      if (newLocation) {
        this.$router.push({
          name: "SituationReportStatus",
          params: {
            disableScroll: true
          },
          query: {
            loc: newLocation.id,
            var: this.var
          }
        })
      }
    },
    lookupSequence() {
      if (this.selectedSequence) {
        this.checkID();
      } else {
        this.sequenceFound = null;
      }
    },
    updateLocationMd() {
      this.longitudinalSubscription = getStatusLocation(this.$genomicsurl, this.loc).subscribe(results => {
        this.locTotal = results.total;
        this.selectedLocation = results.location;
      })
    },
    updateSeqCounts() {
      this.longitudinalSubscription = getSequenceCount(this.$genomicsurl, this.loc, false).subscribe(results => {
        this.seqCounts = results;
      })
    },
    updateGap() {
      this.gapSubscription = getSeqGaps(this.$genomicsurl, this.loc).subscribe(results => {
        this.seqGaps = results.gapHist;
        this.seqGapMedian = results.median;
        this.weeklyMedianGap = results.weeklyMedian;
      })
    },
    updateMap() {
      this.mapSubscription = getSeqMap(this.$genomicsurl, this.$apiurl, this.loc).subscribe(results => {
        this.seqMap = results;
      })
    },
    checkID() {
      this.idSubscription = checkGisaidID(this.$genomicsurl, this.selectedSequence).subscribe(found => {
        this.sequenceFound = found
      })
    }
  },
  created() {
    this.debounceSeqSearch = debounce(this.lookupSequence, 250);
  },
  mounted() {
    this.queryLocation = findLocation;
    this.totalSubscription = getStatusBasics(this.$genomicsurl, this.loc).subscribe(results => {
      this.lastUpdated = results.lastUpdated;
      this.dateUpdated = results.dateUpdated;
      this.total = results.total;
    })

    this.updateLocationMd();
    this.updateSeqCounts();
    this.updateGap();
    this.updateMap();
  },
  beforeDestroyed() {
    if (this.totalSubscription) {
      this.totalSubscription.unsubscribe();
    }
    if (this.longitudinalSubscription) {
      this.longitudinalSubscription.unsubscribe();
    }
    if (this.idSubscription) {
      this.idSubscription.unsubscribe();
    }
    if (this.mapSubscription) {
      this.mapSubscription.unsubscribe();
    }
  }
})
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
