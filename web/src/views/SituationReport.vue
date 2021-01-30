<template>
<div class="my-4 mx-4 full-page text-left">

  <!-- LOADING -->
  <div v-if="reportloading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>

  <!-- SOCIAL MEDIA SHARE -->
  <ShareReport title="title" url="url" />

  <!-- HEADER TITLE -->
  <div class="d-flex justify-content-between align-items-center">
    <div class="d-flex flex-column align-items-start">
      <h1 class="m-0">{{ title }}</h1>
      <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
      </small>
    </div>

    <div class="d-flex flex-column align-items-end">
      <div class="d-flex align-items-center">
        Enabled by data from
        <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
          <img src="@/assets/resources/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
        </a>
      </div>
      <!-- <small class="mr-1"><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
    </div>
  </div>

  <!-- LOGOS -->
  <ReportLogos class="mb-4" />


  <div class="row">
    <section id="intro" class="col-sm-6 col-md-8 pr-4">
      <!-- INTRO TEXT - OVERVIEW -->
      <div class="font-size-2">
        XXXXX Concerns surrounding a new strain of SARS-CoV-2, the virus behind the COVID-19 pandemic, have been developing. <b class="text-highlight">B.1.1.7</b> lineage, also known as <b>Variant of Concern 202012/01 (VOC-202012/01)</b> or
        <b>20B/501Y.V1</b>, was first identified in the UK in early December 2020 and has since been detected in the US and other counties. This is of growing concern because it has shown to be significantly more transmissible than other variants.
        XXXXX
      </div>
      <router-link :to='{hash: "#resources"}'>
        <small>View publications, datasets, and more related to {{mutationName}}</small>
      </router-link>

      <!-- CHARACTERISTIC MUTATIONS -->
      <div class="mt-4" id="definition">
        <h4 class="">{{ definitionLabel }}</h4>

        <small class="">
          <button class="btn btn-main-outline py-1 collapsed" data-toggle="collapse" href="#mutation-table" aria-expanded="false" aria-controls="mutation-table">
            <span class="if-collapsed">View</span>
            <span class="if-not-collapsed">Hide</span>
            mutation table
          </button>
        </small>

        <small class="ml-2 my-1"><a @click="downloadMutations" href="">Download mutation list</a></small>

        <SARSMutationMap mutationKey="B.1.1.7" />

        <div class="collapse ml-2" id="mutation-table">
          <MutationTable :mutations="mutations" />
        </div>
      </div>

      <!-- KEY INSIGHTS -->
      <div class="mt-4">
        <h4>Key Insights</h4>
        <ul>
          <li>
            XXXX {{ mutationName }} has been <b>increasing/decreasing</b> in prevalence over the past two weeks.
          </li>
          <li>
            XXXX Its apparent prevalence is higher in rest of the world compared to the United States or San Diego.
          </li>
          <li>
            XXXX Experimental data suggests it is more transmissable than other SARS-CoV-2 variants.
          </li>
        </ul>
      </div>

      <!-- NEW TODAY -->
      <div class="mt-4">
        <h4>What's new today</h4>
        <table>
          <tr class="border-bottom">
            <th colspan="2">
              New sequences identified
            </th>
          </tr>
          <tr v-for="(location, lIdx2) in selectedLocations" :key="lIdx2">
            <td>
              {{ location.name }}
            </td>
            <td>
              XXX
            </td>
          </tr>
        </table>
      </div>
    </section>

    <!-- RIGHT: SUMMARY BOX -->
    <section id="summary" class="d-flex flex-column justify-content-between col-sm-6 col-md-4 p-3 pr-4 summary-box bg-main text-light">
      <h3>Summary</h3>
      <div class="summary-counts mb-3">
        As of {{ dateUpdated }}, <b>{{ totalSeqs.toLocaleString() }}</b> sequences in the {{ mutationName }} lineage have been detected:

        <!-- PREVALENCE SUMMARY TABLE -->
        <table class="border-bottom line-height-1 mt-2 w-100">
          <thead>
            <tr class="border-bottom">
              <th>
                location
                <font-awesome-icon class="ml-1 font-size-small" :icon="['fas', 'sync']" />
                <!-- sync, globe-americas, map-marked-alt -->
              </th>
              <th class="text-center">
                sequence count
              </th>
              <th class="text-center">
                apparent prevalence<sup>*</sup>
              </th>
            </tr>
          </thead>
          <tbody class="checkbook">
            <tr>
              <td>
                Worldwide
              </td>
              <td class="text-center">
                XXX
                <!-- {{ totalSeqs.toLocaleString() }} -->
              </td>
              <td class="text-center">
                XXXXX
              </td>
            </tr>
            <tr v-for="(location, lIdx) in locationTotals" :key="lIdx">
              <td>
                {{ location.name }}
              </td>
              <td class="text-center">
                {{ location.cum_lineage_count.toLocaleString() }}
              </td>
              <td class="text-center">
                {{ location.proportion_formatted }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="d-flex justify-content-between">
          <small class="bright-hyperlink"><a href="#longitudinal">view change over time</a></small>
          <small class="bright-hyperlink"><a href="#longitudinal">change locations</a></small>
        </div>
        <div class="line-height-1 my-2">
          <small><em><sup>*</sup> Apparent prevalence is the ratio of the sequences containing {{mutationName}} to all sequences collected since the identification of {{mutationName}}</em> </small>
        </div>
      </div>

      <!-- GEO SUMMARY -->
      <div id="geo-summary" v-if="countries">
        The strain has been detected in at least <b>{{ countries.length }} {{countries.length === 1 ? "country" : "countries"}}</b> and <b> {{ "XXXX" }} U.S. {{states.length === 1 ? "state" : "states"}}</b>.
        <CountryMap :countries="countries" :width="400" :showNames="false" />
        <small class="bright-hyperlink"><a href="#geographic">view geographic prevalence</a></small>
      </div>
    </section>
  </div>


  <!-- DAILY PREVALENCE -->
  <section class="vis my-3 py-3 d-flex flex-column align-items-center" id="longitudinal">
    <h4 class="mb-0">Average daily {{mutationName}} prevalence</h4>
    <small class="text-muted mb-2">Based on reported sample collection date</small>
    <div id="location-buttons">
      <button class="btn btn-tab" :class="{'btn-active': location.isActive}" v-for="(location, lIdx) in selectedLocations" :key="lIdx" @click="changeLocation(location)">{{ location.name }}</button>
      <button class="btn btn-main-outline">Change locations
        <font-awesome-icon class="ml-1 font-size-small" :icon="['fas', 'sync']" />
      </button>
    </div>
    <ReportPrevalence :data="prevalence" :mutationName="mutationName" />
  </section>

  <!-- GEOGRAPHIC PREVALENCE -->
  <section class="my-4 d-flex flex-column align-items-center" id="geographic">
    <h4 class="mb-0">Cumulative {{mutationName}} prevalence by country</h4>
    <small class="text-muted mb-3">Since first identification</small>
    <ReportChoropleth :data="ctryData" :mutationName="mutationName" />
    <ReportPrevalenceByLocation :data="ctryData" :mutationName="mutationName" class="mt-2" />
  </section>

  <!-- RESOURCES -->
  <section id="resources">
    <ReportResources :mutationName="mutationName" :searchTerms="searchTerms" />
  </section>

  <!-- METHODOLOGY -->
  <section class="my-3">
    <h4>Methodology</h4>
    <ReportMethodology />
    <!-- <small class=""><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
    <Warning class="mt-2"
      text="B.1.1.7 genomes in the US were identified by S-gene target failures (SGTF) in community-based diagnostic PCR testing. Since this is not an unbiased approach, it does not indicate the true prevalence of the B117 lineage in the US.  <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>" />
  </section>

  <!-- CITATION -->
  <section class="my-3">
    <h4 class="">Citing this report</h4>
    <p class="m-0">
      <b>{{ mutationName }} {{ reportType | capitalize }} Report</b>. {{ mutationAuthors }}. outbreak.info, (available at {{ url }}). Accessed {{ today }}.
    </p>
    <ShareReport :title="title" :url="url" />
  </section>

  <!-- ACKNOWLEDGEMENTS -->
  <ReportAcknowledgements class="border-top pt-3" />
</div>
</template>

<script>
import Vue from "vue";

import ReportLogos from "@/components/ReportLogos.vue";
import ReportMethodology from "@/components/ReportMethodology.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";
import CountryMap from "@/components/CountryMap.vue";
import Warning from "@/components/Warning.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import ReportPrevalence from "@/components/ReportPrevalence.vue";
import ReportPrevalenceByLocation from "@/components/ReportPrevalenceByLocation.vue";
import ReportChoropleth from "@/components/ReportChoropleth.vue";
import ReportResources from "@/components/ReportResources.vue";
import ShareReport from "@/components/ShareReport.vue";
import MutationTable from "@/components/MutationTable.vue";

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
  faSync
} from "@fortawesome/free-solid-svg-icons";


