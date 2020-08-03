<template>
<div class="full-page p-5 bg-light">
  <!-- loading -->
  <div v-if="dataloading" class="loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>

  <div class="d-flex">
    <!-- Region buttons -->
    <div class="d-flex flex-wrap">
      <router-link class="btn btn-main-outline router-link no-underline m-1 d-flex align-items-center" role="button" :class="{active: admin_level === '0'}"
        :to="{ name: 'Compare', query: {admin_level: '0', variable: this.selectedVariable.value, date: this.selectedDate} }">
        All
        countries</router-link>
      <div class="d-flex flex-column justify-content-around">
        <router-link class="btn btn-main-outline router-link no-underline m-1" :class="{active: admin_level === '1'}" role="button"
          :to="{ name: 'Compare', query: {admin_level: '1', location: 'country_iso3:USA', variable: this.selectedVariable.value} }">U.S. States</router-link>
        <div class="d-flex">
          <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :class="{active: admin_level === '1.5'}"
            :to="{ name: 'Compare', query: {admin_level: '1.5', variable: this.selectedVariable.value, date: this.selectedDate} }">U.S. Metro Areas
          </router-link>
          <router-link class="btn btn-main-outline router-link no-underline m-1" :class="{active: admin_level === '2', date: this.selectedDate}" role="button"
            :to="{ name: 'Compare', query: {admin_level: '2', location:'country_iso3:USA', variable: this.selectedVariable.value} }">U.S. Counties</router-link>
        </div>
      </div>

      <!-- <div class="d-flex flex-wrap">
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:AUS', variable: this.selectedVariable.value} }">Australian States</router-link>
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:CAN', variable: this.selectedVariable.value} }">Canadian Provinces</router-link>
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Compare', query: {admin_level: '1', location:'country_iso3:CHN', variable: this.selectedVariable.value} }">Chinese Provinces</router-link>

    </div> -->
    </div>

    <div class="d-flex flex-column ml-5 align-items-center justify-content-between">
      <!-- variable options -->
      <div class="row d-flex align-items-center">
        <select v-model="selectedVariable" class="select-dropdown">
          <option v-for="option in variableOptions" :value="option" :key="option.value" v-html="option.label">
          </option>
        </select>
      </div>
      <div class="slidecontainer d-flex align-items-center justify-content-between mt-2">
        <DateSlider v-model="selectedDate" :min="minDate" :max="maxDate" v-if="maxDate" />
        <i class="hidden fas fa-play btn btn-main-outline router-link no-underline ml-2 py-1 px-2" @click="playAnimation"></i>
      </div>
    </div>
  </div>

  <Choropleth :data="data" :selectedMin="selectedMin" :selectedMax="selectedMax" :colorScale="colorScale" :adminLevel="admin_level" :variable="selectedVariable.value" :variableLabel="selectedVariable.choro" :date1="selectedDate" />
  <DataSource :data="data" dataType="maps" figureRef="epi-map-svg" :ids="['NYT', 'JHU']" />


  <!-- Results label -->
  <!-- <div class="row mt-4 mb-2">
    <div class="col-sm-12 text-left text-muted">
      <b>{{numResults}}</b> results, sorted by <b v-html="sortVariable.label"></b>
    </div>
  </div> -->

  <!-- Loop over results -->
  <!-- <div class="row">
    <div class="col-sm-12 d-flex flex-wrap">
      <div class="d-flex flex-column m-1">

        <table>
          <tr>
            <th>

            </th>
            <th class="text-left">
              location
            </th>
            <th v-for="(column, idx) in columns" :key="idx" :id="`th-${column.value}`" :class="{
                sortable: `${column.sorted} 'px-3 pointer'`,
                'd-none d-md-table-cell px-3 pointer': !column.essential
              }" @click="sortColumn(column)">
              <div class="sort-grp">
                {{ column.label }}
                <font-awesome-icon :class="[column.sorted === 0 ? 'sort-hover' : 'hidden']" :icon="['fas', 'sort']" />
                <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="column.sorted === 1" />
                <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="column.sorted === -1" />
              </div>
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
              {{item.confirmed_rolling ? formatNumber(item.confirmed_rolling) : ""}}
            </td>
            <td>
              {{item.dead_rolling ? formatNumber(item.dead_rolling) : ""}}
            </td>
            <td>
              {{item.confirmed_rolling_14days_ago_diff ? formatNumber(item.confirmed_rolling_14days_ago_diff) : ""}}
            </td>

          </tr>
        </table>
      </div>
    </div>
  </div> -->

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
  timeParse,
  timeFormat,
  offset,
  format,
  scaleQuantile,
  scaleThreshold,
  max,
  min,
  timeDay,
  range
} from "d3";
import {
  // interpolateYlGnBu,
  // interpolateBrBG,
  // interpolatePRGn,
  // interpolatePiYG,
  interpolateRdYlBu
} from "d3-scale-chromatic";


// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUp,
  faArrowDown,
  faSort
} from "@fortawesome/free-solid-svg-icons";

library.add(faArrowUp);
library.add(faArrowDown);
library.add(faSort);

import Choropleth from "@/components/Choropleth.vue";
import DataSource from "@/components/DataSource.vue";
import DateSlider from "@/components/DateSlider.vue";

export default {
  name: "Compare",
  components: {
    Choropleth,
    DataSource,
    DateSlider,
    // FontAwesomeIcon
  },
  props: {
    admin_level: {
      type: String,
      default: "0"
    },
    variable: {
      type: String,
      default: "confirmed_rolling_14days_ago_diff"
    },
    location: String,
    min: String,
    max: String,
    date: String,
    sort: String,
  },
  watch: {
    variable: {
      immediate: true,
      handler(newVar, oldVar) {
        const filtered = this.variableOptions.filter(d => d.value === newVar);
        this.selectedVariable = filtered.length === 1 ? filtered[0] : null;
        // reset selected min/max
        // If the data already exists, pull out the min/max. If not, set it to null so the getData function will calc it
        this.selectedMin = this.min || this.min === 0 ? +this.min : (this.data ? Math.floor(min(this.data, d => d[this.selectedVariable.value])) : null);
        this.selectedMax = this.max || this.max === 0 ? +this.max : (this.data ? Math.ceil(max(this.data, d => d[this.selectedVariable.value])) : null);
      }
    },
    date: {
      immediate: true,
      handler(newDate, oldDate) {
        this.selectedDate = newDate;
      }
    },
    min: {
      immediate: true,
      handler(newMin, oldMin) {
        this.selectedMin = newMin || newMin === 0 ? +newMin : null;
      }
    },
    max: {
      immediate: true,
      handler(newMax, oldMax) {
        this.selectedMax = newMax || newMax === 0 ? +newMax : null;
      }
    },
    selectedDate() {
      this.$router.push({
        path: "maps",
        query: {
          location: this.location,
          admin_level: this.admin_level,
          variable: this.selectedVariable.value,
          sort: this.sortVariable.value,
          date: this.selectedDate,
          min: String(this.selectedMin),
          max: String(this.selectedMax)
        }
      });
    },
    selectedVariable() {
      this.$router.push({
        path: "maps",
        query: {
          location: this.location,
          admin_level: this.admin_level,
          variable: this.selectedVariable.value,
          sort: this.sortVariable.value,
          date: this.selectedDate
        }
      });
    },
    sortVariable() {
      this.$router.push({
        path: "maps",
        query: {
          location: this.location,
          admin_level: this.admin_level,
          variable: this.selectedVariable.value,
          sort: this.sortVariable.value,
          date: this.selectedDate,
          min: String(this.selectedMin),
          max: String(this.selectedMax)
        }
      });
    },
    '$route.params'() {
      this.getData(this.selectedDate);
    }
  },
  data() {
    return {
      colorScale: null,
      data: [],
      selectedDate: null,
      selectedMin: null,
      selectedMax: null,
      dateSlider: new Date(),
      maxDate: null,
      minDate: new Date("2020-01-22 0:0"),
      dataSubscription: null,
      selectedVariable: null,
      sortVariable: {
        label: "2 week change in cases/day",
        value: "confirmed_rolling_14days_ago_diff"
      },
      columns: [{
          label: "average new cases/day",
          value: "confirmed_rolling",
          sort_id: "confirmed_rolling",
          sorted: 0
        },
        {
          label: "average new deaths/day",
          value: "dead_rolling",
          sort_id: "dead_rolling",
          sorted: 0
        },
        {
          label: "2 week change in cases/day",
          value: "confirmed_rolling_14days_ago_diff",
          sort_id: "confirmed_rolling_14days_ago_diff",
          sorted: -1
        }
      ],
      variableOptions: [{
          label: "total cases per capita",
          choro: "total cases per 100,000 people",
          value: "confirmed_per_100k"
        },
        {
          label: "total deaths per capita",
          choro: "total deaths per 100,000 people",
          value: "dead_per_100k"
        },
        {
          label: "new cases/day",
          choro: "average new cases/day",
          value: "confirmed_rolling"
        },
        {
          label: "new cases/day per capita",
          choro: "average new cases/day per 100,000 people",
          value: "confirmed_rolling_per_100k"
        },
        {
          label: "new deaths/day",
          choro: "average new deaths/day",
          value: "dead_rolling"
        },
        {
          label: "new deaths/day per capita",
          choro: "average new deaths/day per 100,000 people",
          value: "dead_rolling_per_100k"
        },
        {
          label: "2 week change in cases/day",
          choro: "cases vs. 2 weeks ago",
          value: "confirmed_rolling_14days_ago_diff"
        },
        {
          label: "2 week change in cases/day per capita",
          choro: "cases vs. 2 weeks ago per 100,000 people",
          value: "confirmed_rolling_14days_ago_diff_per_100k"
        },
        {
          label: "2 week change in deaths/day",
          choro: "deaths vs. 2 weeks ago",
          value: "dead_rolling_14days_ago_diff"
        },
        {
          label: "2 week change in deaths/day per capita",
          choro: "deaths vs. 2 weeks ago per 100,000 people",
          value: "dead_rolling_14days_ago_diff_per_100k"
        }

      ]
    };
  },
  computed: {
    ...mapState("admin", ["dataloading"]),
    numResults() {
      return (this.data.length)
    }
  },
  mounted() {
    this.getData(this.selectedDate);
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
  },
  methods: {
    playAnimation() {
      console.log("playing animation")
      var currDate = this.minDate;
      var formattedDate;
      var i = 0;
      while (i < 2) {

        i = i + 1;

        setTimeout(() => {
          console.log(i)
          currDate = timeDay.offset(currDate, 100);
          formattedDate = this.formatDate(currDate);
          console.log(formattedDate)
          this.getData(formattedDate);
        }, 10)
      }
    },
    parseDate(dateStr) {
      return (timeParse("%Y-%m-%d")(dateStr))
    },
    formatDate(dateStr) {
      return (timeFormat("%Y-%m-%d")(dateStr))
    },
    getData(date) {
      this.dataSubscription = getComparisonData(this.$apiurl, this.location, this.admin_level, this.variable, this.sortVariable.value, date).subscribe(results => {
        this.data = results.data;

        // reset selected min/max
        this.selectedMin = this.min || this.min === 0 ? +this.min : Math.floor(min(this.data, d => d[this.selectedVariable.value]));
        this.selectedMax = this.max || this.max === 0 ? +this.max : Math.ceil(max(this.data, d => d[this.selectedVariable.value]));

        this.maxDate = results.maxDate;
        if (!this.selectedDate) {
          this.selectedDate = this.formatDate(results.maxDate);
        }
        this.colorScale = results.colorScale;
      })
    },
    formatNumber(value, digits = 1) {
      return (format(`,.${digits}f`)(value))
    },
    sortColumn(selected) {
      // reset other sorting funcs for arrow affordances
      const idx = this.columns.findIndex(d => d.sort_id === selected.sort_id);
      const sortVal = this.columns[idx].sorted;

      this.columns.forEach(d => {
        d.sorted = 0;
      })

      // previously unsorted or sorted asc; sort desc.
      if (sortVal === 0 || sortVal === 1) {
        this.columns[idx].sorted = -1;
        this.data.sort((a, b) => b[selected.sort_id] - a[selected.sort_id]);
      } else {
        this.columns[idx].sorted = 1;
        this.data.sort((a, b) => a[selected.sort_id] - b[selected.sort_id]);
      }

      this.sortVariable = selected;
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

.btn-main-outline.active {
    background: $primary-color !important;
    color: white;
}
</style>
