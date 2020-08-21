<template>
<div class="home flex-column text-left d-flex">
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>
  <!-- INTRO -->
  <section>
    <div class="row m-0">
      <div class="col-sm-12 d-flex justify-content-center align-items-center bg-main__darker px-0 back-1">
        <img src="@/assets/logo-full-white-01.svg" alt="Outbreak.info" class="w-25" />
      </div>
    </div>
  </section>

  <div class="col-sm-12 d-flex justify-content-center align-items-center p-0 bg-grey__lightest hero">
    <div class="container p-3">
      <p class="focustext">
        During outbreaks of emerging diseases such as COVID-19,
        efficiently collecting, sharing, and integrating data is critical
        to scientific research.
      </p>
      <p class="text-dark focustext font-weight-bold">
        <b class="text-highlight">outbreak.info</b> is a resource to
        aggregate all this information into a single location.
      </p>
      <p class="mt-4">
        <router-link :to="{ name: 'Latest' }">View latest changes</router-link>
      </p>
    </div>
  </div>

  <!-- SEARCH  -->
  <section class="d-flex justify-content-center align-items-center my-4">
    <div class="row m-0 w-100 d-flex justify-content-center">
      <div class="col-sm-12 col-md-5 px-5 py-3 my-3 d-flex flex-column justify-content-between card mr-5" :style="{background: 'white'}">
        <h3 class="my-2 p-2 text-light header-banner"><img src="@/assets/icon-01.svg" alt="Outbreak.info" :style="{height: '1.75rem'}" />
          Resources</h3>

        <div id="resourceBar-text" class="form-text d-block mb-3 text-highlight line-height-1">Find COVID-19 and SARS-CoV-2 clinical trials, datasets, publications, and more</div>
        <p class="text-muted">
          Keeping track of all the data and publications on COVID-19 and SARS-CoV-2 is a job in itself, requiring searching many different repositories and websites. outbreak.info combines the metadata from heterogeneous sources, creating one unified
          platform to find publications, clinical trials, datasets, protocols, and more.
        </p>

        <video class="w-100 mb-3" autoplay loop muted>
          <source src="@/assets/home/test.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>

        <svg viewBox="0 0 100 3">
          <line x1="0" y1="0" x2="100" vector-effect="non-scaling-stroke" stroke="#D13B62" stroke-width="5" />
        </svg>

        <form autocomplete="off" class="w-100">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb"><i class="fas fa-search"></i></span>
            </div>
            <input id="resourceBar" class="form-control border-0" placeholder="Search resources" aria-label="search" aria-describedby="sb" type="text" v-model="searchQuery" @keydown.enter.prevent="submitSearch" />
          </div>
        </form>
        <small id="sBar-example" class="form-text d-block  text-left ml-5"> <span class="mr-2">Try:</span>
          <span class="mr-3">
            <router-link :to="{name: 'Resources', query: {q: 'remdesivir'}} ">
              remdesivir
              <i class="fas fa-angle-double-right"></i>
            </router-link>
          </span>
          <router-link :to="{name: 'NIAID'} ">
            NIAID-related
            <i class="fas fa-angle-double-right"></i>
          </router-link>
        </small>

        <router-link :to='{ path: "/", hash: "#resource-examples" }'>
          <button class="btn btn-main-outline px-2 py-1 mt-3">
            What can I do with resources?
          </button>
        </router-link>
      </div>


      <!-- EPI INTRO -->
      <div class="col-sm-12 col-md-5 px-5 py-3 my-3 d-flex flex-column card mr-5" :style="{background: 'white'}">
        <h3 class="my-2 p-2 text-light header-banner"><img src="@/assets/icon-01.svg" alt="Outbreak.info" :style="{height: '1.75rem'}" />
          Epidemiology</h3>


        <div id="sBar-text" class="form-text d-block mb-3 text-highlight line-height-1">View COVID-19 trends by region, country, state/province, U.S.
          metropolitan area, or U.S. county</div>

        <p class="text-muted">
          Explore and download epidemiological data on confirmed cases, deaths, hospitalizations, and testing. Compare between locations to visualize how the pandemic has varied over time and geographies.
        </p>

        <img src="@/assets/home/epi_bars.gif" height="50%" width="100%" />

        <svg viewBox="0 0 100 3">
          <line x1="0" y1="0" x2="100" vector-effect="non-scaling-stroke" stroke="#D13B62" stroke-width="5" />
        </svg>

        <SearchBar routeTo="/epidemiology?" placeholder="Search locations" class="w-100"></SearchBar>
        <small id="sBar-example" class="form-text d-block text-left ml-5">
          <span class="mr-2">Try:</span>
          <span class="mr-3">
            <router-link :to="{name: 'Epidemiology', query: {location: 'BRA'}} ">Brazil
              <i class="fas fa-angle-double-right"></i>
            </router-link>
          </span>
          <router-link :to="{name: 'Epidemiology', query: {location: 'METRO_28140'}} ">Kansas City metro area <i class="fas fa-angle-double-right"></i>
          </router-link>
        </small>

        <router-link :to='{ path: "/", hash: "#epi-examples" }'>
          <button class="btn btn-main-outline px-2 py-1 mt-3 w-100">What can I do with epi data?</button>
        </router-link>

      </div>
    </div>
  </section>

  <!-- RESOURCE EXAMPLES -->
  <section id="resource-examples" class="container my-5">
    <h3>Search for COVID-19 resources</h3>
    <div class="row d-flex flex-wrap">

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Search by keyword</h5>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Search by resource type</h5>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Search by resource provider</h5>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Explore related resources</h5>
        </div>
      </div>


      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Download resource metadata</h5>
          <p>
            Metadata
          </p>
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Schema</h5>
        </div>
      </div>

    </div>
  </section>

  <!-- EPI EXAMPLES -->
  <section id="epi-examples" class="container my-5">
    <h3>Explore epidemiology data</h3>
    <div class="row">
      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Compare locations over time</h5>
          <img src="@/assets/home/epi1.png" alt="Outbreak.info" class="w-100" />
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">View by geography</h5>
          <img src="@/assets/home/epi2.png" alt="Outbreak.info" class="w-100" />
        </div>
      </div>

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Find similar regions</h5>
          <img src="@/assets/home/epi3.png" alt="Outbreak.info" class="w-100" />
        </div>
      </div>

      <!-- EPI CURVE SUMMARIES -->

      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <section class="w-100 p-3 card" id="regional-epi-curves">
          <h5 class="text-uppercase">Explore regions</h5>
          <template v-if="nestedData && nestedData.length > 0">
            <div class="region-tooltip-plots" v-for="(region, idx) in regionDict" :key="idx">
              <div class="tooltip-countries" :id="idx" :style="{
                  visibility: region.display ? 'visible' : 'hidden',
                  left: region.x + 'px',
                  top: region.y + 'px'
                }">
                <div>
                  {{ region.region }}
                </div>
                <div>{{ region.currentCases }} total {{ selectedVariable }}</div>
                <div class="click-affordance py-1" :style="{ background: lightColor(region.region) }">
                  click for details
                </div>
              </div>
              <CountryBarGraph :region="region.region" :variable="selectedVariable" :id="idx" :style="{
                  visibility: region.displayMore ? 'visible' : 'hidden'
                }" @regionSelected="handleTooltip" class="tooltip-countries-detailed" />
            </div>
          </template>

          <template v-if="nestedData && nestedData.length > 0">
            <h6>
              Cumulative Number of COVID-19
              <select v-model="selectedVariable" class="select-dropdown" @change="changeVariable">
                <option v-for="option in variableOptions" :value="option.value" :key="option.value">
                  {{ option.label }}
                </option>
              </select>
              by Region
            </h6>
          </template>

          <div id="regional-stacked-area-plots d-flex" ref="regional_stacked_area_plots">
            <div class="row px-2" v-if="nestedData && nestedData.length > 0">
              <div class="col-sm-12 col-md-12">
                <EpiStacked :width="stackedWidth" :height="stackedHeight" :data="nestedData" :includeChinaAnnot="true" id="all-data" :title="`${selectedVariableLabel} Worldwide`" @regionSelected="handleTooltip" />

              </div>
            </div>
          </div>
          <!-- <DataSource v-if="nestedData && nestedData.length > 0" class="mx-4" :data="nestedData" dataType="regions" :ids="['NYT', 'JHU']" figureRef="epi-summary-svg" /> -->
        </section>
      </div>


      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">View doubling rates</h5>
          <img src="@/assets/home/epi4.png" alt="Outbreak.info" class="w-100" />
        </div>
      </div>


      <div class="col-sm-12 col-md-6 col-lg-4 mb-4 d-flex">
        <div class="w-100 p-3 card">
          <h5 class="text-uppercase">Access data</h5>
          <h6>API</h6>
          <img src="@/assets/home/epi5.png" alt="Outbreak.info" class="w-100 mb-3" />
          <h6>R package</h6>
          <img src="@/assets/home/epi6.png" alt="Outbreak.info" class="w-100" />
        </div>
      </div>


    </div>
  </section>





  <section class="container">
    <p class="focustext">
      Notice a bug, know of a COVID-19 data source, or want to suggest a
      feature?
    </p>
    <p class="text-center">
      <a class="btn btn-main m-5" href="https://github.com/outbreak-info/outbreak.info/issues" rel="noreferrer" target="_blank">Submit an issue on Github</a>
    </p>
  </section>
  <Logos />
