<template>
  <div class="home flex-column align-left">
    <div class="d-flex flex-wrap radio-form">
      <!-- VARIANT REPORT RADIO SELECTOR -->
      <div class="d-block px-5 py-2 variants-form">
        <!-- selector -->
        <div class="radio-item-light text-light w-100 pt-2 pb-3">
          <div class="radio-item fa-lg">
            <input
              id="var"
              v-model="selectedReportType"
              type="radio"
              value="var"
              @change="switchRadioBtn"
            />
            <label class="font-weight-bold" for="var">Lineage Report</label>
          </div>
        </div>

        <!-- lineage typeahead -->
        <div v-if="selectedReportType === 'var'" id="search-lineage">
          <form id="search-lineage-input" autocomplete="off" class="w-100">
            <div class="input-group">
              <div class="input-group-prepend">
                <span
                  id="sb"
                  class="input-group-text bg-grey text-muted border-0"
                >
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <TypeaheadSelect
                :isStandalone="false"
                class="form-control border"
                :queryFunction="queryPangolin"
                :apiUrl="$genomicsurl"
                :removeOnSelect="true"
                placeholder="Search PANGO lineage"
                @selected="updatePangolin"
              />
            </div>
          </form>
          <small
            id="sBar-example-variant-lineage"
            class="form-text d-block text-left text-light ml-5"
          >
            <span class="mr-2">Try:</span>

            <span
              class="mr-3"
              v-for="(example, gIdx) in genomicsExamples"
              :key="gIdx"
            >
              <template v-if="example.who_name">
                <router-link
                  :to="{
                    name: 'GenomicsEmbed',
                    query: { alias: example.who_name, type: 'var' },
                  }"
                  class="text-light"
                >
                  {{ example.short_name }}
                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </template>
              <template v-else>
                <router-link
                  :to="{
                    name: 'GenomicsEmbed',
                    query: { pango: example.pangolin_lineage, type: 'var' },
                  }"
                  class="text-light"
                >
                  {{ example.short_name }}
                  <font-awesome-icon :icon="['fas', 'angle-double-right']" />
                </router-link>
              </template>
            </span>
          </small>
        </div>
      </div>

      <!-- LOCATION REPORT RADIO SELECTOR -->
      <div class="d-block px-5 py-2 location-form">
        <!-- selector -->
        <div class="radio-item-light text-light w-100 pt-2">
          <div class="radio-item fa-lg">
            <input
              id="loc"
              v-model="selectedReportType"
              type="radio"
              value="loc"
              @change="switchRadioBtn"
            />
            <label class="font-weight-bold" for="loc">Location Report</label>
          </div>
        </div>

        <!-- location typeahead -->
        <div
          v-if="selectedReportType === 'loc'"
          id="search-variant-location"
          class="m-3 text-light"
        >
          <form
            id="search-variant-location-input"
            autocomplete="off"
            class="w-100"
          >
            <div class="input-group">
              <div class="input-group-prepend">
                <span
                  id="sb"
                  class="input-group-text bg-grey text-muted border-0"
                >
                  <font-awesome-icon :icon="['fas', 'search']" />
                </span>
              </div>
              <TypeaheadSelect
                :isStandalone="false"
                class="form-control border"
                :queryFunction="queryLocation"
                :apiUrl="$genomicsurl"
                labelVariable="label"
                :removeOnSelect="false"
                placeholder="Select location"
                totalLabel="total sequences"
                @selected="submitLocation"
              />
            </div>
          </form>
          <small
            id="sBar-example-variant-location"
            class="form-text d-block text-left ml-5"
          >
            <span class="mr-2">Try:</span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { type: 'loc', loc: 'USA' },
                }"
                class="text-light"
              >
                USA

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { type: 'loc', loc: 'GBR' },
                }"
                class="text-light"
              >
                U.K.

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { type: 'loc', loc: 'USA_US-NY' },
                }"
                class="text-light"
              >
                New York

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { type: 'loc', loc: 'USA_US-CA_06073' },
                }"
                class="text-light"
              >
                San Diego

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
          </small>
        </div>
      </div>

      <!-- LINEAGE COMPARISON REPORT RADIO SELECTOR -->
      <div class="d-block px-5 py-2 comparison-form">
        <!-- selector -->
        <div class="radio-item-light text-light w-100 pt-2">
          <div class="radio-item fa-lg">
            <input
              id="comp"
              v-model="selectedReportType"
              type="radio"
              value="comp"
              @change="switchRadioBtn"
            />
            <label class="font-weight-bold" for="comp">
              Lineage Comparison
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Lineage report component -->
    <SituationReportComponent
      v-if="selectedReportType === 'var' && (pango || alias || muts)"
      :embedded="true"
      :loc="loc"
      :muts="muts"
      :pango="pango"
      :alias="alias"
      :xmin="xmin"
      :xmax="xmax"
      :selected="selected"
      routeTo="GenomicsEmbedVariant"
    />

    <!-- Location report component -->
    <LocationReportComponent
      v-if="selectedReportType === 'loc' && loc"
      :embedded="true"
      :loc="loc"
      :dark="dark"
      :muts="muts"
      :pango="pango"
      :alias="alias"
      :variant="variant"
      :xmin="xmin"
      :xmax="xmax"
      :selected="selected"
      routeTo="GenomicsEmbedLocation"
    />

    <!-- Lineage comparison component -->
    <LineageComparisonComponent
      v-if="selectedReportType === 'comp'"
      :embedded="true"
      routeTo="GenomicsEmbed"
    />

    <footer class="bg-main__darker">
      <div
        class="d-flex p-2 mt-4 w-100 align-items-center justify-content-between"
      >
        <a
          href="https://outbreak.info"
          class="navbar-brand text-light no-underline"
        >
          <img
            src="@/assets/icon-01.svg"
            width="30"
            height="30"
            class="d-inline-block align-top"
            alt="Outbreak.info"
          />
          outbreak.info
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import isEqual from 'lodash/isEqual';

