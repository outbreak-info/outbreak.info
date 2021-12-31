<template>
<div class="full-page py-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']"/>
  </div>
  <!-- autocomplete region selector -->
  <Autocomplete class="m-auto" :toAdd="addable" :selected="selectedPlaces" @selected="updateSelected" />
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
  <div class="text-center m-auto p-2 bg-grey__lightest d-flex" style="max-width:700px;">
    <label class="b-contain m-auto" v-if="variableObj.percapita !== false">
      <span>normalize to population</span>
      <input type="checkbox" v-model="isPerCapita" />
      <div class="b-input"></div>
    </label>
    <label class="b-contain m-auto" v-if="dataLength > 1 && variable.includes('Increase')">
      <span>constant y-axis limits</span>
      <input type="checkbox" v-model="isFixedY" />
      <div class="b-input"></div>
    </label>
    <label class="b-contain m-auto" v-if="dataLength > 1 && variable.includes('Increase')">
      <span>overlay graphs</span>
      <input type="checkbox" v-model="isOverlay" />
      <div class="b-input"></div>
    </label>
  </div>

  <!-- title / drop down variable selector -->
  <h4 class="plot-title pt-5 pb-3" v-if="location">
    Number of COVID-19
    <select v-model="variableObj" class="select-dropdown select-width" @change="changeVariable">
      <option v-for="option in variableOptions" :value="option" :key="option.value">
        {{ option.label }}
      </option>
    </select>
    <span v-if="locationName"> in {{ locationName }}</span>
    <span v-if="isPerCapita && variableObj.percapita !== false"> per 100,000 residents</span>
  </h4>

  <template v-else>
    <template v-if="!nolocation">
      <h4 class="plot-title pt-5 pb-3 text-highlight">Please select a location</h4>
      <button class="btn btn-main-outline" @click="lookupLocation">Find nearest location</button>
</template>

  <h4 class="plot-title pt-5 pb-3 text-highlight" v-else>Cannot find a nearby location. Please select a location.</h4>

</template>
  <!-- metro subparts -->
  <div v-if="subParts" class="mb-4">
    <router-link :to="{ hash: '#sub_parts' }">View counties in metro area(s)</router-link>
  </div>


  <div class="d-flex row m-0 content-wrapper">
    <!-- bar graph -->
    <div class="d-flex flex-column align-items-center" v-if="data$ && data$[0] && this.variable.includes('Increase')">
      <div class="w-100 px-3 d-flex justify-content-center flex-wrap" id="bar-group" ref="bar_group">
        <Bargraph v-for="(countryData, idx) in data$[0]" :key="idx" class="mr-3 mb-3" :data="countryData.value" :title="countryData.value[0].name" :variableObj="variableObj" :includeAxis="true" :width="bargraphWidth" :height="bargraphHeight" :transformChart="bargraphTransform"
        :includeTooltips="true" :location="location" :log="isLogY" :percapita="isPerCapita" :xVariableLim="xLim" :fixedYMax="yMax" :animate="true" :id="String(idx)" :color="colorScale(countryData.key)" />
      </div>

      <!-- source / download data -->

      <DataSource class="mx-3" :ids="variableObj.sources" dataType="epidemiology" figureRef="epi-bargraph" :numSvgs="data$[0].length" :data="data$[0]" v-if="data$" />

    </div>

    <!-- curve -->
    <template v-if="plottedData && showCurves && !this.variable.includes('Increase')">
      <EpiCurve class="row" id="curveContainer" :data="plottedData" :percapita="isPerCapita" :location="location" :variableObj="variableObj" :log="isLogY" :loggable="variable != 'testing_positivity'"
        :percent="variable == 'testing_positivity'" :xmin="xmin" :xmax="xmax" :showAll="showAll" />

      <!-- source / download data -->
      <DataSource class="col-sm-12" :ids="variableObj.sources" v-if="data$" dataType="epidemiology" figureRef="epi-curve" :data="data$[0]" />
    </template>

    <div class="container my-4 border-top pt-3" v-if="subParts" id="sub_parts">
      <div class="row">

        <small class="col-sm-6 col-lg-4 line-height-1 text-left pl-2 mb-3" v-for="(metro, mIdx) in subParts" :key="mIdx">
          <template v-if="metro.hasSubparts">
            <b>{{metro.key}}</b> metro area includes:
            <span v-for="(loc, idx) in metro.parts" :key="idx" class="line-height-1">
              <router-link :to="{name: 'Epidemiology', query: {location: loc.location_id, log: log, variable: variable, xVariable: xVariable, percapita: percapita}}" v-if="variable">
                {{loc.county_name}}, {{loc.admin1}}</router-link>
              <span v-if="idx < metro.parts.length - 1">; </span>
            </span>
          </template>
        </small>
      </div>
    </div>

    <!-- table -->
    <EpiTable class="row overflow-auto mx-5" :locations="selectedPlaces" :colorScale="colorScale" colorVar="location_id" />
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import DataSource from "@/components/DataSource.vue";
import EpiTable from "@/components/EpiTable.vue";
import Autocomplete from "@/components/Autocomplete.vue";
import Warning from "@/components/Warning.vue";

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

