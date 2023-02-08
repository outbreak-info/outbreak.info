<template>
  <div class="full-page p-5 bg-light">
    <!-- loading -->
    <div v-if="dataloading" class="map-loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <div class="d-flex mb-3">
      <!-- Region buttons -->
      <div class="d-flex flex-wrap">
        <router-link
          class="btn btn-main-outline router-link no-underline m-1 d-flex align-items-center"
          role="button"
          :class="{ active: admin_level === '0' }"
          :to="{
            name: 'Maps',
            query: {
              admin_level: '0',
              variable: selectedVariable.value,
              date: selectedDate,
            },
          }"
        >
          All countries
        </router-link>
        <div class="d-flex flex-column justify-content-around">
          <router-link
            class="btn btn-main-outline router-link no-underline m-1"
            :class="{ active: admin_level === '1' }"
            role="button"
            :to="{
              name: 'Maps',
              query: {
                admin_level: '1',
                location: 'iso3:USA',
                variable: selectedVariable.value,
                date: selectedDate,
              },
            }"
          >
            U.S. States
          </router-link>
          <div class="d-flex">
            <router-link
              class="btn btn-main-outline router-link no-underline m-1"
              role="button"
              :class="{ active: admin_level === '1.5' }"
              :to="{
                name: 'Maps',
                query: {
                  admin_level: '1.5',
                  location: 'iso3:USA',
                  variable: selectedVariable.value,
                  date: selectedDate,
                },
              }"
            >
              U.S. Metro Areas
            </router-link>
            <router-link
              class="btn btn-main-outline router-link no-underline m-1"
              :class="{ active: admin_level === '2' }"
              role="button"
              :to="{
                name: 'Maps',
                query: {
                  admin_level: '2',
                  location: 'iso3:USA',
                  variable: selectedVariable.value,
                  date: selectedDate,
                },
              }"
            >
              U.S. Counties
            </router-link>
          </div>
        </div>

        <!-- <div class="d-flex flex-wrap">
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Maps', query: {admin_level: '1', location:'iso3:AUS', variable: this.selectedVariable.value} }">Australian States</router-link>
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Maps', query: {admin_level: '1', location:'iso3:CAN', variable: this.selectedVariable.value} }">Canadian Provinces</router-link>
      <router-link class="btn btn-main-outline router-link no-underline m-1" role="button" :to="{ name: 'Maps', query: {admin_level: '1', location:'iso3:CHN', variable: this.selectedVariable.value} }">Chinese Provinces</router-link>

    </div> -->
      </div>

      <div
        class="d-flex flex-column ml-5 align-items-center justify-content-between"
      >
        <!-- variable options -->
        <div class="row d-flex align-items-center">
          <select v-model="selectedVariable" class="select-dropdown">
            <option
              v-for="option in variableOptions"
              :key="option.value"
              :value="option"
              v-html="option.label"
            />
          </select>
        </div>
        <div
          class="slidecontainer d-flex align-items-center justify-content-between mt-2"
        >
          <DateSlider
            v-if="maxDate"
            :date="selectedDate"
            :min="minDate"
            :max="maxDate"
            :adminLevel="admin_level"
          />
        </div>
      </div>
    </div>

    <Choropleth
      :data="data"
      :animate="animate"
      :blankMap="blankMap"
      :outline="outline"
      :selectedMin="selectedMin"
      :selectedMax="selectedMax"
      :colorScale="colorScale"
      :adminLevel="admin_level"
      :variable="selectedVariable.value"
      :variableLabel="selectedVariable.choro"
      :date1="selectedDate"
      :maxDate="maxDate"
    />
    <DataSource
      :data="data"
      dataType="maps"
      figureRef="epi-map-svg"
      :ids="['NYT', 'JHU']"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { timeFormat } from 'd3-time-format';

import { getComparisonData } from '@/api/epi-comparison.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

