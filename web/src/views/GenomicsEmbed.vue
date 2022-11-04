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
            >
            <label
              class="font-weight-bold"
              for="var"
            >Lineage Report</label>
          </div>
        </div>

        <!-- lineage typeahead -->
        <div
          v-if="selectedReportType === 'var'"
          id="search-lineage"
        >
          <form
            id="search-lineage-input"
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
                :is-standalone="false"
                class="form-control border"
                :query-function="queryPangolin"
                :api-url="this.$genomicsurl"
                :remove-on-select="true"
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
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { alias: 'omicron', type: 'var' }
                }"
                class="text-light"
              >Omicron

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { alias: 'delta', type: 'var' }
                }"
                class="text-light"
              >Delta

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { alias: 'alpha', type: 'var' }
                }"
                class="text-light"
              >Alpha / B.1.1.7

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
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
            >
            <label
              class="font-weight-bold"
              for="loc"
            >Location Report</label>
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
                :is-standalone="false"
                class="form-control border"
                :query-function="queryLocation"
                :api-url="this.$genomicsurl"
                label-variable="label"
                :remove-on-select="false"
                placeholder="Select location"
                total-label="total sequences"
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
                  query: { type: 'loc', loc: 'USA' }
                }"
                class="text-light"
              >USA

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { type: 'loc', loc: 'GBR' }
                }"
                class="text-light"
              >U.K.

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { type: 'loc', loc: 'USA_US-NY' }
                }"
                class="text-light"
              >New York

                <font-awesome-icon :icon="['fas', 'angle-double-right']" />
              </router-link>
            </span>
            <span class="mr-3">
              <router-link
                :to="{
                  name: 'GenomicsEmbed',
                  query: { type: 'loc', loc: 'USA_US-CA_06073' }
                }"
                class="text-light"
              >San Diego

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
            >
            <label
              class="font-weight-bold"
              for="comp"
            >Lineage Comparison</label>
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
      route-to="GenomicsEmbedVariant"
    />

    <!-- Location report component -->
    <LocationReportComponent
      :embedded="true"
      :loc="loc"
      v-if="selectedReportType === 'loc' && loc"
      :dark="dark"
      :muts="muts"
      :pango="pango"
      :alias="alias"
      :variant="variant"
      :xmin="xmin"
      :xmax="xmax"
      :selected="selected"
      route-to="GenomicsEmbedLocation"
    />

    <!-- Lineage comparison component -->
    <LineageComparisonComponent
      v-if="selectedReportType === 'comp'"
      :embedded="true"
      route-to="GenomicsEmbed"
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
          >
          outbreak.info
        </a>
      </div>
    </footer>
  </div>
</template>

<script>
// @ is an alias to /src

import { findPangolin, findLocation } from "@/api/genomics.js";

// --- font awesome --
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faAngleDoubleRight,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import isEqual from "lodash/isEqual";

library.add(faAngleDoubleRight, faSearch);


export default {
  name: 'GenomicsEmbed',
  components: {
    TypeaheadSelect: () =>
      import(/* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    SituationReportComponent: () =>
      import(
        /* webpackPrefetch: true */ "@/components/SituationReportComponent.vue"
      ),
    LocationReportComponent: () =>
      import(
        /* webpackPrefetch: true */ "@/components/LocationReportComponent.vue"
      ),
    LineageComparisonComponent: () =>
      import(
        /* webpackPrefetch: true */ "@/components/LineageComparisonComponent.vue"
      ),
    FontAwesomeIcon

  },
  props: {
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
  },
  data() {
    return {
      queryPangolin: null,
      queryLocation: null,
      dark: false,
      selectedReportType: null,
    };
  },
  computed: {},
  watch: {
    "$route.query": function(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.selectedReportType = this.type ? this.type : 'var';
      }
    }
  },
  mounted() {
    this.selectedReportType = this.type ? this.type : 'var';
    this.queryPangolin = findPangolin;
    this.queryLocation = findLocation;
  },
  methods: {
    switchRadioBtn() {
      const newSelected = this.selectedReportType === "loc" ? [] : null;


      this.$router.push({
        name: 'GenomicsEmbed',
        query: {
          type: this.selectedReportType,
          selected: newSelected
        }

      });
    },
    updatePangolin(selected) {
      if (selected.alias) {
        this.$router.push({
          name: 'GenomicsEmbed',
          query: {
            type: 'var',
            alias: selected.name.toLowerCase(),
          },
        });
      } else {
        this.$router.push({
          name: 'GenomicsEmbed',
          query: {
            type: 'var',
            pango: selected.name,
          },
        });
      }
    },
    submitLocation(selected) {
      this.$router.push({
        name: 'GenomicsEmbed',
        query: {
          type: "loc",
          loc: selected.id
        }
      });
    }

  },
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
