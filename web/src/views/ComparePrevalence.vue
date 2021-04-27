<template>
<div>
  <div class="my-2 mx-4 half-page text-left">
    <!-- LOADING -->
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <p class="snackbar snackbar-accent" :class="{ show: showSnackbar }">
      {{ snackbarText }}
    </p>

    <!-- SOCIAL MEDIA SHARE, BACK BTN -->
    <div class="d-flex align-items-center">
      <ShareReport title="title" url="url" />
    </div>

    <!-- REPORT HEADER -->
    <div class="d-flex flex-column text-light overlay-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
      <h3 class="m-0 mt-n1 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
      <div class="d-flex flex-wrap justify-content-between align-items-center">
        <div class="d-flex flex-column align-items-start">

          <div class="d-flex align-items-end">
            <div class="d-flex flex-wrap align-items-center">
              <h1 class="m-0 font-weight-bold overlay-header">Lineage | Mutation Prevalence Comparison in {{locationName}}</h1>
              <button class="btn py-1 px-2 mx-4 my-1 btn-grey flex-shrink-0" data-toggle="collapse" data-target="#select-lineages">
                <font-awesome-icon class="m-0 mr-2 font-size-small" :icon="['fas', 'sync']" />change lineages
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
  </div>
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

import {
  mapState
} from "vuex";

import {
  getLocationReportData,
  getSequenceCount,
  getLocationMaps,
  getBasicLocationReportData,
  getLocationTable,
  findLocation
} from "@/api/genomics.js";

export default {
  name: "ComparePrevalence",
  props: {
    loc: String,
    muts: [Array, String],
    pango: [Array, String],
    variant: [Array, String],
    selected: [Array, String]
  },
  components: {
    // TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    // ReportMethodology: () => import( /* webpackPrefetch: true */ "@/components/ReportMethodology.vue"),
    // Warning: () => import( /* webpackPrefetch: true */ "@/components/Warning.vue"),
    // ReportAcknowledgements: () => import( /* webpackPrefetch: true */ "@/components/ReportAcknowledgements.vue"),
    // ShareReport: () => import( /* webpackPrefetch: true */ "@/components/ShareReport.vue"),
    // OverlayLineagePrevalence: () => import( /* webpackPrefetch: true */ "@/components/OverlayLineagePrevalence.vue"),
    // CustomLocationForm: () => import( /* webpackPrefetch: true */ "@/components/CustomLocationForm.vue"),
    // SequencingHistogram: () => import( /* webpackPrefetch: true */ "@/components/SequencingHistogram.vue"),
    // DownloadReportData: () => import( /* webpackPrefetch: true */ "@/components/DownloadReportData.vue"),
    FontAwesomeIcon
  },
  computed: {
    ...mapState("admin", ["mutationAuthors"]),
    ...mapState("genomics", ["locationLoading1", "locationLoading2", "locationLoading3", "locationLoading4", "locationLoading5", "characteristicThreshold"]),
    loading() {
      return (this.locationLoading1 || this.locationLoading2 || this.locationLoading3 || this.locationLoading4 || this.locationLoading5)
    },
    locationName() {
      return (this.selectedLocation ? `${this.selectedLocation.label} Mutation Report` : null)
    },
  },
  mounted() {
    this.queryLocation = findLocation;
    this.choroColorScale = scaleThreshold(schemeYlGnBu[this.choroColorDomain.length + 2])
      .domain(this.choroColorDomain);

    this.customMutations = this.grabCustomMutations();

    const formatDate = timeFormat("%e %B %Y");
    this.currentTime = new Date();
    this.today = formatDate(this.currentTime);


    this.$nextTick(function() {
      // resize listener
      window.addEventListener("resize", this.setDims);
      this.setDims;

      // set URL for sharing, etc.
      const location = window.location;
      this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;
    })

    // intial setup
    this.setDims();

    this.setupReport();
  },

}
</script>
