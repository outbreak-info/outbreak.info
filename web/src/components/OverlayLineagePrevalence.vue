<template>
  <div class="my-5">
    <div class="d-flex">
      <label class="b-contain m-0 mr-3" v-for="option in options" :key="option.label">
        <small>{{option.label}}</small>
        <input type="checkbox" :value="option" v-model.lazy="selectedMutations" @change="selectMutation" />
        <div class="b-input"></div>
      </label>
    </div>
    <ReportPrevalenceOverlay :data="prevalences" :epi="epi" v-if="prevalences && epi"/>

  </div>
</template>

<script>
import Vue from "vue";

import { getAllTemporalPrevalences } from "@/api/genomics.js";
import { getEpiTraces } from "@/api/epi-traces.js";
import ReportPrevalenceOverlay from "@/components/ReportPrevalenceOverlay.vue";

export default {
  name: "LocationReport",
  props: {
    options: Array,
    location: String,
    locationType: String
  },
  components: {
    ReportPrevalenceOverlay
  },
  data() {
    return({
      selectedMutations: [{"query":"pangolin_lineage=B.1.1.7"}],
      prevalences: null,
      epi: null
    })
  },
  mounted() {
    this.updateMutations();
    this.updateEpiData();
  },
  methods: {
    selectMutation() {
      // console.log(this.selectedMutations);
    },
    updateEpiData() {
      this.epiSubscription = getEpiTraces(this.$apiurl, ["GBR"], "location_id,date,confirmed,mostRecent,confirmed_numIncrease,confirmed_rolling,dead_numIncrease,dead_rolling").subscribe(epi => {
        console.log(epi)
        this.epi = epi[0].value;
      })
    },
    updateMutations() {
      this.prevalenceSubscription = getAllTemporalPrevalences(this.$genomicsurl, this.location, this.locationType, this.selectedMutations).subscribe(results => {
        // console.log(results)
        this.prevalences = results.map(d => d.data);
      })
    }
  }
}
</script>
