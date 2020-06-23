<template>
<div class="full-page p-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>
  <Choropleth :data="data" :colorScale="colorScale" :variable="sortVariable.value" />


  <h3 class="my-3">How much are regions improving?</h3>

  <div class="row">
    <!-- Region buttons -->
    <div class="col-sm-6 col-md-8 d-flex flex-wrap">
      <router-link class="btn btn-main-outline router-link no-underline m-1 d-flex align-items-center" role="button" :to="{ name: 'Compare', query: {admin_level: '0', sort: this.sortVariable.value} }">All countries</router-link>
      <div class="d-flex flex-column">
        <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location: 'country_iso3:USA', sort: this.sortVariable.value} }">U.S. States</router-link>
        <div class="d-flex">
          <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1.5', sort: this.sortVariable.value} }">U.S. Metro Areas</router-link>
          <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '2', location:'country_iso3:USA', sort: this.sortVariable.value} }">U.S. Counties</router-link>
        </div>
      </div>

      <div class="d-flex flex-wrap">
        <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:AUS', sort: this.sortVariable.value} }">Australian States</router-link>
        <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:CAN', sort: this.sortVariable.value} }">Canadian Provinces</router-link>
        <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:CHN', sort: this.sortVariable.value} }">Chinese Provinces</router-link>

      </div>
    </div>

    <!-- sort options -->
    <div class="col-sm-6 col-md-4">
      <span class="mr-2">Sort:</span>
      <select v-model="sortVariable" class="select-dropdown">
        <option v-for="option in sortOptions" :value="option" :key="option.value" v-html="option.label">
        </option>
      </select>
    </div>

  </div>

  <!-- Results label -->
  <div class="row mt-4 mb-2">
    <div class="col-sm-12 text-left text-muted">
      <b>{{numResults}}</b> results, sorted by <b v-html="sortVariable.label"></b>
    </div>
  </div>

  <!-- Loop over results -->
  <div class="row">
    <div class="col-sm-12 d-flex flex-wrap">
      <div class="d-flex flex-column m-1">

        <table>
          <tr>
            <th>

            </th>
            <th class="text-left">
              location
            </th>
            <th>
              cases / day
            </th>
            <th>
              deaths / day
            </th>
          </tr>
          <tr v-for="(item, idx) in data" :key="idx">
            <td>
              {{idx}}
            </td>
            <td class="text-left">
              <router-link :to="{ name: 'Epidemiology', query: {location: item.location_id} }">
                <h5>{{item.name}}<span v-if="item.state_name">, {{item.state_name}}</span></h5>
              </router-link>
            </td>
            <td>
              {{item.confirmed_numIncrease.toLocaleString()}}
            </td>
            <td>
              {{item.dead_numIncrease.toLocaleString()}}
            </td>

          </tr>
        </table>
      </div>
    </div>
  </div>

</div>
</template>

<script>
import {
  getComparisonData
} from "@/api/epi-comparison.js";

import {
  mapState
} from "vuex";
import {
  format,
  scaleSequential,
  max
} from "d3";
import {
  interpolateYlGnBu
} from "d3-scale-chromatic";

import Choropleth from "@/components/Choropleth.vue";

export default {
  name: "Compare",
  components: {
    Choropleth
  },
  props: {
    admin_level: String,
    location: String,
    sort: String
  },
  watch: {
    sortVariable() {
      this.getData();
    },
    admin_level() {
      this.getData();
    },
    location() {
      this.getData();
    }
  },
  data() {
    return {
      colorScale: null,
      data: [],
      dataSubscription: null,
      sortVariable: {
        label: "highest cases/day",
        value: "-confirmed_numIncrease"
      },
      sortOptions: [{
          label: "highest cases/day",
          value: "-confirmed_numIncrease"
        },
        {
          label: "lowest cases/day",
          value: "confirmed_numIncrease"
        },
        {
          label: "highest number of deaths",
          value: "-dead"
        },
        {
          label: "lowest number of deaths",
          value: "dead"
        }

      ]
    };
  },
  computed: {
    ...mapState("admin", ["loading"]),
    numResults() {
      return (this.data.length)
    }
  },
  mounted() {
    this.getData();
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
  },
  methods: {
    getData() {
      this.$router.push({
        path: "compare",
        query: {
          location: this.location,
          admin_level: this.admin_level,
          sort: this.sortVariable.value
        }
      });

      this.dataSubscription = getComparisonData(this.$apiurl, this.location, this.admin_level, this.sortVariable.value, 0, 1000).subscribe(results => {

        this.data = results;

        const ascVars = ["-confirmed_doublingRate", "-dead_doublingRate", "confirmed", "dead", "confirmed_numIncrease", "dead_numIncrease"];
        const variable = this.sortVariable.value.startsWith("-") ? this.sortVariable.value.slice(1) : this.sortVariable.value;
        const yMax = max(results, d => d[variable]);
        const domain = [0,Math.log10(yMax)];
        // const domain = ascVars.includes(variable) ? [0, yMax] : [yMax, 0];

        this.colorScale = scaleSequential(interpolateYlGnBu)
          .domain(domain).clamp(true);

        this.data.forEach(d => {
          // d.fill = this.colorScale(d[variable]);
          d.fill = this.colorScale(Math.log10(d[variable]));
        })
      })
    },
    formatNumber(value, digits = 1) {
      return (format(`,.${digits}f`)(value))
    }
  }
};
</script>

<style lang="scss" scoped>
#th-doubling-rates {
    font-weight: 400;
}
</style>
