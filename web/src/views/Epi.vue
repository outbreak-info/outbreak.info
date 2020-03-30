<template>
<div class="container full-page py-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>
  <!-- autocomplete region selector -->
  <Autocomplete class="m-auto" :items="allPlaces" :toAdd="addable" :selected="selectedPlaces" @selected="updateSelected" />
  <div class="flex-column too-many-warning" v-if="dataLength > lengthThreshold">
    <div class="text-center m-auto p-2 bg-grey__lightest" style="max-width:700px;">
      <label class="b-contain m-auto">
        <span>show more than {{ lengthThreshold }} curves</span>
        <input type="checkbox" v-model="showAll" @click="plotAll()" />
        <div class="b-input"></div>
      </label>
    </div>

    <!-- too many to plot -->
    <div style="max-width:700px;" class="m-auto">
      <Warning :animate="true" class="mt-2" v-if="!showAll" :text="
            'You have selected a lot of places. Showing the top ' +
              lengthThreshold +
              ' with the highest current case counts'
          "></Warning>
    </div>
  </div>

  <!-- title / drop down variable selector -->
  <h4 class="plot-title py-5">
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

  <div class="d-flex row m-0">
    <!-- bar graph -->
    <template v-if="data$ && data$[0] && this.variable.includes('numIncrease')">
      <div v-for="(countryData,idx) in data$[0]" :key="idx" class="d-flex mr-3 mb-3">
        <Bargraph :data="countryData.value" :title="countryData.value[0].name" :variable="variable" :includeAxis="true" :width="450" :height="250" :id="String(idx)" :color="'#126B93'" />
      </div>
    </template>

    <!-- curve -->
    <EpiCurve class="row" @addable="updateAddable" id="curveContainer" :location="location" :variable="variable" :log="isLogY" v-if="data$ && showCurves && !this.variable.includes('numIncrease')" />

    <!-- table -->
    <EpiTable class="row overflow-auto" :locations="selectedPlaces" :colorScale="colorScale" colorVar="location_id" />
  </div>
</div>
</template>

<script>
// @ is an alias to /src
import DataUpdated from "@/components/DataUpdated.vue";
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

export default {
  name: "Epidemiology",
  components: {
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
    location: String
  },
  data() {
    return {
      selectedPlaces: [],
      addable: [],
      data$: null,
      showCurves: true,
      lengthThreshold: 8,
      variableOptions: [{
        label: "cumulative cases",
        value: "confirmed"
      }, {
        label: "cumulative recoveries",
        value: "recovered"
      }, {
        label: "cumulative deaths",
        value: "dead"
      }, {
        label: "cumulative cases & deaths",
        value: "both"
      }, {
        label: "new cases",
        value: "confirmed_numIncrease"
      }, {
        label: "new deaths",
        value: "dead_numIncrease"
      }]
    };
  },
  computed: {
    ...mapState("admin", ["loading"]),
    ...mapState("epidata", ["allPlaces"]),
    colorScale: function() {
      const scale = store.getters["colors/getColor"];
      return scale;
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
            variable: this.variable
          }
        });
      }
    },
    // route props
    location: function(newLocation, oldLocation) {
      this.setLocation(newLocation);
    }
  },
  methods: {
    setLocation: function(locationString, nullLocationHandler) {
      if (locationString && locationString !== "") {
        const locations = locationString.split(";").map(d => d.trim());
        this.selectedPlaces = locations;
        this.dataSubscription = getEpiData(this.$apiurl, locations, null, "-confirmed_currentCases", 10, 0).subscribe(d => {
          console.log(d)
          this.data$ = d;
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
      this.$router.replace({
        path: "epidemiology",
        query: {
          location: this.location,
          log: String(this.isLogY),
          variable: this.variable
        }
      });

      // this.updatePlot();
    },
    updateSelected: function(selected) {
      this.selectedPlaces = [...new Set(selected)];
    },
    updateAddable: function(selected) {
      this.addable = selected;
    },
    selectGroup: function(locationGroup) {
      // this.selectedPlaces = locationGroup.locations;
    }
  },
  subscriptions() {
    return {}
  },
  mounted() {
    this.setLocation(this.location);
  }
};
</script>

<style lang="scss" scoped>
.epi-group {
    align-items: center;
    width: 100%;
}
</style>
