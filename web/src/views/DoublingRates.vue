<template>
<div>

  <div class="d-flex align-items-center mx-4">
    <DoublingCurve v-if="epi$" :data="epi$" :toFit="toFit" @executeFit="executeFit" />
    <DoublingTable v-if="epi$" :data="epi$" :isFitting1="fitting1" :isFitting2="fitting2" @changeFit="changeFit" />
  </div>

</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  getDoubling,
  getAllDoublingBatch,
  getAllDoubling
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
      locationID: null,
      variable: "confirmed",
      epi$: null,
      dataSubscription: null,
      toFit: null,
      fitting1: false,
      fitting2: true,
      // set up initial plot indices
      // (this.plottedData.length - this.numFit)
      // this.plottedData.length - this.numFit * 2 && i < this.plottedData.length - this.numFit)
      // this.fitIdx1 = [23,24,25,26];
      // this.fitIdx2 = [23,24,25,26];
    }
  },
  methods: {
    changeFit: function(fitIdx) {
      this.toFit = fitIdx;
    },
    executeFit: function(fitIdx) {
      this[`fitting${fitIdx}`] = !this[`fitting${fitIdx}`];
    },
    updateData: function() {
      this.dataSubscription = getDoubling(this.$apiurl, this.locationID, this.variable).subscribe(results => {
        this.epi$ = results;
      })
    }
  },
  mounted() {
    this.locationID = this.$route.query.location;
    this.variable = this.$route.query.variable;

    this.updateData();
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
  }
});
</script>
