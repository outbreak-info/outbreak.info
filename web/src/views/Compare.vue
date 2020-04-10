<template>
<div class="full-page p-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>

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
        <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:AUS', sort: this.sortVariable.value} }">Australian Provinces</router-link>
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
      <div class="d-flex flex-column m-1" v-for="(item, idx) in data" :key="idx">

        <table>
          <tr>
            <th colspan="2" class="text-muted" id="th-doubling-rates">
              doubling rates past 5 days
            </th>
          </tr>
          <tr>
            <td>
              <router-link v-if="item.confirmed_doublingRate" :style="[sortVariable.value == 'confirmed_doublingRate' || sortVariable.value == '-confirmed_doublingRate' ? {background: item.fill} : {}]" class="py-1 px-2"
                :to="{ name: 'Doubling Rates', query: {location: item.location_id, variable:'confirmed'} }">
                cases: {{formatNumber(item.confirmed_doublingRate)}}
              </router-link>
              <span v-else>cases: {{formatNumber(item.confirmed_doublingRate)}}
              </span>
            </td>
            <td>
              <router-link v-if="item.dead_doublingRate" :style="[sortVariable.value == 'dead_doublingRate' || sortVariable.value == '-dead_doublingRate' ? {background: item.fill} : {}]" class="py-1 px-2"
              :to="{ name: 'Doubling Rates', query: {location: item.location_id, variable:'dead'} }">
              deaths: {{formatNumber(item.dead_doublingRate)}}
              </router-link>
              <span v-else>deaths: {{formatNumber(item.dead_doublingRate)}}
              </span>
            </td>
          </tr>
        </table>
        <router-link :to="{ name: 'Epidemiology', query: {location: item.location_id} }">
          <h5>{{item.name}}<span v-if="item.state_name">, {{item.state_name}}</span></h5>
        </router-link>
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

export default {
  name: "Compare",
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
      data: [],
      dataSubscription: null,
      sortVariable: {
        label: "case doubling rate (fastest &rarr; slowest)",
        value: "confirmed_doublingRate"
      },
      sortOptions: [{
          label: "case doubling rate (fastest &rarr; slowest)",
          value: "confirmed_doublingRate"
        },
        {
          label: "case doubling rate (slowest &rarr; fastest)",
          value: "-confirmed_doublingRate"
        },
        {
          label: "death doubling rate (fastest &rarr; slowest)",
          value: "dead_doublingRate"
        },
        {
          label: "death doubling rate (slowest &rarr; fastest)",
          value: "-dead_doublingRate"
        },
        {
          label: "largest improvement in case doubling rate",
          value: "f"
        },
        {
          label: "smallest improvement in case doubling rate",
          value: "s"
        },
        {
          label: "highest number of cases",
          value: "-confirmed"
        },
        {
          label: "lowest number of cases",
          value: "confirmed"
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

      this.dataSubscription = getComparisonData(this.$apiurl, this.location, this.admin_level, this.sortVariable.value, 0, 100).subscribe(results => {
        this.data = results;

        const ascVars = ["-confirmed_doublingRate", "-dead_doublingRate", "confirmed", "dead"];
        const variable = this.sortVariable.value.startsWith("-") ? this.sortVariable.value.slice(1) : this.sortVariable.value;
        const yMax = max(results, d => d[variable]);
        const domain = ascVars.includes(variable) ? [0, yMax] : [yMax, 0];

        const scale = scaleSequential(interpolateYlGnBu)
          .domain(domain).clamp(false);

        this.data.forEach(d => {
          d.fill = scale(d[variable]);
        })
      })
    },
    formatNumber(value, digits = 1) {
      return (format(`,.${digits}f`)(value))
    }
  }
};
</script>

<style lang="scss">
#th-doubling-rates {
    font-weight: 400;
}
</style>
