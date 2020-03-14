<template>
  <div class="home flex-column align-left">
    <div v-if="loading" class="loader">
      <i class="fas fa-circle-notch fa-spin fa-4x text-highlight"></i>
    </div>
    <!-- INTRO -->
    <Warning
      :animate="false"
      :text="
        'Our data is in the process of being updated; as a result, regional case counts are not currently correct. Sorry-- it will be fixed soon.'
      "
    ></Warning>
    <section class="row m-0 half-page">
      <div
        class="col-sm-12 col-md-4 d-flex justify-content-center align-items-center bg-main__darker px-0 back-1"
      >
        <div>
          <img
            src="@/assets/logo-full-white-01.svg"
            alt="Outbreak.info"
            class="w-75"
          />
        </div>
      </div>
      <div
        class="col-sm-12 col-md-8 d-flex justify-content-center align-items-center pl-0 bg-grey__lightest hero"
      >
        <div class="container">
          <h5>
            During outbreaks of emerging diseases such as COVID-19, efficiently
            collecting, sharing, and integrating data is critical to scientific
            research.
          </h5>
          <h5 class="mt-5 text-dark font-weight-bold">
            <b class="text-highlight">outbreak.info</b> is a resource to
            aggregate all this information into a single location.
          </h5>
        </div>
      </div>
    </section>
    <!-- SEARCH  -->
    <section
      class="d-flex justify-content-center align-items-center bg-sec text-light py-5"
    >
      <div class="d-none">
        <h5>SEARCH LOCATION</h5>
        <svg viewBox="0 0 100 3">
          <line x1="0" y1="0" x2="100" stroke="#D13B62" />
        </svg>
        <SearchBar></SearchBar>
        <small id="sBar" class="form-text text-light d-block"
          >Search updated information on COVID-19</small
        >
      </div>
    </section>
    <!-- EPI CURVE SUMMARIES -->
    <section class="mt-5" id="regional-epi-curves">
      <template v-if="nestedData.length > 0">
        <div
          class="region-tooltip-plots"
          v-for="(region, idx) in regionDict"
          :key="idx"
        >
          <div
            class="tooltip-countries"
            :id="idx"
            :style="{
              visibility: region.display ? 'visible' : 'hidden',
              left: region.x + 'px',
              top: region.y + 'px'
            }"
          >
            <div>
              {{ region.region }}
            </div>
            <div>{{ region.currentCases }} total cases</div>
            <div
              class="click-affordance py-1"
              :style="{ background: lightColor }"
            >
              click for details
            </div>
          </div>
          <CountryBarGraph
            :region="region.region"
            :id="idx"
            :style="{
              visibility: region.displayMore ? 'visible' : 'hidden'
            }"
            @regionSelected="handleTooltip"
            class="tooltip-countries-detailed"
          />
        </div>
      </template>
      <template v-if="nestedData.length > 0">
        <CaseSummary class="container" />
        <h3>Cumulative Number of COVID-19 Cases by Region</h3>
        <DataUpdated />
      </template>
      <div
        id="regional-stacked-area-plots d-flex"
        ref="regional_stacked_area_plots"
      >
        <div class="row" v-if="nestedData.length > 0">
          <div class="col-sm-12 col-md-6">
            <EpiStacked
              :width="stackedWidth"
              :height="stackedHeight"
              :data="nestedData"
              id="all-data"
              title="Worldwide"
              @regionSelected="handleTooltip"
            />
          </div>
          <div class="col-sm-12 col-md-6">
            <EpiStacked
              :width="stackedWidth"
              :height="stackedHeight"
              :data="noChina"
              id="no-china"
              title="Outside Mainland China"
              @regionSelected="handleTooltip"
            />
          </div>
        </div>
      </div>
      <DataSource v-if="nestedData.length > 0" />
    </section>

    <section class="case-data-table">
      <EpiTable :data="cases" :routable="true" :colorScale="regionColorScale" />
    </section>

    <section class="case-map">
      <LeafletMap :data="cases" />
    </section>

    <section>
      <p>
        <small class="text-muted"
          >Disclaimer: outbreak.info is a work-in-progress.</small
        >
      </p>
      <p class="focustext">
        Notice a bug, know of a COVID-19 data source, or want to suggest a
        feature?
      </p>
      <p class="text-center">
        <a
          class="btn btn-main m-5"
          href="https://github.com/SuLab/outbreak.info/issues"
          rel="noreferrer"
          target="_blank"
          >Submit an issue on Github</a
        >
      </p>
    </section>
    <Logos />

  </div>
