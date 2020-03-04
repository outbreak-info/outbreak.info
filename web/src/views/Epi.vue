<template>
<div>
  <div id="presetLocations">
    <button v-for="place, idx in presetGroups" v-bind:key="idx" @click="selectGroup(place)">
      select {{place.label}}
    </button>
  </div>

  <template>
    <Autocomplete :items="allPlaces" :selected="selectedPlaces" @selected="updateSelected" />
  </template>

  <div class="flex">
    <EpiCurve v-bind:data="data" />
    <EpiTable v-bind:data="data" />
  </div>

</div>
</template>

<script>
// @ is an alias to /src
import EpiCurve from "@/components/EpiCurve.vue";
import EpiTable from "@/components/EpiTable.vue";
import Autocomplete from "@/components/Autocomplete.vue";
import {
  cleanEpi,
  nestEpiTrace
} from "@/js/importEpi.js";

import * as d3 from 'd3';

export default {
  name: "Epidemiology",
  components: {
    EpiCurve,
    EpiTable,
    Autocomplete
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
          label: "Middle East",
          locations: ["United Arab Emirates", "Iran", "Lebanon", "Iraq", "Bahrain", "Kuwait", "Saudi Arabia"]
        },
        {
          label: "Europe",
          locations: ["Italy", "Germany", "UK", "France", "Spain"]
        },
        {
          label: "United States",
          locations: ["US", "King County, WA", "Cook County, IL", "Tempe, AZ", "Orange, CA", "Los Angeles, CA", "Santa Clara, CA", "Boston, MA", "San Benito, CA", "Madison, WI", "San Diego County, CA", "San Antonio, TX",
            "Omaha, NE (From Diamond Princess)", "Travis, CA (From Diamond Princess)", "Lackland, TX (From Diamond Princess)", "Humboldt County, CA", "Sacramento County, CA", "Unassigned Location (From Diamond Princess)", "Portland, OR",
            "Snohomish County, WA", "Providence, RI", "Grafton County, NH", "Hillsborough, FL", "New York City, NY", "Placer County, CA", "San Mateo, CA", "Sarasota, FL", "Sonoma County, CA", "Umatilla, OR"
          ]
        }
      ],
      selectedPlaces: ["South Korea", "Iran", "Italy", "France", "US"]
    }
  },
  watch: {
    selectedPlaces: function() {
      this.filterData();
    },
  },
  methods: {
    updateSelected: function(selected) {
      this.selectedPlaces = selected;
    },
    selectGroup: function(locationGroup) {
      this.selectedPlaces = locationGroup.locations;
    },
    filterData: function() {
      this.data = this.allData.filter(d => this.selectedPlaces.map(d => d.toLowerCase()).includes(d.placeName.toLowerCase()));
    },
    getData: function() {
      d3.csv(this.dataUrl).then(data => {

        const rawCleaned = cleanEpi(data);

        let cleanedData = [];
        cleanedData = cleanedData.concat(nestEpiTrace(rawCleaned.flatMap(d => d.data), "region", "region"));
        cleanedData = cleanedData.concat(nestEpiTrace(rawCleaned.flatMap(d => d.data), "country", "country"));
        rawCleaned.forEach(d => {
          d['locationType'] = "sub-national";
          d['countries'] = [d.data[0].country];
          d['region'] = d.data[0].region;
          d['id'] = d.placeName.replace(/,\s/g, "_").replace(/\s/g, "_").replace(/\(/g, "_").replace(/\)/g, "_");
        })
        cleanedData = cleanedData.concat(rawCleaned.filter(d => d.placeName !== ""));

        this.allPlaces = [...new Set(cleanedData.map(d => d.placeName))];

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
