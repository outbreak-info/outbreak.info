<template>
<div>
  <div class="mb-4 mt-3 half-page text-left" :class="[smallScreen ? 'mx-2' : 'mx-5']">
    <!-- LOADING -->
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <!-- CHANGE LOCATION MODAL -->
    <div id="change-locations-modal" class="modal fade">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Select report location</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="py-3 border-bottom">
              <div class="d-flex align-items-center justify-content-center my-3" id="select-location">
                <TypeaheadSelect :queryFunction="queryLocation" @selected="updateLocations" :apiUrl="this.$genomicsurl" labelVariable="label" :removeOnSelect="false" placeholder="Select location" totalLabel="total sequences" />
              </div>
            </div>
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-primary" @click="submitNewLocation" data-dismiss="modal">Create report</button>

          </div>
        </div>
      </div>
    </div>
    <!-- end change location modal -->

    <!-- CHANGE MUTATIONS MODAL -->
    <div id="change-mutations-modal" class="modal fade">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Add custom mutations</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <VariantForm :minimalistic="false" :selectedLineage.sync="newPango" :selectedMutations.sync="newMuts" :submitted="submitCount" />

            <!-- <div class="mx-4 border-top pt-3" v-if="customMutations.length">
              <h6 class="font-weight-bold text-muted">
                Already selected:
              </h6>
              <div class="d-flex flex-wrap">
                <button role="button" class="btn chip bg-main__darker text-light d-flex align-items-center py-1 px-2 line-height-1" v-for="(mutation, mIdx) in customMutations" :key="mIdx" @click="deleteMutation(mIdx)">
                  {{mutation.label}}
                  <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
                </button>
              </div>
            </div> -->
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-outline-secondary" @click="clearMutations">Clear selections</button>
            <button type="button" :disabled="!formValid" class="btn btn-main" @click="addMutations">Add another lineage/mutation</button>
            <button type="button" class="btn btn-accent" @click="submitNewMutations" data-dismiss="modal">Go</button>

          </div>
        </div>
      </div>
    </div>
    <!-- end change mutations modal -->

    <template>
      <!-- SOCIAL MEDIA SHARE, BACK BTN -->
      <div class="d-flex align-items-center mb-2">
        <router-link :to="{ name: 'LocationReports'}" class="no-underline">
          <button class="btn py-0 px-2 d-flex align-items-center btn-grey">
            <font-awesome-icon class="mr-2 fa-sm" :icon="['fas', 'arrow-left']" />
            back
          </button>
        </router-link>
        <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline d-flex align-items-center" data-toggle="modal" data-target="#change-mutations-modal">
          <font-awesome-icon class="mr-2 fa-xs" :icon="['fas', 'plus']" />
          add mutations
        </button>
        <ShareReport title="title" url="url" />
      </div>

      <!-- REPORT HEADER -->
      <div class="d-flex flex-column text-light location-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Compare Locations</h4>
        <div class="d-flex flex-wrap justify-content-between align-items-center">
          <div class="d-flex flex-column align-items-start">

            <div class="d-flex align-items-end">
              <div class="d-flex flex-wrap align-items-center">
                <h1 class="m-0 font-weight-bold location-header">{{ title }}</h1>
                <button class="btn py-1 px-2 mx-4 btn-grey flex-shrink-0" data-toggle="modal" data-target="#change-locations-modal">
                  <font-awesome-icon class="mr-2 font-size-small" :icon="['fas', 'sync']" />change location
                </button>
              </div>
            </div>
            <div class="d-flex align-items-center">
              <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
                <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
              </small>
              <div class="text-light font-size-2 ml-5" v-if="totalSequences">
                {{totalSequences}} sequences
              </div>
            </div>


          </div>
          <div class="d-flex flex-column align-items-end justify-content-between flex-shrink-0">
            <div class="d-flex align-items-center mb-1">
              Enabled by data from
              <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
                <img src="@/assets/resources/gisaid.png" class="gisaid ml-2" alt="GISAID Initiative" />
              </a>
            </div>
            <div class="d-flex align-items-center bright-hyperlink my-1">
              <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
              <router-link :to="{name:'SituationReportCaveats'}" class="bright-hyperlink">How to interpret these reports</router-link>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>

  <!-- TRACKED LINEAGES PREVALENCE -->
  <section id="lineages-over-time" class="my-5 py-3 border-top">
    <div class="d-flex flex-wrap align-items-center justify-content-center mb-3">
      <h3 class="mr-5">Tracked lineages over time <span v-if="selectedLocation">in {{ selectedLocation.label }}</span></h3>
      <button class="btn btn-main-outline d-flex align-items-center flex-shrink-0" data-toggle="modal" data-target="#change-mutations-modal">Change mutations
        <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
      </button>
      <Warning class="fa-sm ml-3" text="Estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>" />
    </div>
    <ReportPrevalenceOverlay :data="prevalences" :seqCounts="seqCounts" :epi="[]" :locationID="'locationID'" :locationName="'locationName'" />
  </section>

  <!-- METHODS -->
  <section class="mt-3 mb-5 border-top pt-3" id="methods">
    <h4>Methodology</h4>
    <ReportMethodology :dateUpdated="dateUpdated" :summary="true" />
    <Warning class="mt-2" :text="disclaimer" />
  </section>

  <!-- CITATION -->
  <section class="my-3 border-top pt-3">
    <h4 class="">Citing this report</h4>
    <p class="m-0">
      <b>{{ title }}</b>. {{ mutationAuthors }}. outbreak.info, (available at {{ url }}). Accessed {{ today }}.
    </p>
    <ShareReport :title="title" :url="url" />
  </section>

  <!-- ACKNOWLEDGEMENTS -->
  <ReportAcknowledgements class="border-top pt-3" />

