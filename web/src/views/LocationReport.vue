<template>
<div>
  <!-- <div class="p-2 border-top location-banner d-flex justify-content-between">
    <p class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</p>
    <b class="m-0 font-weight-bold location-header">Location Tracker</b>
  </div> -->

  <div class="mb-4 mt-3 half-page text-left" :class="[smallScreen ? 'mx-2' : 'mx-5']">
    <!-- LOADING -->
    <div v-if="loading" class="loader">
      <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
    </div>

    <!-- CHANGE LOCATION MODAL -->
    <div id="change-locations-modal" class="modal fade">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Select report location</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="py-3 border-bottom">
              <div class="d-flex align-items-center justify-content-center my-3" id="select-location">
                <TypeaheadSelect :queryFunction="queryLocation" @selected="updateLocations" :apiUrl="this.$genomicsurl" labelVariable="label" :removeOnSelect="false" placeholder="Select location" totalLabel="total sequences" />
              </div>
            </div>
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-primary" @click="submitNewLocation" data-dismiss="modal">Create report</button>

          </div>
        </div>
      </div>
    </div>
    <!-- end change location modal -->

    <!-- CHANGE MUTATIONS MODAL -->
    <div id="change-mutations-modal" class="modal fade">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header border-secondary">
            <h5 class="modal-title" id="exampleModalLabel">Add custom mutations</h5>
            <button type="button" class="close font-size-2" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="mx-4 border-bottom pb-3" v-if="customMutations.length">
              <h6 class="font-weight-bold text-muted">
                Current additions:
              </h6>
              <div class="d-flex flex-wrap">
                <button role="button" class="btn chip bg-main__darker text-light d-flex align-items-center py-1 px-2 line-height-1" v-for="(mutation, mIdx) in customMutations" :key="mIdx" @click="deleteMutation(mIdx)">
                  {{mutation.label}}
                  <font-awesome-icon class="ml-1" :icon="['far', 'times-circle']" :style="{'font-size': '0.85em', 'opacity': '0.6'}" />
                </button>
              </div>
            </div>

            <CustomLocationForm :curated="null" :includeLocation="false" :variant.sync="newVariants" :muts.sync="newMuts" :pango.sync="newPango" />
          </div>

          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-accent" @click="submitNewMutations" data-dismiss="modal">Create report</button>

          </div>
        </div>
      </div>
    </div>
    <!-- end change mutations modal -->

    <template>
      <!-- SOCIAL MEDIA SHARE, BACK BTN -->
      <div class="d-flex align-items-center mb-2">
        <router-link :to="{ name: 'LocationReports'}" class="no-underline">
          <button class="btn py-0 px-2 d-flex align-items-center btn-grey">
            <font-awesome-icon class="mr-2 fa-sm" :icon="['fas', 'arrow-left']" />
            back
          </button>
        </router-link>
        <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline d-flex align-items-center" data-toggle="modal" data-target="#change-mutations-modal">
          <font-awesome-icon class="mr-2 fa-xs" :icon="['fas', 'plus']" />
          add mutations
        </button>
        <ShareReport title="title" url="url" />
      </div>

      <!-- REPORT HEADER -->
      <div class="d-flex flex-column text-light location-banner py-3" :class="[smallScreen ? 'mx-n2 px-2' : 'mx-n5 px-5']">
        <h4 class="m-0 mt-n1 text-grey">Location Tracker</h4>
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex flex-column align-items-start">

            <div class="d-flex align-items-end">
              <div class="d-flex align-items-center">
                <h1 class="m-0 font-weight-bold location-header">{{ title }}</h1>
                <button class="btn py-1 px-2 mx-4 btn-grey flex-shrink-0" data-toggle="modal" data-target="#change-locations-modal">
                  <font-awesome-icon class="mr-2 font-size-small" :icon="['fas', 'sync']" />change location
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

      <!-- MINI-NAV -->
      <div class="d-flex flex-wrap my-3 py-3 align-items-center justify-content-center border-top border-bottom">
        <a href="#lineages">
          <button class="btn btn-grey mx-3 py-2">
            <small>Common lineages</small>
          </button>
        </a>

        <a href="#variants-of-concern">
          <button class="btn btn-grey mx-3 py-2">
            <small>Variants of Concern & Interest</small>
          </button>
        </a>

        <a href="#geographic">
          <button class="btn btn-grey mx-3 py-2">
            <small>Geographic breakdown</small>
          </button>
        </a>
      </div>

      <!-- LOGOS -->
      <!-- <ReportLogos class="mb-4" /> -->

      <!-- REPORT -->
      <div id="location-report">
        <!-- STREAM GRAPHS -->
        <div id="lineages">
          <div>
            <h3 v-if="lineagesByDay || mostRecentLineages">Lineage prevalence <span v-if="selectedLocation">in {{ selectedLocation.label }}</span></h3>
            <HorizontalCategoricalLegend :values="lineageDomain" :colorScale="colorScale" v-if="lineageDomain" />
          </div>

          <div class="row">

            <section id="lineages-over-time" class="col-md-8" v-if="lineagesByDay">
              <h5 class="">Lineage prevalence over time</h5>
              <div class="">
                <LineagesByLocation :data="lineagesByDay" :colorScale="colorScale" />
              </div>
            </section>

            <!-- STACKED BAR / MOST RECENT -->
            <section class="col-md-4" id="most-recent-lineages" v-if="mostRecentLineages">
              <h5>Most commonly found lineages over the past {{recentWindow}} days</h5>
              <ReportStackedBarGraph :data="mostRecentLineages" :colorScale="colorScale" :locationID="selectedLocation.id" />
            </section>

          </div>
        </div>

        <!-- TRACKED LINEAGES TABLE -->
        <section id="variants-of-concern" v-if="lineageTable" class="my-5 py-3 border-top">
          <div class="d-flex align-items-center justify-content-center">
            <h3 class="mr-5">Tracked lineages <span v-if="selectedLocation">in {{ selectedLocation.label }}</span></h3>
            <button class="btn btn-main-outline d-flex align-items-center my-2 flex-shrink-0" data-toggle="modal" data-target="#change-mutations-modal">Change mutations
              <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
            </button>
          </div>
          <LocationTable :data="lineageTable" :locationName="selectedLocation.label" :locationID="selectedLocation.id" />
        </section>

        <!-- TRACKED LINEAGES PREVALENCE -->
        <section id="lineages-over-time" class="my-5" py-3 border-top v-if="selectedLocation">
          <div class="d-flex align-items-center justify-content-center">
            <h3 class="mr-5">Tracked lineages over time <span v-if="selectedLocation">in {{ selectedLocation.label }}</span></h3>
            <button class="btn btn-main-outline d-flex align-items-center my-2 flex-shrink-0" data-toggle="modal" data-target="#change-mutations-modal">Change mutations
              <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
            </button>
          </div>
          <OverlayLineagePrevalence :options="selectedMutations" :locationID="loc" :locationName="selectedLocation.label" :selected="selected" v-if="selectedMutations && selectedMutations.length" />
        </section>

        <!-- GEOGRAPHIC CHOROPLETHS -->
        <section id="geographic" class="my-5 py-3 border-top" v-if="geoData && selectedLocation.admin_level === 0">
          <div class="d-flex justify-content-between">
            <div>
              <h3 class="m-0">Geographic prevalence of tracked lineages &amp; mutations</h3>
              <p class="text-muted m-0">Cumulative prevelence over the last {{ recentWindow }} days</p>
              <ThresholdSlider :countThreshold.sync="choroCountThreshold" :maxCount="choroMaxCount" />
            </div>

            <ClassedLegend :colorScale="choroColorScale" :horizontal="false" :label="`Est. prevalence over the last ${recentWindow} days`" :countThreshold="choroCountThreshold" :mutationName="null"  />
          </div>

          <div class="d-flex flex-wrap">
            <div v-for="(choro, cIdx) in geoData" :key="cIdx" class="w-33 my-3">
              <div v-if="choro.values.length">
                <div class="d-flex justify-content-between align-items-center mx-4">
                  <router-link :to="{name: 'MutationReport', query: { ... choro.route, loc: [loc], selected: loc }}">
                    <h5>{{ choro.key }}</h5>
                  </router-link>

                  <small v-if="choro.variantType.includes('Variant')" :class="{ 'VOC': choro.variantType == 'Variant of Concern',  'VOI': choro.variantType == 'Variant of Interest'}">
                    {{ choro.variantType }}
                  </small>
                </div>
                <ReportChoropleth :showCopy="false" :showLegend="false" :data="choro.values" :countThreshold="choroCountThreshold" :fillMax="1" :location="selectedLocation.label" :colorScale="choroColorScale" :mutationName="choro.key" :widthRatio="1" />
              </div>
            </div>
          </div>

        </section>
      </div>


      <!-- METHODOLOGY -->
      <section class="mt-3 mb-5 border-top pt-3" id="methods">
        <h4>Methodology</h4>
        <ReportMethodology :dateUpdated="dateUpdated" />
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
  max,
  timeFormat,
  scaleOrdinal,
  scaleThreshold
} from "d3";

