<template>
  <div class="home flex-column text-left d-flex">
    <div v-if="loading" class="loader">
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
    </div>
    <section v-if="total" id="world_total" class="container my-5">
      <div class="row">
        <!-- EPI CURVE SUMMARIES -->

        <div class="col-sm-12 d-flex flex-column">
          <h3>
            Daily worldwide COVID-19
            <select
              v-model="variableObj"
              class="select-dropdown"
              @change="changeVariableObject"
            >
              <option
                v-for="option in totalOptions"
                :key="option.value"
                :value="option"
              >
                {{ option.label }}
              </option>
            </select>
          </h3>
          <Bargraph
            id="world-cases"
            :data="total.total"
            :title="null"
            :variableObj="variableObj"
            :includeAxis="true"
            :loggable="false"
            :width="bargraphWidth"
            :height="stackedHeight"
            :includeTooltips="true"
            location="World"
            :log="false"
            :percapita="false"
            :transformChart="bargraphTransform"
            tooltipIdx="n-main"
            :animate="true"
            color="#888380"
          />
          <DataSource
            v-if="total"
            class="mx-3"
            :ids="variableObj.sources"
            dataType="epidemiology"
            figureRef="epi-bargraph"
            :numSvgs="1"
            :data="total.total"
          />
        </div>
      </div>
    </section>

    <!-- EPI EXAMPLES -->
    <section id="regional data" class="container my-5">
      <div class="row">
        <!-- EPI CURVE SUMMARIES -->

        <div class="col-sm-12 d-flex">
          <section id="regional-epi-curves" class="w-100">
            <div v-if="nestedData && nestedData.length > 0">
              <div
                v-for="(region, idx) in regionDict"
                :key="idx"
                class="region-tooltip-plots"
              >
                <div
                  :id="idx"
                  class="tooltip-countries"
                  :style="{
                    visibility: region.display ? 'visible' : 'hidden',
                    left: region.x + 'px',
                    top: region.y + 'px',
                  }"
                >
                  <div>
                    {{ region.region }}
                  </div>
                  <div>
                    {{ region.currentCases }} total {{ selectedVariable }}
                  </div>
                  <div
                    class="click-affordance py-1"
                    :style="{ background: lightColor(region.region) }"
                  >
                    click for details
                  </div>
                </div>
                <CountryBarGraph
                  :id="idx"
                  :region="region.region"
                  :variable="selectedVariable"
                  :style="{
                    visibility: region.displayMore ? 'visible' : 'hidden',
                  }"
                  class="tooltip-countries-detailed"
                  @regionSelected="handleTooltip"
                />
              </div>
            </div>

            <div v-if="nestedData && nestedData.length > 0">
              <h3>
                Cumulative Number of COVID-19
                <select
                  v-model="selectedVariable"
                  class="select-dropdown"
                  @change="changeVariable"
                >
                  <option
                    v-for="option in variableOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                by Region
              </h3>
            </div>

            <div
              id="regional-stacked-area-plots d-flex"
              ref="regional_stacked_area_plots"
            >
              <div v-if="nestedData && nestedData.length > 0" class="row px-2">
                <div class="col-sm-12 col-md-12">
                  <EpiStacked
                    id="all-data"
                    :width="stackedWidth"
                    :height="stackedHeight"
                    :data="nestedData"
                    :includeChinaAnnot="true"
                    :title="`${selectedVariableLabel} Worldwide`"
                    @region-selected="handleTooltip"
                  />
                </div>
              </div>
            </div>
            <DataSource
              v-if="nestedData && nestedData.length > 0"
              class="mx-4"
              :data="nestedData"
              dataType="regions"
              :ids="['NYT', 'JHU']"
              figureRef="epi-summary-svg"
            />
          </section>
        </div>
      </div>
    </section>

    <section
      v-if="total"
      id="world-daily-small-multiples"
      class="container my-5"
    >
      <div class="row">
        <!-- EPI CURVE SUMMARIES -->

        <div class="col-sm-12 d-flex flex-column">
          <h3>
            Daily COVID-19
            <select
              v-model="variableObj"
              class="select-dropdown"
              @change="changeVariableObject"
            >
              <option
                v-for="option in totalOptions"
                :key="option.value"
                :value="option"
              >
                {{ option.label }}
              </option>
            </select>
            by World Bank Region
          </h3>
          <div class="d-flex flex-wrap justify-content-between">
            <Bargraph
              v-for="(regionData, idx) in total.regional"
              :id="'region' + idx"
              :key="idx"
              :data="regionData.value"
              :title="regionData.key"
              :variableObj="variableObj"
              :includeAxis="true"
              :loggable="false"
              :width="stackedWidth / 3"
              :height="stackedHeight / 2"
              :tooltipIdx="'n-' + idx"
              :includeTooltips="true"
              location="World"
              :log="false"
              :percapita="false"
              :animate="true"
              :color="regionColorScale(regionData.key)"
            />
          </div>
          <DataSource
            v-if="total"
            class="mx-3"
            :ids="variableObj.sources"
            dataType="epidemiology"
            figureRef="epi-bargraph"
            :numSvgs="total.regional.length"
            :data="total.regional"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';

