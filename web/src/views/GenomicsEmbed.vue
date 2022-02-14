<template>
<div class="home flex-column align-left">
  <div class="d-flex flex-wrap radio-form">
    <!-- VARIANT REPORT RADIO SELECTOR -->
    <div class="d-block px-5 py-2 variants-form">
      <!-- selector -->
      <div class="radio-item-light text-light w-100 pt-2 pb-3">
        <div class="radio-item fa-lg">
          <input type="radio" id="var" value="var" v-model="selectedReportType">
          <label for="var">Lineage Report</label>
        </div>
      </div>

      <!-- lineage typeahead -->
      <div id="search-lineage" v-if="selectedReportType == 'var'">
        <form autocomplete="off" class="w-100" id="search-lineage-input">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb">
                <font-awesome-icon :icon="['fas', 'search']" />
              </span>
            </div>
            <TypeaheadSelect :isStandalone="false" class="form-control border" :queryFunction="queryPangolin" @selected="updatePangolin" :apiUrl="this.$genomicsurl" :removeOnSelect="true" placeholder="Search PANGO lineage" />
          </div>
        </form>
        <small id="sBar-example-variant-lineage" class="form-text d-block text-left text-light ml-5">
          <span class="mr-2">Try:</span>
          <span class="mr-3">
            <router-link :to="{name: 'GenomicsEmbed', query: {alias: 'omicron', type: 'var'}} " class="text-light">Omicron
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </router-link>
          </span>
          <span class="mr-3">
            <router-link :to="{name: 'GenomicsEmbed', query: {alias: 'delta', type: 'var'}} " class="text-light">Delta
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </router-link>
          </span>
          <span class="mr-3">
            <router-link :to="{name: 'GenomicsEmbed', query: {alias: 'alpha', type: 'var'}} " class="text-light">Alpha / B.1.1.7
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
          <input type="radio" id="loc" value="loc" v-model="selectedReportType">
          <label for="loc">Location Report</label>
        </div>
      </div>

      <!-- location typeahead -->
      <div id="search-variant-location" class="m-3 text-light" v-if="selectedReportType == 'loc'">
        <form autocomplete="off" class="w-100" id="search-variant-location-input">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb">
                <font-awesome-icon :icon="['fas', 'search']" />
              </span>
            </div>
            <TypeaheadSelect :isStandalone="false" class="form-control border" :queryFunction="queryLocation" @selected="submitLocation" :apiUrl="this.$genomicsurl" labelVariable="label" :removeOnSelect="false" placeholder="Select location"
              totalLabel="total sequences" />
          </div>
        </form>
        <small id="sBar-example-variant-location" class="form-text d-block text-left ml-5"> <span class="mr-2">Try:</span>
          <span class="mr-3">
            <router-link :to="{name: 'GenomicsEmbed', query: {loc: 'USA'}} " class="text-light">USA
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </router-link>
          </span>
          <span class="mr-3">
            <router-link :to="{name: 'GenomicsEmbed', query: {loc: 'GBR'}} " class="text-light">U.K.
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </router-link>
          </span>
          <span class="mr-3">
            <router-link :to="{name: 'GenomicsEmbed', query: {loc: 'USA_US-NY'}} " class="text-light">New York
              <font-awesome-icon :icon="['fas', 'angle-double-right']" />
            </router-link>
          </span>
          <span class="mr-3">
            <router-link :to="{name: 'GenomicsEmbed', query: {loc: 'USA_US-CA_06073'}} " class="text-light">San Diego
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
          <input type="radio" id="comp" value="comp" v-model="selectedReportType">
          <label for="comp">Lineage Comparison</label>
        </div>
      </div>

    </div>

  </div>


  <!-- Lineage report component -->
  <SituationReportComponent :embedded="true" :loc="loc" :muts="muts" :pango="pango" :alias="alias" :xmin="xmin" :xmax=xmax :selected="selected" routeTo="GenomicsEmbedVariant" v-if="selectedReportType == 'var' && pango || alias" />

  <!-- Location report component -->
  <LocationReportComponent :embedded="true" :loc="loc" :dark="dark" :muts="muts" :pango="pango" :alias="alias" :variant="variant" :xmin="xmin" :xmax=xmax :selected="selected" routeTo="GenomicsEmbed" v-if="selectedReportType == 'loc' && loc" />

  <!-- Lineage comparison component -->
  <LineageComparisonComponent :embedded="true" routeTo="GenomicsEmbed" v-if="selectedReportType == 'comp'" />

  <Logos />
</div>
</template>

<script>
// @ is an alias to /src
import Logos from "@/components/Logos.vue";

import {
  findPangolin,
  findLocation
} from "@/api/genomics.js";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faAngleDoubleRight,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

library.add(faAngleDoubleRight, faSearch);

export default {
  name: "GenomicsEmbed",
  components: {
    TypeaheadSelect: () => import( /* webpackPrefetch: true */ "@/components/TypeaheadSelect.vue"),
    SituationReportComponent: () => import( /* webpackPrefetch: true */ "@/components/SituationReportComponent.vue"),
    LocationReportComponent: () => import( /* webpackPrefetch: true */ "@/components/LocationReportComponent.vue"),
    LineageComparisonComponent: () => import( /* webpackPrefetch: true */ "@/components/LineageComparisonComponent.vue"),
    FontAwesomeIcon,
    Logos
  },
  props: {
    type: String,
    loc: String,
    pango: [String, Array],
    muts: [String, Array],
    alias: String,
    variant: [String, Array],
    xmin: String,
    xmax: String,
    selected: {
      type: [Array, String],
      default: () => null
    }
  },
  data() {
    return {
      queryPangolin: null,
      queryLocation: null,
      dark: false,
      selectedReportType: null
    };
  },
  watch: {
    selectedReportType(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.$router.push({
          name: "GenomicsEmbed",
          query: {
            type: newVal
          }
        })
      }
    }
  },
  computed: {},
  methods: {
    updatePangolin(selected) {
      if (selected.alias) {
        this.$router.push({
          name: "GenomicsEmbed",
          query: {
            type: "var",
            alias: selected.name.toLowerCase()
          }
        });
      } else {
        this.$router.push({
          name: "GenomicsEmbed",
          query: {
            type: "var",
            pango: selected.name
          }
        });
      }
    },
    submitLocation(selected) {
      this.$router.push({
        name: "GenomicsEmbed",
        query: {
          type: "loc",
          loc: selected.id
        }
      })
    }
  },
  mounted() {
    this.selectedReportType = this.type ? this.type : "var";
    this.queryPangolin = findPangolin;
    this.queryLocation = findLocation;
  }
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
