<template>
<div class="full-page py-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>
  <!-- autocomplete region selector -->
  <Autocomplete class="m-auto" :items="allPlaces" :toAdd="addable" :selected="selectedPlaces" @selected="updateSelected" />
  <!-- too many to plot -->
  <div class="flex-column too-many-warning" v-if="dataLength > lengthThreshold && !variable.includes('Increase')">
    <div class="text-center m-auto p-2 bg-grey__lightest" style="max-width:700px;">
      <label class="b-contain m-auto">
        <span>show more than {{ lengthThreshold }} curves</span>
        <input type="checkbox" v-model="showAll" />
        <div class="b-input"></div>
      </label>
    </div>

    <div style="max-width:700px;" class="m-auto">
      <Warning :animate="true" class="mt-2" v-if="!showAll" :text="
            'You have selected a lot of places. Showing the top ' +
              lengthThreshold +
              ' with the highest current case counts'
          "></Warning>
    </div>
  </div>

  <!-- fixed y selector for small multiple bar graphs -->
  <div class="text-center m-auto p-2 bg-grey__lightest" style="max-width:700px;" v-if="variable.includes('Increase') && dataLength > 1">
    <label class="b-contain m-auto">
      <span>constant y-axis limits</span>
      <input type="checkbox" v-model="isFixedY" />
      <div class="b-input"></div>
    </label>
  </div>

  <!-- title / drop down variable selector -->
  <h4 class="plot-title pt-5 pb-3">
    Number of COVID-19 <select v-model="variable" class="select-dropdown" @change="changeVariable">
      <option v-for="option in variableOptions" :value="option.value" :key="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="locationName">
      in {{ locationName }}</span>
  </h4>

  <!-- date updated -->
  <DataUpdated />

  <Warning :animate="false" class="my-4" v-if="variable == 'testing_positivity'" text="Percent positive tests &ndash; the ratio of positive COVID-19 tests to all tests on a given day &ndash; is a noisy metric. States will occasionally report no tests (or no negative tests) one day, and huge backlog the next. A high positivity rate may indicate insufficient testing."></Warning>
  <Warning :animate="true" class="my-4" v-if="noData" text="No results. Testing/hospitalization data are currently only available for U.S. States (not Metro areas or Counties), and recovery data is not available for the U.S."></Warning>

  <div class="d-flex row m-0">
    <!-- bar graph -->
    <div class="d-flex flex-column" v-if="data$ && data$[0] && this.variable.includes('Increase')">
      <div class="w-100 px-3 d-flex justify-content-center flex-wrap" id="bar-group" ref="bar_group">
        <Bargraph v-for="(countryData,idx) in data$[0]" :key="idx" class="mr-3 mb-3" :data="countryData.value" :title="countryData.value[0].name" :variable="variable" :includeAxis="true" :width="bargraphWidth" :height="bargraphHeight"
          :includeTooltips="true" :location="location" :log="isLogY" :xVariableLim="xLim" :fixedYMax="yMax" :animate="true" :id="String(idx)" :color="colorScale(countryData.key)" />
      </div>
      <DataSource />
    </div>

    <!-- curve -->
    <EpiCurve class="row" id="curveContainer" :data="plottedData" :location="location" :variable="variable" :xVariableInput="xVariable" :log="isLogY" :loggable="variable != 'testing_positivity'" :percent="variable == 'testing_positivity'" :showAll="showAll" v-if="plottedData && showCurves && !this.variable.includes('Increase')" />

    <!-- table -->
    <EpiTable class="row overflow-auto" :locations="selectedPlaces" :colorScale="colorScale" colorVar="location_id" />
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import DataUpdated from "@/components/DataUpdated.vue";
import DataSource from "@/components/DataSource.vue";
import EpiCurve from "@/components/EpiCurve.vue";
import EpiTable from "@/components/EpiTable.vue";
import Autocomplete from "@/components/Autocomplete.vue";
import Bargraph from "@/components/Bargraph.vue";
import Warning from "@/components/Warning.vue";

