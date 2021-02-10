<template>
<div class="my-4 mx-5 half-page text-left" v-if="mutationName">
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
              {{ location.name }}
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
              <TypeaheadSelect :queryFunction="queryCountry" @selected="updateCountries" :apiUrl="this.$genomicsurl" placeholder="Add country" totalLabel="total sequences" />
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

  <!-- CHANGE PANGOLIN LINEAGE MODAL -->
  <div id="change-pangolin-modal" class="modal fade">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header border-secondary">
          <h5 class="modal-title" id="exampleModalLabel">Generate Lineage Report</h5>
          <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <div class="py-3">
            <p>
              Choose a lineage designated by <a href="https://cov-lineages.org/lineages.html" target="_blank">PANGO lineages</a>:
            </p>
            <div class="d-flex align-items-center justify-content-center my-3" id="select-division">
              <TypeaheadSelect :queryFunction="queryPangolin" @selected="updatePangolin" :apiUrl="this.$genomicsurl" :removeOnSelect="false" placeholder="select PANGO lineage" />
            </div>
          </div>
        </div>

        <div class="modal-footer border-secondary">
          <button type="button" class="btn" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-accent" @click="selectNewPangolin" data-dismiss="modal">Generate Report</button>
        </div>
      </div>
    </div>
  </div>

  <template v-if="hasData">
    <!-- SOCIAL MEDIA SHARE, BACK BTN -->
    <div class="d-flex align-items-center mb-2">
      <router-link :to="{ name: 'SituationReportsDemo'}">
        <button class="btn py-0 px-2 btn-grey-outline">back</button>
      </router-link>
      <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline" data-toggle="modal" data-target="#change-pangolin-modal">select lineage</button>
      <ShareReport title="title" url="url" />
    </div>


    <!-- HEADER TITLE -->
    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column align-items-start">
        <h1 class="m-0">{{ title }}</h1>
        <div class="d-flex my-1 align-items-center">
          <small class="text-muted mr-3" v-if="reportMetadata && reportMetadata.mutation_synonyms"><span>a.k.a. </span>
            <span v-for="(synonym, sIdx) in reportMetadata.mutation_synonyms" :key="sIdx">
              <b>{{ synonym }}</b>
              <span v-if="sIdx < reportMetadata.mutation_synonyms.length - 1">, </span></span>
          </small>
          <small class="text-muted" v-if="pangoLink">
            <a :href="pangoLink" target="_blank" rel="noreferrer">view on PANGO lineages</a>
          </small>

        </div>

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

          <div class="d-flex flex-wrap justify-content-center my-3">
            <a href="#longitudinal">
              <button class="btn btn-grey mr-3">
                <small>Daily prevalence</small>
              </button>
            </a>

            <a href="#geographic">
              <button class="btn btn-grey mr-3">
                <small>Geographic prevalence</small>
              </button>
            </a>
            <a href="#resources">
              <button class="btn btn-grey mr-3">
                <small>Publications</small>
              </button>
            </a>
          </div>
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
        <div class="my-4">
          <h4>What's new today</h4>
          <table>
            <tr class="border-bottom">
              <th colspan="2">
                New sequences submitted to GISAID
              </th>
            </tr>
            <tr v-for="(location, lIdx2) in newToday" :key="lIdx2">
              <td>
                {{ location.name }}
              </td>
              <td>
                {{ location.date_count_today }}
              </td>
            </tr>
          </table>
        </div>
      </section>

      <!-- RIGHT: SUMMARY BOX -->
      <section id="summary" class="d-flex flex-column justify-content-between col-sm-6 col-md-5 p-3 pr-4 summary-box bg-main text-light">
        <ReportSummary :dateUpdated="dateUpdated" :totalLineage="totalLineage" :mutationName="mutationName" :reportType="reportType" :globalPrev="globalPrev" :locationTotals="locationTotals" :countries="countries" :states="states" />
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
      <div class="d-flex align-items-center">
        <h4 class="mb-0 mr-3">Cumulative {{mutationName}} prevalence</h4>
        <div id="location-buttons" class="d-flex flex-wrap align-items-center">
          <button class="btn btn-tab" :class="{'btn-active': location.isActive }" v-for="(location, cIdx) in choroplethCountries" :key="cIdx" @click="changeLocation(location)">{{ location.name }}</button>
          <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-locations-modal">Change locations
            <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
          </button>
        </div>
      </div>
      <div v-if="selectedType != 'division'">
        <small class="text-muted mb-3">Since first identification</small>
        <ReportChoropleth class="mb-5" :data="choroData" :mutationName="mutationName" :location="selected" />
        <ReportPrevalenceByLocation :data="choroData" :mutationName="mutationName" class="mt-2" />
      </div>
      <div class="text-muted my-5" v-else>
        Maps are not available at this time for divisions. Please select worldwide or a country.
      </div>

    </section>

    <!-- RESOURCES -->
    <section id="resources">
      <ReportResources :mutationName="mutationName" :searchTerms="searchTerms" />
    </section>

    <!-- METHODOLOGY -->
    <section class="mt-3 mb-5">
      <h4>Methodology</h4>
      <ReportMethodology :dateUpdated="dateUpdated" />
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

