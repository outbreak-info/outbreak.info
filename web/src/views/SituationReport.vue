<template>
<div>
  <div class="my-4 half-page text-left" :class="[smallScreen ? 'mx-2' : 'mx-5']">
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
              <div v-if="loc2Add.length" class="my-3">
                <h6 class="text-sec text-underline m-0">Locations to add</h6>
                <button class="btn btn-main-flat px-2 py-1 mr-2" v-for="(location, cIdx) in loc2Add" :key="cIdx" id="new-locations" @click="removeLoc2Add(cIdx)">
                  {{ location.label }}
                  <font-awesome-icon class="fa-sm ml-1" :icon="['fas', 'trash-alt']" />
                </button>
              </div>

              <div class="d-flex align-items-center justify-content-center my-3" id="select-location">
                <TypeaheadSelect :queryFunction="queryLocation" @selected="updateLocationList" :apiUrl="this.$genomicsurl" placeholder="Add location" totalLabel="total sequences" />
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
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Generate Custom Mutation Report</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <CustomReportForm @exit="closeModal" />
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <template v-if="hasData">
      <!-- SOCIAL MEDIA SHARE, BACK BTN -->
      <div class="d-flex align-items-center mb-2">
        <router-link :to="{ name: 'SituationReports'}" class="no-underline">
          <button class="btn py-0 px-2 d-flex align-items-center btn-grey">
            <font-awesome-icon class="mr-2 fa-sm" :icon="['fas', 'arrow-left']" />
            back
          </button>
        </router-link>
        <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline d-flex align-items-center" data-toggle="modal" data-target="#change-locations-modal">
          <font-awesome-icon class="mr-2 fa-xs" :icon="['fas', 'plus']" />
          add locations
        </button>
        <ShareReport title="title" url="url" />
      </div>

      <!-- REPORT HEADER -->
      <div class="d-flex flex-column text-light mutation-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Lineage <span class="mx-1">|</span> Mutation Tracker</h4>
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex flex-column align-items-start">

            <div class="d-flex align-items-end">
              <div class="d-flex align-items-center">
                <h1 class="m-0 font-weight-bold mutation-header">{{ title }}</h1>
                <button class="btn py-1 px-2 ml-4 btn-grey" data-toggle="modal" data-target="#change-pangolin-modal">
                  <font-awesome-icon class="mr-2 font-size-small" :icon="['fas', 'sync']" />change mutation(s)
                </button>
              </div>
            </div>
            <div class="d-flex my-1 align-items-center">
              <small class="text-muted mr-3" v-if="reportMetadata && reportMetadata.mutation_synonyms"><span>a.k.a. </span>
                <span v-for="(synonym, sIdx) in reportMetadata.mutation_synonyms" :key="sIdx">
                  <b>{{ synonym }}</b>
                  <span v-if="sIdx < reportMetadata.mutation_synonyms.length - 1">, </span></span>
              </small>
              <small class="mutation-hyperlink" v-if="pangoLink">
                <a :href="pangoLink" target="_blank" rel="noreferrer">view on PANGO lineages</a>
              </small>
            </div>
            <div class="d-flex align-items-center">
              <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
                <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> Updated {{ lastUpdated }} ago
              </small>
              <div class="text-light font-size-2 ml-5" v-if="totalLineage">
                {{totalLineage}} sequences
              </div>
            </div>


          </div>
          <div class="d-flex flex-column align-items-end justify-content-between">
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

      <!-- Report Nav bar -->
      <div class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center border-top border-bottom">
        <div class="d-flex flex-wrap justify-content-center mx-3 py-2">
          <a href="#longitudinal">
            <button class="btn btn-grey mr-3">
              <small>Daily prevalence</small>
            </button>
          </a>

          <a href="#geographic">
            <button class="btn btn-grey mx-3 py-2">
              <small>Geographic prevalence</small>
            </button>
          </a>
          <a href="#resources">
            <button class="btn btn-grey mx-3 py-2">
              <small>Publications</small>
            </button>
          </a>
        </div>
      </div>


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
          <span v-html="reportDescription" class="font-size-2"></span>
          <!-- CHARACTERISTIC MUTATIONS -->
          <div class="mt-4" id="definition">
            <CharacteristicMutations :mutationName="reportName" :mutations="mutations" :definitionLabel="definitionLabel" :additionalMutations="additionalMutations" :lineageName="lineageName" />
          </div>

          <!-- KEY INSIGHTS -->
          <!-- <div class="mt-4">
          <h4>Key Insights</h4>
          <ul>
            <li>
              XXXX {{ reportName }} has been <b>increasing/decreasing</b> in prevalence over the past two weeks.
            </li>
            <li>
              XXXX Its apparent prevalence is higher in rest of the world compared to the United States or San Diego.
            </li>
            <li>
              XXXX Experimental data suggests it is more transmissable than other SARS-CoV-2 variants.
            </li>
          </ul>
        </div> -->


          <!-- BREAKDOWN BY PANGO LINEAGE -->
          <div class="my-4" v-if="mutationsByLineage.length">
            <div v-if="reportType == 'lineage with added mutations'" class="mx-2 mb-1">
              <button class="btn btn-main-outline btn-mut router-link px-1 collapsed" data-toggle="collapse" href="#collapsePangoBreakdown" aria-expanded="true" aria-controls="collapsePangoBreakdown">
                <small><span class="if-collapsed">Show</span>
                  <span class="if-not-collapsed">Hide</span>
                  other lineages with {{ mutationName }}</small>
              </button>
            </div>

            <div class="mx-3" :class="{'collapse' : reportType == 'lineage with added mutations'}" id="collapsePangoBreakdown">
              <MutationsByLineage :title="`Global prevalence of ${mutationName} per PANGO lineage`" subtitle="Since first identification" :lineage="lineageName" :mutationName="mutationName" :data="mutationsByLineage" />
            </div>
          </div>

          <!-- NEW TODAY -->
          <!-- <div class="my-4">
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
        </div> -->
        </section>

        <!-- RIGHT: SUMMARY BOX -->
        <section id="summary" class="d-flex flex-column justify-content-between col-sm-6 col-md-5 p-3 pr-4 summary-box bg-main text-light">
          <ReportSummary :dateUpdated="dateUpdated" :totalLineage="totalLineage" :smallScreen="smallScreen" :mutationName="reportName" :reportType="reportType" :globalPrev="globalPrev" :locationTotals="locationTotals" :countries="countries"
            :states="states" />
        </section>
      </div>


      <!-- DAILY PREVALENCE -->
      <section class="vis my-3 py-3 d-flex flex-column align-items-center" id="longitudinal">
        <h4 class="mb-0">Average daily {{reportName}} prevalence</h4>
        <small class="text-muted mb-2">Based on reported sample collection date</small>
        <div id="location-buttons" class="d-flex flex-wrap">
          <button class="btn btn-tab my-2" :class="{'btn-active': location.isActive}" v-for="(location, lIdx) in selectedLocations" :key="lIdx" @click="changeLocation(location)">{{ location.label }}</button>
          <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-locations-modal">Change locations
            <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
          </button>
        </div>
        <ReportPrevalence :data="prevalence" :mutationName="reportName" :location="selected" />
      </section>

      <!-- GEOGRAPHIC PREVALENCE -->
      <section class="my-4 d-flex flex-column align-items-center" id="geographic">
        <div class="d-flex align-items-center">
          <h4 class="mb-0 mr-3">Cumulative {{reportName}} prevalence</h4>
          <div id="location-buttons" class="d-flex flex-wrap align-items-center">
            <button class="btn btn-tab" :class="{'btn-active': location.isActive }" v-for="(location, cIdx) in choroplethCountries" :key="cIdx" @click="changeLocation(location)">{{ location.name }}</button>
            <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-locations-modal">Change locations
              <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
            </button>
          </div>
        </div>

        <div v-if="selectedAdmin < 2">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <small class="text-muted">Since first identification in location</small>
            <Warning class="mt-2" text="Prevalence estimates are biased by sampling <a href='#methods' class='text-light text-underline'>(read more)</a>" />
          </div>
          <ReportChoropleth class="mb-5" :data="choroData" :mutationName="reportName" :location="selected" />
          <ReportPrevalenceByLocation :data="choroData" :mutationName="reportName" :location="selected" class="mt-2" />
        </div>

        <div class="text-muted my-5" v-else>
          Geographic prevalence is not available for counties. Please select worldwide, a country, or a division/state.
        </div>

      </section>

      <!-- RESOURCES -->
      <section id="resources">
        <ReportResources :mutationName="reportName" :searchTerms="searchTerms" />
      </section>

      <!-- METHODOLOGY -->
      <section class="mt-3 mb-5" id="methods">
        <h4>Methodology</h4>
        <ReportMethodology :dateUpdated="dateUpdated" />
        <!-- <small class=""><a @click="downloadGISAID" href="">Download associated GISAID IDs</a></small> -->
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
    </template>

    <div v-else-if="reportloading" class="half-page" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
      <div class="mutation-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Lineage <span class="mx-1">|</span> Mutation Tracker</h4>
        <h1 class="m-0 mutation-header">{{ title }}</h1>
      </div>
      <p class="my-5">
        Calculating prevalences for {{title}}. Please be patient.
      </p>
    </div>

    <div v-else>
      <div class="d-flex flex-column align-items-start text-light mutation-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Lineage <span class="mx-1">|</span> Mutation Tracker</h4>
        <h1 class="m-0 mutation-header">{{ title }}</h1>
      </div>
      <p class="my-5">
        No data found for <b>{{title}}</b>. Please check that you have specified the {{reportType}} properly.
      </p>
    </div>
  </div>