export default {
  name: 'Maps',
  components: {
    Choropleth: lazyLoad('Choropleth'),
    DataSource: lazyLoad('DataSource'),
    DateSlider: lazyLoad('DateSlider'),
  },
  props: {
    admin_level: {
      type: String,
      default: '0',
    },
    variable: {
      type: String,
      default: 'confirmed_rolling_14days_ago_diff',
    },
    location: String,
    min: String,
    max: String,
    date: String,
    animate: { type: Boolean, default: true },
  },
  data() {
    return {
      colorScale: null,
      data: [],
      blankMap: null,
      outline: null,
      selectedDate: null,
      selectedMin: null,
      selectedMax: null,
      maxDate: null,
      minDate: new Date('2020-01-22 0:0'),
      dataSubscription: null,
      selectedVariable: null,
      variableOptions: [
        {
          label: 'total cases per capita',
          choro: 'total cases per 100,000 people',
          value: 'confirmed_per_100k',
        },
        {
          label: 'total deaths per capita',
          choro: 'total deaths per 100,000 people',
          value: 'dead_per_100k',
        },
        {
          label: 'new cases/day',
          choro: 'average new cases/day',
          value: 'confirmed_rolling',
        },
        {
          label: 'new cases/day per capita',
          choro: 'average new cases/day per 100,000 people',
          value: 'confirmed_rolling_per_100k',
        },
        {
          label: 'new deaths/day',
          choro: 'average new deaths/day',
          value: 'dead_rolling',
        },
        {
          label: 'new deaths/day per capita',
          choro: 'average new deaths/day per 100,000 people',
          value: 'dead_rolling_per_100k',
        },
        {
          label: '2 week change in cases/day',
          choro: 'cases vs. 2 weeks ago',
          value: 'confirmed_rolling_14days_ago_diff',
        },
        {
          label: '2 week change in cases/day per capita',
          choro: 'cases vs. 2 weeks ago per 100,000 people',
          value: 'confirmed_rolling_14days_ago_diff_per_100k',
        },
        {
          label: '2 week change in deaths/day',
          choro: 'deaths vs. 2 weeks ago',
          value: 'dead_rolling_14days_ago_diff',
        },
        {
          label: '2 week change in deaths/day per capita',
          choro: 'deaths vs. 2 weeks ago per 100,000 people',
          value: 'dead_rolling_14days_ago_diff_per_100k',
        },
      ],
    };
  },
  computed: {
    ...mapState(adminStore, ['dataloading']),
  },
  watch: {
    '$route.params': {
      immediate: true,
      handler(newRoute, oldRoute) {
        // update selections based on routes
        const filtered = this.variableOptions.filter(
          (d) => d.value === this.variable,
        );
        this.selectedVariable = filtered.length === 1 ? filtered[0] : null;
        // reset selected min/max
        // If the data already exists, pull out the min/max.
        this.selectedMin = this.min || this.min === 0 ? +this.min : null;
        this.selectedMax = this.max || this.max === 0 ? +this.max : null;

        this.selectedDate = this.date;

        this.getData(this.selectedDate);
      },
    },
    selectedVariable() {
      this.$router.push({
        path: 'maps',
        query: {
          location: this.location,
          admin_level: this.admin_level,
          variable: this.selectedVariable.value,
          date: this.selectedDate,
        },
      });
    },
  },
  beforeUnmount() {
    this.dataSubscription.unsubscribe();
  },
  methods: {
    formatDate(dateStr) {
      return timeFormat('%Y-%m-%d')(dateStr);
    },
    getData(date) {
      this.dataSubscription = getComparisonData(
        this.$apiurl,
        this.location,
        this.admin_level,
        this.variable,
        this.selectedVariable.choro,
        date,
      ).subscribe((results) => {
        this.data = results.data;
        this.outline = results.overlay;
        this.blankMap = results.blankMap;

        this.maxDate = results.maxDate;
        if (!this.selectedDate) {
          this.selectedDate = this.formatDate(results.maxDate);
        }
        this.colorScale = results.colorScale;
      });
    },
  },
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

.map-loader {
  position: fixed;
  z-index: 100;
  top: 125px !important;
  left: 100px !important;
}
</style>
