<template>
<div>
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
      countries: ["Italy", "South Korea", "UK", "Iran", "Japan", "Germany"],
      allCountries: [],
      allData: null,
      data: null,
      selectedCountries: ["Iran", "Italy"]
      // selectedCountries: ["Germany", "Norway", "Sweden", "Italy"]
      // selectedCountries: ["Singapore", "Macau", "Taiwan", "Hong Kong"]
      // selectedCountries: ["Italy", "South Korea", "UK", "Iran", "Japan"]
    }
  },
  watch: {
    selectedCountries: function() {
      console.log("watch triggered");
      this.filterData();
    }
  },
  methods: {
    removeRegion: function(country) {
      this.selectedCountries = this.selectedCountries.filter(d => d !== country);
    },
    filterData: function() {
      this.data = this.allData.filter(d => this.selectedCountries.includes(d.metadata.country));
    },
    getData: function() {
      d3.csv(this.dataUrl).then(data => {
        const parseDate = d3.timeParse("%m/%d/%y");
        console.log(data)

        data.forEach(d => {
          const metadata = {
            'province': d['Province/State'],
            'country': d['Country/Region'],
            id: d['Country/Region'].replace(/\s/g, "_"),
            lat: d["Lat"],
            lon: d["Long"]
          };
          delete d['Province/State'];
          delete d['Country/Region'];
          delete d['Lat'];
          delete d['Long'];
          const keys = Object.keys(d);

          d['data'] = keys.map(timepoint => {
            return ({
              "date_string": timepoint.replace(/\//g, "_"),
              "date": parseDate(timepoint),
              "cases": +d[timepoint],
              "id": `${metadata.country.replace(/\s/g, "_")}`
            })
          })

          keys.forEach(timepoint => delete d[timepoint]);

          d['data'].sort((a, b) => a.date - b.date);

          d['metadata'] = metadata;
          d['metadata']['currentCases'] = d.data.slice(-1)[0].cases;
        });

        this.allCountries = [...new Set(data.map(d => d.metadata.country))];

        this.allData = data
          .map(d => {
            return ({
              data: d['data'],
              metadata: d['metadata']
            })
          });

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
