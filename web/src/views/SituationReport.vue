<template>
<div class="my-4 mx-4 half-page text-left" v-if="mutationName">
  <!-- LOADING -->
  <div v-if="reportloading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>

  <!-- CHANGE LOCATION MODAL -->
  <div id="change-locations-modal" class="modal fade">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header border-secondary">
          <h5 class="modal-title" id="exampleModalLabel">Select report locations</h5>
          <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="mb-3 py-3 border-bottom border-secondary">
            <h6 class="text-muted text-underline m-0">Current locations</h6>
            <button class="btn btn-accent-flat text-muted px-2 py-1 mr-2" v-for="(location, lIdx2) in currentLocs" :key="lIdx2" @click="removeLocation(lIdx2)">
              {{ location }}
              <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
            </button>
          </div>

          <div class="py-3 border-bottom">
            <div v-if="ctry2Add.length" class="my-3">
              <h6 class="text-sec text-underline m-0">Countries to add</h6>
              <button class="btn btn-main-flat px-2 py-1 mr-2" v-for="(country, cIdx) in ctry2Add" :key="cIdx" id="new-countries" @click="removeCountry2Add(cIdx)">
                {{ country }}
                <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
              </button>
            </div>

            <div class="d-flex align-items-center justify-content-center my-3" id="select-country">
              <TypeaheadSelect :queryFunction="queryCountry" @selected="updateSelected" :apiUrl="this.$genomicsurl" placeholder="Add country" totalLabel="total sequences" />
            </div>
          </div>

          <div class="py-3">
            <div v-if="div2Add.length" class="my-3">
              <h6 class="text-sec text-underline m-0">Divisions (States/Provinces) to add</h6>
              <button class="btn btn-main-flat px-2 py-1 mr-2" v-for="(division, dIdx) in div2Add" :key="dIdx" id="new-divisions" @click="removeDivision2Add(cIdx)">
                {{ division }}
                <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
              </button>
            </div>


            <div class="d-flex align-items-center justify-content-center my-3" id="select-division">
              <TypeaheadSelect :queryFunction="queryDivision" @selected="updateDivision" :apiUrl="this.$genomicsurl" placeholder="Add division" totalLabel="total sequences" />
            </div>
          </div>
        </div>


        <div class="modal-footer border-secondary">
          <button type="button" class="btn" @click="clearNewLocations">Clear additions</button>
          <button type="button" class="btn btn-primary" @click="selectNewLocations" data-dismiss="modal">Save changes</button>

        </div>
      </div>
    </div>
  </div>

  <template v-if="hasData">
    <!-- SOCIAL MEDIA SHARE -->
    <ShareReport title="title" url="url" />

    <!-- HEADER TITLE -->
    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column align-items-start">
        <h1 class="m-0">{{ title }}</h1>
        <small class="text-muted my-1" v-if="reportMetadata && reportMetadata.mutation_synonyms"><span>a.k.a. </span>
          <span v-for="(synonym, sIdx) in reportMetadata.mutation_synonyms" :key="sIdx">
            <b>{{ synonym }}</b>
            <span v-if="sIdx < reportMetadata.mutation_synonyms.length - 1">, </span></span>
        </small>

        <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
          <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
        </small>
      </div>
      <div class="d-flex flex-column align-items-end justify-content-between">
        <div class="d-flex align-items-center">
          Enabled by data from
          <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/resources/gisaid.png" class="gisaid ml-1" alt="GISAID Initiative" />
          </a>
        </div>
        <router-link :to="{name:'SituationReportCaveats'}" class="btn btn-main-outline mt-3 p-0 px-1"><small>How to interpret these reports</small></router-link>
        <!-- <small class="mr-1"><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
      </div>
    </div>

    <!-- LOGOS -->
    <ReportLogos class="mb-4" />

    <!-- REPORT -->
    <div class="row">
      <section id="intro" class="col-sm-6 col-md-7 pr-4">
        <div id="about-variant" class="mb-3 mx-4" v-if="reportMetadata">
          <div class="d-flex flex-wrap align-items-center justify-content-end" v-if="reportMetadata">
            <small class="mx-3 text-muted" v-if="reportMetadata.location_first_identified"><em>First identified in {{ reportMetadata.location_first_identified }}</em></small>
            <div class="VOC" v-if="reportMetadata.variantType == 'Variant of Concern'">Variant of Concern</div>
            <div class="VOI" v-if="reportMetadata.variantType == 'Variant of Interest'">Variant of Interest</div>
          </div>

        </div>
        <!-- INTRO TEXT - OVERVIEW -->
        <div class="d-flex flex-column mb-3">
          <span v-html="reportDescription" class="font-size-2"></span>

          <router-link :to='{ hash: "#resources" , query: this.$route.query }'>
            <small>View publications, datasets, and more related to {{mutationName}}</small>
          </router-link>
        </div>

        <!-- CHARACTERISTIC MUTATIONS -->
        <div class="mt-4" id="definition">
          <CharacteristicMutations :mutationName="mutationName" :mutations="mutations" :definitionLabel="definitionLabel" />
        </div>

        <!-- KEY INSIGHTS -->
        <!-- <div class="mt-4">
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
        </div> -->

        <!-- NEW TODAY -->
        <div class="mt-4">
          <h4>What's new today</h4>
          <table>
            <tr class="border-bottom">
              <th colspan="2">
                New sequences identified
              </th>
            </tr>
            <tr>
              <td>
                Worldwide
              </td>
              <td>
                {{ newTodayGlobal.toLocaleString() }}
              </td>
            </tr>
            <!-- <tr v-for="(location, lIdx2) in selectedLocations" :key="lIdx2">
              <td>
                {{ location.name }}
              </td>
              <td>
                XXX
              </td>
            </tr> -->
          </table>
        </div>
      </section>

      <!-- RIGHT: SUMMARY BOX -->
      <section id="summary" class="d-flex flex-column justify-content-between col-sm-6 col-md-5 p-3 pr-4 summary-box bg-main text-light">
        <ReportSummary :dateUpdated="dateUpdated" :totalLineage="totalLineage" :mutationName="mutationName" :reportType="reportType" :globalPrev="globalPrev" :locationTotals="locationTotals" :countries="countries" />
      </section>
    </div>


    <!-- DAILY PREVALENCE -->
    <section class="vis my-3 py-3 d-flex flex-column align-items-center" id="longitudinal">
      <h4 class="mb-0">Average daily {{mutationName}} prevalence</h4>
      <small class="text-muted mb-2">Based on reported sample collection date</small>
      <div id="location-buttons" class="d-flex flex-wrap">
        <button class="btn btn-tab my-2" :class="{'btn-active': location.isActive}" v-for="(location, lIdx) in selectedLocations" :key="lIdx" @click="changeLocation(location)">{{ location.name }}</button>
        <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-locations-modal">Change locations
          <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
        </button>
      </div>
      <ReportPrevalence :data="prevalence" :mutationName="mutationName" :location="activeLocation" />
    </section>

    <!-- GEOGRAPHIC PREVALENCE -->
    <section class="my-4 d-flex flex-column align-items-center" id="geographic">
      <div class="d-flex">
        <h4 class="mb-0">Cumulative {{mutationName}} prevalence</h4>
        <button class="btn btn-tab" :class="{'btn-active': location.isActive}" v-for="(location, cIdx) in choroplethCountries" :key="cIdx" @click="changeChoropleth(location)">{{ location.name }}</button>
      </div>
      <small class="text-muted mb-3">Since first identification</small>
      <ReportChoropleth :data="choroData" :mutationName="mutationName" :location="choroLocation" />
      <ReportPrevalenceByLocation :data="choroData" :mutationName="mutationName" class="mt-2" />
    </section>

    <!-- RESOURCES -->
    <section id="resources">
      <ReportResources :mutationName="mutationName" :searchTerms="searchTerms" />
    </section>

    <!-- METHODOLOGY -->
    <section class="mt-3 mb-5">
      <h4>Methodology</h4>
      <ReportMethodology :dateUpdated="dateGenerated" />
      <!-- <small class=""><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
      <Warning class="mt-2" :text="disclaimer" />
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
  </template>
  <div v-else-if="reportloading" class="half-page">
    <div class="d-flex flex-column align-items-start">
      <h1 class="m-0">{{ title }}</h1>
      <p class="my-5">
        Calculating prevalence of {{reportType}} {{mutationName}}. Please be patient.
      </p>
    </div>
  </div>
  <div v-else>
    <div class="d-flex flex-column align-items-start">
      <h1 class="m-0">{{ title }}</h1>
      <p class="my-5">
        No data found for {{reportType}} <b>{{mutationName}}</b>. Please check that you have specified the {{reportType}} properly.
      </p>
    </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";