</template>
<script>
// @ is an alias to /src
import EpiStacked from "@/components/EpiStacked.vue";
import CountryBarGraph from "@/components/CountryBarGraph.vue";
import CaseSummary from "@/components/CaseSummary.vue";
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";
import EpiTable from "@/components/EpiTable.vue";
import LeafletMap from "@/components/LeafletMap.vue";
import SearchBar from "@/components/SearchBar.vue";
import Logos from "@/components/Logos.vue";
import Warning from "@/components/Warning.vue";

import { mapState } from "vuex";

import { nestRegions } from "@/js/importEpi";

import { cloneDeep } from "lodash";

import store from "@/store";

export default {
  name: "Home",
  components: {
    EpiStacked,
    CountryBarGraph,
    CaseSummary,
    DataUpdated,
    DataSource,
    EpiTable,
    LeafletMap,
    SearchBar,
    Logos,
    Warning
  },
  data() {
    return {
      stackedWidth: 500,
      stackedHeight: 250,
      searchQuery: ""
    };
  },
  watch: {},
  computed: {
    ...mapState("admin", ["loading"]),
    ...mapState("geo", ["regionDict"]),
    ...mapState("epidata", ["cases"]),
    lightColor: function() {
      const scale = store.getters["colors/getRegionColor"];
      return scale(this.region, 0.85);
    },
    nestedData() {
      return nestRegions(this.cases.flatMap(d => d.data));
    },
    noChina() {
      if (this.nestedData) {
        const data = cloneDeep(this.nestedData);
        data.forEach(d => {
          d["China"] ? delete d["China"] : null;
        });
        return data;
      } else {
        return null;
      }
    }
  },
  methods: {
    handleTooltip(selected) {
      store.commit("geo/setRegionTooltip", selected);
    },
    regionColorScale: function(location) {
      const scale = store.getters["colors/getRegionColorFromLocation"];
      return scale(location);
    },
    setDims() {
      const selector = this.$refs.regional_stacked_area_plots;

      if (selector) {
        const dims = selector.getBoundingClientRect();
        // const dims = {window.innerWidth, height: window.innerHeight}
        const whRatio = 5 / 3;
        const widthThresh = 700;

        this.stackedWidth =
          dims.width < widthThresh ? dims.width : dims.width / 2 - 5;
        const idealHeight = this.stackedWidth / whRatio;
        if (idealHeight < window.innerHeight) {
          this.stackedHeight = idealHeight;
        } else {
          this.stackedHeight = window.innerHeight;
          this.stackedWidth = this.stackedHeight * whRatio;
        }
      }
    }
  },
  mounted() {
    // The watching works... but doesn't stick when the route gets changed :(
    // this.$store.watch(
    //   (state, getters) => state.epidata.cases,
    //   (newValue, oldValue) => {
    //     console.log("this.changed")
    //     this.nestedData = nestRegions(newValue.flatMap(d => d.data));
    //     // console.log(this.nestedData)
    //     // return(this.nestedData)
    //   }, {deep: true}
    // )
    //

    // Event listener for mobile responsiveness
    // $nextTick waits till DOM rendered
    this.$nextTick(function() {
      window.addEventListener("resize", this.setDims);
      // set initial dimensions for the stacked area plots.
      this.setDims();
    });
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
</style>
