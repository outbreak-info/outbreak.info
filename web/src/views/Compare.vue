<template>
  <div class="full-page p-5 bg-light">
    <!-- dataLoading -->

    <div v-if="dataloading" class="map-loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>

    <h2>
      Places similar in
      <select
        v-model="selectedSimilarity"
        class="select-dropdown mr-2"
        @change="changeSimilarity"
      >
        <option
          v-for="option in similarOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      <div v-if="locationData">
        to

        <router-link
          :to="{ name: 'Epidemiology', query: { location: locationData.key } }"
        >
          {{ locationData.name }}
        </router-link>
      </div>
    </h2>

    <SearchBar
      class="w-100 mb-3"
      :selected="selectedLocation"
      placeholder="Select location"
      @location="changeLocation"
    />

    <div id="admin-selector" class="d-flex align-items-center">
      <small class="mr-1">include</small>
      <label
        v-for="option in adminOptions"
        :key="option"
        class="b-contain m-0 mr-2"
      >
        <small>{{ option }}</small>
        <input
          v-model.lazy="selectedAdminLevels"
          type="checkbox"
          :value="option"
          @change="changeAdmin"
        />
        <div class="b-input" />
      </label>
    </div>

    <div v-if="similar && similar.length" class="mt-5">
      <div class="legend d-flex justify-content-end my-3">
        <div class="mr-3 d-flex align-items-center">
          <div :style="{ background: '#d6d6d6' }" class="legend-rect mr-1" />
          <small>{{ locationData.name }}</small>
        </div>

        <div
          v-for="(place, idx) in similar"
          :key="idx"
          class="mr-3 d-flex align-items-center"
        >
          <div
            :style="{ background: colorScale(place.key) }"
            class="legend-rect mr-1"
          />
          <small>{{ place.name }}</small>
        </div>
      </div>
      <table>
        <tr
          v-for="(place, idx) in similar"
          :key="idx"
          class="d-flex align-items-center text-left mb-5"
        >
          <td>
            <MiniLocation
              :id="place.key"
              :lat="place.lat"
              :lon="place.lon"
              :colorScale="colorScale"
              :partOfUSA="place.partOfUSA"
            />
          </td>

          <td class="location-name">
            <div class="d-flex flex-column ml-3 mr-5">
              <router-link
                :to="{ name: 'Epidemiology', query: { location: place.key } }"
              >
                <h4 class="m-0 border-bottom">
                  {{ place.nameFormatted }}
                </h4>
              </router-link>
              <div class="d-flex justify-content-between">
                <div>
                  {{ similarity }}:
                  <b>{{ formatValue(place.similarValue) }}</b>
                </div>
                <div v-if="similarity !== 'population'">
                  population:
                  <b>{{ formatValue(place.values[0].population) }}</b>
                </div>
              </div>

              <div class="d-flex justify-content-between text-muted">
                <small>
                  {{ locationData.name }}:
                  <b>{{ formatValue(locationData.similarValue) }}</b>
                </small>
                <small v-if="similarity !== 'population'">
                  population:
                  <b>{{ formatValue(locationData.values[0].population) }}</b>
                </small>
              </div>
            </div>
          </td>

          <td>
            <LineComparison
              v-if="place.values"
              :data="place.values"
              :control="locationData.values"
              variable="confirmed_rolling_per_100k"
              :xDomain="xDomain"
              :yMax="yMaxC"
              :colorScale="colorScale"
              label="cases"
            />
          </td>
          <td>
            <LineComparison
              v-if="place.values"
              class="ml-3"
              :data="place.values"
              :control="locationData.values"
              variable="dead_rolling_per_100k"
              :xDomain="xDomain"
              :yMax="yMaxD"
              :colorScale="colorScale"
              label="deaths"
            />
          </td>
        </tr>
      </table>
    </div>

    <div v-else class="mt-5">No similar locations found</div>
  </div>
</template>