</div>
</template>
<script>
// @ is an alias to /src
import EpiStacked from "@/components/EpiStacked.vue";
import CountryBarGraph from "@/components/CountryBarGraph.vue";
// import DataSource from "@/components/DataSource.vue";
import SearchBar from "@/components/SearchBar.vue";
import Logos from "@/components/Logos.vue";
// import Warning from "@/components/Warning.vue";
import {
  getStackedRegions
} from "@/api/region-summary.js";
import {
  getEpiTable
} from "@/api/epi-traces.js";
import {
  getMapData
} from "@/api/epi-geo.js";
import {
  getCurrentDate
} from "@/api/biothings.js";
import { getLocation } from "@/js/get-location.js";

import {
  mapState
} from "vuex";

import {
  cloneDeep
} from "lodash";

import store from "@/store";

export default {
  name: "Home",
  components: {
    EpiStacked,
    CountryBarGraph,
    // DataSource,
    SearchBar,
    Logos
  },
  data() {
    return {
      stackedWidth: 500,
      stackedHeight: 250,
      data: null,
      dataSubscription: null,
      tableSubscription: null,
      nestedData: null,
      selectedVariable: "confirmed",
      variableOptions: [{
          label: "Cases",
          value: "confirmed"
        },
        {
          label: "Recoveries",
          value: "recovered"
        },
        {
          label: "Deaths",
          value: "dead"
        }
      ],
      searchQuery: ""
    };
  },
  watch: {},
  computed: {
    ...mapState("admin", ["loading"]),
    ...mapState("geo", ["regionDict"]),
    selectedVariableLabel() {
      return this.variableOptions.filter(
        d => d.value == this.selectedVariable
      )[0]["label"];
    }
  },
  methods: {
    submitSearch() {
      this.$router.push({
        name: "Resources",
        query: {
          q: this.searchQuery
        }
      });
    },
    changeVariable() {
      this.nestedData = this.data[this.selectedVariable];
    },
    handleTooltip(selected) {
      store.commit("geo/setRegionTooltip", selected);
    },
    regionColorScale: function(location) {
      const scale = store.getters["colors/getRegionColorFromLocation"];
      return scale(location);
    },
    lightColor: function(region) {
      const scale = store.getters["colors/getRegionColor"];
      return scale(region, 0.85);
    },
    setDims() {
      const selector = this.$refs.regional_stacked_area_plots;

      if (selector) {
        const dims = selector.getBoundingClientRect();
        // const dims = {window.innerWidth, height: window.innerHeight}
        const whRatio = 5 / 3;
        const widthThresh = 700;
        const selectorsProportion = 0.8;

        this.stackedWidth = dims.width;
        const idealHeight = this.stackedWidth / whRatio;
        if (idealHeight < window.innerHeight * selectorsProportion) {
          this.stackedHeight = idealHeight * selectorsProportion;
        } else {
          this.stackedHeight = window.innerHeight * selectorsProportion;
          this.stackedWidth = this.stackedHeight * whRatio;
        }
      }
    }
  },
  subscriptions() {
    return {
      mapData$: getMapData(this.$apiurl),
      currentDate$: getCurrentDate(this.$apiurl)
    };
  },
  mounted() {
    getLocation(this.$apiurl);

    this.dataSubscription = getStackedRegions(this.$apiurl).subscribe(d => {
      this.data = d;
      this.nestedData = d[this.selectedVariable];
    });

    this.tableSubscription = getEpiTable(
      this.$apiurl,
      null,
      [0, 1, 2],
      "-confirmed",
      10,
      0
    ).subscribe(_ => null);

    // Event listener for mobile responsiveness
    // $nextTick waits till DOM rendered
    this.$nextTick(function() {
      window.addEventListener("resize", this.setDims);
      // set initial dimensions for the stacked area plots.
      this.setDims();
    });
  },
  destroyed() {
    this.dataSubscription.unsubscribe();
    this.tableSubscription.unsubscribe();
    window.removeEventListener("resize", this.setDims);
  }
};
</script>

<style lang="scss" scoped>
.tooltip-countries {
    background: white;
    position: fixed;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1000;
    pointer-events: none;
}

.tooltip-countries-detailed {
    background: white;
    position: fixed;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1001;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.click-affordance {
    width: 100%;
    text-align: center;
    font-size: 0.85em;
}

.text-spacing-1 {
    letter-spacing: 1px;
    word-spacing: 3px;
}

.header-banner {
    background-image: url("~@/assets/texture.png");
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
