<template>
<div>
  <div id="presetCountries">
    <button v-for="country, idx in presetGroups" v-bind:key="idx" @click="selectGroup(country)">
      select {{country.label}}
    </button>
  </div>

  <div id="selectedCountries">
    <button v-for="country in selectedCountries" v-bind:key="country" @click="removeRegion(country)">
      {{country}}
      <font-awesome-icon class="remove-btn" :icon="['far', 'times-circle']" /></button>
  </div>
  <FilterEpi v-bind:countries="allCountries" v-model="selectedCountries" />

  <select v-model="selectedCountries" multiple id="country-selector">
    <option v-for="country in allCountries" v-bind:key="country" :value="country">{{country}}</option>
  </select>

  <EpiCurve v-bind:data="data" />
  <EpiTable v-bind:data="data" />
</div>
</template>

<script>
// @ is an alias to /src
import EpiCurve from "@/components/EpiCurve.vue";
import EpiTable from "@/components/EpiTable.vue";
import FilterEpi from "@/components/FilterEpi.vue";
import { cleanEpi, nestEpi } from "@/js/importEpi.js";

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
    FilterEpi,
    FontAwesomeIcon
  },
  data() {
    return {
      dataUrl: "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv",
      allCountries: [],
      allData: null,
      data: null,
      presetGroups: [
        {label: "top 5 case counts", countries: ["Mainland China", "South Korea", "Italy", "Iran", "Japan"]},
        {label: "top 5 case increases", countries: ["South Korea", "Iran", "Italy", "France", "Spain"]},
        {label: "Iran cluster", countries: ["Iran", "Iraq"]},
        {label: "Italy cluster", countries: ["Italy", "Germany", "UK", "France", "Spain"]}
      ],
      selectedCountries: ["South Korea", "Iran", "Italy", "France", "Spain"]
    }
  },
  watch: {
    selectedCountries: function() {
      console.log("watch triggered");
      this.filterData();
    }
  },
  methods: {
    selectGroup: function(country) {
      this.selectedCountries = country.countries;
    },
    removeRegion: function(country) {
      this.selectedCountries = this.selectedCountries.filter(d => d !== country);
    },
    filterData: function() {
      this.data = this.allData.filter(d => this.selectedCountries.includes(d.metadata.country));
    },
    getData: function() {
      d3.csv(this.dataUrl).then(data => {

        const cleanedData = cleanEpi(data);

        this.allCountries = [...new Set(cleanedData.map(d => d.metadata.country))];

        this.allData = cleanedData;

        this.filterData();


        // const nested = d3.nest()
        //   .key(d => d.metadata.country)
        //   .rollup(values => {
        //
        //   })
        //   .entries(this.data);
        // console.log('nested')
        // console.log(nested)

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