<script setup>
import { ref, inject, onBeforeUnmount, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { format } from 'd3-format';
import { scaleOrdinal } from 'd3-scale';
import debounce from 'lodash/debounce';

import { findSimilar } from '@/api/find-similar.js';
import { lazyLoad } from '@/js/lazy-load';
import { colorsStore } from '@/stores/colorsStore';
import { adminStore } from '@/stores/adminStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const MiniLocation = lazyLoad('MiniLocation');
const LineComparison = lazyLoad('LineComparison');
const SearchBar = lazyLoad('SearchBar');

const props = defineProps({
  location: String,
  admin_levels: String,
  variable: String,
  similarity: String,
});

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

const locationData = ref(null);
const similar = ref(null);
const xDomain = ref(null);
const yMaxC = ref(null);
const yMaxD = ref(null);
const colorScale = ref(null);
const selectedLocation = ref(null);
const selectedSimilarity = ref(null);
const similarOptions = ref([
  {
    value: 'population',
    label: 'population',
  },
  {
    value: 'confirmed',
    label: 'total cases',
  },
  {
    value: 'confirmed_per_100k',
    label: 'total cases per capita',
  },
  {
    value: 'confirmed_rolling',
    label: 'new cases today',
  },
  {
    value: 'confirmed_rolling_per_100k',
    label: 'new cases today per capita',
  },
  {
    value: 'dead',
    label: 'total deaths',
  },
  {
    value: 'dead_per_100k',
    label: 'total deaths per capita',
  },
  {
    value: 'dead_rolling',
    label: 'new deaths today',
  },
  {
    value: 'dead_rolling_per_100k',
    label: 'new deaths today per capita',
  },
]);
const selectedAdminLevels = ref([
  'countries',
  'non-U.S. States/Provinces',
  'U.S. States',
  'U.S. Metro Areas',
  'U.S. Counties',
]);
const adminOptions = ref([
  'countries',
  'non-U.S. States/Provinces',
  'U.S. States',
  'U.S. Metro Areas',
  'U.S. Counties',
]);
const dataSubscription = ref(null);

const storeAdmin = adminStore();
const storeColor = colorsStore();

const { dataloading } = storeToRefs(storeAdmin); // admin store state variable

const getSimilar = () => {
  if (props.location && props.similarity) {
    dataSubscription.value = findSimilar(
      apiUrl,
      props.location,
      props.variable,
      props.similarity,
      selectedAdminLevels.value,
    ).subscribe((results) => {
      similar.value = results.similar;
      locationData.value = results.location;
      xDomain.value = results.xDomain;
      yMaxC.value = results.yMaxC;
      yMaxD.value = results.yMaxD;
      colorScale.value = scaleOrdinal()
        .range(storeColor.$state.colors)
        .domain(similar.value.map((d) => d.key));
    });
  }
};

const changeSimilarity = () => {
  router.push({
    name: 'Compare',
    query: {
      location: props.location,
      admin_levels: props.admin_levels,
      variable: props.variable,
      similarity: selectedSimilarity.value,
    },
  });
};

const changeAdmin = () => {
  router.push({
    name: 'Compare',
    query: {
      location: props.location,
      admin_levels: selectedAdminLevels.value.join(';'),
      variable: props.variable,
      similarity: props.similarity,
    },
  });
};

const changeLocation = (location_id) => {
  selectedLocation.value = location_id;
  router.push({
    name: 'Compare',
    query: {
      location: location_id,
      admin_levels: props.admin_levels,
      variable: props.variable,
      similarity: props.similarity,
    },
  });
};

const formatValue = (val) => {
  return props.similarity.includes('_per_100k') ||
    props.similarity.includes('rolling')
    ? format(',.1f')(val)
    : format(',.0f')(val);
};

const debounceGetSimilar = debounce(getSimilar, 500);

watch(
  route,
  (newVal, oldVal) => {
    selectedAdminLevels.value = newVal.query.admin_levels
      ? newVal.query.admin_levels.split(';')
      : [];

    debounceGetSimilar();
  },
  { immediate: true, deep: true },
);

onBeforeUnmount(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
});

onMounted(() => {
  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});
</script>

<style lang="scss">
$check-scale: 0.85;
$legend-size: 15px;
.location-name {
  width: 350px;
}

.b-contain,
.b-input {
  /* Double-sized Checkboxes */
  -ms-transform: scale($check-scale);
  /* IE */
  -moz-transform: scale($check-scale);
  /* FF */
  -webkit-transform: scale($check-scale);
  /* Safari and Chrome */
  -o-transform: scale($check-scale);
  /* Opera */
  margin: auto;
}

.legend-rect {
  width: $legend-size;
  height: $legend-size;
  border: 1px solid $base-grey;
}
</style>