import { findPangolin, findLocation } from '@/api/genomics.js';
import GENOMICSEXAMPLES from '@/assets/examples/genomics_examples.json';
import { lazyLoad } from '@/js/lazy-load';

const TypeaheadSelect = lazyLoad('TypeaheadSelect');
const SituationReportComponent = lazyLoad('SituationReportComponent');
const LocationReportComponent = lazyLoad('LocationReportComponent');
const LineageComparisonComponent = lazyLoad('LineageComparisonComponent');

const props = defineProps({
  type: String,
  loc: [String, Array],
  pango: [String, Array],
  muts: [String, Array],
  alias: [String, Array],
  variant: [String, Array],
  xmin: String,
  xmax: String,
  selected: {
    type: [Array, String],
    default: () => null,
  },
});

// instead of this.$route
const route = useRoute();
// instead of this.$router
const router = useRouter();

const queryPangolin = ref(null);
const queryLocation = ref(null);
const dark = ref(false);
const selectedReportType = ref(null);
const genomicsExamples = ref([]);

watch(
  () => route.query,
  (newVal, oldVal) => {
    if (!isEqual(newVal, oldVal)) {
      selectedReportType.value = newVal.type ? newVal.type : oldVal.type ? oldVal.type : 'var';
    }
  },
  { deep: true },
);

onMounted(() => {
  genomicsExamples.value = GENOMICSEXAMPLES;
  selectedReportType.value = props.type ? props.type : 'var';
  queryPangolin.value = findPangolin;
  queryLocation.value = findLocation;
});

const switchRadioBtn = () => {
  const newSelected = selectedReportType.value === 'loc' ? [] : null;

  router.push({
    name: 'GenomicsEmbed',
    query: {
      type: selectedReportType.value,
      selected: newSelected,
    },
  });
};

const updatePangolin = (selected) => {
  if (selected.alias) {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'var',
        alias: selected.name.toLowerCase(),
      },
    });
  } else {
    router.push({
      name: 'GenomicsEmbed',
      query: {
        type: 'var',
        pango: selected.name,
      },
    });
  }
};

const submitLocation = (selected) => {
  router.push({
    name: 'GenomicsEmbed',
    query: {
      type: 'loc',
      loc: selected.id,
    },
  });
};
</script>

<style lang="scss" scoped>
.radio-form {
  background: $grey-60;
  border-top: 1px solid white;
  border-bottom: 3px solid white;
}

.variants-form {
  background: darken($grey-80, 0%);
  width: 485px;
  // border-top: 1px solid white;
  // border-bottom: 3px solid white;
}

.location-form {
  background: lighten($grey-80, 8%);
  width: 485px;
}

.comp-form {
  background: $grey-60;
}
</style>
