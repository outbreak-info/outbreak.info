<template>
<div class="full-page p-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>

  <!-- Region buttons -->
  <div class="d-flex flex-wrap">
    <router-link class="btn btn-main-outline router-link no-underline m-1 d-flex align-items-center" role="button" :to="{ name: 'Compare', query: {admin_level: '0', variable: this.selectedVariable.value} }">All countries</router-link>
    <div class="d-flex flex-column">
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location: 'country_iso3:USA', variable: this.selectedVariable.value} }">U.S. States</router-link>
      <div class="d-flex">
        <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1.5', variable: this.selectedVariable.value} }">U.S. Metro Areas</router-link>
        <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '2', location:'country_iso3:USA', variable: this.selectedVariable.value} }">U.S. Counties</router-link>
      </div>
    </div>

    <!-- <div class="d-flex flex-wrap">
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:AUS', variable: this.selectedVariable.value} }">Australian States</router-link>
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:CAN', variable: this.selectedVariable.value} }">Canadian Provinces</router-link>
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:CHN', variable: this.selectedVariable.value} }">Chinese Provinces</router-link>

    </div> -->
  </div>

  <!-- variable options -->
  <div class="row d-flex justify-content-end">
    <select v-model="selectedVariable" class="select-dropdown">
      <option v-for="option in sortOptions" :value="option" :key="option.value" v-html="option.label">
      </option>
    </select>
  </div>

  <Choropleth :data="data" :colorScale="colorScale" :adminLevel="admin_level" :variable="selectedVariable.value" :variableLabel="selectedVariable.label" />


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
            <th class="px-3">
              new cases today
            </th>
            <th class="px-3">
                new deaths today
            </th>
            <th>
              2 week change in cases / day
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
              {{item.confirmed_numIncrease ? item.confirmed_numIncrease.toLocaleString() : ""}}
            </td>
            <td>
              {{item.dead_numIncrease ? item.dead_numIncrease.toLocaleString() : ""}}
            </td>
            <td>
              {{item.confirmed_change ? formatNumber(item.confirmed_change) : ""}}
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
  jenks
} from "@/js/jenks.js";

import {
  mapState
} from "vuex";
import {
  format,
  scaleQuantile,
  scaleThreshold,
  max,
  min,
  range
} from "d3";
import {
  interpolateYlGnBu,
  interpolateBrBG,
  interpolatePRGn,
  interpolatePiYG,
  interpolateRdYlBu
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
    selectedVariable() {
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
      numColors: 11,
      data: [],
      dataSubscription: null,
      selectedVariable: {
        label: "2 week change in cases/day",
        value: "confirmed_change"
      },
      sortVariable: {
        label: "2 week change in cases/day",
        value: "confirmed_change"
      },
      sortOptions: [{
          label: "new cases/day",
          value: "confirmed_rolling"
        },
        {
          label: "new deaths/day",
          value: "dead_rolling"
        },
        {
          label: "2 week change in cases/day",
          value: "confirmed_change"
        },
        {
          label: "2 week change in deaths/day",
          value: "dead_change"
        },
        {
          label: "total deaths",
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
        path: "maps",
        query: {
          location: this.location,
          admin_level: this.admin_level,
          variable: this.selectedVariable.value,
          sort: this.sortVariable.value
        }
      });

      this.dataSubscription = getComparisonData(this.$apiurl, this.location, this.admin_level, this.sortVariable.value, 0, 1000).subscribe(results => {
        results.sort((a,b) => b[this.sortVariable.value] - a[this.sortVariable.value])

        this.data = results;

        // Jenks natural breaks based off http://bl.ocks.org/micahstubbs/8fc2a6477f5d731dc97887a958f6826d
        // Forcing to be centered at 0 for the midpoint after the breaks are calculated
        var domain = jenks(results.map(d => d[this.selectedVariable.value]), (this.numColors));

        // color range
        var colorRange;
        if (["confirmed_change", "dead_change"].includes(this.selectedVariable.value)) {
          // ensure that the diverging scale is centered at 0.
          const midpoint = domain.findIndex((d, i) => (d < 0 && domain[i + 1] > 0) || d === 0);
          var padLength = (domain.length / 2) - midpoint;
          padLength = padLength % 2 ? padLength + 1 : padLength; // ensure that
          if (padLength < 0) {
            domain = domain.concat(Array(-1 * padLength).fill(domain.slice(-1)[0]));
          } else if (padLength > 0) {
            domain = Array(padLength).fill(domain[0]).concat(domain);
          }
          this.numColors = domain.length - 1;

          colorRange = range(0, 1, 1 / (this.numColors)).map(d => interpolateRdYlBu(d)).reverse();
        } else {
          colorRange = range(0, 0.5, 0.5 / this.numColors).map(d => interpolateRdYlBu(d)).reverse();
        }

        this.colorScale = scaleQuantile()
          .range(colorRange)
          .domain(domain);

        this.data.forEach(d => {
          d.fill = this.colorScale(d[this.selectedVariable.value]);
          // d.fill = this.colorScale(Math.log10(d[this.selectedVariable.value]));
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

td {
  padding: 5px;
  text-align: center;
  vertical-align: middle;
  border: none;
}

th {
  font-size: 0.95em;
  font-weight: 400;
  color: $grey-70;
}

.sort-hover {
  display: none;
}

.sort-grp.hover .sort-hover,
.sort-grp:hover .sort-hover {
  display: inline;
}

table {
  border-collapse: collapse;
  font-size: 0.85em;
}

tr {
  border-bottom: 1px solid #cacaca;
  // border-bottom: 1px solid $grey-40;
}

tr.table-header-merged {
  border-bottom: none;
  // border-bottom: 1px solid $grey-40;
}
</style>
