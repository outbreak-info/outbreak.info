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
                    @regionSelected="handleTooltip"
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

<script>
import { mapState } from 'pinia';

import { getStackedRegions } from '@/api/region-summary.js';
import { getWorldDailyCases } from '@/api/epi-traces.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';
import { genomicsStore } from '@/stores/genomicsStore';
import { colorsStore } from '@/stores/colorsStore';
import { geoStore } from '@/stores/geoStore';

export default {
  name: 'Regions',
  components: {
    EpiStacked: lazyLoad('EpiStacked'),
    Bargraph: lazyLoad('Bargraph'),
    CountryBarGraph: lazyLoad('CountryBarGraph'),
    DataSource: lazyLoad('DataSource'),
  },
  data() {
    return {
      stackedWidth: 500,
      stackedHeight: 250,
      bargraphTransform: null,
      bargraphWidth: null,
      data: null,
      total: null,
      dataSubscription: null,
      totalSubscription: null,
      nestedData: null,
      selectedVariable: 'confirmed',
      variableObj: {
        label: 'cases',
        ttip: 'new cases',
        value: 'confirmed_numIncrease',
        sources: ['NYT', 'JHU'],
      },
      totalOptions: [
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
      ],
      variableOptions: [
        {
          label: 'Cases',
          value: 'confirmed',
        },
        {
          label: 'Deaths',
          value: 'dead',
        },
      ],
      searchQuery: '',
    };
  },
  computed: {
    ...mapState(adminStore, ['loading']),
    ...mapState(genomicsStore, ['regionDict']),
    ...mapState(colorsStore, ['getRegionColorFromLocation', 'getRegionColor']),
    selectedVariableLabel() {
      return this.variableOptions.filter(
        (d) => d.value === this.selectedVariable,
      )[0]['label'];
    },
  },
  mounted() {
    this.dataSubscription = getStackedRegions(this.$apiurl).subscribe((d) => {
      this.data = d;
      this.nestedData = d[this.selectedVariable];
    });
    this.totalSubscription = getWorldDailyCases(this.$apiurl).subscribe((d) => {
      this.total = d;
    });

    // Event listener for mobile responsiveness
    // $nextTick waits till DOM rendered
    this.$nextTick(() => {
      window.addEventListener('resize', this.setDims);
      // set initial dimensions for the stacked area plots.
      this.setDims();
    });
  },
  unmounted() {
    this.dataSubscription.unsubscribe();
    this.totalSubscription.unsubscribe();
    window.removeEventListener('resize', this.setDims);
  },
  methods: {
    changeVariable() {
      this.nestedData = this.data[this.selectedVariable];
    },
    changeVariableObject() {
      const store = adminStore();
      store.$patch({ loading: true });
      setTimeout(() => {
        store.$patch({ loading: false });
      }, 3000);
    },
    handleTooltip(selected) {
      const store = geoStore();
      store.setRegionTooltip(selected);
    },
    regionColorScale(location) {
      const scale = this.getRegionColorFromLocation;
      return scale(location);
    },
    lightColor(region) {
      const scale = this.getRegionColor;
      return scale(region, 0.85);
    },
    setDims() {
      const selector = this.$refs.regional_stacked_area_plots;

      if (selector) {
        const dims = selector.getBoundingClientRect();
        // const dims = {window.innerWidth, height: window.innerHeight}
        const whRatio = 5 / 3;
        const widthThresh = 700;
        const selectorsProportion = 0.8;

        this.stackedWidth = dims.width;
        const idealHeight = this.stackedWidth / whRatio;
        if (idealHeight < window.innerHeight * selectorsProportion) {
          this.stackedHeight = idealHeight * selectorsProportion;
        } else {
          this.stackedHeight = window.innerHeight * selectorsProportion;
          this.stackedWidth = this.stackedHeight * whRatio;
        }
      }
      this.bargraphWidth = 650;
      if (window.innerWidth < 360) {
        this.bargraphTransform = 0.4;
      } else if (window.innerWidth < 390) {
        this.bargraphTransform = 0.45;
      } else if (window.innerWidth < 630) {
        this.bargraphTransform = 0.5;
      } else if (window.innerWidth < 790) {
        this.bargraphTransform = 0.8;
      } else {
        this.bargraphTransform = 1;
      }
    },
  },
};
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
