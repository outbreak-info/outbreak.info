<template>
<div>
  <!-- <SlopeComparison :slope1="0.141" :slope2="0.079"/> -->
  <SlopeComparison :slope1="0.171" :slope2="0.257"/>
  <!-- <DoublingCurve v-if="epi$" :data="epi$.data" /> -->
</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  getDoubling
} from "@/api/calc-doubling.js";

// import DoublingCurve from "@/components/DoublingCurve.vue"
import SlopeComparison from "@/components/SlopeComparison.vue"

export default Vue.extend({
  name: "DoublingRates",
  components: {
    // DoublingCurve,
    SlopeComparison
  },
  data() {
    return {}
  },
  subscriptions() {
    return {
      epi$: getDoubling("this.$apiurl", "Spain")
    }
  },
  mounted() {
    console.log('hi');
  }
});
</script>