import {
  schemeYlGnBu
} from "d3-scale-chromatic";

import {
  getLocationReportData,
  getLocationMaps,
  getBasicLocationReportData,
  getLocationTable,
  findLocation
} from "@/api/genomics.js";

import cloneDeep from "lodash/cloneDeep";
import uniq from "lodash/uniq";

export default {
  name: "LocationReport",
  props: {
    loc: String,
    muts: Array,
    pango: Array,
    variant: Array,
    selected: Array
  },
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    ReportMethodology: () => import( /* webpackPrefetch: true */ "@/components/ReportMethodology.vue"),
    Warning: () => import( /* webpackPrefetch: true */ "@/components/Warning.vue"),
    ReportAcknowledgements: () => import( /* webpackPrefetch: true */ "@/components/ReportAcknowledgements.vue"),
    ShareReport: () => import( /* webpackPrefetch: true */ "@/components/ShareReport.vue"),
    ReportChoropleth: () => import( /* webpackPrefetch: true */ "@/components/ReportChoropleth.vue"),
    LineagesByLocation: () => import( /* webpackPrefetch: true */ "@/components/LineagesByLocation.vue"),
    ReportStackedBarGraph: () => import( /* webpackPrefetch: true */ "@/components/ReportStackedBarGraph.vue"),
    HorizontalCategoricalLegend: () => import( /* webpackPrefetch: true */ "@/components/HorizontalCategoricalLegend.vue"),
    LocationTable: () => import( /* webpackPrefetch: true */ "@/components/LocationTable.vue"),
    OverlayLineagePrevalence: () => import( /* webpackPrefetch: true */ "@/components/OverlayLineagePrevalence.vue"),
    CustomLocationForm: () => import( /* webpackPrefetch: true */ "@/components/CustomLocationForm.vue"),
    ClassedLegend: () => import( /* webpackPrefetch: true */ "@/components/ClassedLegend.vue"),
    ThresholdSlider: () => import( /* webpackPrefetch: true */ "@/components/ThresholdSlider.vue"),
    FontAwesomeIcon
  },
  watch: {
    '$route.query': function(newVal, oldVal) {
      if (newVal.loc != oldVal.loc) {
        this.newLocation = null;
        this.createReport();
        this.customMutations = this.grabCustomMutations();
      }
    },
    selectedMutations() {
      this.customMutations = this.grabCustomMutations();
      this.updateMaps();
      this.updateTable();
    }
  },
  computed: {
    ...mapState("admin", ["mutationAuthors"]),
    ...mapState("genomics", ["locationLoading1", "locationLoading2", "locationLoading3", "locationLoading4", "locationLoading5"]),
    loading() {
      return (this.locationLoading1 || this.locationLoading2 || this.locationLoading3 || this.locationLoading4 || this.locationLoading5)
    },
    smallScreen() {
      return (window.innerSize < 500)
    },
    title() {
      return (this.selectedLocation ? `${this.selectedLocation.label} Mutation Report` : null)
    },
    selectedMutations() {
      let tracked = this.curatedLineages;
      if (this.pango) {
        if (typeof(this.pango) == "string") {
          tracked.push({
            type: "pango",
            label: this.pango,
            qParam: this.pango,
            query: `pangolin_lineage=${this.pango}`,
            variantType: "Custom Lineages & Mutations",
            route: {
              pango: this.pango
            }
          })
        } else {
          tracked = tracked.concat(this.pango.map(d => {
            return ({
              type: "pango",
              label: d,
              qParam: d,
              query: `pangolin_lineage=${d}`,
              variantType: "Custom Lineages & Mutations",
              route: {
                pango: d
              }
            })
          }))
        }
      }
      if (this.muts) {
        if (typeof(this.muts) == "string") {
          const mutations = this.muts.split(",");
          tracked.push({
            type: "mutation",
            label: mutations.length === 1 ? `${this.muts} mutation` : `${mutations.join(", ")} variant`,
            qParam: this.muts,
            query: `mutations=${this.muts}`,
            variantType: "Custom Lineages & Mutations",
            route: {
              muts: mutations
            }
          })
        } else {
          tracked = tracked.concat(this.muts.map(d => {
            const mutations = d.split(",");
            return ({
              type: "mutation",
              label: mutations.length === 1 ? `${d} mutation` : `${mutations.join(", ")} variant`,
              qParam: d,
              query: `mutations=${d}`,
              variantType: "Custom Lineages & Mutations",
              route: {
                muts: d.split(",")
              }
            })
          }))
        }
      }
      //
      if (this.variant) {
        if (typeof(this.variant) == "string") {
          const variant = this.variant.split("|");
          if (variant.length == 2) {
            tracked.push({
              type: "variant",
              label: `${variant[0]} lineage with ${variant[1]}`,
              qParam: this.variant,
              query: `pangolin_lineage=${variant[0]}&mutations=${variant[1]}`,
              variantType: "Custom Lineages & Mutations",
              route: {
                pango: variant[0],
                muts: variant[1]
              }
            })
          }
        } else {
          this.variant.map(d => {
            const variant = d.split("|");
            if (variant.length == 2) {
              tracked.push({
                type: "variant",
                label: `${variant[0]} lineage with ${variant[1]}`,
                qParam: d,
                query: `pangolin_lineage=${variant[0]}&mutations=${variant[1]}`,
                variantType: "Custom Lineages & Mutations",
                route: {
                  pango: variant[0],
                  muts: variant[1]
                }
              })
            }
          })
        }
      }
      return (tracked)
    }
  },
  mounted() {
    this.queryLocation = findLocation;
    this.choroColorScale = scaleThreshold(schemeYlGnBu[this.choroColorDomain.length + 2])
      .domain(this.choroColorDomain);

    this.customMutations = this.grabCustomMutations();

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
      this.basicSubscription = getBasicLocationReportData(this.$genomicsurl, this.loc).subscribe(results => {
        this.dateUpdated = results.dateUpdated.dateUpdated;
        this.lastUpdated = results.dateUpdated.lastUpdated;
        this.totalSequences = results.total;
        this.curatedLineages = results.curated;
        this.selectedLocation = results.location;
      })

      this.reportSubscription = getLocationReportData(this.$genomicsurl, this.loc, this.muts, this.pango, this.otherThresh, this.ndayThresh, this.dayThresh, this.recentWindow).subscribe(results => {
        // console.log(results)
        this.lineagesByDay = results.lineagesByDay;
        this.mostRecentLineages = results.mostRecentLineages;
        this.lineageDomain = results.lineageDomain;
        this.colorScale = scaleOrdinal(this.colorPalette).domain(this.lineageDomain);
      })
    },
    createReport() {
      this.setupReport();
      this.updateTable();
      this.updateMaps();
    },
    updateLocations(selected) {
      if (selected) {
        this.newLocation = selected;
      }
    },
    submitNewLocation() {
      this.$router.push({
        name: "LocationReport",
        query: {
          loc: this.newLocation.id,
          pango: this.pango,
          variant: this.variant,
          muts: this.muts,
          selected: this.selected
        }
      })
      this.newLocation = null;
    },
    grabCustomMutations() {
      let custom = []
      if (this.pango) {
        const pango = typeof(this.pango) == "string" ? [{
          type: "pango",
          label: this.pango,
          qParam: this.pango
        }] : this.pango.map(d => ({
          type: "pango",
          label: d,
          qParam: d
        }))
        custom = custom.concat(pango);
      }
      if (this.variant) {
        let variant;
        if (typeof(this.variant) == "string") {
          const label = this.variant.split("|");
          variant = [{
            type: "variant",
            label: `${label[0]} with ${label[1]}`,
            qParam: this.variant
          }]
        } else {
          variant = this.variant.map(d => {
            const label = d.split("|");
            return ({
              type: "variant",
              label: `${label[0]} with ${label[1]}`,
              qParam: d
            })
          })
        }
        custom = custom.concat(variant);
      }
      if (this.muts) {
        const mutation = typeof(this.muts) == "string" ? [{
          type: "mutation",
          label: this.muts,
          qParam: this.muts
        }] : this.muts.map(d => ({
          type: "mutation",
          label: d,
          qParam: d
        }))
        custom = custom.concat(mutation);
      }
      return (custom)
    },
    deleteMutation(idx) {
      this.customMutations.splice(idx, 1);
    },
    submitNewMutations() {
      let selected = this.selected ? this.selected : [];

      let pango = this.newPango.map(d => d.route);
      selected = selected.concat(pango);
      pango = pango.concat(this.customMutations.filter(d => d.type == "pango").map(d => d.qParam));

      let mutation = this.newMuts.map(d => d.route);
      selected = selected.concat(mutation);
      mutation = mutation.concat(this.customMutations.filter(d => d.type == "mutation").map(d => d.qParam));

      let variant = this.newVariants.map(d => d.route);
      selected = selected.concat(variant);
      variant = variant.concat(this.customMutations.filter(d => d.type == "variant").map(d => d.qParam));

      this.$router.push({
        name: "LocationReport",
        query: {
          loc: this.loc,
          pango: uniq(pango),
          variant: uniq(variant),
          muts: uniq(mutation),
          selected: uniq(selected)
        }
      })
      this.newPango = [];
      this.newMuts = [];
      this.newVariants = [];
    },
    updateMaps() {
      if (this.selectedLocation.admin_level === 0) {
        this.choroSubscription = getLocationMaps(this.$genomicsurl, this.loc, this.selectedMutations, this.recentWindow).subscribe(results => {
          this.geoData = results;

          this.choroMaxCount = max(results.flatMap(d => d.values), d => d.cum_total_count);
        })
      }
    },
    updateTable() {
      this.tableSubscription = getLocationTable(this.$genomicsurl, this.loc, this.selectedMutations).subscribe(results => {
        this.lineageTable = results;
      })
    }
  },
  data() {
    return ({

      today: null,
      url: null,
      disclaimer: `SARS-CoV-2 (hCoV-19) sequencing is not a random sample of mutations. As a result, this report does not indicate the true prevalence of the mutations but rather our best estimate now. <a class='text-light text-underline ml-3' href='https://outbreak.info/situation-reports/caveats'>How to interpret this report</a>`,
      basicSubscription: null,
      reportSubscription: null,
      choroSubscription: null,
      tableSubscription: null,
      // methods
      queryLocation: null,
      // variables
      recentWindow: 60,
      otherThresh: 0.03,
      ndayThresh: 5,
      dayThresh: 60,
      // location info
      selectedLocation: null,
      newLocation: null,
      // update mutations
      newMuts: [],
      newPango: [],
      newVariants: [],
      customMutations: [],
      // data
      dateUpdated: null,
      lastUpdated: null,
      lineagesByDay: null,
      mostRecentLineages: null,
      lineageTable: null,
      lineageDomain: [],
      totalSequences: null,
      curatedLineages: [],
      geoData: null,
      // selections
      // scales
      // mainly Tableau 20: https://jrnold.github.io/ggthemes/reference/tableau_color_pal.html
      colorScale: null,
      choroColorDomain: [0.01, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75],
      choroColorScale: null,
      choroCountThreshold: 25,
      choroMaxCount: null,
      colorPalette: ["#bab0ab", // grey (other)
        "#4E79A7", // dk blue
        "#aecBe8", // lt blue
        "#f28e2b", // orange
        "#FFBE7D", // lt. orange
        "#59a14f", // green
        "#8CD17D", // lt. green
        "#e15759", // red
        "#FF9D9A", // lt. red
        "#499894", // teal
        "#86BCB6", // lt. teal
        "#B6992D", // dk yellow
        "#F1CE63", // yellow
        "#D37295", // dk pink
        "#FABFD2", // lt. pink,
        "#B07AA1", // dk purple
        "#D4A6C8", // lt. purple
        "#9D7660", // brown
        "#D7B5A6", // lt. brown
        "#bcbd22", // puce
        "#79706E", // grey
        "#79706E"
      ]
      // [ "#bab0ab", // grey (other)
      //   "#4E79A7", // dk blue
      //   // "#1f77b4", // dk blue
      //   "#f28e2b", // orange
      //   "#59a14f", // green
      //   "#e15759", // red
      //   // "#9edae5", // teal
      //   "#499894", // teal
      //   "#B6992D", // dk yellow
      //   "#D37295", // dk pink
      //   // "#9467bd", // purple
      //   "#B07AA1", // dk purple
      //   "#9D7660", // brown
      //   // "#8c564b", // brown
      //   "#aecBe8", // lt blue
      //   "#FFBE7D", // lt. orange
      //   "#8CD17D", // lt. green
      //   "#FF9D9A", // lt. red
      //   "#86BCB6", // lt. teal
      //   "#F1CE63", // yellow
      //   // "#edc949", // yellow
      //   // "#ff9da7", // pink
      //   "#FABFD2", // lt. pink,
      //   "#D4A6C8", // lt. purple
      //   "#D7B5A6", // lt. brown
      //   "#bcbd22", // puce
      //   "#79706E", // grey
      //   "#79706E"
      // ])
    })
  },
  destroyed() {
    if (this.basicSubscription) {
      this.basicSubscription.unsubscribe();
    }

    if (this.reportSubscription) {
      this.reportSubscription.unsubscribe();
    }

    if (this.choroSubscription) {
      this.choroSubscription.unsubscribe();
    }

    if (this.tableSubscription) {
      this.tableSubscription.unsubscribe();
    }
  }
}
</script>

<style lang="scss" scoped>
.gisaid {
    height: 25px;
}

.font-size-small {
    font-size: small;
}

.btn-active {
    background-color: $primary-color;
    color: white;
}

.w-33 {
    width: 33% !important;
}
</style>
