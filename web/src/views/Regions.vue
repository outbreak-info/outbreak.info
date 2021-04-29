<template>
<div class="home flex-column text-left d-flex">
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>
  <section id="world_total" v-if="total" class="container my-5">
    <div class="row">
      <!-- EPI CURVE SUMMARIES -->

      <div class="col-sm-12 d-flex flex-column">
    <h3>
      Daily worldwide COVID-19
      <select v-model="variableObj" class="select-dropdown">
        <option v-for="option in totalOptions" :value="option" :key="option.value">
          {{ option.label }}
        </option>
      </select>
    </h3>
    <Bargraph :data="total" :title="null" :variableObj="variableObj" :includeAxis="true" :loggable="false" :width="800" :height="400" :includeTooltips="true" location="World" :log="false" :percapita="false" :animate="true" id="world-cases"
      color="#888380" />
    </div>
    </div>
  </section>

  <!-- EPI EXAMPLES -->
  <section id="regional data" class="container my-5">
    <div class="row">
      <!-- EPI CURVE SUMMARIES -->

      <div class="col-sm-12 d-flex">
        <section class="w-100" id="regional-epi-curves">
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
            <h3>
              Cumulative Number of COVID-19
              <select v-model="selectedVariable" class="select-dropdown" @change="changeVariable">
                <option v-for="option in variableOptions" :value="option.value" :key="option.value">
                  {{ option.label }}
                </option>
              </select>
              by Region
            </h3>
          </template>

          <div id="regional-stacked-area-plots d-flex" ref="regional_stacked_area_plots">
            <div class="row px-2" v-if="nestedData && nestedData.length > 0">
              <div class="col-sm-12 col-md-12">
                <EpiStacked :width="stackedWidth" :height="stackedHeight" :data="nestedData" :includeChinaAnnot="true" id="all-data" :title="`${selectedVariableLabel} Worldwide`" @regionSelected="handleTooltip" />

              </div>
            </div>
          </div>
          <DataSource v-if="nestedData && nestedData.length > 0" class="mx-4" :data="nestedData" dataType="regions" :ids="['NYT', 'JHU']" figureRef="epi-summary-svg" />
        </section>
      </div>


    </div>
  </section>

</div>
</template>


<script>
// @ is an alias to /src
import EpiStacked from "@/components/EpiStacked.vue";
import CountryBarGraph from "@/components/CountryBarGraph.vue";
import DataSource from "@/components/DataSource.vue";
import Bargraph from "@/components/Bargraph.vue";
import {
  getStackedRegions
} from "@/api/region-summary.js";

import {
  getWorldDailyCases
} from "@/api/epi-traces.js";

import {
  mapState
} from "vuex";

import store from "@/store";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

library.add(faSpinner);

export default {
  name: "Regions",
  components: {
    EpiStacked,
    Bargraph,
    CountryBarGraph,
    DataSource,
    FontAwesomeIcon
  },
  data() {
    return {
      stackedWidth: 500,
      stackedHeight: 250,
      data: null,
      total: null,
      dataSubscription: null,
      totalSubscription: null,
      nestedData: null,
      selectedVariable: "confirmed",
      variableObj: {
        label: "cases",
        ttip: "new cases",
        value: "confirmed_numIncrease",
        sources: ["NYT", "JHU"]
      },
      totalOptions: [{
        label: "cases",
        ttip: "new cases",
        value: "confirmed_numIncrease",
        sources: ["NYT", "JHU"]
      },{
        label: "deaths",
        ttip: "new deaths",
        value: "dead_numIncrease",
        sources: ["NYT", "JHU"]
      }],
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
  mounted() {
    this.dataSubscription = getStackedRegions(this.$apiurl).subscribe(d => {
      this.data = d;
      this.nestedData = d[this.selectedVariable];
    });
    this.totalSubscription = getWorldDailyCases(this.$apiurl).subscribe(d => {
      this.total = d;
    });

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
    this.totalSubscription.unsubscribe();
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
</style>
