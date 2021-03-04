<template>
<div class="my-4 half-page text-left" :class="[smallScreen ? 'mx-2' : 'mx-5']">
  <!-- LOADING -->
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>

  <!-- CHANGE LOCATION MODAL -->
  <!-- <div id="change-locations-modal" class="modal fade">
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
  </div> -->
  <!-- end change location modal -->

  <template>
    <!-- SOCIAL MEDIA SHARE, BACK BTN -->
    <div class="d-flex align-items-center mb-2">
      <router-link :to="{ name: 'SituationReports'}">
        <button class="btn py-0 px-2 btn-grey-outline">back</button>
      </router-link>
      <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline" data-toggle="modal" data-target="#change-pangolin-modal">select mutation(s)</button>
      <button class="btn py-0 px-2 flex-shrink-0 btn-grey-outline" data-toggle="modal" data-target="#change-locations-modal">change locations</button>
      <ShareReport title="title" url="url" />
    </div>

    <div class="d-flex justify-content-between align-items-center">
      <div class="d-flex flex-column align-items-start">

        <div class="d-flex align-items-end">
          <h1 class="m-0">{{ title }}</h1>
          <div class="text-highlight font-size-2 ml-5" v-if="totalSequences">
            {{totalSequences}} sequences
          </div>
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

    <!-- MINI-NAV -->
    <div class="d-flex flex-wrap my-3">
      <a href="#lineages">
        <button class="btn btn-grey mr-3">
          <small>Common lineages</small>
        </button>
      </a>

      <a href="#variants-of-concern">
        <button class="btn btn-grey mr-3">
          <small>Variants of Concern & Interest</small>
        </button>
      </a>

      <a href="#geographic">
        <button class="btn btn-grey mr-3">
          <small>Geographic breakdown</small>
        </button>
      </a>
    </div>

    <!-- LOGOS -->
    <ReportLogos class="mb-4" />

    <!-- REPORT -->
    <div id="location-report">
      <!-- STREAM GRAPHS -->
      <div id="lineages">
        <div>
          <h3 v-if="lineagesByDay || mostRecentLineages">Lineage prevalence in {{location}}</h3>
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
            <h5>Most commonly found lineages over the past {{recentThreshold}} days</h5>
            <ReportStackedBarGraph :data="mostRecentLineages" :colorScale="colorScale" :location="location" :locationType="selectedLocationType" />
          </section>

        </div>
      </div>

      <!-- TRACKED LINEAGES TABLE -->
      <section id="variants-of-concern" v-if="lineageTable" class="my-5 py-3 border-top">
        <div class="d-flex align-items-center justify-content-center">
          <h3 class="mr-5">Tracked lineages</h3>
          <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-mutations-modal">Change mutations
            <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
          </button>
        </div>
        <LocationTable :data="lineageTable" :selectedLocationType="selectedLocationType" :location="location" />
      </section>

      <!-- TRACKED LINEAGES PREVALENCE -->
      <section id="lineages-over-time" class="my-5" py-3 border-top>
        <div class="d-flex align-items-center justify-content-center">
          <h3 class="mr-5">Tracked lineages over time</h3>
          <button class="btn btn-main-outline d-flex align-items-center my-2" data-toggle="modal" data-target="#change-mutations-modal">Change mutations
            <font-awesome-icon class="ml-2 font-size-small" :icon="['fas', 'sync']" />
          </button>
        </div>
        <OverlayLineagePrevalence :options="selectedMutations" :location="location" :locationType="selectedLocationType"/>
      </section>

      <!-- GEOGRAPHIC CHOROPLETHS -->
      <section id="geographic" class="my-5 py-3 border-top" v-if="geoData">
        <h3 class="m-0">Geographic prevalence of tracked lineages & mutations</h3>
        <small class="text-muted m-0">Cumulative prevelence over the last {{ recentThreshold }} days</small>
        <div class="d-flex flex-wrap">
          <div v-for="(choro, cIdx) in geoData" :key="cIdx" class="w-25 my-3">
            <div class="d-flex justify-content-between align-items-center mx-4">
              <router-link v-if="selectedLocationType == 'division'" :to="{name: 'MutationReport', query: { ... choro.route, division: [location], selected: location, selectedType: 'division' }}">
                <h5>{{ choro.key }}</h5>
              </router-link>
              <router-link v-else :to="{name: 'MutationReport', query: { ... choro.route, country: [location], selected: location, selectedType: 'country' }}">
                <h5>{{ choro.key }}</h5>
              </router-link>

              <small v-if="choro.variantType.includes('Variant')" :class="{ 'VOC': choro.variantType == 'Variant of Concern',  'VOI': choro.variantType == 'Variant of Interest'}">
                {{ choro.variantType }}
              </small>
            </div>
            <ReportChoropleth :showLegend="false" :data="choro.values" :fillMax="1" :location="location" :mutationName="choro.key" :widthRatio="1" />
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
  faSpinner
} from "@fortawesome/free-solid-svg-icons/faSpinner";
import {
  faSync
} from "@fortawesome/free-solid-svg-icons/faSync";


