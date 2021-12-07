<template>
<div>
  <div class="py-4 border-top location-banner">
    <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
    <h1 class="m-0 font-weight-bold location-header">Location Tracker</h1>
  </div>
  <div class="my-2 mx-4 px-4">
    <!-- LOADING -->
    <div v-if="reportloading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <div class="my-2">
      <img src="@/assets/map_stylized.svg" alt="map" class="bg-image" />
      <div class="d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex w-75 justify-content-around align-items-center">
          <div class="text-left d-flex align-items-center my-4 border-top border-bottom py-2 px-2 gisaid-text">
            Enabled by data from
            <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
              <img src="@/assets/resources/gisaid.png" class="gisaid-lg ml-2" alt="GISAID Initiative" />
            </a>
          </div>
        </div>

        <div class="w-75 mt-2 text-left">The <a href="https://cvisb.org/" rel="noreferrer" target="_blank">CViSB Team</a> at Scripps Research is tracking the prevalence of SARS-CoV-2 (hCoV-19) variants in locations with lineage and mutation reports,
          updated daily.
          Choose a country, division (state), or U.S. county to create a custom report.
        </div>
        <div class="d-flex align-items-center justify-content-between my-3">
          <div id="date-updated" class="mr-2">
            <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
              <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
            </small>
          </div>
          <div id="sequence-count" class="ml-2 mr-5 text-muted" v-if="total">
            with <span class="text-highlight">{{total}} sequences</span>  from GISAID
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center justify-content-end text-sec my-1">
        <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
        <router-link :to="{name:'SituationReportCaveats'}" class="text-sec">How to interpret these reports</router-link>
      </div>

      <!-- <ReportLogos class="my-4"/> -->



    </div>
    <section id="report-list" class="text-left">
      <CustomLocationForm :curated="curated" />
    </section>

    <ReportAcknowledgements />
  </div>
</div>
</template>

<script>
import Vue from "vue";

// import ReportLogos from "@/components/ReportLogos.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";

import CustomLocationForm from "@/components/CustomLocationForm.vue";

import {
  nest
} from "d3";

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
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faInfoCircle);

import {
  getLocationBasics,
  getSequenceCount
} from "@/api/genomics.js";

import {
  mapState
} from "vuex";

export default {
  name: "LocationReports",
  components: {
    // ReportLogos,
    ReportAcknowledgements,
    CustomLocationForm,
    FontAwesomeIcon
  },
  data() {
    return {
      // reminder: must be the raw verison of the file
      curatedSubscription: null,
      lastUpdated: null,
      total: null,
      curated: null
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors", "reportloading"])
  },
  mounted() {
    this.curatedSubscription = getLocationBasics(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.dateUpdated;
      this.curated = results.curated;
      this.total = results.total;
    })
  },
  beforeDestroyed() {
    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

.bg-image {
    width: 45%;
    position: absolute;
    left: 0;
    opacity: 0.7;
    z-index: 0;
}
</style>
