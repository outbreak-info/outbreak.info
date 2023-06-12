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
          :class="{ 'active-btn': adminLevel === '0' }"
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
            :class="{ 'active-btn': adminLevel === '1' }"
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
              :class="{ 'active-btn': adminLevel === '1.5' }"
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
              :class="{ 'active-btn': adminLevel === '2' }"
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
          <select
            v-model="selectedVariable"
            class="select-dropdown"
            @change="debounceChangeVariable"
          >
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
            :adminLevel="adminLevel"
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
      :adminLevel="adminLevel"
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

<script setup>
import { inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { timeFormat } from 'd3-time-format';
import debounce from 'lodash/debounce';

import { getComparisonData } from '@/api/epi-comparison.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const Choropleth = lazyLoad('Choropleth');
const DataSource = lazyLoad('DataSource');
const DateSlider = lazyLoad('DateSlider');

const props = defineProps({
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
});

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const colorScale = ref(null);
const data = ref([]);
const blankMap = ref(null);
const outline = ref(null);
const selectedDate = ref(null);
const selectedMin = ref(null);
const selectedMax = ref(null);
const maxDate = ref(null);
const minDate = ref(new Date('2020-01-22 0:0'));
const dataSubscription = ref(null);
const selectedVariable = ref({
  label: '2 week change in cases/day',
  choro: 'cases vs. 2 weeks ago',
  value: 'confirmed_rolling_14days_ago_diff',
});
const variableOptions = ref([
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
]);
const adminLevel = ref('0');

const store = adminStore();
const { dataloading } = storeToRefs(store);

const formatDate = (dateStr) => {
  return timeFormat('%Y-%m-%d')(dateStr);
};

const getData = () => {
  dataSubscription.value = getComparisonData(
    apiUrl,
    props.location,
    adminLevel.value,
    props.variable,
    selectedVariable.value.choro,
    selectedDate.value,
  ).subscribe((results) => {
    data.value = results.data;
    outline.value = results.overlay;
    blankMap.value = results.blankMap;

    maxDate.value = results.maxDate;
    if (!selectedDate.value) {
      selectedDate.value = formatDate(results.maxDate);
    }
    colorScale.value = results.colorScale;
  });
};

const changeVariable = () => {
  router.push({
    path: 'maps',
    query: {
      location: props.location,
      admin_level: adminLevel.value,
      variable: selectedVariable.value.value,
      date: selectedDate.value,
    },
  });
};

const debounceChangeVariable = debounce(changeVariable, 250);

watch(
  route,
  (newRoute, oldRoute) => {
    adminLevel.value = newRoute.query.admin_level || '0';
    // reset selected min/max
    // If the data already exists, pull out the min/max.
    selectedMin.value = props.min || props.min === 0 ? +props.min : null;
    selectedMax.value = props.max || props.max === 0 ? +props.max : null;

    selectedDate.value = newRoute.query.date ? newRoute.query.date : props.date;

    setTimeout(() => {
      getData();
    }, 1000);
  },
  { immediate: true },
);

onMounted(() => {
  getData();

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});

onBeforeUnmount(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
});
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

.active-btn {
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