import {
  getEpiData,
  epiDataSubject,
  epiTableSubject
} from "@/api/epi-traces.js";

import {
  getLocation,
  processLocation
} from "@/js/get-location.js";
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
    Warning,
    EpiCurve: () => import( /* webpackPrefetch: true */ "@/components/EpiCurve.vue"),
    Bargraph: () => import( /* webpackPrefetch: true */ "@/components/Bargraph.vue"),
    EpiTable,
    Autocomplete,
    FontAwesomeIcon
  },
  props: {
    variable: {
      type: String,
      default: "confirmed_numIncrease"
    },
    log: {
      type: String,
      default: "false"
    },
    fixedY: {
      type: String,
      default: "false"
    },
    percapita: {
      type: String,
      default: "false"
    },
    location: String,
    xmin: String,
    xmax: String
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
      nolocation: false,
      isFixedY: false,
      isPerCapita: false,
      isOverlay: false,
      bargraphWidth: 750,
      bargraphHeight: 400,
      bargraphTransform: 1,
      yMax: null,
      variableObj: {
        label: "cumulative cases",
        value: "confirmed",
        sources: ["NYT", "JHU"]
      },
      variableOptions: [{
          label: "cumulative cases",
          ttip: "cases",
          value: "confirmed",
          sources: ["NYT", "JHU"]
        },
        {
          label: "cumulative recoveries",
          ttip: "recoveries",
          value: "recovered",
          sources: ["NYT", "JHU"]
        },
        {
          label: "cumulative deaths",
          ttip: "deaths",
          value: "dead",
          sources: ["NYT", "JHU"]
        },
        {
          label: "daily new cases",
          ttip: "new cases",
          value: "confirmed_numIncrease",
          sources: ["NYT", "JHU"]
        },
        {
          label: "daily new cases (7-day rolling average)",
          ttip: "new cases (7 day average)",
          value: "confirmed_rolling",
          sources: ["NYT", "JHU"]
        },
        {
          label: "daily new deaths",
          ttip: "new deaths",
          value: "dead_numIncrease",
          sources: ["NYT", "JHU"]
        },
        {
          label: "daily new deaths (7 day rolling average)",
          ttip: "new deaths (7 day average)",
          value: "dead_rolling",
          sources: ["NYT", "JHU"]
        }
      ]
    };
  },
  computed: {
    ...mapState("admin", ["loading"]),
    ...mapState("geo", ["allPlaces"]),
    colorScale: function() {
      const scale = store.getters["colors/getColor"];
      return scale;
    },
    noData: function() {
      if (this.data$) {
        return !this.data$[0]
          .flatMap(d => d.value)
          .map(d => d[this.variable])
          .some(d => d);
      } else {
        return false;
      }
    },
    isLogY: function() {
      return this.log === "true";
    },
    dataLength() {
      return this.data$ ? this.data$[0].length : null;
    },
    locationName() {
      if (
        this.data$ &&
        this.data$[0].length === 1 &&
        this.data$[0][0].value[0].name
      ) {
        return this.data$[0][0].value[0].name;
      }
      return null;
    },
    subParts() {
      if (
        this.data$
      ) {
        const parts = this.data$[0].map(d => {
          return ({
            key: d.value[0].name,
            parts: d.value[0].sub_parts,
            hasSubparts: d.value[0].sub_parts ? d.value[0].sub_parts.length > 0 : false
          })
        });
        return (parts.some(d => d.hasSubparts) ? parts : null)
      }
      return null;
    },
    xLim() {
      if (this.data$ && this.data$[0]) {
        return extent(
          this.data$[0].flatMap(d => d.value),
          d => d.date
        );
      } else {
        return null;
      }
    }
  },
  watch: {
    selectedPlaces: function(newValue, oldValue) {
      const newLocation = newValue ? newValue.join(";") : "";
      if (this.$route.query.location !== newLocation) {
        this.$router.push({
          name: "Epidemiology",
          params: {
            disableScroll: true
          },
          query: {
            location: newLocation,
            log: String(this.isLogY),
            variable: this.variable,
            fixedY: String(this.isFixedY),
            percapita: String(this.isPerCapita)
          }
        });
      }
    },
    // route props
    location: function(newLocation, oldLocation) {
      this.setLocation(newLocation);
    },
    variable: {
      immediate: true,
      handler(newVal, oldVal) {
        this.variableObj = this.variableOptions.filter(
          d => d.value == newVal
        )[0];
      }
    },
    fixedY: function(newValue, oldValue) {
      if (newValue === "true") {
        const varUsed = this.isPerCapita ? this.variable + "_per_100k" : this.variable;
        this.yMax = max(
          this.plottedData.flatMap(d => d.value),
          d => d[varUsed]
        );
        this.isFixedY = true;
      } else {
        this.yMax = null;
        this.isFixedY = false;
      }
    },
    isFixedY: function(newValue, oldValue) {
      this.changeVariable();
    },
    percapita: function(newValue, oldValue) {
      if (newValue === "true") {
        this.isPerCapita = true;
      } else {
        this.isPerCapita = false;
      }
    },
    isPerCapita: function(newValue, oldValue) {
      this.changeVariable();
    },
    isOverlay: function(newValue, oldValue) {
      if (newValue) {
        this.isOverlay = false;

        const newVariable = this.variable.replace("_numIncrease", "_rolling");
        this.$router.push({
          name: "Epidemiology",
          params: {
            disableScroll: true
          },
          query: {
            location: this.location,
            log: String(this.isLogY),
            variable: newVariable,
            fixedY: String(this.isFixedY),
            percapita: String(this.isPerCapita)
          }
        });
      }
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
        this.dataSubscription = getEpiData(
          this.$apiurl,
          locations,
          null,
          "-confirmed",
          10,
          0
        ).subscribe(d => {
          this.data$ = d;
          this.plottedData =
            this.data$[0].length > this.lengthThreshold ?
            this.hideExtra() :
            this.data$[0];
          this.isFixedY = this.fixedY == "true";
          this.isPerCapita = this.percapita == "true";
          const varUsed = this.isPerCapita ? this.variable + "_per_100k" : this.variable;
          this.yMax = this.isFixedY ?
            max(
              this.plottedData.flatMap(d => d.value),
              d => d[varUsed]
            ) :
            null;
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
      const newVariable = this.variableObj.value;

      // update y-max
      const varUsed = this.isPerCapita ? newVariable + "_per_100k" : newVariable;
      this.yMax = this.isFixedY ?
        max(
          this.plottedData.flatMap(d => d.value),
          d => d[varUsed]
        ) :
        null;

      this.$router.push({
        name: "Epidemiology",
        params: {
          disableScroll: true
        },
        query: {
          location: this.location,
          log: String(this.isLogY),
          variable: newVariable,
          xmin: this.xmin,
          xmax: this.xmax,
          fixedY: String(this.isFixedY),
          percapita: String(this.isPerCapita)
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
      const minWidth = 550;
      const hwRatio = 0.75;
      const marginPadding = 80; // size of margin
      const framePadding = 16; // size of margin
      const dimWidth = document.getElementById("bar-group") ?
        document.getElementById("bar-group").offsetWidth :
        minWidth;
     this.bargraphWidth = 650
     if(window.innerWidth < 360){
       this.bargraphTransform = 0.4
     } else if (window.innerWidth < 390){
      this.bargraphTransform = 0.45
     } else if (window.innerWidth < 630){
     this.bargraphTransform = 0.5
     } else if (window.innerWidth <790){
      this.bargraphTransform = 0.8
     } else {
       this.bargraphTransform = 1
     }
    },
    hideExtra: function() {
      const selectedData = this.data$ ?
        this.data$[0]
        .slice()
        .sort((a, b) => b.currentCases - a.currentCases)
        .slice(0, this.lengthThreshold) :
        null;

      const toAdd = this.data$[0]
        .slice()
        .sort((a, b) => b.currentCases - a.currentCases)
        .slice(this.lengthThreshold)
        .map(d => d.key);
      this.addable = toAdd;
      return selectedData;
    },
    lookupLocation() {
      store.state.admin.loading = true;
      getLocation(this.$apiurl).subscribe(nearestPlace => {
        store.state.admin.loading = false;
        if (nearestPlace != "none") {
          this.$router.push({
            name: "Epidemiology",
            query: {
              location: nearestPlace
            }
          });
        } else {
          this.nolocation = true;
        }
      })
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
.select-width{
  max-width:100%;
}
@media only screen and (max-width: 790px) {
.content-wrapper{
justify-content: center;
}


}
</style>