import ReportLogos from "@/components/ReportLogos.vue";
import ReportMethodology from "@/components/ReportMethodology.vue";
import CharacteristicMutations from "@/components/CharacteristicMutations.vue";
import Warning from "@/components/Warning.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import ReportPrevalence from "@/components/ReportPrevalence.vue";
import ReportPrevalenceByLocation from "@/components/ReportPrevalenceByLocation.vue";
import ReportChoropleth from "@/components/ReportChoropleth.vue";
import ReportResources from "@/components/ReportResources.vue";
import ShareReport from "@/components/ShareReport.vue";
import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import ReportSummary from "@/components/ReportSummary.vue";

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
  faTrashAlt,
  faPlusCircle
} from "@fortawesome/free-solid-svg-icons";


library.add(faClock, faTrashAlt, faPlusCircle);

import {
  mapState
} from "vuex";

import {
  getReportData,
  getCuratedMetadata,
  getTemporalPrevalence,
  updateLocationData,
  findCountry,
  findDivision,
  getLocationPrevalence
} from "@/api/genomics.js";

import {
  timeFormat
} from "d3";

export default {
  name: "SituationReport",
  components: {
    ReportLogos,
    ReportMethodology,
    CharacteristicMutations,
    FontAwesomeIcon,
    Warning,
    ReportAcknowledgements,
    ReportPrevalence,
    ReportPrevalenceByLocation,
    ReportChoropleth,
    ReportResources,
    ShareReport,
    ReportSummary,
    TypeaheadSelect
  },
  props: {
    country: {
      type: Array,
      default: () => ["United States of America", "United Kingdom"]
    },
    division: {
      type: Array,
      default: () => ["California"]
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
    genericDescription() {
      return `Concerns surrounding a new strains of SARS-CoV-2 (hCov-19), the virus behind the COVID-19 pandemic, have been developing. This report outlines the prevalence of ${this.mutationName} in the world, how it is changing over time, and how its prevalence varies across different locations.`
    },
    selectedLocations() {
      let ctries = typeof(this.country) == "string" ? [this.country] : this.country;
      ctries = ctries.map(d => {
        return {
          name: d,
          isActive: false,
          type: "country"
        };
      })

      let divisions = typeof(this.division) == "string" ? [this.division] : this.division;
      divisions = divisions.map(d => {
        return {
          name: d,
          isActive: false,
          type: "division"
        };
      })

      // always have the world there too.
      let allLocs = [{
        name: "Worldwide",
        isActive: true
      }];

      return (allLocs.concat(ctries, divisions));
    },
    choroplethCountries() {
      let ctries = typeof(this.country) == "string" ? [this.country] : this.country;
      ctries = ctries.map(d => {
        return {
          name: d,
          isActive: false
        };
      })

      // always have the world there too.
      let allLocs = [{
        name: "Global",
        isActive: true
      }];

      return allLocs.concat(ctries);
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
      dateGenerated: "XX XXX XXXX",
      disclaimer: null,

      // Changing locations
      activeLocation: "the world",
      queryCountry: null,
      queryDivision: null,
      currentLocs: null, // placeholder for current locations
      ctry2Add: [], // array to store new locations to add
      div2Add: [], // array to store new locations to add

      // subscriptions
      dataSubscription: null,
      curatedSubscription: null,
      temporalSubscription: null,
      choroSubscription: null,
      hasData: false,

      // curated values
      searchTerms: null,
      reportDescription: null,

      // data
      dateUpdated: null,
      reportMetadata: null,
      choroLocation: "country",
      choroData: null,
      countries: null,
      states: [],
      locationTotals: null,
      totalLineage: null,
      globalPrev: null,
      newTodayGlobal: null,
      prevalence: []
    }
  },
  mounted() {
    this.currentLocs = this.selectedLocations.map(d => d.name).filter(d => d != "Worldwide");
    this.queryCountry = findCountry;
    this.queryDivision = findDivision;
    this.disclaimer =
      `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the ${this.reportType} but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`;

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
        this.mutationName = this.$options.filters.capitalize(this.$route.query.pangolin);
        this.reportType = "lineage";
        this.mutationVar = "pangolin_lineage";
      } else if (this.$route.query.muts) {
        this.mutationName = this.$route.query.muts.join(" ");
        this.reportType = "mutation";
        this.mutationVar = "mutations";
      }

      if (this.mutationName) {
        this.dataSubscription = getReportData(this.$genomicsurl, this.selectedLocations, this.mutationVar, this.mutationName).subscribe(results => {
          console.log(results)
          // worldwide stats
          this.globalPrev = results.globalPrev.proportion_formatted;
          this.totalLineage = results.globalPrev.lineage_count_formatted;
          this.newTodayGlobal = results.mostRecent;
          this.newTodayGlobal = results.mostRecent.date_count;
          this.dateUpdated = results.mostRecent.dateFormatted;

          // longitudinal data: prevalence over time
          this.prevalence = results.longitudinal;

          // recent data by country & countries with that lineage.
          this.countries = results.byCountry.filter(d => d.cum_lineage_count).map(d => d.name);
          this.choroData = results.byCountry;
          this.locationTotals = results.byCountry.filter(d => this.selectedLocations.map(loc => loc.name).includes(d.name));

          this.hasData = results.longitudinal.length || results.byCountry.length;
          this.mutations = results.mutations;

          if (results.md) {
            this.reportMetadata = results.md;
            this.searchTerms = results.md.searchTerms;
            this.reportDescription = results.md.description ? results.md.description : this.genericDescription;
            this.disclaimer = results.md.disclaimer ? results.md.disclaimer : this.disclaimer;
          } else {
            this.searchTerms = [this.mutationName];
            this.reportDescription = this.genericDescription;
          }
        })
      }
    },
    getTemporalData(location) {
      console.log(location)
      this.temporalSubscription = getTemporalPrevalence(this.$genomicsurl, location.name, this.mutationName, this.mutationVar, location.type, true).subscribe(data => {
        this.prevalence = data;
      });
    },
    removeLocation(idx) {
      this.currentLocs.splice(idx, 1);
    },
    removeCountry2Add(idx) {
      this.ctry2Add.splice(idx, 1);
    },
    removeDivision2Add(idx) {
      this.div2Add.splice(idx, 1);
    },
    clearNewLocations() {
      this.ctry2Add = [];
      this.div2Add = [];
    },
    changeChoropleth(location) {
      this.choroplethCountries.forEach(d => {
        d.isActive = false;
      })
      location.isActive = true;

      this.choroSubscription = getLocationPrevalence(this.$genomicsurl, this.mutationName, this.mutationVar, location.name).subscribe(results => {
        if (location.name == "Global") {
          this.choroLocation = "country"
        } else {
          this.choroLocation = location.name;
        }

        this.choroData = results;
      })

    },
    selectNewLocations() {
      let newCountries = this.country.concat(this.ctry2Add);
      let newDivisions = this.div2Add;

      const queryParams = this.$route.query;

      this.locationTotals = this.choroData.filter(d => newCountries.includes(d.name));

      this.$router.push({
        name: "MutationReport",
        path: "/report2.0",
        query: {
          country: newCountries,
          division: newDivisions,
          pangolin: queryParams.pangolin,
          muts: queryParams.muts
        }
      })
    },
    changeLocation(location) {
      this.selectedLocations.forEach(d => {
        d.isActive = false;
      })

      location.isActive = !location.isActive;
      this.activeLocation = location.name;

      this.getTemporalData(location);
    },
    downloadMutations() {
      console.log("muts")
    },
    updateSelected(selected) {
      this.ctry2Add.push(selected.name);
    },
    updateDivision(selected) {
      this.div2Add.push(selected.name);
    }
  },
  destroyed() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }

    if (this.choroSubscription) {
      this.choroSubscription.unsubscribe();
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
</style>