</div>
</template>

<script>
import Vue from "vue";

import uniq from "lodash/uniq";
import isEqual from "lodash/isEqual";

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
import CustomReportForm from "@/components/CustomReportForm.vue";
import MutationsByLineage from "@/components/MutationsByLineage.vue";

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
  faPlusCircle,
  faSpinner,
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";


library.add(faClock, faTrashAlt, faPlusCircle, faSpinner, faInfoCircle);

import {
  mapState
} from "vuex";

import {
  getReportData,
  getCuratedMetadata,
  updateLocationData,
  findLocation,
  findPangolin,
  getLocationPrevalence
} from "@/api/genomics.js";

import {
  timeFormat
} from "d3";

export default {
  name: "SituationReport",
  components: {
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
    TypeaheadSelect,
    CustomReportForm,
    MutationsByLineage
  },
  props: {
    loc: Array,
    muts: Array,
    pango: String,
    selected: {
      type: String,
      default: "Worldwide"
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors", "reportloading"]),
    smallScreen() {
      return (window.innerSize < 500)
    },
    definitionLabel() {
      return this.reportType == "lineage" ? "Characteristic mutations in lineage" : "List of mutations";
    },
    genericDescription() {
      return this.reportType == "lineage with added mutations" ?
        `Concerns surrounding new strains of SARS-CoV-2 (hCoV-19), the virus behind the COVID-19 pandemic, have been developing. This report outlines the prevalence of the <b>${this.reportName}</b> in the world, how it is changing over time, and how its prevalence varies across different locations.` :
        `Concerns surrounding new strains of SARS-CoV-2 (hCoV-19), the virus behind the COVID-19 pandemic, have been developing. This report outlines the prevalence of the <b>${this.reportName}</b> ${this.reportType} in the world, how it is changing over time, and how its prevalence varies across different locations.`
    },
    pangoLink() {
      return this.lineageName ? `https://cov-lineages.org/lineages/lineage_${this.lineageName}.html` : null
    },
    choroplethCountries() {
      return (this.selectedLocations.filter(d => d.admin_level < 2))
    }
  },
  watch: {
    '$route.query': function(newVal, oldVal) {
      if (newVal.pango != oldVal.pango || !isEqual(newVal.muts, oldVal.muts)) {
        this.newPangolin = null;
        this.lineageName = null;
        this.reportMetadata = null;
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
      lineageName: null,
      mutationName: null,
      reportName: null,
      mutationVar: null,
      mutations: null,
      reportType: null,
      title: null,
      lastUpdated: null,
      disclaimer: null,

      // Changing locations
      queryLocation: null,
      queryPangolin: null,
      newPangolin: null,
      currentLocs: null, // placeholder for current locations
      loc2Add: [], // array to store new locations to add

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
      selectedLocations: null,
      selectedAdmin: null,
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
      prevalence: [],
      mutationsByLineage: []
    }
  },
  mounted() {
    // this.currentLocs = this.selectedLocations.filter(d => d.name != "Worldwide");
    this.queryLocation = findLocation;
    this.queryPangolin = findPangolin;

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
    setLineageAndMutationStr() {
      if (this.$route.query.pango) {
        if (this.$route.query.muts && this.$route.query.muts.length) {
          // Lineage + Mutation report
          this.lineageName = this.$options.filters.capitalize(this.$route.query.pango);
          this.mutationID = typeof(this.$route.query.muts) == "string" ? this.$route.query.muts : this.$route.query.muts.join(",");
          this.mutationName = typeof(this.$route.query.muts) == "string" ? this.$route.query.muts : this.$route.query.muts.join(", ");
          this.reportName = `${this.lineageName} Lineage with ${this.mutationName}`;
          this.reportType = "lineage with added mutations";
          this.searchTerms = `${this.lineageName}" AND "${typeof(this.$route.query.muts) == "string" ? this.$route.query.muts.split(":").slice(-1) : this.$route.query.muts.map(d => d.split(":").slice(-1)[0]).join('" AND "')}`
          this.title = `${this.reportName} Report`;
          this.disclaimer =
            `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the ${this.reportType} but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`;


        } else {
          // Lineage report
          this.lineageName = this.$options.filters.capitalize(this.$route.query.pango);
          this.reportName = this.lineageName;
          this.mutationID = null;
          this.reportType = "lineage";
          this.title = `${this.reportName} Lineage Report`;
          this.searchTerms = this.lineageName;
          this.disclaimer =
            `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the ${this.reportType} but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`;

        }

      } else {
        if (typeof(this.$route.query.muts) == "string") {
          // Single mutation report
          this.lineageName = null;
          this.mutationID = this.$route.query.muts;
          this.reportName = this.mutationID;
          this.mutationName = this.reportName;
          this.reportType = "mutation";
          this.searchTerms = this.mutationName.split(":").slice(-1);
          this.title = `${this.reportName} Mutation Report`;
          this.disclaimer =
            `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the ${this.reportType} but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`;

        } else {
          // Variant (multiple mutation) report
          this.lineageName = null;
          this.reportName = this.$route.query.muts.join(", ");
          this.mutationName = this.reportName;
          this.searchTerms = this.$route.query.muts.map(d => d.split(":").slice(-1)[0]).join('" AND "');
          this.mutationID = this.$route.query.muts.join(",");
          this.reportType = this.$route.query.muts.length === 1 ? "mutation" : "variant";
          this.title = `${this.reportName} ${this.$options.filters.capitalize(this.reportType)} Report`;
          this.disclaimer =
            `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the ${this.reportType} but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`;
        }
      }
    },
    setupReport() {
      this.setLineageAndMutationStr();

      if (this.lineageName || this.mutationID) {
        this.dataSubscription = getReportData(this.$genomicsurl, this.loc, this.mutationID, this.lineageName, this.selected).subscribe(results => {
          console.log(results)

          // selected locations
          this.selectedLocations = results.locations;
          this.currentLocs = results.locations;
          const selected = results.locations.filter(d => d.isActive);
          this.selectedAdmin = selected.length === 1 ? selected[0].admin_level : null;

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

          // Mutation details for queried mutations
          this.additionalMutations = results.mutationDetails;

          // Mutation distribution by lineage
          this.mutationsByLineage = results.mutationsByLineage;

          if (results.md) {
            this.reportMetadata = results.md;
            this.searchTerms = this.reportType != "lineage with added mutations" ? results.md.searchTerms : [this.searchTerms];
            this.reportDescription = results.md.description ? results.md.description : this.genericDescription;
            this.disclaimer = results.md.disclaimer ? results.md.disclaimer : this.disclaimer;
          } else {
            this.searchTerms = [this.searchTerms];
            this.reportDescription = this.genericDescription;
          }
        })
      }
    },
    removeLocation(idx) {
      this.currentLocs.splice(idx, 1);
    },
    removeLoc2Add(idx) {
      this.loc2Add.splice(idx, 1);
    },
    clearNewLocations() {
      this.loc2Add = [];
    },
    selectNewLocations() {
      // de-duplicate
      // const newCountries = uniq(newCountries.map(d => d.name));
      // const newDivisions = uniq(newDivisions.map(d => d.name));

      const locationIDs = this.loc2Add.map(d => d.id);
      console.log(this.loc2Add)
      console.log(locationIDs)
      const newSelected = locationIDs[0];

      // reset the fields.
      this.loc2Add = [];

      this.$router.push({
        name: "MutationReport",
        query: {
          pango: this.pango,
          muts: this.muts,
          selected: newSelected,
          loc: locationIDs
        }
      })
    },
    changeLocation(location) {
      console.log("CHANGE")
      // const queryParams = this.$route.query;

      this.selectedLocations.forEach(d => {
        d.isActive = false;
      })

      location.isActive = true;

      // const countries = this.selectedLocations.filter(d => d.type == "country").map(d => d.name);
      const ids = this.selectedLocations.map(d => d.id);

      this.$router.push({
        name: "MutationReport",
        query: {
          pango: this.pango,
          muts: this.muts,
          loc: ids,
          selected: location.id
        },
        params: {
          disableScroll: true
        }
      })
    },
    updateLocations() {
      this.locationChangeSubscription = updateLocationData(this.$genomicsurl, this.mutationID, this.lineageName, this.selectedLocations, this.selected).subscribe(results => {
        // longitudinal data: prevalence over time
        this.prevalence = results.longitudinal;

        // cumulative totals for table
        this.locationTotals = results.locPrev;

        // recent data by country.
        this.choroData = results.byCountry;

      })
    },
    updateLocationList(selected) {
      console.log(selected)
      this.loc2Add.push(selected);
    },
    updatePangolin(selected) {
      this.newPangolin = selected.name;
    },
    selectNewPangolin() {
      // const queryParams = this.$route.query;

      this.$router.push({
        name: "MutationReport",
        query: {
          loc: this.loc,
          pango: this.newPangolin,
          muts: this.muts,
          selected: this.selected
        }
      })
    },
    closeModal() {
      $("#change-pangolin-modal").modal("hide");
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
