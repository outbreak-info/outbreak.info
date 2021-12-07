<template>
<div>
  <div class="bg-sec__darker py-4 text-light border-top location-banner">
    <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
    <h1 class="m-0 font-weight-bold location-header">Watch List</h1>
  </div>
  <div class="my-2 mx-4 px-4">
    <!-- LOADING -->
    <div v-if="reportloading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <div class="my-2">
      <img src="@/assets/growth-fit.svg" alt="growth curve" class="bg-image" />
      <div class="d-flex flex-column justify-content-center align-items-center">
        <div class="d-flex w-75 justify-content-around align-items-center">
          <div class="text-left d-flex align-items-center my-4 border-top border-bottom py-2 px-2 fa-lg">
            Enabled by data from
            <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
              <img src="@/assets/resources/gisaid.png" class="gisaid ml-2" alt="GISAID Initiative" />
            </a>
          </div>
        </div>

        <div class="w-75 mt-2 text-left">The <a href="https://cvisb.org/" rel="noreferrer" target="_blank">CViSB Team</a> at Scripps Research is estimating the growth rate of SARS-CoV-2 (hCoV-19) mutants to flag mutations worth watching.
          Unlike the <router-link :to="{name: 'SituationReports'}">Variant & Mutant Tracker</router-link> or  <router-link :to="{name: 'LocationReports'}">Location Tracker</router-link>, these reports are updated <b>weekly</b>.
          Choose a country or division (state) to create a custom report.
        </div>
        <div class="d-flex align-items-center justify-content-between my-3">
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
      <div class="d-flex align-items-center justify-content-end text-sec my-1">
        <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
        <router-link :to="{name:'SituationReportCaveats'}" class="text-sec">How to interpret these reports</router-link>
      </div>

      <!-- <ReportLogos class="my-4"/> -->



    </div>
    <section id="report-list" class="text-left">
      <CustomLocationForm :includeMutations="false" />
        <WatchListTable :location="location"/>

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
import WatchListTable from "@/components/WatchListTable.vue";

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
  getDateUpdated,
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
    WatchListTable,
    FontAwesomeIcon
  },
  data() {
    return {
      // reminder: must be the raw verison of the file
      updatedSubscription: null,
      totalSubscription: null,
      lastUpdated: null,
      total: null,
      location: "New York"
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors", "reportloading"])
  },
  mounted() {
    this.updatedSubscription = getDateUpdated(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.lastUpdated;
    })

    this.totalSubscription = getSequenceCount(this.$genomicsurl, null, true).subscribe(total => {
      this.total = total;
    })
  },
  beforeDestroyed() {
    if (this.updatedSubscription) {
      this.updatedSubscription.unsubscribe();
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

$location-color: #8CD17D;
.location-banner {
    border-width: 0;
    border-style: solid;
    background: linear-gradient(to left, $primary-color 0%, $location-color 50%, $primary-color 100%) left bottom darken($primary-color,10%) no-repeat;
    background-size: 100% 7px;
    /* if linear-gradient, we need to resize it */
}

.location-header {
    color: lighten($location-color, 12%);
}
.bg-image {
    width: 25%;
    position: absolute;
    left: 0;
    opacity: 0.55;
    z-index: 0;
}
</style>
