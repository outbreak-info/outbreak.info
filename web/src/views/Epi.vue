<template>
  <div class="full-page py-5 bg-light">
    <!-- loading -->
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>
    <!-- autocomplete region selector -->
    <Autocomplete
      class="m-auto"
      :toAdd="addable"
      :selected="selectedPlaces"
      @selected="updateSelected"
    />
    <!-- too many to plot -->
    <div
      v-if="dataLength > lengthThreshold && !variable.includes('Increase')"
      class="flex-column too-many-warning"
    >
      <div
        class="text-center m-auto p-2 bg-grey__lightest"
        style="max-width: 700px"
      >
        <label class="b-contain m-auto">
          <span>show more than {{ lengthThreshold }} curves</span>
          <input v-model="showAll" type="checkbox" />
          <div class="b-input" />
        </label>
      </div>

      <div style="max-width: 700px" class="m-auto">
        <Warning
          v-if="!showAll"
          :animate="true"
          class="mt-2"
          :text="
            'You have selected a lot of places. Showing the top ' +
            lengthThreshold +
            ' with the highest current case counts'
          "
        />
      </div>
    </div>

    <!-- fixed y selector for small multiple bar graphs -->
    <div
      class="text-center m-auto p-2 bg-grey__lightest d-flex"
      style="max-width: 700px"
    >
      <label v-if="variableObj.percapita !== false" class="b-contain m-auto">
        <span>normalize to population</span>
        <input v-model="isPerCapita" type="checkbox" />
        <div class="b-input" />
      </label>
      <label
        v-if="dataLength > 1 && variable.includes('Increase')"
        class="b-contain m-auto"
      >
        <span>constant y-axis limits</span>
        <input v-model="isFixedY" type="checkbox" />
        <div class="b-input" />
      </label>
      <label
        v-if="dataLength > 1 && variable.includes('Increase')"
        class="b-contain m-auto"
      >
        <span>overlay graphs</span>
        <input v-model="isOverlay" type="checkbox" />
        <div class="b-input" />
      </label>
    </div>

    <!-- title / drop down variable selector -->
    <h4 v-if="location" class="plot-title pt-5 pb-3">
      Number of COVID-19
      <select
        v-model="variableObj"
        class="select-dropdown select-width"
        @change="changeVariable"
      >
        <option
          v-for="option in variableOptions"
          :key="option.value"
          :value="option"
        >
          {{ option.label }}
        </option>
      </select>
      <span v-if="locationName">in {{ locationName }}</span>
      <span v-if="isPerCapita && variableObj.percapita !== false">
        per 100,000 residents
      </span>
    </h4>

    <template v-else>
      <template v-if="!nolocation">
        <h4 class="plot-title pt-5 pb-3 text-highlight">
          Please select a location
        </h4>
        <button class="btn btn-main-outline" @click="lookupLocation">
          Find nearest location
        </button>
      </template>

      <h4 v-else class="plot-title pt-5 pb-3 text-highlight">
        Cannot find a nearby location. Please select a location.
      </h4>
    </template>
    <!-- metro subparts -->
    <div v-if="subParts" class="mb-4">
      <router-link :to="{ hash: '#sub_parts' }">
        View counties in metro area(s)
      </router-link>
    </div>

    <div class="d-flex row m-0 content-wrapper">
      <!-- bar graph -->
      <div
        v-if="data && data[0] && variable.includes('Increase')"
        class="d-flex flex-column align-items-center"
      >
        <div
          id="bar-group"
          ref="bar_group"
          class="w-100 px-3 d-flex justify-content-center flex-wrap"
        >
          <Bargraph
            v-for="(countryData, idx) in data[0]"
            :key="idx"
            class="mr-3 mb-3"
            :data="countryData.value"
            :title="countryData.value[0].name"
            :variableObj="variableObj"
            :includeAxis="true"
            :width="bargraphWidth"
            :height="bargraphHeight"
            :transformChart="bargraphTransform"
            :tooltipIdx="'n-' + idx"
            :includeTooltips="true"
            :location="location"
            :log="isLogY"
            :percapita="isPerCapita"
            :xVariableLim="xLim"
            :fixedYMax="yMax"
            :animate="true"
            :id="String(idx)"
            :color="colorScaleFunc(countryData.key)"
          />
        </div>

        <!-- source / download data -->

        <DataSource
          v-if="data"
          class="mx-3"
          :ids="variableObj.sources"
          dataType="epidemiology"
          figureRef="epi-bargraph"
          :numSvgs="data[0].length"
          :data="data[0]"
        />
      </div>

      <!-- curve -->
      <template
        v-if="plottedData && showCurves && !variable.includes('Increase')"
      >
        <EpiCurve
          id="curveContainer"
          class="row"
          :data="plottedData"
          :percapita="isPerCapita"
          :location="location"
          :variableObj="variableObj"
          :log="isLogY"
          :loggable="variable !== 'testing_positivity'"
          :percent="variable === 'testing_positivity'"
          :xmin="xmin"
          :xmax="xmax"
          :showAll="showAll"
        />

        <!-- source / download data -->
        <DataSource
          v-if="data"
          class="col-sm-12"
          :ids="variableObj.sources"
          dataType="epidemiology"
          figureRef="epi-curve"
          :data="data[0]"
        />
      </template>

      <template v-if="subParts">
        <div class="row">
          <small
            v-for="(metro, mIdx) in subParts"
            :key="mIdx"
            class="col-sm-6 col-lg-4 line-height-1 text-left pl-2 mb-3"
          >
            <div v-if="metro.hasSubparts">
              <b>{{ metro.key }}</b>
              metro area includes:

              <span
                v-for="(loc, idx) in metro.parts"
                :key="idx"
                class="line-height-1"
              >
                <router-link
                  v-if="variable"
                  :to="{
                    name: 'Epidemiology',
                    query: {
                      location: loc.location_id,
                      log: log,
                      variable: variable,
                      percapita: percapita,
                    },
                  }"
                >
                  {{ loc.county_name }}, {{ loc.admin1 }}
                </router-link>
                <span v-if="idx < metro.parts.length - 1">;</span>
              </span>
            </div>
          </small>
        </div>
      </template>

      <!-- table -->
      <EpiTable
        class="row overflow-auto mx-5"
        :locations="selectedPlaces"
        :colorScale="colorScale"
        colorVar="location_id"
      />
    </div>
  </div>
