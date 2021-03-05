<template>
<div class="my-5 mx-4 px-4">
  <!-- LOADING -->
  <div v-if="reportloading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>

<div :style="{ backgroundImage: 'url(' + require('@/assets/map-background.png') + ')' }" class="bg-image py-5">
  <h2 class="m-0 location-banner">SARS-CoV-2 (hCoV-19) Mutation Reports</h2>
  <h1 class="m-0 font-weight-bold location-banner">Location Tracker</h1>
</div>

  <div class="mb-1">
    <div class="d-flex flex-column justify-content-center align-items-center">
      <div class="d-flex w-75 justify-content-around align-items-center">
        <div class="text-left d-flex align-items-center my-3 border-top border-bottom py-2 px-2">
          Enabled by data from
          <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/resources/gisaid.png" class="gisaid ml-2" alt="GISAID Initiative" />
          </a>
        </div>
      </div>

      <div class="w-75 mt-2 text-left">The <a href="https://cvisb.org/" rel="noreferrer" target="_blank">CViSB Team</a> at Scripps Research is tracking the prevalence of SARS-CoV-2 (hCoV-19) variants in locations with lineage and mutation reports,
        updated daily.
        Choose a country or division (state) to create a custom report.
      </div>
      <div class="d-flex align-items-center justify-content-between my-2">
        <div id="date-updated" class="mr-2">
          <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
            <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
          </small>
        </div>
        <div id="sequence-count" class="ml-2 mr-5 text-highlight" v-if="total">
          {{total}} sequences
        </div>
      </div>
    </div>
    <div class="d-flex flex-column justify-content-center align-items-center my-3">
      <router-link :to="{name:'SituationReportCaveats'}" class="btn btn-main-outline">How to interpret these reports</router-link>
    </div>

    <ReportLogos class="my-4"/>



  </div>
  <section id="report-list" class="text-left">
    <CustomLocationForm :curated="curated" />
  </section>

  <ReportAcknowledgements />
</div>
</template>

<script>
import Vue from "vue";

import ReportLogos from "@/components/ReportLogos.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";

import CustomLocationForm from "@/components/CustomLocationForm.vue";

import { nest } from "d3";

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
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner);

import {
  getReportList,
  getSequenceCount
} from "@/api/genomics.js";

import {
  mapState
} from "vuex";

export default {
  name: "LocationReports",
  components: {
    ReportLogos,
    ReportAcknowledgements,
    CustomLocationForm,
    FontAwesomeIcon
  },
  data() {
    return {
      // reminder: must be the raw verison of the file
      curatedSubscription: null,
      totalSubscription: null,
      lastUpdated: null,
      total: null,
      curated: null
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors", "reportloading"])
  },
  mounted() {
    this.curatedSubscription = getReportList(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.dateUpdated;
      const lineages = results.md.filter(d => d.key == "lineage");
      if(lineages.length == 1){
        this.curated = nest()
        .key(d => d.variantType)
        .rollup(values => values.map(d => `${d.mutation_name} lineage`))
        .entries(lineages[0].values)
      }

      console.log(this.curated)
    })
    this.totalSubscription = getSequenceCount(this.$genomicsurl, null, null, true).subscribe(total => {
      this.total = total;
    })
  },
  beforeDestroyed() {
    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }

    if (this.totalSubscription) {
      this.totalSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

.gisaid {
    height: 25px;
}

.bg-image {
  background-repeat: space;
  background-size: contain;
  // opacity: 0.75;
}
</style>
