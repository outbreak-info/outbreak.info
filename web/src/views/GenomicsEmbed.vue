<template>
<div class="home flex-column align-left">

  <!-- Select report type -->
  <div v-for="(type, tIdx) in reportTypes" :key="tIdx" class="radio-item mr-3">
    <input type="radio" :id="type" :value="type" v-model="selectedReportType">
    <label :for="type">{{type}}</label>
  </div>


  <div class="d-flex variants-form">
    <!-- Location selection -->
    <div id="search-variant-location" class="m-3 text-light">
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


  <!-- Location report component -->
  <LocationReportComponent :embedded="true" :loc="loc" v-if="selectedReportType == 'Location'" />

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
    LocationReportComponent: () => import( /* webpackPrefetch: true */ "@/components/LocationReportComponent.vue"),
    FontAwesomeIcon,
    Logos
  },
  props: {
    loc: String
  },
  data() {
    return {
      queryPangolin: null,
      queryLocation: null,
      selectedReportType: "Location",
      reportTypes: ["Lineage | Mutation", "Location", "Lineage Comparison"]
    };
  },
  watch: {},
  computed: {},
  methods: {
    submitLocation(selected) {
      this.$router.push({
        name: "GenomicsEmbed",
        query: {
          loc: selected.id
        }
      })
    }
  },
  mounted() {
    this.queryPangolin = findPangolin;
    this.queryLocation = findLocation;
  }
};
</script>

<style lang="scss" scoped>
.variants-form {
    background: $secondary-color;
    border-bottom: 3px solid white;
}
</style>
