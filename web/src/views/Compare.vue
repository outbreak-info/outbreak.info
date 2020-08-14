<template>
  <MiniLocation :lat="lat" :lon="lon" />
</template>

<script lang="js">
import Vue from "vue";
import MiniLocation from "@/components/MiniLocation.vue";

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
      lat: 0,
      lon: 0
    }
  }
})
</script>