import { getStackedRegions } from '@/api/region-summary.js';
import { getWorldDailyCases } from '@/api/epi-traces.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { colorsStore } from '@/stores/colorsStore';
import { geoStore } from '@/stores/geoStore';
import { useMetadataStore } from '@/stores/metadataStore';
import { useSeoMeta } from 'unhead'

const EpiStacked = lazyLoad('EpiStacked');
const Bargraph = lazyLoad('Bargraph');
const CountryBarGraph = lazyLoad('CountryBarGraph');
const DataSource = lazyLoad('DataSource');

// global variable - equivalent with this.$apiurl
const apiUrl = inject('apiUrl');

const storeAdmin = adminStore();
const storeGeo = geoStore();
const storeColor = colorsStore();

const { loading } = storeToRefs(storeAdmin);
const { regionDict } = storeToRefs(storeGeo);

const stackedWidth = ref(500);
const stackedHeight = ref(250);
const bargraphTransform = ref(null);
const bargraphWidth = ref(null);
const data = ref(null);
const total = ref(null);
const dataSubscription = ref(null);
const totalSubscription = ref(null);
const nestedData = ref(null);
const selectedVariable = ref('confirmed');
const variableObj = ref({
  label: 'cases',
  ttip: 'new cases',
  value: 'confirmed_numIncrease',
  sources: ['NYT', 'JHU'],
});
const totalOptions = ref([
  {
    label: 'cases',
    ttip: 'new cases',
    value: 'confirmed_numIncrease',
    sources: ['NYT', 'JHU'],
  },
  {
    label: 'deaths',
    ttip: 'new deaths',
    value: 'dead_numIncrease',
    sources: ['NYT', 'JHU'],
  },
]);

const variableOptions = ref([
  {
    label: 'Cases',
    value: 'confirmed',
  },
  {
    label: 'Deaths',
    value: 'dead',
  },
]);

const regional_stacked_area_plots = ref(null);

const selectedVariableLabel = computed(() => {
  return variableOptions.value.filter(
    (d) => d.value === selectedVariable.value,
  )[0]['label'];
});

const changeVariable = () => {
  nestedData.value = data.value[selectedVariable.value];
};

const changeVariableObject = () => {
  storeAdmin.$patch({ loading: true });
  setTimeout(() => {
    storeAdmin.$patch({ loading: false });
  }, 3000);
};

const handleTooltip = (selected) => {
  storeGeo.setRegionTooltip(selected);
};

const regionColorScale = (location) => {
  const scale = storeColor.getRegionColorFromLocation;
  return scale(location);
};

const lightColor = (region) => {
  const scale = storeColor.getRegionColor;
  return scale(region, 0.85);
};

const setDims = () => {
  const selector = regional_stacked_area_plots.value;

  if (selector) {
    const dims = selector.getBoundingClientRect();
    const whRatio = 5 / 3;
    const selectorsProportion = 0.8;

    stackedWidth.value = dims.width;
    const idealHeight = stackedWidth.value / whRatio;
    if (idealHeight < window.innerHeight * selectorsProportion) {
      stackedHeight.value = idealHeight * selectorsProportion;
    } else {
      stackedHeight.value = window.innerHeight * selectorsProportion;
      stackedWidth.value = stackedHeight.value * whRatio;
    }
  }
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

onMounted(() => {
  dataSubscription.value = getStackedRegions(apiUrl).subscribe((d) => {
    data.value = d;
    nestedData.value = d[selectedVariable.value];
  });
  totalSubscription.value = getWorldDailyCases(apiUrl).subscribe((d) => {
    total.value = d;
  });

  // Event listener for mobile responsiveness
  // $nextTick waits till DOM rendered
  // this.$nextTick in optionsAPI
  nextTick(() => {
    window.addEventListener('resize', setDims);
    // set initial dimensions for the stacked area plots.
    setDims();
  });

  const metadataStore = useMetadataStore();
  const metadata = metadataStore.defaultMetadata;
  useSeoMeta(metadata);
});

onUnmounted(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
  if (totalSubscription.value) {
    totalSubscription.value.unsubscribe();
  }
  window.removeEventListener('resize', setDims);
});
</script>

<style lang="scss" scoped>
.tooltip-countries {
  background: white;
  position: fixed;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
  padding: 10px;
  z-index: 1000;
  pointer-events: none;
}

.tooltip-countries-detailed {
  background: white;
  position: fixed;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
  padding: 10px;
  z-index: 1001;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.click-affordance {
  width: 100%;
  text-align: center;
  font-size: 0.85em;
}

.text-spacing-1 {
  letter-spacing: 1px;
  word-spacing: 3px;
}
</style>