library.add(faClock, faSync);

import {
  mapState
} from "vuex";

import {
  getReportData,
  getCuratedMetadata,
  getTemporalPrevalence
} from "@/api/genomics.js";

import {
  timeFormat
} from "d3";

export default {
  name: "SituationReport",
  components: {
    ReportLogos,
    ReportMethodology,
    SARSMutationMap,
    FontAwesomeIcon,
    CountryMap,
    Warning,
    ReportAcknowledgements,
    ReportPrevalence,
    ReportPrevalenceByLocation,
    ReportChoropleth,
    ReportResources,
    ShareReport,
    MutationTable
  },
  props: {
    location: {
      type: Array,
      default: () => ["United States of America", "United Kingdom"]
    },
    muts: Array,
    pangolin: String
  },
  computed: {
    ...mapState("admin", ["mutationAuthors", "reportloading"]),
    title() {
      return (`${this.mutationName} ${this.$options.filters.capitalize(this.reportType)} Report`)
    },
    definitionLabel() {
      return this.reportType == "lineage" ? "Characteristic mutations in lineage" : "List of mutations";
    },
    selectedLocations() {
      const locations = typeof(this.location) == "string" ? [this.location] : this.location;
      // always have the world there too.
      const allLocs = [{
        name: "Worldwide",
        isActive: true
      }];

      return (allLocs.concat(locations.map(d => {
        return {
          name: d,
          isActive: false
        };
      })));
    }
  },
  data() {
    return {
      // report details
      today: null,
      url: null,
      mutationName: null,
      mutationVar: null,
      mutations: null,
      reportType: null,
      lastUpdated: "XX day",
      dateUpdated: "XXXXX January 2021",

      // subscriptions
      dataSubscription: null,
      curatedSubscription: null,
      temporalSubscription: null,

      // curated values
      searchTerms: null,

      // data
      ctryData: null,
      countries: null,
      states: [],
      locationTotals: null,
      totalSeqs: 0,
      prevalence: []
    }
  },
  mounted() {
    // Get date for the citation object
    const formatDate = timeFormat("%e %B %Y");
    var currentTime = new Date();
    this.today = formatDate(currentTime);

    // set URL for sharing, etc.
    this.$nextTick(function() {
      const location = window.location;
      this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;
    })

    this.setupReport();
  },
  methods: {
    setupReport() {
      if (this.$route.query.pangolin) {
        this.mutationName = this.$route.query.pangolin;
        this.reportType = "lineage";
        this.mutationVar = "pangolin_lineage";
      } else if (this.$route.query.muts) {
        this.mutationName = this.$route.query.muts.join(" ");
        this.reportType = "mutation";
        this.mutationVar = "mutations";
      }

      this.dataSubscription = getReportData(this.$genomicsurl, this.selectedLocations, this.mutationVar, this.mutationName).subscribe(results => {
        console.log(results)
        // longitudinal data: prevalence over time
        this.prevalence = results.longitudinal;

        // recent data by country & countries with that lineage.
        this.countries = results.byCountry.filter(d => d.cum_lineage_count).map(d => d.country);
        this.ctryData = results.byCountry;
        this.locationTotals = results.byCountry.filter(d => this.selectedLocations.map(d => d.name).includes(d.country));

        if (results.md) {
          // this.reportMetadata = results.md;
          this.searchTerms = results.md.searchTerms;
          this.mutations = results.md.mutations;
        } else {
          this.searchTerms = [this.mutationName];
        }
      })
    },
    getTemporalData(location) {
      this.temporalSubscription = getTemporalPrevalence(this.$genomicsurl, location, this.mutationName, this.mutationVar, true).subscribe(data => {
        this.prevalence = data;
      });
    },
    changeLocation(location) {
      this.selectedLocations.forEach(d => {
        d.isActive = false;
      })

      location.isActive = !location.isActive;
      this.getTemporalData(location.name);
    },
    downloadMutations() {
      console.log("muts")
    }
  },
  destroyed() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    if (this.curatedSubscription) {
      this.curatedSubscription.unsubscribe();
    }

    if (this.temporalSubscription) {
      this.temporalSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.gisaid {
    height: 25px;
}

.bright-hyperlink a {
    color: #70d3ff;
}

.checkbook td {
    padding: 0.5rem;
}

.checkbook tr:nth-child(2n+1) {
    background-color: lighten($primary-color, 7%);
}

.font-size-2 {
    font-size: 1.25rem;
}

.font-size-small {
    font-size: small;
}

.btn-active {
    background-color: $primary-color;
    color: white;
}

.resource-type {
    opacity: 0.6;
    font-weight: 700;
    text-transform: uppercase;
}

[data-toggle="collapse"] {
    &.collapsed .if-not-collapsed {
        display: none;
    }
    &:not(.collapsed) .if-collapsed {
        display: none;
    }
}
</style>
