<template>
<div class="full-page p-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="map-loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>

  <h2 v-if="locationData">Places similar in
    <select v-model="selectedSimilarity" class="select-dropdown" @change="changeSimilarity">
      <option v-for="option in similarOptions" :value="option" :key="option">
        {{ option }}
      </option>
    </select>
    to {{locationData.name}}</h2>
  <table v-if="similar">
    <tr v-for="(place, idx) in similar" :key="idx" class="d-flex align-items-center text-left my-5">
      <td>
        <MiniLocation :lat="place.lat" :lon="place.lon" :id="place.key" :colorScale="colorScale" />
      </td>

      <td class="location-name">
        <div class="d-flex flex-column ml-3 mr-5">
          <h4 class="m-0 border-bottom">{{place.nameFormatted}}</h4>
          <div>
            {{similarity}}: <b>{{formatValue(place.similarValue)}}</b>
          </div>
          <small class="text-muted">
            {{locationData.name}}: <b>{{formatValue(place.similarValue)}}</b>
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
    admin_levels: Array,
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
      similarOptions: ["population", "confirmed", "confirmed_per_100k", "dead", "dead_per_100k"],
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

        this.getSimilar();
      }
    }
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
  },
  methods: {
    getSimilar() {
      this.dataSubscription = findSimilar(this.$apiurl, this.location, this.variable, this.similarity).subscribe(results => {
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
      return (format(",.1f")(val))
    }
  }
})
</script>

<style lang="scss" scoped>
.location-name {
    width: 350px;
}
</style>