</template>

<script setup>
import {
  computed,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { extent, max } from 'd3-array';

import {
  epiDataSubject,
  epiTableSubject,
  getEpiData,
} from '@/api/epi-traces.js';
import { getLocation } from '@/js/get-location.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { geoStore } from '@/stores/geoStore';
import { colorsStore } from '@/stores/colorsStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead';

const DataSource = lazyLoad('DataSource');
const Warning = lazyLoad('Warning');
const EpiCurve = lazyLoad('EpiCurve');
const Bargraph = lazyLoad('Bargraph');
const EpiTable = lazyLoad('EpiTable');
const Autocomplete = lazyLoad('Autocomplete');

const props = defineProps({
  variable: {
    type: String,
    default: 'confirmed_numIncrease',
  },
  log: {
    type: String,
    default: 'false',
  },
  fixedY: {
    type: String,
    default: 'false',
  },
  percapita: {
    type: String,
    default: 'false',
  },
  location: String,
  xmin: String,
  xmax: String,
});

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const selectedPlaces = ref([]);
const addable = ref([]);
const data = ref(null);
const plottedData = ref([]);
const showCurves = ref(true);
const lengthThreshold = ref(8);
const showAll = ref(false);
const nolocation = ref(false);
const isFixedY = ref(false);
const isPerCapita = ref(false);
const isOverlay = ref(false);
const bargraphWidth = ref(750);
const bargraphHeight = ref(400);
const bargraphTransform = ref(1);
const yMax = ref(null);
const variableObj = ref({
  label: 'cumulative cases',
  ttip: 'cases',
  value: 'confirmed',
  sources: ['NYT', 'JHU'],
});
const variableOptions = ref([
  {
    label: 'cumulative cases',
    ttip: 'cases',
    value: 'confirmed',
    sources: ['NYT', 'JHU'],
  },
  {
    label: 'cumulative deaths',
    ttip: 'deaths',
    value: 'dead',
    sources: ['NYT', 'JHU'],
  },
  {
    label: 'daily new cases',
    ttip: 'new cases',
    value: 'confirmed_numIncrease',
    sources: ['NYT', 'JHU'],
  },
  {
    label: 'daily new cases (7-day rolling average)',
    ttip: 'new cases (7 day average)',
    value: 'confirmed_rolling',
    sources: ['NYT', 'JHU'],
  },
  {
    label: 'daily new deaths',
    ttip: 'new deaths',
    value: 'dead_numIncrease',
    sources: ['NYT', 'JHU'],
  },
  {
    label: 'daily new deaths (7 day rolling average)',
    ttip: 'new deaths (7 day average)',
    value: 'dead_rolling',
    sources: ['NYT', 'JHU'],
  },
]);

const dataSubscription = ref(null);

const storeAdmin = adminStore();
const storeGeo = geoStore();
const store = colorsStore();

const { loading } = storeToRefs(storeAdmin);
const { allPlaces } = storeToRefs(storeGeo);

const colorScaleFunc = (location) => {
  return store.getColor(location);
};

// computed properties
const colorScale = computed(() => {
  return store.getColor;
});

const isLogY = computed(() => {
  return props.log === 'true';
});

const dataLength = computed(() => {
  return data.value ? data.value[0].length : null;
});

const locationName = computed(() => {
  if (
    data.value &&
    data.value[0].length === 1 &&
    data.value[0][0].value[0].name
  ) {
    return data.value[0][0].value[0].name;
  }
  return null;
});

const subParts = computed(() => {
  if (data.value) {
    const parts = data.value[0].map((d) => {
      return {
        key: d.value[0].name,
        parts: d.value[0].sub_parts,
        hasSubparts: d.value[0].sub_parts
          ? d.value[0].sub_parts.length > 0
          : false,
      };
    });
    return parts.some((d) => d.hasSubparts) ? parts : null;
  }
  return null;
});

const xLim = computed(() => {
  if (data.value && data.value[0]) {
    return extent(
      data.value[0].flatMap((d) => d.value),
      (d) => d.date,
    );
  } else {
    return null;
  }
});

// methods functions
const clearLocations = () => {
  selectedPlaces.value = [];
  epiDataSubject.next([]);
  epiTableSubject.next([]);
};

const hideExtra = () => {
  const selectedData = data.value
    ? data.value[0]
        .slice()
        .sort((a, b) => b.currentCases - a.currentCases)
        .slice(0, lengthThreshold.value)
    : null;

  addable.value = data.value[0]
    .slice()
    .sort((a, b) => b.currentCases - a.currentCases)
    .slice(lengthThreshold.value)
    .map((d) => d.key);

  return selectedData;
};

const setLocation = (locationString, nullLocationHandler) => {
  if (locationString && locationString !== '') {
    const locations = locationString.split(';').map((d) => d.trim());
    selectedPlaces.value = locations;
    dataSubscription.value = getEpiData(
      apiUrl,
      locations,
      null,
      '-confirmed',
      10,
      0,
    ).subscribe((d) => {
      data.value = d;
      plottedData.value =
        data.value[0].length > lengthThreshold.value
          ? hideExtra()
          : data.value[0];
      isFixedY.value = props.fixedY === 'true';
      isPerCapita.value = props.percapita === 'true';
      const varUsed = isPerCapita.value
        ? props.variable + '_per_100k'
        : props.variable;
      yMax.value = isFixedY.value
        ? max(
            plottedData.value.flatMap((d) => d.value),
            (d) => d[varUsed],
          )
        : null;
    });
    // need to call subscription in order to trigger calling API function and passing subscription to child
  } else {
    clearLocations();
  }
};

const changeVariable = () => {
  const newVariable = variableObj.value.value;

  // update y-max
  const varUsed = isPerCapita.value ? newVariable + '_per_100k' : newVariable;
  yMax.value = isFixedY.value
    ? max(
        plottedData.value.flatMap((d) => d.value),
        (d) => d[varUsed],
      )
    : null;

  router.push({
    name: 'Epidemiology',
    state: {
      disableScroll: true,
    },
    query: {
      location: props.location,
      log: String(isLogY.value),
      variable: newVariable,
      xmin: props.xmin,
      xmax: props.xmax,
      fixedY: String(isFixedY.value),
      percapita: String(isPerCapita.value),
    },
  });
};

const updateSelected = (selected) => {
  selectedPlaces.value = [...new Set(selected)];
};

const setDims = () => {
  const minWidth = 550;
  const hwRatio = 0.75;
  const marginPadding = 80; // size of margin
  const framePadding = 16; // size of margin
  const dimWidth = document.getElementById('bar-group')
    ? document.getElementById('bar-group').offsetWidth
    : minWidth;
  bargraphWidth.value = 650;
  if (window.innerWidth < 360) {
    bargraphTransform.value = 0.4;
  } else if (window.innerWidth < 390) {
    bargraphTransform.value = 0.45;
  } else if (window.innerWidth < 630) {
    bargraphTransform.value = 0.5;
  } else if (window.innerWidth < 790) {
    bargraphTransform.value = 0.8;
  } else {
    bargraphTransform.value = 1;
  }
};

const lookupLocation = () => {
  storeAdmin.$patch({ loading: true }); // store state variable update directly with $patch method
  getLocation(apiUrl).subscribe((nearestPlace) => {
    storeAdmin.$patch({ loading: false });
    if (nearestPlace !== 'none') {
      router.push({
        name: 'Epidemiology',
        query: {
          location: nearestPlace,
        },
      });
    } else {
      nolocation.value = true;
    }
  });
};

watch(
  selectedPlaces,
  (newValue, oldValue) => {
    const newLocation = newValue ? newValue.join(';') : '';
    if (route.query.location !== newLocation) {
      router.push({
        name: 'Epidemiology',
        state: {
          disableScroll: true,
        },
        query: {
          location: newLocation,
          log: String(isLogY.value),
          variable: props.variable,
          fixedY: String(isFixedY.value),
          percapita: String(isPerCapita.value),
        },
      });
    }
  },
  { deep: true }, // object, array variable watching, should add deep: true as options
);

watch(
  () => props.location,
  (newLocation, oldLocation) => {
    setLocation(newLocation);
    if (!newLocation) {
      data.value = null;
    }
  },
);

watch(
  () => props.variable,
  (newVal, oldVal) => {
    variableObj.value = variableOptions.value.filter(
      (d) => d.value === newVal,
    )[0];
  },
  { immediate: true },
);

watch(
  () => props.fixedY,
  (newValue, oldValue) => {
    if (newValue === 'true') {
      const varUsed = isPerCapita.value
        ? props.variable + '_per_100k'
        : props.variable;
      yMax.value = max(
        plottedData.value.flatMap((d) => d.value),
        (d) => d[varUsed],
      );
      isFixedY.value = true;
    } else {
      yMax.value = null;
      isFixedY.value = false;
    }
  },
);

watch(isFixedY, (newValue, oldValue) => {
  changeVariable();
});

watch(
  () => props.percapita,
  (newValue, oldValue) => {
    isPerCapita.value = newValue === 'true';
  },
);

watch(isPerCapita, (newValue, oldValue) => {
  changeVariable();
});

watch(isOverlay, (newValue, oldValue) => {
  if (newValue) {
    isOverlay.value = false;
    const newVariable = props.variable.replace('_numIncrease', '_rolling');
    router.push({
      name: 'Epidemiology',
      state: {
        disableScroll: true,
      },
      query: {
        location: props.location,
        log: String(isLogY.value),
        variable: newVariable,
        fixedY: String(isFixedY.value),
        percapita: String(isPerCapita.value),
      },
    });
  }
});

watch(showAll, (newValue, oldValue) => {
  if (newValue) {
    addable.value = [];
    plottedData.value = data.value ? data.value[0] : null;
  } else {
    plottedData.value = hideExtra();
  }
});

onUnmounted(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
  window.removeEventListener('resize', setDims);
  clearLocations();
});

onMounted(() => {
  console.log(props.location);
  setLocation(props.location);
  // this.$nextTick in optionsAPI
  nextTick(function () {
    window.addEventListener('resize', setDims);
    // set initial dimensions for the stacked area plots.
    setDims();
  });

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});
</script>

<style lang="scss" scoped>
.epi-group {
  align-items: center;
  width: 100%;
}
.select-width {
  max-width: 100%;
}
@media only screen and (max-width: 790px) {
  .content-wrapper {
    justify-content: center;
  }
}
</style>