library.add(faClock, faSpinner, faSync);

import {
  mapState
} from "vuex";

import {
  timeFormat,
  scaleOrdinal
} from "d3";

import {
  getLocationReportData,
  getLocationMaps,
  getBasicLocationReportData,
  getLocationTable
} from "@/api/genomics.js";

export default {
  name: "LocationReport",
  props: {
    country: String,
    division: String,
    muts: Array,
    pango: Array,
    variant: Array
  },
  components: {
    ReportLogos: () => import( /* webpackPrefetch: true */ "@/components/ReportLogos.vue"),
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
    FontAwesomeIcon
  },
  watch: {
    selectedMutations() {
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
    location() {
      return (this.division ? this.division : this.country)
    },
    title() {
      return (`${this.location} Mutation Report`)
    },
    selectedLocation() {
      return (this.division ? this.division : this.country)
    },
    selectedLocationType() {
      return (this.division ? "division" : "country")
    },
    selectedMutations() {
      let tracked = this.curatedLineages;
      if (this.pango) {
        if (typeof(this.pango) == "string") {
          tracked.push({
            label: `${this.pango} lineage`,
            query: `pangolin_lineage=${this.pango}`,
            variantType: "Custom Lineages & Mutations",
            route: {
              pango: this.pango
            }
          })
        } else {
          tracked = tracked.concat(this.pango.map(d => {
            return ({
              label: `${d} lineage`,
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
          tracked.push({
            label: `${this.muts} mutation`,
            query: `mutations=${this.muts}`,
            variantType: "Custom Lineages & Mutations",
            route: {
              muts: this.muts.split(",")
            }
          })
        } else {
          tracked = tracked.concat(this.muts.map(d => {
            return ({
              label: `${d} mutation`,
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
              label: `${variant[0]} lineage with ${variant[1]}`,
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
                label: `${variant[0]} lineage with ${variant[1]}`,
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
    const formatDate = timeFormat("%e %B %Y");
    var currentTime = new Date();
    this.today = formatDate(currentTime);

    // set URL for sharing, etc.
    this.$nextTick(function() {
      const location = window.location;
      this.url = location.search !== "" ? `${location.origin}${location.pathname}${location.search}` : `${location.origin}${location.pathname}`;
    })

    this.basicSubscription = getBasicLocationReportData(this.$genomicsurl, this.selectedLocation, this.selectedLocationType).subscribe(results => {
      this.dateUpdated = results.dateUpdated.dateUpdated;
      this.lastUpdated = results.dateUpdated.lastUpdated;
      this.totalSequences = results.total;
      this.curatedLineages = results.curated;
    })

    this.reportSubscription = getLocationReportData(this.$genomicsurl, this.selectedLocation, this.selectedLocationType, this.muts, this.pango, this.otherThresh, this.ndayThresh, this.dayThresh).subscribe(results => {
      // console.log(results)
      this.lineagesByDay = results.lineagesByDay;
      this.mostRecentLineages = results.mostRecentLineages;
      this.lineageDomain = results.lineageDomain;
      this.colorScale = scaleOrdinal(this.colorPalette).domain(this.lineageDomain);
    })
  },
  methods: {
    updateMaps() {
      this.choroSubscription = getLocationMaps(this.$genomicsurl, this.selectedLocation, this.selectedLocationType, this.selectedMutations, this.recentThresh).subscribe(results => {
        this.geoData = results;
      })
    },
    updateTable() {
      this.tableSubscription = getLocationTable(this.$genomicsurl, this.selectedLocation, this.selectedLocationType, this.selectedMutations).subscribe(results => {
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
      // variables
      recentThreshold: 28,
      otherThresh: 0.03,
      ndayThresh: 5,
      dayThresh: 60,
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
</style>
