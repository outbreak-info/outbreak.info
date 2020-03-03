<template>
<div>
  <div id="presetLocations">
    <button v-for="place, idx in presetGroups" v-bind:key="idx" @click="selectGroup(place)">
      select {{place.label}}
    </button>
  </div>

  <div id="selectedPlaces">
    <button class="chip" v-for="place in selectedPlaces" v-bind:key="place" @click="removeRegion(place)">
      {{place}}
      <font-awesome-icon class="remove-btn" :icon="['far', 'times-circle']" /></button>
  </div>

  <select v-model="selectedPlaces" multiple id="country-selector">
    <option v-for="place in allPlaces" v-bind:key="place" :value="place">{{place}}</option>
  </select>

  <EpiCurve v-bind:data="data" />
  <EpiTable v-bind:data="data" />
</div>
</template>

<script>
// @ is an alias to /src
import EpiCurve from "@/components/EpiCurve.vue";
import EpiTable from "@/components/EpiTable.vue";
import {
  cleanEpi,
  nestEpiTrace
} from "@/js/importEpi.js";

import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome'
import {
  library
} from '@fortawesome/fontawesome-svg-core';
import {
  faTimesCircle
} from '@fortawesome/free-regular-svg-icons';

library.add(faTimesCircle);

import * as d3 from 'd3';

export default {
  name: "Epidemiology",
  components: {
    EpiCurve,
    EpiTable,
    FontAwesomeIcon
  },
  data() {
    return {
      dataUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
      allPlaces: [],
      allData: null,
      data: null,
      presetGroups: [{
          label: "top 5 case counts",
          locations: ["Mainland China", "South Korea", "Italy", "Iran", "Japan"]
        },
        {
          label: "top 5 case increases",
          locations: ["South Korea", "Iran", "Italy", "France", "Spain"]
        },
        {
          label: "Iran cluster",
          locations: ["Iran", "Iraq"]
        },
        {
          label: "Italy cluster",
          locations: ["Italy", "Germany", "UK", "France", "Spain"]
        }
      ],
      selectedPlaces: ["South Korea", "Iran", "Italy", "France", "Spain"]
    }
  },
  watch: {
    selectedPlaces: function() {
      this.filterData();
    }
  },
  methods: {
    selectGroup: function(locationGroup) {
      this.selectedPlaces = locationGroup.locations;
    },
    removeRegion: function(location) {
      this.selectedPlaces = this.selectedPlaces.filter(d => d !== location);
    },
    filterData: function() {
      this.data = this.allData.filter(d => this.selectedPlaces.includes(d.metadata.placeName));
    },
    getData: function() {
      d3.csv(this.dataUrl).then(data => {

        const rawCleaned = cleanEpi(data);

        let cleanedData = [];
        cleanedData = cleanedData.concat(nestEpiTrace(rawCleaned.flatMap(d => d.data), "region", "region"));
        cleanedData = cleanedData.concat(nestEpiTrace(rawCleaned.flatMap(d => d.data), "country", "country"));
        rawCleaned.forEach(d => {
          d['metadata']['nestingType'] = "sub-national";
        })
        cleanedData = cleanedData.concat(rawCleaned);

        this.allPlaces = [...new Set(cleanedData.map(d => d.metadata.placeName))];

        this.allData = cleanedData;

        this.filterData();
      });
    }
  },
  mounted() {
    this.getData();
  }
};
</script>

<style lang="scss" scoped>
.remove-btn {
    font-size: 0.75em;
}
</style>