import {
  uniq
} from "lodash";

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
  updateLocationData,
  findCountry,
  findDivision,
  findPangolin,
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
    country: Array,
    division: Array,
    muts: Array,
    pangolin: String,
    selected: {
      type: String,
      default: "Worldwide"
    },
    selectedType: {
      type: String,
      default: "country"
    }
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
      return `Concerns surrounding new strains of SARS-CoV-2 (hCov-19), the virus behind the COVID-19 pandemic, have been developing. This report outlines the prevalence of ${this.mutationName} in the world, how it is changing over time, and how its prevalence varies across different locations.`
    },
    pangoLink() {
      return this.mutationVar == "pangolin_lineage" ? `https://cov-lineages.org/lineages/lineage_${this.mutationName}.html` : null
    },
    selectedLocations() {
      if (!this.country && !this.division) {
        if (!this.selected || this.selected == "Worldwide") {
          return ([{
            name: "Worldwide",
            type: "world",
            isActive: true
          }, {
            name: "United States of America",
            type: "country",
            isActive: false
          }, {
            name: "California",
            type: "division",
            isActive: false
          }])
        } else {
          return ([{
            name: "Worldwide",
            type: "world",
            isActive: false
          }, {
            name: this.selected,
            type: this.selectedType,
            isActive: true
          }])
        }
      } else {
        let ctries;
        let divisions;
        if (this.country) {
          ctries = typeof(this.country) == "string" ? [this.country] : this.country;
          ctries = ctries.map(d => {
            return {
              name: d,
              isActive: d == this.selected && this.selectedType == "country",
              type: "country"
            };
          })
        } else {
          ctries = [];
        }

        if (this.division) {
          divisions = typeof(this.division) == "string" ? [this.division] : this.division;
          divisions = divisions.map(d => {
            return {
              name: d,
              isActive: d == this.selected && this.selectedType == "division",
              type: "division"
            };
          })
        } else {
          divisions = [];
        }

        // always have the world there too.
        let allLocs = [{
          name: "Worldwide",
          type: "world",
          isActive: this.selected == "Worldwide"
        }];

        return (allLocs.concat(ctries, divisions));
      }
    },
    choroplethCountries() {
      return (this.selectedLocations.filter(d => d.type != "division"))
    }
  },
  watch: {
    '$route.query': function(newVal, oldVal) {
      if (newVal.pangolin != oldVal.pangolin) {
        this.newPangolin = null;
        this.setupReport();
      } else {
        this.updateLocations();
      }
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
      lastUpdated: null,
      disclaimer: null,

      // Changing locations
      activeLocation: "the world",
      queryCountry: null,
      queryDivision: null,
      queryPangolin: null,
      newPangolin: null,
      currentLocs: null, // placeholder for current locations
      ctry2Add: [], // array to store new locations to add
      div2Add: [], // array to store new locations to add

      // subscriptions
      dataSubscription: null,
      curatedSubscription: null,
      locationChangeSubscription: null,
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
      states: null,
      locationTotals: null,
      totalLineage: null,
      globalPrev: null,
      newToday: null,
      prevalence: []
    }
  },
  mounted() {
    this.currentLocs = this.selectedLocations.filter(d => d.name != "Worldwide");
    this.queryCountry = findCountry;
    this.queryDivision = findDivision;
    this.queryPangolin = findPangolin;
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
        this.dataSubscription = getReportData(this.$genomicsurl, this.selectedLocations, this.mutationVar, this.mutationName, this.selected, this.selectedType).subscribe(results => {
          console.log(results)

          // date updated
          this.dateUpdated = results.dateUpdated.dateUpdated;
          this.lastUpdated = results.dateUpdated.lastUpdated;

          // worldwide stats
          this.globalPrev = results.globalPrev;
          this.totalLineage = results.globalPrev.lineage_count_formatted;

          // newly added sequences
          this.newToday = results.newToday;


          // location prevalence
          this.locationTotals = results.locPrev;

          // longitudinal data: prevalence over time
          this.prevalence = results.longitudinal;

          // recent data by country & countries with that lineage.
          this.countries = results.countries;
          this.states = results.states;
          this.choroData = results.byCountry;

          this.hasData = true;
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
    selectNewLocations() {
      // update currentLocs
      let newCountries = this.ctry2Add.map(d => {
        return ({
          name: d,
          type: "country"
        })
      })

      let newDivisions = this.div2Add.map(d => {
        return ({
          name: d,
          type: "division"
        })
      })

      newCountries = this.currentLocs.filter(d => d.type == "country").concat(newCountries);

      newDivisions = this.currentLocs.filter(d => d.type == "division").concat(newDivisions);

      // update currentLocs
      this.currentLocs = newCountries.concat(newDivisions);


      // de-duplicate
      newCountries = uniq(newCountries.map(d => d.name));
      newDivisions = uniq(newDivisions.map(d => d.name));

      const queryParams = this.$route.query;

      let selectedPlace;
      let selectedType;
      if (queryParams.selectedType == "country") {
        if (newCountries.includes(queryParams.selected)) {
          selectedPlace = queryParams.selected;
          selectedType = queryParams.selectedType;
        } else {
          selectedPlace = "Worldwide";
          selectedType = "country";
        }
      } else {
        if (newDivisions.includes(queryParams.selected)) {
          selectedPlace = queryParams.selected;
          selectedType = queryParams.selectedType;
        } else {
          selectedPlace = "Worldwide";
          selectedType = "country";
        }
      }

      // reset the fields.
      this.ctry2Add = [];
      this.div2Add = [];

      this.$router.push({
        name: "MutationReport",
        query: {
          country: newCountries,
          division: newDivisions,
          pangolin: queryParams.pangolin,
          muts: queryParams.muts,
          selected: selectedPlace,
          selectedType: selectedType
        }
      })
    },
    changeLocation(location) {
      const queryParams = this.$route.query;

      this.activeLocation = location.name;

      this.selectedLocations.forEach(d => {
        d.isActive = false;
      })

      location.isActive = true;

      this.$router.push({
        name: "MutationReport",
        query: {
          country: queryParams.country,
          division: queryParams.division,
          pangolin: queryParams.pangolin,
          muts: queryParams.muts,
          selected: location.name,
          selectedType: location.type
        },
        params: {
          disableScroll: true
        }
      })
    },
    updateLocations() {
      this.locationChangeSubscription = updateLocationData(this.$genomicsurl, this.mutationVar, this.mutationName, this.selectedLocations, this.selected, this.selectedType).subscribe(results => {
        // longitudinal data: prevalence over time
        this.prevalence = results.longitudinal;

        // cumulative totals for table
        this.locationTotals = results.locPrev;

        // recent data by country.
        this.choroData = results.byCountry;

      })
    },
    updateCountries(selected) {
      this.ctry2Add.push(selected.name);
    },
    updateDivision(selected) {
      this.div2Add.push(selected.name);
    },
    updatePangolin(selected) {
      this.newPangolin = selected.name;
    },
    selectNewPangolin() {
      const queryParams = this.$route.query;

      this.$router.push({
        name: "MutationReport",
        query: {
          country: queryParams.country,
          division: queryParams.division,
          pangolin: this.newPangolin,
          muts: queryParams.muts,
          selected: queryParams.selected,
          selectedType: queryParams.type
        }
      })
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

    if (this.locationChangeSubscription) {
      this.locationChangeSubscription.unsubscribe();
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
