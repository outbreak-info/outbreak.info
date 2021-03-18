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

  <div class="mb-1">
    <img src="@/assets/sequencing.svg" alt="map" class="bg-image" />
    <div class="d-flex flex-column justify-content-center align-items-center">
      <div class="d-flex w-75 justify-content-around align-items-center">
        <div class="text-left d-flex align-items-center my-3 border-top border-bottom py-2 px-2">
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
        <div class="fa-lg my-2">
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
            {{total}} sequences
          </div>
        </div>
      </div>

      <!-- MINI-NAV -->
      <div class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center">
        <a href="#geographic">
          <button class="btn btn-grey mx-3 py-2">
            <small>Geograhic distribution</small>
          </button>
        </a>

        <a href="#variants-of-concern">
          <button class="btn btn-grey mx-3 py-2">
            <small>Sequencing over time</small>
          </button>
        </a>

        <a href="#geographic">
          <button class="btn btn-grey mx-3 py-2">
            <small>Data delays</small>
          </button>
        </a>

        <a href="#geographic">
          <button class="btn btn-grey mx-3 py-2">
            <small>Find a sequence</small>
          </button>
        </a>
      </div>

      <!-- SELECT LOCATION -->
      <h3>Select location</h3>
      <div class="d-flex align-items-center my-3 w-100">
        <div class="input-group w-50">
          <div class="input-group-prepend">
            <span class="input-group-text bg-grey text-muted border-0" id="sb">
              <font-awesome-icon :icon="['fas', 'search']" />
            </span>
          </div>
          <TypeaheadSelect class="form-control mr-4" :isStandalone="false" :queryFunction="queryLocation" @selected="updateLocation" :apiUrl="this.$genomicsurl" labelVariable="label" placeholder="Select location" totalLabel="total sequences"
            :removeOnSelect="false" @click.prevent="submitQuery" />
        </div>

      </div>
    </div>
  </div>

</div>
</template>

<script>
import Vue from "vue";
import {
  mapState
} from "vuex";

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
  faSearch
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faSearch);

import {
  getStatusBasics,
  getSequenceCount,
  findLocation
} from "@/api/genomics.js";

export default Vue.extend({
  name: "SituationReportStatus",
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    FontAwesomeIcon
  },
  props: {
    loc: String,
    var: String
  },
  computed: {
    ...mapState("admin", ["reportloading"])
  },
  data() {
    return {
      queryLocation: null,
      totalSubscription: null,
      dateUpdated: null,
      lastUpdated: null,
      total: null
    };
  },
  methods: {
    updateLocation(newLocation) {
      console.log(newLocation)
    }
  },
  mounted() {
    this.queryLocation = findLocation;
    this.totalSubscription = getStatusBasics(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.lastUpdated;
      this.dateUpdated = results.dateUpdated;
      this.total = results.total;
      console.log(results)
    })
  },
  beforeDestroyed() {
    if (this.totalSubscription) {
      this.totalSubscription.unsubscribe();
    }
  }
})
</script>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

.gisaid {
    height: 25px;
}

$mutation-width: 275px;
.mutation-name {
    flex: 0 0 $mutation-width;
    width: $mutation-width;
}

.mutation-map {
    min-width: 0;
}

.bg-image {
    width: 40%;
    position: absolute;
    left: 0;
    opacity: 0.55;
    z-index: -1;
}
</style>
