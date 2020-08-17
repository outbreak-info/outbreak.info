<template>
<div class="full-page p-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="map-loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>

  <h2 v-if="locationData">Places similar in
    <select v-model="selectedSimilarity" class="select-dropdown" @change="changeSimilarity">
      <option v-for="option in similarOptions" :value="option.value" :key="option.value">
        {{ option.label }}
      </option>
    </select>
    to {{locationData.name}}</h2>

  <div id="admin-selector" class="d-flex align-items-center">
    <small class="mr-1">include</small>
    <label class="b-contain m-0 mr-2" v-for="option in adminOptions" :key="option">
      <small>{{option}}</small>
      <input type="checkbox" :value="option" v-model.lazy="selectedAdminLevels" />
      <div class="b-input"></div>
    </label>

  </div>

  <table v-if="similar  && similar.length">
    <tr v-for="(place, idx) in similar" :key="idx" class="d-flex align-items-center text-left my-5">
      <td>
        <MiniLocation :lat="place.lat" :lon="place.lon" :id="place.key" :colorScale="colorScale" />
      </td>

      <td class="location-name">
        <div class="d-flex flex-column ml-3 mr-5">
          <router-link :to="{name: 'Epidemiology', query: {location: place.key}} ">
          <h4 class="m-0 border-bottom">{{place.nameFormatted}}</h4>
          </router-link>
          <div>
            {{similarity}}: <b>{{formatValue(place.similarValue)}}</b>
          </div>
          <small class="text-muted">
            {{locationData.name}}: <b>{{formatValue(locationData.similarValue)}}</b>
          </small>
        </div>
      </td>

      <td>
        <LineComparison :data="place.values" :control="locationData.values" :variable="variable" :xDomain="xDomain" :yMax="yMax" :colorScale="colorScale" label="cases" v-if="place.values" />
      </td>
      <td>
        <LineComparison class="ml-3" :data="place.values" :control="locationData.values" variable="dead_rolling_per_100k" :xDomain="xDomain" :yMax="yMax/10" :colorScale="colorScale" label="deaths" v-if="place.values" />

      </td>
    </tr>
  </table>
  <div class="mt-5" v-else>
    No similar locations found
  </div>

</div>
</template>

<script lang="js">
import Vue from "vue";
import {
  mapState
} from "vuex";
import MiniLocation from "@/components/MiniLocation.vue";
import LineComparison from "@/components/LineComparison.vue";

import {
  findSimilar
} from "@/api/find-similar.js";

import {
  format,
  scaleOrdinal
} from "d3";

export default Vue.extend({
  name: "Compare",
  components: {
    MiniLocation,
    LineComparison
  },
  props: {
    location: String,
    admin_levels: String,
    variable: String,
    similarity: String
  },
  data() {
    return {
      lat: 10,
      lon: 0,
      locationData: null,
      similar: null,
      xDomain: null,
      yMax: null,
      colorScale: null,
      selectedSimilarity: null,
      similarOptions: [{
        value: "population",
        label: "population"
      }, {
        value: "confirmed",
        label: "total cases"
      }, {
        value: "confirmed_per_100k",
        label: "total cases per capita"
      }, {
        value: "confirmed_rolling",
        label: "new cases today"
      }, {
        value: "confirmed_rolling_per_100k",
        label: "new cases today per capita"
      }, {
        value: "dead",
        label: "deaths"
      }, {
        value: "dead_per_100k",
        label: "deaths per capita"
      }, {
        value: "dead_rolling",
        label: "new deaths today"
      }, {
        value: "dead_rolling_per_100k",
        label: "new deaths today per capita"
      }],
      selectedAdminLevels: ["countries", "non-U.S. States/Provinces", "U.S. States", "U.S. Metro Areas", "U.S. Counties"],
      adminOptions: ["countries", "non-U.S. States/Provinces", "U.S. States", "U.S. Metro Areas", "U.S. Counties"],
      dataSubscription: null
    }
  },
  computed: {
    ...mapState("admin", ["loading"]),
    ...mapState("colors", ["colors"])
  },
  watch: {
    $route: {
      immediate: true,
      handler(to, from) {
        this.selectedSimilarity = this.similarity;
        this.selectedAdminLevels = this.admin_levels ? this.admin_levels.split(";") : [];

        this.getSimilar();
      }
    },
    selectedAdminLevels: function() {
      this.$router.push({
        name: "Compare",
        query: {
          location: this.location,
          admin_levels: this.selectedAdminLevels.join(";"),
          variable: this.variable,
          similarity: this.similarity
        }
      })
    }
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
  },
  methods: {
    getSimilar() {
      this.dataSubscription = findSimilar(this.$apiurl, this.location, this.variable, this.similarity, this.selectedAdminLevels).subscribe(results => {
        this.similar = results.similar;
        this.locationData = results.location;
        this.xDomain = results.xDomain;
        this.yMax = results.yMax;
        this.colorScale = scaleOrdinal().range(this.colors).domain(this.similar.map(d => d.key));
        console.log(results)
      });
    },
    changeSimilarity() {
      this.$router.push({
        name: "Compare",
        query: {
          location: this.location,
          admin_levels: this.admin_levels,
          variable: this.variable,
          similarity: this.selectedSimilarity
        }
      })
    },
    formatValue(val) {
      return (this.similarity.includes("_per_100k") || this.similarity.includes("rolling") ? format(",.1f")(val) : format(",.0f")(val))
    }
  }
})
</script>

<style lang="scss">
$check-scale: 0.85;
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
</style>
