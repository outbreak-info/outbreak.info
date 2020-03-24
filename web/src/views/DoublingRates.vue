<template>
<div>

<div class="d-flex align-items-center mx-4">
  <DoublingCurve v-if="epi$" :data="epi$" :toFit="toFit"/>
  <DoublingTable v-if="epi$" :data="epi$" @changeFit="changeFit"/>
</div>

</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  getDoubling, getAllDoublingBatch, getAllDoubling
} from "@/api/calc-doubling.js";

import DoublingCurve from "@/components/DoublingCurve.vue"
import DoublingTable from "@/components/DoublingTable.vue"


export default Vue.extend({
  name: "DoublingRates",
  components: {
    DoublingCurve,
    DoublingTable
  },
  data() {
    return {
      toFit: null
    }
  },
  subscriptions() {
    return {
      epi$: getDoubling(this.$apiurl, "GBR"),
      // all$: getAllDoubling(this.$apiurl)
    }
  },
  methods: {
changeFit: function(fitIdx){
  console.log(fitIdx)
}
  },
  mounted() {
    console.log('hi');
  }
});
</script>