import {
  getEpiData,
  epiDataSubject,
  epiTableSubject
} from "@/api/epi-traces.js"
import store from "@/store";
import {
  mapState
} from "vuex";
import {
  extent,
  max
} from "d3";

export default {
  name: "Epidemiology",
  components: {
    DataSource,
    DataUpdated,
    Warning,
    EpiCurve,
    EpiTable,
    Bargraph,
    Autocomplete
  },
  props: {
    variable: {
      type: String,
      default: "confirmed"
    },
    log: {
      type: String,
      default: "false"
    },
    xVariable: {
      type: String,
      default: "date"
    },
    fixedY: {
      type: String,
      default: "false"
    },
    location: String
  },
  data() {
    return {
      selectedPlaces: [],
      addable: [],
      data$: null,
      plottedData: [],
      showCurves: true,
      lengthThreshold: 8,
      showAll: false,
      isFixedY: false,
      bargraphWidth: 300,
      bargraphHeight: 400,
      yMax: null,
      variableOptions: [{
        label: "cumulative cases",
        value: "confirmed"
      }, {
        label: "cumulative recoveries",
        value: "recovered"
      }, {
        label: "cumulative hospitalizations",
        value: "testing_hospitalized"
      }, {
        label: "cumulative deaths",
        value: "dead"
      }, {
        //   label: "cumulative cases & deaths",
        //   value: "both"
        // }, {
        label: "daily new cases",
        value: "confirmed_numIncrease"
      }, {
        label: "daily new hospitalizations (U.S. States only)",
        value: "testing_hospitalizedIncrease"
      }, {
        label: "daily new deaths",
        value: "dead_numIncrease"
        // {
        //   label: "5 day case doubling rate",
        //   value: "confirmed_doublingRate"
        // }, {
        //   label: "5 day death doubling rate",
        //   value: "dead_doublingRate"
        // }
      }, {
        label: "cumulative COVID-19 tests (U.S. States only)",
        value: "testing_totalTestResults"
      }, {
        label: "daily new tests (U.S. States only)",
        value: "testing_totalTestResultsIncrease"
      }, {
        label: "percent positive tests (U.S. States only)",
        value: "testing_positivity"
      }
    ]
    };
  },
  computed: {
    ...mapState("admin", ["loading"]),
    ...mapState("epidata", ["allPlaces"]),
    colorScale: function() {
      const scale = store.getters["colors/getColor"];
      return scale;
    },
    noData: function() {
      if(this.data$){
      return(!this.data$[0].flatMap(d => d.value).map(d => d[this.variable]).some(d => d));
    } else {
      return(false)
    }
    },
    isLogY: function() {
      return (this.log === "true")
    },
    dataLength() {
      return this.data$ ? this.data$[0].length : null;
    },
    locationName() {
      if (this.data$ && this.data$[0].length === 1 && this.data$[0][0].value[0].name) {
        return this.data$[0][0].value[0].name;
      }
      return null;
    },
    xLim() {
      if (this.data$ && this.data$[0]) {
        return (extent(this.data$[0].flatMap(d => d.value), d => d.date));
      } else {
        return (null)
      }
    }
  },
  watch: {
    selectedPlaces: function(newValue, oldValue) {
      const newLocation = newValue ? newValue.join(";") : "";
      if (this.$route.query.location !== newLocation) {
        this.$router.push({
          path: "epidemiology",
          query: {
            location: newLocation,
            log: String(this.isLogY),
            variable: this.variable,
            xVariable: this.xVariable,
            fixedY: String(this.isFixedY)
          }
        });
      }
    },
    // route props
    location: function(newLocation, oldLocation) {
      this.setLocation(newLocation);
    },
    fixedY: function(newValue, oldValue) {
      if (newValue === "true") {
        this.yMax = max(this.plottedData.flatMap(d => d.value), d => d[this.variable]);
        this.isFixedY = true;
      } else {
        this.yMax = null;
        this.isFixedY = false;
      }
    },
    isFixedY: function(newValue, oldValue) {
      this.changeVariable();
    },
    showAll: function(newValue, oldValue) {
      if (newValue) {
        this.addable = [];
        this.plottedData = this.data$ ? this.data$[0] : null;
      } else {
        this.plottedData = this.hideExtra();
      }
    }
  },
  methods: {
    setLocation: function(locationString, nullLocationHandler) {
      if (locationString && locationString !== "") {
        const locations = locationString.split(";").map(d => d.trim());
        this.selectedPlaces = locations;
        this.dataSubscription = getEpiData(this.$apiurl, locations, null, "-confirmed", 10, 0).subscribe(d => {
          this.data$ = d;
          this.plottedData = this.data$[0].length > this.lengthThreshold ? this.hideExtra() : this.data$[0];
          this.isFixedY = this.fixedY == "true";
          this.yMax = this.isFixedY ? max(this.plottedData.flatMap(d => d.value), d => d[this.variable]) : null;
        });
        // need to call subscription in order to trigger calling API function and passing subscription to child
      } else {
        this.clearLocations();
      }
    },
    clearLocations: function() {
      this.selectedPlaces = [];
      epiDataSubject.next([]);
      epiTableSubject.next([]);
    },
    changeVariable() {
      this.yMax = this.isFixedY ? max(this.plottedData.flatMap(d => d.value), d => d[this.variable]) : null;
      this.$router.replace({
        path: "epidemiology",
        query: {
          location: this.location,
          log: String(this.isLogY),
          variable: this.variable,
          xVariable: this.xVariable,
          fixedY: String(this.isFixedY)
        }
      });
    },
    updateSelected: function(selected) {
      this.selectedPlaces = [...new Set(selected)];
    },
    updateAddable: function(selected) {
      this.addable = selected;
    },
    setDims: function() {
      const minWidth = 300;
      const hwRatio = 0.75;
      const marginPadding = 80; // size of margin
      const framePadding = 16; // size of margin
      const dimWidth = document.getElementById("bar-group") ? document.getElementById("bar-group").offsetWidth : minWidth;
      if (dimWidth < 350) {
        this.bargraphWidth = 300;
        this.bargraphHeight = this.bargraphWidth * hwRatio;
      } else if (dimWidth < 600) {
        this.bargraphWidth = dimWidth - framePadding - marginPadding;
        this.bargraphHeight = this.bargraphWidth * hwRatio;
      } else if (dimWidth < 1000) {
        this.bargraphWidth = (dimWidth - framePadding - marginPadding) / 2;
        this.bargraphHeight = this.bargraphWidth * hwRatio;
      } else if (dimWidth < 1200) {
        this.bargraphWidth = (dimWidth - framePadding - marginPadding) / 3;
        this.bargraphHeight = this.bargraphWidth * hwRatio;
      } else {

        this.bargraphWidth = (dimWidth - framePadding - marginPadding) / 4;
        this.bargraphHeight = this.bargraphWidth * hwRatio;
      }
    },
    hideExtra: function() {
      const selectedData = this.data$ ? this.data$[0]
        .slice()
        .sort((a, b) => b.currentCases - a.currentCases)
        .slice(0, this.lengthThreshold) : null;

      const toAdd = this.data$[0]
        .slice()
        .sort((a, b) => b.currentCases - a.currentCases)
        .slice(this.lengthThreshold)
        .map(d => d.key);
      this.addable = toAdd;
      return selectedData;
    }
  },
  destroyed() {
    window.removeEventListener("resize", this.setDims);
  },
  mounted() {
    this.setLocation(this.location);
    this.$nextTick(function() {
      window.addEventListener("resize", this.setDims);
      // set initial dimensions for the stacked area plots.
      this.setDims();
    });
  }
};
</script>

<style lang="scss" scoped>
.epi-group {
    align-items: center;
    width: 100%;
}
</style>