</div>
</template>

<script>
import Vue from "vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons/faClock";
import {
  faTimesCircle
} from "@fortawesome/free-regular-svg-icons/faTimesCircle";
import {
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import {
  faPlus
} from "@fortawesome/free-solid-svg-icons/faPlus";
import {
  faArrowLeft
} from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons/faSpinner";
import {
  faSync
} from "@fortawesome/free-solid-svg-icons/faSync";

library.add(faClock, faSpinner, faSync, faInfoCircle, faArrowLeft, faPlus, faTimesCircle);


import debounce from "lodash/debounce";

import {
  mapState
} from "vuex";

import {
  max,
  timeFormat,
  scaleOrdinal,
  scaleThreshold,
  scaleSequential,
  scaleTime,
  timeDay,
  extent,
  format
} from "d3";

import {
  schemeYlGnBu,
  interpolateRdPu
} from "d3-scale-chromatic";

import {
  getLocationComparison,
  findLocation
} from "@/api/genomics.js";

import cloneDeep from "lodash/cloneDeep";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";

export default {
  name: "CompareLocations",
  props: {
    loc: [Array, String],
    muts: [Array, String],
    pango: String
  },
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    VariantForm: () => import( /* webpackPrefetch: true */ "@/components/VariantForm.vue"),
    ReportMethodology: () => import( /* webpackPrefetch: true */ "@/components/ReportMethodology.vue"),
    Warning: () => import( /* webpackPrefetch: true */ "@/components/Warning.vue"),
    ReportAcknowledgements: () => import( /* webpackPrefetch: true */ "@/components/ReportAcknowledgements.vue"),
    ShareReport: () => import( /* webpackPrefetch: true */ "@/components/ShareReport.vue"),
    ReportPrevalenceOverlay: () => import( /* webpackPrefetch: true */ "@/components/ReportPrevalenceOverlay.vue"),
    FontAwesomeIcon
  },
  watch: {
    '$route.query': function(newVal, oldVal) {
      if (newVal.loc != oldVal.loc) {
        this.newLocation = null;
        this.createReport();
        this.customMutations = this.grabCustomMutations();
      }
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors"]),
    ...mapState("genomics", ["locationLoading1", "locationLoading2", "locationLoading3", "locationLoading4", "locationLoading5", "characteristicThreshold"]),
    loading() {
      return (this.locationLoading1 || this.locationLoading2 || this.locationLoading3 || this.locationLoading4 || this.locationLoading5)
    }
  },
  mounted() {
    this.queryLocation = findLocation;

    const formatDate = timeFormat("%e %B %Y");
    this.currentTime = new Date();
    this.today = formatDate(this.currentTime);


    this.$nextTick(function() {
      // resize listener
      window.addEventListener("resize", this.setDims);
      this.setDims;

      // set URL for sharing, etc.
      const location = window.location;
      // this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;
    })

    // intial setup
    this.setDims();

    this.setupReport();
  },
  destroyed() {
    window.removeEventListener("resize", this.setDims);

    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }
  },
  data() {
    return ({
      // static variables
      smallScreen: false,
      mediumScreen: false,
      today: null,
      url: null,
      disclaimer: `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
      // methods
      queryLocation: null,
      reportSubscription: null,
      // variables
      selectedLocation: null,
      newPango: null,
      newMuts: [],
      submitCount: 0,
      formValid: false,
      // data
      totalSequences: null,
      dateUpdated: null,
      lastUpdated: null,
      prevalences: [],
      title: null
    })
  },
  methods: {
    setDims() {
      this.mediumScreen = window.innerWidth < 900;
      this.smallScreen = window.innerWidth < 500;
    },
    clearMutations() {
      console.log("mutations!")
    },
    addMutations() {
      console.log("mutations!")
    },
    submitNewMutations() {
      console.log("mutations!")
    },
    setupReport() {
      this.reportSubscription = getLocationComparison(this.$genomicsurl, this.loc, this.pango, this.muts).subscribe(results => {
        this.prevalences = results;
        console.log(this.prevalences)
      })
    },
    updateLocations(selected) {
      if (selected) {
        this.newLocation = selected;
      }
    },
    submitNewLocation() {
      this.$router.push({
        name: "CompareLocations",
        query: {
          loc: this.newLocation.id,
          pango: this.pango
        }
      })
      this.newLocation = null;
    }
  }
}
</script>
