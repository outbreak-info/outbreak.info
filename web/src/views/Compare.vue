<template>
<div class="full-page p-5 bg-light">
  <!-- loading -->
  <div v-if="loading" class="map-loader">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
  </div>

  <h1 v-if="locationData">Places similar in {{similarity}} to {{locationData.name}}</h1>
  <template v-if="similar">
    <div v-for="(place, idx) in similar" :key="idx" class="d-flex align-items-center text-left my-4">
      <MiniLocation :lat="place.lat" :lon="place.lon" />
      <div class="d-flex flex-column">
        <h3 class="m-0">{{place.name}}</h3>
        <div>
          {{similarity}}: <b>{{place.similarValue.toLocaleString()}}</b>
        </div>
        <small class="text-muted">
          {{locationData.name}}: <b>{{locationData.similarValue.toLocaleString()}}</b>
        </small>
      </div>
    </div>
  </template>

</div>
</template>

<script lang="js">
import Vue from "vue";
import {
  mapState
} from "vuex";
import MiniLocation from "@/components/MiniLocation.vue";

import {
  findSimilar
} from "@/api/find-similar.js";

export default Vue.extend({
  name: "Compare",
  components: {
    MiniLocation
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
      similar: null
    }
  },
  computed: {
    ...mapState("admin", ["loading"])
  },
  mounted() {
    findSimilar(this.$apiurl, this.location, this.variable, this.similarity).subscribe(results => {
      this.similar = results.similar;
      this.locationData = results.location;
      console.log(this.similar)
    });
  }
})
</script>
