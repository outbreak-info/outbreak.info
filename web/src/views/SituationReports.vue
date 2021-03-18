<template>
<div>
  <div class="bg-main__darker mutation-banner border-top py-4">
    <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
    <h1 class="m-0 mutation-header font-weight-bold">Lineage <span class="mx-2">|</span> Mutation Tracker</h1>
  </div>

  <div class="my-2 mx-4 px-4">
    <!-- LOADING -->
    <div v-if="reportloading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <div class="mb-1">
      <img src="@/assets/sars-virus.svg" alt="map" class="bg-image" />
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
          daily.
          Access curated reports below, or create your own <a href="#custom-report">custom reports</a> with any combination of lineages and/or mutations.
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
        <div class="d-flex flex-wrap">
        <router-link :to="{ hash: '#' + group.key.replace(' + ', '_') }" v-for="(group, i) in reports" :key="'btn'+i"><button class="btn btn-main-outline my-3 mr-3">{{group.key}}</button></router-link>
        <router-link :to="{ hash: '#custom-report' }"><button class="btn btn-main my-3 mr-3">Create custom report</button></router-link>
        </div>

      </div>
    </div>

    <section id="report-list" class="text-left">
      <!-- lineage or mutation -->
      <div class="mutation-group mb-5" v-for="(group, i) in reports" :key="i" :id="group.key.replace(' + ', '_')">
        <div class="d-flex justify-content-between">
          <h2 class="mb-0">{{ group.key | capitalize }} Reports</h2>
          <div class="d-flex align-items-center text-sec" v-if="i === 0">
            <font-awesome-icon class="mr-2" :icon="['fas', 'info-circle']" />
            <router-link :to="{name:'SituationReportCaveats'}" class="text-sec">How to interpret these reports</router-link>
          </div>
        </div>

        <small class="text-highlight" v-html="getReportType(group.key)"></small>

        <!-- report cards (heh) -->
        <div class="row mt-3">
          <div class="col-sm-12 col-md-12 col-lg-12 mb-3 d-flex report-group" v-for="(report, rIdx) in group.values" :key="rIdx" id="mutation-report">
            <div class="w-100 p-3 card">
              <router-link :to="{name:'MutationReport', query: report.reportQuery }" class="no-underline">
                <ReportCard :report="report" />
              </router-link>

              <!-- MUTATION MAP / DEFINITION -->
              <div class="mutation-map flex-grow-1 px-2">
                <SARSMutationMap :lineageMutations="report.mutations" :mutationKey="report.mutation_name" />
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>

    <section id="custom-report" class="text-left">
      <h2 class="m-0 p-0">Create custom report</h2>
      <CustomReportForm />
    </section>

    <ReportAcknowledgements />
  </div>
</div>
</template>

<script>
import Vue from "vue";

// import ReportLogos from "@/components/ReportLogos.vue";
import ReportCard from "@/components/ReportCard.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";

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
  faSpinner, faInfoCircle
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faInfoCircle);

import {
  mapState
} from "vuex";

import {
  getReportList,
  getSequenceCount
} from "@/api/genomics.js";

export default {
  name: "SituationReports",
  components: {
    // ReportLogos,
    ReportCard,
    SARSMutationMap,
    CustomReportForm,
    ReportAcknowledgements,
    FontAwesomeIcon
  },
  computed: {
    ...mapState("admin", ["reportloading"])
  },
  methods: {
    getReportType(group) {
      return group.toLowerCase() == "lineage" ? "sequences classified as a particular <a href='https://cov-lineages.org/lineages.html' target='_blank'>PANGO lineage</a>" :
        (group.toLowerCase() == "lineage + mutation" ? "sequences classified as a particular <a href='https://cov-lineages.org/lineages.html' target='_blank'>PANGO lineage</a> with added mutations" :
          "sequences with a particular mutation(s)")
    }
  },
  data() {
    return {
      // reminder: must be the raw verison of the file
      curatedSubscription: null,
      totalSubscription: null,
      lastUpdated: null,
      total: null,
      reports: null
    }
  },
  mounted() {
    this.curatedSubscription = getReportList(this.$genomicsurl).subscribe(results => {
      this.lastUpdated = results.dateUpdated;
      this.reports = results.md;
    })
    this.totalSubscription = getSequenceCount(this.$genomicsurl, null, true).subscribe(total => {
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

$mutation-width: 275px;
.mutation-name {
    flex: 0 0 $mutation-width;
    width: $mutation-width;
    // flex-basis: $mutation-width !important;
    // flex-grow: 0 !important;
    // flex-shrink: 0 !important;
    // width: $mutation-width;
}

.mutation-map {
    min-width: 0;
}

.bg-image {
  width: 16%;
    position: absolute;
    left: 0;
    opacity: 0.55;
    z-index: -1;
}
</style>
